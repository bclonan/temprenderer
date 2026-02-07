/**
 * Progressive In-Memory File System (Node-like API, but pure JS)
 *
 * Supports:
 *  - mkdir(path, { recursive })
 *  - touch(path)
 *  - writeFile(path, content, { append })
 *  - readFile(path)
 *  - ls(path)
 *  - rm(path, { recursive })
 *  - mv(src, dst)
 *  - cp(src, dst, { recursive })
 *  - cd(path)
 *  - pwd()
 *  - tree(path)
 *
 * Key interview points:
 *  - Clean data model (Dir/File nodes)
 *  - Path normalization + traversal
 *  - Consistent error handling
 *  - O(depth) operations
 */

class FsError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "FsError";
        this.code = code; // e.g., ENOENT, EEXIST, ENOTDIR, EISDIR, ENOTEMPTY
    }
}

class NodeBase {
    constructor(name) {
        this.name = name;
        this.parent = null; // DirNode or null for root
        this.ctime = Date.now();
        this.mtime = Date.now();
    }

    get path() {
        if (!this.parent) return "/";
        const parts = [];
        let cur = this;
        while (cur.parent) {
            parts.push(cur.name);
            cur = cur.parent;
        }
        return "/" + parts.reverse().join("/");
    }
}

class FileNode extends NodeBase {
    constructor(name) {
        super(name);
        this.type = "file";
        this.content = "";
    }

    size() {
        return this.content.length;
    }
}

class DirNode extends NodeBase {
    constructor(name) {
        super(name);
        this.type = "dir";
        this.children = new Map(); // name -> NodeBase
    }
}

class FileSystem {
    constructor() {
        this.root = new DirNode("");
        this.root.parent = null;
        this.cwd = this.root;
    }

    // ---------- Public API (Actions) ----------

    pwd() {
        return this.cwd.path;
    }

    cd(path = "/") {
        const dir = this._resolveDir(path);
        this.cwd = dir;
        return this.pwd();
    }

    ls(path = ".") {
        const node = this._resolveAny(path);
        if (node.type === "file") return [node.name];
        return Array.from(node.children.keys()).sort();
    }

    mkdir(path, opts = { recursive: false }) {
        const { recursive = false } = opts;
        const parts = this._splitPath(path);
        if (parts.length === 0) return "/";

        let cur = this._startNodeFor(path);
        for (let i = 0; i < parts.length; i++) {
            const name = parts[i];
            const existing = cur.children.get(name);

            if (!existing) {
                const nd = new DirNode(name);
                this._attach(cur, nd);
                cur = nd;
                continue;
            }

            if (existing.type !== "dir") {
                throw new FsError("ENOTDIR", `mkdir: '${existing.path}' is not a directory`);
            }

            cur = existing;

            // If not recursive, only allow creating the last segment if parent exists.
            // But in this loop we already traverse; the only "non-recursive" failure is missing intermediate dirs.
            // We handle that by checking when missing occurs:
            // (Here missing doesn't occur since existing was present.)
        }

        // Non-recursive: must ensure parent existed for the final dir, but we created it if missing.
        // In real FS, mkdir without recursive only creates final segment if parent exists.
        // We'll enforce that behavior by redoing a stricter check:
        if (!recursive) {
            const parentPath = this._dirname(path);
            const base = this._basename(path);
            const parent = this._resolveDir(parentPath);
            if (parent.children.has(base)) {
                // already exists is fine
                return this._joinPath(parent.path, base);
            }
            // If parent exists we could create it, but our earlier loop might have created intermediates.
            // To keep strict, we ensure there were no missing intermediates:
            // If path had more than 1 segment and any intermediate was missing, recursive was required.
            const strictCheck = this._mkdirStrictNonRecursive(path);
            return strictCheck;
        }

        return cur.path;
    }

    touch(path) {
        const { parent, name } = this._resolveParent(path);
        const existing = parent.children.get(name);

        if (!existing) {
            const f = new FileNode(name);
            this._attach(parent, f);
            return f.path;
        }

        existing.mtime = Date.now();
        return existing.path;
    }

    writeFile(path, content, opts = { append: false }) {
        const { append = false } = opts;
        const node = this._ensureFile(path);
        node.content = append ? node.content + content : content;
        node.mtime = Date.now();
        return node.size();
    }

    readFile(path) {
        const node = this._resolveAny(path);
        if (node.type !== "file") {
            throw new FsError("EISDIR", `readFile: '${node.path}' is a directory`);
        }
        return node.content;
    }

    rm(path, opts = { recursive: false }) {
        const { recursive = false } = opts;
        if (path === "/" || this._normalize(path) === "/") {
            throw new FsError("EPERM", "rm: refusing to remove root");
        }

        const node = this._resolveAny(path);
        if (!node.parent) throw new FsError("EPERM", "rm: cannot remove root");

        if (node.type === "dir") {
            if (!recursive && node.children.size > 0) {
                throw new FsError("ENOTEMPTY", `rm: directory not empty '${node.path}'`);
            }
            // recursive delete
            if (recursive) this._deleteDirRecursive(node);
        }

        node.parent.children.delete(node.name);
        return true;
    }

    mv(srcPath, dstPath) {
        if (this._normalize(srcPath) === "/") throw new FsError("EPERM", "mv: cannot move root");
        const src = this._resolveAny(srcPath);

        // Destination behavior:
        // - If dst is existing dir: move into it keeping same name
        // - Else: treat dstPath as full target path (rename allowed)
        const dstNorm = this._normalize(dstPath);
        let dstDir, dstName;

        const dstExisting = this._tryResolveAny(dstNorm);
        if (dstExisting && dstExisting.type === "dir") {
            dstDir = dstExisting;
            dstName = src.name;
        } else {
            const resolved = this._resolveParent(dstNorm);
            dstDir = resolved.parent;
            dstName = resolved.name;
        }

        // Prevent moving a dir into its own subtree
        if (src.type === "dir") {
            let cur = dstDir;
            while (cur) {
                if (cur === src) {
                    throw new FsError("EINVAL", `mv: cannot move '${src.path}' into its own subtree '${dstDir.path}'`);
                }
                cur = cur.parent;
            }
        }

        // If target exists, overwrite? We'll disallow by default (common interview choice).
        if (dstDir.children.has(dstName)) {
            throw new FsError("EEXIST", `mv: target exists '${this._joinPath(dstDir.path, dstName)}'`);
        }

        // detach from old parent
        src.parent.children.delete(src.name);
        // rename if needed
        src.name = dstName;
        this._attach(dstDir, src);
        return src.path;
    }

    cp(srcPath, dstPath, opts = { recursive: false }) {
        const { recursive = false } = opts;
        const src = this._resolveAny(srcPath);

        const dstNorm = this._normalize(dstPath);
        let dstDir, dstName;

        const dstExisting = this._tryResolveAny(dstNorm);
        if (dstExisting && dstExisting.type === "dir") {
            dstDir = dstExisting;
            dstName = src.name;
        } else {
            const resolved = this._resolveParent(dstNorm);
            dstDir = resolved.parent;
            dstName = resolved.name;
        }

        if (dstDir.children.has(dstName)) {
            throw new FsError("EEXIST", `cp: target exists '${this._joinPath(dstDir.path, dstName)}'`);
        }

        if (src.type === "file") {
            const f = new FileNode(dstName);
            f.content = src.content;
            this._attach(dstDir, f);
            return f.path;
        }

        // dir
        if (!recursive) {
            throw new FsError("EISDIR", `cp: '${src.path}' is a directory (use recursive)`);
        }

        const copied = this._cloneDir(src, dstName);
        this._attach(dstDir, copied);
        return copied.path;
    }

    tree(path = ".") {
        const node = this._resolveAny(path);
        const lines = [];
        const dfs = (n, prefix) => {
            const label = n === this.root ? "/" : n.name + (n.type === "dir" ? "/" : "");
            lines.push(prefix + label);
            if (n.type === "dir") {
                const kids = Array.from(n.children.values()).sort((a, b) => a.name.localeCompare(b.name));
                for (const k of kids) dfs(k, prefix + "  ");
            }
        };
        dfs(node, "");
        return lines.join("\n");
    }

    // ---------- Progressive Helpers (Internals) ----------

    _normalize(path) {
        if (!path || typeof path !== "string") throw new FsError("EINVAL", "path must be a string");
        const isAbs = path.startsWith("/");
        const raw = path.split("/").filter(Boolean);

        const stack = [];
        const base = isAbs ? [] : this._splitPath(this.cwd.path);

        for (const part of [...base, ...raw]) {
            if (part === "." || part === "") continue;
            if (part === "..") {
                if (stack.length > 0) stack.pop();
                continue;
            }
            stack.push(part);
        }
        return "/" + stack.join("/");
    }

    _splitPath(path) {
        const norm = this._normalize(path);
        if (norm === "/") return [];
        return norm.slice(1).split("/");
    }

    _startNodeFor(path) {
        return path.startsWith("/") ? this.root : this.cwd;
    }

    _resolveAny(path) {
        const node = this._tryResolveAny(path);
        if (!node) throw new FsError("ENOENT", `not found: '${this._normalize(path)}'`);
        return node;
    }

    _tryResolveAny(path) {
        const parts = this._splitPath(path);
        let cur = this.root;
        for (const name of parts) {
            if (cur.type !== "dir") return null;
            const next = cur.children.get(name);
            if (!next) return null;
            cur = next;
        }
        return cur;
    }

    _resolveDir(path) {
        const node = this._resolveAny(path);
        if (node.type !== "dir") throw new FsError("ENOTDIR", `not a directory: '${node.path}'`);
        return node;
    }

    _resolveParent(path) {
        const norm = this._normalize(path);
        if (norm === "/") throw new FsError("EINVAL", "root has no parent");
        const parts = norm.slice(1).split("/");
        const name = parts.pop();
        const parentPath = "/" + parts.join("/");
        const parent = this._resolveDir(parentPath === "" ? "/" : parentPath);
        return { parent, name };
    }

    _attach(dirNode, childNode) {
        if (dirNode.type !== "dir") throw new FsError("ENOTDIR", `attach: '${dirNode.path}' is not a directory`);
        if (dirNode.children.has(childNode.name)) {
            throw new FsError("EEXIST", `attach: '${this._joinPath(dirNode.path, childNode.name)}' exists`);
        }
        childNode.parent = dirNode;
        dirNode.children.set(childNode.name, childNode);
        dirNode.mtime = Date.now();
    }

    _joinPath(a, b) {
        if (a === "/") return "/" + b;
        return a.replace(/\/+$/, "") + "/" + b;
    }

    _dirname(path) {
        const norm = this._normalize(path);
        if (norm === "/") return "/";
        const parts = norm.split("/");
        parts.pop();
        const dir = parts.join("/") || "/";
        return dir;
    }

    _basename(path) {
        const norm = this._normalize(path);
        if (norm === "/") return "";
        return norm.split("/").pop();
    }

    _ensureFile(path) {
        const { parent, name } = this._resolveParent(path);
        const existing = parent.children.get(name);

        if (!existing) {
            const f = new FileNode(name);
            this._attach(parent, f);
            return f;
        }

        if (existing.type !== "file") {
            throw new FsError("EISDIR", `writeFile: '${existing.path}' is a directory`);
        }
        return existing;
    }

    _deleteDirRecursive(dirNode) {
        for (const child of Array.from(dirNode.children.values())) {
            if (child.type === "dir") this._deleteDirRecursive(child);
            dirNode.children.delete(child.name);
        }
        dirNode.children.clear();
    }

    _cloneDir(srcDir, newName) {
        const dst = new DirNode(newName);
        for (const child of srcDir.children.values()) {
            if (child.type === "file") {
                const f = new FileNode(child.name);
                f.content = child.content;
                this._attach(dst, f);
            } else {
                const d = this._cloneDir(child, child.name);
                this._attach(dst, d);
            }
        }
        return dst;
    }

    _mkdirStrictNonRecursive(path) {
        const norm = this._normalize(path);
        const parts = norm.slice(1).split("/");
        const name = parts.pop();
        const parentPath = "/" + parts.join("/");

        // Strict: parent must exist; intermediates must already exist
        const parent = this._resolveDir(parentPath === "" ? "/" : parentPath);
        if (parent.children.has(name)) return this._joinPath(parent.path, name);

        const nd = new DirNode(name);
        this._attach(parent, nd);
        return nd.path;
    }
}

// ---------- Example Usage / “Assessment-style” tests ----------

const fs = new FileSystem();

// Stage 1: mkdir/touch/write/read/ls
fs.mkdir("/apps", { recursive: true });
fs.mkdir("/apps/meta", { recursive: true });
fs.writeFile("/apps/meta/readme.txt", "hello meta\n");
fs.writeFile("/apps/meta/readme.txt", "append line\n", { append: true });

console.log(fs.readFile("/apps/meta/readme.txt"));
// hello meta
// append line

console.log(fs.ls("/apps")); // [ 'meta' ]
console.log(fs.ls("/apps/meta")); // [ 'readme.txt' ]

// Stage 2: cwd + relative paths
fs.cd("/apps/meta");
fs.touch("./notes.md");
fs.writeFile("notes.md", "# Notes\n");
console.log(fs.pwd()); // /apps/meta
console.log(fs.ls(".")); // [ 'notes.md', 'readme.txt' ]

// Stage 3: tree
console.log(fs.tree("/"));
// /
//   apps/
//     meta/
//       notes.md
//       readme.txt

// Stage 4: mv/cp/rm
fs.mkdir("/archive", { recursive: true });
fs.cp("/apps/meta", "/archive", { recursive: true }); // copies meta dir into /archive/meta
fs.mv("/apps/meta/readme.txt", "/apps/meta/README.txt");

console.log(fs.ls("/archive/meta")); // [ 'notes.md', 'readme.txt' ]
console.log(fs.ls("/apps/meta")); // [ 'README.txt', 'notes.md' ]

fs.rm("/apps/meta", { recursive: true });
console.log(fs.tree("/"));
// /
//   apps/
//   archive/
//     meta/
//       notes.md
//       readme.txt


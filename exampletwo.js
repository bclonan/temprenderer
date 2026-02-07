// Progressive In-Memory File System (SIMPLE, one clean class)
// Step-by-step extendable: start with mkdir/touch/write/read/ls, then add rm/mv/cp/search.
// No fancy inheritance—just "nodes" as plain objects.

class MiniFS {
  constructor() {
    this.root = this._dir("");        // root has empty name
    this.cwd = this.root;             // current working directory node
  }

  // =========================
  // STEP 0 — CORE PUBLIC API
  // =========================

  pwd() {
    return this._pathOf(this.cwd);
  }

  cd(path = "/") {
    const node = this._getNode(path);
    if (!node || node.type !== "dir") throw new Error(`cd: not a directory: ${path}`);
    this.cwd = node;
    return this.pwd();
  }

  ls(path = ".") {
    const node = this._getNode(path);
    if (!node) throw new Error(`ls: not found: ${path}`);
    if (node.type === "file") return [node.name];
    return Object.keys(node.children).sort();
  }

  mkdir(path) {
    // Creates exactly ONE directory level (non-recursive) like classic mkdir.
    const { parent, name } = this._getParent(path);
    if (!parent) throw new Error(`mkdir: parent not found: ${path}`);
    if (parent.children[name]) {
      if (parent.children[name].type !== "dir") throw new Error(`mkdir: file exists: ${path}`);
      return this._pathOf(parent.children[name]); // already there
    }
    parent.children[name] = this._dir(name);
    parent.children[name].parent = parent;
    return this._pathOf(parent.children[name]);
  }

  mkdirp(path) {
    // STEP 1 EXTENSION: recursive mkdir
    const parts = this._parts(path);
    let cur = path.startsWith("/") ? this.root : this.cwd;
    for (const name of parts) {
      const next = cur.children[name];
      if (!next) {
        cur.children[name] = this._dir(name);
        cur.children[name].parent = cur;
      } else if (next.type !== "dir") {
        throw new Error(`mkdirp: not a dir: ${this._pathOf(next)}`);
      }
      cur = cur.children[name];
    }
    return this._pathOf(cur);
  }

  touch(path) {
    const { parent, name } = this._getParent(path);
    if (!parent) throw new Error(`touch: parent not found: ${path}`);
    const existing = parent.children[name];

    if (!existing) {
      parent.children[name] = this._file(name, "");
      parent.children[name].parent = parent;
      return this._pathOf(parent.children[name]);
    }
    if (existing.type !== "file") throw new Error(`touch: is a directory: ${path}`);
    return this._pathOf(existing);
  }

  write(path, content, { append = false } = {}) {
    const { parent, name } = this._getParent(path);
    if (!parent) throw new Error(`write: parent not found: ${path}`);
    let node = parent.children[name];

    if (!node) {
      node = this._file(name, "");
      node.parent = parent;
      parent.children[name] = node;
    }
    if (node.type !== "file") throw new Error(`write: is a directory: ${path}`);

    node.content = append ? node.content + content : content;
    return node.content.length;
  }

  read(path) {
    const node = this._getNode(path);
    if (!node) throw new Error(`read: not found: ${path}`);
    if (node.type !== "file") throw new Error(`read: is a directory: ${path}`);
    return node.content;
  }

  // =========================
  // STEP 2 — OPTIONAL FEATURES
  // (leave these commented out until you need them)
  // =========================

  rm(path, { recursive = false } = {}) {
    if (this._norm(path) === "/") throw new Error("rm: refusing to remove root");
    const { parent, name } = this._getParent(path);
    if (!parent || !parent.children[name]) throw new Error(`rm: not found: ${path}`);

    const node = parent.children[name];
    if (node.type === "dir") {
      const keys = Object.keys(node.children);
      if (!recursive && keys.length > 0) throw new Error(`rm: dir not empty: ${path}`);
      // recursive delete
      this._deleteDir(node);
    }
    delete parent.children[name];
    return true;
  }

  mv(src, dst) {
    // Simple rules:
    // - dst existing dir => move into it (keep same name)
    // - else => dst is a full new path (rename allowed)
    const srcNode = this._getNode(src);
    if (!srcNode || !srcNode.parent) throw new Error(`mv: not found: ${src}`);

    const dstNode = this._getNode(dst);
    let dstParent, dstName;

    if (dstNode && dstNode.type === "dir") {
      dstParent = dstNode;
      dstName = srcNode.name;
    } else {
      const p = this._getParent(dst);
      dstParent = p.parent;
      dstName = p.name;
      if (!dstParent) throw new Error(`mv: dest parent not found: ${dst}`);
    }

    if (dstParent.children[dstName]) throw new Error(`mv: target exists: ${dst}`);

    // detach
    delete srcNode.parent.children[srcNode.name];

    // attach + rename
    srcNode.name = dstName;
    srcNode.parent = dstParent;
    dstParent.children[dstName] = srcNode;

    return this._pathOf(srcNode);
  }

  cp(src, dst, { recursive = false } = {}) {
    const srcNode = this._getNode(src);
    if (!srcNode) throw new Error(`cp: not found: ${src}`);

    const dstNode = this._getNode(dst);
    let dstParent, dstName;

    if (dstNode && dstNode.type === "dir") {
      dstParent = dstNode;
      dstName = srcNode.name;
    } else {
      const p = this._getParent(dst);
      dstParent = p.parent;
      dstName = p.name;
      if (!dstParent) throw new Error(`cp: dest parent not found: ${dst}`);
    }

    if (dstParent.children[dstName]) throw new Error(`cp: target exists: ${dst}`);

    const clone = this._clone(srcNode, recursive);
    clone.name = dstName;
    clone.parent = dstParent;
    dstParent.children[dstName] = clone;

    return this._pathOf(clone);
  }

  // STEP 3 — SEARCH
  // Finds file/dir nodes whose name includes query (case-insensitive)
  // Returns full paths
  search(query, { start = ".", type = "any" } = {}) {
    const q = String(query).toLowerCase();
    const startNode = this._getNode(start);
    if (!startNode) throw new Error(`search: start not found: ${start}`);

    const results = [];
    const walk = (node) => {
      const matchName = node.name.toLowerCase().includes(q);
      const typeOk = type === "any" || node.type === type;
      if (matchName && typeOk) results.push(this._pathOf(node));

      if (node.type === "dir") {
        for (const childName of Object.keys(node.children)) {
          walk(node.children[childName]);
        }
      }
    };

    walk(startNode);
    return results.sort();
  }

  // =========================
  // INTERNALS (keep small)
  // =========================

  _dir(name) {
    return { type: "dir", name, children: Object.create(null), parent: null };
  }

  _file(name, content) {
    return { type: "file", name, content, parent: null };
  }

  _parts(path) {
    // turn "/a/b/../c" or "./a" into ["a","c"] relative to cwd if needed
    const norm = this._norm(path);
    if (norm === "/") return [];
    return norm.slice(1).split("/");
  }

  _norm(path) {
    if (typeof path !== "string") throw new Error("path must be a string");
    const isAbs = path.startsWith("/");
    const raw = path.split("/").filter(Boolean);

    const base = isAbs ? [] : this._pathOf(this.cwd).split("/").filter(Boolean);
    const stack = [];

    for (const part of [...base, ...raw]) {
      if (part === "." || part === "") continue;
      if (part === "..") {
        if (stack.length) stack.pop();
        continue;
      }
      stack.push(part);
    }
    return "/" + stack.join("/");
  }

  _getNode(path) {
    const norm = this._norm(path);
    if (norm === "/") return this.root;

    const parts = norm.slice(1).split("/");
    let cur = this.root;

    for (const name of parts) {
      if (cur.type !== "dir") return null;
      cur = cur.children[name];
      if (!cur) return null;
    }
    return cur;
  }

  _getParent(path) {
    const norm = this._norm(path);
    if (norm === "/") return { parent: null, name: "" };

    const parts = norm.slice(1).split("/");
    const name = parts.pop();
    const parentPath = "/" + parts.join("/");
    const parent = this._getNode(parentPath || "/");
    if (!parent || parent.type !== "dir") return { parent: null, name };
    return { parent, name };
  }

  _pathOf(node) {
    if (!node.parent) return "/"; // root
    const parts = [];
    let cur = node;
    while (cur.parent) {
      parts.push(cur.name);
      cur = cur.parent;
    }
    return "/" + parts.reverse().join("/");
  }

  _deleteDir(dirNode) {
    if (dirNode.type !== "dir") return;
    for (const name of Object.keys(dirNode.children)) {
      const child = dirNode.children[name];
      if (child.type === "dir") this._deleteDir(child);
      delete dirNode.children[name];
    }
  }

  _clone(node, recursive) {
    if (node.type === "file") return this._file(node.name, node.content);
    if (!recursive) throw new Error(`cp: is a directory (use recursive): ${this._pathOf(node)}`);

    const d = this._dir(node.name);
    for (const name of Object.keys(node.children)) {
      const childClone = this._clone(node.children[name], true);
      childClone.parent = d;
      d.children[name] = childClone;
    }
    return d;
  }
}

// =========================
// QUICK DEMO (copy into tests)
// =========================
const fs = new MiniFS();

fs.mkdirp("/apps/meta");
fs.write("/apps/meta/readme.txt", "hello\n");
fs.cd("/apps/meta");
fs.touch("notes.md");
fs.write("notes.md", "# Notes", { append: false });

console.log(fs.pwd());                 // /apps/meta
console.log(fs.ls("."));               // [ 'notes.md', 'readme.txt' ]
console.log(fs.read("readme.txt"));    // hello

// search step:
console.log(fs.search("read"));        // [ '/apps/meta/readme.txt' ]

// extend step: rm/mv/cp (already included)
fs.mv("/apps/meta/readme.txt", "/apps/meta/README.txt");
console.log(fs.ls("."));               // [ 'README.txt', 'notes.md' ]

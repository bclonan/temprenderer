/**
 * META SWE "PROGRESSIVE BUILD" CHEAT SHEET (Single JS File)
 * --------------------------------------------------------
 * Goal: give you a reusable, clean “toolbelt” of patterns you can copy/paste during
 * progressive build / class-design / data-structure style coding tests.
 *
 * What’s inside:
 *  - Quick JS syntax + patterns (functions, classes, modules, errors)
 *  - A clean “Service” class organization (state/actions/helpers)
 *  - I/O examples (strings, arrays, objects, maps, sets)
 *  - Common algorithms & DS helpers (two pointers, sliding window, BFS/DFS, heap, etc.)
 *  - “Problem → terms → approach → example” mini-templates
 *
 * How to use during an exam:
 *  1) Copy the skeleton (section: Class Template) to start.
 *  2) Paste the smallest helper(s) you need (e.g., parse, validate, BFS).
 *  3) Implement the requested function with tests at bottom.
 *
 * NOTE: This is not meant to be executed as-is end-to-end—it's a “grab bag” file.
 */

/* =====================================================================================
 * 0) QUICK REFERENCE: JS BASICS + GOTCHAS
 * ===================================================================================== */

/**
 * - Prefer: const for references, let for reassignable
 * - Avoid: var
 * - Strings are immutable
 * - Arrays are objects (mutable)
 * - Number is IEEE float (careful with precision)
 * - Use Map/Set for key-based + uniqueness
 * - JSON stringify/parse for deep clone-ish of plain data (no functions/dates)
 */

// Equality
// === strict, == loose (avoid)
const _eqStrict = (a, b) => a === b;

// Truthy/falsy
// falsy: false, 0, -0, 0n, "", null, undefined, NaN

// Common conversions
const toInt = (s) => Number.parseInt(s, 10);
const toFloat = (s) => Number.parseFloat(s);
const toStr = (x) => String(x);

/* =====================================================================================
 * 1) FUNCTION DECLARATIONS + COMMON STYLES
 * ===================================================================================== */

/**
 * TERMS:
 * - Function declaration: hoisted
 * - Function expression: assigned to variable
 * - Arrow function: lexical this (no own this/arguments)
 */

// Function declaration (hoisted)
function add(a, b) {
    return a + b;
}

// Function expression
const sub = function (a, b) {
    return a - b;
};

// Arrow function (concise)
const mul = (a, b) => a * b;

// Default params
const greet = (name = "world") => `Hello, ${name}!`;

// Rest params (variadic)
const sumAll = (...nums) => nums.reduce((acc, n) => acc + n, 0);

// Destructured params (great for options objects)
function makeUser({ id, name, role = "user" }) {
    return { id, name, role };
}

// Higher-order function example
const map = (arr, fn) => {
    const out = [];
    for (let i = 0; i < arr.length; i++) out.push(fn(arr[i], i));
    return out;
};

// Safe comparator for sort (numbers)
const sortAscNums = (arr) => arr.slice().sort((a, b) => a - b);

/* =====================================================================================
 * 2) CLASS DECLARATIONS: CLEAN “STATE / ACTIONS / HELPERS” ORGANIZATION
 * ===================================================================================== */

/**
 * EXAM PATTERN:
 * - Provide a class with:
 *   - constructor(options)
 *   - public methods (actions) the interviewer asks for
 *   - private-ish helpers (_prefix) and pure functions
 *   - internal state (maps/caches)
 *   - validation and consistent errors
 *
 * JS doesn't enforce private unless you use #privateField (supported in modern JS).
 * In coding tests, underscore helpers are common and clear.
 */

class ProgressiveService {
    /**
     * @param {object} [opts]
     * @param {boolean} [opts.debug]
     */
    constructor(opts = {}) {
        // ----- STATE -----
        this.state = {
            debug: !!opts.debug,
            // example internal memory/cache
            cache: new Map(), // key -> value
            stats: { calls: 0 },
        };

        // ----- BINDING (if passing methods as callbacks) -----
        // this.someMethod = this.someMethod.bind(this);
    }

    /* -------------------------
     * PUBLIC API (Actions)
     * ------------------------- */

    /**
     * Example: memoized compute
     * Problem: Given n, compute fib(n) with caching.
     *
     * Input: n (number)
     * Output: fib(n) (number)
     */
    fib(n) {
        this._bumpCalls("fib");
        this._assertInt(n, "n");
        if (n < 0) throw new RangeError("n must be >= 0");

        const key = `fib:${n}`;
        if (this.state.cache.has(key)) return this.state.cache.get(key);

        const val = this._fibIter(n);
        this.state.cache.set(key, val);
        return val;
    }

    /**
     * Example: Parse text input to numbers
     * Input: "1 2 3"
     * Output: [1,2,3]
     */
    parseNumbers(input) {
        this._bumpCalls("parseNumbers");
        this._assertString(input, "input");
        return input
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((x) => {
                const n = Number(x);
                if (Number.isNaN(n)) throw new TypeError(`Invalid number: "${x}"`);
                return n;
            });
    }

    /**
     * Example: “progressive build” storage
     * Problem: design methods to store + retrieve items
     */
    put(key, value) {
        this._bumpCalls("put");
        this._assertString(key, "key");
        this.state.cache.set(key, value);
        return true;
    }

    get(key, fallback = undefined) {
        this._bumpCalls("get");
        this._assertString(key, "key");
        return this.state.cache.has(key) ? this.state.cache.get(key) : fallback;
    }

    has(key) {
        this._bumpCalls("has");
        this._assertString(key, "key");
        return this.state.cache.has(key);
    }

    delete(key) {
        this._bumpCalls("delete");
        this._assertString(key, "key");
        return this.state.cache.delete(key);
    }

    /* -------------------------
     * PRIVATE-ish HELPERS
     * ------------------------- */

    _bumpCalls(name) {
        this.state.stats.calls++;
        if (this.state.debug) {
            // keep this minimal in tests
            // console.log(`[debug] ${name} called`);
        }
    }

    _assertInt(n, name) {
        if (!Number.isInteger(n)) throw new TypeError(`${name} must be an integer`);
    }

    _assertString(s, name) {
        if (typeof s !== "string") throw new TypeError(`${name} must be a string`);
    }

    _fibIter(n) {
        // O(n) time, O(1) space
        let a = 0,
            b = 1;
        for (let i = 0; i < n; i++) {
            const next = a + b;
            a = b;
            b = next;
        }
        return a;
    }
}

/* =====================================================================================
 * 3) COMMON I/O SHAPES (Progressive Build Tests)
 * ===================================================================================== */

/**
 * Many Meta-style tests give you:
 * - a function signature and you implement it
 * - or stdin-like input where you parse and output
 *
 * Common patterns:
 *  - parse lines
 *  - parse JSON
 *  - join output
 */

// Parse lines
const parseLines = (text) => text.replace(/\r/g, "").split("\n");

// Parse CSV line to array (basic, no quoted commas handling)
const parseCSV = (line) => line.split(",").map((s) => s.trim());

// Output as string lines
const toLines = (arr) => arr.join("\n");

// Basic JSON I/O
const parseJSON = (text) => JSON.parse(text);
const toJSON = (obj) => JSON.stringify(obj);

/* =====================================================================================
 * 4) ERROR HANDLING + DEFENSIVE CODING
 * ===================================================================================== */

function safeExecute(fn, fallback = null) {
    try {
        return fn();
    } catch (err) {
        return fallback;
    }
}

// Create consistent errors
const errInvalid = (msg) => new Error(`InvalidInput: ${msg}`);

/* =====================================================================================
 * 5) DATA STRUCTURES: MAP / SET / QUEUE / STACK / HEAP
 * ===================================================================================== */

// Map usage
function countFreq(arr) {
    const m = new Map();
    for (const x of arr) m.set(x, (m.get(x) ?? 0) + 1);
    return m;
}

// Set usage: unique
const unique = (arr) => Array.from(new Set(arr));

// Stack (array)
class Stack {
    constructor() {
        this.a = [];
    }
    push(x) {
        this.a.push(x);
    }
    pop() {
        return this.a.pop();
    }
    peek() {
        return this.a[this.a.length - 1];
    }
    size() {
        return this.a.length;
    }
}

// Queue (two-pointer array for O(1) amortized)
class Queue {
    constructor() {
        this.a = [];
        this.head = 0;
    }
    enqueue(x) {
        this.a.push(x);
    }
    dequeue() {
        if (this.head >= this.a.length) return undefined;
        const val = this.a[this.head++];
        // optional compaction
        if (this.head > 50 && this.head * 2 > this.a.length) {
            this.a = this.a.slice(this.head);
            this.head = 0;
        }
        return val;
    }
    isEmpty() {
        return this.head >= this.a.length;
    }
    size() {
        return this.a.length - this.head;
    }
}

// MinHeap (classic)
class MinHeap {
    constructor() {
        this.a = [];
    }
    size() {
        return this.a.length;
    }
    peek() {
        return this.a[0];
    }
    push(x) {
        this.a.push(x);
        this._siftUp(this.a.length - 1);
    }
    pop() {
        if (this.a.length === 0) return undefined;
        const top = this.a[0];
        const last = this.a.pop();
        if (this.a.length > 0) {
            this.a[0] = last;
            this._siftDown(0);
        }
        return top;
    }
    _siftUp(i) {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (this.a[p] <= this.a[i]) break;
            [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
            i = p;
        }
    }
    _siftDown(i) {
        const n = this.a.length;
        while (true) {
            let smallest = i;
            const l = i * 2 + 1;
            const r = i * 2 + 2;
            if (l < n && this.a[l] < this.a[smallest]) smallest = l;
            if (r < n && this.a[r] < this.a[smallest]) smallest = r;
            if (smallest === i) break;
            [this.a[i], this.a[smallest]] = [this.a[smallest], this.a[i]];
            i = smallest;
        }
    }
}

/* =====================================================================================
 * 6) CORE ALGO PATTERNS (WITH MINI I/O EXAMPLES)
 * ===================================================================================== */

/**
 * PATTERN: Two pointers (sorted array / pair sum / remove duplicates)
 * Example: return true if exists i<j such that nums[i]+nums[j]==target (sorted nums).
 */
function hasPairSumSorted(nums, target) {
    let i = 0,
        j = nums.length - 1;
    while (i < j) {
        const s = nums[i] + nums[j];
        if (s === target) return true;
        if (s < target) i++;
        else j--;
    }
    return false;
}
// Input: [1,2,4,7], target=6 -> true (2+4)

/**
 * PATTERN: Sliding window (max subarray sum length k)
 */
function maxSumLenK(nums, k) {
    if (k <= 0 || k > nums.length) throw errInvalid("k out of range");
    let sum = 0;
    for (let i = 0; i < k; i++) sum += nums[i];
    let best = sum;
    for (let i = k; i < nums.length; i++) {
        sum += nums[i] - nums[i - k];
        if (sum > best) best = sum;
    }
    return best;
}
// Input: [1,4,2,10,2,3,1,0,20], k=4 -> 24

/**
 * PATTERN: Prefix sums (range sum queries)
 */
function buildPrefix(nums) {
    const pre = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) pre[i + 1] = pre[i] + nums[i];
    return pre;
}
function rangeSum(prefix, l, r) {
    // inclusive l..r
    return prefix[r + 1] - prefix[l];
}

/**
 * PATTERN: Hash map lookup (two sum unsorted)
 */
function twoSum(nums, target) {
    const idx = new Map(); // value -> index
    for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (idx.has(need)) return [idx.get(need), i];
        idx.set(nums[i], i);
    }
    return null;
}

/**
 * PATTERN: BFS (shortest path in unweighted graph)
 * Graph as adjacency list: Map(node -> array of neighbors)
 */
function bfsShortestPath(graph, start, goal) {
    if (start === goal) return [start];
    const q = new Queue();
    q.enqueue(start);
    const prev = new Map(); // node -> previous node
    prev.set(start, null);

    while (!q.isEmpty()) {
        const node = q.dequeue();
        const neighbors = graph.get(node) ?? [];
        for (const nb of neighbors) {
            if (prev.has(nb)) continue;
            prev.set(nb, node);
            if (nb === goal) return reconstructPath(prev, goal);
            q.enqueue(nb);
        }
    }
    return null;
}
function reconstructPath(prev, end) {
    const path = [];
    let cur = end;
    while (cur !== null) {
        path.push(cur);
        cur = prev.get(cur);
    }
    path.reverse();
    return path;
}

/**
 * PATTERN: DFS (traverse / detect cycles)
 */
function dfs(graph, start, visit) {
    const seen = new Set();
    (function go(node) {
        if (seen.has(node)) return;
        seen.add(node);
        visit(node);
        for (const nb of graph.get(node) ?? []) go(nb);
    })(start);
}

/**
 * PATTERN: Topological sort (Kahn)
 * Input: edges [[u,v]] meaning u -> v
 */
function topoSort(nodes, edges) {
    const adj = new Map();
    const indeg = new Map();
    for (const n of nodes) {
        adj.set(n, []);
        indeg.set(n, 0);
    }
    for (const [u, v] of edges) {
        adj.get(u).push(v);
        indeg.set(v, (indeg.get(v) ?? 0) + 1);
    }
    const q = new Queue();
    for (const n of nodes) if ((indeg.get(n) ?? 0) === 0) q.enqueue(n);

    const out = [];
    while (!q.isEmpty()) {
        const n = q.dequeue();
        out.push(n);
        for (const v of adj.get(n)) {
            indeg.set(v, indeg.get(v) - 1);
            if (indeg.get(v) === 0) q.enqueue(v);
        }
    }
    return out.length === nodes.length ? out : null; // null => cycle
}

/**
 * PATTERN: Sorting objects
 */
function sortByKeyAsc(arr, key) {
    return arr.slice().sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
    });
}

/**
 * PATTERN: Binary search (first >= target)
 */
function lowerBound(nums, target) {
    let l = 0,
        r = nums.length; // [l,r)
    while (l < r) {
        const m = (l + r) >> 1;
        if (nums[m] < target) l = m + 1;
        else r = m;
    }
    return l;
}

/* =====================================================================================
 * 7) STRING TEMPLATES (Common Meta prompts)
 * ===================================================================================== */

/**
 * TERM SET:
 * - palindrome
 * - anagram
 * - longest substring without repeat
 * - parsing / tokenization
 */

// Palindrome check (two pointers)
function isPalindrome(s) {
    let i = 0,
        j = s.length - 1;
    while (i < j) {
        if (s[i] !== s[j]) return false;
        i++;
        j--;
    }
    return true;
}

// Anagram check (freq)
function isAnagram(a, b) {
    if (a.length !== b.length) return false;
    const m = new Map();
    for (const ch of a) m.set(ch, (m.get(ch) ?? 0) + 1);
    for (const ch of b) {
        if (!m.has(ch)) return false;
        const next = m.get(ch) - 1;
        if (next === 0) m.delete(ch);
        else m.set(ch, next);
    }
    return m.size === 0;
}

// Longest substring without repeat (sliding window)
function lengthOfLongestSubstring(s) {
    const last = new Map(); // char -> last index
    let best = 0;
    let left = 0;
    for (let right = 0; right < s.length; right++) {
        const ch = s[right];
        if (last.has(ch)) left = Math.max(left, last.get(ch) + 1);
        last.set(ch, right);
        best = Math.max(best, right - left + 1);
    }
    return best;
}

/* =====================================================================================
 * 8) ARRAYS / OBJECTS: COPY, MERGE, IMMUTABLE UPDATES
 * ===================================================================================== */

// Shallow clone
const cloneObj = (o) => ({ ...o });
const cloneArr = (a) => a.slice();

// Deep clone (plain JSON-safe)
const deepCloneJSON = (x) => JSON.parse(JSON.stringify(x));

// Immutable update: set nested (simple)
function setAt(obj, key, value) {
    return { ...obj, [key]: value };
}

// Merge defaults
function withDefaults(opts, defaults) {
    return { ...defaults, ...(opts ?? {}) };
}

/* =====================================================================================
 * 9) “PROGRESSIVE BUILD” FILESYSTEM / PATH / COMMAND SIMS
 * ===================================================================================== */

/**
 * Very common interview toy problem:
 * - Build an in-memory filesystem, or key-value store, or command processor.
 *
 * We'll build a tiny in-memory FS:
 *  - mkdir("/a/b")
 *  - writeFile("/a/b/x.txt", "hi")
 *  - readFile("/a/b/x.txt") -> "hi"
 *  - ls("/a") -> ["b"]
 *
 * Structure:
 *  Node: { type: "dir"|"file", children: Map, content: string }
 */

class InMemoryFS {
    constructor() {
        this.root = this._dirNode();
    }

    mkdir(path) {
        const parts = this._parts(path);
        let cur = this.root;
        for (const name of parts) {
            if (!cur.children.has(name)) cur.children.set(name, this._dirNode());
            const next = cur.children.get(name);
            if (next.type !== "dir") throw new Error(`Not a directory: ${name}`);
            cur = next;
        }
        return true;
    }

    writeFile(path, content) {
        const parts = this._parts(path);
        if (parts.length === 0) throw errInvalid("file path required");
        const file = parts.pop();
        const dir = this._walkDir(parts, true);
        dir.children.set(file, this._fileNode(String(content)));
        return true;
    }

    readFile(path) {
        const parts = this._parts(path);
        if (parts.length === 0) throw errInvalid("file path required");
        const file = parts.pop();
        const dir = this._walkDir(parts, false);
        const node = dir.children.get(file);
        if (!node || node.type !== "file") throw new Error("File not found");
        return node.content;
    }

    ls(path = "/") {
        const parts = this._parts(path);
        const node = this._walkNode(parts);
        if (node.type === "file") return [parts[parts.length - 1] ?? ""];
        return Array.from(node.children.keys()).sort();
    }

    /* helpers */
    _dirNode() {
        return { type: "dir", children: new Map() };
    }
    _fileNode(content) {
        return { type: "file", content };
    }
    _parts(path) {
        if (typeof path !== "string") throw new TypeError("path must be a string");
        if (!path.startsWith("/")) throw new Error("path must start with /");
        return path.split("/").filter(Boolean);
    }
    _walkDir(parts, create) {
        let cur = this.root;
        for (const name of parts) {
            if (!cur.children.has(name)) {
                if (!create) throw new Error(`Directory not found: ${name}`);
                cur.children.set(name, this._dirNode());
            }
            const next = cur.children.get(name);
            if (next.type !== "dir") throw new Error(`Not a directory: ${name}`);
            cur = next;
        }
        return cur;
    }
    _walkNode(parts) {
        let cur = this.root;
        for (const name of parts) {
            const next = cur.children.get(name);
            if (!next) throw new Error(`Not found: ${name}`);
            cur = next;
        }
        return cur;
    }
}

/* =====================================================================================
 * 10) “QUESTION / TERMS / SOLUTION” MINI TEMPLATES (Copy/Paste)
 * ===================================================================================== */

/**
 * TEMPLATE: Design a class with operations
 * Question:
 *  Implement a class X that supports:
 *    - add(item)
 *    - remove(item)
 *    - contains(item)
 *
 * Terms:
 *  - time complexity target (O(1)? O(log n)?)
 *  - duplicates allowed?
 *
 * Solution sketch:
 *  - Use Set for unique O(1)
 *  - Use Map(item->count) for duplicates
 */

// Example: multiset (bag)
class MultiSet {
    constructor() {
        this.m = new Map();
        this.size = 0;
    }
    add(x) {
        this.m.set(x, (this.m.get(x) ?? 0) + 1);
        this.size++;
    }
    remove(x) {
        if (!this.m.has(x)) return false;
        const c = this.m.get(x) - 1;
        if (c === 0) this.m.delete(x);
        else this.m.set(x, c);
        this.size--;
        return true;
    }
    count(x) {
        return this.m.get(x) ?? 0;
    }
    contains(x) {
        return this.m.has(x);
    }
}

/**
 * TEMPLATE: “Given input, return output” (array)
 * Question:
 *  Given nums, return something.
 *
 * Terms:
 *  - sorted?
 *  - negative?
 *  - constraints?
 *
 * Solution:
 *  - pick the right pattern:
 *    - map/set => membership/duplicate checks
 *    - two pointers => sorted + pair constraints
 *    - sliding window => contiguous subarray constraints
 *    - BFS/DFS => graph/tree connectivity
 */

/* =====================================================================================
 * 11) TEST HARNESS (Use at bottom during interview)
 * ===================================================================================== */

/**
 * Mini assertion helpers.
 * Use these to sanity check quickly while you code.
 */
function assertEq(actual, expected, msg = "") {
    if (actual !== expected) {
        throw new Error(
            `AssertEq failed: ${msg}\n  expected: ${expected}\n  actual:   ${actual}`
        );
    }
}

function assertDeepEq(actual, expected, msg = "") {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
        throw new Error(`AssertDeepEq failed: ${msg}\n  expected: ${e}\n  actual:   ${a}`);
    }
}

/* =====================================================================================
 * 12) QUICK DEMOS (comment/uncomment in an exam environment)
 * ===================================================================================== */

// ---- ProgressiveService demo ----
// const svc = new ProgressiveService({ debug: true });
// assertEq(svc.fib(0), 0, "fib0");
// assertEq(svc.fib(1), 1, "fib1");
// assertEq(svc.fib(10), 55, "fib10");
// assertDeepEq(svc.parseNumbers("1  2 3"), [1, 2, 3], "parseNumbers");

// ---- InMemoryFS demo ----
// const fs = new InMemoryFS();
// fs.mkdir("/a/b");
// fs.writeFile("/a/b/x.txt", "hi");
// assertEq(fs.readFile("/a/b/x.txt"), "hi", "readFile");
// assertDeepEq(fs.ls("/a"), ["b"], "ls");

// ---- Algo demo ----
// assertEq(hasPairSumSorted([1, 2, 4, 7], 6), true, "pair sum");
// assertEq(maxSumLenK([1, 4, 2, 10, 2, 3, 1, 0, 20], 4), 24, "max sum len k");
// assertDeepEq(twoSum([2, 7, 11, 15], 9), [0, 1], "two sum");

/**
 * END OF CHEAT SHEET
 *
 * If you want, tell me the *specific* style of Meta test you’re expecting:
 * - pure DS/Algo (LeetCode-ish)
 * - “progressive build” system design coding (filesystem, rate limiter, cache, parser)
 * - frontend-ish utilities (state manager, event emitter, router, hooks-like patterns)
 *
 * and I’ll tailor this file into a tighter “only what you’ll use” version.
 */


/**
 * META SWE PROGRESSIVE BUILD CHEAT SHEET (Single JS File)
 * ======================================================
 * This file focuses on “progressive-step” interviews:
 * - Start with a tiny class that passes step 1
 * - Add properties/state + methods as requirements expand
 * - Keep code organized: PUBLIC API (actions) + INTERNAL HELPERS
 *
 * Includes:
 *  - How to add methods/properties
 *  - How to mutate state safely
 *  - How to design for “next steps”
 *  - A full progressive build example (in-memory filesystem) with step-by-step upgrades
 *
 * Copy/paste friendly for coding tests.
 */

/* =====================================================================================
 * 0) QUICK CLASS BASICS: PROPERTIES, METHODS, STATE
 * ===================================================================================== */

/**
 * Adding properties:
 *   - In constructor: this.prop = ...
 *   - Or as class field (if allowed): prop = ...
 *
 * Adding methods:
 *   - methodName(args) { ... }
 *   - Keep public methods at top, helpers at bottom (underscore prefix)
 *
 * Mutating state:
 *   - this.state.count++
 *   - Map/Set: this.map.set(k,v), this.set.add(x)
 *
 * Consistency rule:
 *   - Always validate inputs at the edges (public methods)
 *   - Keep helpers pure-ish where possible
 */

class ExampleCounter {
    constructor(start = 0) {
        // PROPERTY: number
        this.count = start;

        // PROPERTY: object for grouped state
        this.state = {
            calls: 0,
            history: [],
        };
    }

    // METHOD: increments and returns new value
    inc(by = 1) {
        this._touch("inc");
        this._assertInt(by, "by");
        this.count += by;
        this.state.history.push(this.count);
        return this.count;
    }

    // METHOD: read-only accessor
    value() {
        this._touch("value");
        return this.count;
    }

    // HELPER: internal bookkeeping
    _touch(name) {
        this.state.calls++;
        // keep logs off in interview unless needed
        // console.log(`[debug] ${name}`);
    }

    _assertInt(n, name) {
        if (!Number.isInteger(n)) throw new TypeError(`${name} must be an integer`);
    }
}

/* =====================================================================================
 * 1) PROGRESSIVE BUILD INTERVIEW PLAYBOOK (What you do in real time)
 * ===================================================================================== */

/**
 * When the interviewer adds requirements step-by-step:
 *
 * Step template:
 *  1) Restate requirement in 1 sentence.
 *  2) Confirm input/output examples.
 *  3) Choose a simple internal representation (DS).
 *  4) Implement smallest change that passes new tests.
 *  5) Refactor only if it makes next step easier.
 *
 * Class organization template (recommended):
 *
 * class Thing {
 *   constructor(opts) { ...state... }
 *
 *   // PUBLIC API
 *   methodA(...) { validate; do; return; }
 *   methodB(...) { ... }
 *
 *   // INTERNAL HELPERS
 *   _validateX(...) { ... }
 *   _computeY(...) { ... }
 * }
 */

/* =====================================================================================
 * 2) FULL PROGRESSIVE BUILD EXAMPLE: IN-MEMORY FILESYSTEM (Classic Meta-style)
 * ===================================================================================== */

/**
 * Progressive requirements (typical sequence):
 *
 * STEP 1:
 *  - Implement:
 *     - mkdir(path)
 *     - ls(path)
 *
 * STEP 2:
 *  - Add files:
 *     - writeFile(path, content)
 *     - readFile(path)
 *
 * STEP 3:
 *  - Add append + delete:
 *     - appendFile(path, content)
 *     - rm(path)   (remove file or empty directory)
 *
 * STEP 4:
 *  - Add:
 *     - exists(path)
 *     - stat(path) -> metadata (type, size, children count, timestamps)
 *
 * STEP 5 (optional):
 *  - Add “progressive build” features:
 *     - transactions (begin/commit/rollback)
 *     - snapshots
 *     - path normalization (., ..)
 *
 * This class is built in a way that you can stop at any step and it still reads cleanly.
 *
 * INTERNAL MODEL:
 *  - Node: { type: "dir"|"file", children?: Map, content?: string, meta: {...} }
 *
 * I/O EXAMPLES:
 *   fs.mkdir("/a/b")
 *   fs.ls("/")          -> ["a"]
 *   fs.writeFile("/a/b/x.txt", "hi")
 *   fs.readFile("/a/b/x.txt") -> "hi"
 */

class ProgressiveFS {
    constructor(opts = {}) {
        // ----- PROPERTIES / STATE -----
        this.opts = { debug: !!opts.debug };

        // Root directory node
        this.root = this._makeDirNode();

        // Optional: track “time” for metadata in a simple way
        this._clock = 0;
    }

    /* -------------------------
     * STEP 1: mkdir + ls
     * ------------------------- */

    /**
     * mkdir(path): create directories along the path.
     * Input: "/a/b"
     * Output: true
     */
    mkdir(path) {
        this._tick("mkdir");
        const parts = this._splitPath(path);

        let cur = this.root;
        for (const name of parts) {
            if (!cur.children.has(name)) {
                cur.children.set(name, this._makeDirNode());
                cur.meta.modifiedAt = this._clock;
            }

            const next = cur.children.get(name);
            if (next.type !== "dir") throw new Error(`mkdir failed: ${name} is a file`);
            cur = next;
        }
        return true;
    }

    /**
     * ls(path): list directory entries (sorted).
     * Input: "/" or "/a/b"
     * Output: array of names
     *
     * Common interview expectation:
     *  - If path points to a file, return [filename]
     *  - If directory, return children names sorted
     */
    ls(path = "/") {
        this._tick("ls");
        const parts = this._splitPath(path);

        const node = this._walk(parts, { createDirs: false });
        if (node.type === "file") {
            // if they call ls("/a/b/x.txt"), often expected ["x.txt"]
            return parts.length ? [parts[parts.length - 1]] : [];
        }

        return Array.from(node.children.keys()).sort();
    }

    /* -------------------------
     * STEP 2: writeFile + readFile
     * ------------------------- */

    /**
     * writeFile(path, content): write (overwrite) file.
     * Input: "/a/b/x.txt", "hi"
     * Output: true
     */
    writeFile(path, content) {
        this._tick("writeFile");

        const { dirParts, name } = this._splitParent(path);
        const dir = this._walk(dirParts, { createDirs: true }); // often expected to create dirs
        if (dir.type !== "dir") throw new Error("writeFile failed: parent is not a dir");

        const fileNode = this._makeFileNode(String(content));
        dir.children.set(name, fileNode);

        dir.meta.modifiedAt = this._clock;
        return true;
    }

    /**
     * readFile(path): return file contents.
     * Input: "/a/b/x.txt"
     * Output: "hi"
     */
    readFile(path) {
        this._tick("readFile");
        const parts = this._splitPath(path);
        if (parts.length === 0) throw new Error("readFile failed: invalid file path");

        const node = this._walk(parts, { createDirs: false });
        if (node.type !== "file") throw new Error("readFile failed: not a file");
        return node.content;
    }

    /* -------------------------
     * STEP 3: appendFile + rm
     * ------------------------- */

    /**
     * appendFile(path, content): append to existing file OR create it.
     * Input: "/a/b/x.txt", " there"
     * Output: true
     */
    appendFile(path, content) {
        this._tick("appendFile");

        const { dirParts, name } = this._splitParent(path);
        const dir = this._walk(dirParts, { createDirs: true });

        const existing = dir.children.get(name);
        if (!existing) {
            dir.children.set(name, this._makeFileNode(String(content)));
        } else {
            if (existing.type !== "file") throw new Error("appendFile failed: not a file");
            existing.content += String(content);
            existing.meta.modifiedAt = this._clock;
            existing.meta.size = existing.content.length;
        }

        dir.meta.modifiedAt = this._clock;
        return true;
    }

    /**
     * rm(path): remove a file OR remove an empty directory.
     * Output: true if removed, false if not found
     *
     * Many interviewers specify "only empty dirs can be removed".
     */
    rm(path) {
        this._tick("rm");
        const parts = this._splitPath(path);
        if (parts.length === 0) throw new Error("rm failed: cannot remove root");

        const parentParts = parts.slice(0, -1);
        const name = parts[parts.length - 1];
        const parent = this._walk(parentParts, { createDirs: false });

        if (parent.type !== "dir") throw new Error("rm failed: parent is not a dir");
        const node = parent.children.get(name);
        if (!node) return false;

        if (node.type === "dir" && node.children.size > 0) {
            throw new Error("rm failed: directory not empty");
        }

        parent.children.delete(name);
        parent.meta.modifiedAt = this._clock;
        return true;
    }

    /* -------------------------
     * STEP 4: exists + stat
     * ------------------------- */

    exists(path) {
        this._tick("exists");
        try {
            const parts = this._splitPath(path);
            this._walk(parts, { createDirs: false });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * stat(path): returns metadata
     * Example output:
     *   { type:"file", size: 2, createdAt: 3, modifiedAt: 9, children: 0 }
     */
    stat(path) {
        this._tick("stat");
        const parts = this._splitPath(path);
        const node = this._walk(parts, { createDirs: false });

        return {
            type: node.type,
            size: node.type === "file" ? node.meta.size : 0,
            children: node.type === "dir" ? node.children.size : 0,
            createdAt: node.meta.createdAt,
            modifiedAt: node.meta.modifiedAt,
        };
    }

    /* -------------------------
     * STEP 5 (OPTIONAL): transactions (begin/commit/rollback)
     * ------------------------- */

    /**
     * Progressive interviews love this:
     * - “Now add undo / rollback”
     * Simplest approach:
     *  - Snapshot root via deep clone at begin()
     *  - On rollback(), restore snapshot
     *
     * Tradeoff:
     *  - Deep clone is O(size of tree) per begin()
     *  - But easiest + safest in an interview
     */

    begin() {
        this._tick("begin");
        if (this._txnSnapshot) throw new Error("Transaction already active");
        this._txnSnapshot = this._cloneNode(this.root);
        return true;
    }

    commit() {
        this._tick("commit");
        if (!this._txnSnapshot) throw new Error("No active transaction");
        this._txnSnapshot = null;
        return true;
    }

    rollback() {
        this._tick("rollback");
        if (!this._txnSnapshot) throw new Error("No active transaction");
        this.root = this._txnSnapshot;
        this._txnSnapshot = null;
        return true;
    }

    /* =================================================================================
     * INTERNAL HELPERS (This is how you keep it clean in progressive build interviews)
     * ================================================================================= */

    _tick(methodName) {
        // monotonically increasing “timestamp”
        this._clock++;
        if (this.opts.debug) {
            // console.log(`[debug] t=${this._clock} ${methodName}`);
        }
    }

    _makeDirNode() {
        return {
            type: "dir",
            children: new Map(),
            meta: {
                createdAt: this._clock,
                modifiedAt: this._clock,
            },
        };
    }

    _makeFileNode(content) {
        return {
            type: "file",
            content,
            meta: {
                size: content.length,
                createdAt: this._clock,
                modifiedAt: this._clock,
            },
        };
    }

    /**
     * split path into parts:
     *  "/" -> []
     *  "/a/b" -> ["a","b"]
     *  Enforces starting "/"
     */
    _splitPath(path) {
        if (typeof path !== "string") throw new TypeError("path must be a string");
        if (!path.startsWith("/")) throw new Error("path must start with /");
        return path.split("/").filter(Boolean);
    }

    /**
     * splitParent("/a/b/x.txt") => { dirParts:["a","b"], name:"x.txt" }
     */
    _splitParent(path) {
        const parts = this._splitPath(path);
        if (parts.length === 0) throw new Error("invalid path");
        return {
            dirParts: parts.slice(0, -1),
            name: parts[parts.length - 1],
        };
    }

    /**
     * Walk to a node by parts.
     * Options:
     *  - createDirs: create missing directories along the way
     */
    _walk(parts, { createDirs }) {
        let cur = this.root;

        for (const name of parts) {
            if (cur.type !== "dir") throw new Error(`not a dir: ${name}`);

            if (!cur.children.has(name)) {
                if (!createDirs) throw new Error(`not found: ${name}`);
                cur.children.set(name, this._makeDirNode());
                cur.meta.modifiedAt = this._clock;
            }

            cur = cur.children.get(name);
        }

        return cur;
    }

    /**
     * Deep clone node for transaction snapshot.
     * Clones Maps + nested nodes.
     */
    _cloneNode(node) {
        if (node.type === "file") {
            return {
                type: "file",
                content: node.content,
                meta: { ...node.meta },
            };
        }

        const cloned = {
            type: "dir",
            children: new Map(),
            meta: { ...node.meta },
        };
        for (const [k, child] of node.children.entries()) {
            cloned.children.set(k, this._cloneNode(child));
        }
        return cloned;
    }
}

/* =====================================================================================
 * 3) “HOW TO ADD METHODS/PROPERTIES MID-INTERVIEW” (WHAT YOU SAY + WHAT YOU DO)
 * ===================================================================================== */

/**
 * Interviewer: “Now we also need to support appendFile…”
 * You:
 *  1) Add a new PUBLIC method:
 *        appendFile(path, content) { ... }
 *  2) Reuse existing helpers:
 *        _splitParent, _walk, _makeFileNode
 *  3) Mutate state in one place (dir.children)
 *
 * Interviewer: “Now add metadata…”
 * You:
 *  1) Add property: this._clock
 *  2) Add meta fields to nodes
 *  3) Update existing write/append/mkdir to set modifiedAt
 *
 * Interviewer: “Now add rollback…”
 * You:
 *  1) Add property: this._txnSnapshot
 *  2) Add methods: begin/commit/rollback
 *  3) Add helper: _cloneNode
 *
 * The key: DO NOT rewrite the whole class—extend it.
 */

/* =====================================================================================
 * 4) TEST HARNESS (FAST CHECKS DURING EXAM)
 * ===================================================================================== */

function assertEq(actual, expected, msg = "") {
    if (actual !== expected) {
        throw new Error(
            `AssertEq failed: ${msg}\n  expected: ${expected}\n  actual:   ${actual}`
        );
    }
}

function assertDeepEq(actual, expected, msg = "") {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
        throw new Error(`AssertDeepEq failed: ${msg}\n  expected: ${e}\n  actual:   ${a}`);
    }
}

/* =====================================================================================
 * 5) DEMO RUN (comment/uncomment during interview if allowed)
 * ===================================================================================== */

/**
// STEP 1 demo
const fs = new ProgressiveFS();
fs.mkdir("/a/b");
assertDeepEq(fs.ls("/"), ["a"], "ls root");
assertDeepEq(fs.ls("/a"), ["b"], "ls /a");

// STEP 2 demo
fs.writeFile("/a/b/x.txt", "hi");
assertEq(fs.readFile("/a/b/x.txt"), "hi", "readFile");
assertDeepEq(fs.ls("/a/b"), ["x.txt"], "ls /a/b");

// STEP 3 demo
fs.appendFile("/a/b/x.txt", " there");
assertEq(fs.readFile("/a/b/x.txt"), "hi there", "appendFile");
assertEq(fs.rm("/a/b/x.txt"), true, "rm file");
assertDeepEq(fs.ls("/a/b"), [], "ls empty dir");

// STEP 4 demo
assertEq(fs.exists("/a/b"), true, "exists dir");
assertEq(fs.exists("/a/b/x.txt"), false, "exists file");
const st = fs.stat("/a/b");
assertEq(st.type, "dir", "stat type");

// STEP 5 demo
fs.begin();
fs.writeFile("/a/b/z.txt", "zzz");
assertEq(fs.exists("/a/b/z.txt"), true, "exists after write");
fs.rollback();
assertEq(fs.exists("/a/b/z.txt"), false, "rollback restored");
 */

/**
 * END
 *
 * If you want another full progressive build example, tell me the domain:
 *  - LRU cache
 *  - rate limiter
 *  - event emitter / pub-sub
 *  - command processor (undo/redo)
 *  - spreadsheet formulas
 *
 * and I’ll produce a second “step-by-step expansion” class in this same style.
 */


/**
 * META SWE PROGRESSIVE BUILD — CONSOLIDATED PROBLEM/SOLUTION SET + JS ESSENTIALS
 * =============================================================================
 * Purpose: one tight “toolbelt” for tackling almost any coding task in interviews.
 * Format: Essentials + Problem templates with INPUT/OUTPUT + what to use it for.
 *
 * How to use:
 *  1) Identify problem type (array/string/graph/design class).
 *  2) Grab the matching template below.
 *  3) Implement using the minimal helper(s).
 */

/* =============================================================================
 * A) JS ESSENTIALS (WHAT YOU NEED 99% OF THE TIME)
 * ============================================================================= */

/** 1) Declarations */
const fn = (a, b) => a + b;                 // function
class Thing { constructor() { } }            // class
const obj = { a: 1, b: 2 };                 // object
const arr = [1, 2, 3];                      // array

/** 2) Common DS */
const map = new Map();                      // key -> value (fast lookups)
const set = new Set();                      // unique values
const stack = [];                           // push/pop
// queue pattern (fast):
class Queue { constructor() { this.a = []; this.i = 0; } push(x) { this.a.push(x); } pop() { return this.i < this.a.length ? this.a[this.i++] : undefined; } empty() { return this.i >= this.a.length; } }

/** 3) Sorting */
const numsSorted = [...arr].sort((x, y) => x - y);  // numeric sort
const byKey = (k) => (a, b) => (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0);

/** 4) Common loops */
for (let i = 0; i < arr.length; i++) { }
for (const x of arr) { }
for (const [k, v] of map) { }

/** 5) Safe checks */
const isInt = Number.isInteger;
const isNum = (x) => typeof x === "number" && !Number.isNaN(x);

/** 6) Copying */
const shallowObj = { ...obj };
const shallowArr = arr.slice();
const deepJSON = (x) => JSON.parse(JSON.stringify(x)); // plain data only

/** 7) Simple assertions (quick interview tests) */
function assertEq(actual, expected, msg = "") {
    if (actual !== expected) throw new Error(`FAIL ${msg}\nexpected=${expected}\nactual=${actual}`);
}
function assertDeepEq(actual, expected, msg = "") {
    const a = JSON.stringify(actual), e = JSON.stringify(expected);
    if (a !== e) throw new Error(`FAIL ${msg}\nexpected=${e}\nactual=${a}`);
}

/* =============================================================================
 * B) “CHOOSE THE RIGHT PATTERN” CHEAT (WHAT IT’S USED FOR)
 * =============================================================================
 * - Need membership / duplicates / counts?        => Map / Set
 * - Need pair/interval with sorted array?         => Two pointers
 * - Need contiguous best/min/max segment?         => Sliding window / Prefix sums
 * - Need shortest steps in unweighted graph/grid? => BFS
 * - Need explore all paths / components?          => DFS
 * - Need ordered by dependency?                   => Topo sort
 * - Need min/max repeatedly?                      => Heap/PriorityQueue
 * - Need cache with eviction?                     => LRU (Map linked order)
 * - Need “progressive build class”?               => Clean class: state + actions + helpers
 */

/* =============================================================================
 * C) CONSOLIDATED PROBLEM / SOLUTION SET (WITH INPUT/OUTPUT + USE-CASE)
 * ============================================================================= */

/* -----------------------------------------------------------------------------
 * 1) TWO SUM (Unsorted) — Map lookup
 * Used for: find pair with target, complement matching, “seen before” problems.
 * Input:  nums=[2,7,11,15], target=9
 * Output: [0,1]
 * Complexity: O(n) time, O(n) space
 * --------------------------------------------------------------------------- */
function twoSum(nums, target) {
    const seen = new Map(); // value -> index
    for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (seen.has(need)) return [seen.get(need), i];
        seen.set(nums[i], i);
    }
    return null;
}

/* -----------------------------------------------------------------------------
 * 2) TWO POINTERS (Sorted Pair Sum) — shrink window
 * Used for: sorted arrays, pair constraints, remove duplicates, partitioning.
 * Input: nums=[1,2,4,7], target=6
 * Output: true
 * Complexity: O(n)
 * --------------------------------------------------------------------------- */
function hasPairSumSorted(nums, target) {
    let l = 0, r = nums.length - 1;
    while (l < r) {
        const s = nums[l] + nums[r];
        if (s === target) return true;
        if (s < target) l++; else r--;
    }
    return false;
}

/* -----------------------------------------------------------------------------
 * 3) SLIDING WINDOW (Fixed length) — max sum length k
 * Used for: contiguous segment with fixed size, streaming window stats.
 * Input: nums=[1,4,2,10,2,3,1,0,20], k=4
 * Output: 24
 * Complexity: O(n)
 * --------------------------------------------------------------------------- */
function maxSumLenK(nums, k) {
    if (k <= 0 || k > nums.length) return null;
    let sum = 0;
    for (let i = 0; i < k; i++) sum += nums[i];
    let best = sum;
    for (let i = k; i < nums.length; i++) {
        sum += nums[i] - nums[i - k];
        if (sum > best) best = sum;
    }
    return best;
}

/* -----------------------------------------------------------------------------
 * 4) SLIDING WINDOW (Variable length) — longest substring no repeats
 * Used for: “longest with constraint”, unique windows, throttling, dedupe spans.
 * Input: s="abcabcbb"
 * Output: 3 ("abc")
 * Complexity: O(n)
 * --------------------------------------------------------------------------- */
function lengthOfLongestSubstring(s) {
    const last = new Map(); // char -> last index
    let left = 0, best = 0;
    for (let right = 0; right < s.length; right++) {
        const ch = s[right];
        if (last.has(ch)) left = Math.max(left, last.get(ch) + 1);
        last.set(ch, right);
        best = Math.max(best, right - left + 1);
    }
    return best;
}

/* -----------------------------------------------------------------------------
 * 5) PREFIX SUMS — fast range queries
 * Used for: subarray sums, range sum queries, “count of something in range”.
 * Input: nums=[2,4,6,8], query range [1..3]
 * Output: 18 (4+6+8)
 * Complexity: build O(n), query O(1)
 * --------------------------------------------------------------------------- */
function buildPrefix(nums) {
    const pre = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) pre[i + 1] = pre[i] + nums[i];
    return pre;
}
function rangeSum(prefix, l, r) { // inclusive
    return prefix[r + 1] - prefix[l];
}

/* -----------------------------------------------------------------------------
 * 6) BINARY SEARCH — lower bound (first >= target)
 * Used for: sorted arrays, insertion positions, “min feasible” solutions.
 * Input: nums=[1,3,3,5], target=3
 * Output: 1
 * Complexity: O(log n)
 * --------------------------------------------------------------------------- */
function lowerBound(nums, target) {
    let l = 0, r = nums.length;
    while (l < r) {
        const m = (l + r) >> 1;
        if (nums[m] < target) l = m + 1;
        else r = m;
    }
    return l;
}

/* -----------------------------------------------------------------------------
 * 7) BFS (Shortest Path in Unweighted Graph)
 * Used for: shortest steps in grid/graph, level order traversal, word ladder.
 * Input: graph adjacency map, start="A", goal="D"
 * Output: ["A","B","D"]  (example)
 * Complexity: O(V+E)
 * --------------------------------------------------------------------------- */
function bfsShortestPath(graph, start, goal) {
    if (start === goal) return [start];
    const q = new Queue();
    const prev = new Map(); // node -> previous
    q.push(start);
    prev.set(start, null);

    while (!q.empty()) {
        const node = q.pop();
        for (const nb of (graph.get(node) ?? [])) {
            if (prev.has(nb)) continue;
            prev.set(nb, node);
            if (nb === goal) return reconstruct(prev, goal);
            q.push(nb);
        }
    }
    return null;
}
function reconstruct(prev, end) {
    const path = [];
    for (let cur = end; cur !== null; cur = prev.get(cur)) path.push(cur);
    path.reverse();
    return path;
}

/* -----------------------------------------------------------------------------
 * 8) DFS (Traverse / Components)
 * Used for: connected components, island counting, cycle detection (with states).
 * Input: graph, start
 * Output: visited order (or component size)
 * Complexity: O(V+E)
 * --------------------------------------------------------------------------- */
function dfs(graph, start, visit) {
    const seen = new Set();
    (function go(node) {
        if (seen.has(node)) return;
        seen.add(node);
        visit(node);
        for (const nb of (graph.get(node) ?? [])) go(nb);
    })(start);
}

/* -----------------------------------------------------------------------------
 * 9) TOPO SORT (Dependencies)
 * Used for: course schedule, build ordering, pipeline steps.
 * Input: nodes=["a","b","c"], edges=[["a","b"],["b","c"]]
 * Output: ["a","b","c"] (or null if cycle)
 * Complexity: O(V+E)
 * --------------------------------------------------------------------------- */
function topoSort(nodes, edges) {
    const adj = new Map();
    const indeg = new Map();
    for (const n of nodes) { adj.set(n, []); indeg.set(n, 0); }
    for (const [u, v] of edges) { adj.get(u).push(v); indeg.set(v, (indeg.get(v) ?? 0) + 1); }

    const q = new Queue();
    for (const n of nodes) if (indeg.get(n) === 0) q.push(n);

    const out = [];
    while (!q.empty()) {
        const n = q.pop();
        out.push(n);
        for (const v of adj.get(n)) {
            indeg.set(v, indeg.get(v) - 1);
            if (indeg.get(v) === 0) q.push(v);
        }
    }
    return out.length === nodes.length ? out : null;
}

/* -----------------------------------------------------------------------------
 * 10) LRU CACHE (Classic “progressive build class”)
 * Used for: caching, eviction policy, system design coding task.
 * API:
 *   - get(key) -> value or -1
 *   - put(key, value)
 * Input/Output:
 *   cache.put(1,1); cache.put(2,2); cache.get(1)->1; cache.put(3,3); cache.get(2)->-1
 * Complexity: O(1) average using Map insertion order (JS Map preserves order).
 * --------------------------------------------------------------------------- */
class LRUCache {
    constructor(capacity) {
        if (!Number.isInteger(capacity) || capacity <= 0) throw new Error("capacity must be positive int");
        this.cap = capacity;
        this.map = new Map(); // key -> value (order = recency)
    }

    get(key) {
        if (!this.map.has(key)) return -1;
        const val = this.map.get(key);
        // refresh recency:
        this.map.delete(key);
        this.map.set(key, val);
        return val;
    }

    put(key, val) {
        if (this.map.has(key)) this.map.delete(key);
        this.map.set(key, val);
        if (this.map.size > this.cap) {
            // evict least recently used (first key)
            const lruKey = this.map.keys().next().value;
            this.map.delete(lruKey);
        }
        return true;
    }
}

/* -----------------------------------------------------------------------------
 * 11) PROGRESSIVE BUILD CLASS TEMPLATE (STATE + ACTIONS + HELPERS)
 * Used for: filesystem, rate limiter, command processor, parser, scheduler.
 * --------------------------------------------------------------------------- */
class ProgressiveTemplate {
    constructor(opts = {}) {
        // STATE: keep everything in one place
        this.state = {
            debug: !!opts.debug,
            calls: 0,
            // add: maps/sets/caches here
            // shape of a map example: key -> value
            // real example of items in a map might be: filename -> file content
            // eg . ["/a/b.txt", "hi"], ["/a/c.txt", "hello"]
            data: new Map(),
        };
    }

    // ACTIONS (public methods)
    set(key, value) {
        this._touch("set");
        this._assertStr(key, "key");
        this.state.data.set(key, value);
        return true;
    }

    get(key, fallback = null) {
        this._touch("get");
        this._assertStr(key, "key");
        return this.state.data.has(key) ? this.state.data.get(key) : fallback;
    }

    // HELPERS
    _touch(name) {
        this.state.calls++;
        if (this.state.debug) {
            // console.log(`[debug] ${name}`);
        }
    }
    _assertStr(x, name) {
        if (typeof x !== "string") throw new TypeError(`${name} must be string`);
    }
}

/* =============================================================================
 * D) MICRO “WHAT IT CAN BE USED FOR” SUMMARY (FAST MENTAL LOOKUP)
 * =============================================================================
 *
 * Map/Set:
 *  - unique items, counts, fast membership, caching
 *
 * Two pointers:
 *  - sorted pair problems, in-place partition, duplicate removal
 *
 * Sliding window:
 *  - contiguous segment optimization with constraints (unique, <=k, sum, etc.)
 *
 * Prefix sums:
 *  - fast sum queries, subarray sum tricks, range counts
 *
 * Binary search:
 *  - insertion point, min feasible, search in sorted, param search
 *
 * BFS:
 *  - shortest steps (unweighted), layers, minimum moves
 *
 * DFS:
 *  - components, island counts, traversal, cycle detection (with color states)
 *
 * Topo sort:
 *  - dependency ordering / build systems / prerequisites
 *
 * LRU Cache:
 *  - caching with eviction, classic class-based progressive build
 *
 * Progressive class template:
 *  - any “system” coding prompt where requirements expand mid-interview
 */

/* =============================================================================
 * E) QUICK SMOKE TESTS (OPTIONAL)
 * ============================================================================= */

/**
assertDeepEq(twoSum([2,7,11,15], 9), [0,1], "twoSum");
assertEq(hasPairSumSorted([1,2,4,7], 6), true, "pairSumSorted");
assertEq(maxSumLenK([1,4,2,10,2,3,1,0,20], 4), 24, "maxSumLenK");
assertEq(lengthOfLongestSubstring("abcabcbb"), 3, "longestSubstring");
const pre = buildPrefix([2,4,6,8]);
assertEq(rangeSum(pre, 1, 3), 18, "rangeSum");
assertEq(lowerBound([1,3,3,5], 3), 1, "lowerBound");

const cache = new LRUCache(2);
cache.put(1, 1); cache.put(2, 2);
assertEq(cache.get(1), 1, "lru get 1");
cache.put(3, 3);
assertEq(cache.get(2), -1, "lru evicted 2");
 */

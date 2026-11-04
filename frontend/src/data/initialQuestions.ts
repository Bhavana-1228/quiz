import { Question } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // 1. Python OOP (from Figma brief mockup Page 6!)
  {
    id: 'py-oop-01',
    language_id: 'python',
    topic: 'OOP',
    difficulty: 'Intermediate',
    prompt: 'Which special dunder method is automatically invoked in Python to initialize an object\'s attributes when a class instance is constructed?',
    code: 'class Developer:\n    def __init__(self, name, role):\n        self.name = name\n        self.role = role',
    options: [
      { label: 'A', text: '__init__', description: 'Initializes a new object' },
      { label: 'B', text: '__main__', description: 'Runs the main module' },
      { label: 'C', text: '__str__', description: 'Returns a string representation' },
      { label: 'D', text: '__del__', description: 'Called when an object is destroyed' }
    ],
    answer: 'A',
    explanation: 'The `__init__` method serves as the constructor in Python classes. It is called immediately after an instance of the class is created by `__new__` to initialize its attributes.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'py-oop-02',
    language_id: 'python',
    topic: 'OOP',
    difficulty: 'Intermediate',
    prompt: 'What does the super() built-in function accomplish in Python class inheritance?',
    code: 'class Child(Parent):\n    def __init__(self, val):\n        super().__init__(val)',
    options: [
      { label: 'A', text: 'Instantiates a global singleton instance', description: 'Restricts inheritance' },
      { label: 'B', text: 'Delegates method calls to parent class via MRO', description: 'Method Resolution Order lookup' },
      { label: 'C', text: 'Converts instance methods into static methods', description: 'Bypasses self parameter' },
      { label: 'D', text: 'Prevents subclass from overriding parent methods', description: 'Final keyword equivalent' }
    ],
    answer: 'B',
    explanation: '`super()` returns a proxy object that delegates method calls to a parent or sibling class following the Method Resolution Order (MRO), allowing clean cooperative multiple inheritance.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'py-func-01',
    language_id: 'python',
    topic: 'Functions',
    difficulty: 'Beginner',
    prompt: 'What happens when you define a function with a mutable default argument in Python?',
    code: 'def add_item(item, basket=[]):\n    basket.append(item)\n    return basket\n\nprint(add_item("apple"))\nprint(add_item("banana"))',
    options: [
      { label: 'A', text: '["apple"], ["banana"]', description: 'A fresh list is allocated per call' },
      { label: 'B', text: '["apple"], ["apple", "banana"]', description: 'Default list persists across function calls' },
      { label: 'C', text: 'TypeError: mutable default forbidden', description: 'Python forbids mutable defaults' },
      { label: 'D', text: '["apple", "banana"], ["apple", "banana"]', description: 'Both print identical full list' }
    ],
    answer: 'B',
    explanation: 'In Python, default parameter expressions are evaluated once when the function is defined, not each time it is called. Thus, `basket` retains mutated state across calls unless initialized with `None`.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'py-basics-01',
    language_id: 'python',
    topic: 'Basics',
    difficulty: 'Beginner',
    prompt: 'What is the output of the following list slice operation in Python?',
    code: 'nums = [10, 20, 30, 40, 50]\nprint(nums[::-1])',
    options: [
      { label: 'A', text: '[50, 40, 30, 20, 10]', description: 'List reversed using step -1' },
      { label: 'B', text: '[10, 20, 30, 40, 50]', description: 'Original unmodified list' },
      { label: 'C', text: 'IndexError: slice step out of bounds', description: 'Step must be positive' },
      { label: 'D', text: '[50]', description: 'Only last element returned' }
    ],
    answer: 'A',
    explanation: 'The extended slicing syntax `[start:stop:step]` with a step of `-1` reverses the sequence from right to left without modifying the original list.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'py-ds-01',
    language_id: 'python',
    topic: 'Data Structures',
    difficulty: 'Advanced',
    prompt: 'What is the average time complexity for key lookup in a Python dictionary (hash map)?',
    options: [
      { label: 'A', text: 'O(1)', description: 'Constant amortized time lookup' },
      { label: 'B', text: 'O(log n)', description: 'Binary search tree lookup' },
      { label: 'C', text: 'O(n)', description: 'Linear scan over keys' },
      { label: 'D', text: 'O(n log n)', description: 'Sorted key traversal' }
    ],
    answer: 'A',
    explanation: 'Python dictionaries use compact hash tables with open addressing and perturbation quadratic probing, providing average O(1) amortized lookup, insertion, and deletion.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'py-algo-01',
    language_id: 'python',
    topic: 'Algorithms',
    difficulty: 'Intermediate',
    prompt: 'Which built-in algorithm is used by Python\'s sorted() and list.sort() functions?',
    options: [
      { label: 'A', text: 'Timsort', description: 'Hybrid of merge sort and insertion sort' },
      { label: 'B', text: 'Quicksort', description: 'In-place partitioning sort' },
      { label: 'C', text: 'Heapsort', description: 'Binary max-heap based sort' },
      { label: 'D', text: 'Radix Sort', description: 'Non-comparative integer sort' }
    ],
    answer: 'A',
    explanation: 'Python uses Timsort, created by Tim Peters in 2002. It combines insertion sort for small chunks (runs) and merge sort to achieve O(n) best-case on partially sorted data and O(n log n) worst-case.',
    status: 'approved',
    created_by: 'system'
  },

  // 2. JavaScript Questions
  {
    id: 'js-basics-01',
    language_id: 'javascript',
    topic: 'Basics',
    difficulty: 'Beginner',
    prompt: 'What will the following JavaScript expression evaluate to?',
    code: 'console.log(typeof null);',
    options: [
      { label: 'A', text: '"object"', description: 'Historical legacy quirk in JS engine' },
      { label: 'B', text: '"null"', description: 'Distinct primitive null type' },
      { label: 'C', text: '"undefined"', description: 'Absence of variable assignment' },
      { label: 'D', text: '"boolean"', description: 'Falsy primitive value' }
    ],
    answer: 'A',
    explanation: 'In the original implementation of JavaScript, values were represented as a type tag and a value. Objects had a tag of 0, and null was represented as a NULL pointer (0x00), hence typeof null returned "object". This behavior is preserved for backwards compatibility.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'js-func-01',
    language_id: 'javascript',
    topic: 'Functions',
    difficulty: 'Intermediate',
    prompt: 'How does an arrow function handle the `this` keyword compared to regular functions?',
    code: 'const obj = {\n  count: 10,\n  getCount: () => this.count\n};',
    options: [
      { label: 'A', text: 'Lexical this binding', description: 'Inherits this from surrounding lexical scope' },
      { label: 'B', text: 'Dynamic this binding', description: 'Binds this to caller obj at execution' },
      { label: 'C', text: 'Strict this binding', description: 'Always sets this to undefined' },
      { label: 'D', text: 'Prototype this binding', description: 'Points this to Function.prototype' }
    ],
    answer: 'A',
    explanation: 'Arrow functions do not bind their own `this`, `arguments`, `super`, or `new.target`. Instead, `this` is lexically resolved from the enclosing execution context at definition time.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'js-async-01',
    language_id: 'javascript',
    topic: 'APIs',
    difficulty: 'Intermediate',
    prompt: 'In what order are microtasks and macrotasks processed in the JavaScript Event Loop?',
    code: 'setTimeout(() => console.log("A"), 0);\nPromise.resolve().then(() => console.log("B"));\nconsole.log("C");',
    options: [
      { label: 'A', text: 'C, B, A', description: 'Sync -> Microtask Queue -> Macrotask Queue' },
      { label: 'B', text: 'C, A, B', description: 'Sync -> Timer Macrotask -> Promise Microtask' },
      { label: 'C', text: 'A, B, C', description: 'FIFO execution by declaration' },
      { label: 'D', text: 'B, C, A', description: 'Microtask preempts synchronous flow' }
    ],
    answer: 'A',
    explanation: 'Synchronous code runs first ("C"). Once the call stack is empty, the microtask queue (Promise callbacks) is drained entirely ("B") before the next macrotask (setTimeout callback "A") is executed.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'js-oop-01',
    language_id: 'javascript',
    topic: 'OOP',
    difficulty: 'Advanced',
    prompt: 'Which mechanism implements inheritance in JavaScript under the hood?',
    options: [
      { label: 'A', text: 'Prototypal chain delegation', description: '__proto__ / Object.getPrototypeOf' },
      { label: 'B', text: 'Classical class vtables', description: 'C++ style virtual method tables' },
      { label: 'C', text: 'Copy-on-write memory cloning', description: 'Deep copying methods onto instances' },
      { label: 'D', text: 'Interface casting polymorphism', description: 'Runtime byte-code structural typing' }
    ],
    answer: 'A',
    explanation: 'JavaScript uses prototypal inheritance. ES6 `class` syntax is syntactic sugar over prototype chains where objects inherit properties directly from prototype objects linked by internal `[[Prototype]]` references.',
    status: 'approved',
    created_by: 'system'
  },

  // 3. TypeScript
  {
    id: 'ts-basics-01',
    language_id: 'typescript',
    topic: 'Basics',
    difficulty: 'Beginner',
    prompt: 'What is the primary difference between `unknown` and `any` in TypeScript?',
    options: [
      { label: 'A', text: 'unknown requires type narrowing before use', description: 'Type-safe top type' },
      { label: 'B', text: 'any enforces strict null checks', description: 'Disallows null and undefined' },
      { label: 'C', text: 'unknown can only hold primitive values', description: 'Objects forbidden' },
      { label: 'D', text: 'They are identical aliases in TS compiler', description: 'No functional difference' }
    ],
    answer: 'A',
    explanation: '`unknown` is the type-safe counterpart of `any`. Anything can be assigned to `unknown`, but operations on `unknown` values require type guards, narrowing, or explicit assertions.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'ts-ds-01',
    language_id: 'typescript',
    topic: 'Data Types',
    difficulty: 'Intermediate',
    prompt: 'Which utility type constructs a type with all properties of T set to optional?',
    code: 'interface User {\n  id: string;\n  name: string;\n}\ntype DraftUser = ???<User>;',
    options: [
      { label: 'A', text: 'Partial<User>', description: 'Makes all keys optional with ?' },
      { label: 'B', text: 'Optional<User>', description: 'Hypothetical utility type' },
      { label: 'C', text: 'PickOptional<User>', description: 'Filters out required properties' },
      { label: 'D', text: 'Readonly<User>', description: 'Prevents reassignment' }
    ],
    answer: 'A',
    explanation: '`Partial<T>` maps over all keys `K in keyof T` and marks each property as optional with `[P in keyof T]?: T[P]`.',
    status: 'approved',
    created_by: 'system'
  },

  // 4. React
  {
    id: 'react-basics-01',
    language_id: 'react',
    topic: 'Frameworks',
    difficulty: 'Beginner',
    prompt: 'Why must React components and hooks follow the "Rules of Hooks" (e.g. called at top level)?',
    options: [
      { label: 'A', text: 'Preserves hook call order across re-renders', description: 'Internal linked list state tracking' },
      { label: 'B', text: 'Improves bundle minification efficiency', description: 'Tree-shaking dead code' },
      { label: 'C', text: 'Enables asynchronous multi-threaded rendering', description: 'Web Workers offloading' },
      { label: 'D', text: 'Allows React to mutate browser DOM synchronously', description: 'Direct DOM manipulation' }
    ],
    answer: 'A',
    explanation: 'React relies on the call order of hooks being consistent on every render because fiber node states are stored in an indexed linked list. Conditional hook calls desynchronize state mappings.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'react-func-01',
    language_id: 'react',
    topic: 'Functions',
    difficulty: 'Intermediate',
    prompt: 'When should `useCallback` be used in a React component?',
    options: [
      { label: 'A', text: 'Memoize function reference passed to memoized children', description: 'Prevents unnecessary child re-renders' },
      { label: 'B', text: 'Calculate heavy synchronous math formulas', description: 'Compute caching' },
      { label: 'C', text: 'Fetch external REST API data on mount', description: 'Side effect trigger' },
      { label: 'D', text: 'Directly modify DOM element references', description: 'Alternative to useRef' }
    ],
    answer: 'A',
    explanation: '`useCallback(fn, deps)` caches an instance of a function across re-renders, preventing referential changes that would cause memoized child components (`React.memo`) to re-render unnecessarily.',
    status: 'approved',
    created_by: 'system'
  },

  // 5. Rust
  {
    id: 'rust-basics-01',
    language_id: 'rust',
    topic: 'Basics',
    difficulty: 'Intermediate',
    prompt: 'What are the two core rules of Rust\'s borrow checker regarding references?',
    options: [
      { label: 'A', text: 'Multiple immutable (&T) OR exactly one mutable (&mut T)', description: 'Prevents data races at compile time' },
      { label: 'B', text: 'Always pass values on heap using Box<T>', description: 'Stack allocations forbidden' },
      { label: 'C', text: 'Pointers must be manually freed with free()', description: 'C style memory tracking' },
      { label: 'D', text: 'References cannot cross function boundaries', description: 'Local lifetime limitation' }
    ],
    answer: 'A',
    explanation: 'At any given time, you can have either one mutable reference or any number of immutable references to a resource, and references must always be valid. This guarantees thread safety and prevents race conditions at compile time.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'rust-oop-01',
    language_id: 'rust',
    topic: 'OOP',
    difficulty: 'Advanced',
    prompt: 'How does Rust achieve polymorphism without classical class inheritance?',
    options: [
      { label: 'A', text: 'Traits and trait objects (dyn Trait)', description: 'Static dispatch or dynamic vtables' },
      { label: 'B', text: 'Prototypes with duck typing', description: 'Runtime method lookup' },
      { label: 'C', text: 'Multiple inheritance classes', description: 'Virtual base classes' },
      { label: 'D', text: 'Macro expansion copy-pasting', description: 'Textual code repetition' }
    ],
    answer: 'A',
    explanation: 'Rust uses `trait` definitions to specify shared behavior. Code can use static dispatch with generics (monomorphization) or dynamic dispatch with trait objects `Box<dyn Trait>` using virtual method tables.',
    status: 'approved',
    created_by: 'system'
  },

  // 6. Go
  {
    id: 'go-basics-01',
    language_id: 'go',
    topic: 'Basics',
    difficulty: 'Beginner',
    prompt: 'What does the `go` keyword do before a function invocation in Golang?',
    code: 'go processOrder(orderId)',
    options: [
      { label: 'A', text: 'Spawns a concurrent lightweight goroutine', description: 'Managed by Go runtime scheduler' },
      { label: 'B', text: 'Compiles the function into WebAssembly', description: 'WASM ahead-of-time export' },
      { label: 'C', text: 'Executes the function inside an isolated OS process', description: 'fork() system call' },
      { label: 'D', text: 'Marks the function as deprecated', description: 'Linter warning' }
    ],
    answer: 'A',
    explanation: 'The `go` keyword starts the execution of the function call as an independent concurrent thread of control, known as a goroutine, within the same address space with only a few kilobytes of stack memory.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'go-ds-01',
    language_id: 'go',
    topic: 'Data Structures',
    difficulty: 'Intermediate',
    prompt: 'What is the relationship between a slice and an underlying array in Go?',
    options: [
      { label: 'A', text: 'A slice is a 3-word header: pointer, length, and capacity', description: 'Window view over underlying array' },
      { label: 'B', text: 'Slices copy all array items by value', description: 'Independent duplicate buffer' },
      { label: 'C', text: 'Slices are doubly-linked lists on heap', description: 'Non-contiguous node chains' },
      { label: 'D', text: 'Arrays are dynamically resized slices', description: 'Resizable array structure' }
    ],
    answer: 'A',
    explanation: 'A Go slice is a small descriptor containing a pointer to an element of an array, the slice length `len`, and its capacity `cap`. Slicing another slice shares the same backing array storage.',
    status: 'approved',
    created_by: 'system'
  },

  // 7. Java
  {
    id: 'java-oop-01',
    language_id: 'java',
    topic: 'OOP',
    difficulty: 'Beginner',
    prompt: 'Which access modifier in Java restricts visibility strictly to the enclosing class?',
    options: [
      { label: 'A', text: 'private', description: 'Visible only within defining class' },
      { label: 'B', text: 'protected', description: 'Visible to package and subclasses' },
      { label: 'C', text: 'public', description: 'Visible everywhere' },
      { label: 'D', text: 'default (package-private)', description: 'Visible only within same package' }
    ],
    answer: 'A',
    explanation: '`private` is Java\'s most restrictive access modifier. Private members cannot be accessed directly by subclasses or other classes in the same package.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'java-ds-01',
    language_id: 'java',
    topic: 'Data Structures',
    difficulty: 'Intermediate',
    prompt: 'What data structure does Java\'s HashMap transition to in Java 8+ when hash collisions exceed a bucket threshold (TREEIFY_THRESHOLD = 8)?',
    options: [
      { label: 'A', text: 'Red-Black Tree', description: 'Improves worst-case lookup from O(n) to O(log n)' },
      { label: 'B', text: 'B-Tree', description: 'Disk-friendly balanced search tree' },
      { label: 'C', text: 'SkipList', description: 'Probabilistic layered linked list' },
      { label: 'D', text: 'Sorted Array', description: 'Contiguous binary searchable block' }
    ],
    answer: 'A',
    explanation: 'In Java 8, when a bucket has more than 8 elements and the table capacity is at least 64, the linked list is transformed into a balanced Red-Black Tree (`TreeNode`), preventing hash collision DoS attacks.',
    status: 'approved',
    created_by: 'system'
  },

  // 8. SQL
  {
    id: 'sql-db-01',
    language_id: 'sql',
    topic: 'Databases',
    difficulty: 'Beginner',
    prompt: 'What is the key difference between WHERE and HAVING clauses in SQL queries?',
    options: [
      { label: 'A', text: 'WHERE filters rows before aggregation; HAVING filters aggregated groups', description: 'Execution order difference' },
      { label: 'B', text: 'WHERE is only used for numerical values; HAVING for strings', description: 'Data type restriction' },
      { label: 'C', text: 'HAVING is only supported in NoSQL dialect', description: 'Dialect difference' },
      { label: 'D', text: 'WHERE sorts records; HAVING paginates them', description: 'Sorting vs limits' }
    ],
    answer: 'A',
    explanation: 'The `WHERE` clause filters individual records before any groupings are made. The `HAVING` clause filters summary groups created by the `GROUP BY` clause using aggregate functions like `COUNT()` or `SUM()`.',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'sql-db-02',
    language_id: 'sql',
    topic: 'Databases',
    difficulty: 'Intermediate',
    prompt: 'What property does the ACID acronym guarantee in database transactions?',
    options: [
      { label: 'A', text: 'Atomicity, Consistency, Isolation, Durability', description: 'Core transactional integrity guarantees' },
      { label: 'B', text: 'Asynchronous, Clustered, Indexed, Distributed', description: 'Hardware architecture characteristics' },
      { label: 'C', text: 'Availability, Compression, In-memory, Dynamic', description: 'Performance optimization metrics' },
      { label: 'D', text: 'Authorized, Cached, Immutable, Deterministic', description: 'Security access protocols' }
    ],
    answer: 'A',
    explanation: 'ACID guarantees that database transactions are processed reliably: Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent safety), and Durability (committed data survives crashes).',
    status: 'approved',
    created_by: 'system'
  },

  // 9. C / C++
  {
    id: 'c-basics-01',
    language_id: 'c',
    topic: 'Basics',
    difficulty: 'Intermediate',
    prompt: 'In C, what is the value of `*ptr` after the following snippet executes?',
    code: 'int arr[] = {10, 20, 30};\nint *ptr = arr;\nptr++;\nprintf("%d", *ptr);',
    options: [
      { label: 'A', text: '20', description: 'Pointer advances by sizeof(int) bytes to second element' },
      { label: 'B', text: '11', description: 'Increments the value pointed to' },
      { label: 'C', text: '10', description: 'Dereferences unchanged initial value' },
      { label: 'D', text: 'Segmentation fault', description: 'Invalid memory access' }
    ],
    answer: 'A',
    explanation: 'Pointer arithmetic in C steps by the size of the underlying type. `ptr++` moves the pointer to point to the next integer in memory (`arr[1]`, which is 20).',
    status: 'approved',
    created_by: 'system'
  },
  {
    id: 'cpp-oop-01',
    language_id: 'cpp',
    topic: 'OOP',
    difficulty: 'Advanced',
    prompt: 'What is the purpose of declaring a destructor `virtual` in a C++ base class?',
    code: 'class Base {\npublic:\n    virtual ~Base();\n};',
    options: [
      { label: 'A', text: 'Ensures derived class destructors are called when deleted via base pointer', description: 'Prevents resource and memory leaks' },
      { label: 'B', text: 'Forces the class to become an abstract pure interface', description: 'Disallows direct instantiation' },
      { label: 'C', text: 'Allocates the object memory in garbage-collected heap', description: 'Automatic memory management' },
      { label: 'D', text: 'Allows the destructor to accept input arguments', description: 'Overloaded destructors' }
    ],
    answer: 'A',
    explanation: 'If a derived class object is deleted through a pointer to the base class, and the base class destructor is not virtual, the behavior is undefined (typically only the base destructor runs, causing leaks of derived resources).',
    status: 'approved',
    created_by: 'system'
  },

  // 10. Bash / Shell
  {
    id: 'bash-basics-01',
    language_id: 'bash',
    topic: 'Basics',
    difficulty: 'Beginner',
    prompt: 'What does `2>&1` signify in standard Unix shell redirection?',
    code: 'command > output.log 2>&1',
    options: [
      { label: 'A', text: 'Redirects standard error (file descriptor 2) into standard output (1)', description: 'Merges stdout and stderr into output.log' },
      { label: 'B', text: 'Runs the command twice in parallel', description: 'Forking duplicate tasks' },
      { label: 'C', text: 'Pipes exit status code 2 to program 1', description: 'Signal communication' },
      { label: 'D', text: 'Compares file descriptor 2 with 1', description: 'Conditional check' }
    ],
    answer: 'A',
    explanation: '`2` is the file descriptor for stderr, and `1` is stdout. `2>&1` redirects standard error to wherever standard output is currently directed, enabling unified logging.',
    status: 'approved',
    created_by: 'system'
  },

  // 11. Node.js
  {
    id: 'node-basics-01',
    language_id: 'nodejs',
    topic: 'APIs',
    difficulty: 'Intermediate',
    prompt: 'Which underlying C library provides Node.js with its asynchronous I/O and cross-platform event loop?',
    options: [
      { label: 'A', text: 'libuv', description: 'Multi-platform support library focusing on asynchronous I/O' },
      { label: 'B', text: 'V8', description: 'Google JavaScript compiler engine' },
      { label: 'C', text: 'c-ares', description: 'Asynchronous DNS resolver' },
      { label: 'D', text: 'OpenSSL', description: 'Cryptographic library' }
    ],
    answer: 'A',
    explanation: '`libuv` is the C library responsible for abstracting the event loop, thread pool, network sockets, file system polling, and child processes in Node.js.',
    status: 'approved',
    created_by: 'system'
  }
];


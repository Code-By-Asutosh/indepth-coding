import { ConceptContent } from '../../models/content.model';

export const JAVA_COLLECTIONS: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'java-collections',
  title: 'Java Collections',

  hook:
    'You swap one line - `new ArrayList<>()` becomes `new LinkedList<>()` - expecting nothing to change except maybe a ' +
    'tiny bit of memory. Instead, your endpoint that inserts into the middle of a 100,000-item list goes from instant to ' +
    'visibly slow. You used the "same" list. What happened?',

  problem:
    'Every Collections implementation makes a different, deliberate trade-off between read speed, insert speed, memory ' +
    "overhead, and ordering guarantees. Treating \"List\" as one interchangeable thing (because they all implement `List`) " +
    "means you have no idea which operations are cheap and which are secretly O(n) until production load finds out for you.",

  aha: {
    statement: "Choosing a collection is choosing which operation you're willing to make slow - there is no collection that is fast at everything.",
    analogy:
      "An ArrayList is like a numbered parking garage - jumping straight to space #47 is instant, but squeezing a new car " +
      "into space #10 means shifting every car after it down one spot. A LinkedList is like a chain of people holding hands " +
      "in a line - inserting a new person anywhere is instant (just relink two hands), but finding \"the 47th person\" means " +
      "walking the whole chain from the start, one hand at a time."
  },

  underTheHood: [
    'ArrayList is backed by a resizable array: get(index) is O(1) (direct memory offset), but insert/remove in the middle is O(n) because every following element must shift.',
    'LinkedList is a doubly-linked list of nodes: insert/remove at a known node is O(1), but get(index) is O(n) because it must walk from the head or tail.',
    'HashMap stores entries in buckets by hashCode(): get/put are O(1) average case, but iteration order is unspecified and can change between runs - never rely on HashMap ordering.',
    'LinkedHashMap is a HashMap that also maintains a doubly-linked list through entries in insertion (or access) order - same O(1) performance as HashMap, plus predictable iteration order.',
    'TreeMap keeps entries sorted by key at all times (via a red-black tree), giving O(log n) get/put instead of O(1) - you pay a real performance cost for automatic sorting.',
    'HashSet is literally a HashMap under the hood (values are a dummy placeholder) - every performance characteristic of HashMap applies directly to HashSet.'
  ],

  diagrams: [
    {
      mermaid:
        'flowchart TD\n' +
        '  Collection --> List\n' +
        '  Collection --> Set\n' +
        '  Collection --> Queue\n' +
        '  List --> ArrayList\n' +
        '  List --> LinkedList\n' +
        '  Set --> HashSet\n' +
        '  Set --> LinkedHashSet\n' +
        '  Set --> TreeSet\n' +
        '  Queue --> ArrayDeque\n' +
        '  Map["Map (separate hierarchy)"] --> HashMap\n' +
        '  Map --> LinkedHashMap\n' +
        '  Map --> TreeMap',
      caption: 'Map is deliberately NOT part of the Collection hierarchy - a common quiz question in itself.'
    }
  ],

  inTheWild: [
    'A "remove items matching a condition from the middle of a huge list" batch job that\'s mysteriously slow - almost always an ArrayList being used where a LinkedList (or a different algorithm entirely) would fit the access pattern.',
    'A HashMap being iterated and the output order "randomly" changing between app restarts - this is not a bug, HashMap never promised ordering; LinkedHashMap or TreeMap is the fix if order matters.',
    'Interview question: "When would you choose LinkedList over ArrayList?" - the honest, correct answer is "almost never in modern Java" (ArrayList\'s cache-friendly memory layout usually wins in practice even for many inserts) unless you specifically need O(1) insert/remove at BOTH ends, which is what ArrayDeque is actually built for.'
  ],

  showMe: {
    caption: 'Repeated middle-insertion into an ArrayList vs the same operation using a structure suited to it.',
    bad: {
      language: 'java',
      code:
        'List<Integer> queue = new ArrayList<>();\n' +
        'for (int i = 0; i < 100_000; i++) {\n' +
        '    queue.add(0, i); // insert at the FRONT - shifts every existing element right, every time\n' +
        '}',
      explanation:
        'Inserting at index 0 of an ArrayList is O(n) because every existing element must shift one slot to the right - ' +
        'doing this 100,000 times is effectively O(n²), which is why this "simple" loop can take seconds instead of milliseconds.'
    },
    good: {
      language: 'java',
      code:
        'Deque<Integer> queue = new ArrayDeque<>();\n' +
        'for (int i = 0; i < 100_000; i++) {\n' +
        '    queue.addFirst(i); // O(1) at both ends, no shifting required\n' +
        '}',
      explanation:
        'ArrayDeque is purpose-built for O(1) insertion/removal at BOTH ends using a circular buffer - the exact access ' +
        'pattern that made ArrayList slow here is the textbook use case ArrayDeque was designed for.'
    }
  },

  impact: {
    before: 'Inserting 100,000 items at the front of an ArrayList: effectively O(n²), taking seconds.',
    after: 'The same operation using ArrayDeque: O(n) total, taking milliseconds.',
    metric: 'For large N, this is not a "slightly faster" difference - it is the difference between milliseconds and an operation that visibly hangs a request.'
  },

  alternatives: [
    {
      name: 'ArrayList',
      whenToUse: 'The default choice for almost all lists - fast random access, cache-friendly, and appends at the end are amortized O(1).',
      whenNotToUse: 'Frequent inserts/removes in the MIDDLE of a large list, or frequent inserts at the front.'
    },
    {
      name: 'LinkedList',
      whenToUse: 'You need O(1) insert/remove given an existing iterator position (rare in practice) - otherwise ArrayDeque usually wins even for queue/stack use cases.',
      whenNotToUse: "Almost always avoid it as a default 'List' choice - its per-node memory overhead and poor CPU cache locality make it slower than ArrayList in most real benchmarks, despite the Big-O theory."
    },
    {
      name: 'HashMap / HashSet',
      whenToUse: "You need fast lookup and don't care about iteration order.",
      whenNotToUse: 'You need predictable iteration order (use LinkedHashMap/LinkedHashSet) or sorted order (use TreeMap/TreeSet).'
    },
    {
      name: 'TreeMap / TreeSet',
      whenToUse: 'You need keys/elements always sorted, or need range queries (e.g. "everything between X and Y").',
      whenNotToUse: 'You just need fast lookup and do not need sorting - TreeMap\'s O(log n) is strictly slower than HashMap\'s O(1) for that case.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Relying on HashMap iteration order being "consistent" because it happened to look stable in testing.',
      why:
        "HashMap's iteration order depends on hash bucket layout, which can change based on insertion order, resizing, and " +
        "even JVM version - it happening to look stable in a small test is coincidence, not a guarantee, and it can silently " +
        "change after a JDK upgrade or once the map grows past a resize threshold.",
      fix:
        'Use LinkedHashMap if you need insertion-order iteration, or TreeMap if you need sorted-order iteration - never depend on plain HashMap ordering.'
    }
  ],

  proveIt: {
    question:
      'You need a collection that supports fast (O(1)) insertion and removal at BOTH the front and back, and you never ' +
      'need to access elements by index in the middle. Which built-in collection fits best, and why not ArrayList or LinkedList?',
    answer:
      'ArrayDeque - it gives O(1) at both ends via a circular buffer with better cache locality than LinkedList, and you ' +
      "don't need ArrayList's O(1) random-access-by-index since the requirement never needs middle access."
  },

  oneLiner: 'Every collection is fast at something and slow at something else - pick based on your actual access pattern, not habit.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'generics',
      title: 'Generics',
      note: 'Every collection type here is generic (List<T>, Map<K,V>) - Generics is what makes these collections type-safe without needing a separate IntList/StringList class for every type.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'streams',
      title: 'Streams',
      note: 'Streams are usually built ON TOP of a collection - understanding the underlying collection\'s performance characteristics still matters even when you process it with a stream pipeline.'
    },
    {
      categoryId: 'dsa',
      topicId: 'dsa-patterns',
      conceptId: 'arrays',
      title: 'Arrays (DSA)',
      note: "The ArrayList-vs-LinkedList trade-off shown here is a specific, real-world instance of the general array-vs-linked-list trade-off covered in the DSA fundamentals."
    }
  ]
};

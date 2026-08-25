import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Collections Mastery -> ArrayList & LinkedList Internals.
 * What actually happens in memory on add(), why ArrayList grows by 1.5x,
 * and the cache-locality argument that ends the ArrayList-vs-LinkedList debate.
 */
export const ARRAYLIST_LINKEDLIST_INTERNALS: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'collections-mastery',
  conceptId: 'arraylist-linkedlist-internals',
  title: 'ArrayList & LinkedList Internals',
  topicType: 'data-structure',

  simpleIntuition:
    'ShopSphere needs an order feed: every order ever placed, newest at the bottom, rendered page by page. Asutosh proposes a LinkedList - "we append constantly, is that not what linked lists are for?" Riya opens the source code instead of guessing. Inside ArrayList she finds not magic but a plain array plus one integer counting size - an array that quietly buys bigger real estate when full, moves house, and keeps going. That single picture - array + size + growth policy - answers almost every ArrayList question interviewers ask.',

  formalMeaning:
    'ArrayList is a resizable-array implementation of List: element storage is one contiguous Object[] array, with an internal size field tracking logical length. Appends run in amortized constant time because capacity grows geometrically (1.5x in Java) via Arrays.copyOf. LinkedList is a doubly-linked list implementation of both List and Deque: each element lives in a Node holding item, next and prev references; positional access requires traversal from the nearer end. The trade is contiguous memory (speed, cache locality) versus node links (O(1) splicing at known positions).',

  whyItExists:
    'Raw Java arrays are fixed-length - declare 10 slots, and order number 11 crashes the platform. Wrapping that pain, ArrayList automates the boring dance every C programmer once wrote manually: check capacity, allocate a bigger array, copy everything over, continue. LinkedList exists for the opposite shape of problem - structures where you frequently insert or remove at known positions (a hand-held node reference) and never want a wholesale shift. Knowing which pain each class automates tells you when neither is right - ArrayDeque for queues, HashMap for lookups - which is precisely the judgment Round 2 probes.',

  howItWorksInternally: [
    'Construction: new ArrayList<>() does NOT immediately allocate 10 slots. elementData starts as a shared empty array; the default-capacity array is allocated lazily on your first add() - so millions of empty lists stay cheap.',
    'add(e): first checks capacity. If size == elementData.length, growth kicks in: newCapacity = oldCapacity + (oldCapacity >> 1) - a 1.5x multiplier - then Arrays.copyOf copies elements into the fresh array. After ensuring room, it writes elementData[size++] = e. O(1) amortized.',
    'Why 1.5x and not 2x or +10? Geometric growth keeps total copy work across N inserts proportional to N (that is the "amortized" part). 1.5 reuses freed blocks from earlier generations more gracefully than 2x - memory-friendlier while keeping the same asymptotics. (Python lists grow ~1.125x, C++ vector ~2x - the lesson is geometric, the constant is taste.)',
    'get(index): literally return elementData[index] after a range check. One array offset calculation - this is why random access is O(1), and why the RandomAccess marker interface exists.',
    'remove(int index): System.arraycopy shifts EVERYTHING after index one slot left, then nulls the last slot for garbage collection. Middle removals are O(n) - the hidden cost behind "just remove it from the list".',
    'LinkedList get(i): traverses from head or tail, whichever is closer - node(i) checks if index < (size >> 1). Still O(n/2) = O(n), just with a smaller constant. "It optimizes traversal" is true and irrelevant to big-O - say both.',
    'The CPU-cache argument that wins debates: a contiguous array streams into CPU cache lines, so even its linear scans are blisteringly fast in practice. LinkedList nodes can be scattered anywhere on the heap - every hop is a pointer chase the prefetcher cannot predict. Real benchmarks routinely show ArrayList beating LinkedList at LIST tasks by wide margins.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    subgraph AL["ArrayList - one contiguous array"]\n    direction LR\n    A0["order#1"] --- A1["order#2"] --- A2["order#3"] --- A3[null] --- A4[null]\n    end\n    S["size = 3, capacity = 5"] --- AL\n    FULL["add when full"] --> GROW["allocate 1.5x new array<br/>copy all elements"]\n    GROW --> AL2["new contiguous array<br/>capacity 7, same contents"]',
      caption: 'ArrayList in one image: plain array + size counter + geometric growth. Index math does the rest.'
    },
    {
      mermaid: 'flowchart TD\n    subgraph LL["LinkedList - scattered nodes"]\n    N1["node: order#1"] <--> N2["node: order#2"] <--> N3["node: order#3"]\n    end\n    H["first"] --- N1\n    T["last"] --- N3\n    GET["get(1000)"] --> WALK["walk from closer end<br/>~n/2 hops worst case"]',
      caption: 'LinkedList: every element pays for two pointers, and reaching position i means walking there.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - ArrayList is a theater row with ushers who move you down: fixed seats, instant access to seat 37, but inserting someone mid-row shuffles everyone after them - and when the row fills they build a row 1.5x longer next door and walk everyone over. LinkedList is a treasure hunt: each clue points to the next; adding a clue between two others is trivial IF you already hold both, but finding clue #1000 means following 999 arrows.',
    'modCount - the fail-fast counter: structural changes bump an internal modification count. Iterators snapshot it and throw ConcurrentModificationException if it drifts mid-iteration. Same mechanism as HashMap - covered fully in the fail-fast lesson.',
    'trimToSize() shrinks capacity to size - niche, but knowing it exists signals you read the class, not a blog about it.',
    'ArrayDeque - the correct answer when the need is queue/deque behavior: circular-array implementation, no per-node overhead, officially recommended over Stack and preferred over LinkedList for queuing.',
    'CopyOnWriteArrayList - the concurrency escape hatch: every mutation clones the whole array; readers never lock, writers pay copy cost. Right only for tiny, read-mostly, thread-shared lists.'
  ],

  realWorldExamples: [
    'ShopSphere order feed: ArrayList<Order> - append-dominated workload with occasional middle deletions on cancellations; 1.5x growth means roughly log2(N) reallocations ever, invisible at realistic scale.',
    'Shopping cart lines: also ArrayList - UI needs positional rendering and quantity updates by index; carts are small so shifting costs nothing.',
    'Interview reality: "Why is ArrayList insertion O(n)?" separates candidates who used the class from those who can explain the shift. Follow-ups chain: growth factor → amortized meaning → modCount → CopyOnWriteArrayList. Each answer earns the next question.'
  ],

  complexityAndTradeoffs: [
    'ArrayList: get/set O(1); add at end amortized O(1); add/remove at index O(n) shift; contains O(n) scan; memory tight - one reference per slot, no per-node headers.',
    'LinkedList: add/remove at HEAD/TAIL O(1); get(i) O(n) walk; insert at held node O(1) splice; memory heavy - every element carries two references plus object header (~40 bytes vs ~8 for typical objects in an array).',
    'Practical verdict: default ArrayList; ArrayDeque for FIFO/LIFO; LinkedList reserved for rare splicing-at-known-node designs or Deque duty in legacy code.',
    'Pre-sizing lever: expecting 10,000 orders? new ArrayList<>(10_000) skips ~14 growth copies. Micro-win, but mentioning it shows you know where the cost lives.'
  ],

  commonMistakes: [
    'Removing items from an ArrayList inside a for-each loop. Looks harmless - compiles fine, often passes tests with small data. Hurts because it throws ConcurrentModificationException under modCount detection... or worse, silently skips elements when removing by raw index while the loop counter advances. Fix: iterate with an explicit Iterator and call iterator.remove(), or collect victims and use list.removeAll(victims), or in modern Java list.removeIf(o -> ...).',
    'Claiming "LinkedList gives O(1) inserts" unprompted. Hurts because the interviewer asks "O(1) from WHAT?" - only if you already hold the Node reference, which the public API rarely hands you; add(i, e) must first WALK to i. Fix: state the full sentence - cheap splicing, expensive reaching.',
    'Using new ArrayList<>(hugeNumber) defensively "for performance" on lists that end up nearly empty. Wastes heap for nothing. Fix: pre-size from measured expected counts, not fear.'
  ],

  scenarioDrills: [
    {
      situation:
        'Production alert on ShopSphere: the order-export job throws ConcurrentModificationException intermittently - only when cancellations arrive during export. The offending line: for (Order o : orders) { if (o.isCancelled()) { orders.remove(o); } }.',
      question: '"Explain why this crashes only sometimes, and give me two safe fixes."',
      answer:
        'Why intermittent: the for-each uses an Iterator that compares its expectedModCount snapshot against the list modCount on every next(). Removing through the LIST directly bumps modCount without updating the iterator, so the NEXT next() detects drift and throws - but only if a cancellation actually lands mid-loop, hence "sometimes", and small test data often finishes before any cancellation arrives, hiding it in QA. Why it is dangerous beyond the exception: even where no exception fires, index-based removal inside a manual loop skips the element right after each removed one. Fix 1 (minimal change): obtain Iterator explicitly and call iterator.remove() - it removes without invalidating the iteration and updates both counters coherently. Fix 2 (modern): orders.removeIf(Order::isCancelled) - same semantics, intent-readable, single atomic pass. I would also ask whether removal belongs in the export job at all - filtering at query time ("WHERE NOT cancelled") removes the whole class of bug.'
    },
    {
      situation:
        'A teammate replaces ArrayList<String> with LinkedList<String> in the notification pipeline "because we insert between pending notifications constantly", and latency dashboards get WORSE.',
      question: '"What do you check first, and how do you reason about the regression?"',
      answer:
        'First thing I check is what "insert between" means in the code path: if the code calls list.add(i, x) by INDEX, LinkedList must walk to i on every insert - O(n) reach defeats the O(1) splice it was chosen for, and each hop is a cache-hostile pointer dereference. Meanwhile ArrayList pays one System.arraycopy per insert - a single memmove over contiguous memory, which CPUs execute extremely fast for moderate sizes. So the regression mechanism is: pointer-chasing replaced a bulk memcpy. My reasoning order would be: measure (confirm the hot path), fix structure (if true midpoint splicing with held iterators is real, a LinkedBlockingDeque or explicit node structure might fit; otherwise revert to ArrayList), and challenge the requirement - pipelines usually want QUEUES, so ArrayDeque/BlockingQueue is my default recommendation, not either List.'
    }
  ],

  rapidFire: [
    {
      question: 'What is the underlying data structure of ArrayList?',
      answer:
        'A single resizable Object[] array plus a size field - capacity grows lazily by 1.5 times using Arrays.copyOf when full.'
    },
    {
      question: 'What is the default initial capacity of ArrayList and when is it allocated?',
      answer:
        'Ten, allocated lazily on the first add - construction keeps a shared empty array until elements exist.'
    },
    {
      question: 'Time complexity of ArrayList.get vs LinkedList.get?',
      answer:
        'ArrayList get is O(1) direct indexing; LinkedList get is O(n) traversal from the nearer end.'
    },
    {
      question: 'Why is ArrayList add called amortized O(1)?',
      answer:
        'Individual adds occasionally trigger a full array copy during resize, but geometric 1.5x growth spreads that cost across all prior appends, making average cost constant.'
    },
    {
      question: 'Which class should replace java.util.Stack?',
      answer:
        'ArrayDeque - faster, no legacy synchronization, and a proper Deque interface.'
    },
    {
      question: 'When is LinkedList genuinely preferable?',
      answer:
        'Rarely - mainly when you hold Node/iterator references and splice frequently at those positions, or as an existing Deque in older code; otherwise ArrayList or ArrayDeque win on memory and cache locality.'
    },
    {
      question: 'What is CopyOnWriteArrayList and when do you use it?',
      answer:
        'A thread-safe List that clones the backing array on every write so readers need no locking - ideal for small, read-heavy, rarely-mutated shared lists like listener registries.'
    }
  ],

  interviewPerspective:
    'This topic opens with "internal data structure?" and escalates: growth factor → why geometric → what amortized means → why remove is O(n) → how fail-fast works → when LinkedList ever wins. The winning posture is mechanism-first honesty: "ArrayList wins lists because contiguity beats pointers on real CPUs" lands better than reciting big-O tables. If they push "so delete LinkedList?", show balance: Deque duties and true splicing - then note ArrayDeque covers most of that too.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'hashmap-internals',
      title: 'HashMap Internals',
      note: 'Next lesson - the same internals-first treatment for the most-asked structure of all.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'concurrenthashmap-fail-fast',
      title: 'ConcurrentHashMap & Fail-Fast',
      note: 'Where modCount, ConcurrentModificationException and their concurrent-world alternatives get the full story.'
    }
  ],

  triggerSentence:
    'An array wearing a growth policy - and a treasure hunt that pays rent only when you already hold the clues.'
};

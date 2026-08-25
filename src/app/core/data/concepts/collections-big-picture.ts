import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Collections Mastery -> Collections Big Picture.
 * The map of the whole framework: which interface exists, why, and how to
 * choose in 10 seconds - the question that opens almost every collections
 * conversation.
 */
export const COLLECTIONS_BIG_PICTURE: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'collections-mastery',
  conceptId: 'collections-big-picture',
  title: 'Collections Big Picture',
  topicType: 'data-structure',

  simpleIntuition:
    'Riya starts building ShopSphere and immediately faces four embarrassingly simple needs: keep the cart items in the order the shopper added them, never allow the same SKU twice in a category listing, find a product instantly by its SKU code, and serve support tickets oldest-first. Four needs, four different shapes of holding data. The Collections Framework is just Java saying: "I noticed these shapes too - here is a ready-made container for each, with a common language across all of them."',

  formalMeaning:
    'The Java Collections Framework is a unified architecture in java.util for representing and manipulating groups of objects. Its root interfaces describe capabilities - List (ordered, index-accessible, duplicates allowed), Set (no duplicates), Queue/Deque (ordering for processing), and Map (key-to-value associations, technically not a Collection but part of the framework). Concrete classes are implementations trading off speed, memory, and ordering guarantees behind those contracts.',

  whyItExists:
    'Before it existed, holding "a group of things" meant raw arrays plus hand-written loops for every operation - resize logic, duplicate checks, sorted insertion, each re-implemented badly per team. Worse, every utility class had its own method names, so nothing composed. The framework exists so that data structures follow interface contracts: your business code depends on List or Map, and the implementation underneath can change without touching callers. That separation - contract vs implementation - is itself an interview theme you will reuse when microservices come up.',

  howItWorksInternally: [
    'The root is Iterable - anything you can run a for-each loop over. Collection extends it and adds the shared verbs: add, remove, contains, size, isEmpty.',
    'List extends Collection and adds positional power: get(index), add(index, e), indexOf. Contracts: sequence matters, duplicates fine, random access expected to be fast on typical implementations like ArrayList.',
    'Set extends Collection with one rule enforced through equals/hashCode: an element can appear once. No indexes - asking "the third element of a Set" exposes a design misunderstanding.',
    'Queue and Deque extend Collection for processing order: FIFO via offer/poll/peek, or both ends with Deque (addFirst/addLast/pollFirst/pollLast). PriorityQueue bends this by ordering elements by priority instead of arrival time.',
    'Map sits beside the tree, deliberately NOT extending Collection - because a mapping is not an element. It offers three collection views instead: keySet(), values(), entrySet().',
    'Under the hood most names repeat one trick: HashSet wraps a HashMap, TreeSet wraps a TreeMap, LinkedHashSet wraps a LinkedHashMap. Learn the Map internals deeply once and half the Set family explains itself.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    IT["Iterable<br/>for-each possible"] --> C["Collection<br/>add / remove / contains / size"]\n    C --> L["List<br/>order + indexes + duplicates"]\n    C --> S["Set<br/>no duplicates"]\n    C --> Q["Queue / Deque<br/>processing order"]\n    L --> AL["ArrayList<br/>fast random access"]\n    L --> LL["LinkedList<br/>also Deque"]\n    S --> HS["HashSet<br/>hash buckets"]\n    S --> LHS["LinkedHashSet<br/>insertion-order iteration"]\n    S --> TS["TreeSet<br/>sorted, red-black tree"]\n    Q --> PQ["PriorityQueue<br/>binary heap"]\n    M["Map &lt;K,V&gt;<br/>key to value - separate tree"] --> HM["HashMap"]\n    M --> TM["TreeMap<br/>sorted keys"]\n    M --> CHM["ConcurrentHashMap"]',
      caption: 'One trunk (Iterable/Collection), three capability branches, and Map standing beside them by design.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - the framework is a kitchen storage system: List is an egg tray (fixed positions, duplicates fine), Set is a badge scanner at the door (same face never enters twice), Queue is the counter line (whoever came first gets served), Map is the coat-check wall (hand over a token, get exactly your item back).',
    'THE 10-SECOND CHOICE - ask exactly two questions. Question 1: duplicates allowed? If no, you are in Set (or Map keys). Question 2: does position matter? Need index/order → List; need lookup-by-key → Map; need first-in-first-out or priority → Queue. Everything else is picking the implementation for speed.',
    'Legacy corner (Lane 3 only): Vector and Stack are synchronized pre-Collections classes - Vector replaced by ArrayList, Stack by ArrayDeque. Hashtable is the synchronized ancestor of HashMap, replaced by ConcurrentHashMap. Say that sentence if asked and move on - they are asked precisely to check you know what NOT to use.',
    'Arrays vs Collections: arrays are fixed-length and lack algorithms; Arrays.asList() gives a fixed-size view (add/remove unsupported - a classic trap), while new ArrayList<>(Arrays.asList(...)) gives the real thing.',
    'Immutability helpers from Java 9+: List.of/Set.of/Map.of create unmodifiable snapshots - perfect for constants, they throw on mutation attempts.'
  ],

  realWorldExamples: [
    'ShopSphere cart: ArrayList<CartItem> - order preserved, duplicates legal (two identical mugs), index access for UI rendering.',
    'ShopSphere catalog dedupe: Set<String> visitedSkus while syncing supplier feeds so the same product never imports twice.',
    'ShopSphere checkout: HashMap<String, Product> keyed by SKU - the product page cannot afford a linear scan over a million products.',
    'Interview opener reality: "Which collection would you pick for X?" is often the FIRST collections question - the interviewer grades your two-question reflex before any internals discussion.'
  ],

  complexityAndTradeoffs: [
    'ArrayList: get O(1), append amortized O(1), insert/remove mid-list O(n) due to shifting - default choice for sequences.',
    'HashMap: put/get/containsKey O(1) average, O(log n) worst case after treeification of a bucket - default choice for lookups.',
    'TreeMap/TreeSet: O(log n) operations but sorted iteration and range queries (ceilingKey, subMap) no hash structure can offer - pay log-n only when you need order.',
    'LinkedList: O(1) node splice but O(n) reach-by-index plus heavy per-node memory and terrible CPU cache behavior - loses to ArrayDeque even as a queue; choose it mainly when you already hold a Node reference.',
    'Use Set-of when: constant unique data (roles, whitelists). Avoid mutable-state assumptions around it: unmodifiable does not mean immutable view of a live backing list unless you copy first.'
  ],

  commonMistakes: [
    'Saying "ArrayList is always better than LinkedList" as dogma. Looks harmless - it is right 95% of the time. Hurts when the follow-up comes: "then why does LinkedList exist?" Fix: answer with mechanism - contiguous array wins on cache locality and O(1) indexing; LinkedList wins only when splicing at held node references, which everyday code rarely has.',
    'Calling Arrays.asList() result an ArrayList. It is a fixed-size view backed by the array - set() works, add() throws UnsupportedOperationException, and writes leak into the original array. Fix: wrap in new ArrayList<>(...) when mutability is needed.',
    'Using Map.of()/List.of() then trying to mutate. These are unmodifiable factories - clear intent for constants, runtime explosion for everything else. Fix: name them like constants and keep them read-only by contract.'
  ],

  scenarioDrills: [
    {
      situation:
        'Riya syncs product data hourly from five supplier feeds. QA reports the same handmade mug appearing multiple times under different supplier ids but the same SKU.',
      question: '"Walk me through how you would de-duplicate the imported products, and which collection you would choose."',
      answer:
        'Approach: identity here is the SKU string, so I need uniqueness by key - that is a Set decision, not manual contains() loops. Mechanics: iterate feed entries in import order, attempt set.add(sku) and only persist products where add returned true - add returning false means the element already existed, which doubles as my duplicate counter for logging. Choice detail: plain HashSet suffices since I do not need ordered output; if the report must show first-seen order I switch to LinkedHashSet - same O(1) behavior plus insertion-order iteration. Trade-off worth stating: if later we must MERGE duplicate records rather than drop them, the structure becomes Map<String, SupplierProduct> keyed by SKU with an explicit merge step - sets answer "seen or not", maps answer "which version won".'
    },
    {
      situation:
        'A code review finds this line serving the ShopSphere product page: products.stream().filter(p -> p.getSku().equals(requestedSku)).findFirst() over roughly a million rows loaded from the DB.',
      question: '"Is there anything wrong with this code?"',
      answer:
        'It works - linear scan, O(n) - and that is exactly the problem at a million rows per request. This is a lookup disguised as a filter. Approach: the access pattern is by-key, so the structure should be Map<String, Product> built once at load (or better, fetched by primary key from MySQL directly). With that map, getProduct(sku) is O(1) average via hashing. I would also flag the upstream smell: pulling a million rows to serve one request belongs in the database query layer. So my answer has three layers: fix the structure (map lookup), fix the query (WHERE sku = ?), and mention the trade-off - keeping a map warm costs memory and staleness risk, which is why the DB route usually wins for persistent data.'
    }
  ],

  rapidFire: [
    {
      question: 'What is the difference between a List and a Set?',
      answer:
        'A List is an ordered sequence allowing duplicates with index-based access; a Set allows at most one equal element and has no indexes - membership tests instead of positions.'
    },
    {
      question: 'Why does Map not extend Collection?',
      answer:
        'Because a mapping is not an element - a Map is key-to-value associations, so it exposes views (keySet, values, entrySet) rather than pretending to be a bag of pairs.'
    },
    {
      question: 'Why are Vector and Stack considered obsolete?',
      answer:
        'They synchronize every method, which taxes single-threaded code while still being insufficiently atomic for multi-step operations in concurrent code - ArrayList replaces Vector, ArrayDeque replaces Stack, ConcurrentHashMap handles true concurrency.'
    },
    {
      question: 'What is the difference between Collection and Collections?',
      answer:
        'Collection is the root interface for element groups; Collections is a utility class of static algorithms - sort, shuffle, unmodifiableList, synchronizedMap.'
    },
    {
      question: 'What does fail-fast mean?',
      answer:
        'Iterators of HashMap, ArrayList and friends detect structural modification during iteration via a modCount check and throw ConcurrentModificationException immediately - best-effort protection against silent corruption.'
    },
    {
      question: 'Big-O of HashMap.get()?',
      answer:
        'O(1) average case; O(log n) worst case since Java 8, when a heavily-collided bucket treeifies into a red-black tree.'
    }
  ],

  interviewPerspective:
    'This page IS the opening question of most collections conversations: "explain the framework" or "which collection for this scenario". Interviewers are grading your selection reflex - duplicates? order? key access? - before internals. Nail the two-question choice, volunteer one complexity number per structure, and park Vector/Stack/Hashtable in one dismissive sentence. Then they will dig into HashMap - which is the next lesson, and the deepest hole of the whole module.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'arraylist-linkedlist-internals',
      title: 'ArrayList & LinkedList Internals',
      note: 'Next lesson - the List branch opened up to memory arrays and growth strategy.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'java-collections',
      title: 'Java Collections (full Learn page)',
      note: 'The full textbook version of this map with every interface method catalogued.'
    }
  ],

  triggerSentence:
    'Duplicates? Order? Key access? - two questions pick the interface, the implementation only picks the speed.'
};

import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Collections Mastery -> HashSet, LinkedHashSet & TreeSet.
 * The Set family as three wrappers over Map structures - one trick, three
 * ordering guarantees - plus when each earns its keep in ShopSphere.
 */
export const SET_FAMILY_INTERNALS: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'collections-mastery',
  conceptId: 'hashset-linkedhashset-treeset',
  title: 'HashSet, LinkedHashSet & TreeSet',
  topicType: 'data-structure',

  simpleIntuition:
    'Riya needs three "unique-only" lists for ShopSphere: SKUs currently in a flash sale (order irrelevant), audit logs of first-seen fraud IPs (arrival order matters), and a live leaderboard of top spenders (sorted order matters). Three different ordering needs, one shared rule: no element twice. The elegant discovery - and the interview answer hiding inside this whole lesson - is that Java did not build three duplicate-detection machines. HashSet is a HashMap wearing a disguise; the other two are the same disguise over LinkedHashMap and TreeMap. Learn one mechanism, own the family.',

  formalMeaning:
    'Set implementations enforce uniqueness by delegating to Map structures: HashSet wraps a private HashMap<E, Object> where every value is the same dummy PRESENT constant - add(e) maps to map.put(e, PRESENT) == null. LinkedHashSet extends HashSet but its underlying LinkedHashMap maintains a doubly-linked list through entries, so iteration follows insertion (or access) order. TreeSet wraps a TreeMap backed by a red-black tree, keeping elements sorted by natural Comparable order or an injected Comparator, at O(log n) per operation with NavigableSet range operations. All three reject duplicates via the equals/hashCode contract (tree-based ones via compareTo consistency).',

  whyItExists:
    '"Have I seen this before?" is one of computing\'s most frequent questions - deduplication, whitelists, visited-state, membership checks. Scanning a List answers it in O(n); the Set family exists to answer it in O(1) average by borrowing hashing\'s teleportation, or O(log n) with sorted bonuses from tree structure. The three variants exist because AFTER answering "is it there?", systems immediately ask "in what ORDER do I show them?" - and that second question alone picks your implementation. Understanding that Sets are Maps in disguise also explains their behavior precisely: iteration cost scales with capacity for hash sets, ordering is absent unless paid for, and equals/hashCode suddenly matter enormously.',

  howItWorksInternally: [
    'HashSet.add(e) → map.put(e, PRESENT): compute spread hash → mask to bucket → walk bin comparing hash/==/equals → if found return false (rejected), else store and return true. contains(e) and remove(e) route identically. Uniqueness mechanics = HashMap put semantics you already know.',
    'The dummy-value design is why HashSet has NO get() method - a Set answers "is it present?", never "give me the matching element". Need lookup-with-payload? That requirement IS a Map.',
    'LinkedHashMap\'s secret weapon: every Node gains two extra pointers (before/after) threading ALL entries into one running chain regardless of buckets. Iteration walks that chain - insertion order by default, ACCESS order if constructed with accessOrder=true (get() re-links the touched entry to the tail). That boolean is the entire engine of LRU caches - dedicated lesson later in this module.',
    'TreeMap routing: no hashing at all - binary search descent comparing each incoming element against nodes (compareTo or Comparator). Equal comparison result means duplicate → rejected. This is why TreeSet demands elements be MUTUALLY COMPARABLE: hand it objects without a natural order and the FIRST add throws ClassCastException.',
    'TreeSet\'s compareTo-equals consistency rule: if compareTo says zero, equals must say true - violate it and TreeSet and HashSet disagree about what "duplicate" means, producing collections with different sizes holding identical data. Interviewers adore this corner.',
    'Failure modes worth knowing cold: null elements - HashSet tolerates ONE (it is just a null key), TreeSet throws NullPointerException on insertion since comparisons against null are meaningless.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    ADD["add(sku-42)"] --> W{"Which Set?"}\n    W -->|"HashSet"| H["map.put e -> PRESENT<br/>hash bucket routing<br/>O(1) avg"]\n    W -->|"LinkedHashSet"| L["same hash routing<br/>PLUS linked chain through entries<br/>iteration = insertion order"]\n    W -->|"TreeSet"| T["no hashing -<br/>binary search descent<br/>compare-to zero = duplicate<br/>O(log n), sorted iteration"]\n    H --> R1["false if equal found"]\n    L --> R2["false if equal found"]\n    T --> R3["false if compare==0"]',
      caption: 'One uniqueness question, three routing engines - hash buckets, hash buckets + order chain, binary search tree.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - club door checkers: HashSet is a bouncer with photographic memory scanning a crowd - instant yes/no, zero memory of arrival sequence. LinkedHashSet keeps a sign-in sheet alongside the memory - same speed verdicts, plus "who came first" replays. TreeSet seats guests in ranked rows continuously - finding anyone costs log(n) steps, but "who ranks between X and Y" becomes trivial.',
    'PRESENT constant - the entire trick of HashSet: values are meaningless placeholders, proving the class is an interface-satisfaction layer over Map rather than new machinery.',
    'NavigableSet power methods on TreeSet: ceiling(e)/floor(e) (nearest >= / <=), higher/lower (strictly), headSet/tailSet/subSet ranges, pollFirst/pollLast, descendingSet. These answer range questions hash structures structurally cannot.',
    'EnumSet - the specialist nobody asks about but mentioning wins points: bit-vector backed set of enum constants, absurdly fast and compact - the right answer when the domain is enum membership.',
    'Choosing in five seconds: uniqueness + fastest membership → HashSet; + preserve first-seen order → LinkedHashSet; + sorted iteration/range queries → TreeSet; + enum domain → EnumSet.'
  ],

  realWorldExamples: [
    'ShopSphere flash-sale flags: HashSet<String> activeSaleSkus - pure membership checks thousands of times a minute, order meaningless.',
    'Fraud module: LinkedHashSet<String> suspiciousIpFirstSeen - dedupe AND chronological replay for auditors in one structure.',
    'Leaderboard/reporting: TreeSet<Spender> with comparator by amount - live sorted view plus range queries ("top decile", everyone above ₹10,000).',
    'Interview reality: "How does HashSet internally check duplicates?" expects the HashMap-disguise answer plus the contract - it is a stealth check whether HashMap internals actually stuck.'
  ],

  complexityAndTradeoffs: [
    'HashSet: add/contains/remove O(1) average; iteration O(capacity + size); no ordering guarantees whatsoever.',
    'LinkedHashSet: identical operation costs plus two pointer writes; iteration O(size) walking the chain - actually FASTER iteration than HashSet despite the extra structure, because it skips empty buckets.',
    'TreeSet: guaranteed O(log n) operations; iteration O(size) already sorted; pays node overhead and comparison traffic; requires comparable elements and consistent comparators.',
    'Memory ranking: TreeSet heaviest per element (tree nodes), LinkedHashSet middle (two extra pointers), HashSet leanest.',
    'Use TreeSet only when sorted output or range queries are real requirements - paying log-n tax for unordered membership work is waste dressed as sophistication.'
  ],

  commonMistakes: [
    'Expecting HashSet iteration order to match insertion order because it "worked during testing". Hash-table capacity, load factor and String hashes conspired to make small tests LOOK ordered; production data reshuffles everything after any resize. Fix: need order? Say it in the type - LinkedHashSet - so the guarantee is contractual, not accidental.',
    'Adding non-Comparable objects to a TreeSet "to keep them sorted" without a comparator. First add throws ClassCastException - but the subtler version passes review: a comparator inconsistent with equals lets TreeSet accept what HashSet would reject, splitting truth about membership across structures. Fix: comparator must treat compareTo-zero exactly when equals is true.',
    'Calling set.get(x) in review comments or designs. No such method exists BY DESIGN - a Set is membership, not retrieval. Fix: if payload retrieval is the actual requirement, the honest structure was always Map<K,V>; recognizing that rename is itself an interview-level judgment call.'
  ],

  scenarioDrills: [
    {
      situation:
        'ShopSphere\'s recommendation service computes "products you viewed but did not buy". It currently loads viewedIds and boughtIds as ArrayList<String> and runs viewedIds.removeIf(boughtIds::contains) - profiling shows this dominating CPU at peak.',
      question: '"Optimize this pipeline - walk through your reasoning about structure choice."',
      answer:
        'Diagnose first: removeIf(boughtIds::contains) makes containment checks inside a mutation pass - each contains is a linear scan over boughtIds, so total cost is roughly views x buys comparisons - quadratic-ish at scale. The containment question against boughtIds is asked repeatedly with no order requirement - textbook HashSet promotion: convert once, Set<String> bought = new HashSet<>(boughtIds) - O(buys) build, then filter with O(1)-average probes, total linear overall. If output must preserve view chronology (product teams usually want recency order), iterate viewedIds in place and skip hits - List iteration stays, only the LOOKUP side changed structure. One more level up: at serious scale these sets precompute nightly in Redis or a DB materialized view, making the service request path trivial - the interview win is showing the ladder: fix algorithmic structure first, then push precomputation outward as scale demands.'
    },
    {
      situation:
        'A code review dispute: teammate A insists TreeSet everywhere "because deterministic output aids debugging"; teammate B calls it premature cost. The affected code does membership checks plus occasional config-driven sorted reports.',
      question: '"Cast the deciding vote with technical justification."',
      answer:
        'Decide per access pattern, not ideology - both teammates have half the truth. Membership-heavy paths get HashSet: O(1) versus O(log n), and determinism there is a non-goal because nothing iterates them on the hot path. The REPORTING paths genuinely want sorted determinism - give those TreeSet explicitly (or sort-on-demand from the hash set: new ArrayList<>(set), sort - cheaper when reports are rare). So the vote: mixed structure keyed by usage, wrapped in clear variable naming so the next reviewer sees intent - saleSkus (HashSet) versus reportSortedSkus (TreeSet). The deeper principle I would state: performance decisions follow measured hot paths; determinism decisions follow consumer requirements - conflating the two is how codebases accumulate uniform log-n taxes nobody can justify anymore.'
    }
  ],

  rapidFire: [
    {
      question: 'What is HashSet internally?',
      answer:
        'A HashMap where keys are your elements and every value is the same dummy PRESENT object - add returns whether put returned null.'
    },
    {
      question: 'Why does HashSet have no get() method?',
      answer:
        'Because a Set answers membership, not retrieval - there is no value to fetch; needing lookup-with-payload means you wanted a Map.'
    },
    {
      question: 'Difference between HashSet and LinkedHashSet?',
      answer:
        'Identical hash-based operations; LinkedHashSet additionally threads entries through a LinkedList so iteration follows insertion (or access) order.'
    },
    {
      question: 'What powers TreeSet?',
      answer:
        'A TreeMap red-black tree - elements kept sorted by Comparable or Comparator at O(log n), exposing NavigableSet range methods like ceiling and subSet.'
    },
    {
      question: 'Can HashSet contain null? Can TreeSet?',
      answer:
        'HashSet allows one null (a null key in its backing map); TreeSet throws NullPointerException because null cannot participate in comparisons.'
    },
    {
      question: 'What is the compareTo-equals consistency rule?',
      answer:
        'compareTo returning zero must coincide with equals returning true - otherwise TreeSet and HashSet classify duplicates differently for the same data.'
    },
    {
      question: 'When would you reach for EnumSet?',
      answer:
        'Whenever the domain is enum membership - it stores bits in a long vector, making it faster and smaller than any general-purpose Set.'
    }
  ],

  interviewPerspective:
    'Questions arrive as "internal working of HashSet?" - which is really a HashMap-internals retest through a smaller door. Answer with the PRESENT-dummy reveal in one sentence, then bridge: "so all my HashMap answers apply - including why iteration order drifts." For TreeSet rounds, expect comparator design and range-method usage. The premium signal: mapping each Set variant to a concrete business need unprompted, exactly like the flash-sale/fraud/leaderboard trio here.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'equals-hashcode-in-practice',
      title: 'equals & hashCode in Practice',
      note: 'Uniqueness IS this contract in action - revisit if add()-rejection semantics feel fuzzy.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'map-family-extras',
      title: 'LinkedHashMap LRU, TreeMap & PriorityQueue',
      note: 'Next lesson - the ordered-map machinery behind LinkedHashSet and TreeSet, plus the heap.'
    }
  ],

  triggerSentence:
    'Every Set is a Map in disguise - the only real question is what order you want the disguise to remember.'
};

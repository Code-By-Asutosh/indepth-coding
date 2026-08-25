import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Collections Mastery -> Collections Scenario Drill.
 * The war-room finale: mixed real-world cases that force every lesson from
 * this module to work together - answered the way Round 2 rewards.
 */
export const COLLECTIONS_SCENARIO_DRILL: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'collections-mastery',
  conceptId: 'collections-scenario-drill',
  title: 'Collections Scenario Drill',
  topicType: 'concept',

  simpleIntuition:
    'Reading about collections is knowing the players; scenarios are the actual match. In interviews nobody asks "what is a TreeMap?" in isolation - they hand you a half-built ShopSphere feature with traffic numbers and watch which structure you reach for, what trade-off you name first, and whether your answer survives one follow-up. This page is pure match practice: attempt each case OUT LOUD before opening any model answer - the gap between your spoken attempt and the model IS your study plan for tomorrow.',

  formalMeaning:
    'A structured rehearsal set for collections judgment: each drill pairs a production-shaped situation (scale, constraint, existing bug) with an interviewer-style question, and a model answer demonstrating the winning response shape - requirements first, structure choice second, complexity/trade-off third, escalation path last.',

  whyItExists:
    'Knowledge without retrieval decays in days, and interview anxiety suppresses exactly the recall you studied. Scenario drilling closes both gaps at once: forcing structure CHOICE under mild pressure converts passive familiarity into reflex, while the answer-shape habit (requirements → choice → trade-off) gives your brain a template to run when adrenaline hits. It also exposes the difference between knowing facts and having judgment - the single line separating hire from no-hire at senior levels. Skipping this page makes the previous seven lessons a reading exercise; doing it makes them a skill.',

  howItWorksInternally: [
    'Run each drill as a timed simulation: read the situation, take 30 seconds to think, then answer out loud for up to two minutes BEFORE revealing anything.',
    'Grade yourself on the four-part shape, not just correctness: did you state assumptions? name the chosen structure explicitly? give its complexity? mention when you would switch to something else?',
    'Any drill scoring under three parts gets starred and repeated after 48 hours - spaced repetition on failures only, never re-drilling what already sticks.',
    'After grading, close the screen and reconstruct the model answer\'s skeleton from memory - reconstruction beats rereading by a wide margin for retention.',
    'Once per week, shuffle order and cold-run five drills from across the whole module - interleaving is what makes the knowledge survive context switches, which is what real interviews are.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    Q["Need to hold multiple elements"] --> D{"Duplicates allowed?"}\n    D -->|no| S{"Need sorted / range queries?"}\n    S -->|yes| TS["TreeSet / TreeSet-backed logic"]\n    S -->|no| O{"Preserve first-seen order?"}\n    O -->|yes| LHS["LinkedHashSet"]\n    O -->|no| HS["HashSet"]\n    D -->|yes| K{"Access by key?"}\n    K -->|yes| M{"Order or ranges needed?"}\n    M -->|"recency / LRU"| LHM["LinkedHashMap access-order"]\n    M -->|"sorted ranges"| TM["TreeMap"]\n    M -->|"none"| HM["HashMap<br/>concurrent? -> ConcurrentHashMap"]\n    K -->|no| P{"Serve by priority / recency?"}\n    P -->|"priority"| PQ["PriorityQueue"]\n    P -->|"FIFO/LIFO"| AQ["ArrayDeque"]\n    P -->|no| AL["ArrayList default"]',
      caption: 'The complete selection reflex - if you can redraw this from memory, the module landed.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - this page is the flight simulator after ground school: same instruments (the seven lessons), but now instruments fail, weather changes, and an examiner watches your hands. The drills deliberately MIX topics because interviews do.',
    'THE ANSWER SHAPE - four beats, always: (1) clarify requirement + scale assumption, (2) name the structure, (3) complexity + why alternatives lose, (4) when to escalate (different structure, library, or infrastructure). Practicing the shape matters more than memorizing answers.',
    'Complexity fluency table to keep loaded: ArrayList get O(1)/insert-mid O(n); HashMap ops O(1) avg, O(log n) treeified worst; TreeMap/TreeSet O(log n) guaranteed + ranges; LinkedHash* O(1) + ordered iteration; PriorityQueue offer/poll O(log n), peek O(1), arbitrary remove O(n).',
    'Red flags interviewers listen for: reaching for LinkedList unprompted; sorting repeatedly where a sorted structure belongs; manual contains() dedup loops where a Set speaks; catching ConcurrentModificationException anywhere.'
  ],

  realWorldExamples: [
    'Every drill below mirrors a real production pattern: dedupe pipelines, top-K analytics, rate limiting, LRU caching, batch-vs-live iteration conflicts - these are the actual shapes backend engineers meet weekly.',
    'Interview reality: at 4+ years experience, panels stop asking definitions early and jump straight to cases like these - the definition round happened inside the bot screen already.'
  ],

  complexityAndTradeoffs: [
    'Time spent here vs more theory: one hour of drilled scenarios typically outperforms three hours of fresh reading - retrieval under mild pressure is the exact skill test day measures.',
    'Breadth vs depth in answers: naming ONE alternative structure with its trade-off beats exhaustively listing five - precision reads as seniority; spray reads as panic.',
    'Use this drill page when: within 2 weeks of interviews and module lessons are done. Avoid when: internals feel shaky - go back to the specific lesson first, drills amplify whatever foundation exists, strong or weak.'
  ],

  commonMistakes: [
    'Reading drills passively ("yes I would have said that") without speaking. Recognition masquerades as ability until the live round exposes it. Fix: voice on, timer on, reveal only after answering.',
    'Jumping straight to a structure without restating the requirement. Sounds efficient, loses points - half of these cases hinge on one hidden constraint (order? concurrency? duplicates?). Fix: one clarifying sentence before choosing - interviewers score the habit.',
    'Never mentioning when your choice BREAKS. Every structure has a failure domain; candidates who volunteer theirs ("this dies beyond X scale / under Y write-ratio") control the follow-up instead of receiving it.'
  ],

  scenarioDrills: [
    {
      situation:
        'ShopSphere checkout must merge cart items across devices: phone cart and web cart sync every few minutes. QA found quantity bugs - items duplicated instead of quantities summing.',
      question: '"Which structures fix the merge, and walk through the merge logic."',
      answer:
        'Identity here is SKU; the VALUE is a count - so the natural home is Map<String, Integer> per device merged into Map<String, Integer> master using merge(sku, qty, Integer::sum): absent keys insert, present keys sum atomically-in-intent, no containsKey dance. The QA bug smells like List-based merging (addAll duplicates entries) or Set-of-items discarding counts entirely - worth naming both suspects aloud. If display needs insertion chronology too, LinkedHashMap preserves device-add order while merging still works identically. Escalation beat: if sync became multi-server concurrent, the merge moves behind a queue or DB transaction rather than in-memory maps - showing where the structure stops being the right tool scores the final point.'
    },
    {
      situation:
        'Dashboard query: "top 10 best-selling products this hour" over roughly a million sale events streaming continuously.',
      question: '"Design the computation - structure choices and complexities."',
      answer:
        'Two phases. Phase one aggregation: ConcurrentHashMap<String, LongAdder> keyed by product id - LongAdder because increments massively outnumber reads this hour, striped cells avoid CAS contention; O(1)-ish per event. Phase two top-K: min-heap PriorityQueue sized 10 comparing by count ascending - stream the map entrySet once, heap.add then poll-if-above-size; total O(U log 10) for U unique products, versus O(U log U) full sort. Name the reset problem (hourly windows want a new map generation swapped via AtomicReference, old one GC\'d) and the production escalation (real systems push this to Redis ZSET or a stream processor - same algorithm, distributed). That last sentence converts a coding answer into a design answer.'
    },
    {
      situation:
        'Inventory service keeps stock levels in HashMap<String, Integer>. During flash sales multiple threads decrement simultaneously; occasionally oversell happens and counts print impossible values.',
      question: '"Diagnose and fix - be precise about what breaks and why."',
      answer:
        'Two stacked races. First: even get-then-decrement as separate map calls race between threads regardless of structure. Second and deeper: decrementing means read-modify-write on a PLAIN Integer value - CHM would guard key-routing, not arithmetic inside values; count-- is non-atomic (read, subtract, write back) so lost updates explain oversell exactly. Fix ladder: ConcurrentHashMap<String, LongAdder> for counting (or AtomicInteger values with decrementAndGet compared against zero) - atomicity lives INSIDE the value type now; if stock decrements must also trigger reorder events atomically, move the operation behind synchronized service method or optimistic DB update (UPDATE stock SET q = q-1 WHERE sku=? AND q > 0) - which is honestly where production inventory belongs. Structure of the answer matters: name both layers broken before fixing either.'
    },
    {
      situation:
        'A nightly reconciliation job iterates ordersMap (HashMap, ~2M entries) while a parallel thread inserts late-arriving orders. The team sees sporadic ConcurrentModificationException and one historic CPU-spin incident on JDK 7.',
      question: '"Explain both symptoms and choose the structural fix."',
      answer:
        'CME symptom: the iterator detects modCount drift from concurrent inserts - expected behavior, alarm working as designed. CPU-spin symptom: classic pre-Java-8 concurrent-resize corruption where two threads resizing transferred nodes into a loop (head-insertion era); fixed by Java 8 tail-insertion resize, but the story proves the map was NEVER safe shared. Fix menu ranked: replace-generation pattern - build a fresh fully-populated map offline and swap an AtomicReference<Map> pointer; readers grab coherent snapshots, writer never touches live structure - simplest correct thing for batch-read workloads. If truly concurrent read-write access is continuous, ConcurrentHashMap with weakly-consistent iteration absorbs it. What I would NOT do: synchronize iteration and mutation ad hoc - correctness by discipline rots. Mentioning WHY the JDK 7 spin happened (resize loop, not just lost updates) is the depth flourish here.'
    },
    {
      situation:
        'Search autocomplete needs prefix suggestions: user types "hea", system suggests headphones, health monitors, heat guns - from a 50k-product catalog, sub-millisecond budget.',
      question: '"Which collection(s) and how do they compose?"',
      answer:
        'Prefix search is sorted-data territory: TreeMap<String, Product> keyed by name gives tailMap(prefix) head-slice; iterate until entries stop startingWith(prefix) - O(log n) to land + k results walked, ideal when result count k is small. Production-grade upgrade worth volunteering: trie (prefix tree) - each node holds children maps, walk the prefix char-by-char then collect subtree; tries beat range-walks when prefixes are long relative to names. Composition insight: catalog static-ish → rebuild TreeMap/trie on deploy; hot-key filtering on top → tiny HashSet of blocked SKUs checked during collection. Sub-millisecond claim justified aloud: log2(50k) ≈ 16 comparisons plus small walk - comfortably under budget in-heap; beyond one service instance, Redis or Elasticsearch takes over, same shapes bigger boxes.'
    },
    {
      situation:
        'Code review: teammate wrote frequency counting as for(String s : words){ if(map.containsKey(s)) map.put(s, map.get(s)+1); else map.put(s,1); } for a 10M-word log job.',
      question: '"Review it - correctness first, then modernization."',
      answer:
        'Correct but noisy: double hash lookups on hits (containsKey then get then put = up to three), and the check-then-act shape is a habit that becomes a BUG the day this map goes concurrent. Modernize to map.merge(s, 1, Integer::sum) - single lookup, intent-clear; or groupingBy/counting in a stream for declarative form: words.stream().collect(groupingBy(identity(), counting())). Performance note for 10M scale: merge wins over the stream pipeline slightly (no intermediate machinery), both crush the original triple-lookup version. The review point that earns respect: flagging that merge/compute are not merely shorter but ATOMIC on CHM - the same refactor future-proofs concurrency for free.'
    }
  ],

  rapidFire: [
    {
      question: 'Choose a structure for: ordered, index-accessed, duplicate-allowed data.',
      answer: 'ArrayList - random access O(1), append amortized O(1).'
    },
    {
      question: 'Structure for fast membership tests with no ordering care?',
      answer: 'HashSet - O(1) average add/contains backed by a HashMap of dummy values.'
    },
    {
      question: 'Dedupe preserving first-seen order?',
      answer: 'LinkedHashSet - identical hashing plus an insertion-order chain for iteration.'
    },
    {
      question: 'Range queries over sorted keys?',
      answer: 'TreeMap/TreeSet - red-black tree, ceiling/floor/subMap in O(log n).'
    },
    {
      question: 'Thread-shared map with high read concurrency?',
      answer: 'ConcurrentHashMap - volatile lock-free reads, bucket-level writes.'
    },
    {
      question: 'Serve highest-priority item repeatedly?',
      answer: 'PriorityQueue - binary heap, O(log n) offer/poll, O(1) peek, unsorted iteration.'
    },
    {
      question: 'Fixed-memory cache evicting least-recently-used?',
      answer: 'LinkedHashMap with accessOrder=true plus removeEldestEntry override; Caffeine in production.'
    },
    {
      question: 'FIFO processing queue, array-backed?',
      answer: 'ArrayDeque - circular buffer, amortized O(1) both ends, preferred over LinkedList.'
    },
    {
      question: 'Count occurrences of each word safely?',
      answer: 'Map.merge(word, 1, Integer::sum) - single lookup, atomic on concurrent maps.'
    },
    {
      question: 'Top-K of N items efficiently?',
      answer: 'K-sized min-heap over the stream - O(N log K), better than full sorting.'
    }
  ],

  interviewPerspective:
    'Panels increasingly skip definitions and open with exactly these cases - your first thirty seconds set their internal calibration of you. Run the four-beat shape until automatic: requirement → structure → complexity/trade-off → escalation. When a case crosses domains (concurrency + collections, sorting + heaps), SAY the bridge explicitly - cross-topic fluency is the loudest possible signal at Software Engineer II level.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'core-java-rapid',
      conceptId: 'java8-essentials-lambdas-streams-optional',
      title: 'Java 8+ Essentials: Lambdas, Streams, Optional',
      note: 'Next module - merge() and groupingBy() already previewed streams; now make them systematic.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'hashmap-internals',
      title: 'HashMap Internals',
      note: 'Missed a drill? The root cause usually traces back here or to equals/hashCode.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'equals-hashcode-in-practice',
      title: 'equals & hashCode in Practice',
      note: 'The other frequent root cause behind failed drills.'
    }
  ],

  triggerSentence:
    'Requirement, structure, trade-off, escape route - four beats, every case, out loud.'
};

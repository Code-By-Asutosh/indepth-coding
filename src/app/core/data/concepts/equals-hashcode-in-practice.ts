import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Collections Mastery -> equals & hashCode in Practice.
 * The contract behind every HashSet/HashMap lookup, the production bugs born
 * when it breaks, and how to answer "what happens if you override only one?".
 */
export const EQUALS_HASHCODE_IN_PRACTICE: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'collections-mastery',
  conceptId: 'equals-hashcode-in-practice',
  title: 'equals & hashCode in Practice',
  topicType: 'concept',

  simpleIntuition:
    'ShopSphere\'s cart has a bug QA swears is impossible: the same mug, added twice, appears twice - even though the cart is backed by a Set specifically to stop duplicates. Asutosh debugs it at midnight and finds Product is a plain class using default Object equality - so two mugs with identical SKU are two different objects to Java, because identity, not content, decides equality. One override of equals() and hashCode() later, the duplicate is gone. This tiny class method pair quietly decides correctness everywhere data is stored, deduplicated, or looked up - and interviewers know most candidates can define the contract but few can explain what breaks when half of it is implemented.',

  formalMeaning:
    'equals(Object) defines logical equality between objects; hashCode() returns an int digest of the object\'s contents used by hash-based collections to route lookups. The JVM-level contract binds them: equal objects MUST return equal hash codes; unequal objects MAY collide (hashes are not unique). Hash collections exploit both halves: hashCode selects the bucket cheaply, equals confirms identity within it. Violating either side corrupts behavior silently - no exceptions, just wrong answers.',

  whyItExists:
    'Default Object.equals is reference identity - "same memory address". That is correct for mutable, unshared things but useless for VALUE-like concepts: money amounts, SKUs, coordinates, user ids. The moment your domain models represent values, you need content-based equality; and the moment those objects enter a HashMap or HashSet, hashCode becomes their home address in memory routing. Without the pairing rule, two logically-equal products could hash to different buckets and never meet - duplicates slip into Sets and get() returns null for keys you definitely put(). Understanding WHY the rule exists turns memorization into deduction: any interviewer variation ("override equals only?") becomes answerable from first principles.',

  howItWorksInternally: [
    'HashSet.add(x) is literally hashMap.put(x, PRESENT). Routing: compute x.hashCode(), spread it, mask to bucket index, walk the bin comparing hash → == → equals. Insert only if NO node reports equal. So uniqueness = hashing + equals working together.',
    'Override equals but NOT hashCode: logically-equal objects now return true from equals BUT keep distinct identity-based hash codes → they land in DIFFERENT buckets → the walk never even reaches them → HashSet happily stores both duplicates and map.get(new EqualKey()) returns null. This is the classic "I overrode equals and it still does not work" trap.',
    'Override hashCode but NOT equals: equal-hash objects cluster correctly, but the final confirmation falls back to reference identity - so "equal" content still counts as unequal. Dedup fails differently: everything lands in the right neighborhood yet nobody matches.',
    'The symmetric-contract subtlety interviewers probe: equals must be reflexive, symmetric, transitive, consistent, and never-null-tolerant (x.equals(null) is false, always). Symmetry bugs appear when subclassing with instanceof checks - a Point.equals(ColorPoint) may disagree with ColorPoint.equals(Point). Standard escapes: prefer composition over inheritance for value classes, use getClass()-based symmetry carefully, or reach for records.',
    'records solve this wholesale: the compiler generates equals, hashCode AND toString from the component fields - which is why modern codebases model value objects as records first. Lombok @EqualsAndHashCode serves the same role in older estates.',
    'Consistency clause matters for keys: hashCode must be stable while the object sits in a hash structure. Mutable fields participating in hashCode are landmines waiting for a heartbeat thread to step on them.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    ADD["set.add(mug2)<br/>mug2 equals mug1"] --> HC{"hashCode()<br/>overridden?"}\n    HC -->|no| B1["different buckets!<br/>walk never compares<br/>DUPLICATE STORED - BUG"]\n    HC -->|yes| EQ{"equals()<br/>overridden correctly?"}\n    EQ -->|no| B2["same bucket but<br/>== says different<br/>DUPLICATE STORED - BUG"]\n    EQ -->|yes| OK["match found in bucket<br/>add returns false<br/>correctly rejected"]',
      caption: 'Both halves or neither works: hashCode gets you to the right neighborhood, equals confirms the exact house.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - postal delivery: hashCode is the PIN code sorting mail to the right region; equals is the door-to-door check for the exact house. Override equals without hashCode = identical letters sent to different cities - the postman never compares them. Override hashCode without equals = same city, but the courier only delivers if it is literally the same physical letter.',
    'THE CONTRACT IN ONE BREATH - equal objects must have equal hashes; unequal ones may share a hash (collision is legal, mismatch is fatal); consistent across calls while in a collection.',
    'The canonical equals recipe: instanceof-or-getClass guard → cast → compare each significant field (Objects.equals for null-safe field comparison, Arrays.equals for arrays, Float.compare for floats). Then generate hashCode via Objects.hash(fieldA, fieldB) or IDE/Lombok/record.',
    'Fields choice defines identity: include business-identity fields (sku), exclude volatile presentation fields (lastViewedAt) - deciding WHAT makes two products "the same" is domain design, not syntax.',
    'Identity-vs-value quick test: if two instances with identical fields should be interchangeable in a Set or Map key position, they are value objects → need content equality. If they are inherently unique entities (a specific HTTP connection), identity semantics stay.'
  ],

  realWorldExamples: [
    'ShopSphere cart dedupe: overriding equals/hashCode on Product (by SKU) turned a buggy duplicate-allowing cart into a correct one - and made HashSet<Product> usable for category listings.',
    'Spring reality: cache keys (@Cacheable), request parameter maps, security authorities sets - all lean on properly-implemented value equality. Records made DTOs safe-by-default.',
    'Interview reality: "What happens if you override only equals?" is asked constantly precisely because the wrong-but-common answer ("it will work with a warning") reveals book-knowledge without mechanism. Follow-ups chain into String immutability and immutable keys in maps.'
  ],

  complexityAndTradeoffs: [
    'Correctness cost: none - generating both methods is free via records/Lombok/IDE. The only trade-off is choosing WHICH fields define identity, and fewer identity fields means coarser equality (two different addresses collapse) - choose deliberately.',
    'hashCode computation cost vs collision rate: richer hash mixing spreads better but costs cycles; Objects.hash(...) boxes varargs - hot paths may hand-roll (31 * result + fieldHash) like generated code does.',
    'Mutable value objects work fine as LIST elements but are dangerous as SET elements or MAP KEYS once inserted. Trade-off: mutate-after-insert convenience vs silent lookup loss - immutability wins wherever hashing is involved.',
    'Use records when: the class is pure data with a fixed field set (DTOs, keys, coordinates). Avoid auto-generation when: identity semantics are genuinely wanted, OR JPA entities where ORM-managed identity makes naive field-equality risky (ID-based equality is the common convention there).'
  ],

  commonMistakes: [
    'Overriding equals() and forgetting hashCode() because "tests passed". They passed because the test used List (no hashing involved); production puts the object into a HashMap and lookups start missing randomly. Hurts worst in code review - the omission looks like one line of laziness but rewrites runtime behavior. Fix: treat them as an atomic unit - record, Lombok, or IDE template generates BOTH together, always.',
    'Building hashCode from mutable fields of an object used as a map key. Looks harmless at put() time. Hurts after any setter fires: the key\'s stored bucket no longer matches its computed hash - containsKey lies, remove misses, memory leaks grow. Fix: keys must be effectively immutable (String, wrappers, records with stable fields).',
    'Using == instead of .equals() for String comparison in lookup logic. Works forever with literals thanks to interning, then explodes when one side arrives from a request payload. Fix: Objects.equals(a, b) as reflex habit; reserve == for enums and identity checks deliberately.',
    'Writing equals() with instanceof on a class that HAS subclasses, creating asymmetric equality between parent and child instances. Fix: getClass() comparison for strict symmetry, or make the class final, or model variants as records/composition instead of inheritance.'
  ],

  scenarioDrills: [
    {
      situation:
        'Riya introduces a product-comparison feature comparing the shopper\'s cart against a wishlist Set. QA finds products appearing "equal" in the UI still occupying two Set slots, while other products vanish from lookups after a price update job mutates them.',
      question: '"Two symptoms, one root cause family - diagnose and prescribe."',
      answer:
        'Symptom one (duplicates surviving a Set) says equality is falling back to identity - the Product class likely lacks equals/hashCode entirely, or hashCode was missed while equals exists, so logically-same SKUs never match within their bucket walks. Symptom two (lookups dying after mutation) is the mutable-key landmine: price participates in hashCode, the update job changes it post-insert, and the entry\'s address in the hash world goes stale. Prescription: redefine identity deliberately - equality BY SKU ONLY (business identity), excluding price/stock/presentation fields since those describe STATE not IDENTITY; implement via record ProductId(String sku) as the map/set key, keeping Product fully mutable as the VALUE. That split - immutable identity key, mutable state value - eliminates symptom two by construction and makes caching safe. General principle worth stating: when identity and state evolve independently, do not let one hashCode serve both.'
    },
    {
      situation:
        'A junior teammate asks why this code prints false: new String("shop") == new String("shop"), while s1.equals(s2) prints true - and wants to know when == on objects is EVER correct.',
      question: '"Explain identity versus equality, and give the rules for when == is appropriate."',
      answer:
        '== compares references - "same object in memory"; equals compares content - per the class\'s own definition. Two separate String objects hold identical characters (equals true) while living at different addresses (== false). The confusion arises because string LITERALS are interned into the string pool, so "shop" == "shop" happens to be true and trains people wrongly - until one side comes from user input or concatenation at runtime and the accident stops repeating. Rules for ==: primitives always; enums (each constant is a singleton by specification - == is actually PREFERRED there); deliberate identity checks like comparing to a sentinel or guarding against self-assignment inside equals itself. Everything else: Objects.equals for null safety. In collections terms this matters mechanically too - HashMap\'s bin walk checks hash first, then == as a fast-path optimization, THEN equals - so identity-equal short-circuits are an optimization layer, never the semantic definition.'
    }
  ],

  rapidFire: [
    {
      question: 'State the equals-hashCode contract.',
      answer:
        'If two objects are equal by equals(), they must return the same hashCode; unequal objects may share a hash code, and results must stay consistent while the object is in a hash-based collection.'
    },
    {
      question: 'What breaks if you override equals but not hashCode?',
      answer:
        'Equal objects keep different hash codes, land in different buckets, so HashSet stores duplicates and HashMap.get returns null for keys that are present.'
    },
    {
      question: 'What breaks if you override hashCode but not equals?',
      answer:
        'Objects route to the right bucket but the final check stays reference identity, so logically-equal objects still count as different.'
    },
    {
      question: 'Can two unequal objects have the same hashCode?',
      answer:
        'Yes - that is a collision, legal by contract; the bucket handles it with a list or tree and resolves membership using equals.'
    },
    {
      question: 'Why is String commonly used as a HashMap key?',
      answer:
        'It is immutable so its hashCode never goes stale, and String caches its hash after first computation making repeated lookups cheap.'
    },
    {
      question: 'How do records relate to equals and hashCode?',
      answer:
        'Records auto-generate both - plus toString - from their components, making them the default choice for value objects and map keys in modern Java.'
    },
    {
      question: 'Is it okay for hashCode to throw the same value for every object?',
      answer:
        'Legally yes - the contract survives - but every entry collides into one bucket, collapsing O(1) lookups to O(n) scans; technically valid, practically broken.'
    }
  ],

  interviewPerspective:
    'This lesson arms you against the highest-frequency follow-up in Map discussions. Deliver the contract, then IMMEDIATELY volunteer the mechanism ("because routing happens before comparison") - that one sentence separates explainers from reciters. Strong closers: mention records as the modern default, flag the mutable-key landmine unprompted, and connect to String pooling. If the interviewer pushes edge cases, they are testing symmetry with inheritance and consistency under mutation - both covered above.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'hashmap-internals',
      title: 'HashMap Internals',
      note: 'The routing machinery these methods feed - bucket selection, treeification, resize.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'set-family-internals',
      title: 'HashSet, LinkedHashSet & TreeSet',
      note: 'Where add() rejection semantics come alive - next lesson.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'string-pool-interning',
      title: 'String Pool & Interning',
      note: 'Why literal == accidents happen at all - interning explained end-to-end.'
    }
  ],

  triggerSentence:
    'hashCode picks the street, equals knocks on the door - break either and the parcel never arrives.'
};

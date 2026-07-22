import { ConceptContent } from '../../models/content.model';

export const SERIALIZATION: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'serialization',
  title: 'Serialization',

  hook:
    'You add one new field to a class that gets cached to disk between deployments. After the next deploy, every cached ' +
    'object fails to load with `InvalidClassException`. Nothing about the field itself was wrong — so what actually broke?',

  problem:
    'Serialization turns a live object into a stream of bytes (to save to disk, send over a network, or cache) and back ' +
    "again. It looks like a solved, invisible problem — until the class on the READING side is even slightly different " +
    "from the class that WROTE the bytes, at which point deserialization can fail outright, or silently produce a " +
    "subtly wrong object.",

  aha: {
    statement: "Serialization doesn't save the object — it saves a snapshot of the object's SHAPE plus its data, and deserialization only works if the class's shape still matches closely enough.",
    analogy:
      "It's like taking a photo of a fully-assembled piece of furniture, then months later trying to reconstruct it from " +
      "just the photo. If the manufacturer changed the design slightly (added a new required bracket), the photo alone " +
      "might not be enough to rebuild it correctly — or the rebuild might silently be missing the new part entirely."
  },

  underTheHood: [
    'A class implements `java.io.Serializable` (a marker interface — no methods to implement) to opt into being convertible to a byte stream via `ObjectOutputStream`.',
    'Every serializable class has a `serialVersionUID` — either explicitly declared or auto-computed by the JVM from the class\'s structure (fields, methods, etc.) if you omit it.',
    'When deserializing, the JVM compares the `serialVersionUID` embedded in the byte stream against the CURRENT class\'s `serialVersionUID`. If they don\'t match, deserialization fails immediately with `InvalidClassException`.',
    'If you never explicitly declare `serialVersionUID`, the JVM auto-computes it from the class\'s exact structure — meaning almost ANY change to the class (adding a field, even reordering members in some compilers) can silently change the auto-computed UID and break deserialization of old data.',
    '`transient` fields are explicitly excluded from serialization — useful for fields that are either not meaningful to persist (a cache, a lock object) or cannot be serialized at all (a Thread, a database Connection).',
    'Modern systems increasingly avoid Java\'s built-in serialization entirely in favor of JSON (Jackson) or binary formats (Protobuf, Avro) — Java serialization has a long history of security vulnerabilities (deserializing untrusted bytes can execute arbitrary code) and poor cross-language/cross-version compatibility.'
  ],

  inTheWild: [
    'A distributed cache (objects serialized to Redis/Memcached) that fails to deserialize for every user after a routine deploy that only added one innocuous field to a cached class.',
    'A well-known, serious security class of vulnerability: deserializing untrusted, attacker-controlled bytes can trigger arbitrary code execution via crafted objects — this is exactly why many security guidelines recommend avoiding native Java serialization for any externally-facing data.',
    'Interview question: "Why should you always explicitly declare `serialVersionUID`?" — because letting the JVM auto-compute it means any structural change to the class can silently invalidate every already-serialized instance of it.'
  ],

  showMe: {
    caption: 'A class relying on an auto-computed serialVersionUID vs one that declares it explicitly and handles evolution safely.',
    bad: {
      language: 'java',
      code:
        'class CachedUser implements Serializable {\n' +
        '    // No explicit serialVersionUID — the JVM auto-computes one from the class shape\n' +
        '    private String name;\n' +
        '    private int age;\n' +
        '}\n' +
        '// Later: adding a field "email" recompiles to a DIFFERENT auto-computed UID,\n' +
        '// making every already-cached CachedUser object fail to deserialize.',
      explanation:
        'Without an explicit UID, the compiler derives one from the class\'s exact structure — adding, removing, or even ' +
        'reordering members can silently change it, invalidating every object serialized under the old shape.'
    },
    good: {
      language: 'java',
      code:
        'class CachedUser implements Serializable {\n' +
        '    private static final long serialVersionUID = 1L; // explicit, stable, controlled by you\n' +
        '    private String name;\n' +
        '    private int age;\n' +
        '    private String email; // new field — old data deserializes fine, email defaults to null\n' +
        '}',
      explanation:
        'With an explicit, stable serialVersionUID, adding a new field is backward-compatible — old serialized objects ' +
        'still deserialize successfully, with the new field simply defaulting to null/0, instead of failing outright.'
    }
  },

  impact: {
    before: 'A routine field addition breaks deserialization of every previously cached/persisted object after deploy.',
    after: 'The same field addition deserializes old data safely, with the new field defaulting sensibly.',
    metric: 'Explicitly declaring serialVersionUID turns "any structural change might break production caches" into "additive changes are safe" — a meaningful reliability improvement for any long-lived serialized data.'
  },

  alternatives: [
    {
      name: 'Java native serialization (Serializable)',
      whenToUse: 'Simple, internal, trusted, short-lived use cases (e.g. passing objects between JVMs you fully control) where convenience matters more than cross-version/cross-language compatibility.',
      whenNotToUse: 'Anything touching untrusted input, long-term storage, or cross-service/cross-language communication — security risk and poor evolution support make it a poor fit.'
    },
    {
      name: 'JSON (Jackson, Gson)',
      whenToUse: 'Human-readable, cross-language data interchange (REST APIs, config files, logs) — the modern default for most application data.',
      whenNotToUse: 'Extremely high-throughput, size-sensitive scenarios where binary formats offer meaningfully better performance/size.'
    },
    {
      name: 'Binary formats (Protobuf, Avro)',
      whenToUse: 'High-throughput internal service-to-service communication where message size and parsing speed genuinely matter, with well-defined schema evolution rules.',
      whenNotToUse: "Human-readability or debuggability matters, or the extra schema-management overhead isn't worth it for low-volume use cases."
    }
  ],

  commonMistakes: [
    {
      mistake: 'Serializing objects that hold references to non-serializable resources (a database Connection, a Thread, an open file handle) without marking them `transient`.',
      why:
        'It compiles fine and even seems to work in quick manual testing, but the moment that specific object graph is actually ' +
        'serialized (e.g. under real load, hitting a code path with an active connection), it throws `NotSerializableException` at runtime, often in a completely unexpected place.',
      fix:
        'Mark any field that cannot or should not be persisted (locks, connections, caches, threads) as `transient`, and ' +
        "explicitly reconstruct or reinitialize those fields (e.g. via a custom readObject method) after deserialization if needed."
    }
  ],

  proveIt: {
    question:
      'A class implements Serializable but does NOT declare an explicit serialVersionUID. You add a new field and redeploy. ' +
      'Will previously-serialized instances of the OLD class version still deserialize successfully?',
    answer:
      'Not reliably — without an explicit serialVersionUID, the JVM auto-computes one from the class\'s structure, and ' +
      'adding a field commonly changes that computed value, causing InvalidClassException when trying to deserialize the older bytes.'
  },

  oneLiner: "Serialization saves a snapshot of a class's shape, not a guarantee that shape will still match — always declare serialVersionUID explicitly.",

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'reflection',
      title: 'Reflection',
      note: "Java's built-in serialization mechanism uses reflection internally to inspect and populate an object's fields without calling its normal constructor."
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'security',
      title: 'Security',
      note: 'Deserializing untrusted data is one of the most well-documented, serious real-world Java security vulnerabilities — this connection is essential context, not optional.'
    }
  ]
};

import { ConceptContent } from '../../models/content.model';

export const FILE_PROCESSING_JSON: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'file-processing-json',
  title: 'File Processing: JSON',

  hook:
    'A client sends a JSON body with a date field formatted slightly differently than your server expects, and instead ' +
    'of a clean error, your endpoint returns a confusing 500 with a stack trace mentioning a class you have never heard of, InvalidFormatException.',

  problem:
    'JSON is just text. Turning that text into real Java objects, and real Java objects back into JSON text, requires a ' +
    'library that reliably handles every type mismatch, missing field, and format quirk, or every endpoint ends up ' +
    'writing its own fragile, ad hoc parsing logic.',

  aha: {
    statement: 'A JSON library like Jackson handles the entire translation between JSON text and Java objects declaratively, through annotations and configuration, rather than manual field by field parsing.',
    analogy:
      'It is like a professional translator who already knows both languages fluently, rather than you looking up every single word in a dictionary by hand. You just hand over the document (your object, or the raw JSON) and trust the translation to be correct and complete.'
  },

  underTheHood: [
    'Jackson (the library Spring Boot uses by default) uses reflection to map JSON field names to Java class field names automatically, matching "firstName" in JSON to a firstName field in the class, with zero manual mapping code needed for the common case.',
    '@JsonProperty renames a field mapping when the JSON key does not match the Java field name exactly. @JsonIgnore excludes a field from serialization entirely, useful for things like password hashes that should never leave the server.',
    '@JsonInclude(JsonInclude.Include.NON_NULL) omits null fields from the output JSON entirely, rather than serializing them as explicit null values, which matters for API payload size and clarity.',
    'A dedicated ObjectMapper instance does the actual conversion: objectMapper.writeValueAsString(obj) serializes an object to JSON text, and objectMapper.readValue(json, MyClass.class) deserializes JSON text back into an object.',
    'Custom serializers and deserializers (extending JsonSerializer / JsonDeserializer) handle cases the default mapping cannot, like a specific date format, or converting between a domain concept and its JSON representation in a non obvious way.',
    'Streaming APIs (JsonParser, JsonGenerator) process JSON token by token instead of loading the entire document into memory at once, essential for genuinely large JSON files that would otherwise not fit comfortably in memory.'
  ],

  inTheWild: [
    'A Spring Boot @RestController method with a @RequestBody parameter, where Jackson automatically deserializes the incoming JSON into that parameter\'s type before the method body ever runs, with zero manual parsing code.',
    'An API deliberately using @JsonIgnore on a password field so that, no matter how a User entity is later modified or extended, that field can never accidentally leak into a JSON response.',
    'Interview question: "How does Jackson know which JSON field maps to which Java field?" By default, through reflection matching field names (case sensitively) between the JSON keys and the class\'s fields, with annotations like @JsonProperty available to override that mapping explicitly.'
  ],

  showMe: {
    caption: 'Manually parsing a JSON string field by field versus letting Jackson handle the mapping declaratively.',
    bad: {
      language: 'java',
      code:
        'JSONObject json = new JSONObject(rawJsonString);\n' +
        'String name = json.getString("name");\n' +
        'int age = json.getInt("age");\n' +
        'String email = json.optString("email", null); // manual null handling per field\n' +
        '// repeated, brittle, and rewritten for every single class',
      explanation:
        'Every field needs its own manual extraction call, its own type handling, and its own null check, none of which is reusable across different classes.'
    },
    good: {
      language: 'java',
      code:
        'public class Person {\n' +
        '    private String name;\n' +
        '    private int age;\n' +
        '    @JsonInclude(JsonInclude.Include.NON_NULL)\n' +
        '    private String email;\n' +
        '}\n\n' +
        'Person person = objectMapper.readValue(rawJsonString, Person.class);',
      explanation:
        'Jackson handles field matching, type conversion, and null handling automatically, based purely on the class definition, with no manual parsing code at all.'
    }
  },

  impact: {
    before: 'Every endpoint or class needing JSON conversion writes its own fragile, manual, field by field parsing logic.',
    after: 'JSON conversion is declarative, defined once on the class itself, and reused automatically everywhere that class is serialized or deserialized.',
    metric: 'For a typical API surface with dozens of DTOs, declarative JSON mapping eliminates what would otherwise be a large amount of repetitive, error prone manual parsing code.'
  },

  alternatives: [
    {
      name: 'Jackson (Spring Boot default)',
      whenToUse: 'The overwhelming majority of REST API JSON handling, given its deep, automatic integration with Spring.',
      whenNotToUse: 'Extremely performance critical, high throughput serialization paths where a lower level, purpose built library may squeeze out more raw speed.'
    },
    {
      name: 'Gson',
      whenToUse: 'Simpler standalone JSON handling outside a Spring context, or projects with an existing Gson dependency.',
      whenNotToUse: 'Spring applications, where Jackson\'s integration is already built in and better supported.'
    },
    {
      name: 'Manual / raw parsing',
      whenToUse: 'Truly trivial, one off scripts handling a tiny, fixed, known JSON shape.',
      whenNotToUse: 'Any real application with evolving data shapes, where manual parsing becomes a maintenance liability almost immediately.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Exposing a JPA entity directly as a @RestController return type instead of a dedicated DTO, and forgetting to @JsonIgnore sensitive or lazy loaded fields.',
      why:
        'Jackson will happily try to serialize EVERY field on the entity, including sensitive fields like password hashes, and can trigger a LazyInitializationException trying to serialize an unfetched lazy relationship outside its session.',
      fix: 'Use dedicated DTOs for API responses instead of exposing entities directly, giving explicit, deliberate control over exactly what gets serialized.'
    }
  ],

  proveIt: {
    question: 'A JPA entity with a lazy loaded @OneToMany relationship is returned directly from a @RestController method. What is a likely failure mode?',
    answer:
      'A LazyInitializationException, because Jackson tries to serialize the lazy collection during JSON conversion, which happens after the transaction (and Hibernate session) that would have let it fetch that data has already closed.'
  },

  oneLiner: 'JSON conversion is only "automatic" because a library like Jackson is quietly doing, and hiding, all the actual translation work.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'api-design',
      conceptId: 'rest',
      title: 'REST',
      note: 'JSON is the near universal payload format REST APIs use, making Jackson the invisible translation layer underneath almost every REST endpoint.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'hibernate-entity-lifecycle',
      title: 'Hibernate Entity Lifecycle',
      note: 'Serializing an entity directly, rather than a DTO, exposes exactly the kind of lazy loading and lifecycle pitfalls this concept covers.'
    }
  ]
};

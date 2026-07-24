import { ConceptContent } from '../../models/content.model';

export const FILE_PROCESSING_XML: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'file-processing-xml',
  title: 'File Processing: XML',

  hook:
    'An integration with a legacy banking partner requires sending and receiving XML, not JSON, because their systems ' +
    'were built decades before JSON existed and are not changing for anyone. You cannot pick your format, you have to speak theirs.',

  problem:
    'XML remains the required format for a lot of enterprise, government, and legacy system integrations. Parsing and ' +
    'generating it correctly, handling namespaces, attributes, nested elements, without a proper library means writing ' +
    'fragile, error prone string manipulation.',

  aha: {
    statement: 'Java has multiple, purpose built ways to parse and generate XML declaratively, from the simple, class annotation based JAXB to the low level, memory efficient StAX, chosen based on how large or complex the document actually is.',
    analogy:
      'It is like choosing between reading an entire book cover to cover before answering a question (DOM, loads it all into memory) versus reading it one page at a time and only remembering what matters as you go (StAX, streaming). Both get you the answer, but one uses vastly more memory for a very large book.'
  },

  underTheHood: [
    'DOM parsing loads the entire XML document into an in memory tree structure, letting you navigate freely in any direction, at the cost of memory proportional to the whole document\'s size, a real problem for genuinely large files.',
    'SAX and StAX parse the document as a stream of events (element start, element end, text content) without loading it all into memory at once, ideal for large documents where only a small amount of processed data actually needs to be retained.',
    'JAXB (Jakarta XML Binding) maps XML directly to and from annotated Java classes, similar in spirit to how Jackson maps JSON, using @XmlRootElement, @XmlElement, and @XmlAttribute to declare the mapping once on the class itself.',
    'XML namespaces (xmlns declarations) exist to prevent element name collisions when combining XML from multiple sources, and need to be explicitly configured in whichever parsing approach you choose, or elements silently fail to match.',
    'XML External Entity (XXE) processing is a genuine, serious security risk: a maliciously crafted XML document can reference external entities to read arbitrary local files or make the server issue unintended network requests, unless external entity processing is explicitly disabled on the parser.',
    'XSD (XML Schema Definition) documents describe the expected structure of valid XML for a given format, and can be used to validate an incoming document\'s shape before ever attempting to actually process its content.'
  ],

  inTheWild: [
    'A payment processing integration with a bank exchanging SOAP/XML messages, using JAXB to map incoming XML request bodies directly to annotated Java classes.',
    'A large data export job using StAX to stream a multi gigabyte XML file, processing each record as it is read rather than attempting to load the entire file into memory at once, which would exhaust available heap.',
    'Interview question: "Why is XML parsing a genuine security concern?" Because a naively configured XML parser may process XML External Entities (XXE) by default, which malicious input can exploit to read local files or trigger unintended outbound network requests from the server.'
  ],

  showMe: {
    caption: 'An XML parser vulnerable to XXE by default versus one with external entity processing explicitly disabled.',
    bad: {
      language: 'java',
      code:
        'DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();\n' +
        'DocumentBuilder builder = factory.newDocumentBuilder();\n' +
        'Document doc = builder.parse(untrustedInputStream);\n' +
        '// default configuration processes external entities, a real XXE vulnerability',
      explanation:
        'A maliciously crafted XML document with an external entity declaration referencing a local file can, with this default configuration, have that file\'s contents read and embedded into the parsed result.'
    },
    good: {
      language: 'java',
      code:
        'DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();\n' +
        'factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);\n' +
        'factory.setXIncludeAware(false);\n' +
        'factory.setExpandEntityReferences(false);\n' +
        'DocumentBuilder builder = factory.newDocumentBuilder();\n' +
        'Document doc = builder.parse(untrustedInputStream);',
      explanation:
        'Disabling DOCTYPE declarations and entity expansion removes the specific mechanism XXE attacks rely on, while still parsing legitimate, well formed XML correctly.'
    }
  },

  impact: {
    before: 'An XML parser configured with defaults can be tricked, via a crafted input document, into reading arbitrary local files or making unintended network calls.',
    after: 'External entity processing is explicitly disabled, closing off the entire XXE attack surface while still handling legitimate XML normally.',
    metric: 'XXE has appeared in the OWASP Top 10 specifically because it is both a severe vulnerability and an extremely common oversight, since most XML parser defaults are NOT secure out of the box.'
  },

  alternatives: [
    {
      name: 'JAXB (annotation based binding)',
      whenToUse: 'Structured, class friendly XML like SOAP messages or config files, where declarative mapping to Java objects is the clearest approach.',
      whenNotToUse: 'Extremely large documents, where loading the equivalent object graph into memory at once is impractical.'
    },
    {
      name: 'StAX / SAX (streaming)',
      whenToUse: 'Very large XML documents, where memory efficiency matters more than the convenience of a fully materialized object tree.',
      whenNotToUse: 'Smaller documents where the added complexity of manual event handling is not worth the memory savings.'
    },
    {
      name: 'DOM',
      whenToUse: 'Smaller documents needing flexible, random access navigation, editing, or repeated traversal.',
      whenNotToUse: 'Large documents, where loading the entire tree into memory is wasteful or impossible.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Parsing untrusted XML input with a parser\'s default configuration, without explicitly disabling external entity and DOCTYPE processing.',
      why:
        'Most Java XML parser defaults were designed for correctness and compatibility, not security, and quietly allow external entity resolution unless you explicitly turn it off, making XXE a very easy vulnerability to introduce by simply not configuring anything.',
      fix: 'Always explicitly disable DOCTYPE declarations and external entity processing when parsing XML from any source that is not fully trusted.'
    }
  ],

  proveIt: {
    question: 'A service parses XML uploaded by external users using a DocumentBuilderFactory with entirely default settings. What is the specific security risk?',
    answer:
      'XML External Entity (XXE) injection. A malicious document can declare an external entity that the default configured parser will resolve, potentially reading arbitrary local files on the server or triggering unintended outbound network requests.'
  },

  oneLiner: 'An XML parser\'s convenient defaults and its secure defaults are not the same thing, and assuming otherwise is exactly how XXE vulnerabilities get shipped.',

  connections: [
    {
      categoryId: 'system-design',
      topicId: 'security-engineering',
      conceptId: 'owasp-top-10',
      title: 'OWASP Top 10',
      note: 'XXE is a well known, historically significant entry related to injection and misconfiguration risks covered by the OWASP Top 10.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'file-processing-json',
      title: 'File Processing: JSON',
      note: 'JSON has largely replaced XML for new APIs precisely because it has a smaller attack surface and simpler parsing model, though XML remains required for many legacy integrations.'
    }
  ]
};

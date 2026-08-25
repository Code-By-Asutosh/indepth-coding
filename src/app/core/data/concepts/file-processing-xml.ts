import { ConceptContent } from '../../models/content.model';

export const FILE_PROCESSING_XML: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "file-processing-xml",
  title: "File Processing: XML",
  topicType: "framework",
  simpleIntuition: "An integration with a legacy banking partner requires sending and receiving XML, not JSON, because their systems were built decades before JSON existed and are not changing for anyone. You cannot pick your format, you have to speak theirs.",
  formalMeaning: "Java has multiple, purpose built ways to parse and generate XML declaratively, from the simple, class annotation based JAXB to the low level, memory efficient StAX, chosen based on how large or complex the document actually is.",
  whyItExists: "XML remains the required format for a lot of enterprise, government, and legacy system integrations. Parsing and generating it correctly, handling namespaces, attributes, nested elements, without a proper library means writing fragile, error prone string manipulation.",
  howItWorksInternally: [
    "DOM parsing loads the entire XML document into an in memory tree structure, letting you navigate freely in any direction, at the cost of memory proportional to the whole document's size, a real problem for genuinely large files.",
    "SAX and StAX parse the document as a stream of events (element start, element end, text content) without loading it all into memory at once, ideal for large documents where only a small amount of processed data actually needs to be retained.",
    "JAXB (Jakarta XML Binding) maps XML directly to and from annotated Java classes, similar in spirit to how Jackson maps JSON, using @XmlRootElement, @XmlElement, and @XmlAttribute to declare the mapping once on the class itself.",
    "XML namespaces (xmlns declarations) exist to prevent element name collisions when combining XML from multiple sources, and need to be explicitly configured in whichever parsing approach you choose, or elements silently fail to match.",
    "XML External Entity (XXE) processing is a genuine, serious security risk: a maliciously crafted XML document can reference external entities to read arbitrary local files or make the server issue unintended network requests, unless external entity processing is explicitly disabled on the parser.",
    "XSD (XML Schema Definition) documents describe the expected structure of valid XML for a given format, and can be used to validate an incoming document's shape before ever attempting to actually process its content."
  ],
  mainComponents: [
    "It is like choosing between reading an entire book cover to cover before answering a question (DOM, loads it all into memory) versus reading it one page at a time and only remembering what matters as you go (StAX, streaming). Both get you the answer, but one uses vastly more memory for a very large book."
  ],
  realWorldExamples: [
    "A payment processing integration with a bank exchanging SOAP/XML messages, using JAXB to map incoming XML request bodies directly to annotated Java classes.",
    "A large data export job using StAX to stream a multi gigabyte XML file, processing each record as it is read rather than attempting to load the entire file into memory at once, which would exhaust available heap.",
    "Interview question: \"Why is XML parsing a genuine security concern?\" Because a naively configured XML parser may process XML External Entities (XXE) by default, which malicious input can exploit to read local files or trigger unintended outbound network requests from the server."
  ],
  complexityAndTradeoffs: [
    "Before: An XML parser configured with defaults can be tricked, via a crafted input document, into reading arbitrary local files or making unintended network calls.",
    "After: External entity processing is explicitly disabled, closing off the entire XXE attack surface while still handling legitimate XML normally.",
    "XXE has appeared in the OWASP Top 10 specifically because it is both a severe vulnerability and an extremely common oversight, since most XML parser defaults are NOT secure out of the box.",
    "JAXB (annotation based binding): use it when structured, class friendly XML like SOAP messages or config files, where declarative mapping to Java objects is the clearest approach. Avoid it when extremely large documents, where loading the equivalent object graph into memory at once is impractical.",
    "StAX / SAX (streaming): use it when very large XML documents, where memory efficiency matters more than the convenience of a fully materialized object tree. Avoid it when smaller documents where the added complexity of manual event handling is not worth the memory savings.",
    "DOM: use it when smaller documents needing flexible, random access navigation, editing, or repeated traversal. Avoid it when large documents, where loading the entire tree into memory is wasteful or impossible."
  ],
  commonMistakes: [
    "Parsing untrusted XML input with a parser's default configuration, without explicitly disabling external entity and DOCTYPE processing. Most Java XML parser defaults were designed for correctness and compatibility, not security, and quietly allow external entity resolution unless you explicitly turn it off, making XXE a very easy vulnerability to introduce by simply not configuring anything. Fix: Always explicitly disable DOCTYPE declarations and external entity processing when parsing XML from any source that is not fully trusted."
  ],
  interviewPerspective: "A common way this gets tested: \"A service parses XML uploaded by external users using a DocumentBuilderFactory with entirely default settings. What is the specific security risk?\" XML External Entity (XXE) injection. A malicious document can declare an external entity that the default configured parser will resolve, potentially reading arbitrary local files on the server or triggering unintended outbound network requests.",
  triggerSentence: "An XML parser's convenient defaults and its secure defaults are not the same thing, and assuming otherwise is exactly how XXE vulnerabilities get shipped."
};

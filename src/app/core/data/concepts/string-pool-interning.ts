import { ConceptContent } from '../../models/content.model';

export const STRING_POOL_INTERNING: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "string-pool-interning",
  title: "String Pool & Interning",
  topicType: "concept",
  simpleIntuition: "`\"hello\" == \"hello\"` prints `true`. `new String(\"hello\") == new String(\"hello\")` prints `false`. Both are comparing two Strings that clearly contain the identical text. Why does one give you the answer you expected, and the other betray you?",
  formalMeaning: "`==` compares WHERE two references point (identity), never WHAT they contain (content) - Strings created via literals happen to often point to the same shared object, but that is an optimization detail, not a content-equality guarantee.",
  whyItExists: "Using `==` to compare Strings in Java is one of the most common beginner mistakes, and it \"accidentally works\" often enough (thanks to the String pool) that developers frequently do not learn the actual rule until it fails silently in production with a subtly different code path.",
  howItWorksInternally: [
    "String literals (`\"hello\"`) are automatically placed in a special JVM area called the String pool. If the exact same literal text appears anywhere else in the program, the JVM reuses the SAME pooled object instead of creating a new one.",
    "That is why `\"hello\" == \"hello\"` is true - both literals resolve to the identical pooled object at compile time, so `==` (reference identity) correctly reports they are the same object.",
    "`new String(\"hello\")` explicitly forces the creation of a brand NEW String object on the heap, separate from the pool - even though its content is identical text, it is a genuinely different object, so `==` correctly reports false.",
    "`.intern()` manually adds a String's content to the pool (or returns the existing pooled instance if that exact content is already there) - calling `new String(\"hello\").intern() == \"hello\"` is true, because intern() explicitly opts into pool-sharing.",
    "Strings are immutable specifically BECAUSE of this pooling - if String objects could be mutated after creation, changing one pooled \"hello\" would corrupt every other unrelated piece of code in the JVM that also happens to be using that exact same shared literal.",
    "`.equals()` always compares actual character content, regardless of whether the two String objects are pooled, newly-created, or built via concatenation - this is the ONLY correct way to compare Strings for equality in normal code."
  ],
  mainComponents: [
    "Think of the String pool like a library's single shared copy of a popular book everyone reads without checking it out (a literal). `==` asks 'are you looking at the EXACT SAME physical copy?' `new String(...)` is like personally photocopying that book yourself - your photocopy has identical WORDS, but it is a different physical object sitting on a different desk, so `==` correctly says 'no, not the same physical book,' even though `.equals()` (comparing actual words) would say they match perfectly."
  ],
  realWorldExamples: [
    "A subtle bug where `if (userInput == \"admin\")` appears to work in a quick manual test (because `\"admin\"` as a literal happens to be pooled) but fails for input that arrived via `new String(...)`, `substring()`, or string concatenation at runtime, which do not automatically share the pooled instance.",
    "Interning being used deliberately as a memory-optimization technique for applications processing huge volumes of text with many repeated substrings (e.g. certain data-parsing pipelines), trading a bit of CPU time for reduced memory duplication.",
    "Interview question: \"Why does `'hello' == 'hello'` return true but `new String('hello') == new String('hello')` return false?\" - this is one of the most classic, most frequently asked Java interview questions, and correctly explaining the pool (not just memorizing the answer) is what separates genuine understanding."
  ],
  complexityAndTradeoffs: [
    "Before: Identity-based comparison that works by coincidence for literals and silently fails for runtime-constructed Strings.",
    "After: Content-based comparison that behaves correctly and consistently regardless of how either String was created.",
    "This single habit change (`.equals()` instead of `==`) eliminates one of the most common, most classic sources of \"why does this work in testing but not in production\" String bugs in Java.",
    ".equals() for String comparison: use it when always, for comparing String CONTENT - this should be the automatic default reflex for any String comparison. Avoid it when never for content comparison - there is no legitimate reason to prefer == over .equals() for comparing what two Strings say.",
    "== for String comparison: use it when only when you specifically and deliberately want to check object IDENTITY (are these literally the same object in memory), which is a rare, specialized need, not everyday string comparison. Avoid it when any normal \"do these strings say the same thing\" check - this is the classic, well-documented mistake."
  ],
  commonMistakes: [
    "Comparing Strings with == in code that \"seems to work\" during manual testing, because the test happened to use literal values that were pooled. Literals in the same compilation unit (or across classes, since the pool is JVM-wide) are commonly pooled and therefore == \"accidentally\" succeeds - but any String arriving from user input, a database, a network response, or a substring/concatenation operation is NOT guaranteed to be pooled, so the exact same code silently breaks the moment real, non-literal data flows through it. Fix: Always use .equals() (or .equalsIgnoreCase()) for String content comparison, with zero exceptions, regardless of how confident you are that a value \"should\" be pooled."
  ],
  interviewPerspective: "A common way this gets tested: \"Given `String a = \"test\"; String b = \"te\" + \"st\";` (both parts are compile-time constants), does `a == b` evaluate to true or false, and why?\" True - the Java compiler performs constant folding on concatenated STRING LITERALS at compile time, so `\"te\" + \"st\"` is resolved to the literal `\"test\"` before the program even runs, and both a and b end up pointing to the same pooled object.",
  triggerSentence: "== asks \"is this the exact same object,\" .equals() asks \"does this say the same thing\" - String comparison always needs the second question."
};

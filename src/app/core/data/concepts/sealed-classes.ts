import { ConceptContent } from '../../models/content.model';

export const SEALED_CLASSES: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "sealed-classes",
  title: "Sealed Classes",
  topicType: "concept",
  simpleIntuition: "You write a `switch` over every known subtype of `Shape` and handle all three cases. Six months later, a teammate adds a fourth `Shape` subtype in a different file. Your switch still compiles - and silently does nothing for the new case. Nobody gets a warning.",
  formalMeaning: "A sealed class/interface declares the COMPLETE, closed list of everything allowed to extend or implement it - nothing else can ever be added without changing that declaration.",
  whyItExists: "A normal interface or abstract class can be extended by ANYONE, ANYWHERE, at ANY time - which sounds flexible, but means the compiler can never tell you \"you have handled every possible case,\" because it has no idea what the full set of subtypes even is. This is exactly the gap sealed classes were introduced to close.",
  howItWorksInternally: [
    "`sealed interface Shape permits Circle, Square, Triangle {}` declares that ONLY Circle, Square, and Triangle are allowed to implement Shape - any other class attempting to implement it fails to compile.",
    "Every class listed in `permits` must be either `final` (cannot be extended further), `sealed` itself (continuing the closed hierarchy with its own restricted permits list), or `non-sealed` (explicitly reopening that one branch to unlimited extension).",
    "Because the compiler knows the COMPLETE set of permitted subtypes, a `switch` expression over a sealed type can be checked for EXHAUSTIVENESS - if you handle all permitted subtypes, you do not even need a `default` branch, and the compiler will actually ERROR if you forget one.",
    "This combination (sealed types + exhaustive switch + records for data) is what makes modern Java pattern matching genuinely safe for representing \"one of a fixed, known set of shapes\" - a pattern very close to algebraic data types in functional languages.",
    "Sealed types live in the same file, or the same module, as their permitted subtypes are usually required to be - the compiler needs visibility into the full permitted set to enforce it, which naturally keeps the whole hierarchy grouped and reviewable in one place."
  ],
  mainComponents: [
    "A normal interface is like a public sign-up sheet anyone can add their name to, at any time, from anywhere. A sealed interface is like a wedding guest list finalized and printed in advance - the exact set of guests is known completely ahead of time, so the caterer can safely prepare food for EXACTLY that list and know nothing is missing."
  ],
  realWorldExamples: [
    "Modeling an API result as `sealed interface ApiResult permits Success, Failure {}` - a switch over ApiResult is guaranteed by the compiler to handle both, and a THIRD outcome literally cannot be added without a compile error somewhere.",
    "Representing a JSON value type (`sealed interface JsonValue permits JsonString, JsonNumber, JsonObject, JsonArray, JsonNull {}`) so that any code processing JSON is forced by the compiler to handle every possible shape.",
    "Interview question: \"How do sealed classes make switch expressions safer?\" - because the compiler knows the complete permitted set, it can verify every case is handled and reject a missing branch at compile time, instead of silently falling through at runtime."
  ],
  complexityAndTradeoffs: [
    "Before: A new subtype silently falls through every \"unknown\"/default branch in the codebase, discovered only when a user reports missing behavior.",
    "After: Adding a new permitted subtype causes every exhaustive switch handling that sealed type to fail to compile until updated.",
    "This shifts an entire class of \"we forgot to update that one switch statement\" bugs from a production incident to a build failure - caught before the code ever ships.",
    "sealed interface/class with exhaustive switch: use it when you have a genuinely fixed, closed set of variants (an API result, a payment method type, a shape) and want the compiler to guarantee every case is handled everywhere. Avoid it when the set of subtypes is genuinely meant to be open-ended and extensible by other modules/consumers (e.g. a plugin architecture) - use a normal open interface there instead.",
    "Open interface + enum-based type tag: use it when legacy codebases not yet on a modern Java version, or genuinely needing runtime-extensible behavior. Avoid it when any new code on a modern JDK modeling a closed set of variants - sealed types are strictly safer and clearer intent."
  ],
  commonMistakes: [
    "Adding a new permitted subtype to a sealed hierarchy without checking every exhaustive switch that handles it, and just adding a broad `default` case everywhere to make the compiler stop complaining. A blanket `default` case defeats the entire purpose of exhaustiveness checking - the whole reason to use sealed types is so the compiler forces a deliberate decision for each new case; a catch-all default silently reintroduces the exact bug class sealed types were meant to prevent. Fix: When the compiler flags a non-exhaustive switch after adding a new subtype, add a genuine, considered case for it - resist the shortcut of adding `default -> {}` just to make the error disappear."
  ],
  interviewPerspective: "A common way this gets tested: \"A `sealed interface Shape permits Circle, Square {}` has an exhaustive switch handling both cases with no default branch. A teammate later adds `record Triangle(...) implements Shape` to the permits list. What happens to that existing switch?\" It fails to compile - the compiler now knows Shape has three permitted subtypes, and the existing switch only handles two, so it is no longer exhaustive; the build breaks until a Triangle case is added.",
  triggerSentence: "Sealed types turn \"did we forget a case?\" from a runtime guessing game into a compile-time guarantee."
};

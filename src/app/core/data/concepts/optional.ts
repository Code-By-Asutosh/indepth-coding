import { ConceptContent } from '../../models/content.model';

export const OPTIONAL: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'optional',
  title: 'Optional',

  hook:
    'You replace `User user = null;` with `Optional<User> user = Optional.empty();` and then immediately write ' +
    '`user.get()` without checking anything first - and get a `NoSuchElementException`. You just reinvented NullPointerException with extra steps.',

  problem:
    "`Optional` is often adopted as a superficial find-and-replace for null (\"Optional looks modern, so wrap everything " +
    "in it\") without adopting the actual DISCIPLINE it exists to enforce - forcing the caller to consciously handle the " +
    "absent case instead of silently assuming a value is always present.",

  aha: {
    statement: "Optional's entire value comes from FORCING you to explicitly decide what happens when a value is absent - using .get() without checking throws away that entire benefit.",
    analogy:
      "A regular return type is like handing someone a box that might secretly be empty, with no label warning them - " +
      "they open it assuming there's something inside (this is exactly how null causes NullPointerException). Optional is " +
      "like handing someone a box explicitly labeled 'MIGHT BE EMPTY - CHECK BEFORE OPENING,' with a required lid you " +
      "physically cannot open without first choosing what to do if it turns out to be empty."
  },

  underTheHood: [
    '`Optional<T>` is a container that either holds a non-null value (`Optional.of(value)`) or holds nothing (`Optional.empty()`) - it is a wrapper describing "presence or absence," not a value itself.',
    'Calling `.get()` on an empty Optional throws `NoSuchElementException` - using `.get()` unconditionally is functionally identical to the exact null-check-skipping bug Optional exists to prevent, just with a different exception name.',
    'The methods that actually deliver Optional\'s value: `.orElse(default)` (a fallback value), `.orElseGet(supplier)` (a lazily-computed fallback), `.orElseThrow(...)` (a deliberate, explicit exception if absent), and `.map()/.flatMap()` (transform the value only if present, otherwise stay empty).',
    'Optional was designed specifically as a RETURN TYPE for methods that might not have a result - the JDK\'s own style guidance explicitly recommends against using Optional for fields, method parameters, or collection elements, where it adds overhead and awkwardness without a clear benefit.',
    '`Optional.ofNullable(value)` bridges legacy, null-returning APIs into Optional - wrapping a value that might be null into an Optional that explicitly represents that possibility going forward.'
  ],

  inTheWild: [
    '`userRepository.findById(id)` returning `Optional<User>` instead of a nullable User - the method signature itself now documents that "not found" is an expected, real outcome the caller must consider.',
    'A codebase that "adopted Optional" by wrapping every field and parameter in it, then calling `.get()` everywhere without checking `.isPresent()` first - all of the ceremony of Optional with none of its actual safety benefit.',
    'Interview question: "Why shouldn\'t Optional be used as a field type or method parameter?" - because Optional itself can still be null (defeating the purpose), adds serialization/allocation overhead, and the JDK team\'s own guidance explicitly scopes it to return types.'
  ],

  showMe: {
    caption: 'Optional used exactly like unchecked null (no safety gained) vs Optional used the way it was designed.',
    bad: {
      language: 'java',
      code:
        'Optional<User> maybeUser = userRepository.findById(id);\n' +
        'User user = maybeUser.get(); // throws NoSuchElementException if absent - same risk as null.get()!',
      explanation:
        'This provides ZERO safety improvement over a plain nullable return - calling .get() without checking presence ' +
        'first just swaps NullPointerException for NoSuchElementException, with all the extra Optional ceremony and none of its benefit.'
    },
    good: {
      language: 'java',
      code:
        'User user = userRepository.findById(id)\n' +
        '    .orElseThrow(() -> new UserNotFoundException("User " + id + " not found"));\n' +
        '// or, with a sensible default instead of an exception:\n' +
        'String displayName = userRepository.findById(id)\n' +
        '    .map(User::getName)\n' +
        '    .orElse("Guest");',
      explanation:
        'Both versions force an explicit decision about the absent case at the exact point the Optional is consumed - ' +
        'either a deliberate, meaningful exception, or a well-defined fallback - instead of silently assuming presence.'
    }
  },

  impact: {
    before: 'A NoSuchElementException crash indistinguishable in spirit from the NullPointerException Optional was meant to prevent.',
    after: 'A deliberate, explicit, well-named exception or fallback value at the exact point absence is discovered.',
    metric: 'The real benefit of Optional is not a runtime metric - it is a compile-time-visible signal in the method signature itself that "this might not have a value," which null can never express.'
  },

  alternatives: [
    {
      name: 'Optional<T> as a return type',
      whenToUse: 'A method that genuinely might not produce a result, and you want that possibility visible in the method signature itself.',
      whenNotToUse: 'Fields, method parameters, or collection elements - per the JDK team\'s own guidance, these are not Optional\'s intended use case.'
    },
    {
      name: 'Plain nullable return + explicit null-checks',
      whenToUse: 'Extremely hot-path code where Optional\'s small allocation overhead genuinely matters, or interoperating with existing null-based APIs/conventions.',
      whenNotToUse: 'New public API method signatures where documenting "this might be absent" clearly is valuable - Optional communicates that better than a bare, easily-ignored possibility of null.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Calling `.get()` on an Optional without first checking `.isPresent()` (or, better, without using `.orElse()`/`.orElseThrow()`/`.map()` instead).',
      why:
        'It compiles fine and "feels" like you\'re using the modern Optional API correctly, but unconditional .get() ' +
        'reintroduces the exact same "assume it\'s there" risk that Optional was introduced specifically to force you to confront.',
      fix:
        'Avoid .get() entirely in normal code. Prefer .orElse(), .orElseGet(), .orElseThrow(), or .map()/.ifPresent() - each forces or guides an explicit decision about the absent case.'
    }
  ],

  proveIt: {
    question:
      'Why does the JDK team explicitly recommend against using Optional as a field type or method parameter, even though it compiles perfectly fine?',
    answer:
      'Because Optional itself can still be null (a field or parameter typed Optional<User> can be assigned null, ' +
      'defeating the entire purpose), and it adds real overhead (an extra allocation) and awkwardness (extra unwrapping) ' +
      'in places the JDK team designed it not to target - Optional was designed specifically for method return values.'
  },

  oneLiner: 'Optional only protects you if you actually use its methods to handle absence - calling .get() blindly is null all over again, just spelled differently.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'java-8',
      title: 'Java 8+',
      note: 'Optional was introduced in the same Java 8 release as lambdas and streams, and its .map()/.filter() methods deliberately echo the Streams API.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'functional-programming',
      title: 'Functional Programming',
      note: 'Optional\'s design (a container you transform via .map() rather than unwrap and branch on manually) is a direct, small-scale application of functional-style thinking.'
    }
  ]
};

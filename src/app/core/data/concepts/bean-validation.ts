import { ConceptContent } from '../../models/content.model';

export const BEAN_VALIDATION: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "bean-validation",
  title: "Bean Validation",
  topicType: "framework",
  simpleIntuition: "A signup form submits an email field containing an empty string. Nobody wrote an \"if email is empty\" check anywhere in the controller, yet the request is rejected with a clean 400 error before it ever reaches your business logic. Where did that check come from?",
  formalMeaning: "Bean Validation lets you declare validation rules once, as annotations directly on the field, and have them enforced automatically wherever that object is used, instead of writing manual if checks everywhere.",
  whyItExists: "Validating input, is this field present, is this email actually shaped like an email, is this number within range, is repetitive and easy to forget in exactly one endpoint out of a hundred. Scattering hand written if checks across every controller is tedious and inconsistent.",
  howItWorksInternally: [
    "@NotNull, @NotBlank, @Size, @Email, @Min, @Max, @Pattern, and others are annotations from the Jakarta Bean Validation specification, placed directly on fields of a class (commonly a request DTO).",
    "In Spring, adding @Valid before a @RequestBody parameter in a controller method tells Spring to run all of that object's validation annotations automatically BEFORE the method body ever executes.",
    "If validation fails, Spring throws a MethodArgumentNotValidException automatically, which by default becomes a 400 Bad Request response listing exactly which fields failed and why, all without you writing a single if statement.",
    "Validation groups let the same class apply different rules in different contexts, for example requiring an id to be null on create but required on update, using the same underlying DTO.",
    "Custom constraints (@interface annotations paired with a ConstraintValidator implementation) let you define your own reusable rule, like @ValidUsername, that plugs into the exact same automatic enforcement mechanism as the built in annotations.",
    "Bean Validation can also be applied directly to JPA entities, and Hibernate will run those same validations automatically just before an INSERT or UPDATE, providing a final safety net even if a request DTO validation was somehow bypassed."
  ],
  mainComponents: [
    "It is like putting a label directly on a shipping container that says \"this side up, max weight 50kg,\" rather than relying on every single person who ever handles that container to remember the rules themselves. The rule travels with the object."
  ],
  realWorldExamples: [
    "A SignupRequest DTO with @NotBlank on the email field and @Size(min = 8) on the password field, rejecting malformed signups automatically before any business logic runs.",
    "A PATCH endpoint using a validation group so the same UpdateUserRequest DTO can require the id field on one operation but forbid it on another.",
    "Interview question: \"How does @Valid actually trigger validation in a Spring controller?\" Spring registers an argument resolver that inspects @Valid annotated parameters, runs the Bean Validation provider against the object's constraint annotations, and throws before the controller method body ever runs if any constraint fails."
  ],
  complexityAndTradeoffs: [
    "Before: Manual validation checks scattered and duplicated across controllers, easy to forget or let drift out of sync between endpoints.",
    "After: Validation rules declared once on the data class, enforced consistently and automatically everywhere that class appears.",
    "A single centrally declared constraint, versus that same check copy pasted across a growing number of endpoints, is the difference between fixing a validation bug in one place versus hunting it down everywhere it was duplicated.",
    "Bean Validation annotations (@Valid, @NotBlank, etc.): use it when the large majority of straightforward field level validation, presence, format, size, range. Avoid it when validation that genuinely requires checking against external state, like \"does this username already exist,\" which needs a real database lookup, not just annotation metadata.",
    "Manual validation logic in a service layer: use it when business rule validation that depends on multiple fields together, external data, or complex conditional logic beyond what a single annotation can express. Avoid it when simple, self contained field level checks, where a manual if statement is just needlessly reinventing what an annotation already provides.",
    "Custom Bean Validation constraints: use it when a specific validation rule reused across many different DTOs, worth defining once as its own reusable annotation. Avoid it when a one off check used in exactly one place, where a custom annotation is more ceremony than the check itself."
  ],
  commonMistakes: [
    "Adding constraint annotations to a DTO class but forgetting the @Valid annotation on the controller parameter. The constraint annotations by themselves are just metadata, inert data sitting on the class. Nothing actually reads and enforces them unless something, like Spring's @Valid handling, is told to trigger validation. Fix: Always pair constraint annotated DTOs with @Valid (or @Validated for method level validation) at every entry point where that data arrives."
  ],
  interviewPerspective: "A common way this gets tested: \"A DTO field has @NotBlank on it, but the controller method signature does not include @Valid. Does an empty string for that field get rejected automatically?\" No. The @NotBlank annotation is just metadata on the class. Without @Valid (or an equivalent validation trigger) on the parameter, nothing actually runs the validation, so the empty string passes straight through untouched.",
  triggerSentence: "A validation annotation is just a label until something, like @Valid, actually reads it and enforces it."
};

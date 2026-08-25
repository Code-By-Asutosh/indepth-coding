import { ConceptContent } from '../../models/content.model';

export const HIBERNATE_LAZY_VS_EAGER_LOADING: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "hibernate-lazy-vs-eager-loading",
  title: "Hibernate Lazy vs Eager Loading",
  topicType: "framework",
  simpleIntuition: "You load an Order inside a controller, return it as JSON, and the response throws a LazyInitializationException with the words \"could not initialize proxy, no Session\" in the stack trace. You never touched a session directly in your life. What session?",
  formalMeaning: "Lazy loading fetches related data only the moment you actually ask for it, and only while a session is still open to go get it. Eager loading fetches it immediately, whether you end up needing it or not.",
  whyItExists: "Loading an entity does not automatically load everything it is connected to. Hibernate has to decide, for every relationship, whether to fetch the related data immediately or wait until you actually ask for it, and that decision has real consequences for both performance and for which code paths are even allowed to touch that data.",
  howItWorksInternally: [
    "@OneToMany and @ManyToMany default to LAZY. @ManyToOne and @OneToOne default to EAGER. These defaults are often surprising and are frequently overridden explicitly.",
    "A lazy relationship is not loaded when the parent entity is fetched. Instead, Hibernate gives you a proxy, a lightweight stand in object that looks like the real collection or entity but has no data yet.",
    "The moment your code calls a method on that proxy, like order.getItems().size(), Hibernate checks whether a session is still open and, if so, fires a query right then to fetch the real data.",
    "If the session has ALREADY closed by the time you touch the proxy, commonly because the entity became detached after the transactional method returned, Hibernate cannot fetch anything anymore and throws LazyInitializationException instead of silently returning empty data.",
    "Eager loading avoids that exception entirely because the data is already there by the time the entity leaves the transaction, but it means EVERY query that loads that entity type also pays the cost of loading the relationship, even the 95 percent of queries that never needed it.",
    "JOIN FETCH, @EntityGraph, and DTO projections are all ways to selectively force eager style loading for one SPECIFIC query, without changing the entity's default mapping for every other query in the codebase."
  ],
  mainComponents: [
    "Lazy loading is like a restaurant that only starts cooking your side dish when you actually ask for it, which works great as long as the kitchen is still open. If the kitchen has already closed (the session is closed) by the time you ask, you get nothing, just an error. Eager loading is ordering the entire menu up front whether you eat it or not, which is safe but wasteful if you only wanted the main course."
  ],
  realWorldExamples: [
    "A REST endpoint serializing an entity straight to JSON, where the JSON library tries to read a lazy collection outside the original transaction, and the request fails with LazyInitializationException in production while working \"fine\" in a quick manual test that happened to touch the collection inside the transaction.",
    "Someone \"fixing\" that same exception by marking the relationship EAGER globally, which quietly makes every unrelated query touching that entity slower, because it now always loads data most of those queries never needed.",
    "Interview question: \"Why does a lazy loaded field sometimes throw an exception and sometimes just work?\" It depends entirely on whether the session is still open at the moment you access it, which is a question about WHEN, not about the field itself."
  ],
  complexityAndTradeoffs: [
    "Before: A request that intermittently throws LazyInitializationException depending on exactly which fields happen to get touched during serialization.",
    "After: The specific data a specific endpoint needs is fetched deliberately, within the transaction, every time.",
    "This is consistently one of the most common Hibernate related production errors, and it is entirely avoidable by fetching what you need, where you need it, instead of relying on a global eager or lazy default.",
    "Lazy (the safer default): use it when almost always, as the default mapping. Combine with JOIN FETCH or @EntityGraph on the specific queries that actually need the related data. Avoid it when a relationship that is genuinely needed on every single load of the parent entity, where eager might be simpler.",
    "Eager: use it when small, cheap, almost always needed relationships, like a required @ManyToOne reference to a small lookup table. Avoid it when large collections, or relationships only some queries actually need. This is the direct cause of accidental N+1 problems and over fetching.",
    "Open Session in View pattern: use it when rarely, and with full awareness of the trade off. It keeps the session open through view rendering to avoid LazyInitializationException, at the cost of holding a database connection open longer per request. Avoid it when most modern applications, where explicit fetching in the query is considered a clearer, more predictable practice."
  ],
  commonMistakes: [
    "Responding to a LazyInitializationException by switching the relationship to EAGER globally on the entity mapping. It does make the specific exception go away for that one code path, but it silently forces every other query that ever loads that entity to also load the relationship, whether needed or not, trading one visible exception for an invisible, permanent performance cost everywhere else. Fix: Keep the mapping LAZY and fetch the specific relationship deliberately, with JOIN FETCH or @EntityGraph, only in the queries that actually need it."
  ],
  interviewPerspective: "A common way this gets tested: \"An entity with a lazy @OneToMany is loaded inside a @Transactional method and returned. A completely separate, non transactional method later calls getItems() on it. What happens?\" It throws LazyInitializationException. The transaction, and the Hibernate session tied to it, closed when the first method returned, so there is no active session available to fetch the items when the second method finally asks for them.",
  triggerSentence: "Lazy loading is not free and not automatic forever, it only works while a session is still open to actually go fetch the data."
};

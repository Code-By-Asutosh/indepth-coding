import { ConceptContent } from '../../models/content.model';

/**
 * Fully written demo concept — proves out the 10-stage page template end to
 * end using the exact worked example from the site's own UX blueprint.
 */
export const N_PLUS_ONE_PROBLEM: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'hibernate-n-1-problem',
  title: 'The N+1 Problem',
  hook: 'Your API endpoint that fetches 20 orders is somehow running 21 database queries. You did not write 21 queries.',
  problem:
    'Lazy-loaded relationships mean each order\'s items get fetched in a separate query, invisible in your code, brutal in production at scale.',
  aha: {
    statement: 'Fetching related data one row at a time instead of all at once turns 1 query into N+1.',
    analogy:
      'It is like asking a waiter for 20 tables\' orders one table at a time instead of once for the whole restaurant.'
  },
  underTheHood: [
    'You run one query to fetch a list of N parent entities (e.g. 20 orders).',
    'Hibernate maps the child association (e.g. items) as lazy by default.',
    'Each time your code calls order.getItems(), Hibernate has no data yet and fires a fresh SELECT for that one order.',
    'That happens once per parent in the loop: 20 extra SELECTs on top of the original 1.',
    '1 query to list the orders + 20 queries for their items = 21 queries for data that could have been 1.'
  ],
  inTheWild: [
    'A production "list orders" API that is fast in dev with 5 rows and falls over at 10k rows in prod.',
    'The classic "why is this endpoint slow" interview/debugging question.',
    'A system-design discussion about read-heavy endpoints where query count directly drives p99 latency.'
  ],
  showMe: {
    language: 'java',
    caption: 'Lazy mapping that causes it, then the JOIN FETCH fix.',
    code:
      '@OneToMany(mappedBy = "order", fetch = FetchType.LAZY)\n' +
      'private List<OrderItem> items;\n\n' +
      '// Fix: fetch everything in one round trip\n' +
      '@Query("SELECT o FROM Order o JOIN FETCH o.items")\n' +
      'List<Order> findAllWithItems();'
  },
  impact: {
    before: '21 queries to render one page of 20 orders.',
    after: '1 query, same data.',
    metric: 'Typical production fix drops p99 latency on the endpoint from ~800ms to well under 100ms.'
  },
  alternatives: [
    { name: 'Eager fetching everywhere', whenToUse: 'Never as a default — risks silently loading far more data than the request needs.' },
    { name: 'DataLoader / batching pattern', whenToUse: 'GraphQL or highly reused association access patterns across many endpoints.' },
    { name: 'Projection / DTO queries', whenToUse: 'When you only need a few fields, not the full entity graph.' }
  ],
  trap:
    '"Fixing" it by flipping the association to EAGER globally. Now every single query that touches Order silently pulls in every order\'s full item list, all the time, whether that endpoint needed it or not — you just moved the N+1 cost onto every other query in the codebase.',
  proveIt: {
    question: 'Given an entity with a lazy @OneToMany and a loop over 50 parents that calls the child getter once each, how many SQL queries fire?',
    answer: '51 — 1 to fetch the parents, plus 1 more per parent the first time its lazy collection is accessed.'
  },
  oneLiner: 'One query to find them, N queries to fetch them one at a time — fix it by asking for everything at once.',
  goDeeper: ['hibernate-lazy-vs-eager-loading', 'hibernate-second-level-cache', 'query-optimization']
};

import { ConceptContent } from '../../models/content.model';

/**
 * Demo concept, rewritten to the "10-15 minute, layman-first, but survives
 * cross-questioning" depth standard (July 2026 revision). This is the
 * reference example every other concept page should match.
 */
export const N_PLUS_ONE_PROBLEM: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'hibernate-n-1-problem',
  title: 'The N+1 Problem',

  hook:
    'Your API endpoint that fetches 20 orders is somehow running 21 database queries. You did not write 21 queries. ' +
    'You wrote one repository call. Somewhere between your code and the database, 20 extra queries appeared out of thin air.',

  problem:
    "Lazy-loaded relationships mean each order's items get fetched in a separate query, invisible in your code, brutal in " +
    'production at scale. It works fine with 5 test rows on your laptop and quietly becomes the slowest endpoint in the ' +
    'system the moment a real customer has more than a handful of orders — and because no single line of your code looks ' +
    "wrong, it's one of the hardest bugs to spot just by reading the code.",

  aha: {
    statement: 'Fetching related data one row at a time instead of all at once turns 1 query into N+1.',
    analogy:
      "It's like a waiter taking one table's order, walking it to the kitchen, coming back, taking the next table's order, " +
      'walking it to the kitchen again — instead of walking the whole restaurant once and placing every order together. ' +
      'The waiter (Hibernate) isn\'t being lazy on purpose — nobody told them "wait until you have all the tables\' orders."'
  },

  underTheHood: [
    'You call orderRepository.findAll() (or similar) to fetch a list of N parent entities — say, 20 orders. Hibernate runs exactly 1 SELECT for this.',
    'The Order entity maps its "items" association as lazy by default (@OneToMany is LAZY unless you say otherwise). ' +
      'Hibernate does NOT fetch items yet — it hands you back a proxy object that looks like a List but is actually empty and unloaded.',
    'The moment your code (or your JSON serializer, e.g. Jackson turning the entity into a response body) calls order.getItems() ' +
      'for the first time on a given order, Hibernate notices the proxy has no data and fires a brand-new SELECT for that ' +
      "one order's items, using the currently-open database session.",
    'This happens independently for every order in the loop, because each order has its own separate, un-initialized proxy. ' +
      'There is no shared "give me items for all 20 orders" step — each proxy only knows how to fetch its own row.',
    'End result: 1 query to list the orders, plus 1 query per order for its items = 1 + 20 = 21 queries for data that a single JOIN could have returned in one round trip.',
    'This is not unique to @OneToMany — the exact same thing happens with @ManyToOne and @OneToOne lazy associations, and it compounds: ' +
      'if each order also lazily loads its customer, you get 1 + 20 (items) + 20 (customer) = 41 queries.'
  ],

  inTheWild: [
    'A "list my orders" API that returns in 40ms with 5 test rows in dev, then times out in production once a customer has 200 orders — classic "works on my machine."',
    'The single most common "why is this endpoint slow" debugging/interview question for anyone who has touched Hibernate or Spring Data JPA.',
    'A system-design interview follow-up: "your read-heavy endpoint is slow under load" almost always traces back to either this or a missing index — interviewers use it to see if you look at query counts, not just code.'
  ],

  showMe: {
    caption: "The lazy mapping that silently causes it, and the fix using Spring Data JPA's JOIN FETCH.",
    bad: {
      language: 'java',
      code:
        '@Entity\n' +
        'public class Order {\n' +
        '    @Id private Long id;\n\n' +
        '    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY) // default anyway — shown for clarity\n' +
        '    private List<OrderItem> items;\n' +
        '}\n\n' +
        '// Looks completely innocent:\n' +
        'List<Order> orders = orderRepository.findAll();\n' +
        'for (Order order : orders) {\n' +
        '    order.getItems().size(); // <-- fires 1 SELECT, per order, right here\n' +
        '}',
      explanation:
        'Nothing here looks wrong — there is exactly one loop and one method call. The extra 20 SELECTs happen ' +
        'invisibly inside order.getItems(), which is why this bug survives code review so often.'
    },
    good: {
      language: 'java',
      code:
        '// Fetch everything in one round trip using a JOIN\n' +
        'public interface OrderRepository extends JpaRepository<Order, Long> {\n\n' +
        '    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.items")\n' +
        '    List<Order> findAllWithItems();\n' +
        '}',
      explanation:
        'JOIN FETCH tells Hibernate "load the items in the SAME query as the orders." One SELECT comes back with every ' +
        'order and every item already attached — no proxies, no per-row follow-up queries. DISTINCT avoids duplicate ' +
        'parent rows caused by the join fan-out.'
    }
  },

  impact: {
    before: '21 queries (1 + 20) to render one page of 20 orders.',
    after: '1 query, identical data, identical response shape.',
    metric: 'A typical production fix like this drops p99 latency on the endpoint from ~800ms to well under 100ms, and cuts database CPU load proportionally to the query count.'
  },

  alternatives: [
    {
      name: 'JOIN FETCH (shown above)',
      whenToUse: 'You always need the child collection whenever you load the parent, and the result set stays reasonably small.',
      whenNotToUse: 'You need pagination on the parent — JOIN FETCH with a collection breaks LIMIT/OFFSET (see Common Mistakes below).'
    },
    {
      name: '@EntityGraph',
      whenToUse: 'You want JOIN-FETCH-like behavior declared on the repository method itself, without hand-writing JPQL.',
      whenNotToUse: 'You need fine control over the exact SQL, or the fetch shape changes per call-site.'
    },
    {
      name: 'Eager fetching (FetchType.EAGER) everywhere',
      whenToUse: 'Almost never as a blanket default.',
      whenNotToUse: 'Any time — it silently loads the association on every single query that touches the entity, even ones that never needed it (see Common Mistakes).'
    },
    {
      name: 'DataLoader / batching pattern (batch-load all children for a page of parents in one extra query)',
      whenToUse: 'GraphQL APIs, or any place the same association is accessed from many different call-sites and you cannot control the query shape at each one.',
      whenNotToUse: 'Simple REST endpoints where you control the query directly — JOIN FETCH or @EntityGraph is simpler.'
    },
    {
      name: 'Projection / DTO queries (select only the fields you need)',
      whenToUse: 'You only need a handful of fields, not the full entity graph — e.g. an order summary list.',
      whenNotToUse: "You need the full managed entity for later writes (DTOs aren't tracked by the persistence context)."
    }
  ],

  commonMistakes: [
    {
      mistake:
        'Someone notices "21 queries!" in the logs, panics, and flips the association to FetchType.EAGER globally to make the extra queries "go away."',
      why:
        'It does technically stop the N+1 pattern for THIS query — but EAGER is not query-specific. Every future query that ' +
        'touches Order anywhere in the codebase now automatically drags in the full items list too, whether that endpoint ' +
        'needed it or not. You have not removed the cost, you have smeared it across every other query in the system, and ' +
        'made it invisible again because it is now "the default."',
      fix:
        'Keep associations LAZY by default. Solve fetching at the query level (JOIN FETCH / @EntityGraph / a projection) ' +
        'for the specific use case that needs the data, not at the entity mapping level for every use case.'
    },
    {
      mistake:
        'JOIN FETCH is applied to a paginated query (Pageable / LIMIT+OFFSET) on a @OneToMany collection.',
      why:
        "Hibernate can't do SQL-level pagination when a collection is joined in, because the join multiplies rows " +
        '(1 order with 3 items becomes 3 result rows) — LIMIT would cut a parent in the middle of its own items. ' +
        'Hibernate\'s fallback is to fetch everything into memory and paginate there, logging a "firstResult/maxResults ' +
        'specified with collection fetch; applying in memory" warning — which quietly defeats the entire point of pagination.',
      fix:
        'Paginate the parent with a normal query first (no fetch join), then fetch that page\'s children in a second, ' +
        'separate query using "WHERE order.id IN (:ids)" — two cheap queries beat one query that secretly loads the whole table.'
    }
  ],

  proveIt: {
    question:
      'Given an entity with a lazy @OneToMany and a loop over 50 parents that calls the child getter once each, how many ' +
      'SQL queries fire — and would adding .stream().count() instead of a for-loop change that number?',
    answer:
      '51 — 1 to fetch the parents, plus 1 more per parent the first time its lazy collection is accessed. The loop style ' +
      "doesn't matter; what matters is that each parent's getItems() is touched at least once. Using .stream() instead of " +
      'a for-loop still triggers the exact same 50 extra queries.'
  },

  oneLiner: 'One query to find them, N queries to fetch them one at a time — fix it by asking for everything at once.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'hibernate-lazy-vs-eager-loading',
      title: 'Hibernate Lazy vs Eager Loading',
      note: 'N+1 is the direct real-world consequence of lazy loading — read this next to see why LAZY is still the right default despite causing this exact problem.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'hibernate-second-level-cache',
      title: 'Hibernate Second-Level Cache',
      note: "If the same parent rows are read repeatedly across requests, caching can hide an N+1 problem's cost without fixing its cause — worth knowing the difference."
    },
    {
      categoryId: 'database',
      topicId: 'sql-databases',
      conceptId: 'query-optimization',
      title: 'Query Optimization',
      note: 'Same underlying idea as the pagination trap above — fetching more round trips than necessary is the single most common source of slow queries in general, not just in Hibernate.'
    }
  ]
};


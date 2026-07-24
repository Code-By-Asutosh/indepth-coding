import { ConceptContent } from '../../models/content.model';

export const HIBERNATE_ENTITY_LIFECYCLE: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'hibernate-entity-lifecycle',
  title: 'Hibernate Entity Lifecycle',

  hook:
    'You fetch a User inside a transaction, the transaction commits, and later, outside any transaction, you change the ' +
    'user\'s name and call save() again. It works. But if you had skipped that second save() call and just changed the ' +
    'field, nothing would have happened at all. Same object, same field, wildly different outcome. Why?',

  problem:
    'A Hibernate entity is not always "live." Whether changing a field actually reaches the database depends entirely ' +
    'on which lifecycle state that specific object is in at that specific moment, and that state is invisible just by looking at the object itself.',

  aha: {
    statement: 'Every entity object is in exactly one of four states at any moment, and only one of those states makes Hibernate automatically track and save your changes.',
    analogy:
      'Think of it like an employee badge. Transient is a person who has not been hired yet, nobody at the company knows they exist. Managed is an active employee, badge active, every action they take is logged automatically. Detached is someone who has left the building but kept their badge, they still have their old data but nothing they do is being tracked anymore. Removed is someone who has been let go, their record is on its way out.'
  },

  underTheHood: [
    'Transient: a plain new Order() you just constructed with "new." Hibernate has never seen it. No id, no tracking, nothing happens to the database until you explicitly persist it.',
    'Managed (also called persistent): once you call entityManager.persist(order), or you load an entity via find() or a query inside an active persistence context, Hibernate starts tracking it. Any field change is automatically detected (dirty checking) and turned into an UPDATE when the transaction commits, with no extra save call needed.',
    'Detached: once the persistence context closes, typically when the transaction or session ends, the entity object still exists in memory with all its data, but Hibernate is no longer watching it. Changing its fields now does absolutely nothing to the database.',
    'Removed: calling entityManager.remove(order) on a managed entity marks it for deletion. It is still a real object in memory until the transaction commits, at which point Hibernate issues the DELETE.',
    'entityManager.merge(detachedEntity) takes a detached object\'s current field values and copies them onto a (possibly newly loaded) managed entity, effectively re-attaching your changes. This is exactly what typically happens when you call repository.save() on an object that came from outside the current transaction, like one deserialized from a web request.',
    'This is precisely why calling a Spring Data repository\'s save() method on an object loaded in a PREVIOUS request, then modified, and passed back in a new request works correctly. Spring Data\'s save() calls merge() under the hood for detached entities with an existing id.'
  ],

  diagrams: [
    {
      mermaid:
        'stateDiagram-v2\n' +
        '  [*] --> Transient: new Order()\n' +
        '  Transient --> Managed: persist()\n' +
        '  Managed --> Detached: session/transaction ends\n' +
        '  Detached --> Managed: merge()\n' +
        '  Managed --> Removed: remove()\n' +
        '  Removed --> [*]: commit (DELETE)',
      caption: 'Only the Managed state gets automatic dirty checking. Every other state needs an explicit call to make changes stick.'
    }
  ],

  inTheWild: [
    'A REST controller receiving a JSON body, converting it to an entity, and calling repository.save(entity), a textbook merge of a detached (or transient, if it is a brand new record) entity back into the managed state.',
    'A bug where a developer loads an entity in one @Transactional method, passes the resulting object to a completely separate method outside any transaction, changes a field, and is confused why nothing was saved, because the entity became detached the moment the first transaction ended.',
    'Interview question: "What state is an entity in immediately after a transaction commits and the method returns?" Detached. The persistence context that was tracking it has closed.'
  ],

  showMe: {
    caption: 'A change made to a detached entity that silently does nothing, versus the correct way to re-attach it.',
    bad: {
      language: 'java',
      code:
        '@Transactional\n' +
        'public Order loadOrder(long id) {\n' +
        '    return orderRepository.findById(id).orElseThrow();\n' +
        '} // transaction ends here, the returned Order becomes DETACHED\n\n' +
        'Order order = loadOrder(5L);\n' +
        'order.setStatus("SHIPPED"); // changes a detached object, Hibernate is not watching\n' +
        '// Nothing is ever saved. No exception, no warning, just silent nothing.',
      explanation:
        'By the time the caller modifies order, the persistence context that would have tracked the change is already closed. The field really does change in memory, it just never reaches the database.'
    },
    good: {
      language: 'java',
      code:
        '@Transactional\n' +
        'public Order loadOrder(long id) {\n' +
        '    return orderRepository.findById(id).orElseThrow();\n' +
        '}\n\n' +
        'Order order = loadOrder(5L);\n' +
        'order.setStatus("SHIPPED");\n' +
        'orderRepository.save(order); // explicitly merges the detached change back in',
      explanation:
        'Calling save() on a detached entity with an existing id triggers a merge, re-attaching the current field values to a managed entity and issuing the UPDATE.'
    }
  },

  impact: {
    before: 'A field change on a detached entity silently does nothing, with zero errors to indicate the mistake.',
    after: 'An explicit save() call reliably persists the change, regardless of which lifecycle state the entity started in.',
    metric: 'This exact confusion, "why did my change not save," is one of the most common Hibernate support questions, precisely because the failure mode is silent rather than an exception.'
  },

  alternatives: [
    {
      name: 'Keep entities managed for the full duration of a use case (do everything inside one @Transactional method)',
      whenToUse: 'Most typical request handling, where you load, modify, and the transaction commits all within one method call.',
      whenNotToUse: 'Long running processes or multi step wizards where holding a transaction open the whole time would hold database locks too long.'
    },
    {
      name: 'Explicitly merge detached entities (repository.save())',
      whenToUse: 'Data arriving from outside the current transaction, like a deserialized request body or an object passed across service boundaries.',
      whenNotToUse: 'Data that is already managed, calling merge on an already managed entity is redundant.'
    },
    {
      name: 'DTOs instead of exposing entities directly',
      whenToUse: 'You want to avoid lifecycle confusion entirely by never letting entity objects leave the transactional boundary in the first place.',
      whenNotToUse: 'Very small internal tools where the extra mapping layer is not worth the effort.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Modifying an entity object outside of any transaction and expecting the change to be saved automatically, the way it would be inside one.',
      why:
        'It genuinely does work that way while the entity is managed, so the mental model "just change the field and it saves" is not wrong, it is just incomplete. It only holds while the persistence context is still open.',
      fix: 'Either keep the modification inside the same transactional boundary as the load, or explicitly call save()/merge() when working with a detached entity.'
    }
  ],

  proveIt: {
    question: 'You load an Order inside a @Transactional method and return it. The caller, outside any transaction, sets order.setTotal(new BigDecimal("99.99")). Does this change reach the database?',
    answer:
      'No, not unless the caller explicitly calls save()/merge() afterward. The Order became detached the moment the transactional method returned, so Hibernate is no longer tracking field changes on it.'
  },

  oneLiner: 'A Hibernate entity only saves itself automatically while it is Managed. Everywhere else, you have to ask for it explicitly.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'jpa',
      title: 'JPA',
      note: 'Dirty checking, the automatic save behavior of managed entities, is a core JPA feature this concept explains the precise boundaries of.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'hibernate-lazy-vs-eager-loading',
      title: 'Hibernate Lazy vs Eager Loading',
      note: 'A LazyInitializationException, one of the most common Hibernate errors, happens specifically when you try to lazy load a relationship on a DETACHED entity.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'transactions',
      title: 'Transactions',
      note: 'The boundaries of a transaction are exactly what define when an entity becomes managed and when it becomes detached.'
    }
  ]
};

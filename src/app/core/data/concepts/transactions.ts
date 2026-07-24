import { ConceptContent } from '../../models/content.model';

export const TRANSACTIONS: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'transactions',
  title: 'Transactions',

  hook:
    'A payment service debits one account and credits another in two separate steps. The server crashes exactly between ' +
    'those two steps. One account just lost money that vanished into nowhere. This is the exact failure a transaction exists to prevent.',

  problem:
    'Real operations are often made of multiple steps that must all succeed together or not happen at all. Without a ' +
    'transaction boundary, a crash, an exception, or even just a network blip halfway through can leave the database in a ' +
    'half finished, inconsistent state that no single step alone caused.',

  aha: {
    statement: 'A transaction groups multiple operations into a single all or nothing unit, guaranteeing that either every step succeeds and is saved, or none of them are.',
    analogy:
      'It is like moving money between two envelopes on a table. You do not want a photograph taken of the table at the exact moment one envelope is empty and the other has not been filled yet. A transaction is the rule that nobody is allowed to look at the table, or crash the whole operation, until BOTH envelopes are in their final state.'
  },

  underTheHood: [
    'A transaction guarantees ACID: Atomicity (all steps succeed or all are rolled back), Consistency (the database moves from one valid state to another), Isolation (concurrent transactions do not see each other\'s half finished work), and Durability (once committed, the result survives even a crash immediately after).',
    'In Spring, @Transactional wraps a method in a transaction boundary. On successful return, the transaction commits. On an uncaught RuntimeException, it rolls back everything the method did, by default. Checked exceptions do NOT trigger rollback by default, a frequent surprise.',
    'Isolation levels (READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE) control exactly how much concurrent transactions are allowed to see of each other\'s uncommitted or recently committed work, trading consistency guarantees against concurrency and performance.',
    'Propagation settings (REQUIRED, REQUIRES_NEW, NESTED, and others) control what happens when a transactional method calls ANOTHER transactional method. REQUIRED (the default) joins the existing transaction. REQUIRES_NEW suspends it and starts a genuinely separate one, useful for things like audit logging that must persist even if the outer operation later rolls back.',
    '@Transactional in Spring works via a proxy wrapping the bean. This is exactly why calling a @Transactional method from ANOTHER method in the SAME class, self invocation, does not actually start a new transaction, the call bypasses the proxy entirely.',
    'A transaction that is held open too long, spanning slow external calls or large loops, holds database locks the whole time, which can seriously hurt concurrency for every other transaction competing for the same rows.'
  ],

  diagrams: [
    {
      mermaid:
        'sequenceDiagram\n' +
        '  participant App\n' +
        '  participant TxMgr as Transaction Manager\n' +
        '  participant DB\n' +
        '  App->>TxMgr: begin transaction\n' +
        '  App->>DB: debit account A\n' +
        '  App->>DB: credit account B\n' +
        '  alt both steps succeed\n' +
        '    App->>TxMgr: commit\n' +
        '    TxMgr->>DB: make changes permanent\n' +
        '  else any step fails\n' +
        '    App->>TxMgr: rollback\n' +
        '    TxMgr->>DB: undo everything\n' +
        '  end',
      caption: 'Both steps happen inside one boundary. Either both are made permanent, or both are undone, never a partial result.'
    }
  ],

  inTheWild: [
    'A funds transfer service wrapping the debit and credit operations in a single @Transactional method, so a crash midway through always results in either both changes or neither, never one without the other.',
    'A developer surprised that a @Transactional method threw a checked IOException and the changes were STILL saved, because Spring only rolls back on unchecked exceptions by default, unless rollbackFor is explicitly configured.',
    'Interview question: "Why does calling a @Transactional method from another method in the same class not actually start a transaction?" Because Spring\'s @Transactional relies on a proxy around the bean, and calling a method directly on "this" from within the same class bypasses that proxy entirely.'
  ],

  showMe: {
    caption: 'Two separate, unprotected writes versus the same operation wrapped in a single transaction boundary.',
    bad: {
      language: 'java',
      code:
        'public void transfer(Account from, Account to, BigDecimal amount) {\n' +
        '    from.setBalance(from.getBalance().subtract(amount));\n' +
        '    accountRepository.save(from);\n' +
        '    // crash or exception here leaves "from" debited but "to" never credited\n' +
        '    to.setBalance(to.getBalance().add(amount));\n' +
        '    accountRepository.save(to);\n' +
        '}',
      explanation:
        'If anything goes wrong between the two save calls, the first change is already permanently committed while the second never happens, silently losing money.'
    },
    good: {
      language: 'java',
      code:
        '@Transactional\n' +
        'public void transfer(Account from, Account to, BigDecimal amount) {\n' +
        '    from.setBalance(from.getBalance().subtract(amount));\n' +
        '    accountRepository.save(from);\n' +
        '    to.setBalance(to.getBalance().add(amount));\n' +
        '    accountRepository.save(to);\n' +
        '    // if anything throws here, BOTH changes are rolled back together\n' +
        '}',
      explanation:
        '@Transactional ensures both saves commit together or, on any unchecked exception, neither one does.'
    }
  },

  impact: {
    before: 'A crash between two related writes can leave the database permanently in a half finished, inconsistent state.',
    after: 'The database is guaranteed to only ever contain the fully completed result or the original, unchanged state.',
    metric: 'This guarantee is the entire foundation financial and inventory systems are built on. Losing it even once, for even one request, is the kind of bug that shows up as real, unrecoverable missing money or stock.'
  },

  alternatives: [
    {
      name: 'Local ACID transaction (@Transactional, single database)',
      whenToUse: 'Operations entirely within one database, the vast majority of everyday application logic.',
      whenNotToUse: 'Operations spanning multiple independent databases or services, where a single local transaction cannot cover all of them.'
    },
    {
      name: 'Distributed transaction / two phase commit',
      whenToUse: 'Rare cases genuinely requiring atomicity across multiple independent transactional resources.',
      whenNotToUse: 'Most modern distributed systems, where two phase commit\'s complexity and availability cost make it a poor fit.'
    },
    {
      name: 'Saga pattern (compensating actions across services)',
      whenToUse: 'Multi step business processes spanning multiple microservices, where each step commits locally and a failure triggers explicit compensating actions instead of a shared distributed transaction.',
      whenNotToUse: 'A process fully containable within a single service and single database, where a plain local transaction is simpler and sufficient.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Calling a @Transactional annotated method from another method in the same class and assuming it started a new transaction.',
      why:
        'Spring\'s @Transactional is implemented via a proxy wrapping the bean from the outside. A call from "this.someMethod()" within the same class never goes through that proxy, so the transactional behavior is silently skipped entirely.',
      fix: 'Move the transactional method to a separate bean and inject it, or restructure the call to go through the Spring managed proxy, so the transaction boundary is actually applied.'
    }
  ],

  proveIt: {
    question: 'A @Transactional method throws a checked (not unchecked) exception partway through. Does Spring roll back the changes made so far, by default?',
    answer:
      'No. Spring\'s default rollback rule only triggers on unchecked exceptions (RuntimeException and its subclasses) plus Error. A checked exception commits whatever succeeded so far unless rollbackFor is explicitly configured to include it.'
  },

  oneLiner: 'A transaction is not about making things faster, it is about guaranteeing you never end up with a half finished result.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'hibernate-entity-lifecycle',
      title: 'Hibernate Entity Lifecycle',
      note: 'The exact boundaries of a transaction are also exactly what determine when an entity is Managed versus Detached.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'connection-pooling',
      title: 'Connection Pooling',
      note: 'A transaction holds one pooled connection for its entire duration, so a long running transaction ties up that connection the whole time.'
    }
  ]
};

import { ConceptContent } from '../../models/content.model';

export const DB_MIGRATIONS_FLYWAY_LIQUIBASE: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'db-migrations-flyway-liquibase',
  title: 'DB Migrations (Flyway, Liquibase)',

  hook:
    'Three developers each add a column to their local database by hand, in a slightly different order, with slightly ' +
    'different names. Nobody remembers exactly what the production schema actually looks like anymore, and the next deploy breaks.',

  problem:
    'A database schema is not a static thing, it evolves constantly, new columns, new tables, renamed fields. Without a ' +
    'disciplined, repeatable way to apply those changes, every environment, a developer\'s laptop, staging, production, ' +
    'can silently drift into a slightly different, undocumented shape.',

  aha: {
    statement: 'A migration tool turns schema changes into version controlled, ordered, repeatable scripts, so every environment can be brought to the exact same known schema state automatically, the same way source control tracks code changes.',
    analogy:
      'It is like a recipe book with numbered steps instead of a chef improvising from memory every time. Anyone, in any kitchen, can follow the exact same numbered steps in the exact same order and end up with the exact same dish, instead of everyone quietly reinterpreting the recipe slightly differently.'
  },

  underTheHood: [
    'Flyway and Liquibase both work on the same core idea: each schema change is a versioned script (Flyway: plain SQL files named like V1__create_users_table.sql; Liquibase: SQL, XML, YAML, or JSON changelogs), applied in strict numbered order.',
    'The tool tracks which migrations have already been applied to a given database in a dedicated metadata table (flyway_schema_history or DATABANKCHANGELOG), so running the migration command again only applies the NEW scripts since last time, never re-running old ones.',
    'This means spinning up a brand new empty database and running migrations from scratch produces the exact same final schema as an existing database that has been incrementally migrated for two years, migration by migration.',
    'Migrations typically run automatically on application startup (a common Spring Boot pattern), or as an explicit step in a deployment pipeline before the new application version starts serving traffic.',
    'Rollback is trickier than it sounds: Flyway\'s free tier is forward only by design; genuinely safe rollback usually means writing an explicit new migration that reverses the change, rather than trying to literally "undo" history.',
    'A migration that has already been applied to any real environment should never be edited afterward. Editing an already applied script creates a checksum mismatch the tool will refuse to proceed past, exactly because it can no longer trust that "version 5" means the same thing everywhere.'
  ],

  diagrams: [
    {
      mermaid:
        'flowchart LR\n' +
        '  V1["V1__create_users.sql"] --> V2["V2__add_email_column.sql"]\n' +
        '  V2 --> V3["V3__add_index_on_email.sql"]\n' +
        '  V3 --> Hist["Recorded in schema_history table"]\n' +
        '  Hist --> Deploy["Any environment runs only the NEW scripts since its last recorded version"]',
      caption: 'Migrations are numbered and tracked, so every environment converges to the exact same schema regardless of starting point.'
    }
  ],

  inTheWild: [
    'A Spring Boot application with Flyway on the classpath automatically running any new migration scripts in src/main/resources/db/migration on every application startup, before the application is allowed to start serving requests.',
    'A team enforcing "never edit an already applied migration" as a hard rule, catching the mistake immediately in code review because Flyway would otherwise refuse to run in any environment where that script was already recorded as applied.',
    'Interview question: "How does a migration tool know it does not need to re-run a script that was already applied?" It keeps a metadata table recording exactly which version numbers have already run against that specific database, checked before applying anything new.'
  ],

  showMe: {
    caption: 'A hand applied, undocumented schema change versus the same change as a tracked migration script.',
    bad: {
      language: 'sql',
      code:
        '-- Someone runs this manually against production, once, and never writes it down anywhere:\n' +
        'ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);\n' +
        '-- Six months later, nobody remembers this column was added by hand,\n' +
        '-- and a fresh staging database does not have it.',
      explanation:
        'The change exists only in one database\'s actual state, with no record anywhere of what was done or why, making every other environment a guess.'
    },
    good: {
      language: 'sql',
      code:
        '-- V4__add_phone_number_to_users.sql\n' +
        'ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);',
      explanation:
        'This file lives in version control, runs automatically and identically on every environment, and is permanently recorded as "V4 applied" the moment it runs anywhere.'
    }
  },

  impact: {
    before: 'Every environment\'s actual schema is an undocumented guess, discovered only when something unexpectedly breaks.',
    after: 'Every environment\'s schema is fully described by a version controlled, ordered set of scripts, reproducible from scratch at any time.',
    metric: 'Schema drift between environments is a leading cause of "works on my machine but breaks in production" bugs, and migration tooling eliminates that entire category of failure by construction.'
  },

  alternatives: [
    {
      name: 'Flyway',
      whenToUse: 'Teams wanting simple, plain SQL migration scripts with minimal abstraction and a straightforward version numbering convention.',
      whenNotToUse: 'Teams needing database agnostic changelogs that can generate different SQL dialects from one shared definition, which Liquibase handles more natively.'
    },
    {
      name: 'Liquibase',
      whenToUse: 'Teams needing rollback tooling, database agnostic changelogs (XML/YAML/JSON), or more complex conditional migration logic.',
      whenNotToUse: 'Teams that prefer working directly in plain SQL without an additional changelog abstraction layer.'
    },
    {
      name: 'Manual, undocumented schema changes',
      whenToUse: 'Effectively never, for anything beyond a true one off, throwaway local experiment.',
      whenNotToUse: 'Any environment anyone else will ever need to reproduce, which in practice is almost every real environment.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Editing a migration script that has already been applied in any shared environment, instead of writing a brand new migration to make the additional change.',
      why:
        'The tool tracks which scripts have run via a checksum. Editing an already applied script changes that checksum, and the tool will refuse to proceed in any environment that already recorded the old version, since it can no longer trust that history is consistent.',
      fix: 'Treat every applied migration as immutable, permanent history. Any further change is a brand new migration script, never an edit to an old one.'
    }
  ],

  proveIt: {
    question: 'A migration script that already ran successfully in production is later edited to fix a typo, and then a fresh staging database tries to run migrations from scratch. What happens?',
    answer:
      'The migration tool detects a checksum mismatch between the recorded, already applied version and the now edited file, and refuses to proceed, treating this as a serious integrity problem rather than silently accepting the edit.'
  },

  oneLiner: 'A migration script, once applied anywhere real, is history, not a draft, fix forward with a new script instead of editing the past.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'jpa',
      title: 'JPA',
      note: 'JPA/Hibernate can auto generate schema for quick local development, but migration tools are the disciplined, production safe alternative to that auto generation.'
    },
    {
      categoryId: 'devops',
      topicId: 'devops',
      conceptId: 'ci-cd',
      title: 'CI/CD',
      note: 'Running migrations as an explicit pipeline step before deploying new application code is how schema and code changes stay coordinated safely.'
    }
  ]
};

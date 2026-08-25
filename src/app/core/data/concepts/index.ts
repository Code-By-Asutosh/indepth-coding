import { ConceptContent } from '../../models/content.model';
import { N_PLUS_ONE_PROBLEM } from './n-plus-one-problem';

// Java Core (all 40 concepts)
import { JVM_INTERNALS } from './jvm-internals';
import { MEMORY_MANAGEMENT } from './memory-management';
import { JAVA_MEMORY_MODEL } from './java-memory-model';
import { GARBAGE_COLLECTION } from './garbage-collection';
import { OOP } from './oop';
import { SOLID } from './solid';
import { JAVA_COLLECTIONS } from './java-collections';
import { EXCEPTION_HANDLING } from './exception-handling';
import { MULTITHREADING } from './multithreading';
import { CONCURRENCY_UTILITIES } from './concurrency-utilities';
import { JAVA_8_PLUS } from './java-8-plus';
import { STREAMS } from './streams';
import { FUNCTIONAL_PROGRAMMING } from './functional-programming';
import { REFLECTION } from './reflection';
import { GENERICS } from './generics';
import { SERIALIZATION } from './serialization';
import { RECORDS } from './records';
import { SEALED_CLASSES } from './sealed-classes';
import { PATTERN_MATCHING } from './pattern-matching';
import { VIRTUAL_THREADS } from './virtual-threads';
import { STRUCTURED_CONCURRENCY } from './structured-concurrency';
import { METHOD_HANDLES_VARHANDLES_UNSAFE } from './method-handles-varhandles-unsafe';
import { MODULE_SYSTEM } from './module-system';
import { OPTIONAL } from './optional';
import { JAVA_TIME } from './java-time';
import { TEXT_BLOCKS } from './text-blocks';
import { NESTED_INNER_ANONYMOUS_LOCAL_CLASSES } from './nested-inner-classes';
import { STRING_POOL_INTERNING } from './string-pool-interning';
import { AUTOBOXING_PITFALLS } from './autoboxing-pitfalls';
import { PERFORMANCE_OPTIMIZATION } from './performance-optimization';
import { JIT_COMPILER } from './jit-compiler';
import { ESCAPE_ANALYSIS } from './escape-analysis';
import { CLASSLOADER } from './classloader';
import { BYTECODE_BASICS_JAVAP } from './bytecode-basics';
import { JMH_MICROBENCHMARKING } from './jmh-microbenchmarking';
import { JAVA_NIO } from './java-nio';
import { NETWORKING } from './networking';
import { SECURITY } from './security';
import { PROJECT_PANAMA } from './project-panama';
import { PROJECT_VALHALLA } from './project-valhalla';

// Enterprise Java
import { JDBC } from './jdbc';
import { CONNECTION_POOLING } from './connection-pooling';
import { HIKARICP_TUNING } from './hikaricp-tuning';
import { JPA } from './jpa';
import { HIBERNATE_ENTITY_LIFECYCLE } from './hibernate-entity-lifecycle';
import { HIBERNATE_LAZY_VS_EAGER_LOADING } from './hibernate-lazy-vs-eager-loading';
import { HIBERNATE_SECOND_LEVEL_CACHE } from './hibernate-second-level-cache';
import { HIBERNATE_MULTI_TENANCY_PATTERNS } from './hibernate-multi-tenancy-patterns';
import { TRANSACTIONS } from './transactions';
import { SPRING_DATA } from './spring-data';
import { BEAN_VALIDATION } from './bean-validation';
import { CACHING } from './caching';
import { DB_MIGRATIONS_FLYWAY_LIQUIBASE } from './db-migrations-flyway-liquibase';
import { SCHEDULING } from './scheduling';
import { ASYNC_PROGRAMMING } from './async-programming';
import { REACTIVE_PROGRAMMING } from './reactive-programming';
import { FILE_PROCESSING_JSON } from './file-processing-json';
import { FILE_PROCESSING_XML } from './file-processing-xml';
import { FILE_PROCESSING_PDF } from './file-processing-pdf';
import { FILE_PROCESSING_EXCEL } from './file-processing-excel';
import { FILE_PROCESSING_EMAIL } from './file-processing-email';
import { ENCRYPTION } from './encryption';
import { JWT } from './jwt';
import { OAUTH } from './oauth';
import { LOGGING_FRAMEWORKS_SLF4J_LOGBACK_LOG4J2 } from './logging-frameworks-slf4j-logback-log4j2';
import { BACKEND_DEVELOPMENT } from './backend-development';

// Interview Prep
import { PREP_STRATEGY } from './prep-strategy';
import { COLLECTIONS_BIG_PICTURE } from './collections-big-picture';
import { ARRAYLIST_LINKEDLIST_INTERNALS } from './arraylist-linkedlist-internals';
import { HASHMAP_INTERNALS } from './hashmap-internals';
import { EQUALS_HASHCODE_IN_PRACTICE } from './equals-hashcode-in-practice';
import { SET_FAMILY_INTERNALS } from './set-family-internals';
import { CONCURRENTHASHMAP_FAIL_FAST } from './concurrenthashmap-fail-fast';
import { MAP_FAMILY_EXTRAS } from './map-family-extras';
import { COLLECTIONS_SCENARIO_DRILL } from './collections-scenario-drill';
import { THREADS_TO_THREADPOOLEXECUTOR } from './threads-to-threadpoolexecutor';
import { COMPLETABLEFUTURE_PARALLEL_STREAMS } from './completablefuture-parallel-streams';
import { SYNCHRONIZED_VOLATILE_ATOMICS_LOCKS } from './synchronized-volatile-atomics-locks';
import { RACE_CONDITIONS_DEADLOCKS } from './race-conditions-deadlocks';
import { CONCURRENCY_SCENARIO_DRILL } from './concurrency-scenario-drill';

/** Every concept that has real 10-stage written content so far. */
const WRITTEN_CONCEPTS: ConceptContent[] = [
  PREP_STRATEGY,
  COLLECTIONS_BIG_PICTURE,
  ARRAYLIST_LINKEDLIST_INTERNALS,
  HASHMAP_INTERNALS,
  EQUALS_HASHCODE_IN_PRACTICE,
  SET_FAMILY_INTERNALS,
  CONCURRENTHASHMAP_FAIL_FAST,
  MAP_FAMILY_EXTRAS,
  COLLECTIONS_SCENARIO_DRILL,
  THREADS_TO_THREADPOOLEXECUTOR,
  COMPLETABLEFUTURE_PARALLEL_STREAMS,
  SYNCHRONIZED_VOLATILE_ATOMICS_LOCKS,
  RACE_CONDITIONS_DEADLOCKS,
  CONCURRENCY_SCENARIO_DRILL,

  N_PLUS_ONE_PROBLEM,

  // Java Core
  JVM_INTERNALS,
  MEMORY_MANAGEMENT,
  JAVA_MEMORY_MODEL,
  GARBAGE_COLLECTION,
  OOP,
  SOLID,
  JAVA_COLLECTIONS,
  EXCEPTION_HANDLING,
  MULTITHREADING,
  CONCURRENCY_UTILITIES,
  JAVA_8_PLUS,
  STREAMS,
  FUNCTIONAL_PROGRAMMING,
  REFLECTION,
  GENERICS,
  SERIALIZATION,
  RECORDS,
  SEALED_CLASSES,
  PATTERN_MATCHING,
  VIRTUAL_THREADS,
  STRUCTURED_CONCURRENCY,
  METHOD_HANDLES_VARHANDLES_UNSAFE,
  MODULE_SYSTEM,
  OPTIONAL,
  JAVA_TIME,
  TEXT_BLOCKS,
  NESTED_INNER_ANONYMOUS_LOCAL_CLASSES,
  STRING_POOL_INTERNING,
  AUTOBOXING_PITFALLS,
  PERFORMANCE_OPTIMIZATION,
  JIT_COMPILER,
  ESCAPE_ANALYSIS,
  CLASSLOADER,
  BYTECODE_BASICS_JAVAP,
  JMH_MICROBENCHMARKING,
  JAVA_NIO,
  NETWORKING,
  SECURITY,
  PROJECT_PANAMA,
  PROJECT_VALHALLA,

  // Enterprise Java
  JDBC,
  CONNECTION_POOLING,
  HIKARICP_TUNING,
  JPA,
  HIBERNATE_ENTITY_LIFECYCLE,
  HIBERNATE_LAZY_VS_EAGER_LOADING,
  HIBERNATE_SECOND_LEVEL_CACHE,
  HIBERNATE_MULTI_TENANCY_PATTERNS,
  TRANSACTIONS,
  SPRING_DATA,
  BEAN_VALIDATION,
  CACHING,
  DB_MIGRATIONS_FLYWAY_LIQUIBASE,
  SCHEDULING,
  ASYNC_PROGRAMMING,
  REACTIVE_PROGRAMMING,
  FILE_PROCESSING_JSON,
  FILE_PROCESSING_XML,
  FILE_PROCESSING_PDF,
  FILE_PROCESSING_EXCEL,
  FILE_PROCESSING_EMAIL,
  ENCRYPTION,
  JWT,
  OAUTH,
  LOGGING_FRAMEWORKS_SLF4J_LOGBACK_LOG4J2,
  BACKEND_DEVELOPMENT
];

function contentKey(categoryId: string, topicId: string, conceptId: string): string {
  return `${categoryId}/${topicId}/${conceptId}`;
}

const CONTENT_BY_KEY = new Map<string, ConceptContent>(
  WRITTEN_CONCEPTS.map((content) => [contentKey(content.categoryId, content.topicId, content.conceptId), content])
);

/** Looks up written 10-stage content for a concept, or undefined if not written yet. */
export function findConceptContent(categoryId: string, topicId: string, conceptId: string): ConceptContent | undefined {
  return CONTENT_BY_KEY.get(contentKey(categoryId, topicId, conceptId));
}

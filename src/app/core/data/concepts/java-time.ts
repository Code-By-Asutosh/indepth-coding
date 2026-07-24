import { ConceptContent } from '../../models/content.model';

export const JAVA_TIME: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'java-time-date-time-api',
  title: 'java.time (Date/Time API)',

  hook:
    'You store a meeting time as a plain `Date`. Six months later, daylight saving time shifts, and the meeting your ' +
    'customer booked for "3 PM their time" now displays as 2 PM or 4 PM depending on which server rendered it. Nobody touched the stored value.',

  problem:
    'The old `java.util.Date` and `Calendar` classes are notoriously bad: `Date` is mutable (dangerous to share/cache), ' +
    "month values are zero-indexed (January is 0, a famous source of off-by-one bugs), and neither class has any real, " +
    "correct concept of time zones built in - which is exactly where subtle scheduling bugs live.",

  aha: {
    statement: 'java.time (introduced in Java 8) models time as several DISTINCT, precise concepts instead of one fuzzy "Date" - a point in time is not the same thing as a date on a calendar, which is not the same thing as a time zone.',
    analogy:
      "The old Date class is like a single word, 'now,' used to mean five different things depending on context - vague " +
      "and easy to misunderstand. java.time is like having five separate, precise words: 'this exact instant, everywhere' " +
      "(Instant), 'this calendar date, no time attached' (LocalDate), 'this date and time, but with no idea what time " +
      "zone' (LocalDateTime), and 'this exact date, time, AND time zone' (ZonedDateTime) - each one says exactly what it means, with nothing implied."
  },

  underTheHood: [
    'Instant: a single point on the global timeline (like a Unix timestamp) - has no concept of time zone, calendar, or human-readable date at all; ideal for logging/storing "when did this event objectively happen."',
    'LocalDate / LocalTime / LocalDateTime: represent a date and/or time WITHOUT any time zone attached - "March 15th" or "3:00 PM" means the same thing regardless of where you are, useful for things like birthdays or a recurring daily reminder time.',
    'ZonedDateTime: a full date, time, AND time zone together - this is what you need for genuinely scheduling a real-world event (a meeting, a flight) where the time zone actually matters for correctness.',
    'Every one of these classes is IMMUTABLE - every "modification" method (plusDays(), withYear()) returns a brand new object instead of mutating the original, eliminating an entire class of shared-mutable-date bugs that plagued the old Date class.',
    'Duration measures an amount of TIME (hours, minutes, seconds - machine-precision) between two Instants, while Period measures an amount of CALENDAR time (years, months, days) between two LocalDates - these are deliberately different types because "1 month" is not a fixed number of seconds (months have different lengths).',
    'DateTimeFormatter replaces the old, notoriously not-thread-safe SimpleDateFormat - DateTimeFormatter instances are immutable and thread-safe, so a single shared formatter instance can be safely reused across threads.'
  ],

  inTheWild: [
    'Storing event timestamps as `Instant` in a database (a single unambiguous global moment) and converting to `ZonedDateTime` only at the point of DISPLAY, using the viewer\'s actual time zone.',
    'A recurring daily task ("send this report every day at 9 AM local time") modeled as `LocalTime`, deliberately WITHOUT a time zone, since "9 AM" should track the user\'s local wall-clock time even across daylight saving transitions.',
    'Interview question: "Why is the old java.util.Date considered dangerous to use as a shared/cached field?" - because Date is mutable, so any code holding a reference to it can silently change a value another part of the system still relies on.'
  ],

  showMe: {
    caption: 'A shared mutable Date silently changed by unrelated code, vs an immutable java.time value that cannot be.',
    bad: {
      language: 'java',
      code:
        'Date meetingTime = new Date(); // legacy, mutable\n' +
        'schedule(meetingTime);\n\n' +
        '// ...elsewhere in the codebase, completely unrelated code:\n' +
        'meetingTime.setHours(meetingTime.getHours() + 1); // MUTATES the shared instance!\n' +
        '// Anything else holding a reference to the original meetingTime object\n' +
        '// now silently sees the changed value too.',
      explanation:
        'Because Date is mutable, any code with a reference to the SAME object can change it - there is no way to hand ' +
        'out a Date and be sure nobody else can silently alter it out from under you.'
    },
    good: {
      language: 'java',
      code:
        'ZonedDateTime meetingTime = ZonedDateTime.now(ZoneId.of("America/New_York"));\n' +
        'schedule(meetingTime);\n\n' +
        '// "Modifying" always returns a NEW object - the original is never touched:\n' +
        'ZonedDateTime oneHourLater = meetingTime.plusHours(1);\n' +
        '// meetingTime itself is completely unchanged, guaranteed by immutability',
      explanation:
        'plusHours() returns a brand new ZonedDateTime - the original object is guaranteed unchanged, so anything else ' +
        'holding a reference to it can rely on that value never silently shifting underneath them.'
    }
  },

  impact: {
    before: 'A shared mutable Date object that can be silently changed by any code holding a reference to it.',
    after: 'An immutable value where "modification" always produces a new object, leaving every existing reference untouched.',
    metric: 'This single property (immutability) eliminates an entire category of "why did this date silently change" bugs that were common and genuinely hard to trace with the old Date/Calendar classes.'
  },

  alternatives: [
    {
      name: 'Instant',
      whenToUse: 'Recording an objective, unambiguous moment in time (event logging, timestamps stored in a database).',
      whenNotToUse: 'Anything meant to be displayed to a human in their local calendar/clock context - convert to ZonedDateTime for display.'
    },
    {
      name: 'LocalDate / LocalDateTime',
      whenToUse: 'Dates/times that are inherently time-zone-independent by meaning (a birthday, a recurring local daily time).',
      whenNotToUse: 'Scheduling a real-world event across time zones - without a zone attached, "3 PM" is ambiguous about whose 3 PM.'
    },
    {
      name: 'ZonedDateTime',
      whenToUse: 'Scheduling or displaying an event where the specific time zone genuinely matters for correctness (meetings, flights, deadlines).',
      whenNotToUse: 'Pure elapsed-time calculations between two instants - Duration/Instant is a more precise fit there.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Storing and comparing `LocalDateTime` values across different users/servers in different time zones, assuming they represent the same absolute moment.',
      why:
        'LocalDateTime deliberately has NO time zone information - "2026-03-15T15:00" means 3 PM wherever it is being ' +
        "interpreted, not a specific global moment. Comparing two LocalDateTimes from users in different zones as if they represent the same instant produces silently wrong results.",
      fix:
        'Use Instant or ZonedDateTime whenever you need to compare or store moments that must be unambiguous across different locations - reserve LocalDateTime for genuinely zone-independent values.'
    }
  ],

  proveIt: {
    question:
      'Why does java.time have BOTH a `Duration` and a `Period` class instead of just one "amount of time" type?',
    answer:
      'Because they measure fundamentally different things: Duration is a precise, fixed amount of machine time (seconds/nanoseconds) between two instants, while Period is a calendar-based amount (years/months/days) - "1 month" is not a fixed number of seconds (months vary in length), so they cannot be represented by the same type without losing meaning.'
  },

  oneLiner: 'The old Date tried to be one fuzzy thing for every use case - java.time gives you five precise, immutable types, each meaning exactly one thing.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'functional-programming',
      title: 'Functional Programming',
      note: 'Every java.time type is immutable by design - the same core principle that makes functional-style code safer to share across threads.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'records',
      title: 'Records',
      note: 'java.time predates records but embodies the same philosophy records later formalized as a language feature: immutable, transparent value objects.'
    }
  ]
};

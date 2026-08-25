import { ConceptContent } from '../../models/content.model';

export const JAVA_TIME: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "java-time-date-time-api",
  title: "java.time (Date/Time API)",
  topicType: "concept",
  simpleIntuition: "You store a meeting time as a plain `Date`. Six months later, daylight saving time shifts, and the meeting your customer booked for \"3 PM their time\" now displays as 2 PM or 4 PM depending on which server rendered it. Nobody touched the stored value.",
  formalMeaning: "java.time (introduced in Java 8) models time as several DISTINCT, precise concepts instead of one fuzzy \"Date\" - a point in time is not the same thing as a date on a calendar, which is not the same thing as a time zone.",
  whyItExists: "The old `java.util.Date` and `Calendar` classes are notoriously bad: `Date` is mutable (dangerous to share/cache), month values are zero-indexed (January is 0, a famous source of off-by-one bugs), and neither class has any real, correct concept of time zones built in - which is exactly where subtle scheduling bugs live.",
  howItWorksInternally: [
    "Instant: a single point on the global timeline (like a Unix timestamp) - has no concept of time zone, calendar, or human-readable date at all; ideal for logging/storing \"when did this event objectively happen.\"",
    "LocalDate / LocalTime / LocalDateTime: represent a date and/or time WITHOUT any time zone attached - \"March 15th\" or \"3:00 PM\" means the same thing regardless of where you are, useful for things like birthdays or a recurring daily reminder time.",
    "ZonedDateTime: a full date, time, AND time zone together - this is what you need for genuinely scheduling a real-world event (a meeting, a flight) where the time zone actually matters for correctness.",
    "Every one of these classes is IMMUTABLE - every \"modification\" method (plusDays(), withYear()) returns a brand new object instead of mutating the original, eliminating an entire class of shared-mutable-date bugs that plagued the old Date class.",
    "Duration measures an amount of TIME (hours, minutes, seconds - machine-precision) between two Instants, while Period measures an amount of CALENDAR time (years, months, days) between two LocalDates - these are deliberately different types because \"1 month\" is not a fixed number of seconds (months have different lengths).",
    "DateTimeFormatter replaces the old, notoriously not-thread-safe SimpleDateFormat - DateTimeFormatter instances are immutable and thread-safe, so a single shared formatter instance can be safely reused across threads."
  ],
  mainComponents: [
    "The old Date class is like a single word, 'now,' used to mean five different things depending on context - vague and easy to misunderstand. java.time is like having five separate, precise words: 'this exact instant, everywhere' (Instant), 'this calendar date, no time attached' (LocalDate), 'this date and time, but with no idea what time zone' (LocalDateTime), and 'this exact date, time, AND time zone' (ZonedDateTime) - each one says exactly what it means, with nothing implied."
  ],
  realWorldExamples: [
    "Storing event timestamps as `Instant` in a database (a single unambiguous global moment) and converting to `ZonedDateTime` only at the point of DISPLAY, using the viewer's actual time zone.",
    "A recurring daily task (\"send this report every day at 9 AM local time\") modeled as `LocalTime`, deliberately WITHOUT a time zone, since \"9 AM\" should track the user's local wall-clock time even across daylight saving transitions.",
    "Interview question: \"Why is the old java.util.Date considered dangerous to use as a shared/cached field?\" - because Date is mutable, so any code holding a reference to it can silently change a value another part of the system still relies on."
  ],
  complexityAndTradeoffs: [
    "Before: A shared mutable Date object that can be silently changed by any code holding a reference to it.",
    "After: An immutable value where \"modification\" always produces a new object, leaving every existing reference untouched.",
    "This single property (immutability) eliminates an entire category of \"why did this date silently change\" bugs that were common and genuinely hard to trace with the old Date/Calendar classes.",
    "Instant: use it when recording an objective, unambiguous moment in time (event logging, timestamps stored in a database). Avoid it when anything meant to be displayed to a human in their local calendar/clock context - convert to ZonedDateTime for display.",
    "LocalDate / LocalDateTime: use it when dates/times that are inherently time-zone-independent by meaning (a birthday, a recurring local daily time). Avoid it when scheduling a real-world event across time zones - without a zone attached, \"3 PM\" is ambiguous about whose 3 PM.",
    "ZonedDateTime: use it when scheduling or displaying an event where the specific time zone genuinely matters for correctness (meetings, flights, deadlines). Avoid it when pure elapsed-time calculations between two instants - Duration/Instant is a more precise fit there."
  ],
  commonMistakes: [
    "Storing and comparing `LocalDateTime` values across different users/servers in different time zones, assuming they represent the same absolute moment. LocalDateTime deliberately has NO time zone information - \"2026-03-15T15:00\" means 3 PM wherever it is being interpreted, not a specific global moment. Comparing two LocalDateTimes from users in different zones as if they represent the same instant produces silently wrong results. Fix: Use Instant or ZonedDateTime whenever you need to compare or store moments that must be unambiguous across different locations - reserve LocalDateTime for genuinely zone-independent values."
  ],
  interviewPerspective: "A common way this gets tested: \"Why does java.time have BOTH a `Duration` and a `Period` class instead of just one \"amount of time\" type?\" Because they measure fundamentally different things: Duration is a precise, fixed amount of machine time (seconds/nanoseconds) between two instants, while Period is a calendar-based amount (years/months/days) - \"1 month\" is not a fixed number of seconds (months vary in length), so they cannot be represented by the same type without losing meaning.",
  triggerSentence: "The old Date tried to be one fuzzy thing for every use case - java.time gives you five precise, immutable types, each meaning exactly one thing."
};

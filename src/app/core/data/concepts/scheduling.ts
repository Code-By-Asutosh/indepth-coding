import { ConceptContent } from '../../models/content.model';

export const SCHEDULING: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "scheduling",
  title: "Scheduling",
  topicType: "framework",
  simpleIntuition: "Every night at 2 AM, without a single human touching a keyboard, a report gets generated and emailed to finance. Nobody is sitting there clicking a button at 2 AM. Something inside the application itself is keeping time.",
  formalMeaning: "Scheduling lets you declare \"run this method on this schedule\" directly in code, and the framework takes care of the actual timer, the thread, and the triggering, forever, without any external cron job or manual intervention.",
  whyItExists: "Some work genuinely has nothing to do with a user request, cleaning up expired sessions, generating nightly reports, retrying failed jobs. That work needs to run on a clock, not in response to anyone clicking anything, and a real application needs a reliable, built in way to make that happen.",
  howItWorksInternally: [
    "@EnableScheduling on a Spring Boot configuration class turns on the framework's internal task scheduler.",
    "@Scheduled(fixedRate = 5000) runs a method every 5 seconds measured from the START of the previous execution. @Scheduled(fixedDelay = 5000) runs 5 seconds after the previous execution FINISHED, which matters a lot if the task sometimes takes longer than the interval.",
    "@Scheduled(cron = \"0 0 2 * * *\") uses standard cron expression syntax for schedules that are not simple fixed intervals, like \"every day at 2 AM\" or \"every weekday at 9 AM\".",
    "By default, Spring runs ALL @Scheduled methods on a single shared thread, one at a time. A slow scheduled task can silently delay every OTHER scheduled task in the application unless a dedicated task executor with a larger thread pool is explicitly configured.",
    "In a multi instance, horizontally scaled deployment, every instance runs its own copy of @Scheduled methods independently by default, meaning a \"run once daily\" job can accidentally run once PER instance unless something coordinates which instance actually gets to run it, typically a distributed lock (like ShedLock) or delegating scheduling to an external system entirely.",
    "For genuinely reliable, missed-run-safe scheduling (surviving a restart at exactly the wrong moment, or coordinating across instances), production systems often lean on Quartz Scheduler (persistent job state in a database) rather than the simpler in memory @Scheduled annotation."
  ],
  mainComponents: [
    "It is like setting a recurring alarm on your phone once, instead of manually remembering to do the same task at the same time every single day for the rest of your life. You set the rule once, the system enforces it forever."
  ],
  realWorldExamples: [
    "A nightly batch job cleaning up expired password reset tokens, running via a simple @Scheduled cron expression, entirely inside the same application, no external cron server needed.",
    "A subtle production bug where a horizontally scaled service with three instances runs a \"send daily digest email\" job THREE times, because @Scheduled by default has no awareness that other instances of the same application exist.",
    "Interview question: \"What is the difference between fixedRate and fixedDelay?\" fixedRate measures the interval from the start of one run to the start of the next, and can overlap if a run takes longer than the interval. fixedDelay measures from the END of one run to the start of the next, and never overlaps."
  ],
  complexityAndTradeoffs: [
    "Before: A horizontally scaled deployment silently runs \"once daily\" jobs once per instance, duplicating work or sending duplicate emails.",
    "After: Exactly one instance runs the scheduled job per interval, regardless of how many instances are running.",
    "Duplicate scheduled job execution is a subtle bug that only appears once an application scales past one instance, which is precisely why it is so often missed until it causes a real, visible problem, like duplicate customer emails.",
    "@Scheduled (Spring built in): use it when simple, in application scheduling needs, especially in single instance deployments or where duplicate runs are harmless. Avoid it when multi instance deployments needing exactly once execution, or jobs needing persistent state that survives an application restart.",
    "Quartz Scheduler: use it when jobs needing persistent, database backed scheduling state, misfire handling, and clustering support built in. Avoid it when simple periodic tasks where the added setup complexity of Quartz is not justified.",
    "External scheduler (Kubernetes CronJob, cloud scheduler service): use it when scheduling that should be decoupled entirely from the application's own lifecycle and scaling, especially for infrastructure level or cross service tasks. Avoid it when simple tasks tightly coupled to a single application's internal logic and dependencies."
  ],
  commonMistakes: [
    "Deploying a @Scheduled job to a horizontally scaled, multi instance environment without any distributed locking or coordination. Each instance runs its own independent copy of the scheduler, with zero built in awareness of other instances, so a \"once daily\" job silently becomes \"once daily, per instance.\" Fix: Add a distributed lock (like ShedLock) around the scheduled method, or move genuinely singleton scheduled work to a dedicated, single instance service or an external scheduler."
  ],
  interviewPerspective: "A common way this gets tested: \"A @Scheduled cron job is deployed across three horizontally scaled application instances with no additional coordination. How many times does it actually run at the scheduled time?\" Three times, once independently on each instance, since Spring's @Scheduled has no built in awareness of other running instances of the same application.",
  triggerSentence: "A scheduled job runs on every instance that is listening, unless you explicitly tell only one of them to actually go."
};

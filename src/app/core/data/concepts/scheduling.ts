import { ConceptContent } from '../../models/content.model';

export const SCHEDULING: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'scheduling',
  title: 'Scheduling',

  hook:
    'Every night at 2 AM, without a single human touching a keyboard, a report gets generated and emailed to finance. ' +
    'Nobody is sitting there clicking a button at 2 AM. Something inside the application itself is keeping time.',

  problem:
    'Some work genuinely has nothing to do with a user request, cleaning up expired sessions, generating nightly ' +
    'reports, retrying failed jobs. That work needs to run on a clock, not in response to anyone clicking anything, and ' +
    'a real application needs a reliable, built in way to make that happen.',

  aha: {
    statement: 'Scheduling lets you declare "run this method on this schedule" directly in code, and the framework takes care of the actual timer, the thread, and the triggering, forever, without any external cron job or manual intervention.',
    analogy:
      'It is like setting a recurring alarm on your phone once, instead of manually remembering to do the same task at the same time every single day for the rest of your life. You set the rule once, the system enforces it forever.'
  },

  underTheHood: [
    '@EnableScheduling on a Spring Boot configuration class turns on the framework\'s internal task scheduler.',
    '@Scheduled(fixedRate = 5000) runs a method every 5 seconds measured from the START of the previous execution. @Scheduled(fixedDelay = 5000) runs 5 seconds after the previous execution FINISHED, which matters a lot if the task sometimes takes longer than the interval.',
    '@Scheduled(cron = "0 0 2 * * *") uses standard cron expression syntax for schedules that are not simple fixed intervals, like "every day at 2 AM" or "every weekday at 9 AM".',
    'By default, Spring runs ALL @Scheduled methods on a single shared thread, one at a time. A slow scheduled task can silently delay every OTHER scheduled task in the application unless a dedicated task executor with a larger thread pool is explicitly configured.',
    'In a multi instance, horizontally scaled deployment, every instance runs its own copy of @Scheduled methods independently by default, meaning a "run once daily" job can accidentally run once PER instance unless something coordinates which instance actually gets to run it, typically a distributed lock (like ShedLock) or delegating scheduling to an external system entirely.',
    'For genuinely reliable, missed-run-safe scheduling (surviving a restart at exactly the wrong moment, or coordinating across instances), production systems often lean on Quartz Scheduler (persistent job state in a database) rather than the simpler in memory @Scheduled annotation.'
  ],

  inTheWild: [
    'A nightly batch job cleaning up expired password reset tokens, running via a simple @Scheduled cron expression, entirely inside the same application, no external cron server needed.',
    'A subtle production bug where a horizontally scaled service with three instances runs a "send daily digest email" job THREE times, because @Scheduled by default has no awareness that other instances of the same application exist.',
    'Interview question: "What is the difference between fixedRate and fixedDelay?" fixedRate measures the interval from the start of one run to the start of the next, and can overlap if a run takes longer than the interval. fixedDelay measures from the END of one run to the start of the next, and never overlaps.'
  ],

  showMe: {
    caption: 'A naive scheduled job with no instance coordination versus one protected against running multiple times across a scaled deployment.',
    bad: {
      language: 'java',
      code:
        '@Scheduled(cron = "0 0 2 * * *")\n' +
        'public void sendDailyDigest() {\n' +
        '    emailService.sendDigestToAllUsers();\n' +
        '} // runs once PER application instance, every instance sends the digest independently',
      explanation:
        'With three horizontally scaled instances, this job fires three separate times at 2 AM, and every user receives the exact same digest email three times.'
    },
    good: {
      language: 'java',
      code:
        '@Scheduled(cron = "0 0 2 * * *")\n' +
        '@SchedulerLock(name = "sendDailyDigest", lockAtMostFor = "10m")\n' +
        'public void sendDailyDigest() {\n' +
        '    emailService.sendDigestToAllUsers();\n' +
        '} // ShedLock ensures only ONE instance actually acquires the lock and runs the job',
      explanation:
        'A distributed lock, held in a shared database or Redis, ensures only the first instance to grab the lock actually executes the job, and every other instance skips it that run.'
    }
  },

  impact: {
    before: 'A horizontally scaled deployment silently runs "once daily" jobs once per instance, duplicating work or sending duplicate emails.',
    after: 'Exactly one instance runs the scheduled job per interval, regardless of how many instances are running.',
    metric: 'Duplicate scheduled job execution is a subtle bug that only appears once an application scales past one instance, which is precisely why it is so often missed until it causes a real, visible problem, like duplicate customer emails.'
  },

  alternatives: [
    {
      name: '@Scheduled (Spring built in)',
      whenToUse: 'Simple, in application scheduling needs, especially in single instance deployments or where duplicate runs are harmless.',
      whenNotToUse: 'Multi instance deployments needing exactly once execution, or jobs needing persistent state that survives an application restart.'
    },
    {
      name: 'Quartz Scheduler',
      whenToUse: 'Jobs needing persistent, database backed scheduling state, misfire handling, and clustering support built in.',
      whenNotToUse: 'Simple periodic tasks where the added setup complexity of Quartz is not justified.'
    },
    {
      name: 'External scheduler (Kubernetes CronJob, cloud scheduler service)',
      whenToUse: 'Scheduling that should be decoupled entirely from the application\'s own lifecycle and scaling, especially for infrastructure level or cross service tasks.',
      whenNotToUse: 'Simple tasks tightly coupled to a single application\'s internal logic and dependencies.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Deploying a @Scheduled job to a horizontally scaled, multi instance environment without any distributed locking or coordination.',
      why:
        'Each instance runs its own independent copy of the scheduler, with zero built in awareness of other instances, so a "once daily" job silently becomes "once daily, per instance."',
      fix: 'Add a distributed lock (like ShedLock) around the scheduled method, or move genuinely singleton scheduled work to a dedicated, single instance service or an external scheduler.'
    }
  ],

  proveIt: {
    question: 'A @Scheduled cron job is deployed across three horizontally scaled application instances with no additional coordination. How many times does it actually run at the scheduled time?',
    answer:
      'Three times, once independently on each instance, since Spring\'s @Scheduled has no built in awareness of other running instances of the same application.'
  },

  oneLiner: 'A scheduled job runs on every instance that is listening, unless you explicitly tell only one of them to actually go.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'async-programming',
      title: 'Async Programming',
      note: 'A scheduled job that kicks off long running work often hands that work off asynchronously so the scheduler thread itself is not blocked.'
    },
    {
      categoryId: 'operating-systems',
      topicId: 'linux-operating-systems',
      conceptId: 'cron',
      title: 'Cron',
      note: 'The cron expression syntax @Scheduled uses is the exact same convention Linux cron jobs have used for decades.'
    }
  ]
};

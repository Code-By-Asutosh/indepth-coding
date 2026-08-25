# AI Mock Assessment Platform — Master Context / Product & Build Specification

## 1. Product Vision

Build a visually polished, focused AI-powered technical assessment website whose primary job is:

> A learner types one technical topic they have already studied, and the platform generates a focused mixed-format mock assessment specifically around that topic.

This is NOT intended to be a generic interview-question bank, a course platform, a note-taking app, or a profile/analytics-heavy interview portal.

The core learning philosophy is:

> "I think I understand this topic. Now prove it by applying it."

Example:

User enters:

    ArrayList

The platform should create an assessment that tests multiple dimensions of ArrayList understanding:

- Conceptual understanding
- Predict the output
- Find the bug
- Real-world scenario
- Write/fix code
- Choose the best solution
- Performance/time-complexity reasoning
- Internal implementation reasoning
- Trade-off/decision questions
- Cross-topic connections when appropriate

The platform should feel like a modern, premium technical assessment product rather than a static quiz page.

---

# 2. Core Problem We Are Solving

A learner can read a topic deeply and still have a false sense of understanding.

For example, a learner may know:

- ArrayList uses a dynamic array
- get() is generally O(1)
- add() is generally amortized O(1)
- remove() can be O(n)

But when faced with a production scenario, debugging problem, code-output question, or design trade-off, they may struggle.

The platform exists to expose this gap.

Therefore:

DO NOT optimize for "How many questions can we show?"

Optimize for:

> "How effectively can we test whether the learner can actually use the concept?"

---

# 3. First-Phase Scope

The first version should be intentionally focused.

## In scope

1. Topic input
2. AI-generated assessment
3. Mixed question types
4. Beautiful rendering for each question type
5. User answer input
6. Submit/evaluate action
7. AI evaluation of answers
8. Result per question
9. Overall result/summary
10. Ability to retry / generate another assessment for the same topic
11. AI provider/model selection during development
12. Configurable AI API key via environment configuration
13. Clean architecture so backend can be added later

## Out of scope for V1

Do NOT overbuild:

- User accounts
- Authentication
- Social features
- Leaderboards
- Public profiles
- Subscription system
- Complex admin dashboards
- Long-term analytics
- Persistent user history
- Large database
- Resume parser
- Job matching
- Interview scheduling
- Notifications
- Gamification-heavy systems

The first version should prove the core experience:

    Topic → AI understands topic → AI generates assessment → UI renders it beautifully → user answers → AI evaluates → learner sees what they actually understand

---

# 4. Important Product Principle

The UI may be frontend-first and minimal, but the experience must feel intelligent.

Do not make the website look like:

    Search → list of generic questions

Instead it should feel like:

    "Tell me what you just learned. I will challenge your understanding."

The generated assessment should be specific to the requested topic.

---

# 5. Example End-to-End User Flow

## Step 1 — Landing screen

Show a clean hero section:

    Test Your Understanding, Not Your Memory.

Supporting text:

    Enter a technical concept you just learned.
    Get a focused AI-generated assessment that tests concepts,
    code, debugging, scenarios, and practical decisions.

Input:

    [ Search / enter a topic... ]

Examples/chips:

    ArrayList
    HashMap
    Java Streams
    Spring @Transactional
    Spring Security
    REST API pagination
    Kafka consumer groups
    AWS S3
    MySQL indexes
    Microservices circuit breaker

Button:

    Generate Assessment

---

# 6. Topic Input Behavior

The user can enter:

- A single topic
- A specific concept
- A narrow technical problem
- A related concept

Examples:

    ArrayList
    Java HashMap
    ConcurrentHashMap
    Spring Boot Bean Lifecycle
    @Transactional
    JPA N+1 Problem
    API Gateway
    AWS S3 presigned URL
    MySQL composite index
    Kafka consumer group
    Docker health check

The AI should NOT simply repeat the topic name.

It should infer:

1. What the concept is
2. What sub-concepts matter
3. What misunderstandings are common
4. What practical situations are relevant
5. Which neighboring concepts can reasonably be connected

---

# 7. Topic Intelligence Layer

Before generating questions, the AI should internally create a lightweight "topic map".

Example:

Topic:

    ArrayList

Possible topic map:

    ArrayList
    ├── Internal structure
    │   └── Dynamic array
    ├── Capacity
    │   ├── Initial capacity
    │   └── Resizing
    ├── Operations
    │   ├── add
    │   ├── add(index, value)
    │   ├── get
    │   ├── set
    │   └── remove
    ├── Complexity
    │   ├── O(1)
    │   ├── O(n)
    │   └── amortized complexity
    ├── Memory behavior
    ├── Iteration
    │   ├── Iterator
    │   └── ConcurrentModificationException
    ├── Comparisons
    │   ├── ArrayList vs LinkedList
    │   └── ArrayList vs array
    └── Real-world use
        ├── read-heavy access
        ├── insertion patterns
        └── capacity planning

This topic map is used only as an internal planning structure for question generation.

The UI does NOT need to expose the full topic map in V1.

---

# 8. Assessment Generation Philosophy

Each assessment should feel intentionally designed.

Avoid creating 10 variations of the same question.

The AI should cover different dimensions of understanding.

Default assessment mix:

- 2 Conceptual MCQs
- 2 Predict the Output
- 2 Debug/Fix
- 3 Real-World Scenario
- 2 Best-Solution / Trade-off
- 2 Coding tasks
- 1 Cross-topic / Advanced reasoning question

Default total:

    14 questions

Allow a configurable number later.

The exact number may be changed via configuration.

---

# 9. Question Types

## 9.1 Conceptual MCQ

Purpose:

Test fundamental understanding.

Example:

Question:

Which statement best explains why ArrayList get(index) is generally O(1)?

Options:

A. It uses hashing
B. It stores elements in contiguous index-based storage
C. It uses a linked node structure
D. It sorts the collection automatically

The learner can click exactly one option.

Support single-choice and eventually multiple-choice.

---

# 9.2 Predict the Output

Purpose:

Test whether the learner can mentally execute code.

Example:

```java
List<String> list = new ArrayList<>();

list.add("A");
list.add("B");
list.add(1, "C");

System.out.println(list);
```

Possible answer:

    [A, C, B]

The code block must be rendered with syntax highlighting.

The answer UI may be:

- short text input
- multiple choice
- code/output textarea

depending on question design.

---

# 9.3 Find the Bug

Purpose:

Test debugging and practical reasoning.

Example:

```java
List<Integer> values = new ArrayList<>();

for (Integer value : values) {
    if (value == 10) {
        values.remove(value);
    }
}
```

Prompt:

    What is wrong with this code?
    Explain the failure and propose a correct approach.

The learner should have a large text/code area.

Evaluation should assess:

- identifying the problem
- understanding why it occurs
- correctness of proposed fix
- explanation quality

Do NOT require one exact textual answer when multiple technically valid solutions exist.

---

# 9.4 Real-World Scenario

Purpose:

Test applied engineering judgment.

Example:

    Your Spring Boot service loads approximately 1,000,000 records
    into memory before processing them.

    You already know the approximate collection size.

    Would you simply use the default ArrayList constructor?
    What would you consider before choosing the collection strategy?

Expected reasoning may include:

- capacity
- resizing
- memory usage
- processing strategy
- streaming/chunking
- actual access pattern
- whether the entire dataset belongs in memory

The AI should grade reasoning, not keyword matching.

---

# 9.5 Best Solution / Trade-Off

Purpose:

Test decision making.

Example:

    You have a list that is read frequently,
    indexed access is common,
    and inserts in the middle are rare.

    Which data structure is the most appropriate?

Or:

    A list frequently grows to 500,000 elements.
    Which design choice is most likely to reduce unnecessary resizing?

The AI should explicitly test trade-offs.

---

# 9.6 Coding Question

Purpose:

Test implementation ability.

Examples:

- Write a method
- Fix broken code
- Optimize a piece of code
- Implement an operation
- Refactor code
- Explain complexity
- Complete missing logic

Example:

```java
public static List<Integer> removeDuplicates(List<Integer> input) {
    // implement
}
```

The coding editor should be visually distinct from normal text fields.

Use a monospaced font and proper code formatting.

V1 does NOT need a real code execution engine.

For V1, AI evaluates submitted code semantically.

A real sandboxed code execution service can be added later.

---

# 9.7 Cross-Topic Question

Only use this when the relationship is genuinely meaningful.

Example:

Topic:

    ArrayList

Cross-topic:

    ArrayList + equals/hashCode

or:

    ArrayList + Streams

or:

    ArrayList + concurrency

or:

    ArrayList + JPA result processing

The AI must not force unrelated concepts.

Cross-topic questions should appear only when the dependency makes sense.

---

# 10. Difficulty Levels

Support:

- Beginner
- Intermediate
- Advanced
- Interview Hard

Default:

    Intermediate

Difficulty should not only mean "longer question".

Difficulty should increase through reasoning complexity.

## Beginner

- Direct concepts
- Basic code behavior
- Simple output

## Intermediate

- Application
- Debugging
- Complexity
- Moderate scenarios

## Advanced

- Trade-offs
- Edge cases
- Internals
- Performance

## Interview Hard

- Ambiguous production scenarios
- Multiple plausible choices
- Architecture consequences
- Subtle Java/Spring behavior
- "Best answer" rather than obvious answer
- Follow-up style reasoning

---

# 11. Assessment Configuration

The UI may provide:

    Topic
    Difficulty
    Number of Questions
    Assessment Mode

Assessment Mode examples:

    Balanced
    Scenario Heavy
    Coding Heavy
    Interview Hard
    Fundamentals
    Random Mix

V1 can start with:

    Topic
    Difficulty
    Number of Questions

and keep advanced mode settings hidden behind "More Options".

---

# 12. AI Provider / Model Configuration

The platform should be designed to support multiple AI providers.

Possible providers:

- OpenAI
- Anthropic
- Google Gemini
- OpenRouter
- Ollama/local models
- Any future OpenAI-compatible provider

The user/developer should be able to configure:

    provider
    model
    apiKey
    baseUrl (when applicable)

Example development environment configuration:

```env
AI_PROVIDER=openai
AI_MODEL=gpt-5
AI_API_KEY=your_key_here
AI_BASE_URL=
```

Alternative:

```env
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-pro
AI_API_KEY=your_key_here
```

Or:

```env
AI_PROVIDER=ollama
AI_MODEL=llama3.1
AI_BASE_URL=http://localhost:11434
AI_API_KEY=
```

IMPORTANT SECURITY REQUIREMENT:

If this is a browser-only frontend, NEVER embed a private production API key into the public JavaScript bundle.

Environment variables in many frontend frameworks are build-time substitutions, not secrets.

For development, a local environment can be used.

For a production deployment, use one of:

1. A secure backend proxy
2. A serverless function
3. An edge function
4. A local desktop wrapper
5. Another secure secret-management layer

V1 may be intentionally local/developer-focused, but the architecture must make it easy to add a secure AI proxy later.

---

# 13. Provider Selection UI

During development, provide a small configuration area.

Example:

    AI Provider
    [ OpenAI ▼ ]

    Model
    [ gpt-5 ▼ ]

    API Key
    [ ••••••••••••• ]

    Base URL
    [ optional ]

    [ Test Connection ]

This area should be clearly marked:

    Developer / AI Configuration

It should NOT dominate the learner-facing experience.

The platform should remember configuration only locally if needed.

Do not silently upload API keys anywhere other than the selected provider endpoint.

---

# 14. AI Agent Instruction for Question Generation

The AI generating questions must behave like an experienced technical interviewer + technical educator.

Use the following conceptual system prompt:

---

You are an expert technical interviewer and assessment designer.

Your job is not to create generic trivia.

Your job is to determine whether a learner can genuinely understand and apply a technical topic.

Given a topic, first identify its important conceptual dimensions, implementation details, common mistakes, edge cases, performance considerations, and real-world usage patterns.

Then create a balanced assessment.

Every question must have a clear testing purpose.

Prefer questions that distinguish memorization from understanding.

Use a mixture of:

- conceptual MCQs
- code/output questions
- debugging
- real-world scenarios
- trade-off decisions
- coding tasks
- cross-topic reasoning when appropriate

Do not generate duplicate questions.

Do not ask extremely obscure trivia unless the difficulty is intentionally advanced.

Do not invent APIs, runtime behavior, or framework behavior.

When framework/library behavior is involved, prefer technically defensible behavior based on established semantics.

Question wording should be concise but realistic.

For scenario questions, make the situation believable for a software engineer.

For coding questions, ensure the requested task is clear and realistically solvable.

Every question should include enough information to answer it without guessing hidden assumptions.

---

# 15. Required Question JSON Schema

AI question generation should return structured JSON.

Do NOT return free-form markdown as the primary API response.

Recommended schema:

```json
{
  "assessment": {
    "topic": "ArrayList",
    "difficulty": "intermediate",
    "title": "ArrayList Understanding Assessment",
    "description": "A mixed assessment focused on practical understanding of ArrayList.",
    "questions": [
      {
        "id": "q1",
        "type": "mcq",
        "skill": "internal-structure",
        "difficulty": "intermediate",
        "question": "Why is ArrayList get(index) generally O(1)?",
        "options": [
          "It uses hashing",
          "It uses index-based backing storage",
          "It uses linked nodes",
          "It sorts elements automatically"
        ],
        "correctAnswer": "It uses index-based backing storage",
        "explanation": "ArrayList provides index-based access to its backing array, so retrieving by index is generally constant time.",
        "evaluationCriteria": []
      }
    ]
  }
}
```

For coding:

```json
{
  "id": "q2",
  "type": "coding",
  "skill": "implementation",
  "question": "Write a method that removes duplicate integers while preserving insertion order.",
  "starterCode": "public static List<Integer> solve(List<Integer> input) {\\n    // TODO\\n}",
  "expectedConcepts": [
    "preserve insertion order",
    "duplicate removal"
  ],
  "evaluationCriteria": [
    "correctness",
    "edge cases",
    "readability",
    "complexity"
  ]
}
```

For scenario:

```json
{
  "id": "q3",
  "type": "scenario",
  "skill": "performance-decision",
  "question": "A service loads hundreds of thousands of records into memory...",
  "expectedConcepts": [
    "capacity",
    "memory",
    "access pattern",
    "streaming/chunking"
  ],
  "evaluationCriteria": [
    "identifies relevant trade-offs",
    "avoids unnecessary assumptions",
    "proposes practical solution"
  ]
}
```

---

# 16. Why Structured JSON Is Critical

The UI should never have to guess what a question is.

The renderer should use:

    question.type

to decide which component to render.

Conceptually:

```text
question.type
     |
     +-- mcq       -> MCQComponent
     +-- output    -> OutputPredictionComponent
     +-- debug     -> DebugComponent
     +-- scenario  -> ScenarioComponent
     +-- coding    -> CodingEditorComponent
     +-- tradeoff  -> DecisionComponent
```

This creates a clean component architecture.

---

# 17. UI Rendering Requirements

The most important UI requirement is:

> Every AI-generated question must be rendered cleanly and consistently even though questions have different structures.

The user must never see raw JSON.

The assessment UI should feel like a polished interview platform.

---

# 18. Assessment Screen Layout

Recommended layout:

```text
┌───────────────────────────────────────────────────────────┐
│ ArrayList Assessment                        4 / 14       │
│ Intermediate                                             │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Scenario                                                 │
│                                                           │
│  Your Spring Boot service loads approximately             │
│  500,000 objects into memory...                           │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Your answer...                                      │  │
│  │                                                     │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│                         [ Save Answer ]                   │
│                                                           │
│        [ Previous ]                  [ Next ]             │
└───────────────────────────────────────────────────────────┘
```

Include:

- question number
- progress indicator
- question type badge
- difficulty badge
- clear typography
- comfortable spacing
- code blocks
- answer area appropriate to type
- navigation
- final submit button

---

# 19. MCQ UI

Use large clickable answer cards.

Example:

    ○ A. ...
    ○ B. ...
    ○ C. ...
    ○ D. ...

States:

- default
- hover
- selected
- disabled
- correct after evaluation
- incorrect after evaluation

Do NOT overcrowd the UI.

---

# 20. Code UI

Use a proper code editor-like component.

Requirements:

- monospace font
- line numbers when practical
- syntax highlighting
- copy button
- code input area
- good mobile fallback

For V1, CodeMirror or Monaco can be used.

Do not build a full IDE.

---

# 21. Text Answer UI

Large textarea.

Support:

- multi-line answer
- readable line height
- character count optional
- auto-expand optional

---

# 22. Result UI

After submit:

Show:

    Assessment Complete

    Score: 10 / 14

But do NOT make score the only result.

Also show:

    Strong Areas
    - ArrayList operations
    - basic complexity

    Needs More Practice
    - resizing behavior
    - iterator behavior
    - production decision making

Each question should show:

    ✅ Correct
    ❌ Incorrect
    ⚠️ Partially Correct

And:

    What you got right
    What you missed
    Better reasoning
    Suggested concept to revisit

---

# 23. AI Answer Evaluation Agent

The evaluator should behave differently from the question generator.

It is an expert technical interviewer and evaluator.

It receives:

- topic
- question
- question type
- expected answer / expected concepts
- evaluation criteria
- learner answer
- optionally coding submission

It should evaluate conceptual correctness, not literal text similarity.

---

# 24. Evaluation Rules

For MCQ:

    Exact selection check.

For code output:

    Evaluate semantic correctness.
    Allow formatting differences.

For debugging:

    Evaluate whether the learner:
    1. identified the actual issue
    2. understood why it happens
    3. proposed a valid fix

For scenarios:

    Evaluate:
    - correctness
    - reasoning
    - trade-offs
    - assumptions
    - practicality

For coding:

    Evaluate:
    - functional correctness
    - edge cases
    - complexity
    - readability
    - idiomatic implementation

Do NOT require exactly one wording.

---

# 25. Evaluation Output JSON

Use structured output:

```json
{
  "questionId": "q3",
  "result": "partially_correct",
  "score": 7,
  "maxScore": 10,
  "summary": "You identified the resizing concern but missed the memory implications of loading the complete dataset.",
  "strengths": [
    "Recognized that repeated resizing can be reduced by choosing an appropriate initial capacity."
  ],
  "gaps": [
    "Did not consider whether the entire dataset should be held in memory."
  ],
  "idealReasoning": [
    "Consider the access pattern.",
    "Estimate memory requirements.",
    "Consider pre-sizing when the dataset genuinely belongs in memory.",
    "For very large datasets, consider streaming or chunked processing."
  ],
  "conceptsToReview": [
    "ArrayList capacity",
    "Amortized complexity",
    "Memory-aware collection design"
  ],
  "confidence": 0.93
}
```

---

# 26. Evaluation Severity

Use:

    correct
    partially_correct
    incorrect

Avoid a binary pass/fail model for open-ended questions.

Example:

A learner may know the correct solution but explain it poorly.

That is different from:

A learner completely misunderstands the concept.

---

# 27. Avoid Bad AI Evaluation

Do NOT:

- grade solely by keyword matching
- mark valid alternative solutions wrong
- punish minor wording differences
- fabricate flaws
- claim code is wrong without reasoning
- produce vague feedback like "study more"

Feedback should be specific.

Bad:

    "You should improve your knowledge of ArrayList."

Good:

    "Your answer correctly explains indexed access, but you treated add(index, value) as O(1). Inserting in the middle requires shifting subsequent elements, so the operation is generally O(n)."

---

# 28. Prompt for Answer Evaluator

Conceptual instruction:

---

You are an expert software-engineering interviewer and evaluator.

Evaluate the learner's answer based on technical correctness and reasoning.

Do not compare strings literally.

For open-ended responses, allow multiple valid approaches.

Identify exactly what is correct, what is incorrect, and what is missing.

Do not invent requirements not present in the question.

For scenario questions, evaluate trade-offs rather than expecting one memorized phrase.

For coding questions, evaluate functionality, correctness, edge cases, complexity, and clarity.

Return structured JSON only.

Be honest and precise.

---

# 29. Frontend Architecture

V1 should be frontend-first.

Suggested stack:

    React + TypeScript
    Vite
    Tailwind CSS
    shadcn/ui or another clean component library
    Monaco Editor or CodeMirror
    Zod for schema validation
    Zustand or React Context only if state complexity requires it

Alternative stack is acceptable if requested by the developer.

The implementation should prioritize maintainability and clean component separation.

---

# 30. Suggested Component Structure

```text
src/
├── components/
│   ├── TopicSearch/
│   ├── Assessment/
│   │   ├── AssessmentHeader
│   │   ├── AssessmentProgress
│   │   ├── QuestionRenderer
│   │   ├── McqQuestion
│   │   ├── OutputQuestion
│   │   ├── DebugQuestion
│   │   ├── ScenarioQuestion
│   │   ├── CodingQuestion
│   │   ├── TradeoffQuestion
│   │   └── QuestionNavigation
│   ├── Results/
│   │   ├── ResultSummary
│   │   ├── QuestionResult
│   │   └── ConceptGapCard
│   └── Settings/
│       └── AiProviderSettings
│
├── services/
│   ├── ai/
│   │   ├── provider.ts
│   │   ├── openai.ts
│   │   ├── gemini.ts
│   │   ├── anthropic.ts
│   │   └── ollama.ts
│   ├── questionGenerator.ts
│   └── answerEvaluator.ts
│
├── models/
│   ├── assessment.ts
│   ├── question.ts
│   └── evaluation.ts
│
├── prompts/
│   ├── questionGenerationPrompt.ts
│   └── answerEvaluationPrompt.ts
│
├── pages/
│   ├── Home
│   ├── Assessment
│   └── Results
│
└── config/
    └── aiConfig.ts
```

Adjust structure to the chosen framework if different.

---

# 31. AI Provider Abstraction

Do not couple the UI directly to OpenAI.

Use an abstraction:

```ts
interface AiProvider {
  generateAssessment(input: AssessmentRequest): Promise<Assessment>;
  evaluateAnswers(input: EvaluationRequest): Promise<EvaluationResult>;
}
```

Then implement:

```text
OpenAIProvider
GeminiProvider
AnthropicProvider
OllamaProvider
OpenAICompatibleProvider
```

The UI should not know which provider generated the response.

---

# 32. Schema Validation

Every AI response must be validated before rendering.

Use Zod or equivalent.

Pipeline:

    AI response
        ↓
    parse JSON
        ↓
    schema validation
        ↓
    normalized model
        ↓
    UI

If validation fails:

1. Attempt one repair/structured retry if practical.
2. Otherwise show a friendly error.
3. Never crash the UI because the model returned malformed JSON.

---

# 33. Error Handling

The UI should gracefully handle:

- missing API key
- invalid API key
- provider unavailable
- rate limit
- malformed AI response
- network timeout
- empty topic
- unsupported provider/model
- insufficient AI response
- model refusal
- server error

Example:

    We couldn't generate the assessment.

    Check your AI provider settings and try again.

Do not display raw stack traces to the user.

---

# 34. Topic Validation

The entered topic may be:

- valid
- vague
- misspelled
- too broad
- non-technical
- unsupported

The AI should normalize where possible.

Example:

    "array list"

→

    "Java ArrayList"

Example:

    "transaction spring"

→

    "Spring @Transactional and transaction management"

If the topic is too broad:

    "Java"

The platform can offer:

    Core Java
    Collections
    Concurrency
    JVM
    Streams
    Exception Handling

But V1 may simply generate a broad assessment if no additional UI is desired.

---

# 35. Empty / Invalid Input

Do not send blank topics to the model.

Show:

    Enter a topic first.

For example:

    ArrayList
    HashMap
    Spring @Transactional
    MySQL indexing

---

# 36. Visual Design Direction

The visual quality is a major requirement.

Target feel:

- premium
- modern
- technical
- clean
- minimal
- focused
- not childish
- not corporate-heavy
- not cluttered

Suggested visual language:

- dark-first or elegant neutral theme
- subtle gradients
- rounded cards
- strong typography
- clear hierarchy
- soft borders
- restrained shadows
- subtle animation
- generous spacing

Avoid:

- excessive neon
- excessive glassmorphism
- too many gradients
- giant rounded blobs
- distracting animation

The user's attention should remain on the question.

---

# 37. Home Screen UX

Suggested structure:

```text
Top Navigation
    Logo
    Practice
    Settings

Hero
    "Test What You Actually Understand."
    "Enter a topic. Get a focused technical mock."

Topic Search

    [ 🔍  ArrayList                         ]

Suggestion Chips

    Java ArrayList
    HashMap
    Spring Boot Transactions
    AWS S3
    MySQL Indexes

Configuration Preview

    Difficulty: Intermediate
    Questions: 14
    Mode: Balanced

    [ Generate Mock ]
```

---

# 38. Assessment UX Details

Display one question at a time by default.

Why?

Because the assessment should feel like an interview, not a giant form.

Support:

- next
- previous
- question navigator
- progress bar
- mark for review
- answer state indicator

At the top:

    Question 6 of 14

At the bottom:

    Previous        Next

Final:

    Review & Submit

---

# 39. Review Screen

Before submission, allow the learner to see:

    1  ✅ Answered
    2  ✅ Answered
    3  ⚪ Unanswered
    4  ✅ Answered
    ...

Then:

    Submit Assessment

The user should be warned if unanswered questions exist.

---

# 40. Loading State

AI generation may take time.

Use an intelligent loading screen:

    Understanding "ArrayList"...

    Mapping key concepts...

    Designing scenarios...

    Building coding challenges...

    Preparing your mock...

Rotate these messages subtly.

Do not pretend that a specific internal operation happened if it did not.

These are UX messages only.

---

# 41. Results Screen Design

Top:

    Assessment Complete

    72%

Then cards:

    Concept Understanding
    Practical Application
    Debugging
    Coding
    Decision Making

Use visual bars or compact cards.

Then:

    Your strongest areas
    Your weak areas

Then:

    Question-by-question review

Each question result card:

    ✅ Correct
    Question
    Your Answer
    Feedback
    Better Reasoning

---

# 42. Regenerate Assessment

Button:

    Generate Another Mock

Behavior:

Generate a DIFFERENT set.

Avoid reusing exact questions from the previous set.

Prefer new:

- scenarios
- code
- edge cases
- wording
- trade-offs

If a previous result is available, optionally tell the generator:

    focus more on weak concepts

This creates the foundation for adaptive practice.

---

# 43. Adaptive Second Attempt

V1 optional, but architecture should allow it.

Example:

Attempt 1:

    Strong:
    - basic operations
    - access complexity

    Weak:
    - resizing
    - iterator behavior

Attempt 2 should increase:

    - capacity/resizing questions
    - iterator questions
    - debugging questions

and decrease:

    easy basic operation questions

This is the long-term product advantage.

---

# 44. Local State

For V1, persistence can be minimal.

Possible localStorage:

    current assessment
    answers
    temporary AI configuration
    last topic

Do not create complex storage architecture.

Never store API keys in plain localStorage unless there is an explicit, informed local-only development setting.

Prefer in-memory state or secure OS/browser mechanisms when available.

---

# 45. API Key Security Requirement

This must be prominently respected:

A frontend build cannot guarantee a secret API key.

Therefore:

Development:

    .env.local
    local machine only

Example:

```env
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-5
VITE_AI_API_KEY=...
```

BUT:

Do not assume this is secure in production.

For production:

    Browser
       ↓
    Secure API endpoint
       ↓
    Provider using server-side secret

The frontend should use a provider abstraction so migrating from direct development calls to a secure backend proxy later is easy.

---

# 46. Environment File Example

Create:

```text
.env.example
```

Example:

```env
# AI provider
AI_PROVIDER=openai

# Model name
AI_MODEL=

# API key - DEVELOPMENT ONLY
AI_API_KEY=

# Optional for providers supporting custom endpoints
AI_BASE_URL=
```

The actual .env file must never be committed.

Ensure .gitignore contains:

```text
.env
.env.local
.env.*.local
```

---

# 47. AI Model Selection

Allow a developer to choose model.

Do not hardcode the UI around one model.

Example UI:

```text
Provider:
[ OpenAI ▼ ]

Model:
[ gpt-5 ▼ ]
```

If dynamic model discovery is not implemented, use a configurable list.

The system should allow model IDs to be entered manually if necessary.

---

# 48. Provider Abstraction Details

Recommended internal flow:

```text
Question Generator
       ↓
AiProvider interface
       ↓
Selected provider adapter
       ↓
Provider API
       ↓
Raw response
       ↓
JSON extraction
       ↓
Schema validation
       ↓
Assessment object
```

Similarly:

```text
Learner Answers
       ↓
Evaluation Service
       ↓
AiProvider
       ↓
Structured Evaluation JSON
       ↓
Schema validation
       ↓
Results UI
```

---

# 49. AI Context Should Include Technical Perspective

When generating questions, the AI should consider:

- fundamentals
- internals
- behavior
- complexity
- edge cases
- misuse
- debugging
- production implications
- trade-offs
- adjacent concepts

This prevents the assessment from becoming a glossary quiz.

---

# 50. Anti-Repetition Rules

The generator should avoid:

- same question wording
- same code snippet
- same scenario
- same answer pattern

Also avoid making the correct MCQ option always:

    B

Randomize option positions.

Do not let the question structure reveal the answer.

---

# 51. Question Quality Rules

Before returning an assessment, AI should internally check:

1. Is every question actually related to the topic?
2. Is there one defensible answer for MCQs?
3. Are distractors plausible?
4. Is the question technically accurate?
5. Is the difficulty appropriate?
6. Is there enough context?
7. Is the question testing something different from the others?
8. Are coding tasks solvable?
9. Are scenario assumptions clear?
10. Does the question test understanding rather than memorization?

---

# 52. Important AI Instruction: Do Not Hallucinate

For Java, Spring Boot, AWS, MySQL, Microservices, etc.:

- Do not invent methods
- Do not invent framework behavior
- Do not invent API semantics
- Do not confidently state uncertain behavior as fact

When the model is uncertain, the generation layer should prefer conservative, well-established questions.

---

# 53. Technology Examples the Platform Must Handle Well

The platform should work for topics across:

## Java

- ArrayList
- HashMap
- HashSet
- equals/hashCode
- String pool
- immutability
- records
- generics
- streams
- Optional
- exceptions
- multithreading
- synchronized
- volatile
- ExecutorService
- CompletableFuture
- JVM
- garbage collection
- class loading

## Spring Boot

- Dependency Injection
- Bean lifecycle
- ApplicationContext
- auto-configuration
- profiles
- configuration
- actuator
- REST
- validation
- @Transactional
- JPA
- Hibernate
- lazy loading
- N+1
- caching
- security

## Microservices

- API Gateway
- service discovery
- load balancing
- circuit breaker
- retries
- timeouts
- distributed transactions
- saga
- idempotency
- messaging
- observability
- tracing
- configuration

## AWS

- EC2
- ECS
- EKS
- Lambda
- S3
- RDS
- DynamoDB
- ElastiCache
- CloudFront
- Route 53
- IAM
- VPC
- CloudWatch
- SQS
- SNS

## MySQL

- joins
- indexes
- composite indexes
- transactions
- isolation levels
- deadlocks
- query optimization
- execution plans
- normalization
- partitioning
- locking
- pagination

---

# 54. No Generic "What Is X?" Dominance

It is acceptable to include some direct conceptual questions.

But the assessment should NOT mostly be:

    What is ArrayList?
    What is HashMap?
    What is Spring Boot?
    What is REST?

Prefer:

    Why?
    What happens when?
    What would you choose?
    What breaks?
    How would you debug?
    Which option is better and why?
    What is the runtime consequence?
    What changes under scale?

---

# 55. Product North Star

The platform should eventually answer this question:

> "I studied this concept. Do I actually know it?"

Not:

> "How many interview questions can I answer?"

That distinction should guide every design decision.

---

# 56. Future Features — Do Not Build Yet

Keep the architecture extensible for:

- personalized weak-area quizzes
- learning roadmap
- interview simulation
- multi-topic assessments
- job-description-driven assessment
- role-specific assessment
- company-specific assessment
- voice interview mode
- coding execution sandbox
- persistent learner profiles
- progress history
- spaced repetition
- difficulty adaptation
- concept dependency graph
- question quality feedback
- curated expert question bank
- AI-generated explanations
- follow-up interviewer questions

But do NOT clutter V1 with these.

---

# 57. Long-Term Concept Graph

A major future feature is to represent knowledge as a graph.

Example:

```text
ArrayList
   |
   +--> Collection
   |
   +--> List
   |
   +--> dynamic array
   |
   +--> capacity
   |
   +--> iteration
   |       |
   |       +--> Iterator
   |       +--> fail-fast behavior
   |
   +--> performance
   |
   +--> Streams
   |
   +--> concurrency
```

Then the system can identify:

    "You understand ArrayList basics but your understanding of capacity and iterator behavior is weak."

This is much more powerful than a score.

---

# 58. Development Priorities

Priority order:

## P0 — Must Have

- topic input
- AI assessment generation
- structured JSON
- mixed question renderer
- MCQ interaction
- text answer
- coding answer
- answer submission
- AI evaluation
- result screen
- provider/model configuration
- error handling

## P1 — Important

- better animations
- question navigation
- review before submit
- regenerate assessment
- weak-area summary
- local persistence

## P2 — Later

- adaptive assessments
- concept graph
- code execution
- user accounts
- backend
- database
- analytics
- subscriptions

---

# 59. Definition of Done for V1

V1 is successful when this exact flow works smoothly:

1. Open website
2. Enter "ArrayList"
3. Select difficulty
4. Select number of questions
5. Choose AI provider/model
6. Generate assessment
7. Receive valid structured questions
8. See different question types rendered correctly
9. Answer every question
10. Submit
11. AI evaluates answers
12. See per-question feedback
13. See overall understanding summary
14. Generate another mock
15. New mock is meaningfully different

No login required.

No database required.

No complex backend required for the local/developer version.

---

# 60. Coding Agent Instruction

When implementing this project:

- First understand this document completely.
- Do not overbuild.
- Do not add unrelated features.
- Keep UI and AI service layers separated.
- Treat AI outputs as untrusted external data.
- Validate all AI responses.
- Make question rendering schema-driven.
- Keep provider integration modular.
- Make the design polished before adding unnecessary features.
- Prefer small reusable components.
- Use TypeScript types everywhere.
- Avoid `any` unless absolutely necessary.
- Handle loading, empty, error, and success states.
- Make the application responsive.
- Ensure keyboard accessibility.
- Keep visual hierarchy strong.
- Do not expose API secrets in production.
- Use `.env.example`.
- Never commit actual credentials.
- Add clear comments where AI/provider behavior is non-obvious.
- Keep prompts versioned in source code.
- Do not silently change the product vision.

---

# 61. The Core User Experience in One Sentence

> "Type what you just studied, and the platform becomes an interviewer that tests whether you can actually use it."

---

# 62. Final Product Personality

The product should feel like:

    "A smart technical interviewer sitting beside me."

Not:

    "A giant MCQ database."

Not:

    "An AI chatbot."

Not:

    "A course website."

The learner should feel challenged but not overwhelmed.

The questions should make them think:

    "Oh... I knew this, but I never thought about it this way."

That is the desired emotional and educational outcome.

---

# 63. Final Guidance to the AI Coding Agent

Build the first version around one golden path:

    Topic
      ↓
    Understand topic
      ↓
    Build assessment
      ↓
    Render questions beautifully
      ↓
    Collect answers
      ↓
    Evaluate answers
      ↓
    Explain gaps
      ↓
    Try again

Keep the architecture ready for future intelligence, but keep V1 visually simple and operationally focused.

The quality of question generation and evaluation is more important than the number of screens.

The UI must make different question types feel native and polished.

The system must make the learner feel that the assessment was created specifically for the topic they entered.

The platform's central promise is:

> Don't just study the concept. Prove that you understand it.

# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. The context files define what to build, how to build it, and the current state of progress. Always implement against these specs. Do not infer or invent behavior from scratch.

Context files, and what each one answers:

| File                  | Answers                                                    |
| --------------------- | ---------------------------------------------------------- |
| `project-overview.md` | What are we building, and what is in or out of scope?      |
| `architecture.md`     | How is it structured: stack, data model, access, invariants? |
| `code_standards.md`   | How must the code be written and organized?                |
| `ui-context.md`       | How must it look: tokens, components, layouts?             |
| `ai-workflow-rules.md`| How should the AI work (this file)?                        |
| `progress-tracker.md` | Where are we now, and what is next?                        |

### At the start of every session

1. Read all six context files in full before writing any code.
2. Open `progress-tracker.md` and find the current goal and the first unfinished item under Next Up.
3. Tell the user in two or three sentences what you are about to build and which files you will touch.
4. Then start. Do not begin a different unit than the one in the tracker unless the user asks.

### How to work

- Follow the stack in `architecture.md` exactly. Do not swap or add technologies on your own.
- Follow `code_standards.md` for every file you write or change.
- Use only the design tokens and patterns in `ui-context.md`.
- Keep explanations short. After each unit, report what changed, how to verify it, and what is next.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.
- A "unit" is one item from Next Up in `progress-tracker.md` (for example, "Product listing" or "Cart"). Do not start the next unit in the same step.
- Do not refactor or restyle code that is outside the current unit.

## When to Split Work

Split an implementation step if it combines:

- UI changes and database or access-rule changes
- Frontend changes and storage or image-upload changes
- Multiple unrelated pages or services
- Authentication or role changes and ordinary feature work
- Behavior not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad. Split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing.
- Ask the user when the answer changes the data model, access rules, or user flow. Make the simplest choice yourself only for small details, and record it.
- Features listed as Out of Scope in `project-overview.md` must not be built, even if they seem like a good idea. Suggest them in the tracker instead.

## Data, Security, and Safety Rules

- Never read, print, or commit the contents of `.env` or any secret key.
- Never put an admin or service key in frontend code.
- Do not run destructive database actions (dropping tables, deleting data, changing access rules) without telling the user first and getting a clear yes.
- Every change to tables, columns, access rules, or storage buckets must be written into `architecture.md` in the same step.
- Never weaken an access rule just to make a feature work. Fix the feature instead.

## Protected Files

Do not modify the following unless explicitly instructed:

- `.env` and any other file containing real secrets.
- `package-lock.json` by hand (change it only through package manager commands).
- `node_modules/` and build output (`dist/`).
- Third-party library internals.
- The design token values in `src/styles/tokens.css`, except when `ui-context.md` is updated first.
- Context files other than `progress-tracker.md`, except to keep them in sync as described below.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture, boundaries, or data model: `architecture.md`
- Storage model or access rule decisions: `architecture.md`
- Code conventions or standards: `code_standards.md`
- Colors, fonts, components, or layout patterns: `ui-context.md`
- Feature scope: `project-overview.md`
- Completed work, next steps, decisions, and open questions: `progress-tracker.md`

When code and a context file disagree, stop and tell the user which one is correct before continuing.

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant defined in `architecture.md` was violated.
3. `progress-tracker.md` reflects the completed work.
4. `npm run build` passes with no errors.
5. The unit was checked in the browser at mobile and desktop widths, including loading, empty, and error states.
6. No debug logs, unused files, or hardcoded secrets remain.
7. Changes are committed to Git with a clear message.

## Deployment

- Deploy only after all units in `progress-tracker.md` are complete and tested against the Success Criteria in `project-overview.md`, or when the user asks for an earlier preview.
- Before deploying, confirm that `npm run build` passes, environment variables are set on the host, and routes are rewritten to `index.html`.
- After deploying, check the live site: register, log in, add to cart, place an order, and open the admin dashboard.
- Record the live URL and any deployment notes in `progress-tracker.md`.

## At the End of Every Session

1. Update `progress-tracker.md`: move finished items to Completed, set the new Current Goal, refresh Next Up, and add any open questions or decisions.
2. Write Session Notes with everything the next session needs to resume (what was done, what is half-finished, anything surprising).
3. Summarize the work to the user in a few sentences.

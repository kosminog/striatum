---
name: writing-technical
description: Style and structure rules for technical documents such as READMEs, API references, runbooks, architecture notes, design docs, how-to guides, changelogs, code comments and error messages. Use this skill whenever the user asks to write, rewrite, expand, tighten or review documentation, explain a system or a decision in writing, produce onboarding material, or draft anything an engineer or operator will read in order to get a task done. Trigger it even when the user only says "document this" or "write up how it works". Do not use it for marketing pages, blog posts aimed at buyers, or emails to clients, which have their own skills.
---

# Technical writing

An engineer reading documentation is trying to do something else. Every sentence that
does not move them toward that task is a cost, and every ambiguity becomes a support
ticket or an outage. This skill optimises for the reader who is mid-task, slightly
impatient, and will skim before they read. It also keeps the document honest about
what it does and does not know.

## Before you start

1. Read the brand profile for spelling convention, product and feature names with
   exact casing, and any banned terms. Tone rules in the profile apply lightly here;
   clarity wins over voice.
2. Establish the **reader and their task**: who, what they already know, what they
   are trying to do in the next ten minutes. Write it at the top of your draft, then
   delete it before delivering if it is obvious from the title.
3. Identify the **document type** and open the matching section of
   `references/document-types.md`. A runbook and an architecture note share style
   and nothing else.
4. Verify against the source. Read the code, run the command, check the config. Do
   not document from memory or from another doc.

## Principles

### 1. Lead with the task, not the concept
Put the thing the reader came for at the top: the command, the endpoint, the answer.
Background goes after, or in a linked page. Readers who need the concept will scroll;
readers who need the command will not.

### 2. One idea per sentence, one task per section
Long sentences hide the verb. Short sentences make the step visible. Sections map to
things a reader would want to jump to, and their headings are noun phrases or
imperatives that would make sense in a table of contents alone.

### 3. Be exact or be silent
"Usually", "should", "may take a while" are guesses in disguise. State the number,
the condition, or the fact that it varies and why. If you do not know, write
`[TODO: verify]` rather than a plausible sentence. A wrong doc is worse than a gap.

### 4. Show, then tell
A working example with real values, then the explanation. Every parameter that
appears in prose also appears in an example. Every code block runs as written; copy
and paste is the primary interface.

### 5. Name things once and the same way
Use the exact identifier from the code or the UI, with its casing, every time. No
synonyms for variety. If the code and the UI disagree, say so once.

### 6. Write for the search box
Readers arrive by search and land mid-page. Each section stands alone: restate the
subject, do not rely on "as above". Use the words the reader would type.

## Process

1. Write the reader-and-task line. Pick the document type.
2. Outline headings only. Check the outline reads as a plan of the reader's task.
3. Write examples first, prose second.
4. Run every command and request. Paste real output, trimmed and marked as trimmed.
5. Cut: adjectives, "simply", "just", "easily", sentences that restate the heading,
   any paragraph before the first code block in a how-to.
6. Run the checklist. Have `copy-editor` review if the doc is customer-facing.

## Checklist before delivering

- [ ] First screen contains the primary command, call or answer
- [ ] Every heading is a noun phrase or an imperative and makes sense alone
- [ ] No sentence over 30 words
- [ ] Every code block was executed and its output verified
- [ ] Every identifier matches the source exactly, including casing
- [ ] No "simply", "just", "easily", "obviously", "should work"
- [ ] Unknowns marked `[TODO: verify]`, not papered over
- [ ] Prerequisites and versions stated where they matter
- [ ] Links point to specific sections, not home pages

## Anti-patterns

- **The history lesson.** Three paragraphs of why the system exists before the
  install command.
- **The tutorial that is really a reference.** Every option explained inline in a
  "getting started" page. Split them.
- **Screenshots of text.** Unsearchable, untranslatable, outdated next release.
- **The passive incident.** "The service was restarted." By whom, when, how?
- **Marketing leakage.** "Blazing fast", "seamless", "powerful" in an API reference.

## Example

**Before**

> Our platform makes it simple and easy to get started. The SDK is designed to be
> flexible and can be installed in a variety of ways. Once you have it set up you
> should be able to make requests without any trouble.

**After**

> Install the SDK, then send a request.
>
> ```bash
> npm install @acme/sdk
> ```
>
> ```ts
> import { Client } from "@acme/sdk";
> const client = new Client({ apiKey: process.env.ACME_API_KEY });
> const res = await client.jobs.create({ name: "nightly-export" });
> console.log(res.id); // job_01HZX...
> ```
>
> Requires Node 20 or later. For Python and Go see [Other languages](#other-languages).

What changed: the task moved to the top, the adjectives went, the example runs, and
the one real constraint (Node 20) became visible.

## Further reading

- `references/document-types.md` — structure for README, API reference, runbook,
  architecture note, how-to, changelog, error message
- `examples/` — before/after rewrites

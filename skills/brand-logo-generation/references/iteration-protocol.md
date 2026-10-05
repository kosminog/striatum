# Iteration protocol

## Round structure

Every round, in order:

1. **Hypothesis.** One sentence: what this round varies and what you expect to learn.
2. **Prompt.** Full prompt or prompt diff, model, settings, seed if any.
3. **Generate.** 8 to 12 images. Fewer hides variance; more wastes scoring time.
4. **Contact sheet.** Run `scripts/contact_sheet.py` on the round folder with the
   competitive set folder. Look at the 16 and 32 px rows first.
5. **Cull.** Drop anything unreadable at 32 px, anything with text, anything in
   colour, anything resembling a known mark. Do this before scoring; it is fast.
6. **Score.** Ten-row checklist from `references/critique-checklist.md` in the
   sibling `brand-logo-design` skill, for the survivors (usually 2 to 4). Record in
   the brief's iteration log.
7. **Read-out.** One paragraph: what won, which rows it lost on, what the next round
   changes and why.
8. **Decision.** Continue (with the diff), branch (two directions worth pursuing),
   or stop.

## Round order

| Round | Hold | Vary |
|-------|------|------|
| 1 | form (solid geometric), composition (centred) | the idea: up to three devices |
| 2 | idea | form family |
| 3 | idea, form | composition |
| 4 | idea, form, composition | weight and interior detail |
| 5 (optional) | everything | wordmark relationship, by hand not by model |

Skip a round if the winner of the previous one already scores 2 on the relevant rows.

## Scoring notes

- Score in mono at 32 px for rows 2, 3 and 5. Score at 256 px for rows 4 and 10.
- Two people scoring independently and comparing beats one person scoring twice.
  When working alone, run the `logo-critic` agent as the second scorer.
- A candidate that scores 2 on distinctiveness but 0 on accident audit is dead.
  Do not average your way past a zero on rows 2, 3 or 6.

## Stopping rules

Stop iterating when any of these holds:

- Top candidate scores 17 or more of 20 and has no zero.
- Top score has not improved across two consecutive rounds. More rounds will not
  fix it; the idea or the form family is wrong. Go back to round 1 or 2.
- Five rounds completed. Time to redraw by hand; the remaining gap is craft, not
  prompting.

## Branching

If two candidates in a round represent different ideas and both score 14 or more,
branch: run the next round for each, in separate folders, and compare the winners
side by side at round 3. Do not carry more than two branches.

## Read-out template

```
Round N — <variable varied>
Winner: <file>, <score>/20 (lost on rows X, Y)
Runner-up: <file>, <score>/20
Why winner: <one sentence, cite rows>
Next: <prompt diff>, because <lowest rows>
```

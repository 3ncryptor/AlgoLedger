# Personal Skills

Space reserved for your own Claude Code skills, separate from the installed `emil-*` design/animation skills (which live in `.agents/skills/` and are symlinked in here — do not edit them directly; re-run `npx skills@latest add emilkowalski/skills` to update).

## Adding a skill

Create a subfolder here with a `SKILL.md`:

```text
.claude/skills/personal/<your-skill-name>/SKILL.md
```

`SKILL.md` needs frontmatter + instructions:

```markdown
---
name: your-skill-name
description: One line describing what this skill does and when it should trigger.
---

# Your Skill Name

Instructions the model should follow when this skill is invoked...
```

Reference it with `Skill(your-skill-name)` or by typing `/your-skill-name` once loaded. Keep each skill focused on one capability — many small skills compose better than one large one.

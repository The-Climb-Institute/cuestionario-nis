# Task Planning & Management

**Overview**: This directory contains all task planning documents organized by implementation status.

## Quick Navigation

- **Overview & Context**: `00-meeting-notes-2026-02-26.md` | `01-paula-feedback-todos.md`
- **Ready to Start**: `ready/` (6 tasks)
- **Blocked**: `blocked/` (4 tasks waiting for dependencies)
- **In Progress**: `in-progress/` (currently being worked on)
- **Completed**: `../completed/` (finished tasks)

## Current Status

| Status | Count | Details |
|--------|-------|---------|
| ✓ Ready | 6 | Form instructions, Company ID, Logo, Colors, Benchmarks visibility, OpenFormStack |
| ⏳ Blocked | 4 | Conditional questions, Legal, Trademark, User testing |
| 🔄 In Progress | 0 | — |
| ✅ Completed | 0 | — |

## How to Use

### 1. Check What's Ready
```bash
ls -1 ready/
```

### 2. Start a Task
```bash
# Review task details
cat ready/04-task-3-company-identification.md

# When ready to work, move to in-progress
git mv ready/04-task-3-company-identification.md in-progress/
git commit -m "chore(task): [task-3] move to in-progress"
```

### 3. Complete a Task
```bash
# After implementation and testing, move to completed
git mv in-progress/04-task-3-company-identification.md ../completed/
git commit -m "chore(task): [task-3] completed

Implemented company identification form section with:
- Required fields: name, size, sector
- Optional fields: tax ID, employees, revenue
- Full data persistence and validation
- Responsive design

Tests: 8/8 passing
Commits: abc1234, def5678"
```

### 4. Unblock a Task
When external dependencies are met (e.g., Paula provides questionnaire):
```bash
git mv blocked/02-task-1-form-instructions.md ready/
git commit -m "chore(task): [task-1] unblocked - questionnaire received"
```

## Questionnaire sources (reference)

- **Proposed questionnaire (wording, instructions, conditional structure)**:  
  `input-assets/251217_CLIMB_cuestionario_2.0.docx`  
  Use for preamble text, applicability/skip logic, and question wording.
- **Original questionnaire (canonical field set)**:  
  **projects/data-analysis** — `data/input/surveys/` (XLSX survey files) and `config/schemas/` (e.g. `climb_institute_combined.json`).  
  These define the fields/variables the form and pipeline must align with.

Tasks 1 and 2 were previously blocked on “Paula’s original DOCX”; the sources above are now documented and available, so those tasks can be moved to **ready** when prioritised.

## Task Details

Each task file contains:
- **Status**: Planning | Ready | Blocked | In Progress | Completed
- **Priority**: CRITICAL | HIGH | MEDIUM | LOW
- **Owner**: Who is working on it
- **Description**: What needs to be done
- **Requirements**: Detailed requirements
- **Dependencies**: What must be done first
- **Acceptance Criteria**: How to know when it's done
- **Technical Notes**: Implementation guidance
- **Status History**: Progress tracking

## Workflow Rules

See `~/.claude/rules/task-management.md` for complete workflow documentation.

### Key Rules:
1. Planning → Ready (dependencies met) or Blocked (unmet dependencies)
2. Ready → In Progress (when work begins)
3. In Progress → Completed (when done and tested)
4. Blocked → Ready (when dependencies are met)

### Naming Convention:
`0X-task-N-<kebab-case-name>.md`
- `00-` Overview/context files
- `01-10` Individual task files (Task 1-10)

## Next Steps

1. **Review READY tasks** and prioritize which to implement first
2. **Unblock Tasks 1 & 2** (optional): They have sources now — proposed questionnaire `input-assets/251217_CLIMB_cuestionario_2.0.docx` and data-analysis fields. Move from `blocked/` to `ready/` when you want to implement.
3. **Wait for Paula's input** to unblock:
   - Legal text/disclaimers (for task 6)
   - Trademark clarification (for task 7)
4. **Start implementation** on highest-priority READY tasks
5. **Move completed tasks** to `../completed/` as you finish them

## Master Reference

For full context and rationale, see:
- `01-paula-feedback-todos.md` - Original feedback and master plan
- `00-meeting-notes-2026-02-26.md` - Project context and priorities

---

**Last Updated**: 2026-02-27
**Total Tasks**: 10 (6 ready, 4 blocked)
**Planning Status**: ✓ Complete
**Implementation Status**: ⏳ Ready to begin

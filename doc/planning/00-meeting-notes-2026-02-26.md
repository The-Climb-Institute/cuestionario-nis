# Meeting Notes - 2026-02-26

**Date**: February 26, 2026
**Participants**: Developer, Project Manager (implicit - Paula's feedback)
**Status**: Planning Phase

---

## Agenda Items

### 1. Paula's User Feedback (Via Chat)
- Form testing revealed UX issues
- Users can't complete when missing exact data
- Need for form instructions and conditional logic
- See detailed plan: `01-paula-feedback-todos.md`

### 2. Backend Storage Integration
**Priority**: CRITICAL (Planning Priority)
**Type**: New Work Item

#### Requirement:
Connect form to OpenFormStack platform for data persistence and backend storage.

#### Endpoint:
- **URL**: `https://openformstack.com/f/cmm3yej4l00004nan9zcn7laj`
- **Method**: POST (form submission)
- **Purpose**: Persist all form submissions with company data and scoring results

#### What to Send:
- Company identification data
- All scoring indicators and responses
- Calculated scores (ambiental, social, gobernanza, total)
- Metadata (timestamp, user agent, etc.)

#### What to Expect:
- Submission confirmation/ID
- Success/error response
- Ability to retrieve stored data

#### Why This Matters:
- Current form has no persistence (data lost on page refresh)
- Need to store all submissions for later analysis
- OpenFormStack provides cloud storage without building custom backend

#### Implementation Strategy:
- Parallel path (doesn't block form UX improvements)
- Can be done while working on Paula's tasks
- Requires understanding OpenFormStack API format
- May need to create form mapping documentation

---

## Priority Summary

| Priority | Item | Owner | Timeline |
|----------|------|-------|----------|
| 🔴 CRITICAL | Conditional form logic | TBD | Phase 1 |
| 🔴 CRITICAL | Backend integration (OpenFormStack) | TBD | Phase 1b (Parallel) |
| 🟠 HIGH | Form instructions | TBD | Phase 1 |
| 🟠 HIGH | Company identification section | TBD | Phase 1 |
| 🟠 HIGH | User testing (Paula) | Paula | Phase 1 |
| 🟡 MEDIUM | Legal disclaimers | TBD | Phase 2 (await legal text) |
| 🟡 MEDIUM | Logo + branding | TBD | Phase 2 |

---

## Today's Action Items

- [ ] **URGENT**: Discuss with Paula (she's traveling)
  - Review original questionnaire format
  - Get legal text
  - Confirm priorities and timeline
  - Discuss OpenFormStack integration

- [ ] Assign owners to critical tasks
- [ ] Gather original DOCX questionnaire
- [ ] Get logo asset file
- [ ] Review OpenFormStack API documentation

---

## Next Steps

1. **Today**: Call/meet with Paula to align on priorities
2. **This week**: Start Phase 1 work (form instructions & conditional logic)
3. **Parallel**: Investigate OpenFormStack API format and integration approach
4. **Testing**: Paula to test updated form with real user scenarios

---

## Technical Notes

### OpenFormStack Integration
- Research required: What fields does OpenFormStack expect?
- May need custom field mapping
- Consider offline support (queue submissions if no internet)
- Plan for error handling and retry logic

### Form Improvements
- Conditional rendering will require significant js/form.js refactoring
- Scoring logic may need updates for "Not Applicable" indicators
- Test coverage should increase with conditional logic complexity

---

## Related Documents

- **Detailed Plan**: `doc/planning/01-paula-feedback-todos.md` (Paula's feedback)
- **Quick Checklist**: `TODO.md` (root) - simple task list
- **Project Reference**: `llm.txt`
- **Original Questionnaire**: (Need from Paula)

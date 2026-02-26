# TODO - Quick Task List

**Last Updated**: 2026-02-26
**Status**: Planning Phase
**See Also**: [Detailed Plan](doc/planning/01-paula-feedback-todos.md) | [Meeting Notes](doc/planning/00-meeting-notes-2026-02-26.md)

---

## PHASE 1 - CRITICAL (Form UX & Functionality)

- [ ] **Task 1**: Add form instructions from original questionnaire
  - Display at top of form exactly as written in DOCX
  - Include guidance for "I don't know" scenarios
  - *Depends on*: Review original questionnaire

- [ ] **Task 2**: Implement conditional/dependent questions
  - Ask "Does this apply?" first, then specific data
  - Skip irrelevant sections based on answers
  - Handle "Not Applicable" in scoring
  - *Depends on*: Review original questionnaire structure

- [ ] **Task 3**: Add company identification section
  - Name, size, industry at form start
  - Required: company name, size, sector
  - Optional: tax ID, employees, revenue
  - *Depends on*: Clarify required fields with Paula

- [ ] **Task 10**: User testing with real data
  - Paula tests with incomplete information
  - Identify remaining UX bottlenecks
  - Measure form completion rate
  - *Depends on*: Tasks 1, 2, 3 complete

---

## PHASE 1b - PARALLEL (Backend Integration)

- [ ] **Task 9**: Integrate OpenFormStack backend
  - Connect form to endpoint: `https://openformstack.com/f/cmm3yej4l00004nan9zcn7laj`
  - POST submission with all form data + scores
  - Handle confirmation/error responses
  - *Depends on*: None (parallel work)
  - *Blocks*: Submission functionality for users

---

## PHASE 2 - IMPORTANT (Polish & Legal)

- [ ] **Task 6**: Add legal disclaimers and terms
  - Display prominently (top or modal)
  - User must acknowledge before submitting
  - *Depends on*: Legal text from Paula
  - **BLOCKING**: Waiting for legal content

- [ ] **Task 4**: Add The Climb Institute logo
  - Top/header placement
  - Test on desktop & mobile
  - *Depends on*: Logo asset file

- [ ] **Task 5**: Change colors from gold to white
  - Remove all gold (#FFD700 etc.)
  - Apply white/neutral scheme
  - Professional appearance
  - *Depends on*: None

---

## PHASE 3 - NICE TO HAVE

- [ ] **Task 7**: Add registered trademark information
  - Clarify which trademark (Institute, NIS, etc.)
  - Display with ™ or ® symbol
  - *Depends on*: Clarification from Paula

- [ ] **Task 8**: Move benchmark descriptions to results
  - Hide during form filling
  - Show in results/analysis page
  - Improves answer authenticity
  - *Depends on*: Results page implementation

---

## BLOCKERS & DEPENDENCIES

### Waiting On:
- [ ] Paula: Original DOCX questionnaire structure
- [ ] Paula: Legal text/disclaimers
- [ ] Paula: Logo asset file
- [ ] Paula: Confirmation on priorities & timeline

### Research Needed:
- [ ] OpenFormStack API field requirements/format
- [ ] Original questionnaire conditional patterns
- [ ] Company identification field requirements

---

## SUMMARY

| Phase | Tasks | Status | Owner |
|-------|-------|--------|-------|
| 1 | 1, 2, 3, 10 | Planning | TBD |
| 1b | 9 | Planning | TBD |
| 2 | 4, 5, 6 | Planning | TBD |
| 3 | 7, 8 | Planning | TBD |

**Total**: 10 Tasks
**Ready to Start**: 8 tasks (2 blocked waiting for Paula)
**Timeline**: See meeting notes for phase breakdown

---

## Quick Links

- **Detailed descriptions**: [doc/planning/01-paula-feedback-todos.md](doc/planning/01-paula-feedback-todos.md)
- **Meeting notes**: [doc/planning/00-meeting-notes-2026-02-26.md](doc/planning/00-meeting-notes-2026-02-26.md)
- **Project reference**: [llm.txt](llm.txt)
- **Form code**: [js/form.js](js/form.js)
- **Scoring code**: [js/scoring.js](js/scoring.js)

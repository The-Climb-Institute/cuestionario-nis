# Task 2: Implement Conditional Questions

**Status**: Blocked
**Priority**: CRITICAL
**Owner**: TBD
**Created**: 2026-02-27
**Completed**: TBD

## Description
Implement smart conditional logic so users only answer questions relevant to their company. First ask if activity applies, then ask for specific data only if YES.

Example flow:
- "Does your company have direct emissions?" → If No, skip emissions questions
- "Does your company discharge water?" → If No, skip water treatment questions

## Requirements
- First ask about applicability ("Does your company have X?")
- Only ask for specific data if applicable
- Skip to next section if activity doesn't apply
- Mark "Not Applicable" indicators for scoring
- Reduce form length significantly for non-applicable companies
- No "Not Applicable" answers in numeric fields
- Scoring handles N/A indicators correctly

## Dependencies
- [x] **Proposed questionnaire (conditional patterns)**: `input-assets/251217_CLIMB_cuestionario_2.0.docx` — use for applicability/skip logic and wording.
- [x] **Original questionnaire (field set)**: `projects/data-analysis` — `data/input/surveys/` and `config/schemas/` define canonical fields; conditionals must align with these.
- [ ] Task 3 partially (both affect form structure; can be done in parallel)

## Acceptance Criteria
- [ ] Conditional questions reduce form length for non-applicable companies
- [ ] No forced answers when activity doesn't apply
- [ ] Scoring correctly handles N/A status
- [ ] User testing shows improved completion rate
- [ ] Data quality remains high (no guesses)
- [ ] Form tested with company that has limited applicability

## Technical Notes
- Modify js/form.js generateFormFields()
- Add applicabilityQuestion property to fields
- Use conditional rendering based on answers
- Update js/scoring.js to handle "Not Applicable" status
- May need new benchmark status: "not_applicable"
- Existing tests should still pass

## Implementation Approach
1. Review proposed questionnaire (`input-assets/251217_CLIMB_cuestionario_2.0.docx`) for conditional patterns
2. Cross-reference with data-analysis schemas for field names; map applicability questions for each section
3. Modify form field structure
4. Implement conditional rendering logic
5. Update scoring for N/A handling
6. Write new tests for conditional flows
7. User acceptance testing

## Status History
- 2026-02-27: Created planning file, marked as Blocked (waiting for questionnaire patterns)
- 2026-02-27: Clarified sources — proposed questionnaire = `input-assets/251217_CLIMB_cuestionario_2.0.docx`; original fields = data-analysis. Dependency satisfied; can move to ready when prioritised (Task 3 may be done in parallel).

## Blockers
- None for questionnaire source. **Proposed questionnaire**: `input-assets/251217_CLIMB_cuestionario_2.0.docx`. **Original fields**: `projects/data-analysis` input surveys and config/schemas. Optional: confirm with Paula that 2.0 is the source for conditionals.

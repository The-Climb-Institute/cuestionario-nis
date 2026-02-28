# Task 8: Move Benchmark Descriptions to Results Page

**Status**: Ready
**Priority**: MEDIUM
**Owner**: TBD
**Created**: 2026-02-27
**Completed**: TBD

## Description
Hide benchmark information during form filling and show it only in the results/analysis page. This prevents benchmarks from biasing user responses.

## Requirements
- Remove benchmark indicators from form fields
- Remove benchmark help text from questions
- Show full benchmark details in results page
- Maintain all citations and sources
- Preserve APA bibliography for analysis

## Dependencies
- None (can work independently)

## Acceptance Criteria
- [ ] No benchmark info visible during form filling
- [ ] Benchmark details visible in results/analysis
- [ ] All citations and sources preserved
- [ ] User can see how answers were scored against benchmarks
- [ ] Professional presentation of benchmark info
- [ ] Tested with full questionnaire

## Technical Notes
- Location: js/form.js renderField() - remove benchmark indicator
- Create/update results page to show benchmarks
- Move benchmark references from form to results
- Keep all APA citations in results page
- Update help text to remove benchmark references

## Implementation Approach
1. Audit form for benchmark references
2. Remove benchmark icons/help text from form fields
3. Create/update results page template
4. Add benchmark details display in results
5. Test complete flow (form → results)
6. User feedback on results presentation

## Status History
- 2026-02-27: Created planning file, marked as Ready

## Blockers
- None

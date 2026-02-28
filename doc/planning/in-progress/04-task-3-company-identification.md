# Task 3: Add Company Identification Section

**Status**: In Progress
**Priority**: HIGH
**Owner**: Claude (AI Assistant)
**Created**: 2026-02-27
**Completed**: TBD

## Description
Create a company identification section at the START of the form to capture company context information before any scoring questions.

## Requirements
**Required Fields**:
- Company legal name
- Country / Region
- Industry sector (dropdown)
- Company size (micro, small, medium, large, enterprise)

**Optional Fields**:
- Company registration number / Tax ID
- Number of employees
- Annual revenue
- Year founded

## Dependencies
- None (independent feature)

## Acceptance Criteria
- [ ] Form captures company name, size, sector (required)
- [ ] Section displays before scoring questions
- [ ] Optional fields don't block form completion
- [ ] Data persists with form submission
- [ ] Can be displayed in results/reports
- [ ] Responsive design on desktop and mobile
- [ ] Field validation (e.g., company name not empty)

## Technical Notes
- Location: First section in js/form.js formFields
- Add new "company" section to formFields object
- Update form renderer to handle company section
- Add to form values extraction (getFormValues)
- Include in form submission to OpenFormStack
- Display in results summary

## Implementation Approach
1. Design company section fields
2. Create form fields structure
3. Update NISFormRenderer for new section
4. Add validation
5. Update submission data mapping
6. Test on desktop and mobile

## Status History
- 2026-02-27: Created planning file, marked as Ready
- 2026-02-27: Moved to in-progress, starting implementation

## Blockers
- None identified

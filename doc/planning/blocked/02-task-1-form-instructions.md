# Task 1: Add Form Instructions from Questionnaire

**Status**: Blocked
**Priority**: CRITICAL
**Owner**: TBD
**Created**: 2026-02-27
**Completed**: TBD

## Description
Add instructions/preamble from the original DOCX questionnaire to the top of the form. These instructions help users understand what the form is for, how to fill it out, and what to do if they don't have exact values.

## Requirements
- Instructions match original DOCX questionnaire exactly (word-for-word)
- Display at very top of form, before any form fields
- Provide clear guidance on handling "I don't know" scenarios
- Explain whether estimation is acceptable or if user should skip
- Professional appearance matching form design
- Responsive on desktop and mobile

## Dependencies
- [ ] Original DOCX questionnaire (from Paula)

## Acceptance Criteria
- [ ] Instructions text copied exactly from questionnaire
- [ ] Display tested on desktop and mobile
- [ ] User can understand form purpose from instructions
- [ ] Clear guidance on incomplete data handling
- [ ] Tested with user who doesn't have complete data

## Technical Notes
- Location: Top of form in html index file or js/form.js
- Component: Can be static HTML or rendered by NISFormRenderer
- Style: Should match existing form styling
- May need to handle multi-language (if applicable)

## Implementation Approach
1. Get original questionnaire from Paula
2. Copy instructions text verbatim
3. Create instructions component in form
4. Position before all form fields
5. Test responsive design
6. User acceptance testing

## Status History
- 2026-02-27: Created planning file, marked as Blocked (waiting for questionnaire)

## Blockers
- **Paula's original DOCX questionnaire** - Need to review for exact instruction text and conditional logic patterns

# Task 1: Add Form Instructions from Questionnaire

**Status**: Ready
**Priority**: CRITICAL
**Owner**: TBD
**Created**: 2026-02-27
**Completed**: TBD

## Description
Add instructions/preamble from the original DOCX questionnaire to the top of the form. These instructions help users understand what the form is for, how to fill it out, and what to do if they don't have exact values.

## Requirements
- Instructions match proposed questionnaire (`input-assets/251217_CLIMB_cuestionario_2.0.docx`) exactly, or as agreed (word-for-word preferred)
- Display at very top of form, before any form fields
- Provide clear guidance on handling "I don't know" scenarios
- Explain whether estimation is acceptable or if user should skip
- Professional appearance matching form design
- Responsive on desktop and mobile

## Dependencies
- [x] **Proposed questionnaire (instructions text)**: `input-assets/251217_CLIMB_cuestionario_2.0.docx` — use for wording/preamble.
- [x] **Original questionnaire (field set)**: projects/data-analysis — `data/input/surveys/` XLSX and `config/schemas/` (e.g. `climb_institute_combined.json`) define the canonical fields; instructions in the form should align with this.

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
1. Extract instructions/preamble from proposed questionnaire (`input-assets/251217_CLIMB_cuestionario_2.0.docx`)
2. Copy instructions text verbatim (or adapt per product decision)
3. Create instructions component in form
4. Position before all form fields
5. Test responsive design
6. User acceptance testing

## Status History
- 2026-02-27: Created planning file, marked as Blocked (waiting for questionnaire)
- 2026-02-27: Clarified sources — proposed questionnaire = `input-assets/251217_CLIMB_cuestionario_2.0.docx`; original fields = data-analysis input datasets/schemas. Dependency satisfied; can move to ready when prioritised.
- 2026-02-27: Moved to ready/ (sources available).

## Blockers
- None — sources available. **Proposed questionnaire**: `input-assets/251217_CLIMB_cuestionario_2.0.docx`. **Original questionnaire (fields)**: `projects/data-analysis` input surveys and config/schemas.

# Task 6: Add Legal Disclaimers and Terms

**Status**: Blocked
**Priority**: HIGH
**Owner**: TBD
**Created**: 2026-02-27
**Completed**: TBD

## Description
Add legal information/disclaimers to the form. User must acknowledge before submitting.

## Requirements
- Legal text exactly as provided by Paula
- Display prominently (top of form or modal)
- User must acknowledge/accept before submission
- Clear presentation, easy to read
- Professional legal tone
- Covers all compliance requirements

## Dependencies
- [ ] Legal text from Paula

## Acceptance Criteria
- [ ] Legal text displayed prominently
- [ ] User must check "I accept" before submitting
- [ ] Submission blocked if not accepted
- [ ] All legal requirements met
- [ ] Legal review approved (if required)
- [ ] Tested with legal team

## Technical Notes
- Location: Top of form as collapsible section, or modal
- Add required checkbox before submit button
- Validate checkbox is checked before POST to OpenFormStack
- May need separate page/route for legal terms

## Implementation Approach
1. Get legal text from Paula
2. Determine presentation method (modal/section)
3. Create legal acceptance UI component
4. Add validation to form submission
5. Test acceptance flow
6. Legal review if required

## Status History
- 2026-02-27: Created planning file, marked as Blocked (waiting for legal text)

## Blockers
- **Paula's legal text** - Waiting for exact legal disclaimers to include

# TODO List: Paula's Feedback & Form Improvements

**Date**: 2026-02-26
**Status**: Pending
**Urgent**: Yes - Paula traveling today, needs discussion
**Priority**: Critical path for form usability and compliance

---

## Summary

Paula provided feedback after testing the form. Main issues:
1. Users can't answer questions when they don't have the exact data (e.g., tonnage)
2. Missing context about company and legal information
3. Visual/branding issues (colors, logo)
4. Form needs to be conditional - only ask questions that apply to the company

This plan addresses form usability, conditional logic, company identification, and legal compliance.

---

## Tasks

### CRITICAL - Blocking UX Issues

#### Task 1: Add Form Instructions from Original Questionnaire
**Priority**: HIGH
**Status**: Pending
**Owner**: TBD
**Depends on**: Review original DOCX questionnaire

**Description**:
- Add instructions/preamble exactly as written in the original questionnaire at the very top of the form
- These instructions help users understand:
  - What the form is for
  - How to fill it out
  - What to do if they don't know a value
  - Whether estimation is acceptable or if they should skip
- Current form has no instructions, causing confusion

**Acceptance Criteria**:
- Instructions match original questionnaire exactly
- Display before any form fields
- Clear guidance on handling "I don't know" scenarios
- Tested with a user who doesn't have exact values

**Notes**:
- Paula said: "When people don't know, put exactly as the questionnaire says"
- Example: She didn't know exact tonnage values and couldn't proceed

---

#### Task 2: Implement Conditional/Dependent Questions Based on Applicability
**Priority**: CRITICAL
**Status**: Pending
**Owner**: TBD
**Depends on**: Review DOCX questionnaire for conditional patterns

**Description**:
Implement smart conditional logic so users only answer questions relevant to their company. Based on the original questionnaire, questions should follow this pattern:

1. **First ask about applicability**: "Does your company have [activity]?"
   - Examples:
     - "Does your company have direct emissions (Scope 1)?"
     - "Does your company discharge water into the environment?"
     - "Does your company have a board of directors?"
     - "Does your company operate in areas of water stress?"

2. **Only if YES, ask for specific data**:
   - "How many tons of GEI Scope 1 emissions did you generate?"
   - "What percentage of discharged water is treated?"
   - "What percentage of board members are women?"

3. **If NO, skip to next relevant section**:
   - Don't ask for numbers
   - Mark indicator as "Not Applicable"
   - Score appropriately (don't penalize if activity doesn't apply)

**Current Problem**:
- Form asks for specific numeric values without checking if activity applies
- Users forced to answer "I don't know" or guess
- Results in invalid data

**Technical Implementation**:
- Update form fields to have `applicabilityQuestion` property
- Show applicability questions first
- Use conditional rendering based on answers
- Update scoring to handle "Not Applicable" status
- Example structure:
```javascript
{
  id: 'tiene_emisiones_alcance1',
  label: '¿Tiene emisiones directas (Alcance 1)?',
  type: 'radio',
  options: ['Sí', 'No', 'No aplica'],
  benchmarkId: null,
  applicabilityQuestion: true
},
{
  id: 'gei_alcance1',
  label: '¿Cuántas toneladas de emisiones GEI directas generó?',
  type: 'number',
  unit: 'toneladas',
  benchmarkId: 'gei_alcance1',
  conditional: 'tiene_emisiones_alcance1',
  conditionalValue: 'Sí'
}
```

**Acceptance Criteria**:
- Conditional questions reduce form length for non-applicable companies
- No "Not Applicable" answers in numeric fields
- Scoring handles N/A indicators correctly
- User testing shows improved form completion rate

**Notes**:
- Paula: "When the indicator doesn't apply to a company, as direct emissions, it won't be necessary to ask for how many emissions there are"
- This should reduce form fatigue significantly

---

#### Task 3: Add Company Identification Data Capture
**Priority**: HIGH
**Status**: Pending
**Owner**: TBD
**Depends on**: Review legal requirements with Paula

**Description**:
Create a company identification section at the START of the form (before scoring questions) to capture:

**Basic Information** (Required):
- Company legal name
- Country / Region
- Industry sector (dropdown with categories)
- Company size category:
  - Micro (1-10 employees)
  - Small (11-50 employees)
  - Medium (51-250 employees)
  - Large (251-1000 employees)
  - Enterprise (1000+ employees)

**Optional/Extended**:
- Company registration number / Tax ID
- Number of employees
- Annual revenue
- Year founded
- Number of locations

**Purpose**:
- Paula mentioned: "Y hay q poner las cosas legales y q al principio contesten, q empresa es, tamaño de la empresa"
- Provides context for scoring interpretation
- Needed for legal/compliance purposes
- Helps with data analysis and benchmarking

**Design Considerations**:
- Should be first section, before any scoring questions
- Can be expandable/collapsible for optional fields
- Should be clearly separated from scoring sections

**Acceptance Criteria**:
- Form captures company name, size, sector
- Data persists with form submission
- Can be displayed in results/reports
- Optional fields don't block form completion

---

#### Task 4: Add The Climb Institute Logo
**Priority**: MEDIUM
**Status**: Pending
**Owner**: TBD
**Depends on**: Get logo file from Paula/design

**Description**:
- Add The Climb Institute logo to the top of the form/page
- Current form has no branding
- Paula: "Tambien hay q poner el logo de The Climb Institute"

**Location**:
- Top-left or centered at page header
- Above form title

**Acceptance Criteria**:
- Logo displays correctly on desktop and mobile
- Logo links to company homepage (optional)
- Professional appearance

**Notes**:
- Need to obtain logo file (PNG/SVG) from Paula or design team

---

#### Task 5: Change Color Scheme from Gold to White
**Priority**: MEDIUM
**Status**: Pending
**Owner**: TBD
**Depends on**: None

**Description**:
- Remove/replace gold color from the interface
- Paula: "El dorado solo es para Next. Aquí no aplica. Q sea en blanco"
- Gold is brand color for "Next" project, not applicable here
- Switch to white color scheme

**Areas to Update**:
- Primary buttons
- Section headers
- Accent colors
- Any gold #FFD700 or similar in CSS

**Acceptance Criteria**:
- No gold colors remain in the form
- White/neutral color scheme applied
- Professional appearance maintained
- Tested on light and dark backgrounds

---

### Content & Legal

#### Task 6: Add Legal Disclaimers and Terms
**Priority**: HIGH
**Status**: Pending - Awaiting Content
**Owner**: TBD
**Depends on**: Legal text from Paula

**Description**:
- Add legal information/disclaimers to the form
- Paula: "Los legales q te lo pase mía" (I'll pass you the legal ones)
- Need to understand what legal requirements apply:
  - Data privacy/GDPR compliance
  - Company liability disclaimers
  - Data usage terms
  - Copyright/trademark notices

**Next Step**:
- Get legal text from Paula
- Determine placement (top, bottom, modal, separate page)
- Add to form

**Acceptance Criteria**:
- Legal text displayed prominently
- User must acknowledge/accept before submitting
- Legal requirements met

**Blocker**: Waiting for Paula to provide legal text

---

#### Task 7: Add Registered Trademark Information
**Priority**: LOW
**Status**: Pending - Clarification Needed
**Owner**: TBD
**Depends on**: Clarification on what trademark

**Description**:
- Paula: "Tambien hay q poner lo de la marca registrada"
- Need to clarify what trademark this refers to:
  - "The Climb Institute™"
  - "NIS™" (Normas de Información de Sostenibilidad)
  - Company/product name
  - Questionnaire name

**Next Step**:
- Ask Paula which trademark to include
- Determine format and placement
- Add ™ or ® symbol as appropriate

**Acceptance Criteria**:
- Correct trademark symbol displayed
- Placed appropriately (usually near logo or in footer)
- Professional presentation

---

#### Task 8: Move Benchmark Descriptions to Analysis/Results Section
**Priority**: MEDIUM
**Status**: Pending
**Owner**: TBD
**Depends on**: Scoring results page implementation

**Description**:
- Paula: "El benchmark se dice en el análisis, no antes xq seaga"
- Currently benchmarks are shown early (in help text, indicators)
- This can bias user responses ("Oh, I should say yes because it's a best practice")
- Move all benchmark information to AFTER user submits, in the results/analysis

**Current State**:
- Benchmark indicator icons (📊) shown during form filling
- Help text references benchmarks

**Target State**:
- Form shows questions WITHOUT benchmark references
- User answers questions naturally without influence
- After submission, results page shows:
  - Which benchmarks each answer was scored against
  - Full benchmark details (source, meta, description, APA citation)
  - Analysis of performance vs. benchmarks

**Benefit**:
- More genuine responses
- Less guessing based on benchmark hints
- Better data quality

**Acceptance Criteria**:
- No benchmark info visible during form filling
- Benchmark details visible in results/analysis page
- All citations and sources preserved in analysis

---

### Testing & Validation

#### Task 9: Integrate OpenFormStack Backend Storage
**Priority**: CRITICAL
**Status**: Pending
**Owner**: TBD
**Depends on**: None (can work in parallel)

**Description**:
Connect the form to OpenFormStack backend platform for data persistence and storage.

**Endpoint Details**:
- **URL**: `https://openformstack.com/f/cmm3yej4l00004nan9zcn7laj`
- **Purpose**: Store form submissions with company data and scoring results
- **Integration**: Form submission should POST to this endpoint

**Implementation Requirements**:
- Map form fields to OpenFormStack schema
- Handle form submission to endpoint
- Display confirmation after successful submission
- Handle errors and validation failures
- Implement retry logic for failed submissions
- Store locally during offline (if needed)

**Technical Details**:
- Method: POST/PUT to OpenFormStack endpoint
- Include all form fields:
  - Company identification data
  - All scoring indicators
  - Calculated scores (ambiental, social, gobernanza, total)
  - Timestamp and metadata
- Expect response with submission ID for reference

**Acceptance Criteria**:
- Form submission POSTs to OpenFormStack
- Responses are stored and retrievable
- Confirmation message shown to user
- Error handling for network/validation failures
- Submission data includes all form fields and scores
- User can reference submission ID

**Notes**:
- This is parallel-path work (doesn't block other form improvements)
- Can be tested with mock submissions during development
- Need to understand OpenFormStack API requirements

---

#### Task 10: Test Form with Users Unable to Answer All Questions
**Priority**: HIGH
**Status**: Pending
**Owner**: Paula (primary tester)
**Depends on**: Tasks 1, 2, 3

**Description**:
- Conduct user testing with real users who don't have exact values
- Paula herself couldn't complete the form: "Hay q probarlo, pero yo no lo pude responder xq no sabía"
- Test scenarios:
  - User doesn't know exact tonnage (must estimate or skip)
  - User's company doesn't have certain activities (emissions, water, etc.)
  - User has incomplete data
  - Form should be usable despite incomplete information

**Test Plan**:
1. Have users without data access try to fill form
2. Observe where they get stuck
3. Measure:
   - Completion rate
   - Time to complete
   - Frustration points
   - Data quality of estimates

**Success Criteria**:
- Users can complete form even without exact values
- Form provides appropriate guidance for each scenario
- Results are valid and usable for analysis

**Notes**:
- Paula is traveling, test after discussing improvements
- May reveal additional UX issues

---

## Implementation Order

### Phase 1 (Critical - Blocks Testing)
1. Task 1: Add form instructions
2. Task 2: Implement conditional questions
3. Task 3: Add company identification section
4. Task 9: Test with real users

### Phase 2 (Important - Polish & Legal)
5. Task 6: Add legal disclaimers (once Paula provides text)
6. Task 4: Add The Climb Institute logo

### Phase 3 (Nice to Have)
7. Task 5: Change color scheme
8. Task 7: Add trademark information
9. Task 8: Move benchmarks to analysis

---

## Discussion Points for Paula

- [ ] Original DOCX questionnaire - need to review for:
  - Instructions/preamble
  - Conditional question patterns
  - Required company information fields
  - Legal disclaimers text
- [ ] Logo file for The Climb Institute
- [ ] Trademark information (which trademark, format)
- [ ] Legal requirements for data collection/storage
- [ ] Timeline - when does form need to be live?

---

## Related Files

- `llm.txt` - Project reference
- `__tests__/scoring-integration.test.js` - Scoring tests (need to update for N/A scenarios)
- `js/form.js` - Form renderer (will be heavily modified)
- `js/scoring.js` - Scoring logic (needs N/A handling)
- Original DOCX questionnaire (need to get from Paula)

---

## Notes

- Paula is traveling today - discuss this plan ASAP
- Weight redistribution fix is complete (don't break in refactoring)
- 45 tests currently passing - maintain test coverage during conditional implementation
- Conditional logic will significantly change form behavior - needs thorough testing

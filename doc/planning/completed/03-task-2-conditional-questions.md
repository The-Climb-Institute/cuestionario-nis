# Task 2: Implement Conditional Questions

**Status**: Completed
**Priority**: CRITICAL
**Owner**: TBD
**Created**: 2026-02-27
**Completed**: 2026-02-28

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
- [x] Conditional questions reduce form length for non-applicable companies
- [x] No forced answers when activity doesn't apply
- [x] Scoring correctly handles N/A status (hidden/unanswered fields excluded; values cleared when gate = No)
- [ ] User testing shows improved completion rate (future: Task 10)
- [x] Data quality remains high (no guesses; only applicable questions shown)
- [ ] Form tested with company that has limited applicability (future validation)

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

## Implemented conditional logic (redacted from existing questionnaire)

There was no separate source for conditional logic; the following applicability questions and skip logic were defined from the existing form and questionnaire so that questions that cannot be answered are not shown.

### Ambiental

| Gate question (Sí/No) | Shown only when "Sí" |
|------------------------|----------------------|
| **aplica_emisiones_energia**: ¿La empresa reporta emisiones de GEI (alcance 1 o 2) o tiene consumo de energía relevante para reportar? | gei_alcance1, gei_alcance2, energia_kwh, energia_renovable, inversion_energias_limpias |
| **aplica_agua**: ¿La empresa utiliza o descarga agua en sus operaciones? | agua_ingresada, agua_residual, agua_descargada_tratada, reutiliza_agua |
| **aplica_sustancias_ozono**: ¿La empresa utiliza sustancias que agotan la capa de ozono (Protocolo de Montreal)? | sustancias_ozono |
| **aplica_residuos**: ¿La empresa genera residuos (sólidos o peligrosos) en sus operaciones? | residuos_totales, residuos_reciclados, residuos_peligrosos_vol, residuos_peligrosos |

Always shown in Ambiental: mide_alcance3, estres_hidrico, biodiversidad_sensible (Sí/No; applicable to any company).

### Gobernanza

| Gate question | Shown only when "Sí" |
|---------------|----------------------|
| **tienen_consejo**: ¿En la empresa tienen consejo de administración? (DOCX E1.6) | composicion_consejo_mujeres, composicion_consejo_hombres, composicion_consejo_nobinarias, mujeres_consejo (E1.7–E1.8) |

### Social

No applicability gates: all questions (capacitación, evaluación, accidentes, políticas de igualdad) are relevant to any company with employees.

### Behaviour

- Fields with `conditional: 'fieldId'` are hidden until the user answers "Sí" to the gate question.
- When the user changes the gate to "No", dependent fields are hidden and their values are cleared so they are not submitted.
- Scoring already only considers responded indicators; hidden/unanswered fields are excluded from section and total score.

## Status History
- 2026-02-27: Created planning file, marked as Blocked (waiting for questionnaire patterns)
- 2026-02-27: Clarified sources — proposed questionnaire = `input-assets/251217_CLIMB_cuestionario_2.0.docx`; original fields = data-analysis. Dependency satisfied; can move to ready when prioritised (Task 3 may be done in parallel).
- 2026-02-28: Conditional logic redacted and implemented from existing form; no separate DOCX source for conditionals. Four applicability gates added in Ambiental; Gobernanza already had tienen_consejo.
- 2026-02-28: Task marked Completed; doc moved to completed/.

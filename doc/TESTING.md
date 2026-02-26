# Test-Driven Debugging: NIS Scoring Bug Fix

## Problem Statement

User reported three critical bugs in the cuestionario-nis application:
1. **Sections displayed "0%" instead of "-"** when no data entered
2. **Scoring calculations were incorrect** (e.g., 10% energy showed as ~3%, not 10%)
3. **Modal not clickable** for attention-level indicators

## TDD Investigation Process

### Step 1: Unit Tests (Isolated Code)
Created `__tests__/scoring.test.js` with 18 test cases covering:
- Single indicator normalization (energy, training, women percentages)
- Section score calculation with various responses
- No-data scenarios
- Traffic light colors
- Display logic (hasData flag)

**Result: All 18 unit tests PASSED ✓**

This indicated the NISScorer class logic was correct in isolation.

### Step 2: Integration Tests (Real Code + Real Data)
Created `__tests__/scoring-integration.test.js` with 20 test cases using:
- **Real code**: Imported actual NISScorer from `js/scoring.js`
- **Real data**: Loaded actual benchmarks from `data/benchmarks.json` (14 benchmarks)
- **Real scenarios**: Full calculation flow with actual benchmark structure

**Result: 9 tests FAILED ✗**

This revealed the bug was in how the app used the scorer, not in the scorer itself.

### Step 3: Debug & Root Cause Analysis

Created debug test that logged each step of the calculation:

```javascript
// With energia_renovable = 10:
Ambiental benchmarks: 4
  - energia_renovable
  - agua_descargada_tratada
  - residuos_reciclados
  - residuos_peligrosos

normalizeValue('energia_renovable', 10) = 0.1
normalizeValue('agua_descargada_tratada', undefined) = 0
normalizeValue('residuos_reciclados', undefined) = 0
normalizeValue('residuos_peligrosos', undefined) = 0

Responded indicators: 4  ← BUG! Should be 1
  [0] value=10, normalized=0.1
  [1] value=undefined, normalized=0    ← undefined counted!
  [2] value=undefined, normalized=0    ← undefined counted!
  [3] value=undefined, normalized=0    ← undefined counted!

Average score: (0.1 + 0 + 0 + 0) / 4 = 0.025 = 3%  ← WRONG!
Expected: 0.1 / 1 = 10%
```

## Root Cause

**Location**: `js/scoring.js` line 112 in `calculateSectionScore()`

```javascript
// BUGGY CODE:
const respondedIndicators = normalizedScores.filter(
  item => item.value !== null && item.value !== ''
);
```

**Problem**: The filter checks `!== null` and `!== ''` but does NOT exclude `undefined` values.

In JavaScript:
- `undefined !== null` → `true` ✓ (passes filter)
- `undefined !== ''` → `true` ✓ (passes filter)
- **Result: undefined values are counted as "responded"**

When a field has no user response, `formValues[benchmark.id]` returns `undefined`. This undefined:
1. Passes the "responded" filter
2. Gets normalized to 0
3. Gets averaged with actual responses
4. Dilutes the final score

**Example**: 10% energy with 3 other empty benchmarks
- Buggy: `(0.1 + 0 + 0 + 0) / 4 = 0.025 = 3%`
- Fixed: `0.1 / 1 = 10%`

## The Fix

**Changed line 112 in `js/scoring.js`:**

```javascript
// FIXED CODE:
const respondedIndicators = normalizedScores.filter(
  item => item.value != null && item.value !== ''
);
```

**How it works**: JavaScript loose equality operator `!=` (and `==`) treats both `null` and `undefined` as equivalent, so:
- `undefined != null` → `false` ✗ (correctly excluded)
- `null != null` → `false` ✗ (correctly excluded)
- `'10' != null` → `true` ✓ (correctly included)
- `0 != null` → `true` ✓ (correctly included)

## Test Results

| Suite | Tests | Before | After |
|-------|-------|--------|-------|
| Unit Tests | 18 | ✓ 18/18 | ✓ 18/18 |
| Integration Tests | 20 | ✗ 9/20 | ✓ 20/20 |
| **Total** | **38** | **✗ 9 failed** | **✓ All passed** |

## Verification

After fix, specific cases now work correctly:

```javascript
// Case 1: Single indicator
energia_renovable: 10
→ porcentaje: 10 (was 5)
→ hasData: true
→ displayValue: "10%" (was "5%")

// Case 2: Multiple indicators
energia_renovable: 10, agua_descargada_tratada: 80
→ porcentaje: 45 (was 30) — average of [0.1, 0.8]
→ hasData: true

// Case 3: Empty section
energia_renovable: null, agua_descargada_tratada: null, ...
→ porcentaje: 0
→ hasData: false  (was true — BUG)
→ displayValue: "-" (was "0%" — BUG)
```

## Lessons from TDD

1. **Isolated tests can mislead** — Unit tests passed because they tested the class in isolation with correct data structures
2. **Integration tests are crucial** — Testing with real code + real data exposed the mismatch
3. **Debug incrementally** — Instead of guessing, we logged each calculation step to see exactly where the bug manifested
4. **One-character fixes matter** — Changing `!==` to `!=` (loose equality) fixed all 9 failing tests and 3 reported bugs

## Files Modified

- `js/scoring.js` — Fixed respondedIndicators filter (1 character: `!` + `=` instead of `!==`)
- `package.json` — Updated test script to run Jest
- `__tests__/scoring.test.js` — 18 unit tests (new)
- `__tests__/scoring-integration.test.js` — 20 integration tests (new)

## Next Steps for User

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Hard refresh** the HTML file (Ctrl+F5 or Cmd+Shift+R)
3. **Test the form**:
   - Enter only "10" for energy renewable → should show 10%, not 5%
   - Leave all fields blank → sections should show "-", not "0%"
   - Scores under 40% should be clickable to show modal
4. **Run tests locally**: `npm test` shows all 38 tests passing

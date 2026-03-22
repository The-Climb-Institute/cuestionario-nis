/**
 * RFC (Registro Federal de Contribuyentes) Validator
 * Mexican Tax ID validation for personas morales and personas físicas
 *
 * RFC Structure (13 characters total):
 * - Personas morales (organizations): XXXXXX######X
 * - Personas físicas (individuals): XXXXXX######X
 *
 * Position breakdown:
 * 1-6: Derived from name (6 letters; can include Ñ or & for organizations)
 * 7-8: Birth/foundation year (YY, last 2 digits)
 * 9-10: Month (MM, 01-12)
 * 11-12: Day (DD, 01-31)
 * 13: Check digit (0-9 or A-Z, calculated using Mod 13 algorithm)
 *
 * Reference:
 * https://www.sat.gob.mx/
 * https://www.gob.mx/sat/articulos/que-es-el-rfc
 */

class RFCValidator {
  /**
   * Check if RFC format is valid (basic structure)
   * Personas morales: 13 chars (6 letters + 6 date + 3 sequential + 1 check)
   * Personas físicas: 13 chars (6 letters + 6 date + 3 sequential + 1 check)
   *
   * Basic regex pattern:
   * - [A-ZÑ&]{6}: First 6 characters from name (letters, can include Ñ or &)
   * - [0-9]{6}: 6-digit date (YYMMDD)
   * - [0-9A-Z]{3}: 3-character sequential + consonant
   * - [0-9A-Z]: 1 check digit
   *
   * @param {string} rfc - RFC to validate
   * @returns {boolean} True if format is valid
   */
  static isValidFormat(rfc) {
    if (!rfc) return false;

    // Normalize: remove spaces, convert to uppercase
    const normalized = rfc.trim().toUpperCase().replace(/\s+/g, '');

    // RFC must be exactly 13 characters
    if (normalized.length !== 13) {
      return false;
    }

    // Pattern for RFC: 6 letters + 6 digits + 1 check digit = 13 total
    // Positions 1-6: Letters (A-Z, Ñ, or & for organizations)
    // Positions 7-12: Digits (YYMMDD date)
    // Position 13: Check digit (0-9 or A-Z)
    const rfcPattern = /^[A-ZÑ&]{6}\d{6}[0-9A-Z]$/;

    return rfcPattern.test(normalized);
  }

  /**
   * Validate RFC with verifying digit check (Mod 13 algorithm)
   * Based on SAT official validation
   *
   * @param {string} rfc - RFC to validate
   * @returns {boolean} True if RFC is valid with correct check digit
   */
  static isValid(rfc) {
    if (!this.isValidFormat(rfc)) {
      return false;
    }

    const normalized = rfc.trim().toUpperCase();

    // Extract check digit (last character)
    const checkDigit = normalized[12];

    // Calculate expected check digit using Mod 13 algorithm
    const expectedCheckDigit = this.calculateCheckDigit(normalized.substring(0, 12));

    return checkDigit === expectedCheckDigit;
  }

  /**
   * Calculate the verifying digit (last character) using Mod 13 algorithm
   * Based on SAT (Servicio de Administración Tributaria) official rules
   * RFC format: 6 letters + 6 digits + 1 check digit = 13 chars
   *
   * @param {string} rfcWithoutCheck - First 12 characters of RFC (6 letters + 6 digits)
   * @returns {string} The check digit (0-9 or A-Z)
   */
  static calculateCheckDigit(rfcWithoutCheck) {
    // Weight sequence for Mod 13 calculation (12 weights for 12 characters)
    const weights = [3, 7, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

    // Character mapping for alphanumeric conversion
    const charMap = {
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18,
      'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, 'Ñ': 24, 'O': 25, 'P': 26, 'Q': 27,
      'R': 28, 'S': 29, 'T': 30, 'U': 31, 'V': 32, 'W': 33, 'X': 34, 'Y': 35, 'Z': 36,
      '&': 37, ' ': 38
    };

    let sum = 0;

    for (let i = 0; i < rfcWithoutCheck.length; i++) {
      const char = rfcWithoutCheck[i];
      const value = charMap[char] ?? 0;
      sum += (value * weights[i]) % 13;
    }

    const remainder = (13 - (sum % 13)) % 13;

    // Convert remainder to check digit
    // 0-9 = numeric, 10-12 = letters
    const checkDigitMap = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'];

    return checkDigitMap[remainder] || '0';
  }

  /**
   * Validate RFC and return validation result with details
   *
   * @param {string} rfc - RFC to validate
   * @param {string} personType - 'moral' (organization) or 'fisica' (individual), optional
   * @returns {object} Validation result { valid, errors, normalized }
   */
  static validate(rfc, personType = null) {
    const errors = [];
    const normalized = rfc ? rfc.trim().toUpperCase() : '';

    // Check if empty
    if (!rfc) {
      errors.push('RFC no puede estar vacío');
      return { valid: false, errors, normalized };
    }

    // Check format
    if (!this.isValidFormat(rfc)) {
      errors.push('RFC debe tener exactamente 13 caracteres en formato válido (6 letras + 6 dígitos + 3 caracteres + 1 dígito)');
    }

    // Check person type if specified
    if (personType) {
      if (personType === 'moral' && !/^[A-ZÑ&]{6}/.test(normalized)) {
        errors.push('RFC para personas morales debe comenzar con 6 letras del nombre de la empresa');
      }
      if (personType === 'fisica' && !/^[A-ZÑ]{6}/.test(normalized)) {
        errors.push('RFC para personas físicas debe comenzar con 6 letras del nombre/apellidos');
      }
    }

    // Check date validity only if format is correct (YYMMDD format in positions 6-11, 0-indexed)
    if (/^[0-9]{6}/.test(normalized.substring(6, 12))) {
      const dateStr = normalized.substring(6, 12);
      const [yy, mm, dd] = [dateStr.substring(0, 2), dateStr.substring(2, 4), dateStr.substring(4, 6)];
      const month = parseInt(mm);
      const day = parseInt(dd);

      if (month < 1 || month > 12) {
        errors.push(`Mes inválido: ${mm}`);
      }
      if (day < 1 || day > 31) {
        errors.push(`Día inválido: ${dd}`);
      }
    }

    // Check verifying digit only if no other format errors
    if (errors.length === 0 && !this.isValid(rfc)) {
      errors.push('Dígito verificador (última posición) es inválido');
    }

    return {
      valid: errors.length === 0,
      errors,
      normalized
    };
  }

  /**
   * Normalize RFC: trim, uppercase, remove extra spaces
   *
   * @param {string} rfc - RFC to normalize
   * @returns {string} Normalized RFC
   */
  static normalize(rfc) {
    if (!rfc) return '';
    return rfc.trim().toUpperCase().replace(/\s+/g, '');
  }
}

// Export for use in form.js and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RFCValidator;
}

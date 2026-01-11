/**
 * Validation Layer for Admin CRUD Operations
 * Comprehensive validation functions for all data types
 */

/**
 * Email validation
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: re.test(email),
    message: re.test(email) ? "" : "Invalid email format",
  };
}

/**
 * URL validation
 */
export function validateURL(url) {
  try {
    new URL(url);
    return { valid: true, message: "" };
  } catch {
    return { valid: false, message: "Invalid URL format" };
  }
}

/**
 * Number range validation
 */
export function validateNumberRange(value, min = -Infinity, max = Infinity) {
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, message: "Must be a valid number" };
  }
  if (num < min) {
    return { valid: false, message: `Must be at least ${min}` };
  }
  if (num > max) {
    return { valid: false, message: `Must be at most ${max}` };
  }
  return { valid: true, message: "" };
}

/**
 * Date validation
 */
export function validateDate(dateString) {
  const date = new Date(dateString);
  return {
    valid: !isNaN(date.getTime()),
    message: isNaN(date.getTime()) ? "Invalid date format" : "",
  };
}

/**
 * JSON validation
 */
export function validateJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return { valid: true, message: "" };
  } catch (e) {
    return { valid: false, message: `Invalid JSON: ${e.message}` };
  }
}

/**
 * JLPT Level validation
 */
export function validateJLPTLevel(level) {
  const validLevels = ["N5", "N4", "N3", "N2", "N1"];
  return {
    valid: validLevels.includes(level),
    message: validLevels.includes(level) ? "" : "Must be N5, N4, N3, N2, or N1",
  };
}

/**
 * Required field validation
 */
export function validateRequired(value, fieldName = "Field") {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "string" && value.trim() === "");
  return {
    valid: !isEmpty,
    message: isEmpty ? `${fieldName} is required` : "",
  };
}

/**
 * String length validation
 */
export function validateLength(value, min = 0, max = Infinity) {
  const len = String(value || "").length;
  if (len < min) {
    return { valid: false, message: `Must be at least ${min} characters` };
  }
  if (len > max) {
    return { valid: false, message: `Must be at most ${max} characters` };
  }
  return { valid: true, message: "" };
}

/**
 * Boolean conversion with validation
 */
export function validateBoolean(value) {
  if (typeof value === "boolean") {
    return { valid: true, value, message: "" };
  }
  const str = String(value).toLowerCase().trim();
  if (["true", "1", "yes", "on"].includes(str)) {
    return { valid: true, value: true, message: "" };
  }
  if (["false", "0", "no", "off", ""].includes(str)) {
    return { valid: true, value: false, message: "" };
  }
  return { valid: false, value: false, message: "Invalid boolean value" };
}

/**
 * Array validation
 */
export function validateArray(value) {
  if (Array.isArray(value)) {
    return { valid: true, value, message: "" };
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return { valid: true, value: parsed, message: "" };
      }
    } catch (e) {}
  }
  return { valid: false, message: "Must be a valid array" };
}

/**
 * Foreign key existence check
 */
export async function validateForeignKey(query, tableName, columnName, value) {
  if (!value) return { valid: true, message: "" }; // Allow null FK

  try {
    const result = await query(
      `SELECT 1 FROM ${tableName} WHERE ${columnName} = $1 LIMIT 1`,
      [value]
    );
    return {
      valid: result.rowCount > 0,
      message:
        result.rowCount > 0
          ? ""
          : `Referenced ${tableName} ID ${value} does not exist`,
    };
  } catch (e) {
    return {
      valid: false,
      message: `Error checking foreign key: ${e.message}`,
    };
  }
}

/**
 * Comprehensive field validator based on field config
 */
export function validateField(field, value) {
  const errors = [];

  // 1. Required check
  if (field.required) {
    const reqCheck = validateRequired(value, field.label);
    if (!reqCheck.valid) errors.push(reqCheck.message);
  }

  // Skip other validations if empty and not required
  if (!value && !field.required) {
    return { valid: true, errors: [], value };
  }

  // 2. Type-specific validation
  switch (field.type) {
    case "email":
      const emailCheck = validateEmail(value);
      if (!emailCheck.valid) errors.push(emailCheck.message);
      break;

    case "url":
      if (value) {
        const urlCheck = validateURL(value);
        if (!urlCheck.valid) errors.push(urlCheck.message);
      }
      break;

    case "number":
      const numCheck = validateNumberRange(value, field.min, field.max);
      if (!numCheck.valid) errors.push(numCheck.message);
      break;

    case "date":
    case "datetime":
      const dateCheck = validateDate(value);
      if (!dateCheck.valid) errors.push(dateCheck.message);
      break;

    case "json":
      if (typeof value === "string") {
        const jsonCheck = validateJSON(value);
        if (!jsonCheck.valid) errors.push(jsonCheck.message);
      }
      break;

    case "checkbox":
    case "boolean":
      const boolCheck = validateBoolean(value);
      if (!boolCheck.valid) errors.push(boolCheck.message);
      value = boolCheck.value;
      break;
  }

  // 3. Length validation
  if (field.minLength || field.maxLength) {
    const lengthCheck = validateLength(value, field.minLength, field.maxLength);
    if (!lengthCheck.valid) errors.push(lengthCheck.message);
  }

  // 4. Pattern validation
  if (field.pattern && value) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(value)) {
      errors.push(field.patternMessage || "Invalid format");
    }
  }

  // 5. Custom JLPT validation
  if (field.key === "jlpt_level" && value) {
    const jlptCheck = validateJLPTLevel(value);
    if (!jlptCheck.valid) errors.push(jlptCheck.message);
  }

  return {
    valid: errors.length === 0,
    errors,
    value,
  };
}

/**
 * Validate entire form data
 */
export function validateFormData(fields, formData) {
  const errors = {};
  const validatedData = {};

  fields.forEach((field) => {
    const result = validateField(field, formData[field.key]);

    if (!result.valid) {
      errors[field.key] = result.errors;
    }

    validatedData[field.key] = result.value;
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: validatedData,
  };
}

/**
 * Validate import row
 */
export function validateImportRow(fields, row, rowNumber) {
  const errors = [];
  const warnings = [];
  const validatedRow = {};

  fields.forEach((field) => {
    const value = row[field.key];
    const result = validateField(field, value);

    if (!result.valid) {
      result.errors.forEach((err) => {
        errors.push(`Row ${rowNumber}, ${field.label}: ${err}`);
      });
    } else if (result.value !== value) {
      warnings.push(
        `Row ${rowNumber}, ${field.label}: Value converted from "${value}" to "${result.value}"`
      );
    }

    validatedRow[field.key] = result.value;
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: validatedRow,
  };
}

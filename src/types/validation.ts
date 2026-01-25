/**
 * Types and interfaces for Validation
 */

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  
  /** Error message if validation failed */
  error?: string;
  
  /** Field that failed validation (if applicable) */
  field?: string;
  
  /** Sanitized/cleaned value */
  value?: any;
}

/**
 * Validation rule
 */
export interface ValidationRule<T = any> {
  /** Name of the rule */
  name: string;
  
  /** Validation function */
  validate: (value: T) => boolean | Promise<boolean>;
  
  /** Error message if validation fails */
  message: string;
}

/**
 * Options for string validation
 */
export interface StringValidationOptions {
  /** Minimum length */
  minLength?: number;
  
  /** Maximum length */
  maxLength?: number;
  
  /** Pattern to match */
  pattern?: RegExp;
  
  /** Whether to trim whitespace */
  trim?: boolean;
  
  /** Whether empty strings are allowed */
  allowEmpty?: boolean;
}

/**
 * Options for number validation
 */
export interface NumberValidationOptions {
  /** Minimum value */
  min?: number;
  
  /** Maximum value */
  max?: number;
  
  /** Whether only integers are allowed */
  integer?: boolean;
  
  /** Whether negative numbers are allowed */
  allowNegative?: boolean;
}

/**
 * Options for channel validation
 */
export interface ChannelValidationOptions {
  /** Whether the channel must exist */
  mustExist?: boolean;
  
  /** Required channel type */
  requiredType?: number;
  
  /** Whether the channel must be manageable by the bot */
  mustBeManageable?: boolean;
}

/**
 * Validation schema for an object
 */
export interface ValidationSchema<T = any> {
  /** Field validators */
  fields: {
    [K in keyof T]?: ValidationRule<T[K]>[];
  };
  
  /** Custom validation function for the entire object */
  custom?: (obj: T) => ValidationResult;
}

/**
 * Batch validation result
 */
export interface BatchValidationResult {
  /** Whether all validations passed */
  valid: boolean;
  
  /** Individual validation results */
  results: Record<string, ValidationResult>;
  
  /** List of all errors */
  errors: string[];
}

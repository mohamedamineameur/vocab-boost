


interface FieldRule {
  required?: boolean;
  type: string; 
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
  dependsOn?: string | string[];
    enum?: string[];

  messages?: {
    required?: string;
    type?: string;
    minLength?: string;
    maxLength?: string;
    regex?: string;
  };
}

export type Schema = Record<string, FieldRule>;

export function bodyValidator(body: any, schema: Record<string, FieldRule>): string[] {
  const errors: string[] = [];
  const bodyKeys = Object.keys(body);

  // 1. Required fields
  for (const [field, rule] of Object.entries(schema)) {
    if (rule.required && !(field in body)) {
      errors.push(rule.messages?.required || `The field "${field}" is required`);
    }
  }

  // 2. Extra fields
  for (const key of bodyKeys) {
    if (!(key in schema)) {
      errors.push(`The field "${key}" is not allowed`);
    }
  }

  // 3. Validate each field
  for (const [field, rule] of Object.entries(schema)) {
    const value = body[field];
    if (value === undefined) continue; // not present and not required

   if (rule.type === "array") {
  if (!Array.isArray(value)) {
    errors.push(rule.messages?.type || `The field "${field}" must be an array`);
  } else {
    for (const item of value) {
      if (typeof item !== "string") {
        errors.push(`The field "${field}" must be an array of strings`);
        break;
      }
    }
  }
} else if (typeof value !== rule.type) {
  errors.push(rule.messages?.type || `The field "${field}" must be of type ${rule.type}`);
}

     // Enum
  if (rule.enum && !rule.enum.includes(value)) {
    errors.push(`The field "${field}" must be one of: ${rule.enum.join(", ")}`);
  }

    // Min length
    if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
      errors.push(
        rule.messages?.minLength ||
          `The field "${field}" must have at least ${rule.minLength} characters`
      );
    }

    // Max length
    if (rule.maxLength && typeof value === "string" && value.length > rule.maxLength) {
      errors.push(
        rule.messages?.maxLength ||
          `The field "${field}" must have at most ${rule.maxLength} characters`
      );
    }

    // Regex
    if (rule.regex && typeof value === "string" && !rule.regex.test(value)) {
      errors.push(rule.messages?.regex || `The field "${field}" has an invalid format`);
    }


  }

  return errors;
}


export function bodyWithParamsValidator(
  body: any,
  bodySchema: Record<string, FieldRule>,
  params: any,
  paramsSchema: Record<string, FieldRule>
): string[] {
  const bodyErrors = bodyValidator(body, bodySchema);
  const paramErrors = bodyValidator(params, paramsSchema);

  return [...bodyErrors, ...paramErrors];
}

export function paramsValidator(
  params: any,
  paramsSchema: Record<string, FieldRule>
): string[] {
  return bodyValidator(params, paramsSchema);
}




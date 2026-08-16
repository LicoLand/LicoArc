/** Minimal, fail-closed Draft 2020-12 JSON Schema subset. */

const SCHEMA_KEYWORDS = new Set([
  "$id", "$schema", "$ref", "title", "description", "type", "const", "enum", "format",
  "required", "properties", "additionalProperties", "items", "prefixItems",
  "minItems", "maxItems", "uniqueItems", "minProperties", "maxProperties",
  "minLength", "maxLength", "pattern", "minimum", "maximum",
  "exclusiveMinimum", "exclusiveMaximum", "allOf", "anyOf", "oneOf", "not"
]);

export class SchemaError extends TypeError {
  constructor(message, details = undefined) {
    super(message);
    this.name = "SchemaError";
    if (details !== undefined) this.details = details;
  }
}

/**
 * Assert that a schema only uses the closed vocabulary accepted by the
 * foundation.  Object schemas must explicitly set additionalProperties:false.
 */
export function assertClosedJsonSchema(schema, path = "$") {
  if (!isPlainObject(schema)) throw new SchemaError(`schema must be an object at ${path}`);
  for (const key of Object.keys(schema)) {
    if (!SCHEMA_KEYWORDS.has(key)) throw new SchemaError(`unknown JSON Schema keyword ${key} at ${path}`);
  }
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (types.length === 0 || types.some((type) => !["null", "boolean", "number", "integer", "string", "array", "object"].includes(type))) {
      throw new SchemaError(`schema type is outside the closed vocabulary at ${path}`);
    }
    if (types.includes("object") && schema.additionalProperties !== false) {
      throw new SchemaError(`object schema must close additionalProperties at ${path}`);
    }
  }
  if (schema.$ref !== undefined && (typeof schema.$ref !== "string" || !schema.$ref.startsWith("#"))) {
    throw new SchemaError(`schema reference must be a local JSON Pointer at ${path}`);
  }
  if (schema.format !== undefined && (typeof schema.format !== "string" || !["date-time", "uri", "uri-reference", "uuid", "regex"].includes(schema.format))) {
    throw new SchemaError(`schema format is outside the closed vocabulary at ${path}`);
  }
  if (schema.properties !== undefined) {
    if (!isPlainObject(schema.properties)) throw new SchemaError(`schema properties must be an object at ${path}`);
    if (schema.additionalProperties !== false) {
      throw new SchemaError(`object schema must close additionalProperties at ${path}`);
    }
    for (const [key, child] of Object.entries(schema.properties)) assertClosedJsonSchema(child, `${path}.properties.${key}`);
  } else if (schema.additionalProperties !== undefined && schema.additionalProperties !== false) {
    throw new SchemaError(`additionalProperties must be false at ${path}`);
  }
  if (schema.additionalProperties !== undefined && schema.additionalProperties !== false) {
    throw new SchemaError(`additionalProperties must be false at ${path}`);
  }
  if (schema.items !== undefined) assertClosedJsonSchema(schema.items, `${path}.items`);
  if (schema.prefixItems !== undefined) {
    if (!Array.isArray(schema.prefixItems)) throw new SchemaError(`prefixItems must be an array at ${path}`);
    schema.prefixItems.forEach((child, index) => assertClosedJsonSchema(child, `${path}.prefixItems[${index}]`));
  }
  for (const keyword of ["allOf", "anyOf", "oneOf"]) {
    if (schema[keyword] !== undefined) {
      if (!Array.isArray(schema[keyword]) || schema[keyword].length === 0) throw new SchemaError(`${keyword} must be a non-empty array at ${path}`);
      schema[keyword].forEach((child, index) => assertClosedJsonSchema(child, `${path}.${keyword}[${index}]`));
    }
  }
  if (schema.not !== undefined) assertClosedJsonSchema(schema.not, `${path}.not`);
  if (schema.required !== undefined) {
    if (!Array.isArray(schema.required) || schema.required.some((key) => typeof key !== "string") || new Set(schema.required).size !== schema.required.length) {
      throw new SchemaError(`required must be a unique string array at ${path}`);
    }
    if (schema.properties !== undefined && schema.required.some((key) => !(key in schema.properties))) {
      throw new SchemaError(`required names must be declared properties at ${path}`);
    }
  }
  validateBoundKeyword(schema, "minItems", path);
  validateBoundKeyword(schema, "maxItems", path);
  validateBoundKeyword(schema, "minProperties", path);
  validateBoundKeyword(schema, "maxProperties", path);
  validateBoundKeyword(schema, "minLength", path);
  validateBoundKeyword(schema, "maxLength", path);
  return true;
}

/** Return deterministic validation messages for a JSON value. */
export function validateClosedSchema(value, schema) {
  assertClosedJsonSchema(schema);
  const errors = [];
  validate(value, schema, "$", errors, schema);
  return errors;
}

export function assertValidAgainstClosedSchema(value, schema) {
  const errors = validateClosedSchema(value, schema);
  if (errors.length > 0) throw new SchemaError(`value does not satisfy closed schema: ${errors.join("; ")}`, errors);
  return value;
}

function validate(value, schema, path, errors, rootSchema) {
  if (schema.$ref !== undefined) {
    const target = resolveLocalRef(rootSchema, schema.$ref);
    validate(value, target, path, errors, rootSchema);
    return;
  }
  if (schema.const !== undefined && !deepEqual(value, schema.const)) errors.push(`${path} must equal const`);
  if (schema.enum !== undefined && (!Array.isArray(schema.enum) || !schema.enum.some((candidate) => deepEqual(value, candidate)))) errors.push(`${path} is not an allowed enum value`);
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => matchesType(value, type))) {
      errors.push(`${path} must have type ${types.join("|")}`);
      return;
    }
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && [...value].length < schema.minLength) errors.push(`${path} is shorter than minLength`);
    if (schema.maxLength !== undefined && [...value].length > schema.maxLength) errors.push(`${path} is longer than maxLength`);
    if (schema.pattern !== undefined) {
      let pattern;
      try { pattern = new RegExp(schema.pattern, "u"); } catch { errors.push(`${path} has an invalid schema pattern`); pattern = null; }
      if (pattern && !pattern.test(value)) errors.push(`${path} does not match pattern`);
    }
    if (schema.format !== undefined && !matchesFormat(value, schema.format)) errors.push(`${path} does not match format ${schema.format}`);
  }
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path} is below minimum`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path} is above maximum`);
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) errors.push(`${path} is at or below exclusiveMinimum`);
    if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) errors.push(`${path} is at or above exclusiveMaximum`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path} has fewer than minItems`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path} has more than maxItems`);
    if (schema.uniqueItems && value.some((item, index) => value.slice(0, index).some((prior) => deepEqual(prior, item)))) errors.push(`${path} contains duplicate items`);
    if (schema.prefixItems !== undefined) schema.prefixItems.forEach((child, index) => {
      if (index < value.length) validate(value[index], child, `${path}[${index}]`, errors, rootSchema);
    });
    if (schema.items !== undefined) value.forEach((item, index) => validate(item, schema.items, `${path}[${index}]`, errors, rootSchema));
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (schema.minProperties !== undefined && keys.length < schema.minProperties) errors.push(`${path} has fewer than minProperties`);
    if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) errors.push(`${path} has more than maxProperties`);
    const properties = schema.properties ?? {};
    for (const key of schema.required ?? []) if (!(key in value)) errors.push(`${path} is missing required property ${key}`);
    for (const key of keys) {
      if (!(key in properties)) {
        if (schema.additionalProperties === false) errors.push(`${path} has unknown property ${key}`);
      } else {
        validate(value[key], properties[key], `${path}.${key}`, errors, rootSchema);
      }
    }
  }
  for (const child of schema.allOf ?? []) validate(value, child, path, errors, rootSchema);
  if (schema.anyOf !== undefined && !schema.anyOf.some((child) => validateToBoolean(value, child, rootSchema))) errors.push(`${path} does not satisfy anyOf`);
  if (schema.oneOf !== undefined && schema.oneOf.filter((child) => validateToBoolean(value, child, rootSchema)).length !== 1) errors.push(`${path} does not satisfy exactly one oneOf branch`);
  if (schema.not !== undefined && validateToBoolean(value, schema.not, rootSchema)) errors.push(`${path} satisfies forbidden schema`);
}

function validateToBoolean(value, schema, rootSchema) {
  const errors = [];
  validate(value, schema, "$", errors, rootSchema);
  return errors.length === 0;
}

function resolveLocalRef(rootSchema, reference) {
  if (reference === "#") return rootSchema;
  if (!reference.startsWith("#/")) throw new SchemaError(`unsupported schema reference ${reference}`);
  let value = rootSchema;
  for (const segment of reference.slice(2).split("/")) {
    const key = segment.replaceAll("~1", "/").replaceAll("~0", "~");
    if (value === null || typeof value !== "object" || !(key in value)) throw new SchemaError(`schema reference does not resolve: ${reference}`);
    value = value[key];
  }
  assertClosedJsonSchema(value);
  return value;
}

function matchesType(value, type) {
  if (type === "null") return value === null;
  if (type === "boolean") return typeof value === "boolean";
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "integer") return typeof value === "number" && Number.isSafeInteger(value);
  if (type === "string") return typeof value === "string";
  if (type === "array") return Array.isArray(value);
  if (type === "object") return isPlainObject(value);
  return false;
}

function validateBoundKeyword(schema, keyword, path) {
  if (schema[keyword] !== undefined && (!Number.isSafeInteger(schema[keyword]) || schema[keyword] < 0)) {
    throw new SchemaError(`${keyword} must be a non-negative safe integer at ${path}`);
  }
}

function matchesFormat(value, format) {
  if (format === "uuid") return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value);
  if (format === "regex") {
    try { new RegExp(value, "u"); return true; } catch { return false; }
  }
  if (format === "date-time") return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value);
  if (format === "uri" || format === "uri-reference") {
    try {
      if (format === "uri-reference" && !/^[\u0000-\u007f]*$/u.test(value)) return false;
      const parsed = new URL(value, format === "uri-reference" ? "https://licoarc.invalid/" : undefined);
      return format === "uri-reference" || Boolean(parsed.protocol);
    } catch { return false; }
  }
  return false;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function deepEqual(left, right) {
  if (Object.is(left, right)) return true;
  if (typeof left !== typeof right || left === null || right === null) return false;
  if (Array.isArray(left)) return Array.isArray(right) && left.length === right.length && left.every((item, index) => deepEqual(item, right[index]));
  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && deepEqual(left[key], right[key]));
  }
  return false;
}

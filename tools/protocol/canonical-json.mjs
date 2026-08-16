/**
 * Restricted JSON and RFC 8785-style canonicalization helpers.
 *
 * Governance documents are intentionally a small JSON profile.  They are
 * parsed with a duplicate-member rejecting parser before canonicalization;
 * JSON.parse alone is not sufficient because it silently keeps the last
 * member of an object with duplicate names.
 */

const DEFAULT_LIMITS = Object.freeze({
  maxBytes: 1_048_576,
  maxDepth: 16,
  maxArrayItems: 64,
  maxObjectMembers: 64,
  maxStringBytes: 4_096
});

export class RestrictedJsonError extends TypeError {
  constructor(message, details = undefined) {
    super(message);
    this.name = "RestrictedJsonError";
    if (details !== undefined) this.details = details;
  }
}

/**
 * Parse a UTF-8 JSON document while rejecting duplicate object names and
 * trailing content.  The returned value only contains JSON data-model values.
 */
export function parseRestrictedJson(input, limits = {}) {
  const options = normalizeLimits(limits);
  const bytes = toUtf8Bytes(input);
  if (bytes.byteLength > options.maxBytes) {
    throw new RestrictedJsonError("JSON document exceeds the byte bound");
  }

  let source;
  try {
    source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    throw new RestrictedJsonError("JSON document is not valid UTF-8", { cause: error });
  }

  const parser = new Parser(source, options);
  const value = parser.parse();
  assertRestrictedJsonValue(value, options);
  return value;
}

/** Canonical JSON text without a trailing line break. */
export function canonicalizeRestrictedJson(value, limits = {}) {
  const options = normalizeLimits(limits);
  assertRestrictedJsonValue(value, options);
  return canonicalize(value, options, 0);
}

/** Canonical JSON UTF-8 bytes without a trailing line break. */
export function canonicalizeRestrictedJsonBytes(value, limits = {}) {
  return new TextEncoder().encode(canonicalizeRestrictedJson(value, limits));
}

/** Parse and canonicalize a JSON document in one fail-closed operation. */
export function parseAndCanonicalizeRestrictedJson(input, limits = {}) {
  const value = parseRestrictedJson(input, limits);
  return {
    value,
    text: canonicalizeRestrictedJson(value, limits),
    bytes: canonicalizeRestrictedJsonBytes(value, limits)
  };
}

export function assertRestrictedJsonValue(value, limits = {}, path = "$", depth = 0) {
  const options = normalizeLimits(limits);
  if (depth > options.maxDepth) {
    throw new RestrictedJsonError(`JSON value exceeds the nesting bound at ${path}`);
  }
  if (value === null || typeof value === "boolean") return;
  if (typeof value === "string") {
    assertUnicodeScalars(value, path);
    if (utf8ByteLength(value) > options.maxStringBytes) {
      throw new RestrictedJsonError(`JSON string exceeds the byte bound at ${path}`);
    }
    return;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RestrictedJsonError(`JSON number is not finite at ${path}`);
    }
    // Restricted governance data never needs an implementation-dependent
    // integer.  Fractional IEEE-754 values remain permitted by JCS, while
    // integral values must be exactly representable.
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw new RestrictedJsonError(`JSON integer is outside the safe range at ${path}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > options.maxArrayItems) {
      throw new RestrictedJsonError(`JSON array exceeds the item bound at ${path}`);
    }
    value.forEach((item, index) =>
      assertRestrictedJsonValue(item, options, `${path}[${index}]`, depth + 1));
    return;
  }
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new RestrictedJsonError(`JSON object has a non-plain prototype at ${path}`);
    }
    const keys = Object.keys(value);
    if (keys.length > options.maxObjectMembers) {
      throw new RestrictedJsonError(`JSON object exceeds the member bound at ${path}`);
    }
    for (const key of keys) {
      assertUnicodeScalars(key, `${path} member name`);
      if (utf8ByteLength(key) > options.maxStringBytes) {
        throw new RestrictedJsonError(`JSON member name exceeds the byte bound at ${path}`);
      }
      assertRestrictedJsonValue(value[key], options, `${path}.${key}`, depth + 1);
    }
    return;
  }
  throw new RestrictedJsonError(`JSON value has an unsupported type at ${path}`);
}

function canonicalize(value, options, depth) {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    // JSON.stringify(-0) is "0", which is the JCS representation of -0.
    const text = Object.is(value, -0) ? "0" : JSON.stringify(value);
    if (text === undefined || text === "null") {
      throw new RestrictedJsonError("JSON number is not canonicalizable");
    }
    return text;
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item, options, depth + 1)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) =>
    `${JSON.stringify(key)}:${canonicalize(value[key], options, depth + 1)}`).join(",")}}`;
}

function normalizeLimits(limits) {
  const options = { ...DEFAULT_LIMITS, ...(limits ?? {}) };
  for (const [name, value] of Object.entries(options)) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new RangeError(`restricted JSON limit ${name} must be a non-negative safe integer`);
    }
  }
  return options;
}

function toUtf8Bytes(input) {
  if (typeof input === "string") {
    assertUnicodeScalars(input, "JSON input");
    return new TextEncoder().encode(input);
  }
  if (input instanceof Uint8Array) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  throw new RestrictedJsonError("JSON input must be a string or byte array");
}

function utf8ByteLength(value) {
  return new TextEncoder().encode(value).byteLength;
}

function assertUnicodeScalars(value, path) {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (Number.isNaN(next) || next < 0xdc00 || next > 0xdfff) {
        throw new RestrictedJsonError(`JSON string contains a lone high surrogate at ${path}`);
      }
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new RestrictedJsonError(`JSON string contains a lone low surrogate at ${path}`);
    }
  }
}

class Parser {
  #source;
  #cursor = 0;
  #options;

  constructor(source, options) {
    this.#source = source;
    this.#options = options;
  }

  parse() {
    this.#skipWhitespace();
    const value = this.#value(0);
    this.#skipWhitespace();
    if (this.#cursor !== this.#source.length) {
      throw this.#error("JSON document contains trailing content");
    }
    return value;
  }

  #value(depth) {
    if (depth > this.#options.maxDepth) {
      throw this.#error("JSON value exceeds the nesting bound");
    }
    this.#skipWhitespace();
    const character = this.#source[this.#cursor];
    if (character === "{") return this.#object(depth + 1);
    if (character === "[") return this.#array(depth + 1);
    if (character === '"') return this.#string();
    if (character === "t") return this.#literal("true", true);
    if (character === "f") return this.#literal("false", false);
    if (character === "n") return this.#literal("null", null);
    if (character === "-" || (character >= "0" && character <= "9")) {
      return this.#number();
    }
    throw this.#error("JSON value is malformed");
  }

  #object(depth) {
    this.#cursor += 1;
    const result = Object.create(null);
    const names = new Set();
    this.#skipWhitespace();
    if (this.#source[this.#cursor] === "}") {
      this.#cursor += 1;
      return result;
    }
    let memberCount = 0;
    while (true) {
      if (++memberCount > this.#options.maxObjectMembers) {
        throw this.#error("JSON object exceeds the member bound");
      }
      this.#skipWhitespace();
      if (this.#source[this.#cursor] !== '"') {
        throw this.#error("JSON object member name is missing");
      }
      const name = this.#string();
      if (names.has(name)) throw this.#error("JSON object contains a duplicate member");
      names.add(name);
      this.#skipWhitespace();
      if (this.#source[this.#cursor] !== ":") {
        throw this.#error("JSON object member is missing a colon");
      }
      this.#cursor += 1;
      result[name] = this.#value(depth);
      this.#skipWhitespace();
      const delimiter = this.#source[this.#cursor];
      if (delimiter === "}") {
        this.#cursor += 1;
        return result;
      }
      if (delimiter !== ",") throw this.#error("JSON object member separator is missing");
      this.#cursor += 1;
    }
  }

  #array(depth) {
    this.#cursor += 1;
    const result = [];
    this.#skipWhitespace();
    if (this.#source[this.#cursor] === "]") {
      this.#cursor += 1;
      return result;
    }
    while (true) {
      if (result.length >= this.#options.maxArrayItems) {
        throw this.#error("JSON array exceeds the item bound");
      }
      result.push(this.#value(depth));
      this.#skipWhitespace();
      const delimiter = this.#source[this.#cursor];
      if (delimiter === "]") {
        this.#cursor += 1;
        return result;
      }
      if (delimiter !== ",") throw this.#error("JSON array item separator is missing");
      this.#cursor += 1;
    }
  }

  #string() {
    const start = this.#cursor;
    this.#cursor += 1;
    while (this.#cursor < this.#source.length) {
      const character = this.#source[this.#cursor];
      if (character === "\\") {
        this.#cursor += 2;
        continue;
      }
      if (character === '"') {
        this.#cursor += 1;
        let value;
        try {
          value = JSON.parse(this.#source.slice(start, this.#cursor));
        } catch (error) {
          throw this.#error("JSON string escape is malformed", error);
        }
        assertUnicodeScalars(value, "JSON string");
        if (utf8ByteLength(value) > this.#options.maxStringBytes) {
          throw this.#error("JSON string exceeds the byte bound");
        }
        return value;
      }
      if (character.charCodeAt(0) < 0x20) throw this.#error("JSON string contains a control character");
      this.#cursor += 1;
    }
    throw this.#error("JSON string is unterminated");
  }

  #number() {
    const start = this.#cursor;
    if (this.#source[this.#cursor] === "-") this.#cursor += 1;
    if (this.#source[this.#cursor] === "0") {
      this.#cursor += 1;
      if (this.#source[this.#cursor] >= "0" && this.#source[this.#cursor] <= "9") {
        throw this.#error("JSON number has a leading zero");
      }
    } else {
      if (this.#source[this.#cursor] < "1" || this.#source[this.#cursor] > "9") {
        throw this.#error("JSON number integer part is malformed");
      }
      while (this.#source[this.#cursor] >= "0" && this.#source[this.#cursor] <= "9") this.#cursor += 1;
    }
    if (this.#source[this.#cursor] === ".") {
      this.#cursor += 1;
      if (this.#source[this.#cursor] < "0" || this.#source[this.#cursor] > "9") {
        throw this.#error("JSON number fraction is malformed");
      }
      while (this.#source[this.#cursor] >= "0" && this.#source[this.#cursor] <= "9") this.#cursor += 1;
    }
    if (this.#source[this.#cursor] === "e" || this.#source[this.#cursor] === "E") {
      this.#cursor += 1;
      if (this.#source[this.#cursor] === "+" || this.#source[this.#cursor] === "-") this.#cursor += 1;
      if (this.#source[this.#cursor] < "0" || this.#source[this.#cursor] > "9") {
        throw this.#error("JSON number exponent is malformed");
      }
      while (this.#source[this.#cursor] >= "0" && this.#source[this.#cursor] <= "9") this.#cursor += 1;
    }
    const text = this.#source.slice(start, this.#cursor);
    const value = Number(text);
    if (!Number.isFinite(value)) throw this.#error("JSON number is not finite");
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw this.#error("JSON integer is outside the safe range");
    }
    return value;
  }

  #literal(text, value) {
    if (this.#source.slice(this.#cursor, this.#cursor + text.length) !== text) {
      throw this.#error("JSON literal is malformed");
    }
    this.#cursor += text.length;
    return value;
  }

  #skipWhitespace() {
    while (this.#cursor < this.#source.length && /[\u0020\u0009\u000a\u000d]/u.test(this.#source[this.#cursor])) {
      this.#cursor += 1;
    }
  }

  #error(message, cause = undefined) {
    const error = new RestrictedJsonError(`${message} at byte ${this.#cursor}`);
    if (cause !== undefined) error.cause = cause;
    return error;
  }
}

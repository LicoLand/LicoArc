/**
 * Closed deterministic CBOR subset used by Endpoint runtime sources.
 *
 * The subset deliberately supports unsigned integer map labels, integer
 * values, text, raw byte strings, arrays, maps, booleans, and null.  Tags,
 * floating point values, indefinite lengths, and non-integer map labels are
 * not part of the Protocol-Line foundation.
 */

const DEFAULT_LIMITS = Object.freeze({
  maxBytes: 1_048_576,
  maxDepth: 16,
  maxArrayItems: 64,
  maxMapEntries: 64,
  maxRawBytes: 262_144,
  maxTextBytes: 4_096,
  maxInteger: Number.MAX_SAFE_INTEGER
});

export class DeterministicCborError extends TypeError {
  constructor(message, details = undefined) {
    super(message);
    this.name = "DeterministicCborError";
    if (details !== undefined) this.details = details;
  }
}

export function encodeDeterministicCbor(value, limits = {}) {
  const options = normalizeLimits(limits);
  const bytes = encodeValue(value, options, 0, "$", false);
  if (bytes.byteLength > options.maxBytes) {
    throw new DeterministicCborError("CBOR document exceeds the byte bound");
  }
  return bytes;
}

/**
 * Decode exactly one deterministic CBOR item.  The input must be a complete
 * byte string; a valid prefix followed by another item is rejected.
 */
export function decodeDeterministicCbor(input, limits = {}) {
  const options = normalizeLimits(limits);
  const bytes = toBytes(input);
  if (bytes.byteLength > options.maxBytes) {
    throw new DeterministicCborError("CBOR document exceeds the byte bound");
  }
  const reader = new Reader(bytes, options);
  const value = reader.value(0, "$", false);
  if (!reader.atEnd()) throw new DeterministicCborError("CBOR document contains trailing bytes");
  // Re-encoding is a compact, independent canonicality check for map order
  // and for all shortest integer/length forms.
  const canonical = encodeDeterministicCbor(value, options);
  if (!bytesEqual(bytes, canonical)) {
    throw new DeterministicCborError("CBOR document is not deterministic");
  }
  return value;
}

export function cborBytesToHex(value) {
  return Buffer.from(toBytes(value)).toString("hex");
}

function encodeValue(value, options, depth, path, inMapKey) {
  if (depth > options.maxDepth) throw new DeterministicCborError(`CBOR value exceeds the nesting bound at ${path}`);
  if (value === null) return Uint8Array.of(0xf6);
  if (value === false) return Uint8Array.of(0xf4);
  if (value === true) return Uint8Array.of(0xf5);
  if (typeof value === "number" || typeof value === "bigint") {
    const integer = normalizeInteger(value, options, path);
    if (integer >= 0n) return encodeUnsigned(integer, 0);
    return encodeUnsigned(-1n - integer, 1);
  }
  if (typeof value === "string") {
    if (inMapKey) throw new DeterministicCborError(`CBOR map labels must be unsigned integers at ${path}`);
    assertUnicodeScalars(value, path);
    const bytes = new TextEncoder().encode(value);
    if (bytes.byteLength > options.maxTextBytes) throw new DeterministicCborError(`CBOR text exceeds the byte bound at ${path}`);
    return concat(encodeLength(3, bytes.byteLength), bytes);
  }
  if (isBytes(value)) {
    if (inMapKey) throw new DeterministicCborError(`CBOR map labels must be unsigned integers at ${path}`);
    const bytes = toBytes(value);
    if (bytes.byteLength > options.maxRawBytes) throw new DeterministicCborError(`CBOR raw bytes exceed the bound at ${path}`);
    return concat(encodeLength(2, bytes.byteLength), bytes);
  }
  if (Array.isArray(value)) {
    if (inMapKey) throw new DeterministicCborError(`CBOR map labels must be unsigned integers at ${path}`);
    if (value.length > options.maxArrayItems) throw new DeterministicCborError(`CBOR array exceeds the item bound at ${path}`);
    return concat(
      encodeLength(4, value.length),
      ...value.map((item, index) => encodeValue(item, options, depth + 1, `${path}[${index}]`, false))
    );
  }
  if (value instanceof Map || isPlainObject(value)) {
    if (inMapKey) throw new DeterministicCborError(`CBOR map labels must be unsigned integers at ${path}`);
    const entries = value instanceof Map ? [...value.entries()] : objectEntries(value, path);
    if (entries.length > options.maxMapEntries) throw new DeterministicCborError(`CBOR map exceeds the entry bound at ${path}`);
    const encoded = entries.map(([key, item], index) => {
      const label = normalizeUnsignedLabel(key, options, `${path}.<label:${index}>`);
      const keyBytes = encodeUnsigned(label, 0);
      const valueBytes = encodeValue(item, options, depth + 1, `${path}.${label.toString()}`, false);
      return { label, keyBytes, valueBytes };
    });
    encoded.sort((left, right) => compareBytes(left.keyBytes, right.keyBytes));
    for (let index = 1; index < encoded.length; index += 1) {
      if (bytesEqual(encoded[index - 1].keyBytes, encoded[index].keyBytes)) {
        throw new DeterministicCborError(`CBOR map contains a duplicate label at ${path}`);
      }
    }
    return concat(
      encodeLength(5, encoded.length),
      ...encoded.flatMap(({ keyBytes, valueBytes }) => [keyBytes, valueBytes])
    );
  }
  throw new DeterministicCborError(`CBOR value has an unsupported type at ${path}`);
}

function normalizeInteger(value, options, path) {
  let integer;
  if (typeof value === "bigint") {
    integer = value;
  } else {
    if (!Number.isSafeInteger(value)) throw new DeterministicCborError(`CBOR integer is not a safe integer at ${path}`);
    integer = BigInt(value);
  }
  if (integer > BigInt(options.maxInteger) || integer < -BigInt(options.maxInteger)) {
    throw new DeterministicCborError(`CBOR integer exceeds the bound at ${path}`);
  }
  return integer;
}

function normalizeUnsignedLabel(value, options, path) {
  const integer = normalizeInteger(value, options, path);
  if (integer < 0n) throw new DeterministicCborError(`CBOR map label must be unsigned at ${path}`);
  return integer;
}

function encodeUnsigned(value, major) {
  return encodeLength(major, value);
}

function encodeLength(major, length) {
  const number = typeof length === "bigint" ? length : BigInt(length);
  if (number < 0n || number > 0xffffffffffffffffn) throw new DeterministicCborError("CBOR length is outside the uint64 range");
  const prefix = major << 5;
  if (number <= 23n) return Uint8Array.of(prefix | Number(number));
  if (number <= 0xffn) return Uint8Array.of(prefix | 24, Number(number));
  if (number <= 0xffffn) return Uint8Array.of(prefix | 25, Number(number >> 8n), Number(number & 0xffn));
  if (number <= 0xffffffffn) return Uint8Array.of(
    prefix | 26,
    Number((number >> 24n) & 0xffn), Number((number >> 16n) & 0xffn),
    Number((number >> 8n) & 0xffn), Number(number & 0xffn)
  );
  const bytes = new Uint8Array(9);
  bytes[0] = prefix | 27;
  let remaining = number;
  for (let index = 8; index >= 1; index -= 1) {
    bytes[index] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  return bytes;
}

class Reader {
  #bytes;
  #cursor = 0;
  #options;

  constructor(bytes, options) {
    this.#bytes = bytes;
    this.#options = options;
  }

  atEnd() {
    return this.#cursor === this.#bytes.byteLength;
  }

  value(depth, path, inMapKey) {
    if (depth > this.#options.maxDepth) throw this.error("CBOR value exceeds the nesting bound", path);
    const initial = this.readByte(path);
    const major = initial >> 5;
    const additional = initial & 0x1f;
    if (additional === 31) throw this.error("indefinite-length CBOR is forbidden", path);
    if (major === 0) return this.readArgument(additional, path);
    if (major === 1) {
      const value = -1 - this.readArgument(additional, path);
      if (!Number.isSafeInteger(value) || value < -this.#options.maxInteger) throw this.error("CBOR integer exceeds the bound", path);
      return value;
    }
    if (major === 2) {
      const length = this.readLength(additional, path);
      if (length > this.#options.maxRawBytes) throw this.error("CBOR raw bytes exceed the bound", path);
      const bytes = this.readBytes(length, path);
      return new Uint8Array(bytes);
    }
    if (major === 3) {
      const length = this.readLength(additional, path);
      if (length > this.#options.maxTextBytes) throw this.error("CBOR text exceeds the bound", path);
      const bytes = this.readBytes(length, path);
      let text;
      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      } catch (error) {
        throw this.error("CBOR text is not valid UTF-8", path, error);
      }
      assertUnicodeScalars(text, path);
      return text;
    }
    if (major === 4) {
      const length = this.readLength(additional, path);
      if (length > this.#options.maxArrayItems) throw this.error("CBOR array exceeds the item bound", path);
      const result = [];
      for (let index = 0; index < length; index += 1) result.push(this.value(depth + 1, `${path}[${index}]`, false));
      return result;
    }
    if (major === 5) {
      const length = this.readLength(additional, path);
      if (length > this.#options.maxMapEntries) throw this.error("CBOR map exceeds the entry bound", path);
      const result = {};
      const labels = new Set();
      let previousKey;
      for (let index = 0; index < length; index += 1) {
        const keyStart = this.#cursor;
        const label = this.value(depth + 1, `${path}.<label:${index}>`, true);
        const keyBytes = this.#bytes.slice(keyStart, this.#cursor);
        if (typeof label !== "number" || !Number.isSafeInteger(label) || label < 0) {
          throw this.error("CBOR map label must be an unsigned integer", path);
        }
        if (labels.has(label)) throw this.error("CBOR map contains a duplicate label", path);
        if (previousKey !== undefined && compareBytes(previousKey, keyBytes) >= 0) {
          throw this.error("CBOR map labels are not in deterministic order", path);
        }
        labels.add(label);
        previousKey = keyBytes;
        result[String(label)] = this.value(depth + 1, `${path}.${label}`, false);
      }
      return result;
    }
    if (major === 6) throw this.error("CBOR tags are outside the closed runtime profile", path);
    if (major === 7) {
      if (additional === 20) return false;
      if (additional === 21) return true;
      if (additional === 22) return null;
      throw this.error("CBOR simple or floating-point values are outside the closed runtime profile", path);
    }
    throw this.error("CBOR major type is unsupported", path);
  }

  readArgument(additional, path) {
    const value = this.readLength(additional, path);
    if (value > BigInt(this.#options.maxInteger)) throw this.error("CBOR integer exceeds the bound", path);
    return Number(value);
  }

  readLength(additional, path) {
    if (additional <= 23) return BigInt(additional);
    if (additional === 24) {
      const value = BigInt(this.readByte(path));
      if (value < 24n) throw this.error("CBOR integer or length is not shortest", path);
      return value;
    }
    if (additional === 25) {
      const value = BigInt(this.readByte(path)) << 8n | BigInt(this.readByte(path));
      if (value <= 0xffn) throw this.error("CBOR integer or length is not shortest", path);
      return value;
    }
    if (additional === 26) {
      let value = 0n;
      for (let index = 0; index < 4; index += 1) value = (value << 8n) | BigInt(this.readByte(path));
      if (value <= 0xffffn) throw this.error("CBOR integer or length is not shortest", path);
      return value;
    }
    if (additional === 27) {
      let value = 0n;
      for (let index = 0; index < 8; index += 1) value = (value << 8n) | BigInt(this.readByte(path));
      if (value <= 0xffffffffn) throw this.error("CBOR integer or length is not shortest", path);
      if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw this.error("CBOR integer or length exceeds safe range", path);
      return value;
    }
    throw this.error("CBOR additional information is unsupported", path);
  }

  readByte(path) {
    if (this.#cursor >= this.#bytes.byteLength) throw this.error("CBOR document ends unexpectedly", path);
    return this.#bytes[this.#cursor++];
  }

  readBytes(length, path) {
    const count = Number(length);
    if (this.#cursor + count > this.#bytes.byteLength) throw this.error("CBOR value exceeds available bytes", path);
    const result = this.#bytes.slice(this.#cursor, this.#cursor + count);
    this.#cursor += count;
    return result;
  }

  error(message, path, cause = undefined) {
    const error = new DeterministicCborError(`${message} at ${path}`);
    if (cause !== undefined) error.cause = cause;
    return error;
  }
}

function objectEntries(value, path) {
  return Object.keys(value).map((key) => {
    if (!/^(?:0|[1-9][0-9]*)$/u.test(key)) {
      throw new DeterministicCborError(`CBOR map label must be an unsigned integer at ${path}`);
    }
    return [Number(key), value[key]];
  });
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || isBytes(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isBytes(value) {
  return value instanceof Uint8Array || value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}

function toBytes(input) {
  if (input instanceof Uint8Array) return new Uint8Array(input);
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  throw new DeterministicCborError("CBOR input must be a byte array");
}

function normalizeLimits(limits) {
  const options = { ...DEFAULT_LIMITS, ...(limits ?? {}) };
  for (const [name, value] of Object.entries(options)) {
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`CBOR limit ${name} must be a non-negative safe integer`);
  }
  return options;
}

function assertUnicodeScalars(value, path) {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (Number.isNaN(next) || next < 0xdc00 || next > 0xdfff) throw new DeterministicCborError(`CBOR text contains a lone high surrogate at ${path}`);
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new DeterministicCborError(`CBOR text contains a lone low surrogate at ${path}`);
    }
  }
}

function concat(...parts) {
  const size = parts.reduce((total, part) => total + part.byteLength, 0);
  const result = new Uint8Array(size);
  let cursor = 0;
  for (const part of parts) {
    result.set(part, cursor);
    cursor += part.byteLength;
  }
  return result;
}

function compareBytes(left, right) {
  const length = Math.min(left.byteLength, right.byteLength);
  for (let index = 0; index < length; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.byteLength - right.byteLength;
}

function bytesEqual(left, right) {
  return left.byteLength === right.byteLength && compareBytes(left, right) === 0;
}

const SQLITE_HEADER = [83, 81, 76, 105, 116, 101, 32, 102, 111, 114, 109, 97, 116, 32, 51, 0];

type SqliteValue = null | number | string | Uint8Array;

interface TableRecord {
  readonly rowid: number;
  readonly values: readonly SqliteValue[];
}

export interface LegacyVerseRow {
  readonly bookId: number;
  readonly chapter: number;
  readonly verse: number;
  readonly text: string;
}

export interface LegacySqliteBible {
  readonly name: string;
  readonly books: readonly number[];
  readonly verses: readonly LegacyVerseRow[];
}

interface SchemaTable {
  readonly name: string;
  readonly rootPage: number;
}

export type NativeParseErrorCode = "invalid_package" | "unsupported_schema";

export interface NativeParseError {
  readonly code: NativeParseErrorCode;
  readonly message: string;
}

/** @param {string} message @returns {never} */
function invalid(message: string): never {
  throw { code: "unsupported_schema", message } satisfies NativeParseError;
}

/** @param {Uint8Array} bytes @param {number} offset @returns {number} */
function readU16(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

/** @param {Uint8Array} bytes @param {number} offset @returns {number} */
function readU32(bytes: Uint8Array, offset: number): number {
  return bytes[offset] * 0x1000000 +
    bytes[offset + 1] * 0x10000 +
    bytes[offset + 2] * 0x100 +
    bytes[offset + 3];
}

/** @param {Uint8Array} bytes @param {number} offset @returns {{ value: number, next: number }} */
function readVarint(bytes: Uint8Array, offset: number): { readonly value: number; readonly next: number } {
  let value = 0;
  let cursor = offset;
  for (let index = 0; index < 9; index += 1) {
    if (cursor >= bytes.length) invalid("Invalid SQLite varint");
    const byte = bytes[cursor];
    cursor += 1;
    if (index === 8) return { value: value * 256 + byte, next: cursor };
    value = value * 128 + (byte & 0x7f);
    if ((byte & 0x80) === 0) return { value, next: cursor };
  }
  invalid("Invalid SQLite varint");
}

/** @param {Uint8Array} bytes @param {number} offset @param {number} length @returns {number} */
function readSignedInteger(bytes: Uint8Array, offset: number, length: number): number {
  let value = 0;
  for (let index = 0; index < length; index += 1) value = value * 256 + bytes[offset + index];
  const sign = 2 ** (length * 8 - 1);
  return value >= sign ? value - 2 ** (length * 8) : value;
}

/** @param {Uint8Array} payload @returns {(null | number | string | Uint8Array)[]} */
function decodeRecord(payload: Uint8Array): readonly SqliteValue[] {
  const header = readVarint(payload, 0);
  if (header.value < 1 || header.value > payload.length) invalid("Invalid SQLite record header");
  /** @type {number[]} */
  const serialTypes: number[] = [];
  let cursor = header.next;
  while (cursor < header.value) {
    const serial = readVarint(payload, cursor);
    serialTypes.push(serial.value);
    cursor = serial.next;
  }
  if (cursor !== header.value) invalid("Invalid SQLite record header length");

  /** @type {(null | number | string | Uint8Array)[]} */
  const values: SqliteValue[] = [];
  let dataOffset = header.value;
  for (const serial of serialTypes) {
    if (serial === 0) {
      values.push(null);
      continue;
    }
    if (serial === 1 || serial === 2 || serial === 3 || serial === 4 || serial === 5 || serial === 6) {
      const length = serial === 1 ? 1 : serial === 2 ? 2 : serial === 3 ? 3 : serial === 4 ? 4 : serial === 5 ? 6 : 8;
      if (dataOffset + length > payload.length) invalid("Invalid SQLite integer field");
      values.push(readSignedInteger(payload, dataOffset, length));
      dataOffset += length;
      continue;
    }
    if (serial === 7) {
      if (dataOffset + 8 > payload.length) invalid("Invalid SQLite float field");
      values.push(new DataView(payload.buffer, payload.byteOffset + dataOffset, 8).getFloat64(0, false));
      dataOffset += 8;
      continue;
    }
    if (serial === 8 || serial === 9) {
      values.push(serial === 8 ? 0 : 1);
      continue;
    }
    if (serial < 12) invalid("Unsupported SQLite serial type");
    const length = serial % 2 === 0 ? (serial - 12) / 2 : (serial - 13) / 2;
    if (length < 0 || dataOffset + length > payload.length) invalid("Invalid SQLite text field");
    const field = payload.slice(dataOffset, dataOffset + length);
    values.push(serial % 2 === 0 ? field : new TextDecoder().decode(field));
    dataOffset += length;
  }
  return values;
}

/**
 * @param {Uint8Array} bytes
 * @param {number} pageSize
 * @param {number} rootPage
 * @returns {{ rowid: number, values: (null | number | string | Uint8Array)[] }[]}
 */
function tableRecords(bytes: Uint8Array, pageSize: number, rootPage: number): readonly TableRecord[] {
  /** @type {{ rowid: number, values: (null | number | string | Uint8Array)[] }[]} */
  const records: TableRecord[] = [];
  /** @type {Set<number>} */
  const visited = new Set<number>();

  /** @param {number} page @returns {void} */
  function visit(page: number): void {
    if (page < 1 || page > Math.floor(bytes.length / pageSize) || visited.has(page)) invalid("Invalid SQLite b-tree page");
    visited.add(page);
    const pageStart = (page - 1) * pageSize;
    const headerStart = page === 1 ? pageStart + 100 : pageStart;
    const pageType = bytes[headerStart];
    if (pageType !== 0x0d && pageType !== 0x05) invalid("Unsupported SQLite table b-tree");
    const cellCount = readU16(bytes, headerStart + 3);
    const pointerStart = headerStart + (pageType === 0x0d ? 8 : 12);
    for (let index = 0; index < cellCount; index += 1) {
      const pointer = readU16(bytes, pointerStart + index * 2);
      const cell = pageStart + pointer;
      if (cell < headerStart || cell >= pageStart + pageSize) invalid("Invalid SQLite cell pointer");
      if (pageType === 0x05) {
        visit(readU32(bytes, cell));
        readVarint(bytes, cell + 4);
        continue;
      }
      const payloadLength = readVarint(bytes, cell);
      const rowid = readVarint(bytes, payloadLength.next);
      const payloadStart = rowid.next;
      const payloadEnd = payloadStart + payloadLength.value;
      if (payloadEnd > pageStart + pageSize) invalid("SQLite overflow cells are not supported");
      records.push({ rowid: rowid.value, values: decodeRecord(bytes.slice(payloadStart, payloadEnd)) });
    }
    if (pageType === 0x05) visit(readU32(bytes, headerStart + 8));
  }

  visit(rootPage);
  return records;
}

/** @param {null | number | string | Uint8Array | undefined} value @param {string} field @returns {string} */
function asText(value: SqliteValue | undefined, field: string): string {
  if (typeof value !== "string") invalid(`Legacy SQLite ${field} must be TEXT`);
  return value;
}

/** @param {null | number | string | Uint8Array | undefined} value @param {string} field @returns {number} */
function asNumber(value: SqliteValue | undefined, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) invalid(`Legacy SQLite ${field} must be an integer`);
  return value;
}

/** @param {Uint8Array} bytes @returns {boolean} */
function hasHeader(bytes: Uint8Array): boolean {
  if (bytes.length < SQLITE_HEADER.length) return false;
  for (let index = 0; index < SQLITE_HEADER.length; index += 1) if (bytes[index] !== SQLITE_HEADER[index]) return false;
  return true;
}

/** @param {Uint8Array} bytes @param {number} pageSize @returns {{ name: string, rootPage: number }[]} */
function schemaTables(bytes: Uint8Array, pageSize: number): readonly SchemaTable[] {
  return tableRecords(bytes, pageSize, 1).flatMap((record) => {
    if (record.values.length < 5 || record.values[0] !== "table") return [];
    return [{ name: asText(record.values[1], "table name"), rootPage: asNumber(record.values[3], "root page") }];
  });
}

/** @param {{ name: string, rootPage: number }[]} tables @param {string} name @returns {number} */
function tableRoot(tables: readonly SchemaTable[], name: string): number {
  const table = tables.find((candidate) => candidate.name === name);
  if (!table) invalid(`Unsupported schema: missing table '${name}'`);
  return table.rootPage;
}

/**
 * @param {Uint8Array} bytes
 * @param {string} expectedVersionId
 * @returns {{ name: string, books: number[], verses: { bookId: number, chapter: number, verse: number, text: string }[] }}
 */
export function inspectLegacySqlite(bytes: Uint8Array, expectedVersionId: string): LegacySqliteBible {
  if (!hasHeader(bytes)) throw { code: "invalid_package", message: "Invalid package: not a SQLite database" } satisfies NativeParseError;
  if (bytes.length < 100) invalid("Invalid SQLite database header");
  const rawPageSize = readU16(bytes, 16);
  const pageSize = rawPageSize === 1 ? 65536 : rawPageSize;
  if (pageSize < 512 || pageSize > 65536 || (pageSize & (pageSize - 1)) !== 0) invalid("Invalid SQLite page size");
  if (bytes.length < pageSize) invalid("Invalid SQLite database size");

  const tables = schemaTables(bytes, pageSize);
  const metadata = tableRecords(bytes, pageSize, tableRoot(tables, "metadata"));
  const books = tableRecords(bytes, pageSize, tableRoot(tables, "book"));
  const verses = tableRecords(bytes, pageSize, tableRoot(tables, "verse"));
  if (books.length === 0) invalid("Unsupported schema: empty book table");
  if (verses.length === 0) invalid("Unsupported schema: empty verse table");

  /** @type {string | undefined} */
  let name: string | undefined;
  for (const record of metadata) {
    const key = asText(record.values[0], "metadata key");
    const value = asText(record.values[1], "metadata value");
    if (key === "name") name = value;
    if ((key === "versionId" || key === "id") && value !== expectedVersionId) {
      throw { code: "invalid_package", message: `Invalid package: versionId mismatch expected ${expectedVersionId}` } satisfies NativeParseError;
    }
  }

  const bookIds = books.map((record) => asNumber(record.values[0] ?? record.rowid, "book id"));
  const verseRows = verses.map((record) => {
    // SQLite omits an INTEGER PRIMARY KEY from the record payload. Published
    // R2 files therefore start with NULL for the omitted verse id, while the
    // synthetic fixture starts directly with book_id.
    const bookIdIndex = record.values[0] === null ? 1 : 0;
    return {
      bookId: asNumber(record.values[bookIdIndex], "verse book_id"),
      chapter: asNumber(record.values[bookIdIndex + 1], "verse chapter"),
      verse: asNumber(record.values[bookIdIndex + 2], "verse number"),
      text: asText(record.values[bookIdIndex + 3], "verse text"),
    };
  });
  return { name: name ?? expectedVersionId, books: bookIds, verses: verseRows };
}

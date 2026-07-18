// Shared request-input validation helpers.
// Centralizes the id/pagination/date parsing every controller needs, so a
// malformed value (non-numeric id, page=0, an invalid date string, ...) is
// rejected with a clean 400 before it ever reaches Prisma — instead of each
// controller independently doing `parseInt(x)` and letting Prisma throw an
// unhandled exception that leaks internal file paths in its error message.

// Every id column in schema.prisma is Prisma `Int` (Postgres 32-bit integer),
// so anything beyond this is guaranteed invalid regardless of precision.
const POSTGRES_INT4_MAX = 2147483647;

// Returns a positive integer within Postgres int4 range, or null if `value`
// isn't one (rejects NaN, zero, negatives, non-numeric strings like "abc",
// and values too large to be a real id — e.g. a 20-digit number, which
// Number.isInteger() alone would otherwise accept since JS doesn't have an
// intrinsic upper bound on "integer-valued" doubles).
const parsePositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= POSTGRES_INT4_MAX ? n : null;
};

// Clamps page/limit from req.query into safe bounds; never throws, never
// produces NaN/negative/zero skip or take values.
const parsePagination = (query, { defaultLimit = 20, maxLimit = 100 } = {}) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = defaultLimit;
  limit = Math.min(limit, maxLimit);

  return { page, limit, skip: (page - 1) * limit };
};

// Returns a Date, or null if `value` is a non-empty but unparseable date
// string. Returns undefined if `value` is falsy (field not provided).
const parseOptionalDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

module.exports = { parsePositiveInt, parsePagination, parseOptionalDate };

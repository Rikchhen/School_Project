/**
 * Small helpers for consistent, safe pagination across list endpoints.
 */
export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPageParams(
  query: { page?: unknown; limit?: unknown },
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): PageParams {
  const { page: dp = 1, limit: dl = 10, maxLimit = 100 } = defaults;

  const page = Math.max(1, Number.parseInt(String(query.page ?? dp), 10) || dp);
  const rawLimit = Number.parseInt(String(query.limit ?? dl), 10) || dl;
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);

  return { page, limit, skip: (page - 1) * limit };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function buildPaginated<T>(
  items: T[],
  total: number,
  { page, limit }: PageParams
): Paginated<T> {
  return {
    items,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

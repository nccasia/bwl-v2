export const QUERY_KEYS = {
  DEMO: {
    getKey: () => ["demo"],
    invalidate: () => ["demo"],
  },
  DEMO_LIST:  {
    getKey: (params?: Record<string, unknown>) => ["demo", "list", params],
    invalidate: () => ["demo", "list"],
  },
  DEMO_ITEM: {
    getKey: (id: string | null) => ["demo", "item", id],
    invalidate: () => ["demo", "item"],
  },
}

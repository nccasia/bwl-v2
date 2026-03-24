import type {
  CreateDemoInput,
  DemoItem,
  DemoListResponse,
  DemoQueryParams,
  UpdateDemoInput,
} from '@/types/home/demo';

const MOCK_DATA: DemoItem[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', status: 'active', createdAt: '2024-01-16' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', status: 'inactive', createdAt: '2024-01-17' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', status: 'active', createdAt: '2024-01-18' },
  { id: '5', name: 'Edward Norton', email: 'edward@example.com', status: 'inactive', createdAt: '2024-01-19' },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const demoService = {
  getList: async (params: DemoQueryParams = {}): Promise<DemoListResponse> => {
    await delay(500);

    let filtered = [...MOCK_DATA];

    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.email.toLowerCase().includes(search)
      );
    }

    if (params.status) {
      filtered = filtered.filter((item) => item.status === params.status);
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
    };
  },

  getById: async (id: string): Promise<DemoItem | null> => {
    await delay(300);
    return MOCK_DATA.find((item) => item.id === id) ?? null;
  },

  create: async (data: CreateDemoInput): Promise<DemoItem> => {
    await delay(500);
    const newItem: DemoItem = {
      id: String(Date.now()),
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };
    MOCK_DATA.push(newItem);
    return newItem;
  },

  update: async (data: UpdateDemoInput): Promise<DemoItem> => {
    await delay(500);
    const index = MOCK_DATA.findIndex((item) => item.id === data.id);
    if (index === -1) throw new Error('Item not found');

    MOCK_DATA[index] = { ...MOCK_DATA[index], ...data };
    return MOCK_DATA[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = MOCK_DATA.findIndex((item) => item.id === id);
    if (index !== -1) MOCK_DATA.splice(index, 1);
  },
};

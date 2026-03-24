export interface DemoItem {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface DemoQueryParams {
  search?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface DemoListResponse {
  data: DemoItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateDemoInput {
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface UpdateDemoInput extends Partial<CreateDemoInput> {
  id: string;
}

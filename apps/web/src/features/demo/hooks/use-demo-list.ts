import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { demoService } from '@/services/demo/demo-service';
import type { DemoQueryParams, CreateDemoInput, UpdateDemoInput } from '../types/demo';

export function useDemoList(params: DemoQueryParams = {}) {
  return useQuery({
    queryKey: ['demo', 'list', params],
    queryFn: () => demoService.getList(params),
  });
}

export function useDemoItem(id: string | null) {
  return useQuery({
    queryKey: ['demo', 'item', id],
    queryFn: () => demoService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDemoInput) => demoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo'] });
    },
  });
}

export function useUpdateDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDemoInput) => demoService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo'] });
    },
  });
}

export function useDeleteDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => demoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo'] });
    },
  });
}

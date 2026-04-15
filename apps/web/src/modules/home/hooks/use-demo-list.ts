import { QUERY_KEYS } from '@/constants/query-key';
import { useToast } from '@/modules/shared/hooks/toast';
import { demoService } from '@/services/home/demo-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateDemoInput, DemoQueryParams, UpdateDemoInput } from '../../../types/home/demo';

export function useDemoList(params: DemoQueryParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.DEMO_LIST.getKey(params as Record<string, unknown>),
    queryFn: () => demoService.getList(params),
  });
}

export function useDemoItem(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.DEMO_ITEM.getKey(id),
    queryFn: () => demoService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateDemo() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateDemoInput) => demoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEMO.getKey() });
      toast.success('Demo created successfully', {
        description: 'The demo has been created successfully',
      });
    },
    onError: () => {
      toast.error('Failed to create demo');
    },
  });
}

export function useUpdateDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDemoInput) => demoService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEMO.getKey() });
    },
  });
}

export function useDeleteDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => demoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEMO.getKey() });
    },
  });
}

'use client';

import { useDemoUIStore } from '@/stores/home/demo-store';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createDemoSchema, updateDemoSchema } from '../../../schemas/home/demo-schema';
import { useCreateDemo, useDemoItem, useUpdateDemo } from '../hooks/use-demo-list';

type CreateDemoFormData = {
  name: string;
  email: string;
  status: 'active' | 'inactive';
};

type UpdateDemoFormData = CreateDemoFormData & { id: string };

export function DemoForm() {
  const { isFormOpen, formMode, selectedId, closeForm } = useDemoUIStore();
  const { data: item } = useDemoItem(selectedId);
  const createDemo = useCreateDemo();
  const updateDemo = useUpdateDemo();

  const form = useForm<CreateDemoFormData | UpdateDemoFormData>({
    resolver: valibotResolver(formMode === 'create' ? createDemoSchema : updateDemoSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (formMode === 'edit' && item) {
      form.reset({ id: item.id, name: item.name, email: item.email, status: item.status });
    } else if (formMode === 'create') {
      form.reset({ name: '', email: '', status: 'active' });
    }
  }, [formMode, item, form]);

  const onSubmit = (data: CreateDemoFormData | UpdateDemoFormData) => {
    if (formMode === 'create') {
      createDemo.mutate(data as CreateDemoFormData, { onSuccess: closeForm });
    } else {
      updateDemo.mutate(data as UpdateDemoFormData, { onSuccess: closeForm });
    }
  };

  if (!isFormOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {formMode === 'create' ? 'Create Demo Item' : 'Edit Demo Item'}
        </h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              {...form.register('name')}
              className="w-full border p-2 rounded"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">{String(form.formState.errors.name.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...form.register('email')}
              className="w-full border p-2 rounded"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">{String(form.formState.errors.email.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              {...form.register('status')}
              className="w-full border p-2 rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDemo.isPending || updateDemo.isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {formMode === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

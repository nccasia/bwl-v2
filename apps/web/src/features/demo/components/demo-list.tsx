'use client';

import { useDemoList, useDeleteDemo } from '../hooks/use-demo-list';
import { useDemoUIStore } from '@/stores/demo/demo-store';

export function DemoList() {
  const { data, isLoading, error } = useDemoList();
  const deleteDemo = useDeleteDemo();
  const { openForm, setSearchQuery, searchQuery } = useDemoUIStore();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading data</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={() => openForm('create')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New
        </button>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Created</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.email}</td>
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    item.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="border p-2">{item.createdAt}</td>
              <td className="border p-2">
                <button
                  onClick={() => openForm('edit', item.id)}
                  className="text-blue-500 hover:underline mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteDemo.mutate(item.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

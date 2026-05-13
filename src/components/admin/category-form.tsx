import { createCategory, updateCategory } from "@/lib/admin/actions";
import type { CategoryRecord } from "@/lib/admin/data";

type CategoryFormProps = {
  category?: CategoryRecord;
  submitLabel: string;
};

export function CategoryForm({ category, submitLabel }: CategoryFormProps) {
  const action = category ? updateCategory.bind(null, category.id) : createCategory;

  return (
    <form action={action} className="space-y-3">
      <label className="block text-sm font-medium text-stone-700">
        Name
        <input
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          defaultValue={category?.name ?? ""}
          name="name"
          required
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-sm font-medium text-stone-700">
          Type
          <select
            className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
            defaultValue={category?.type ?? "task"}
            name="type"
          >
            <option value="task">Task</option>
            <option value="plant">Plant</option>
            <option value="diary">Diary</option>
            <option value="photo">Photo</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Order
          <input
            className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
            defaultValue={category?.display_order ?? 999}
            name="display_order"
            type="number"
          />
        </label>
      </div>
      <button
        className="w-full cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}

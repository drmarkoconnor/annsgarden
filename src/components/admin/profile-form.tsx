import { updateProfile } from "@/lib/admin/actions";
import type { ProfileRecord } from "@/lib/admin/data";

type ProfileFormProps = {
  profile: ProfileRecord;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  return (
    <form action={updateProfile.bind(null, profile.id)} className="space-y-3">
      <label className="block text-sm font-medium text-stone-700">
        Name
        <input
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          defaultValue={profile.display_name}
          name="display_name"
          required
        />
      </label>
      <label className="block text-sm font-medium text-stone-700">
        Email
        <input
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          defaultValue={profile.email ?? ""}
          name="email"
          type="email"
        />
      </label>
      <label className="block text-sm font-medium text-stone-700">
        Role
        <select
          className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm"
          defaultValue={profile.role}
          name="role"
        >
          <option value="owner">Owner</option>
          <option value="gardener">Gardener</option>
          <option value="helper">Helper</option>
        </select>
      </label>
      <button
        className="w-full cursor-pointer rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
        type="submit"
      >
        Update profile
      </button>
    </form>
  );
}

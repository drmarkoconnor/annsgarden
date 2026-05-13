import Link from "next/link";

const navItems = [
  { id: "tasks", label: "Tasks", href: "/" },
  { id: "garden", label: "Garden", href: "/garden" },
  { id: "diary", label: "Diary", href: "/diary" },
  { id: "photos", label: "Photos", href: "/photos" },
  { id: "more", label: "More", href: "/more" },
] as const;

export type NavItemId = (typeof navItems)[number]["id"];

type BottomNavProps = {
  activeItem: NavItemId;
};

export function BottomNav({ activeItem }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-[#fdfcf8]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(68,64,60,0.08)] backdrop-blur"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = item.id === activeItem;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex min-h-12 flex-col items-center justify-center rounded-md px-1 text-xs font-medium transition-colors",
                isActive
                  ? "bg-emerald-100 text-emerald-900"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-800",
              ].join(" ")}
            >
              <span
                className={[
                  "mb-1 h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-emerald-700" : "bg-stone-300",
                ].join(" ")}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

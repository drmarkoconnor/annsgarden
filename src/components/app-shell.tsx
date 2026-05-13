import type { ReactNode } from "react";
import { BottomNav, type NavItemId } from "@/components/bottom-nav";

type AppShellProps = {
  activeItem: NavItemId;
  children: ReactNode;
};

export function AppShell({ activeItem, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-stone-100 text-stone-950">
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col bg-[#fdfcf8] shadow-sm">
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8">{children}</main>
        <BottomNav activeItem={activeItem} />
      </div>
    </div>
  );
}

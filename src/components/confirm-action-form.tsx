"use client";

import { useState, type FormEvent, type ReactNode } from "react";

type ConfirmActionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
  confirmLabel?: string;
  confirmMessage: string;
};

export function ConfirmActionForm({
  action,
  children,
  className,
  confirmLabel = "Confirm",
  confirmMessage,
}: ConfirmActionFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsConfirming(true);
  }

  if (isConfirming) {
    return (
      <form action={action} className={className}>
        <div
          aria-live="polite"
          className="rounded-md border border-amber-200 bg-amber-50 p-3"
        >
          <p className="text-sm leading-6 text-amber-950">{confirmMessage}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700"
              onClick={() => setIsConfirming(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-md bg-amber-700 px-3 py-2 text-sm font-semibold text-white"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

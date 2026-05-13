"use client";

import type { FormEvent, ReactNode } from "react";

type ConfirmActionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
  confirmMessage: string;
};

export function ConfirmActionForm({
  action,
  children,
  className,
  confirmMessage,
}: ConfirmActionFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} className={className} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

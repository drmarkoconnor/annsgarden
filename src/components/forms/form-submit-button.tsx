"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type FormSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingLabel?: string;
};

export function FormSubmitButton({
  children,
  className,
  disabled,
  pendingLabel = "Saving...",
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      aria-disabled={pending || disabled}
      className={className}
      disabled={pending || disabled}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

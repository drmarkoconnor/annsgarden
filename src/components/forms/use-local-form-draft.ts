"use client";

import { useEffect, useRef } from "react";

type DraftValue = string | string[];
type DraftState = Record<string, DraftValue>;

export function useLocalFormDraft(formKey: string, clearDraft = false) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isStorageAvailable()) {
      return;
    }

    if (clearDraft) {
      window.localStorage.removeItem(formKey);
      return;
    }

    const form = formRef.current;

    if (!form) {
      return;
    }

    restoreDraft(form, formKey);

    let saveTimer: number | undefined;
    const queueSave = () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => saveDraft(form, formKey), 200);
    };

    form.addEventListener("input", queueSave);
    form.addEventListener("change", queueSave);

    return () => {
      window.clearTimeout(saveTimer);
      form.removeEventListener("input", queueSave);
      form.removeEventListener("change", queueSave);
    };
  }, [clearDraft, formKey]);

  return formRef;
}

function restoreDraft(form: HTMLFormElement, formKey: string) {
  const rawDraft = window.localStorage.getItem(formKey);

  if (!rawDraft) {
    return;
  }

  try {
    const draft = JSON.parse(rawDraft) as DraftState;

    Array.from(form.elements).forEach((element) => {
      if (!isDraftElement(element) || !element.name || isIgnoredElement(element)) {
        return;
      }

      const value = draft[element.name];

      if (value === undefined) {
        return;
      }

      if (element instanceof HTMLInputElement) {
        if (element.type === "checkbox" || element.type === "radio") {
          const selectedValues = Array.isArray(value) ? value : [value];
          element.checked = selectedValues.includes(element.value);
          return;
        }

        element.value = Array.isArray(value) ? value[0] ?? "" : value;
        return;
      }

      if (element instanceof HTMLSelectElement && element.multiple) {
        const selectedValues = Array.isArray(value) ? value : [value];
        Array.from(element.options).forEach((option) => {
          option.selected = selectedValues.includes(option.value);
        });
        return;
      }

      element.value = Array.isArray(value) ? value[0] ?? "" : value;
    });
  } catch {
    window.localStorage.removeItem(formKey);
  }
}

function saveDraft(form: HTMLFormElement, formKey: string) {
  const data = new FormData(form);
  const draft: DraftState = {};

  data.forEach((value, key) => {
    if (value instanceof File || key === "return_to") {
      return;
    }

    const existing = draft[key];

    if (existing === undefined) {
      draft[key] = value;
      return;
    }

    draft[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  });

  window.localStorage.setItem(formKey, JSON.stringify(draft));
}

function isDraftElement(
  element: Element,
): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  );
}

function isIgnoredElement(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
) {
  return element instanceof HTMLInputElement
    ? ["button", "file", "hidden", "image", "reset", "submit"].includes(element.type)
    : false;
}

function isStorageAvailable() {
  try {
    const testKey = "__anns_garden_draft_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

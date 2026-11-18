"use client";

import type { ComponentProps } from "react";

/**
 * Select que reenvia o formulário ao mudar.
 * Usado no país: ao trocar, a lista de estados é recalculada no servidor.
 * `resetFields` limpa campos dependentes (ex.: estado) antes de enviar.
 */
export function AutoSubmitSelect({
  resetFields = [],
  ...props
}: ComponentProps<"select"> & { resetFields?: string[] }) {
  return (
    <select
      {...props}
      onChange={(e) => {
        const form = e.currentTarget.form;
        if (!form) return;
        for (const name of resetFields) {
          const el = form.elements.namedItem(name);
          if (el instanceof HTMLSelectElement || el instanceof HTMLInputElement) el.value = "";
        }
        form.requestSubmit();
      }}
    />
  );
}

"use client";

import { PrintIcon } from "./icons";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary">
      <PrintIcon className="h-4 w-4" /> Imprimir / PDF
    </button>
  );
}

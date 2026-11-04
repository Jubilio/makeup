"use client";

import { useActionState } from "react";
import { cancelSale, type ActionState } from "@/app/admin/actions";

export function CancelSale({ id, label }: { id: number; label: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(cancelSale, null);
  if (state?.ok) return <span className="notice ok" role="status">Anulada</span>;
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Anular a venda de ${label}? As unidades voltam ao stock.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn btn-sm" disabled={pending}>{pending ? "A anular…" : "Anular"}</button>
      {state && !state.ok && <span className="notice err">{state.message}</span>}
    </form>
  );
}

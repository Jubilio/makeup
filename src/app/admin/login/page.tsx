"use client";

import { useActionState } from "react";
import { login, type ActionState } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, null);
  return (
    <div className="login">
      <h1>Gestão de estoque</h1>
      <form action={action} className="checkout">
        <label className="field">
          <span>Senha</span>
          <input type="password" name="password" required autoFocus autoComplete="current-password" />
        </label>
        <button className="btn primary" disabled={pending}>
          {pending ? "A entrar…" : "Entrar"}
        </button>
        {state && !state.ok && <p className="notice err">{state.message}</p>}
      </form>
    </div>
  );
}

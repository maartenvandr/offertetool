"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) window.location.href = "/customers";
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);
    window.location.href = "/customers";
  }

  return (
    <div>
      <h1>Inloggen</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          Wachtwoord
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <button type="submit" disabled={busy} style={{ padding: 10 }}>
          {busy ? "Bezig…" : "Login"}
        </button>
        {err && <p style={{ color: "crimson" }}>{err}</p>}
      </form>
      <p style={{ marginTop: 16, color: "#555" }}>
        Tip: maak eerst je account aan in Supabase (Authentication → Users).
      </p>
    </div>
  );
}

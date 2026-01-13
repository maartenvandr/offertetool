"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  install_date: string | null;
  created_at: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.phone ?? "").toLowerCase().includes(s)
    );
  }, [q, customers]);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .select("id,name,phone,install_date,created_at")
        .order("id", { ascending: false });

      if (!error && data) setCustomers(data as Customer[]);
      setLoading(false);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <h1>Klantlijst</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/new">+ Nieuwe klant</a>
          <a href="/items">Artikelen</a>
          <button onClick={logout}>Uitloggen</button>
        </div>
      </div>

      <input
        placeholder="Zoek op naam/telefoon…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: "100%", padding: 10, margin: "12px 0" }}
      />

      {loading ? (
        <p>Laden…</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Naam</th>
              <th style={th}>Telefoon</th>
              <th style={th}>Installatiedatum</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={td}>{c.id}</td>
                <td style={td}>
                  <a href={`/customers/${c.id}`}>{c.name}</a>
                </td>
                <td style={td}>{c.phone ?? ""}</td>
                <td style={td}>{c.install_date ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 };
const td: React.CSSProperties = { borderBottom: "1px solid #eee", padding: 8 };

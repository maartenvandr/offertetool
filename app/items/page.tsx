"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Item = { id: number; name: string; unit_price: number };

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(i => i.name.toLowerCase().includes(s));
  }, [q, items]);

  async function refresh() {
    const { data, error } = await supabase
      .from("items")
      .select("id,name,unit_price")
      .order("name", { ascending: true });

    if (error) setErr(error.message);
    setItems((data as Item[]) ?? []);
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = "/login";
        return;
      }
      await refresh();
      setLoading(false);
    })();
  }, []);

  async function addItem() {
    setErr(null);
    const n = name.trim();
    if (!n) return;
    const { error } = await supabase.from("items").insert([{ name: n, unit_price: price || 0 }]);
    if (error) return setErr(error.message);
    setName("");
    setPrice(0);
    await refresh();
  }

  async function updatePrice(id: number, unit_price: number) {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, unit_price } : x)));
    await supabase.from("items").update({ unit_price }).eq("id", id);
  }

  async function remove(id: number) {
    if (!confirm("Artikel verwijderen?")) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) return setErr(error.message);
    await refresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1>Artikelen</h1>
        <a href="/customers">← Terug</a>
      </div>

      <div style={{ display: "grid", gap: 10, maxWidth: 520, margin: "12px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 10 }}>
          <input placeholder="Nieuw artikel" value={name} onChange={(e) => setName(e.target.value)} style={inp} />
          <input
            type="number"
            step="0.01"
            placeholder="Prijs"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            style={inp}
          />
          <button onClick={addItem}>Toevoegen</button>
        </div>
        <input placeholder="Zoek artikel…" value={q} onChange={(e) => setQ(e.target.value)} style={inp} />
      </div>

      {loading ? (
        <p>Laden…</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Artikel</th>
              <th style={th}>Prijs (inkoop)</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id}>
                <td style={td}>{it.name}</td>
                <td style={td}>
                  <input
                    type="number"
                    step="0.01"
                    value={it.unit_price}
                    onChange={(e) => updatePrice(it.id, Number(e.target.value))}
                    style={{ ...inp, width: 160 }}
                  />
                </td>
                <td style={td}>
                  <button onClick={() => remove(it.id)}>Verwijder</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {err && <p style={{ color: "crimson", marginTop: 12 }}>{err}</p>}

      <p style={{ marginTop: 16, color: "#555" }}>
        Tip: je kunt ook bulk importeren via Supabase (tabel <code>items</code>) met een CSV export uit Excel.
      </p>
    </div>
  );
}

const inp: React.CSSProperties = { padding: 8, width: "100%" };
const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 };
const td: React.CSSProperties = { borderBottom: "1px solid #eee", padding: 8 };

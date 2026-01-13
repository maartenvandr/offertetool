"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type MaterialRow = { item: string; qty: number; unit_price: number };
type Item = { id: number; name: string; unit_price: number };

export default function NewCustomerPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [rows, setRows] = useState<MaterialRow[]>([{ item: "", qty: 1, unit_price: 0 }]);
  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = "/login";
        return;
      }

      const { data: itemData } = await supabase
        .from("items")
        .select("id,name,unit_price")
        .order("name", { ascending: true });

      setItems((itemData as Item[]) ?? []);
    })();
  }, []);

  function addRow() {
    setRows((r) => [...r, { item: "", qty: 1, unit_price: 0 }]);
  }

  function removeRow(i: number) {
    setRows((r) => (r.length <= 1 ? r : r.filter((_, idx) => idx !== i)));
  }

  function updateRow(i: number, patch: Partial<MaterialRow>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function save() {
    setErr(null);
    setSaving(true);

    const { data: customer, error: cErr } = await supabase
      .from("customers")
      .insert([{ name, phone: phone || null, email: email || null, address: address || null }])
      .select("id")
      .single();

    if (cErr || !customer) {
      setSaving(false);
      setErr(cErr?.message ?? "Kon klant niet opslaan");
      return;
    }

    const materials = rows
      .map((r) => ({ ...r, item: r.item.trim() }))
      .filter((r) => r.item.length > 0)
      .map((r) => ({
        customer_id: customer.id,
        item: r.item,
        qty: r.qty || 1,
        unit_price: r.unit_price || 0,
        ordered: false,
      }));

    if (materials.length > 0) {
      const { error: mErr } = await supabase.from("materials").insert(materials);
      if (mErr) {
        setSaving(false);
        setErr(mErr.message);
        return;
      }
    }

    window.location.href = `/customers/${customer.id}`;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1>Nieuwe klant</h1>
        <a href="/customers">← Terug</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label>
          Naam<br />
          <input value={name} onChange={(e) => setName(e.target.value)} required style={inp} />
        </label>
        <label>
          Telefoon<br />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inp} />
        </label>
        <label>
          Email<br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} />
        </label>
        <label>
          Adres<br />
          <input value={address} onChange={(e) => setAddress(e.target.value)} style={inp} />
        </label>
      </div>

      <h2 style={{ marginTop: 22 }}>Materialen</h2>

      {items.length === 0 && (
        <p style={{ color: "#555" }}>
          Geen artikelen gevonden. Voeg artikelen toe via <a href="/items">Artikelen</a> of importeer ze in Supabase (tabel <code>items</code>).
        </p>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Artikel</th>
            <th style={th}>Aantal</th>
            <th style={th}>Prijs p/st</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={td}>
                <select
                  value={r.item}
                  onChange={(e) => {
                    const name = e.target.value;
                    const found = items.find((x) => x.name === name);
                    updateRow(i, {
                      item: name,
                      unit_price: found ? Number(found.unit_price) : r.unit_price,
                    });
                  }}
                  style={{ ...inp, width: "100%" }}
                >
                  <option value="">-- kies artikel --</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.name}>
                      {it.name}
                    </option>
                  ))}
                </select>
              </td>
              <td style={td}>
                <input
                  type="number"
                  step="0.01"
                  value={r.qty}
                  onChange={(e) => updateRow(i, { qty: Number(e.target.value) })}
                  style={{ ...inp, width: 120 }}
                />
              </td>
              <td style={td}>
                <input
                  type="number"
                  step="0.01"
                  value={r.unit_price}
                  onChange={(e) => updateRow(i, { unit_price: Number(e.target.value) })}
                  style={{ ...inp, width: 140 }}
                />
              </td>
              <td style={td}>
                <button type="button" onClick={() => removeRow(i)}>
                  Verwijder
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button type="button" onClick={addRow}>
          + Materiaal
        </button>
        <button type="button" onClick={save} disabled={saving || !name.trim()}>
          {saving ? "Opslaan…" : "Klant opslaan"}
        </button>
      </div>

      {err && <p style={{ color: "crimson", marginTop: 12 }}>{err}</p>}
    </div>
  );
}

const inp: React.CSSProperties = { padding: 8, width: "100%" };
const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 };
const td: React.CSSProperties = { borderBottom: "1px solid #eee", padding: 8, verticalAlign: "top" };

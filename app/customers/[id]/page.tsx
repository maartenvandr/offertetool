"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  install_date: string | null;
};

type Material = {
  id: number;
  item: string;
  qty: number;
  unit_price: number;
  ordered: boolean;
};

export default function CustomerDetail({ params }: { params: { id: string } }) {
  const customerId = Number(params.id);
  const [c, setC] = useState<Customer | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [installDate, setInstallDate] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        window.location.href = "/login";
        return;
      }

      const { data: cData } = await supabase
        .from("customers")
        .select("id,name,email,phone,address,install_date")
        .eq("id", customerId)
        .single();

      const { data: mData } = await supabase
        .from("materials")
        .select("id,item,qty,unit_price,ordered")
        .eq("customer_id", customerId)
        .order("id", { ascending: true });

      if (cData) {
        setC(cData as Customer);
        setInstallDate((cData as any).install_date ?? "");
      }
      setMaterials((mData as Material[]) ?? []);
    })();
  }, [customerId]);

  async function toggleOrdered(id: number, ordered: boolean) {
    setMaterials((ms) => ms.map((m) => (m.id === id ? { ...m, ordered } : m)));
    await supabase.from("materials").update({ ordered }).eq("id", id);
  }

  async function saveInstallDate() {
    if (!c) return;
    setSaving(true);
    await supabase.from("customers").update({ install_date: installDate || null }).eq("id", c.id);
    setSaving(false);
  }

  const total = materials.reduce((sum, m) => sum + Number(m.qty) * Number(m.unit_price), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1>Klantdetails</h1>
        <a href="/customers">← Terug</a>
      </div>

      {!c ? (
        <p>Laden…</p>
      ) : (
        <>
          <h2 style={{ marginTop: 8 }}>
            {c.name} (ID {c.id})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <b>Telefoon:</b> {c.phone ?? ""}
            </div>
            <div>
              <b>Email:</b> {c.email ?? ""}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <b>Adres:</b> {c.address ?? ""}
            </div>
          </div>

          <h3 style={{ marginTop: 18 }}>Installatiedatum</h3>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="date"
              value={installDate ?? ""}
              onChange={(e) => setInstallDate(e.target.value)}
              style={{ padding: 8 }}
            />
            <button onClick={saveInstallDate} disabled={saving}>
              {saving ? "Opslaan…" : "Opslaan"}
            </button>
          </div>

          <h3 style={{ marginTop: 22 }}>Materialen</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Besteld</th>
                <th style={th}>Artikel</th>
                <th style={th}>Aantal</th>
                <th style={th}>Prijs p/st</th>
                <th style={th}>Regeltotaal</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id}>
                  <td style={td}>
                    <input
                      type="checkbox"
                      checked={!!m.ordered}
                      onChange={(e) => toggleOrdered(m.id, e.target.checked)}
                    />
                  </td>
                  <td style={td}>{m.item}</td>
                  <td style={td}>{m.qty}</td>
                  <td style={td}>{m.unit_price}</td>
                  <td style={td}>{(Number(m.qty) * Number(m.unit_price)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ marginTop: 10 }}>
            <b>Totaal materialen:</b> {total.toFixed(2)}
          </p>
        </>
      )}
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 };
const td: React.CSSProperties = { borderBottom: "1px solid #eee", padding: 8 };

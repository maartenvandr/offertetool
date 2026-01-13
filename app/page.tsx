"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      window.location.href = data.session ? "/customers" : "/login";
    })();
  }, []);

  return <p>Bezig met laden…</p>;
}

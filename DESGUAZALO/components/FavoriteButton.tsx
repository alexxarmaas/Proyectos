"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

export function FavoriteButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    void supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      if (!id) return;
      const { data: row } = await supabase.from("favorites").select("listing_id").eq("user_id", id).eq("listing_id", listingId).maybeSingle();
      setFavorite(Boolean(row));
    });
  }, [listingId]);

  async function toggle() {
    const supabase = getBrowserSupabase();
    if (!supabase) return alert("Configura Supabase para usar favoritos.");
    if (!userId) { router.push("/login?next=" + encodeURIComponent(window.location.pathname)); return; }
    if (favorite) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
      if (!error) setFavorite(false);
      return;
    }
    const { error } = await supabase.from("favorites").insert({ user_id: userId, listing_id: listingId });
    if (!error) {
      setFavorite(true);
      void trackEvent("favorite", { targetId: listingId });
    }
  }

  return <button className={`button button-ghost ${favorite ? "is-favorite" : ""}`} onClick={toggle}>{favorite ? "♥ Guardado" : "♡ Guardar"}</button>;
}

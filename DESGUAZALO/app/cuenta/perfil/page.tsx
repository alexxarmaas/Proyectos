"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AccountTabs } from "@/components/AccountTabs";
import { getBrowserSupabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ display_name:"", location:"", whatsapp:"", phone:"", seller_kind:"private" });
  const [message,setMessage]=useState(""); const [error,setError]=useState(""); const [userId,setUserId]=useState("");

  useEffect(() => {
    const supabase=getBrowserSupabase(); if(!supabase)return;
    void (async()=>{
      const {data:auth}=await supabase.auth.getUser();
      if(!auth.user){router.replace("/login?next=/cuenta/perfil");return;}
      setUserId(auth.user.id);
      const {data}=await supabase.from("profiles").select("display_name,location,whatsapp,phone,seller_kind").eq("id",auth.user.id).single();
      if(data)setForm({display_name:data.display_name??"",location:data.location??"",whatsapp:data.whatsapp??"",phone:data.phone??"",seller_kind:data.seller_kind??"private"});
    })();
  },[router]);

  async function save(e:FormEvent){
    e.preventDefault(); setMessage(""); setError("");
    const supabase=getBrowserSupabase(); if(!supabase||!userId)return;
    if(!form.whatsapp.trim()&&!form.phone.trim())return setError("Mantén al menos un método de contacto.");
    const {error:err}=await supabase.from("profiles").update({...form,last_active_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",userId);
    if(err)setError(err.message);else setMessage("Perfil actualizado.");
  }

  return <div className="shell account-page"><div className="account-head"><div><span className="kicker">DATOS PÚBLICOS</span><h1>Perfil</h1><p className="muted">Estos datos ayudan a que el comprador sepa con quién está hablando.</p></div></div><AccountTabs active="perfil" /><form className="profile-form stack-form" onSubmit={save}>
    <label>Nombre visible<input required value={form.display_name} onChange={(e)=>setForm({...form,display_name:e.target.value})}/></label>
    <label>Tipo de vendedor<select value={form.seller_kind} onChange={(e)=>setForm({...form,seller_kind:e.target.value})}><option value="private">Particular</option><option value="professional">Profesional / desguace</option></select></label>
    <label>Localización<input required value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})}/></label>
    <div className="two-cols"><label>WhatsApp<input value={form.whatsapp} onChange={(e)=>setForm({...form,whatsapp:e.target.value})}/></label><label>Teléfono<input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></label></div>
    <div className="form-hint">El email de acceso nunca se expone. WhatsApp y teléfono sí se muestran en tus anuncios para permitir trato directo.</div>
    {error&&<div className="form-error">{error}</div>}{message&&<div className="form-success">{message}</div>}<button className="button button-primary">Guardar cambios</button>
  </form></div>;
}

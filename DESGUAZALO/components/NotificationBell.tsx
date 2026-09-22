"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

export function NotificationBell({userId}:{userId:string|null|undefined}){
  const [count,setCount]=useState(0);

  useEffect(()=>{
    if(!userId){setCount(0);return;}
    const client=getBrowserSupabase();
    if(!client)return;
    let active=true;

    async function refresh(){
      const {count:unread}=await client!.from("notifications").select("id",{count:"exact",head:true}).eq("user_id",userId).is("read_at",null);
      if(active)setCount(unread??0);
    }

    void refresh();
    const timer=window.setInterval(()=>void refresh(),45000);
    const onFocus=()=>void refresh();
    window.addEventListener("focus",onFocus);
    return()=>{active=false;window.clearInterval(timer);window.removeEventListener("focus",onFocus);};
  },[userId]);

  if(userId===undefined)return <span className="notification-bell notification-bell-placeholder" aria-hidden />;
  if(userId===null)return null;

  return <Link href="/cuenta/notificaciones" className="notification-bell" aria-label={count?count+" notificaciones sin leer":"Notificaciones"}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
    {count>0&&<span>{count>99?"99+":count}</span>}
  </Link>;
}

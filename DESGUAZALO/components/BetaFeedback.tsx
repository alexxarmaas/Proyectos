"use client";

import { FormEvent, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

type FeedbackKind = "bug" | "design" | "idea" | "confusing";

export function BetaFeedback() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>("bug");
  const [attempted, setAttempted] = useState("");
  const [happened, setHappened] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!attempted.trim() || !happened.trim()) return;

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setState("error");
      return;
    }

    setState("sending");
    const { data } = await supabase.auth.getSession();
    const { error } = await supabase.from("beta_feedback").insert({
      user_id: data.session?.user.id ?? null,
      category: kind,
      attempted: attempted.trim(),
      happened: happened.trim(),
      suggestion: suggestion.trim() || null,
      page_url: window.location.pathname + window.location.search,
      user_agent: navigator.userAgent,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    });

    if (error) {
      setState("error");
      return;
    }

    setState("sent");
    setAttempted("");
    setHappened("");
    setSuggestion("");
  }

  function close() {
    setOpen(false);
    if (state === "sent" || state === "error") setState("idle");
  }

  return (
    <div className="beta-feedback">
      {open && (
        <section id="beta-feedback-panel" className="beta-feedback-panel" aria-label="Enviar feedback de la beta">
          <div className="beta-feedback-head">
            <div>
              <span>BETA</span>
              <strong>Cuéntanos qué ha pasado</strong>
            </div>
            <button type="button" onClick={close} aria-label="Cerrar feedback">×</button>
          </div>

          {state === "sent" ? (
            <div className="beta-feedback-success">
              <strong>Recibido. Gracias.</strong>
              <p>Guardamos también la página y el tipo de dispositivo para poder reproducirlo.</p>
              <button type="button" className="button button-primary" onClick={close}>Cerrar</button>
            </div>
          ) : (
            <form onSubmit={submit} className="beta-feedback-form">
              <label>
                Tipo
                <select value={kind} onChange={(event) => setKind(event.target.value as FeedbackKind)}>
                  <option value="bug">Bug</option>
                  <option value="design">Diseño</option>
                  <option value="idea">Idea</option>
                  <option value="confusing">No entiendo algo</option>
                </select>
              </label>
              <label>
                ¿Qué estabas intentando hacer?
                <textarea required maxLength={1000} value={attempted} onChange={(event) => setAttempted(event.target.value)} placeholder="Ej. Estaba buscando un faro para un Golf 7…" />
              </label>
              <label>
                ¿Qué ha ocurrido?
                <textarea required maxLength={1500} value={happened} onChange={(event) => setHappened(event.target.value)} placeholder="Describe lo que esperabas y lo que viste." />
              </label>
              <label>
                ¿Qué mejorarías? <span>Opcional</span>
                <textarea maxLength={1500} value={suggestion} onChange={(event) => setSuggestion(event.target.value)} placeholder="Cualquier detalle nos ayuda." />
              </label>
              {state === "error" && <div className="form-error">No se pudo enviar. Vuelve a intentarlo.</div>}
              <button className="button button-primary full" type="submit" disabled={state === "sending"}>
                {state === "sending" ? "Enviando…" : "Enviar feedback"}
              </button>
              <p className="beta-feedback-meta">Se adjuntan automáticamente la página actual, navegador, tamaño de pantalla y fecha.</p>
            </form>
          )}
        </section>
      )}

      <button
        type="button"
        className="beta-feedback-trigger"
        aria-expanded={open}
        aria-controls="beta-feedback-panel"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Cerrar" : "Enviar feedback"}
      </button>
    </div>
  );
}

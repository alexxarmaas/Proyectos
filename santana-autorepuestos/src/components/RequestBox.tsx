"use client";

import { useState } from "react";
import { UiIcon } from "./UiIcon";

export function RequestBox() {
  const [plate, setPlate] = useState("");
  const [part, setPart] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola Santana Autorepuestos. Matrícula: ${plate || "(sin indicar)"}. Necesito: ${part || "información sobre un repuesto"}.`;
    window.open(`https://wa.me/34682583877?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <form className="requestCard" onSubmit={submit}>
      <div className="requestTopline"><span className="statusDot" /> CONSULTA RÁPIDA <span>· RESPUESTA DIRECTA</span></div>
      <h2>Dinos qué necesitas.</h2>
      <p>Con la matrícula localizamos la referencia correcta mucho más rápido.</p>
      <div className="formField">
        <label htmlFor="plate">Matrícula</label>
        <input id="plate" autoComplete="off" inputMode="text" maxLength={12} value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="Ej. 1234 ABC" />
      </div>
      <div className="formField">
        <label htmlFor="part">Repuesto o accesorio</label>
        <input id="part" autoComplete="off" value={part} onChange={(e) => setPart(e.target.value)} placeholder="Ej. kit de distribución" />
      </div>
      <button className="button buttonWhatsapp" type="submit"><UiIcon name="whatsapp" /> Enviar por WhatsApp <UiIcon name="arrow" /></button>
      <span className="microcopy">Sin registros · Sin esperas innecesarias · Atención desde Vecindario</span>
    </form>
  );
}

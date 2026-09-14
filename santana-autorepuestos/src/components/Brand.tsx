import Image from "next/image";

export function Brand({ compact = false, fullLogo = false }: { compact?: boolean; fullLogo?: boolean }) {
  if (fullLogo) {
    return (
      <div className="brandFull" aria-label="Santana Autorepuestos y Accesorios">
        <Image src="/santana-logo.jpg" alt="Santana Autorepuestos y Accesorios" width={220} height={220} priority />
      </div>
    );
  }

  return (
    <div className={`brand ${compact ? "brandCompact" : ""}`}>
      <span className="brandMark">
        <Image src="/santana-logo.jpg" alt="" width={compact ? 46 : 58} height={compact ? 46 : 58} priority />
      </span>
      <div className="brandText">
        <strong>SANTANA</strong>
        <span>AUTOREPUESTOS Y ACCESORIOS</span>
      </div>
    </div>
  );
}

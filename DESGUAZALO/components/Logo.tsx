import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="brand" aria-label="DESGUÁZALO, inicio">
      <span>DESGUÁZALO</span><span className="brand-slash" aria-hidden="true">/</span>
    </Link>
  );
}

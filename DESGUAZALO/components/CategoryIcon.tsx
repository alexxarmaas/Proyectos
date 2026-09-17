const paths: Record<string, string[]> = {
  Motor: ["M12 2v3", "M12 19v3", "M4.93 4.93l2.12 2.12", "M16.95 16.95l2.12 2.12", "M2 12h3", "M19 12h3", "M4.93 19.07l2.12-2.12", "M16.95 7.05l2.12-2.12", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"],
  Transmisión: ["M5 7h14", "M5 17h14", "M8 4v6", "M16 14v6", "M12 10v4", "M8 10h8", "M8 14h8"],
  Frenos: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z", "M17 5l2-2"],
  Suspensión: ["M7 3v4", "M17 17v4", "M7 7l10 10", "M17 7 7 17", "M5 9l2-2", "M17 17l2-2"],
  Dirección: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 12 7 7", "M12 12l-7 7", "M12 12V7"],
  Carrocería: ["M3 16V9l3-4h12l3 4v7", "M5 16h14", "M7 16a2 2 0 1 0 4 0", "M13 16a2 2 0 1 0 4 0", "M6 9h12"],
  Interior: ["M7 20V9a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v11", "M7 14h8", "M5 20h12"],
  Electrónica: ["M9 2v3", "M15 2v3", "M9 19v3", "M15 19v3", "M2 9h3", "M19 9h3", "M2 15h3", "M19 15h3", "M7 7h10v10H7Z"],
  Iluminación: ["M9 18h6", "M10 22h4", "M8.5 14.5A6 6 0 1 1 15.5 14.5c-1 1-1.5 2-1.5 3.5h-4c0-1.5-.5-2.5-1.5-3.5Z"],
  "Llantas y neumáticos": ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z", "M12 3v5", "M12 16v5", "M3 12h5", "M16 12h5"],
  Escape: ["M3 10h9l3 3h4", "M5 14h7", "M19 9v8", "M21 10v6"],
  Refrigeración: ["M12 2v20", "M4 6l16 12", "M20 6 4 18", "M7 4l5 8-5 8", "M17 4l-5 8 5 8"],
  Otros: ["M4 7h16", "M4 12h16", "M4 17h16"],
};

export function CategoryIcon({ category }: { category: string }) {
  const iconPaths = paths[category] ?? paths.Otros;
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths.map((path, index) => <path d={path} key={`${category}-${index}`} />)}
    </svg>
  );
}

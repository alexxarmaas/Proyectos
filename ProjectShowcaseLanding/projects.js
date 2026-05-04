const projects = [
  {
    name: "CoachingApp",
    status: "En desarrollo",
    statusClass: "in-progress",
    summary:
      "Plataforma para coaches con gestión de agenda, finanzas, clientes y recursos en un mismo panel.",
    stack: "React + Vite + Node.js + Express",
    features: [
      "Dashboard de seguimiento de actividad",
      "Módulos de agenda, finanzas y perfil de cliente",
      "Reserva pública para captar nuevos clientes"
    ],
    liveUrl: "#",
    codeUrl: "https://github.com/alexxarmaas/Proyectos/tree/main/CoachingApp"
  },
  {
    name: "LogoApp",
    status: "MVP funcional",
    statusClass: "ready",
    summary:
      "Sistema para gestión de pacientes, ejercicios, agenda y facturación para entornos clínicos.",
    stack: "React + Node.js + API REST",
    features: [
      "Backend modular con controladores y middleware",
      "Portal de pacientes con navegación dedicada",
      "Facturación y seguimiento de citas"
    ],
    liveUrl: "#",
    codeUrl: "https://github.com/alexxarmaas/Proyectos/tree/main/LogoApp"
  },
  {
    name: "NutriApp",
    status: "En desarrollo",
    statusClass: "in-progress",
    summary:
      "Aplicación para nutrición con consultas, recetas, planes alimentarios y seguimiento de pacientes.",
    stack: "React + Vite + Node.js + Express",
    features: [
      "Gestión completa de pacientes y consultas",
      "Módulos de planes y recetas por perfil",
      "Modales de alta productividad para operación diaria"
    ],
    liveUrl: "#",
    codeUrl: "https://github.com/alexxarmaas/Proyectos/tree/main/NutriApp"
  }
];

const grid = document.getElementById("project-grid");

if (grid) {
  projects.forEach((project, index) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${index * 120}ms`;

    card.innerHTML = `
      <span class="badge ${project.statusClass}">${project.status}</span>
      <h3>${project.name}</h3>
      <p>${project.summary}</p>
      <p class="meta"><strong>Stack:</strong> ${project.stack}</p>
      <ul class="feature-list">
        ${project.features.map((feature) => `<li>${feature}</li>`).join("")}
      </ul>
      <div class="links">
        <a class="btn btn-outline" href="${project.liveUrl}" target="_blank" rel="noreferrer">Demo en vivo</a>
      </div>
    `;

    grid.appendChild(card);
  });
}

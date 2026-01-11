// sidebar.js

document.addEventListener("DOMContentLoaded", () => {
  const rendererRoot =
    window.location.pathname.split("/renderer/")[0] + "/renderer/";

  fetch(`file://${rendererRoot}sidebar.html`)
    .then((res) => res.text())
    .then((html) => {
      const container = document.getElementById("sidebar-placeholder");
      if (!container) return;

      container.innerHTML = html;

      const sidebar = container.querySelector(".sidebar");
      if (!sidebar) return;

      sidebar.addEventListener("mouseenter", () => {
        sidebar.classList.add("expanded");
      });

      sidebar.addEventListener("mouseleave", () => {
        sidebar.classList.remove("expanded");
      });
    })
    .catch((err) => console.error("Sidebar load error:", err));
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".calc-button");
  if (!btn) return;

  const href = btn.dataset.href;
  if (!href) return;

  const rendererRoot =
    window.location.pathname.split("/renderer/")[0] + "/renderer/";
  window.location.href = `file://${rendererRoot}${href}`;
});

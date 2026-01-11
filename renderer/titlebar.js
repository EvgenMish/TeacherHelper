window.addEventListener("DOMContentLoaded", async () => {
  const rendererRoot =
    window.location.pathname.split("/renderer/")[0] + "/renderer/";
  try {
    const response = await fetch(`file://${rendererRoot}titlebar.html`);
    const titlebarHTML = await response.text();
    document.body.insertAdjacentHTML("afterbegin", titlebarHTML);

    const titleElement = document.getElementById("window-title");
    const iconElement = document.getElementById("window-icon");

    if (titleElement && window.windowAPI.getWindowTitle) {
      titleElement.textContent = await window.windowAPI.getWindowTitle();
    }
    if (iconElement) iconElement.src = await window.windowAPI.getWindowIcon();

    document
      .getElementById("min-btn")
      .addEventListener("click", () => window.windowAPI.minimize());
    document
      .getElementById("max-btn")
      .addEventListener("click", () => window.windowAPI.toggleMaximize());
    document
      .getElementById("close-btn")
      .addEventListener("click", () => window.windowAPI.close());
  } catch (err) {
    console.error("Не удалось загрузить titlebar.html:", err);
  }
});

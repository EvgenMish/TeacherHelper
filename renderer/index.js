console.log("windowAPI:", window.windowAPI);

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".calc-button");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const href = btn.dataset.href;
      if (href) {
        window.location.href = href;
      }
    });
  });
});

// кальпулятор оценок
let defaultMaxScore = 100;

let thresholds = [
  { grade: 2, percent: 0 },
  { grade: 3, percent: 50 },
  { grade: 4, percent: 66 },
  { grade: 5, percent: 85 },
];

document.addEventListener("DOMContentLoaded", () => {
  const scoreInput = document.getElementById("score");
  const maxInput = document.getElementById("max");

  maxInput.value = defaultMaxScore;

  scoreInput.addEventListener("input", updateAll);
  maxInput.addEventListener("input", () => {
    renderTable();
    updateAll();
  });

  renderTable();
  updateAll();
});

function renderTable() {
  const tbody = document.querySelector("#thresholdTable tbody");
  tbody.innerHTML = "";

  const maxScore =
    Number(document.getElementById("max").value) || defaultMaxScore;

  thresholds.forEach((t, index) => {
    const row = document.createElement("tr");
    row.dataset.grade = t.grade;

    // Колонка оценка
    const gradeCell = document.createElement("td");
    gradeCell.textContent = t.grade;
    row.appendChild(gradeCell);

    // Колонка Мин. % с инпутом
    const percentCell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.step = "any";
    input.value = t.percent;
    input.addEventListener("input", () => {
      thresholds[index].percent = Number(input.value);
      updateAll();
    });
    percentCell.appendChild(input);
    row.appendChild(percentCell);

    // Колонка Мин. балл
    const pointsCell = document.createElement("td");
    pointsCell.textContent = ((t.percent / 100) * maxScore).toFixed(2);
    row.appendChild(pointsCell);

    tbody.appendChild(row);
  });
}

function updateAll() {
  const scoreVal = document.getElementById("score").value;
  const maxVal =
    Number(document.getElementById("max").value) || defaultMaxScore;
  const resultDisplay = document.getElementById("resultDisplay");
  const tbody = document.querySelector("#thresholdTable tbody");

  if (scoreVal === "" || isNaN(scoreVal) || maxVal === 0) {
    resultDisplay.textContent = "-";
    tbody
      .querySelectorAll("tr")
      .forEach((row) => row.classList.remove("highlight"));
    updatePoints();
    return;
  }

  const score = Number(scoreVal);
  const percent = (score / maxVal) * 100;

  // Определяем оценку
  let gradeObj = thresholds[0];
  for (const t of thresholds) if (percent >= t.percent) gradeObj = t;

  // Вывод результата
  resultDisplay.textContent = `${gradeObj.grade} (${percent.toFixed(2)}%)`;

  updatePoints();

  // Подсветка строки
  tbody.querySelectorAll("tr").forEach((row) => {
    const g = Number(row.dataset.grade);
    if (g === gradeObj.grade) {
      switch (g) {
        case 5:
          row.style.backgroundColor = "#c8e6c9";
          break;
        case 4:
          row.style.backgroundColor = "#dcedc8";
          break;
        case 3:
          row.style.backgroundColor = "#fff9c4";
          break;
        case 2:
          row.style.backgroundColor = "#ffcdd2";
          break;
      }
      row.classList.add("highlight");
    } else {
      row.style.backgroundColor = "";
      row.classList.remove("highlight");
    }
  });
}

function updatePoints() {
  const maxVal =
    Number(document.getElementById("max").value) || defaultMaxScore;
  const tbody = document.querySelector("#thresholdTable tbody");
  thresholds.forEach((t, index) => {
    const row = tbody.children[index];
    const pointsCell = row.cells[2];
    pointsCell.textContent = ((t.percent / 100) * maxVal).toFixed(2);
  });
}

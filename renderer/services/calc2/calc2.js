//TODO вывод на основе минимального среднего веса
const GRADES = [2, 3, 4, 5];
const ALLOWED_WEIGHTS = [15, 20, 25, 50];
let tableData = [{ grade: null, weight: null }];

const targetInput = document.getElementById("targetMean");

function weightedMean(data) {
  let sum = 0,
    weightSum = 0;
  for (const row of data) {
    if (row.grade !== null && row.weight !== null) {
      sum += row.grade * row.weight;
      weightSum += row.weight;
    }
  }
  return weightSum === 0 ? 0 : sum / weightSum;
}

function updateResult() {
  const result = weightedMean(tableData);
  document.getElementById("resultDisplay").textContent =
    result === 0 ? "-" : result.toFixed(2);
}

function createGradeSelect(current, index) {
  const select = document.createElement("select");
  const placeholder = document.createElement("option");
  placeholder.textContent = "Выберите";
  placeholder.disabled = true;
  placeholder.selected = current === null;
  select.appendChild(placeholder);
  GRADES.forEach((g) => {
    const o = document.createElement("option");
    o.value = g;
    o.textContent = g;
    if (g === current) o.selected = true;
    select.appendChild(o);
  });
  select.addEventListener("change", () => {
    tableData[index].grade = Number(select.value);
    checkAndAddRow(index);
    updateResult();
  });
  return select;
}

function createWeightSelect(current, index) {
  const select = document.createElement("select");
  const placeholder = document.createElement("option");
  placeholder.textContent = "Выберите";
  placeholder.disabled = true;
  placeholder.selected = current === null;
  select.appendChild(placeholder);
  ALLOWED_WEIGHTS.forEach((w) => {
    const o = document.createElement("option");
    o.value = w;
    o.textContent = w;
    if (w === current) o.selected = true;
    select.appendChild(o);
  });
  select.addEventListener("change", () => {
    tableData[index].weight = Number(select.value);
    checkAndAddRow(index);
    updateResult();
  });
  return select;
}

function createDeleteButton(index) {
  const btn = document.createElement("button");
  btn.textContent = "✕";
  btn.classList.add("delete-button");
  btn.addEventListener("click", () => {
    tableData.splice(index, 1);
    if (tableData.length === 0) tableData.push({ grade: null, weight: null });
    renderTable();
  });
  return btn;
}

function checkAndAddRow(index) {
  const row = tableData[index];
  const isLast = index === tableData.length - 1;
  if (isLast && row.grade !== null && row.weight !== null) {
    tableData.push({ grade: null, weight: null });
    renderTable();
  }
}

// Отрисовка таблицы
function renderTable() {
  const tbody = document.querySelector("#calc2Table tbody");
  tbody.innerHTML = "";
  tableData.forEach((row, index) => {
    const tr = document.createElement("tr");
    const tdG = document.createElement("td");
    tdG.appendChild(createGradeSelect(row.grade, index));
    const tdW = document.createElement("td");
    tdW.appendChild(createWeightSelect(row.weight, index));
    const tdD = document.createElement("td");
    if (
      index < tableData.length - 1 ||
      (row.grade !== null && row.weight !== null)
    )
      tdD.appendChild(createDeleteButton(index));
    tr.appendChild(tdG);
    tr.appendChild(tdW);
    tr.appendChild(tdD);
    tbody.appendChild(tr);
  });
  updateResult();
}

function findCombinations() {
  const filled = tableData.filter((r) => r.grade !== null && r.weight !== null);
  const sumOld = filled.reduce((a, r) => a + r.grade * r.weight, 0);
  const sumWeights = filled.reduce((a, r) => a + r.weight, 0);
  const current = filled.length === 0 ? 0 : sumOld / sumWeights;

  if (filled.length === 0) return;

  // Определяем целевое значение
  const targetValue = targetInput.value;
  let target;
  if (targetValue === "auto") {
    target = Math.min(Math.round(current) + 1, 5);
  } else {
    target = Number(targetValue);
  }

  const threshold = target - 0.5; // минимальное допустимое среднее

  const nNew = Number(document.getElementById("nNewGrades").value);
  if (nNew < 1) {
    alert("Количество новых оценок >=1");
    return;
  }

  const results = [];
  const uniqueSet = new Set();

  function generate(
    arrG = [],
    arrW = [],
    depth = 0,
    sumSoFar = 0,
    weightSoFar = 0
  ) {
    if (depth === nNew) {
      const mean = (sumOld + sumSoFar) / (sumWeights + weightSoFar);
      if (mean >= threshold) {
        const key = arrG.map((g, i) => `${g}:${arrW[i]}`).join("|");
        if (!uniqueSet.has(key)) {
          uniqueSet.add(key);
          results.push({ grades: [...arrG], weights: [...arrW], mean });
        }
      }
      return;
    }

    for (const g of GRADES.filter((grade) => grade >= target)) {
      for (const w of ALLOWED_WEIGHTS) {
        const newSum = sumSoFar + g * w;
        const newWeight = weightSoFar + w;

        // Отсечение: даже с макс. оценками среднее не достигнет цели
        const maxPossibleMean =
          (sumOld +
            newSum +
            (nNew - depth - 1) * 5 * Math.max(...ALLOWED_WEIGHTS)) /
          (sumWeights +
            newWeight +
            (nNew - depth - 1) * Math.max(...ALLOWED_WEIGHTS));
        if (maxPossibleMean < threshold) continue;

        arrG[depth] = g;
        arrW[depth] = w;
        generate(arrG, arrW, depth + 1, newSum, newWeight);
      }
    }
  }

  generate();

  const solDiv = document.getElementById("solutions");
  solDiv.innerHTML = `<h3>Возможные комбинации (в журнал: ${target}, минимальная средняя: ${threshold.toFixed(
    2
  )}):</h3>`;

  if (results.length === 0) {
    solDiv.innerHTML += "<div>Решений нет</div>";
    return;
  }

  results.slice(0, 5).forEach((r) => {
    const div = document.createElement("div");
    // "оценка[вес], оценка[вес], ..."
    const comboStr = r.grades.map((g, i) => `${g}[${r.weights[i]}]`).join(", ");
    div.textContent = `Оценка[вес]:     ${comboStr}, Среднее: ${r.mean.toFixed(
      2
    )}`;
    solDiv.appendChild(div);
  });
}

renderTable();
document.getElementById("findBtn").addEventListener("click", findCombinations);

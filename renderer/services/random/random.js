const numberModeBtn = document.getElementById("numberMode");
const stringModeBtn = document.getElementById("stringMode");
const numberInputBlock = document.getElementById("numberInputBlock");
const stringInputBlock = document.getElementById("stringInputBlock");
const maxNumberInput = document.getElementById("maxNumber");
const pickNumberBtn = document.getElementById("pickNumber");
const pickStringBtn = document.getElementById("pickString");
const stringTableBody = document
  .getElementById("stringTable")
  .querySelector("tbody");
const addRowBtn = document.getElementById("addRowBtn");
const resultDisplay = document.getElementById("resultDisplay");
resultDisplay.textContent = "-";

let tableData = [{ value: "" }];
let highlightedIndex = null;

numberInputBlock.style.display = "none";
stringInputBlock.style.display = "block";

renderTable();

//  toggle
function setActiveMode(activeBtn, inactiveBtn) {
  activeBtn.classList.add("active");
  inactiveBtn.classList.remove("active");
}

numberModeBtn.addEventListener("click", () => {
  numberInputBlock.style.display = "block";
  stringInputBlock.style.display = "none";
  resultDisplay.textContent = "-";
  setActiveMode(numberModeBtn, stringModeBtn);
});

stringModeBtn.addEventListener("click", () => {
  stringInputBlock.style.display = "block";
  numberInputBlock.style.display = "none";
  resultDisplay.textContent = "-";
  setActiveMode(stringModeBtn, numberModeBtn);
  renderTable();
});

// Случайное число
pickNumberBtn.addEventListener("click", () => {
  const max = parseInt(maxNumberInput.value);
  if (!isNaN(max) && max > 0) {
    const randomNumber = Math.floor(Math.random() * max) + 1;
    resultDisplay.textContent = randomNumber;
  } else {
    resultDisplay.textContent = "Введите корректное число!";
  }
});

// Случайная строка
pickStringBtn.addEventListener("click", () => {
  const filled = tableData.map((r) => r.value.trim()).filter((v) => v !== "");
  if (filled.length > 0) {
    const randomIndex = Math.floor(Math.random() * filled.length);
    resultDisplay.textContent = filled[randomIndex];

    // найти реальный индекс в tableData
    let count = -1;
    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i].value.trim() !== "") count++;
      if (count === randomIndex) {
        highlightedIndex = i;
        break;
      }
    }

    renderTable();
  } else {
    resultDisplay.textContent = "Введите хотя бы одну строку!";
    highlightedIndex = null;
    renderTable();
  }
});

addRowBtn.addEventListener("click", () => {
  tableData.push({ value: "" });
  renderTable();
  focusLastRow();
});

function createDeleteButton(index) {
  const btn = document.createElement("button");
  btn.textContent = "✕";
  btn.className = "delete-button";
  btn.addEventListener("click", () => {
    tableData.splice(index, 1);
    if (tableData.length === 0) tableData.push({ value: "" });

    // если удаляем подсвеченную строку
    if (highlightedIndex === index) highlightedIndex = null;
    else if (highlightedIndex > index) highlightedIndex--;

    renderTable();
  });
  return btn;
}

function updateValue(index, value) {
  tableData[index].value = value;
}

function renderTable() {
  stringTableBody.innerHTML = "";
  tableData.forEach((row, index) => {
    const tr = document.createElement("tr");

    const tdInput = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Введите строку";
    input.className = "string-input";
    input.value = row.value;

    // Обновление значения
    input.addEventListener("input", (e) => updateValue(index, e.target.value));

    // --- Enter добавляет новую строку ---
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        tableData.push({ value: "" });
        renderTable();
        focusLastRow(); // ставим фокус на новой строке
      }
    });

    tdInput.appendChild(input);

    const tdAction = document.createElement("td");
    tdAction.appendChild(createDeleteButton(index));

    tr.appendChild(tdInput);
    tr.appendChild(tdAction);
    stringTableBody.appendChild(tr);

    if (index === highlightedIndex) tr.classList.add("highlight");
  });
}

function focusLastRow() {
  const inputs = document.querySelectorAll(".string-input");
  const lastInput = inputs[inputs.length - 1];
  if (lastInput) lastInput.focus();
}

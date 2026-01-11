import { base64TNR } from "./base64_timesnrcyrmt.js";

let rows = 5;
let cols = 3;
let lastImportedJson = null;

let seats = [];

let freeStudents = [];

const grid = document.getElementById("desk-grid");
const studentList = document.getElementById("students-list");
const studentsPanel = document.querySelector(".students-panel");

const importBtn = document.getElementById("import-students-btn");
const fileInput = document.getElementById("students-file-input");
const importSeatingBtn = document.getElementById("import-seating-btn");
const clearBtn = document.getElementById("clear-classroom");
const randomSeatingBtn = document.getElementById("random-seating-btn");

const addRow = document.getElementById("add-row");
const removeRow = document.getElementById("remove-row");
const addColumn = document.getElementById("add-column");
const removeColumn = document.getElementById("remove-column");

const exportJSON = document.getElementById("export-json-btn");
const exportPDF = document.getElementById("export-pdf-btn");

importBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  const file = fileInput.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "json") {
    // JSON
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);

        if (!Array.isArray(json.students))
          throw new Error("Некорректный формат файла");

        lastImportedJson = json;

        freeStudents = json.students.map((s) =>
          [s.name, s.lastname, s.surname].filter(Boolean).join(" ")
        );

        seats.forEach((row, r) =>
          row.forEach((desk, c) => (seats[r][c] = [null, null]))
        );

        render();
      } catch (err) {
        console.error("Ошибка импорта JSON:", err);
        alert("Не удалось импортировать JSON-файл");
      }
    };
    reader.readAsText(file, "UTF-8");
  } else if (ext === "xlsx" || ext === "xls") {
    //exel
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        const newStudents = rows
          .map((row) => {
            const lastname = (row[0] || "").trim(); // столбец A
            const name = (row[1] || "").trim(); // столбец B
            const surname = (row[2] || "").trim(); // столбец C

            // Приводим пол к male/female
            const genderRaw = (row[3] || "").trim().toLowerCase(); // столбец D
            let gender = "";
            if (genderRaw === "м" || genderRaw === "муж") gender = "male";
            else if (genderRaw === "ж" || genderRaw === "жен")
              gender = "female";

            if (!lastname && !name && !surname && !gender) return null;
            return { lastname, name, surname, gender };
          })
          .filter(Boolean);

        if (!newStudents.length) {
          alert("Нет корректных данных для импорта");
          return;
        }

        lastImportedJson = { students: newStudents };

        freeStudents = newStudents.map((s) =>
          [s.name, s.lastname, s.surname].filter(Boolean).join(" ")
        );

        seats.forEach((row, r) =>
          row.forEach((desk, c) => (seats[r][c] = [null, null]))
        );

        render();
      } catch (err) {
        console.error("Ошибка импорта Excel:", err);
        alert("Не удалось импортировать Excel-файл");
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Поддерживаются только файлы .json и .xlsx");
  }

  fileInput.value = ""; // чтобы можно было выбрать тот же файл повторно
});

importSeatingBtn.addEventListener("click", () => {
  if (!lastImportedJson?.seating) {
    alert("Сначала импортируйте JSON с составленной рассадкой");
    return;
  }

  const seating = lastImportedJson.seating;

  if (!Array.isArray(seating.seats)) {
    alert("Некорректные данные рассадки");
    return;
  }

  rows = seating.rows;
  cols = seating.cols;

  seats = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [null, null])
  );

  seats = seating.seats.map((row) => row.map((pair) => [...pair]));

  const seatedStudents = new Set();
  for (const row of seats) {
    for (const [a, b] of row) {
      if (a) seatedStudents.add(a);
      if (b) seatedStudents.add(b);
    }
  }

  // Если freeStudents пуст (например после importBtn), используем всех учеников
  if (!freeStudents.length && lastImportedJson.students) {
    freeStudents = lastImportedJson.students.map((s) =>
      [s.name, s.lastname, s.surname].filter(Boolean).join(" ")
    );
  }

  freeStudents = freeStudents.filter((name) => !seatedStudents.has(name));

  render();
});

clearBtn.addEventListener("click", clearClassroom);

randomSeatingBtn.addEventListener("click", randomSeating);

// Рандомная рассадка
function randomSeating() {
  let allStudents = [];

  seats.forEach((row) =>
    row.forEach((desk) =>
      desk.forEach((student) => {
        if (student) allStudents.push(student);
      })
    )
  );

  allStudents.push(...freeStudents);

  for (let i = allStudents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allStudents[i], allStudents[j]] = [allStudents[j], allStudents[i]];
  }

  seats = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [null, null])
  );
  freeStudents = [];

  // Заполняем СНИЗУ и СПРАВА
  let index = 0;

  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      for (let s = 0; s < 2; s++) {
        if (index < allStudents.length) {
          seats[r][c][s] = allStudents[index++];
        }
      }
    }
  }

  if (index < allStudents.length) {
    freeStudents = allStudents.slice(index);
  }

  render();
}

function clearClassroom() {
  // Перемещаем всех рассаженных учеников в freeStudents
  seats.forEach((row) => {
    row.forEach((desk) => {
      desk.forEach((student) => {
        if (student) freeStudents.push(student);
      });
    });
  });

  seats = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [null, null])
  );

  render();
}

// Инит

function initSeats() {
  seats = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [null, null])
  );
}

//render

function render() {
  renderGrid();
  renderStudents();
}

function renderGrid() {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  seats.forEach((row, r) => {
    row.forEach((desk, c) => {
      const deskDiv = document.createElement("div");
      deskDiv.className = "desk";
      deskDiv.draggable = true;
      deskDiv.dataset.row = r;
      deskDiv.dataset.col = c;

      enableDeskDnD(deskDiv);

      desk.forEach((student, s) => {
        const seatDiv = document.createElement("div");
        seatDiv.className = "seat";
        seatDiv.textContent = student ?? "";

        seatDiv.dataset.row = r;
        seatDiv.dataset.col = c;
        seatDiv.dataset.seat = s;

        // Подкрашиваем цвет текста по gender
        if (student && lastImportedJson?.students) {
          const studentObj = lastImportedJson.students.find((stu) => {
            const fullName = [stu.name, stu.lastname, stu.surname]
              .filter(Boolean)
              .join(" ");
            return fullName === student;
          });

          if (studentObj?.gender === "male") {
            seatDiv.style.color = "#a0d8f0"; // голубой
          } else if (studentObj?.gender === "female") {
            seatDiv.style.color = "#f4a0c0"; // розовый
          } else {
            seatDiv.style.color = "#ddd"; // нейтральный
          }
        }

        enableSeatDnD(seatDiv);
        deskDiv.appendChild(seatDiv);
      });

      grid.appendChild(deskDiv);
    });
  });
}

function renderStudents() {
  studentList.innerHTML = "";

  freeStudents.forEach((name) => {
    const div = document.createElement("div");
    div.className = "student";
    div.textContent = name;
    div.draggable = true;

    // Определяем пол ученика
    let gender = null;
    if (lastImportedJson?.students) {
      const student = lastImportedJson.students.find((s) => {
        const fullName = [s.name, s.lastname, s.surname]
          .filter(Boolean)
          .join(" ");
        return fullName === name;
      });
      if (student) gender = student.gender;
    }

    // Фон
    if (gender === "male") {
      div.style.color = "#a0d8f0";
    } else if (gender === "female") {
      div.style.color = "#f4a0c0";
    } else {
      div.style.color = "#ddd";
    }

    div.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("student", name);
      e.dataTransfer.setData("from", "list");
    });

    studentList.appendChild(div);
  });
}

//drag

function enableSeatDnD(seatDiv) {
  seatDiv.addEventListener("dragover", (e) => {
    e.preventDefault();
    seatDiv.classList.add("drag-over");
  });

  seatDiv.addEventListener("dragleave", () => {
    seatDiv.classList.remove("drag-over");
  });

  seatDiv.addEventListener("drop", (e) => {
    e.preventDefault();
    seatDiv.classList.remove("drag-over");

    const r = +seatDiv.dataset.row;
    const c = +seatDiv.dataset.col;
    const s = +seatDiv.dataset.seat;

    const name = e.dataTransfer.getData("student");
    const from = e.dataTransfer.getData("from");
    if (!name) return;

    if (from.startsWith("seat")) {
      // Перетаскиваем с другого места
      const [fr, fc, fs] = from.split(":").slice(1).map(Number);

      if (fr === r && fc === c && fs === s) return; // та же ячейка

      // Меняем местами
      const targetStudent = seats[r][c][s];
      seats[r][c][s] = name;
      seats[fr][fc][fs] = targetStudent || null;
    } else if (from === "list") {
      // Перетаскиваем со списка
      const targetStudent = seats[r][c][s];
      seats[r][c][s] = name;

      // Если место было занято, возвращаем старого в список
      if (targetStudent) freeStudents.push(targetStudent);

      // Убираем нового из списка
      freeStudents = freeStudents.filter((n) => n !== name);
    }

    render();
  });

  if (seatDiv.textContent) {
    seatDiv.draggable = true;

    seatDiv.addEventListener("dragstart", (e) => {
      e.stopPropagation(); // ❗ важно
      e.dataTransfer.setData("student", seatDiv.textContent);
      e.dataTransfer.setData(
        "from",
        `seat:${seatDiv.dataset.row}:${seatDiv.dataset.col}:${seatDiv.dataset.seat}`
      );
    });
  }
}

function enableDeskDnD(deskDiv) {
  deskDiv.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("type", "desk");

    e.dataTransfer.setData(
      "desk",
      `${deskDiv.dataset.row}:${deskDiv.dataset.col}`
    );
  });

  deskDiv.addEventListener("dragover", (e) => {
    e.preventDefault();
    deskDiv.classList.add("drag-over");
  });

  deskDiv.addEventListener("dragleave", () => {
    deskDiv.classList.remove("drag-over");
  });

  deskDiv.addEventListener("drop", (e) => {
    e.preventDefault();
    deskDiv.classList.remove("drag-over");

    const from = e.dataTransfer.getData("desk");
    if (!from) return;

    const [r1, c1] = from.split(":").map(Number);
    const r2 = +deskDiv.dataset.row;
    const c2 = +deskDiv.dataset.col;

    const tmp = seats[r1][c1];
    seats[r1][c1] = seats[r2][c2];
    seats[r2][c2] = tmp;

    render();
  });
}

// to list

studentsPanel.addEventListener("dragover", (e) => {
  e.preventDefault();
  studentsPanel.classList.add("drag-over");
});

studentsPanel.addEventListener("dragleave", () => {
  studentsPanel.classList.remove("drag-over");
});

studentsPanel.addEventListener("drop", (e) => {
  e.preventDefault();
  studentsPanel.classList.remove("drag-over");

  //ученик в список
  const name = e.dataTransfer.getData("student");
  const from = e.dataTransfer.getData("from");

  if (name && from.startsWith("seat")) {
    const [r, c, s] = from.split(":").slice(1).map(Number);

    seats[r][c][s] = null;
    freeStudents.push(name);
    render();
    return;
  }

  // парта в список
  const desk = e.dataTransfer.getData("desk");
  if (!desk) return;

  const [r, c] = desk.split(":").map(Number);

  for (let i = 0; i < seats[r][c].length; i++) {
    const student = seats[r][c][i];
    if (student) freeStudents.push(student);
    seats[r][c][i] = null;
  }

  render();
});

// size

addRow.addEventListener("click", () => {
  rows++;
  seats.unshift(Array.from({ length: cols }, () => [null, null]));
  render();
});

removeRow.addEventListener("click", () => {
  if (rows <= 1) return;

  const removed = seats.shift();

  removed.forEach((desk) =>
    desk.forEach((student) => {
      if (student) freeStudents.push(student);
    })
  );

  rows--;
  render();
});

addColumn.addEventListener("click", () => {
  cols++;
  seats.forEach((row) => row.unshift([null, null]));
  render();
});

removeColumn.addEventListener("click", () => {
  if (cols <= 1) return;

  seats.forEach((row) => {
    const removed = row.shift();
    removed.forEach((student) => {
      if (student) freeStudents.push(student);
    });
  });

  cols--;
  render();
});

//start

initSeats();
render();

//export
exportJSON.addEventListener("click", () => {
  if (!lastImportedJson) {
    alert("Сначала импортируйте список учеников");
    return;
  }

  const data = {
    // Все ученики из последнего импортированного JSON
    students: lastImportedJson.students,

    // Текущая рассадка
    seating: {
      rows,
      cols,
      seats,
    },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "seating.json";
  a.click();

  URL.revokeObjectURL(url);
});

exportPDF.addEventListener("click", () => {
  const doc = new window.jspdf.jsPDF();

  doc.addFileToVFS("timesnrcyrmt.ttf", base64TNR);
  doc.addFont("timesnrcyrmt.ttf", "TimesNewRoman", "normal");
  doc.setFont("TimesNewRoman");

  const tableData = seats.map((row) =>
    row.map((cell) => cell.filter((name) => name?.trim()).join(",\n") || "")
  );

  const lastRow = Array.from({ length: cols }, (_, i) => `Ряд ${cols - i}`);
  tableData.push(lastRow);

  const pageWidth = doc.internal.pageSize.getWidth() - 20; // отступы
  const colWidth = pageWidth / cols;
  const columnStyles = {};
  lastRow.forEach((_, i) => (columnStyles[i] = { cellWidth: colWidth }));

  doc.autoTable({
    head: [],
    body: tableData,
    startY: 20,
    styles: { font: "TimesNewRoman", fontSize: 12, cellWidth: "wrap" },
    columnStyles,
    theme: "grid",
  });

  doc.save("seating.pdf");
});

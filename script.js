script.js
let students = [];

function addStudent() {

    const name = document.getElementById("studentName").value;
    const roll = document.getElementById("studentRoll").value;

    if (name === "" || roll === "") {
        alert("Please enter student name and roll number");
        return;
    }

    students.push({
        name: name,
        roll: roll,
        status: null
    });

    document.getElementById("studentName").value = "";
    document.getElementById("studentRoll").value = "";

    displayStudents();
    updateDashboard();
}

function displayStudents() {

    const list = document.getElementById("studentList");

    list.innerHTML = "";

    students.forEach((student, index) => {

        const row = document.createElement("div");

        row.className = "student-row";

        row.innerHTML = `
            <div>
                <strong>${student.name}</strong>
                <br>
                Roll: ${student.roll}
            </div>

            <div>
                <button class="present-btn"
                    onclick="markPresent(${index})">
                    Present
                </button>

                <button class="absent-btn"
                    onclick="markAbsent(${index})">
                    Absent
                </button>
            </div>
        `;

        list.appendChild(row);
    });
}

function markPresent(index) {

    students[index].status = "Present";

    displayStudents();
    updateDashboard();
}

function markAbsent(index) {

    students[index].status = "Absent";

    displayStudents();
    updateDashboard();
}

function updateDashboard() {

    const total = students.length;

    const present = students.filter(
        student => student.status === "Present"
    ).length;

    const absent = students.filter(
        student => student.status === "Absent"
    ).length;

    let percentage = 0;

    if (total > 0) {
        percentage = Math.round((present / total) * 100);
    }

    document.getElementById("totalStudents").innerText = total;

    document.getElementById("presentStudents").innerText = present;

    document.getElementById("absentStudents").innerText = absent;

    document.getElementById("attendancePercentage").innerText =
        percentage + "%";
}

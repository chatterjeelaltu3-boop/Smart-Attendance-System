let students = [];

// Add Student
function addStudent() {
    const nameInput = document.getElementById("studentName");
    const rollInput = document.getElementById("studentRoll");

    const name = nameInput.value.trim();
    const roll = rollInput.value.trim();

    if (name === "" || roll === "") {
        alert("Please enter student name and roll number.");
        return;
    }

    // Check duplicate roll number
    const duplicate = students.some(student => student.roll === roll);

    if (duplicate) {
        alert("This roll number already exists.");
        return;
    }

    students.push({
        name: name,
        roll: roll,
        status: null
    });

    nameInput.value = "";
    rollInput.value = "";

    displayStudents();
    updateDashboard();
}


// Display Students
function displayStudents() {
    const list = document.getElementById("studentList");
    const searchInput = document.getElementById("searchStudent");

    const searchText = searchInput.value.toLowerCase().trim();

    list.innerHTML = "";

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchText) ||
        student.roll.toLowerCase().includes(searchText)
    );

    if (filteredStudents.length === 0) {
        list.innerHTML = "<p>No students found.</p>";
        return;
    }

    filteredStudents.forEach(student => {

        const index = students.indexOf(student);

        const row = document.createElement("div");

        row.className = "student-row";

        let statusText = "Not Marked";

        if (student.status === "Present") {
            statusText = "Present";
        }

        if (student.status === "Absent") {
            statusText = "Absent";
        }

        row.innerHTML = `
            <div class="student-info">
                <strong>${student.name}</strong>
                <br>
                Roll: ${student.roll}
                <div class="status">
                    Status: ${statusText}
                </div>
            </div>

            <div class="student-actions">

                <button
                    class="present-btn"
                    onclick="markPresent(${index})">
                    Present
                </button>

                <button
                    class="absent-btn"
                    onclick="markAbsent(${index})">
                    Absent
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteStudent(${index})">
                    Delete
                </button>

            </div>
        `;

        list.appendChild(row);
    });
}


// Mark Present
function markPresent(index) {
    students[index].status = "Present";

    displayStudents();
    updateDashboard();
}


// Mark Absent
function markAbsent(index) {
    students[index].status = "Absent";

    displayStudents();
    updateDashboard();
}


// Delete Student
function deleteStudent(index) {

    const studentName = students[index].name;

    const confirmDelete = confirm(
        "Delete " + studentName + "?"
    );

    if (!confirmDelete) {
        return;
    }

    students.splice(index, 1);

    displayStudents();
    updateDashboard();
}


// Update Dashboard
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


// Start Dashboard
displayStudents();
updateDashboard();

let students = [];

function addStudent() {

    const name = document.getElementById("studentName").value;
    const roll = document.getElementById("studentRoll").value;
    const college = document.getElementById("studentCollege").value;
    const department = document.getElementById("studentDepartment").value;

    if (
        name === "" ||
        roll === "" ||
        college === "" ||
        department === ""
    ) {
        alert("Please fill all details");
        return;
    }

    students.push({
        name: name,
        roll: roll,
        college: college,
        department: department,
        status: "Not Marked"
    });

    document.getElementById("studentName").value = "";
    document.getElementById("studentRoll").value = "";
    document.getElementById("studentCollege").value = "";
    document.getElementById("studentDepartment").value = "";

    displayStudents();
}


function displayStudents() {

    const list = document.getElementById("studentList");

    list.innerHTML = "";

    students.forEach(function(student, index) {

        const row = document.createElement("div");

        row.className = "student-row";

        row.innerHTML = `
            <div class="student-info">

                <strong>${student.name}</strong>

                <br>

                Roll: ${student.roll}

                <br>

                College: ${student.college}

                <br>

                Department: ${student.department}

                <div class="status">
                    Status: ${student.status}
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


function markPresent(index) {

    students[index].status = "Present";

    displayStudents();
}


function markAbsent(index) {

    students[index].status = "Absent";

    displayStudents();
}


function deleteStudent(index) {

    students.splice(index, 1);

    displayStudents();
}

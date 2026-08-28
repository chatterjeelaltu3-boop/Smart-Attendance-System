let students = [];


// ========================================
// ADD STUDENT
// ========================================

function addStudent() {

    const name = document.getElementById("studentName").value.trim();
    const roll = document.getElementById("studentRoll").value.trim();
    const college = document.getElementById("studentCollege").value.trim();
    const department = document.getElementById("studentDepartment").value.trim();

    if (!name || !roll || !college || !department) {
        alert("Please fill all student details.");
        return;
    }

    const duplicate = students.some(
        student => student.roll === roll
    );

    if (duplicate) {
        alert("This roll number already exists.");
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
    updateDashboard();
}


// ========================================
// DISPLAY STUDENTS
// ========================================

function displayStudents() {

    const list = document.getElementById("studentList");
    const search = document.getElementById("searchStudent");

    const searchText =
        search.value.toLowerCase().trim();

    list.innerHTML = "";

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchText) ||
        student.roll.toLowerCase().includes(searchText)
    );

    if (filtered.length === 0) {

        list.innerHTML =
            "<p>No students found.</p>";

        return;
    }

    filtered.forEach(student => {

        const index =
            students.indexOf(student);

        const row =
            document.createElement("div");

        row.className =
            "student-row";

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


// ========================================
// PRESENT
// ========================================

function markPresent(index) {

    students[index].status =
        "Present";

    displayStudents();
    updateDashboard();
}


// ========================================
// ABSENT
// ========================================

function markAbsent(index) {

    students[index].status =
        "Absent";

    displayStudents();
    updateDashboard();
}


// ========================================
// DELETE
// ========================================

function deleteStudent(index) {

    const student =
        students[index];

    if (!confirm(
        "Delete " + student.name + "?"
    )) {
        return;
    }

    students.splice(index, 1);

    displayStudents();
    updateDashboard();
}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    const total =
        students.length;

    const present =
        students.filter(
            student =>
                student.status === "Present"
        ).length;

    const absent =
        students.filter(
            student =>
                student.status === "Absent"
        ).length;

    const percentage =
        total > 0
            ? Math.round((present / total) * 100)
            : 0;

    document.getElementById(
        "totalStudents"
    ).innerText = total;

    document.getElementById(
        "presentStudents"
    ).innerText = present;

    document.getElementById(
        "absentStudents"
    ).innerText = absent;

    document.getElementById(
        "attendancePercentage"
    ).innerText = percentage + "%";
}



// ========================================
// FACE API MODEL
// ========================================

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";

let faceModelLoaded = false;


// ========================================
// LOAD FACE MODEL
// ========================================

async function loadFaceModel() {

    const registrationStatus =
        document.getElementById(
            "registrationStatus"
        );

    const attendanceStatus =
        document.getElementById(
            "attendanceStatus"
        );


    if (typeof faceapi === "undefined") {

        registrationStatus.innerText =
            "Face API could not load.";

        attendanceStatus.innerText =
            "Face API could not load.";

        return false;
    }


    try {

        registrationStatus.innerText =
            "Loading face detection...";

        await faceapi.nets.tinyFaceDetector
            .loadFromUri(MODEL_URL);

        faceModelLoaded = true;

        registrationStatus.innerText =
            "Face detection ready.";

        attendanceStatus.innerText =
            "Face detection ready.";

        return true;

    } catch (error) {

        console.error(error);

        registrationStatus.innerText =
            "Face model failed to load.";

        attendanceStatus.innerText =
            "Face model failed to load.";

        return false;
    }
}



// ========================================
// FACE REGISTRATION
// ========================================

let registrationStream = null;
let registrationRunning = false;


async function startAutomaticFaceRegistration() {

    const name =
        document.getElementById(
            "faceName"
        ).value.trim();

    const roll =
        document.getElementById(
            "faceRoll"
        ).value.trim();

    const college =
        document.getElementById(
            "collegeName"
        ).value.trim();

    const department =
        document.getElementById(
            "departmentName"
        ).value.trim();


    const video =
        document.getElementById(
            "registrationCamera"
        );

    const status =
        document.getElementById(
            "registrationStatus"
        );

    const message =
        document.getElementById(
            "registrationMessage"
        );

    const button =
        document.getElementById(
            "registerFaceButton"
        );


    if (
        !name ||
        !roll ||
        !college ||
        !department
    ) {

        message.innerText =
            "Please enter Name, Roll, College and Department.";

        return;
    }


    button.disabled = true;


    if (!faceModelLoaded) {

        const ready =
            await loadFaceModel();

        if (!ready) {

            button.disabled = false;

            return;
        }
    }


    try {

        status.innerText =
            "Starting camera...";


        registrationStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {
                        facingMode: "user",
                        width: 640,
                        height: 480
                    },

                    audio: false

                });


        video.srcObject =
            registrationStream;

        await video.play();


        status.innerText =
            "Camera ON — looking for your face...";

        registrationRunning =
            true;


        detectRegistrationFace(
            name,
            roll,
            college,
            department
        );


    } catch (error) {

        console.error(error);

        status.innerText =
            "Camera could not be started.";

        button.disabled = false;
    }
}



// ========================================
// AUTOMATIC REGISTRATION DETECTION
// ========================================

async function detectRegistrationFace(
    name,
    roll,
    college,
    department
) {

    if (!registrationRunning) {
        return;
    }


    const video =
        document.getElementById(
            "registrationCamera"
        );

    const status =
        document.getElementById(
            "registrationStatus"
        );


    try {

        const detections =
            await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: 0.45
                })
            );


        if (detections.length === 1) {

            status.innerText =
                "Face detected ✅ Capturing...";


            setTimeout(() => {

                if (registrationRunning) {

                    saveRegisteredFace(
                        name,
                        roll,
                        college,
                        department
                    );

                }

            }, 1000);

            return;
        }


        if (detections.length > 1) {

            status.innerText =
                "Only one face should be visible.";

        } else {

            status.innerText =
                "Looking for your face...";

        }


        setTimeout(() => {

            detectRegistrationFace(
                name,
                roll,
                college,
                department
            );

        }, 300);


    } catch (error) {

        console.error(error);

        status.innerText =
            "Face detection error.";

        registrationRunning =
            false;

        document.getElementById(
            "registerFaceButton"
        ).disabled = false;
    }
}



// ========================================
// SAVE REGISTERED FACE
// ========================================

function saveRegisteredFace(
    name,
    roll,
    college,
    department
) {

    const video =
        document.getElementById(
            "registrationCamera"
        );

    const status =
        document.getElementById(
            "registrationStatus"
        );

    const message =
        document.getElementById(
            "registrationMessage"
        );


    const canvas =
        document.createElement("canvas");


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    const ctx =
        canvas.getContext("2d");


    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    const photo =
        canvas.toDataURL(
            "image/jpeg",
            0.9
        );


    const studentFace = {

        name: name,
        roll: roll,
        college: college,
        department: department,
        photo: photo

    };


    localStorage.setItem(
        "registeredFaceStudent",
        JSON.stringify(studentFace)
    );


    status.innerText =
        "Face registered successfully ✅";


    message.innerText =
        "✅ " + name +
        " registered successfully.";


    registrationRunning =
        false;


    if (registrationStream) {

        registrationStream
            .getTracks()
            .forEach(track =>
                track.stop()
            );

        registrationStream = null;
    }


    video.srcObject = null;


    document.getElementById(
        "registerFaceButton"
    ).disabled = false;
}



// ========================================
// FACE ATTENDANCE
// ========================================

let attendanceStream = null;


async function startFaceAttendance() {

    const video =
        document.getElementById(
            "attendanceCamera"
        );

    const status =
        document.getElementById(
            "attendanceStatus"
        );

    const button =
        document.getElementById(
            "attendanceButton"
        );


    const result =
        document.getElementById(
            "attendanceResult"
        );


    const registered =
        localStorage.getItem(
            "registeredFaceStudent"
        );


    if (!registered) {

        result.innerHTML =
            "❌ No registered student found. Register a face first.";

        return;
    }


    if (!faceModelLoaded) {

        const ready =
            await loadFaceModel();

        if (!ready) {
            return;
        }
    }


    try {

        button.disabled = true;

        status.innerText =
            "Starting camera...";


        attendanceStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {
                        facingMode: "user",
                        width: 640,
                        height: 480
                    },

                    audio: false
                });


        video.srcObject =
            attendanceStream;

        await video.play();


        status.innerText =
            "Camera ON — detecting face...";


        detectAttendanceFace();


    } catch (error) {

        console.error(error);

        status.innerText =
            "Camera could not be started.";

        button.disabled = false;
    }
}



// ========================================
// ATTENDANCE FACE DETECTION
// ========================================

async function detectAttendanceFace() {

    const video =
        document.getElementById(
            "attendanceCamera"
        );

    const status =
        document.getElementById(
            "attendanceStatus"
        );


    const result =
        document.getElementById(
            "attendanceResult"
        );


    const registered =
        JSON.parse(
            localStorage.getItem(
                "registeredFaceStudent"
            )
        );


    try {

        const detections =
            await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: 0.45
                })
            );


        if (detections.length === 1) {

            status.innerText =
                "Face detected ✅";


            /*
             * At this stage we have detected
             * one face.
             *
             * Full face recognition will be
             * connected in the next step.
             */

            showAttendanceSuccess(
                registered
            );

            return;
        }


        status.innerText =
            "Looking for your face...";


        setTimeout(
            detectAttendanceFace,
            400
        );


    } catch (error) {

        console.error(error);

        status.innerText =
            "Face detection error.";

        document.getElementById(
            "attendanceButton"
        ).disabled = false;
    }
}



// ========================================
// ATTENDANCE SUCCESS
// ========================================

function showAttendanceSuccess(student) {

    const result =
        document.getElementById(
            "attendanceResult"
        );

    result.innerHTML = `

        <div>

            <div style="font-size:40px;">
                ✅
            </div>

            <h3>
                Attendance Successfully
            </h3>

            <p>
                <strong>Name:</strong>
                ${student.name}
            </p>

            <p>
                <strong>Roll:</strong>
                ${student.roll}
            </p>

            <p>
                <strong>College:</strong>
                ${student.college}
            </p>

            <p>
                <strong>Department:</strong>
                ${student.department}
            </p>

        </div>

    `;


    // Mark the registered student present
    const studentIndex =
        students.findIndex(
            s => s.roll === student.roll
        );


    if (studentIndex !== -1) {

        students[studentIndex].status =
            "Present";

        displayStudents();
        updateDashboard();
    }


    const status =
        document.getElementById(
            "attendanceStatus"
        );

    status.innerText =
        "Attendance marked successfully ✅";


    // Stop camera
    if (attendanceStream) {

        attendanceStream
            .getTracks()
            .forEach(track =>
                track.stop()
            );

        attendanceStream = null;
    }


    document.getElementById(
        "attendanceCamera"
    ).srcObject = null;


    document.getElementById(
        "attendanceButton"
    ).disabled = false;
}



// ========================================
// PAGE LOAD
// ========================================

window.addEventListener(
    "load",
    async function () {

        displayStudents();

        updateDashboard();

        await loadFaceModel();

    }
);

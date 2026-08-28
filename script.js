// =====================================================
// SMART ATTENDANCE SYSTEM
// COMPLETE SCRIPT.JS
// =====================================================


// =====================================================
// STUDENT DATA
// =====================================================

let students = JSON.parse(
    localStorage.getItem("students")
) || [];

let attendanceHistory = JSON.parse(
    localStorage.getItem("attendanceHistory")
) || [];

let registrationStream = null;
let attendanceStream = null;

let faceModelLoaded = false;
let registrationRunning = false;
let attendanceRunning = false;


// =====================================================
// SAVE DATA
// =====================================================

function saveStudents() {
    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );
}

function saveAttendanceHistory() {
    localStorage.setItem(
        "attendanceHistory",
        JSON.stringify(attendanceHistory)
    );
}


// =====================================================
// DATE / TIME
// =====================================================

function getAttendanceDateTime() {

    const now = new Date();

    return {
        date: now.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }),

        day: now.toLocaleDateString("en-IN", {
            weekday: "long"
        }),

        time: now.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }),

        dateKey:
            now.getFullYear() +
            "-" +
            String(now.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(now.getDate()).padStart(2, "0")
    };
}


// =====================================================
// CURRENT DATE
// =====================================================

function showCurrentDate() {

    const element =
        document.getElementById("currentDate");

    if (!element) return;

    const now = new Date();

    element.innerText =
        "📅 " +
        now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}


// =====================================================
// MOBILE VALIDATION
// =====================================================

function isValidMobile(mobile) {

    return /^[0-9]{10}$/.test(
        mobile.trim()
    );
}


// =====================================================
// EMAIL VALIDATION
// EMAIL IS OPTIONAL
// =====================================================

function isValidEmail(email) {

    if (!email.trim()) {
        return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
    );
}


// =====================================================
// ADD STUDENT
// =====================================================

function addStudent() {

    const name =
        document.getElementById("studentName")?.value.trim();

    const roll =
        document.getElementById("studentRoll")?.value.trim();

    const college =
        document.getElementById("studentCollege")?.value.trim();

    const department =
        document.getElementById("studentDepartment")?.value.trim();

    const mobile =
        document.getElementById("studentMobile")?.value.trim();

    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        alert(
            "Please fill all required details."
        );

        return;
    }

    if (!isValidMobile(mobile)) {

        alert(
            "Mobile number must contain exactly 10 digits."
        );

        return;
    }

    students.push({

        name,
        roll,
        college,
        department,
        mobile,

        email: "",

        status: "Not Marked",

        attendanceDate: "",
        attendanceDay: "",
        attendanceTime: ""

    });

    saveStudents();

    [
        "studentName",
        "studentRoll",
        "studentCollege",
        "studentDepartment",
        "studentMobile"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el) el.value = "";

    });

    displayStudents();
    updateDashboard();
}


// =====================================================
// DISPLAY STUDENTS
// =====================================================

function displayStudents() {

    const list =
        document.getElementById(
            "studentList"
        );

    const searchElement =
        document.getElementById(
            "searchStudent"
        );

    if (!list) return;

    const search =
        searchElement
            ? searchElement.value
                .toLowerCase()
                .trim()
            : "";

    list.innerHTML = "";

    const filtered =
        students.filter(student =>

            String(student.name || "")
                .toLowerCase()
                .includes(search)

            ||

            String(student.roll || "")
                .toLowerCase()
                .includes(search)

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

        let attendanceInfo = "";

        if (student.attendanceDate) {

            attendanceInfo = `

                <br>
                📅 Date: ${student.attendanceDate}

                <br>
                📆 Day: ${student.attendanceDay}

                <br>
                🕐 Time: ${student.attendanceTime}

            `;
        }

        row.innerHTML = `

            <div class="student-info">

                <strong>
                    ${student.name}
                </strong>

                <br>

                Roll: ${student.roll}

                <br>

                College: ${student.college}

                <br>

                Department: ${student.department}

                <br>

                📱 Mobile:
                ${student.mobile || "Not added"}

                <br>

                📧 Email:
                ${student.email || "Not added"}

                ${attendanceInfo}

                <div class="status">
                    Status: ${student.status}
                </div>

            </div>

            <div class="student-actions">

                <button
                    class="present-btn"
                    onclick="markPresent(${index})"
                >
                    Present
                </button>

                <button
                    class="absent-btn"
                    onclick="markAbsent(${index})"
                >
                    Absent
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteStudent(${index})"
                >
                    Delete
                </button>

            </div>
        `;

        list.appendChild(row);
    });
}


// =====================================================
// MANUAL PRESENT
// =====================================================

function markPresent(index) {

    if (!students[index]) return;

    const attendance =
        getAttendanceDateTime();

    students[index].status =
        "Present";

    students[index].attendanceDate =
        attendance.date;

    students[index].attendanceDay =
        attendance.day;

    students[index].attendanceTime =
        attendance.time;

    saveStudents();

    saveDailyAttendance(
        students[index],
        "Present",
        attendance
    );

    displayStudents();
    updateDashboard();
}


// =====================================================
// MANUAL ABSENT
// =====================================================

function markAbsent(index) {

    if (!students[index]) return;

    const attendance =
        getAttendanceDateTime();

    students[index].status =
        "Absent";

    students[index].attendanceDate =
        attendance.date;

    students[index].attendanceDay =
        attendance.day;

    students[index].attendanceTime =
        attendance.time;

    saveStudents();

    saveDailyAttendance(
        students[index],
        "Absent",
        attendance
    );

    displayStudents();
    updateDashboard();
}


// =====================================================
// DELETE STUDENT
// =====================================================

function deleteStudent(index) {

    if (!students[index]) return;

    if (
        !confirm(
            "Delete this student?"
        )
    ) {
        return;
    }

    students.splice(index, 1);

    saveStudents();

    displayStudents();
    updateDashboard();
}


// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard() {

    const total =
        students.length;

    const present =
        students.filter(
            s => s.status === "Present"
        ).length;

    const absent =
        students.filter(
            s => s.status === "Absent"
        ).length;

    const percentage =
        total > 0
            ? Math.round(
                (present / total) * 100
            )
            : 0;

    const totalElement =
        document.getElementById(
            "totalStudents"
        );

    const presentElement =
        document.getElementById(
            "presentStudents"
        );

    const absentElement =
        document.getElementById(
            "absentStudents"
        );

    const percentageElement =
        document.getElementById(
            "attendancePercentage"
        );

    if (totalElement)
        totalElement.innerText =
            total;

    if (presentElement)
        presentElement.innerText =
            present;

    if (absentElement)
        absentElement.innerText =
            absent;

    if (percentageElement)
        percentageElement.innerText =
            percentage + "%";
}


// =====================================================
// DAILY ATTENDANCE HISTORY
// =====================================================

function saveDailyAttendance(
    student,
    status,
    attendance
) {

    /*
       Same student cannot create
       duplicate attendance on same day.
    */

    const existingIndex =
        attendanceHistory.findIndex(
            record =>
                record.roll === student.roll &&
                record.dateKey === attendance.dateKey
        );

    const record = {

        name: student.name,
        roll: student.roll,
        college: student.college,
        department: student.department,

        mobile:
            student.mobile || "",

        email:
            student.email || "",

        status,

        date:
            attendance.date,

        day:
            attendance.day,

        time:
            attendance.time,

        dateKey:
            attendance.dateKey
    };

    if (existingIndex !== -1) {

        attendanceHistory[
            existingIndex
        ] = record;

    } else {

        attendanceHistory.push(
            record
        );
    }

    saveAttendanceHistory();
}


// =====================================================
// FACE API
// =====================================================

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";


// =====================================================
// LOAD MODELS
// =====================================================

async function loadFaceModels() {

    if (faceModelLoaded) {
        return true;
    }

    try {

        await faceapi.nets.tinyFaceDetector
            .loadFromUri(MODEL_URL);

        await faceapi.nets.faceLandmark68Net
            .loadFromUri(MODEL_URL);

        await faceapi.nets.faceRecognitionNet
            .loadFromUri(MODEL_URL);

        faceModelLoaded =
            true;

        return true;

    } catch (error) {

        console.error(
            "Face model loading error:",
            error
        );

        return false;
    }
}


// =====================================================
// CAMERA
// =====================================================

async function startCameraForVideo(
    videoId,
    statusId
) {

    const video =
        document.getElementById(
            videoId
        );

    const status =
        document.getElementById(
            statusId
        );

    if (!video) return null;

    try {

        const stream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {

                        facingMode: "user",

                        width: {
                            ideal: 640
                        },

                        height: {
                            ideal: 480
                        }
                    },

                    audio: false

                });

        video.srcObject =
            stream;

        await video.play();

        if (status) {

            status.innerText =
                "Camera ON ✅ Looking for face...";
        }

        return stream;

    } catch (error) {

        console.error(error);

        if (status) {

            status.innerText =
                "Camera permission denied ❌";
        }

        return null;
    }
}


// =====================================================
// REGISTRATION CAMERA
// =====================================================

async function startRegistrationCamera() {

    if (registrationStream) {
        return;
    }

    registrationStream =
        await startCameraForVideo(
            "registrationCamera",
            "registrationStatus"
        );
}


// =====================================================
// ATTENDANCE CAMERA
// =====================================================

async function startAttendanceCamera() {

    if (attendanceStream) {
        return;
    }

    attendanceStream =
        await startCameraForVideo(
            "attendanceCamera",
            "attendanceStatus"
        );
}


// =====================================================
// FACE REGISTRATION
// =====================================================

async function startAutomaticFaceRegistration() {

    const name =
        document.getElementById(
            "faceName"
        )?.value.trim();

    const roll =
        document.getElementById(
            "faceRoll"
        )?.value.trim();

    const college =
        document.getElementById(
            "collegeName"
        )?.value.trim();

    const department =
        document.getElementById(
            "departmentName"
        )?.value.trim();

    const mobile =
        document.getElementById(
            "faceMobile"
        )?.value.trim();

    /*
       Optional email.
       Works only if an email input
       exists in the HTML.
    */

    const emailElement =
        document.getElementById(
            "faceEmail"
        );

    const email =
        emailElement
            ? emailElement.value.trim()
            : "";

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
        !department ||
        !mobile
    ) {

        if (message) {

            message.innerHTML =
                "❌ Please fill all required details.";
        }

        return;
    }

    if (!isValidMobile(mobile)) {

        if (message) {

            message.innerHTML =
                "❌ Mobile number must be exactly 10 digits.";
        }

        return;
    }

    if (!isValidEmail(email)) {

        if (message) {

            message.innerHTML =
                "❌ Please enter a valid email address.";
        }

        return;
    }

    if (button) {
        button.disabled = true;
    }

    const modelsReady =
        await loadFaceModels();

    if (!modelsReady) {

        if (message) {

            message.innerHTML =
                "❌ Face detection model could not load.";
        }

        buttonEnable(
            "registerFaceButton"
        );

        return;
    }

    if (!video.srcObject) {

        registrationStream =
            await startCameraForVideo(
                "registrationCamera",
                "registrationStatus"
            );

        if (!registrationStream) {

            buttonEnable(
                "registerFaceButton"
            );

            return;
        }
    }

    if (status) {

        status.innerText =
            "📸 Camera ON — show your face...";
    }

    registrationRunning =
        true;

    detectRegistrationFace(
        name,
        roll,
        college,
        department,
        mobile,
        email
    );
}


// =====================================================
// DETECT REGISTRATION FACE
// =====================================================

async function detectRegistrationFace(
    name,
    roll,
    college,
    department,
    mobile,
    email
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

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.5
                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();

        if (detection) {

            if (status) {

                status.innerText =
                    "✅ Face detected — capturing...";
            }

            const descriptor =
                Array.from(
                    detection.descriptor
                );

            localStorage.setItem(
                "registeredFaceStudent",
                JSON.stringify({

                    name,
                    roll,
                    college,
                    department,
                    mobile,
                    email,
                    descriptor

                })
            );

            const existing =
                students.find(
                    s => s.roll === roll
                );

            if (existing) {

                existing.name =
                    name;

                existing.college =
                    college;

                existing.department =
                    department;

                existing.mobile =
                    mobile;

                existing.email =
                    email;

            } else {

                students.push({

                    name,
                    roll,
                    college,
                    department,
                    mobile,
                    email,

                    status:
                        "Not Marked",

                    attendanceDate: "",
                    attendanceDay: "",
                    attendanceTime: ""

                });
            }

            saveStudents();

            displayStudents();

            updateDashboard();

            registrationSuccessful(
                name,
                roll
            );

            return;
        }

        if (status) {

            status.innerText =
                "📸 Looking for your face...";
        }

        setTimeout(
            () => {

                detectRegistrationFace(
                    name,
                    roll,
                    college,
                    department,
                    mobile,
                    email
                );

            },
            300
        );

    } catch (error) {

        console.error(error);

        registrationRunning =
            false;

        if (status) {

            status.innerText =
                "❌ Face detection error.";
        }

        buttonEnable(
            "registerFaceButton"
        );
    }
}


// =====================================================
// REGISTRATION SUCCESS
// =====================================================

function registrationSuccessful(
    name,
    roll
) {

    registrationRunning =
        false;

    const status =
        document.getElementById(
            "registrationStatus"
        );

    const message =
        document.getElementById(
            "registrationMessage"
        );

    if (status) {

        status.innerText =
            "✅ Face Captured Successfully!";
    }

    if (message) {

        message.innerHTML = `

            <div class="success-message">

                <div class="success-icon">
                    ✅
                </div>

                <h3>
                    Face Captured Successfully!
                </h3>

                <p>
                    🎉 Face Registration Completed
                </p>

                <p>
                    👤 Name: ${name}
                </p>

                <p>
                    🔢 Roll: ${roll}
                </p>

            </div>

        `;
    }

    alert(
        "✅ Face Captured Successfully!\n\n" +
        "🎉 Face Registration Completed"
    );

    stopRegistrationCamera();

    buttonEnable(
        "registerFaceButton"
    );
}


// =====================================================
// STOP REGISTRATION CAMERA
// =====================================================

function stopRegistrationCamera() {

    if (registrationStream) {

        registrationStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        registrationStream =
            null;
    }

    const video =
        document.getElementById(
            "registrationCamera"
        );

    if (video) {

        video.srcObject =
            null;
    }
}


// =====================================================
// BUTTON ENABLE
// =====================================================

function buttonEnable(id) {

    const button =
        document.getElementById(id);

    if (button) {

        button.disabled =
            false;
    }
}


// =====================================================
// FACE ATTENDANCE
// =====================================================

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

    const savedData =
        localStorage.getItem(
            "registeredFaceStudent"
        );

    if (!savedData) {

        if (result) {

            result.innerHTML =
                "❌ No face registered. Please register first.";
        }

        return;
    }

    const registeredStudent =
        JSON.parse(savedData);

    if (button) {
        button.disabled = true;
    }

    const modelsReady =
        await loadFaceModels();

    if (!modelsReady) {

        buttonEnable(
            "attendanceButton"
        );

        return;
    }

    if (!video.srcObject) {

        attendanceStream =
            await startCameraForVideo(
                "attendanceCamera",
                "attendanceStatus"
            );

        if (!attendanceStream) {

            buttonEnable(
                "attendanceButton"
            );

            return;
        }
    }

    if (status) {

        status.innerText =
            "📸 Camera ON — looking for your face...";
    }

    attendanceRunning =
        true;

    detectAttendanceFace(
        registeredStudent
    );
}


// =====================================================
// DETECT ATTENDANCE FACE
// =====================================================

async function detectAttendanceFace(
    registeredStudent
) {

    if (!attendanceRunning) {
        return;
    }

    const video =
        document.getElementById(
            "attendanceCamera"
        );

    const status =
        document.getElementById(
            "attendanceStatus"
        );

    try {

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.5
                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();

        if (!detection) {

            if (status) {

                status.innerText =
                    "📸 Looking for your face...";
            }

            setTimeout(
                () => {

                    detectAttendanceFace(
                        registeredStudent
                    );

                },
                300
            );

            return;
        }

        if (status) {

            status.innerText =
                "✅ Face detected — checking...";
        }

        const registeredDescriptor =
            new Float32Array(
                registeredStudent.descriptor
            );

        const distance =
            faceapi.euclideanDistance(
                detection.descriptor,
                registeredDescriptor
            );

        if (distance < 0.55) {

            showAttendanceSuccess(
                registeredStudent
            );

        } else {

            attendanceRunning =
                false;

            if (status) {

                status.innerText =
                    "❌ Face does not match.";
            }

            stopAttendanceCamera();

            buttonEnable(
                "attendanceButton"
            );
        }

    } catch (error) {

        console.error(error);

        attendanceRunning =
            false;

        if (status) {

            status.innerText =
                "❌ Face detection error.";
        }

        buttonEnable(
            "attendanceButton"
        );
    }
}


// =====================================================
// ATTENDANCE SUCCESS
// =====================================================

function showAttendanceSuccess(
    student
) {

    attendanceRunning =
        false;

    const attendance =
        getAttendanceDateTime();

    const result =
        document.getElementById(
            "attendanceResult"
        );

    let index =
        students.findIndex(
            s => s.roll === student.roll
        );

    if (index !== -1) {

        students[index].status =
            "Present";

        students[index].attendanceDate =
            attendance.date;

        students[index].attendanceDay =
            attendance.day;

        students[index].attendanceTime =
            attendance.time;

        students[index].mobile =
            student.mobile ||
            students[index].mobile ||
            "";

        students[index].email =
            student.email ||
            students[index].email ||
            "";

    } else {

        students.push({

            name:
                student.name,

            roll:
                student.roll,

            college:
                student.college,

            department:
                student.department,

            mobile:
                student.mobile || "",

            email:
                student.email || "",

            status:
                "Present",

            attendanceDate:
                attendance.date,

            attendanceDay:
                attendance.day,

            attendanceTime:
                attendance.time

        });
    }

    saveStudents();

    // SAVE DAILY RECORD
    saveDailyAttendance(
        student,
        "Present",
        attendance
    );

    if (result) {

        result.innerHTML = `

            <div class="success-message">

                <div class="success-icon">
                    ✅
                </div>

                <h3>
                    Attendance Successfully Marked!
                </h3>

                <p>
                    <strong>👤 Name:</strong>
                    ${student.name}
                </p>

                <p>
                    <strong>🔢 Roll:</strong>
                    ${student.roll}
                </p>

                <p>
                    <strong>🏫 College:</strong>
                    ${student.college}
                </p>

                <p>
                    <strong>🎓 Department:</strong>
                    ${student.department}
                </p>

                <p>
                    <strong>📱 Mobile:</strong>
                    ${student.mobile || "Not added"}
                </p>

                <p>
                    <strong>📧 Email:</strong>
                    ${student.email || "Not added"}
                </p>

                <hr>

                <p>
                    <strong>📅 Date:</strong>
                    ${attendance.date}
                </p>

                <p>
                    <strong>📆 Day:</strong>
                    ${attendance.day}
                </p>

                <p>
                    <strong>🕐 Time:</strong>
                    ${attendance.time}
                </p>

            </div>

        `;
    }

    const status =
        document.getElementById(
            "attendanceStatus"
        );

    if (status) {

        status.innerText =
            "✅ Attendance marked successfully!";
    }

    displayStudents();

    updateDashboard();

    stopAttendanceCamera();

    buttonEnable(
        "attendanceButton"
    );

    // POPUP
    alert(
        "✅ ATTENDANCE SUCCESSFULLY MARKED!\n\n" +
        "👤 Name: " + student.name + "\n" +
        "🔢 Roll: " + student.roll + "\n" +
        "🏫 College: " + student.college + "\n" +
        "🎓 Department: " + student.department + "\n\n" +
        "📅 Date: " + attendance.date + "\n" +
        "📆 Day: " + attendance.day + "\n" +
        "🕐 Time: " + attendance.time
    );
}


// =====================================================
// STOP ATTENDANCE CAMERA
// =====================================================

function stopAttendanceCamera() {

    if (attendanceStream) {

        attendanceStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        attendanceStream =
            null;
    }

    const video =
        document.getElementById(
            "attendanceCamera"
        );

    if (video) {

        video.srcObject =
            null;
    }
}


// =====================================================
// THREE LINE MENU
// =====================================================

function toggleMenu() {

    const menu =
        document.getElementById(
            "mainMenu"
        );

    if (!menu) return;

    menu.classList.toggle(
        "show"
    );
}


// =====================================================
// EDIT MY DETAILS
// =====================================================

function openEditDetails() {

    const modal =
        document.getElementById(
            "editDetailsModal"
        );

    if (!modal) return;

    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );

    if (saved) {

        const student =
            JSON.parse(saved);

        const fields = {

            editName:
                student.name || "",

            editRoll:
                student.roll || "",

            editCollege:
                student.college || "",

            editDepartment:
                student.department || "",

            editMobile:
                student.mobile || ""

        };

        Object.keys(fields).forEach(id => {

            const el =
                document.getElementById(id);

            if (el) {
                el.value =
                    fields[id];
            }

        });

        const email =
            document.getElementById(
                "editEmail"
            );

        if (email) {
            email.value =
                student.email || "";
        }
    }

    modal.classList.add(
        "show"
    );
}


// =====================================================
// CLOSE EDIT
// =====================================================

function closeEditDetails() {

    const modal =
        document.getElementById(
            "editDetailsModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


// =====================================================
// SAVE EDITED DETAILS
// =====================================================

function saveEditedDetails() {

    const name =
        document.getElementById(
            "editName"
        )?.value.trim();

    const roll =
        document.getElementById(
            "editRoll"
        )?.value.trim();

    const college =
        document.getElementById(
            "editCollege"
        )?.value.trim();

    const department =
        document.getElementById(
            "editDepartment"
        )?.value.trim();

    const mobile =
        document.getElementById(
            "editMobile"
        )?.value.trim();

    const email =
        document.getElementById(
            "editEmail"
        )?.value.trim() || "";

    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        alert(
            "Please fill all required details."
        );

        return;
    }

    if (!isValidMobile(mobile)) {

        alert(
            "Mobile number must contain exactly 10 digits."
        );

        return;
    }

    if (!isValidEmail(email)) {

        alert(
            "Please enter a valid email address."
        );

        return;
    }

    const index =
        students.findIndex(
            s => s.roll === roll
        );

    if (index !== -1) {

        students[index].name =
            name;

        students[index].college =
            college;

        students[index].department =
            department;

        students[index].mobile =
            mobile;

        students[index].email =
            email;

        saveStudents();
    }

    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );

    if (saved) {

        const student =
            JSON.parse(saved);

        student.name =
            name;

        student.roll =
            roll;

        student.college =
            college;

        student.department =
            department;

        student.mobile =
            mobile;

        student.email =
            email;

        localStorage.setItem(
            "registeredFaceStudent",
            JSON.stringify(student)
        );
    }

    displayStudents();

    updateDashboard();

    closeEditDetails();

    alert(
        "✅ Details updated successfully!"
    );
}


// =====================================================
// ADD / UPDATE MOBILE
// =====================================================

function openMobileUpdate() {

    const mobile =
        prompt(
            "Enter your 10-digit mobile number:"
        );

    if (!mobile) return;

    const cleanMobile =
        mobile.trim();

    if (!isValidMobile(cleanMobile)) {

        alert(
            "❌ Mobile number must be exactly 10 digits."
        );

        return;
    }

    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );

    if (!saved) {

        alert(
            "Please register your face first."
        );

        return;
    }

    const student =
        JSON.parse(saved);

    student.mobile =
        cleanMobile;

    localStorage.setItem(
        "registeredFaceStudent",
        JSON.stringify(student)
    );

    const index =
        students.findIndex(
            s => s.roll === student.roll
        );

    if (index !== -1) {

        students[index].mobile =
            cleanMobile;

        saveStudents();
    }

    displayStudents();

    alert(
        "📱 Mobile number updated successfully!"
    );
}


// =====================================================
// REGISTERED STUDENTS
// =====================================================

function showRegisteredStudents() {

    const modal =
        document.getElementById(
            "studentsModal"
        );

    const list =
        document.getElementById(
            "registeredStudentsList"
        );

    if (!modal || !list) return;

    list.innerHTML = "";

    if (students.length === 0) {

        list.innerHTML =
            "<p>No students registered yet.</p>";

    } else {

        students.forEach(
            (student, index) => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    "registered-student";

                div.innerHTML = `

                    <strong>
                        ${index + 1}. ${student.name}
                    </strong>

                    <br>

                    🔢 Roll:
                    ${student.roll}

                    <br>

                    🏫 College:
                    ${student.college}

                    <br>

                    🎓 Department:
                    ${student.department}

                    <br>

                    📱 Mobile:
                    ${student.mobile || "Not added"}

                    <br>

                    📧 Email:
                    ${student.email || "Not added"}

                    <br>

                    📌 Status:
                    ${student.status}

                `;

                list.appendChild(div);
            }
        );
    }

    modal.classList.add(
        "show"
    );
}


// =====================================================
// CLOSE REGISTERED STUDENTS
// =====================================================

function closeRegisteredStudents() {

    const modal =
        document.getElementById(
            "studentsModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


// =====================================================
// CHECK ATTENDANCE
// =====================================================

function showCheckAttendance() {

    const modal =
        document.getElementById(
            "attendanceCheckModal"
        );

    const history =
        document.getElementById(
            "attendanceHistory"
        );

    const totalDays =
        document.getElementById(
            "attendanceTotalDays"
        );

    const presentDays =
        document.getElementById(
            "attendancePresentDays"
        );

    const absentDays =
        document.getElementById(
            "attendanceAbsentDays"
        );

    if (!modal) return;

    /*
       Close menu
    */

    const menu =
        document.getElementById(
            "mainMenu"
        );

    if (menu) {

        menu.classList.remove(
            "show"
        );
    }

    /*
       Current student's records
    */

    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );

    let currentRoll = "";

    if (saved) {

        try {

            const student =
                JSON.parse(saved);

            currentRoll =
                student.roll || "";

        } catch (error) {

            console.error(error);
        }
    }

    let records =
        attendanceHistory;

    if (currentRoll) {

        records =
            attendanceHistory.filter(
                record =>
                    record.roll === currentRoll
            );
    }

    const present =
        records.filter(
            r => r.status === "Present"
        ).length;

    const absent =
        records.filter(
            r => r.status === "Absent"
        ).length;

    if (totalDays) {

        totalDays.innerText =
            records.length;
    }

    if (presentDays) {

        presentDays.innerText =
            present;
    }

    if (absentDays) {

        absentDays.innerText =
            absent;
    }

    if (history) {

        history.innerHTML = "";

        if (records.length === 0) {

            history.innerHTML =
                "<p>No attendance history found.</p>";

        } else {

            const sorted =
                [...records].reverse();

            sorted.forEach(record => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    "attendance-history-item";

                div.innerHTML = `

                    <strong>
                        ${record.status === "Present"
                            ? "✅ Present"
                            : "❌ Absent"}
                    </strong>

                    <br>

                    📅 Date:
                    ${record.date}

                    <br>

                    📆 Day:
                    ${record.day}

                    <br>

                    🕐 Time:
                    ${record.time}

                    <br>

                    👤 Name:
                    ${record.name}

                    <br>

                    🔢 Roll:
                    ${record.roll}

                `;

                history.appendChild(div);
            });
        }
    }

    modal.classList.add(
        "show"
    );
}


// =====================================================
// CLOSE CHECK ATTENDANCE
// =====================================================

function closeCheckAttendance() {

    const modal =
        document.getElementById(
            "attendanceCheckModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


// =====================================================
// ADMIN DETAILS
// =====================================================

function showAdminDetails() {

    const modal =
        document.getElementById(
            "adminModal"
        );

    if (!modal) return;

    modal.classList.add(
        "show"
    );

    const menu =
        document.getElementById(
            "mainMenu"
        );

    if (menu) {

        menu.classList.remove(
            "show"
        );
    }
}


// =====================================================
// CLOSE ADMIN
// =====================================================

function closeAdminDetails() {

    const modal =
        document.getElementById(
            "adminModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


// =====================================================
// CLOSE MENU WHEN CLICKING OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    function(event) {

        const menu =
            document.getElementById(
                "mainMenu"
            );

        const button =
            document.querySelector(
                ".menu-button"
            );

        if (
            menu &&
            menu.classList.contains("show") &&
            !menu.contains(event.target) &&
            !button?.contains(event.target)
        ) {

            menu.classList.remove(
                "show"
            );
        }
    }
);


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    async function() {

        displayStudents();

        updateDashboard();

        showCurrentDate();

        await loadFaceModels();

    }
);

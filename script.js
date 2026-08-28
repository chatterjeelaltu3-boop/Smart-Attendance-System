// =====================================================
// SMART ATTENDANCE SYSTEM
// ADMIN: AYUSH CHATTERJEE
// =====================================================


// =====================================================
// STUDENTS DATA
// =====================================================

let students =
    JSON.parse(localStorage.getItem("students")) || [];

let registrationStream = null;
let attendanceStream = null;

let faceModelLoaded = false;
let registrationRunning = false;
let attendanceRunning = false;


// =====================================================
// ADMIN SETTINGS
// =====================================================

const ADMIN_NAME = "Ayush Chatterjee";

const DEFAULT_ADMIN_PASSWORD = "1234";


// =====================================================
// GET ADMIN PASSWORD
// =====================================================

function getAdminPassword() {

    return localStorage.getItem("adminPassword")
        || DEFAULT_ADMIN_PASSWORD;
}


// =====================================================
// SAVE STUDENTS
// =====================================================

function saveStudents() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );
}


// =====================================================
// DATE + DAY + TIME
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
        })
    };
}


// =====================================================
// TODAY DATE
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
// ADD STUDENT
// =====================================================

function addStudent() {

    const name =
        document.getElementById("studentName").value.trim();

    const roll =
        document.getElementById("studentRoll").value.trim();

    const college =
        document.getElementById("studentCollege").value.trim();

    const department =
        document.getElementById("studentDepartment").value.trim();

    const mobile =
        document.getElementById("studentMobile").value.trim();


    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        alert(
            "Please fill Name, Roll, College, Department and Mobile Number."
        );

        return;
    }


    const existing =
        students.find(
            s => s.roll.toLowerCase() === roll.toLowerCase()
        );


    if (existing) {

        alert(
            "This Roll Number is already registered."
        );

        return;
    }


    students.push({

        name,
        roll,
        college,
        department,
        mobile,

        status: "Not Marked",

        attendanceDate: "",
        attendanceDay: "",
        attendanceTime: ""

    });


    saveStudents();


    document.getElementById("studentName").value = "";
    document.getElementById("studentRoll").value = "";
    document.getElementById("studentCollege").value = "";
    document.getElementById("studentDepartment").value = "";
    document.getElementById("studentMobile").value = "";


    displayStudents();
    updateDashboard();


    alert(
        "✅ Student added successfully!"
    );
}


// =====================================================
// DISPLAY STUDENTS
// =====================================================

function displayStudents() {

    const list =
        document.getElementById("studentList");

    const searchElement =
        document.getElementById("searchStudent");

    if (!list) return;


    const search =
        searchElement
            ? searchElement.value.toLowerCase().trim()
            : "";


    list.innerHTML = "";


    const filtered =
        students.filter(student =>

            student.name
                .toLowerCase()
                .includes(search)

            ||

            student.roll
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

                <strong>${student.name}</strong>

                <br>

                Roll: ${student.roll}

                <br>

                College: ${student.college}

                <br>

                Department: ${student.department}

                ${attendanceInfo}

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


// =====================================================
// PRESENT
// =====================================================

function markPresent(index) {

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

    displayStudents();

    updateDashboard();
}


// =====================================================
// ABSENT
// =====================================================

function markAbsent(index) {

    students[index].status =
        "Absent";


    saveStudents();

    displayStudents();

    updateDashboard();
}


// =====================================================
// DELETE STUDENT
// =====================================================

function deleteStudent(index) {

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
        document.getElementById("totalStudents");

    const presentElement =
        document.getElementById("presentStudents");

    const absentElement =
        document.getElementById("absentStudents");

    const percentageElement =
        document.getElementById(
            "attendancePercentage"
        );


    if (totalElement)
        totalElement.innerText = total;


    if (presentElement)
        presentElement.innerText = present;


    if (absentElement)
        absentElement.innerText = absent;


    if (percentageElement)
        percentageElement.innerText =
            percentage + "%";
}


// =====================================================
// FACE API
// =====================================================

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";


// =====================================================
// LOAD FACE MODELS
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


        faceModelLoaded = true;


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
        document.getElementById(videoId);

    const status =
        document.getElementById(statusId);


    if (!video) return null;


    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({

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
                "Camera ON ✅";

        }


        return stream;


    } catch (error) {

        console.error(error);


        if (status) {

            status.innerText =
                "Camera permission denied or unavailable ❌";

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


    const mobile =
        document.getElementById(
            "faceMobile"
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
        !department ||
        !mobile
    ) {

        message.innerText =
            "Please fill all student details.";

        return;
    }


    button.disabled = true;


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        message.innerText =
            "Face detection model could not load.";

        button.disabled = false;

        return;
    }


    if (!video.srcObject) {

        registrationStream =
            await startCameraForVideo(
                "registrationCamera",
                "registrationStatus"
            );


        if (!registrationStream) {

            button.disabled = false;

            return;
        }
    }


    status.innerText =
        "Looking for your face...";


    registrationRunning =
        true;


    detectRegistrationFace(
        name,
        roll,
        college,
        department,
        mobile
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
    mobile
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

            status.innerText =
                "Face detected ✅ Registering...";


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

            } else {

                students.push({

                    name,
                    roll,
                    college,
                    department,
                    mobile,

                    status: "Not Marked",

                    attendanceDate: "",

                    attendanceDay: "",

                    attendanceTime: ""

                });
            }


            saveStudents();


            displayStudents();

            updateDashboard();


            registrationSuccessful();


            return;
        }


        status.innerText =
            "Looking for your face...";


        setTimeout(
            () => {

                detectRegistrationFace(
                    name,
                    roll,
                    college,
                    department,
                    mobile
                );

            },
            300
        );


    } catch (error) {

        console.error(error);


        status.innerText =
            "Face detection error ❌";


        registrationRunning =
            false;


        buttonEnable(
            "registerFaceButton"
        );
    }
}


// =====================================================
// REGISTRATION SUCCESS
// =====================================================

function registrationSuccessful() {

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
            "Face captured successfully ✅";
    }


    if (message) {

        message.innerText =
            "✅ Face Registration Successful";
    }


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


    buttonEnable(
        "registerFaceButton"
    );
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

        result.innerHTML =
            "❌ No face registered. Please register first.";

        return;
    }


    const registeredStudent =
        JSON.parse(savedData);


    button.disabled =
        true;


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        button.disabled =
            false;

        return;
    }


    if (!video.srcObject) {

        attendanceStream =
            await startCameraForVideo(
                "attendanceCamera",
                "attendanceStatus"
            );


        if (!attendanceStream) {

            button.disabled =
                false;

            return;
        }
    }


    status.innerText =
        "Camera ON — looking for your face...";


    attendanceRunning =
        true;


    detectAttendanceFace(
        registeredStudent
    );
}


// =====================================================
// ATTENDANCE DETECTION
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

            status.innerText =
                "Looking for your face...";


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


        status.innerText =
            "Face detected ✅ Checking identity...";


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

            status.innerText =
                "Face does not match ❌";


            attendanceRunning =
                false;


            stopAttendanceCamera();


            buttonEnable(
                "attendanceButton"
            );
        }


    } catch (error) {

        console.error(error);


        status.innerText =
            "Face detection error ❌";


        attendanceRunning =
            false;


        buttonEnable(
            "attendanceButton"
        );
    }
}


// =====================================================
// ATTENDANCE SUCCESS
// =====================================================

function showAttendanceSuccess(student) {

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

    } else {

        students.push({

            name: student.name,

            roll: student.roll,

            college: student.college,

            department: student.department,

            mobile: student.mobile || "",

            status: "Present",

            attendanceDate:
                attendance.date,

            attendanceDay:
                attendance.day,

            attendanceTime:
                attendance.time

        });
    }


    saveStudents();


    result.innerHTML = `

        <div
            style="
                padding:22px;
                margin-top:20px;
                border-radius:16px;
                background:#ecfdf5;
                border:2px solid #22c55e;
                text-align:center;
            "
        >

            <div
                style="
                    font-size:50px;
                    margin-bottom:10px;
                "
            >
                ✅
            </div>


            <h3
                style="
                    font-size:24px;
                    margin-bottom:15px;
                "
            >
                Attendance Successfully
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


            <hr
                style="
                    margin:15px 0;
                    border:none;
                    border-top:1px solid #bbf7d0;
                "
            >


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


    displayStudents();

    updateDashboard();


    const status =
        document.getElementById(
            "attendanceStatus"
        );


    if (status) {

        status.innerText =
            "Attendance marked successfully ✅";
    }


    stopAttendanceCamera();


    buttonEnable(
        "attendanceButton"
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


        document.getElementById(
            "editName"
        ).value =
            student.name || "";


        document.getElementById(
            "editRoll"
        ).value =
            student.roll || "";


        document.getElementById(
            "editCollege"
        ).value =
            student.college || "";


        document.getElementById(
            "editDepartment"
        ).value =
            student.department || "";


        document.getElementById(
            "editMobile"
        ).value =
            student.mobile || "";

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
        ).value.trim();


    const roll =
        document.getElementById(
            "editRoll"
        ).value.trim();


    const college =
        document.getElementById(
            "editCollege"
        ).value.trim();


    const department =
        document.getElementById(
            "editDepartment"
        ).value.trim();


    const mobile =
        document.getElementById(
            "editMobile"
        ).value.trim();


    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        alert(
            "Please fill all details."
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


    const mobile =
        prompt(
            "Enter your mobile number:",
            student.mobile || ""
        );


    if (!mobile) return;


    student.mobile =
        mobile.trim();


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
            mobile.trim();

        saveStudents();
    }


    displayStudents();


    alert(
        "📱 Mobile number updated successfully!"
    );
}


// =====================================================
// ADMIN PASSWORD LOGIN
// =====================================================

function showAdminDetails() {

    const password =
        prompt(
            "🔐 Enter Admin Password:"
        );


    if (password === null) {
        return;
    }


    if (
        password !== getAdminPassword()
    ) {

        alert(
            "❌ Wrong Admin Password!"
        );

        return;
    }


    showAdminPanel();
}


// =====================================================
// ADMIN PANEL
// =====================================================

function showAdminPanel() {

    let old =
        document.getElementById(
            "adminPanelModal"
        );


    if (old) {

        old.remove();
    }


    const modal =
        document.createElement("div");


    modal.id =
        "adminPanelModal";


    modal.style.position =
        "fixed";

    modal.style.inset =
        "0";

    modal.style.background =
        "rgba(0,0,0,0.65)";

    modal.style.zIndex =
        "99999";

    modal.style.display =
        "flex";

    modal.style.alignItems =
        "center";

    modal.style.justifyContent =
        "center";

    modal.style.padding =
        "20px";


    const content =
        document.createElement("div");


    content.style.width =
        "100%";

    content.style.maxWidth =
        "650px";

    content.style.maxHeight =
        "85vh";

    content.style.overflowY =
        "auto";

    content.style.background =
        "white";

    content.style.borderRadius =
        "20px";

    content.style.padding =
        "25px";


    let studentHTML = "";


    if (students.length === 0) {

        studentHTML =
            "<p>No registered students yet.</p>";

    } else {

        students.forEach(
            (student, index) => {

                studentHTML += `

                    <div
                        style="
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            border-radius:14px;
                            padding:15px;
                            margin-bottom:12px;
                        "
                    >

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
                        <strong>
                            ${student.mobile || "Not added"}
                        </strong>

                        <br>

                        📌 Status:
                        ${student.status}

                    </div>

                `;
            }
        );
    }


    content.innerHTML = `

        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:20px;
            "
        >

            <h2 style="margin:0;">
                👑 Admin Panel
            </h2>


            <button
                onclick="closeAdminPanel()"
                style="
                    width:40px;
                    height:40px;
                    border:none;
                    border-radius:50%;
                    background:#dc3545;
                    color:white;
                    font-size:18px;
                    cursor:pointer;
                "
            >
                ✖
            </button>

        </div>


        <div
            style="
                background:#eff6ff;
                border:1px solid #bfdbfe;
                padding:16px;
                border-radius:14px;
                margin-bottom:20px;
            "
        >

            <strong>
                👤 Admin:
            </strong>

            ${ADMIN_NAME}

            <br>

            🔐 Admin access: Active

        </div>


        <h3>
            👥 All Registered Students
        </h3>


        <p>
            🔒 Only Admin can view all mobile numbers from this panel.
        </p>


        <div>
            ${studentHTML}
        </div>


        <hr
            style="
                margin:25px 0;
                border:none;
                border-top:1px solid #ddd;
            "
        >


        <h3>
            🔑 Change Admin Password
        </h3>


        <input
            type="password"
            id="currentAdminPassword"
            placeholder="Current Password"
            style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                margin-bottom:10px;
                border:1px solid #ccc;
                border-radius:10px;
            "
        >


        <input
            type="password"
            id="newAdminPassword"
            placeholder="New Password"
            style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                margin-bottom:10px;
                border:1px solid #ccc;
                border-radius:10px;
            "
        >


        <input
            type="password"
            id="confirmAdminPassword"
            placeholder="Confirm New Password"
            style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                margin-bottom:12px;
                border:1px solid #ccc;
                border-radius:10px;
            "
        >


        <button
            onclick="changeAdminPassword()"
            style="
                width:100%;
                padding:13px;
                border:none;
                border-radius:10px;
                background:#2563eb;
                color:white;
                font-size:16px;
                cursor:pointer;
            "
        >
            🔐 Change Password
        </button>

    `;


    modal.appendChild(
        content
    );


    document.body.appendChild(
        modal
    );
}


// =====================================================
// CLOSE ADMIN PANEL
// =====================================================

function closeAdminPanel() {

    const modal =
        document.getElementById(
            "adminPanelModal"
        );


    if (modal) {

        modal.remove();
    }
}


// =====================================================
// CHANGE ADMIN PASSWORD
// =====================================================

function changeAdminPassword() {

    const current =
        document.getElementById(
            "currentAdminPassword"
        ).value;


    const newPassword =
        document.getElementById(
            "newAdminPassword"
        ).value;


    const confirmPassword =
        document.getElementById(
            "confirmAdminPassword"
        ).value;


    if (!current || !newPassword || !confirmPassword) {

        alert(
            "Please fill all password fields."
        );

        return;
    }


    if (
        current !== getAdminPassword()
    ) {

        alert(
            "❌ Current password is incorrect."
        );

        return;
    }


    if (
        newPassword.length < 4
    ) {

        alert(
            "New password must contain at least 4 characters."
        );

        return;
    }


    if (
        newPassword !== confirmPassword
    ) {

        alert(
            "❌ New password and confirm password do not match."
        );

        return;
    }


    localStorage.setItem(
        "adminPassword",
        newPassword
    );


    alert(
        "✅ Admin password changed successfully!"
    );


    closeAdminPanel();
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

                    📌 Status:
                    ${student.status}

                `;


                list.appendChild(
                    div
                );

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
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",

    async function () {

        displayStudents();

        updateDashboard();

        showCurrentDate();

        await loadFaceModels();

    }
);

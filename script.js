/* =========================================================
   SMART ATTENDANCE SYSTEM
   Complete JavaScript
========================================================= */

const COLLEGE =
    "Hooghly Engineering & Technology College";

const ADMIN_NAME =
    "Ayush Chatterjee";

const ADMIN_PIN =
    "1234";

let currentUser = null;
let currentRole = null;

let registrationStream = null;
let attendanceStream = null;

let registrationTimer = null;
let attendanceTimer = null;

let modelsLoaded = false;


/* =========================================================
   STORAGE
========================================================= */

function getStudents() {
    return JSON.parse(
        localStorage.getItem("smartAttendanceStudents") || "[]"
    );
}

function saveStudents(students) {
    localStorage.setItem(
        "smartAttendanceStudents",
        JSON.stringify(students)
    );
}

function getAttendance() {
    return JSON.parse(
        localStorage.getItem("smartAttendanceAttendance") || "[]"
    );
}

function saveAttendance(data) {
    localStorage.setItem(
        "smartAttendanceAttendance",
        JSON.stringify(data)
    );
}


/* =========================================================
   HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function show(elementId) {
    const el = $(elementId);
    if (el) el.style.display = "";
}

function hide(elementId) {
    const el = $(elementId);
    if (el) el.style.display = "none";
}

function message(id, text, success = false) {
    const el = $(id);

    if (!el) return;

    el.textContent = text;
    el.style.color = success ? "#168a45" : "#d83434";
}

function clean(value) {
    return String(value || "").trim();
}

function normalize(value) {
    return clean(value).toLowerCase();
}

function todayKey() {
    const d = new Date();

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
}

function dateTimeInfo() {

    const d = new Date();

    return {
        date: d.toLocaleDateString("en-IN"),
        day: d.toLocaleDateString("en-IN", {
            weekday: "long"
        }),
        time: d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })
    };
}


/* =========================================================
   PAGE CONTROL
========================================================= */

function hideAllMainPages() {

    hide("loginPage");
    hide("createAccountPage");
    hide("forgotPinPage");
    hide("dashboardPage");
}

function openLogin() {

    stopAllCameras();

    hideAllMainPages();

    show("loginPage");

    $("studentLoginBox").style.display = "";
    $("adminLoginBox").style.display = "none";

    $("studentLoginTab").classList.add("active");
    $("adminLoginTab").classList.remove("active");
}

function openCreateAccount() {

    stopAllCameras();

    hideAllMainPages();

    show("createAccountPage");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function openForgotPin() {

    stopAllCameras();

    hideAllMainPages();

    show("forgotPinPage");
}


/* =========================================================
   LOGIN TABS
========================================================= */

function showStudentLogin() {

    $("studentLoginBox").style.display = "";
    $("adminLoginBox").style.display = "none";

    $("studentLoginTab").classList.add("active");
    $("adminLoginTab").classList.remove("active");
}

function showAdminLogin() {

    $("studentLoginBox").style.display = "none";
    $("adminLoginBox").style.display = "";

    $("studentLoginTab").classList.remove("active");
    $("adminLoginTab").classList.add("active");
}


/* =========================================================
   STUDENT CREATE ACCOUNT
========================================================= */

function createAccount() {

    const name = clean($("createName").value);
    const mobile = clean($("createMobile").value);
    const email = clean($("createEmail").value);
    const pin = clean($("createPin").value);
    const confirmPin = clean($("confirmPin").value);
    const department = clean($("createDepartment").value);
    const roll = clean($("createRoll").value);

    if (!name || !mobile || !pin || !confirmPin ||
        !department || !roll) {

        message(
            "createMessage",
            "Please fill all required fields."
        );

        return;
    }

    if (!/^\d{10}$/.test(mobile)) {

        message(
            "createMessage",
            "Mobile number must contain 10 digits."
        );

        return;
    }

    if (!/^\d{4}$/.test(pin)) {

        message(
            "createMessage",
            "PIN must contain exactly 4 digits."
        );

        return;
    }

    if (pin !== confirmPin) {

        message(
            "createMessage",
            "PIN and Confirm PIN do not match."
        );

        return;
    }

    const students = getStudents();

    const duplicate = students.find(student =>
        student.mobile === mobile ||
        (
            email &&
            student.email &&
            normalize(student.email) === normalize(email)
        ) ||
        normalize(student.roll) === normalize(roll)
    );

    if (duplicate) {

        message(
            "createMessage",
            "An account with this mobile, email or roll already exists."
        );

        return;
    }

    const student = {

        id: Date.now().toString(),

        name,
        mobile,
        email,

        pin,

        college: COLLEGE,

        department,
        roll,

        faceImage: "",

        faceRegistered: false,

        registeredAt: new Date().toISOString()
    };

    students.push(student);

    saveStudents(students);

    message(
        "createMessage",
        "Account created successfully! Opening dashboard...",
        true
    );

    setTimeout(() => {

        currentUser = student;
        currentRole = "student";

        openDashboard();

    }, 900);
}


/* =========================================================
   STUDENT LOGIN
========================================================= */

function studentLogin() {

    const name = clean($("loginName").value);
    const identity = clean($("loginIdentity").value);
    const pin = clean($("loginPin").value);

    if (!name || !identity || !pin) {

        message(
            "loginMessage",
            "Please enter name, mobile/email and PIN."
        );

        return;
    }

    const students = getStudents();

    const student = students.find(s => {

        const identityMatch =
            s.mobile === identity ||
            normalize(s.email) === normalize(identity);

        return (
            normalize(s.name) === normalize(name) &&
            identityMatch &&
            s.pin === pin
        );
    });

    if (!student) {

        message(
            "loginMessage",
            "Invalid login details."
        );

        return;
    }

    currentUser = student;
    currentRole = "student";

    message(
        "loginMessage",
        "Login successful!",
        true
    );

    setTimeout(() => {
        openDashboard();
    }, 500);
}


/* =========================================================
   ADMIN LOGIN
========================================================= */

function adminLogin() {

    const name = clean($("adminName").value);
    const pin = clean($("adminPin").value);

    if (!name || !pin) {

        message(
            "adminLoginMessage",
            "Enter admin name and PIN."
        );

        return;
    }

    if (
        normalize(name) !== normalize(ADMIN_NAME) ||
        pin !== ADMIN_PIN
    ) {

        message(
            "adminLoginMessage",
            "Invalid admin login."
        );

        return;
    }

    currentUser = {
        name: ADMIN_NAME,
        role: "Admin",
        college: COLLEGE
    };

    currentRole = "admin";

    message(
        "adminLoginMessage",
        "Admin login successful!",
        true
    );

    setTimeout(() => {
        openDashboard();
    }, 500);
}


/* =========================================================
   DASHBOARD
========================================================= */

function openDashboard() {

    hideAllMainPages();

    show("dashboardPage");

    updateDashboardUser();

    updateCurrentDate();

    updateStats();

    openDashboardHome();

    renderStudents();

    renderAdminStudents();

    updatePersonalFields();
}

function updateDashboardUser() {

    if (currentRole === "admin") {

        $("dashboardUserName").textContent =
            ADMIN_NAME;

        $("dashboardUserRoll").textContent =
            "Administrator";

        $("welcomeName").textContent =
            ADMIN_NAME;

    } else if (currentUser) {

        $("dashboardUserName").textContent =
            currentUser.name;

        $("dashboardUserRoll").textContent =
            currentUser.roll || "Student";

        $("welcomeName").textContent =
            currentUser.name;
    }
}

function updateCurrentDate() {

    const now = new Date();

    $("currentDate").textContent =
        now.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }) +
        " • " +
        now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
}


/* =========================================================
   DASHBOARD SECTIONS
========================================================= */

const sections = [
    "dashboardHome",
    "editProfileSection",
    "editContactSection",
    "faceRegistrationSection",
    "attendanceSection",
    "studentsSection",
    "checkAttendanceSection",
    "adminSection"
];

function hideDashboardSections() {

    sections.forEach(id => {
        const el = $(id);

        if (el) {
            el.style.display = "none";
        }
    });

    document
        .querySelectorAll(".menu-item")
        .forEach(btn => {
            btn.classList.remove("active");
        });
}

function openSection(sectionId, menuButtonId) {

    hideDashboardSections();

    $(sectionId).style.display = "";

    if (menuButtonId && $(menuButtonId)) {
        $(menuButtonId).classList.add("active");
    }

    closeSidebar();

    if (sectionId === "faceRegistrationSection") {
        fillFaceDetails();
    }

    if (sectionId === "attendanceSection") {
        $("attendanceResult").textContent = "";
    }

    if (sectionId === "studentsSection") {
        renderStudents();
    }

    if (sectionId === "checkAttendanceSection") {
        renderAttendanceHistory();
    }

    if (sectionId === "adminSection") {
        renderAdminStudents();
    }
}

function openDashboardHome() {

    hideDashboardSections();

    $("dashboardHome").style.display = "";

    $("dashboardMenuButton").classList.add("active");

    closeSidebar();
}


/* =========================================================
   3 BAR SIDEBAR
========================================================= */

function toggleSidebar() {

    $("sidebar").classList.toggle("open");

    $("sidebarOverlay").classList.toggle("show");
}

function closeSidebar() {

    $("sidebar").classList.remove("open");

    $("sidebarOverlay").classList.remove("show");
}


/* =========================================================
   PROFILE
========================================================= */

function updatePersonalFields() {

    if (!currentUser || currentRole !== "student") {
        return;
    }

    $("editName").value =
        currentUser.name || "";

    $("editRoll").value =
        currentUser.roll || "";

    $("editDepartment").value =
        currentUser.department || "";

    $("editMobile").value =
        currentUser.mobile || "";

    $("editEmail").value =
        currentUser.email || "";
}

function saveProfile() {

    if (!currentUser || currentRole !== "student") {
        return;
    }

    const name = clean($("editName").value);
    const roll = clean($("editRoll").value);
    const department = clean($("editDepartment").value);

    if (!name || !roll || !department) {

        message(
            "profileMessage",
            "Please fill all fields."
        );

        return;
    }

    const students = getStudents();

    const index = students.findIndex(
        s => s.id === currentUser.id
    );

    if (index === -1) return;

    students[index].name = name;
    students[index].roll = roll;
    students[index].department = department;

    currentUser = students[index];

    saveStudents(students);

    updateDashboardUser();

    message(
        "profileMessage",
        "Profile updated successfully.",
        true
    );
}

function saveContact() {

    if (!currentUser || currentRole !== "student") {
        return;
    }

    const mobile = clean($("editMobile").value);
    const email = clean($("editEmail").value);

    if (!/^\d{10}$/.test(mobile)) {

        message(
            "contactMessage",
            "Enter a valid 10 digit mobile number."
        );

        return;
    }

    const students = getStudents();

    const index = students.findIndex(
        s => s.id === currentUser.id
    );

    if (index === -1) return;

    students[index].mobile = mobile;
    students[index].email = email;

    currentUser = students[index];

    saveStudents(students);

    message(
        "contactMessage",
        "Contact details updated successfully.",
        true
    );
}


/* =========================================================
   FACE DETAILS
========================================================= */

function fillFaceDetails() {

    if (!currentUser || currentRole !== "student") {
        return;
    }

    $("faceName").value =
        currentUser.name || "";

    $("faceMobile").value =
        currentUser.mobile || "";

    $("faceEmail").value =
        currentUser.email || "";

    $("departmentName").value =
        currentUser.department || "";

    $("faceRoll").value =
        currentUser.roll || "";
}


/* =========================================================
   FACE API MODEL
========================================================= */

async function loadFaceModels() {

    if (modelsLoaded) {
        return true;
    }

    try {

        const MODEL_URL =
            "https://justadudewhohacks.github.io/face-api.js/models";

        await faceapi.nets.tinyFaceDetector.loadFromUri(
            MODEL_URL
        );

        modelsLoaded = true;

        return true;

    } catch (error) {

        console.error(
            "Face model loading failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   CAMERA
========================================================= */

async function startCamera(video) {

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        throw new Error(
            "Camera is not supported by this browser."
        );
    }

    const stream =
        await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: {
                    ideal: 640
                },
                height: {
                    ideal: 640
                }
            },
            audio: false
        });

    video.srcObject = stream;

    await video.play();

    return stream;
}

function stopStream(stream) {

    if (!stream) return;

    stream.getTracks().forEach(
        track => track.stop()
    );
}

function stopAllCameras() {

    clearInterval(registrationTimer);
    clearInterval(attendanceTimer);

    registrationTimer = null;
    attendanceTimer = null;

    stopStream(registrationStream);
    stopStream(attendanceStream);

    registrationStream = null;
    attendanceStream = null;

    if ($("registrationCamera")) {
        $("registrationCamera").srcObject = null;
    }

    if ($("attendanceCamera")) {
        $("attendanceCamera").srcObject = null;
    }
}


/* =========================================================
   FACE REGISTRATION
========================================================= */

async function startFaceRegistration() {

    if (currentRole !== "student") {

        message(
            "registrationMessage",
            "Only students can register a face."
        );

        return;
    }

    if (registrationStream) {
        return;
    }

    const name = clean($("faceName").value);
    const mobile = clean($("faceMobile").value);
    const department = clean($("departmentName").value);
    const roll = clean($("faceRoll").value);

    if (!name || !mobile || !department || !roll) {

        message(
            "registrationMessage",
            "Please complete your student details first."
        );

        return;
    }

    try {

        $("registrationStatus").textContent =
            "Loading camera...";

        const loaded =
            await loadFaceModels();

        if (!loaded) {

            message(
                "registrationMessage",
                "Face recognition model could not load."
            );

            return;
        }

        registrationStream =
            await startCamera(
                $("registrationCamera")
            );

        $("registrationStatus").textContent =
            "Camera ON • Detecting face...";

        message(
            "registrationMessage",
            "Look directly at the camera. Automatic capture will start.",
            true
        );

        registrationTimer =
            setInterval(
                detectRegistrationFace,
                1200
            );

    } catch (error) {

        console.error(error);

        $("registrationStatus").textContent =
            "Camera is OFF";

        message(
            "registrationMessage",
            "Camera permission is required. Please allow camera access."
        );

        registrationStream = null;
    }
}

async function detectRegistrationFace() {

    const video = $("registrationCamera");

    if (!video.videoWidth) return;

    try {

        const detection =
            await faceapi.detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: 0.5
                })
            );

        if (!detection) {

            $("registrationStatus").textContent =
                "Camera ON • Face not detected";

            return;
        }

        $("registrationStatus").textContent =
            "Face detected • Capturing...";

        captureRegisteredFace();

    } catch (error) {

        console.error(error);
    }
}

function captureRegisteredFace() {

    clearInterval(registrationTimer);

    const video = $("registrationCamera");

    const canvas =
        document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    /*
       Mirror the captured photo so it matches
       the selfie camera preview.
    */

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const image =
        canvas.toDataURL(
            "image/jpeg",
            0.82
        );

    const students = getStudents();

    const index =
        students.findIndex(
            s => s.id === currentUser.id
        );

    if (index === -1) return;

    students[index].name =
        clean($("faceName").value);

    students[index].mobile =
        clean($("faceMobile").value);

    students[index].email =
        clean($("faceEmail").value);

    students[index].department =
        clean($("departmentName").value);

    students[index].roll =
        clean($("faceRoll").value);

    students[index].faceImage = image;

    students[index].faceRegistered = true;

    students[index].faceRegisteredAt =
        new Date().toISOString();

    currentUser = students[index];

    saveStudents(students);

    $("registrationStatus").textContent =
        "Face Registered ✓";

    message(
        "registrationMessage",
        "Face captured and registered successfully!",
        true
    );

    stopStream(registrationStream);

    registrationStream = null;

    $("registrationCamera").srcObject = null;

    updateStats();

    renderStudents();
}


/* =========================================================
   FACE ATTENDANCE
========================================================= */

async function startFaceAttendance() {

    if (!currentUser ||
        currentRole !== "student") {

        showAttendanceResult(
            "Please login as a student first."
        );

        return;
    }

    if (!currentUser.faceRegistered ||
        !currentUser.faceImage) {

        showAttendanceResult(
            "Please register your face before marking attendance."
        );

        return;
    }

    if (attendanceStream) {
        return;
    }

    try {

        $("attendanceStatus").textContent =
            "Loading camera...";

        const loaded =
            await loadFaceModels();

        if (!loaded) {

            showAttendanceResult(
                "Face recognition model could not load."
            );

            return;
        }

        attendanceStream =
            await startCamera(
                $("attendanceCamera")
            );

        $("attendanceStatus").textContent =
            "Camera ON • Detecting face...";

        showAttendanceResult(
            "Look directly at the camera..."
        );

        attendanceTimer =
            setInterval(
                detectAttendanceFace,
                1200
            );

    } catch (error) {

        console.error(error);

        $("attendanceStatus").textContent =
            "Camera is OFF";

        showAttendanceResult(
            "Camera permission is required."
        );

        attendanceStream = null;
    }
}

async function detectAttendanceFace() {

    const video = $("attendanceCamera");

    if (!video.videoWidth) return;

    try {

        const detection =
            await faceapi.detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: 0.5
                })
            );

        if (!detection) {

            $("attendanceStatus").textContent =
                "Camera ON • Face not detected";

            return;
        }

        $("attendanceStatus").textContent =
            "Face detected • Marking attendance...";

        markAttendance();

    } catch (error) {

        console.error(error);
    }
}

function markAttendance() {

    clearInterval(attendanceTimer);

    const records = getAttendance();

    const today = todayKey();

    const alreadyMarked =
        records.some(record =>
            record.studentId === currentUser.id &&
            record.dateKey === today
        );

    if (alreadyMarked) {

        stopStream(attendanceStream);

        attendanceStream = null;

        $("attendanceCamera").srcObject = null;

        $("attendanceStatus").textContent =
            "Already Marked";

        showAttendancePopup(
            "ℹ️",
            "Attendance Already Marked",
            "Your attendance for today has already been recorded."
        );

        return;
    }

    const info = dateTimeInfo();

    const record = {

        id: Date.now().toString(),

        studentId: currentUser.id,

        studentName: currentUser.name,

        roll: currentUser.roll,

        department: currentUser.department,

        dateKey: today,

        date: info.date,

        day: info.day,

        time: info.time,

        status: "Present"
    };

    records.push(record);

    saveAttendance(records);

    stopStream(attendanceStream);

    attendanceStream = null;

    $("attendanceCamera").srcObject = null;

    $("attendanceStatus").textContent =
        "Attendance Marked ✓";

    showAttendancePopup(
        "✅",
        "Attendance Marked Successfully!",
        `${currentUser.name}, your attendance has been recorded on ${info.day}, ${info.date} at ${info.time}.`
    );

    showAttendanceResult(
        `Present • ${info.date} • ${info.day} • ${info.time}`
    );

    updateStats();

    renderAttendanceHistory();
}


/* =========================================================
   ATTENDANCE POPUP
========================================================= */

function showAttendancePopup(
    icon,
    title,
    text
) {

    $("popupIcon").textContent = icon;
    $("popupTitle").textContent = title;
    $("popupMessage").textContent = text;

    $("attendancePopup").style.display =
        "grid";
}

function closeAttendancePopup() {

    $("attendancePopup").style.display =
        "none";
}

function showAttendanceResult(text) {

    $("attendanceResult").textContent =
        text;
}


/* =========================================================
   STUDENTS
========================================================= */

function renderStudents() {

    const container =
        $("studentList");

    if (!container) return;

    const students = getStudents();

    const search =
        normalize(
            $("searchStudent")
                ? $("searchStudent").value
                : ""
        );

    const filtered =
        students.filter(student => {

            if (!search) return true;

            return (
                normalize(student.name).includes(search) ||
                normalize(student.roll).includes(search) ||
                normalize(student.department).includes(search) ||
                normalize(student.mobile).includes(search)
            );
        });

    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="details-card">
                <h3>No students registered yet.</h3>
            </div>
        `;

        return;
    }

    container.innerHTML =
        filtered.map(student =>
            studentCardHTML(student)
        ).join("");
}

function studentCardHTML(student) {

    const face =
        student.faceImage ||
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="200"
                 height="200">
                <rect width="100%"
                      height="100%"
                      fill="#eef2f7"/>
                <text x="50%"
                      y="50%"
                      text-anchor="middle"
                      dominant-baseline="middle"
                      font-size="70">
                    👤
                </text>
            </svg>
        `);

    return `
        <div class="student-card">

            <img
                src="${face}"
                class="student-face"
                alt="Student Face">

            <div class="student-info">

                <h3>${escapeHTML(student.name)}</h3>

                <p>
                    <strong>Mobile:</strong>
                    ${escapeHTML(student.mobile || "-")}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(student.email || "-")}
                </p>

                <p>
                    <strong>Branch:</strong>
                    ${escapeHTML(student.department || "-")}
                </p>

                <p>
                    <strong>Roll:</strong>
                    ${escapeHTML(student.roll || "-")}
                </p>

                <p>
                    <strong>Face:</strong>
                    ${student.faceRegistered
                        ? "Registered ✓"
                        : "Not Registered"}
                </p>

                ${
                    student.faceRegisteredAt
                    ?
                    `<p>
                        <strong>Face Registered:</strong>
                        ${formatDateTime(student.faceRegisteredAt)}
                    </p>`
                    :
                    ""
                }

            </div>

        </div>
    `;
}

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDateTime(value) {

    const d = new Date(value);

    return d.toLocaleString("en-IN");
}


/* =========================================================
   ADMIN STUDENTS
========================================================= */

function renderAdminStudents() {

    const container =
        $("adminStudentList");

    if (!container) return;

    const students = getStudents();

    if (students.length === 0) {

        container.innerHTML = `
            <div class="details-card">
                <h3>No students registered yet.</h3>
            </div>
        `;

        return;
    }

    container.innerHTML =
        students.map(student =>
            studentCardHTML(student)
        ).join("");
}


/* =========================================================
   ATTENDANCE HISTORY
========================================================= */

function renderAttendanceHistory() {

    const container =
        $("attendanceHistory");

    if (!container) return;

    if (!currentUser ||
        currentRole !== "student") {

        container.innerHTML = `
            <div class="details-card">
                Login as a student to view attendance.
            </div>
        `;

        return;
    }

    const records =
        getAttendance()
            .filter(
                record =>
                    record.studentId === currentUser.id
            )
            .sort(
                (a, b) =>
                    b.id.localeCompare(a.id)
            );

    const present =
        records.filter(
            r => r.status === "Present"
        ).length;

    $("attendanceTotalDays").textContent =
        records.length;

    $("attendancePresentDays").textContent =
        present;

    $("attendanceAbsentDays").textContent =
        Math.max(0, records.length - present);

    if (records.length === 0) {

        container.innerHTML = `
            <div class="details-card">
                No attendance records yet.
            </div>
        `;

        return;
    }

    container.innerHTML =
        records.map(record => `

            <div class="attendance-row">

                <div>
                    <strong>
                        ${escapeHTML(record.date)}
                    </strong>

                    <div>
                        ${escapeHTML(record.day)}
                    </div>

                    <small>
                        ${escapeHTML(record.time)}
                    </small>
                </div>

                <div class="present-badge">
                    ✓ ${escapeHTML(record.status)}
                </div>

            </div>

        `).join("");
}


/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

function updateStats() {

    const students =
        getStudents();

    const records =
        getAttendance();

    const today =
        todayKey();

    const todayPresent =
        records.filter(
            r =>
                r.dateKey === today &&
                r.status === "Present"
        );

    const total =
        students.length;

    const present =
        todayPresent.length;

    const absent =
        Math.max(0, total - present);

    const percentage =
        total > 0
            ? Math.round(
                (present / total) * 100
            )
            : 0;

    $("totalStudents").textContent =
        total;

    $("presentStudents").textContent =
        present;

    $("absentStudents").textContent =
        absent;

    $("attendancePercentage").textContent =
        percentage + "%";
}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const search =
        $("searchStudent");

    if (!search) return;

    search.addEventListener(
        "input",
        renderStudents
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    stopAllCameras();

    currentUser = null;
    currentRole = null;

    closeSidebar();

    openLogin();

    $("loginName").value = "";
    $("loginIdentity").value = "";
    $("loginPin").value = "";

    $("adminName").value = "";
    $("adminPin").value = "";

    message(
        "loginMessage",
        ""
    );
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* Login */

        $("loginButton")
            .addEventListener(
                "click",
                studentLogin
            );

        $("createAccountButton")
            .addEventListener(
                "click",
                openCreateAccount
            );

        $("forgotPinButton")
            .addEventListener(
                "click",
                openForgotPin
            );

        $("studentLoginTab")
            .addEventListener(
                "click",
                showStudentLogin
            );

        $("adminLoginTab")
            .addEventListener(
                "click",
                showAdminLogin
            );

        $("adminLoginButton")
            .addEventListener(
                "click",
                adminLogin
            );

        $("adminBackStudentButton")
            .addEventListener(
                "click",
                showStudentLogin
            );


        /* Create */

        $("createAccountSubmit")
            .addEventListener(
                "click",
                createAccount
            );

        $("backToLoginButton")
            .addEventListener(
                "click",
                openLogin
            );


        /* Forgot */

        $("forgotBackButton")
            .addEventListener(
                "click",
                openLogin
            );

        $("resetPinButton")
            .addEventListener(
                "click",
                resetPin
            );


        /* Sidebar */

        $("menuToggle")
            .addEventListener(
                "click",
                toggleSidebar
            );

        $("sidebarOverlay")
            .addEventListener(
                "click",
                closeSidebar
            );


        /* Dashboard */

        $("dashboardMenuButton")
            .addEventListener(
                "click",
                openDashboardHome
            );

        $("editProfileMenuButton")
            .addEventListener(
                "click",
                () =>
                    openSection(
                        "editProfileSection",
                        "editProfileMenuButton"
                    )
            );

        $("editContactMenuButton")
            .addEventListener(
                "click",
                () =>
                    openSection(
                        "editContactSection",
                        "editContactMenuButton"
                    )
            );

        $("studentsMenuButton")
            .addEventListener(
                "click",
                () =>
                    openSection(
                        "studentsSection",
                        "studentsMenuButton"
                    )
            );

        $("checkAttendanceMenuButton")
            .addEventListener(
                "click",
                () =>
                    openSection(
                        "checkAttendanceSection",
                        "checkAttendanceMenuButton"
                    )
            );

        $("adminMenuButton")
            .addEventListener(
                "click",
                () =>
                    openSection(
                        "adminSection",
                        "adminMenuButton"
                    )
            );

        $("logoutButton")
            .addEventListener(
                "click",
                logout
            );


        /* Profile */

        $("saveEditedDetailsButton")
            .addEventListener(
                "click",
                saveProfile
            );

        $("saveContactButton")
            .addEventListener(
                "click",
                saveContact
            );


        /* Quick Actions */

        $("quickFaceRegistration")
            .addEventListener(
                "click",
                () =>
                    openSection(
                        "faceRegistrationSection"
                    )
            );

        $("quickAttendance")
            .addEventListener(
                "click",
                () =>
                    openSection(
                        "attendanceSection"
                    )
            );

        $("quickCheckAttendance")
            .addEventListener(
                "click",
                () =>
                    openSection(
                        "checkAttendanceSection",
                        "checkAttendanceMenuButton"
                    )
            );


        /* Face */

        $("startFaceRegistrationButton")
            .addEventListener(
                "click",
                startFaceRegistration
            );

        $("startFaceAttendanceButton")
            .addEventListener(
                "click",
                startFaceAttendance
            );


        /* Popup */

        $("closeAttendancePopup")
            .addEventListener(
                "click",
                closeAttendancePopup
            );


        /* Search */

        setupSearch();


        /* Initial page */

        openLogin();

    }
);


/* =========================================================
   FORGOT PIN
========================================================= */

function resetPin() {

    const name =
        clean($("forgotName").value);

    const identity =
        clean($("forgotIdentity").value);

    const newPin =
        clean($("newPin").value);

    const confirmPin =
        clean($("confirmNewPin").value);

    if (!name ||
        !identity ||
        !newPin ||
        !confirmPin) {

        message(
            "forgotMessage",
            "Please fill all fields."
        );

        return;
    }

    if (!/^\d{4}$/.test(newPin)) {

        message(
            "forgotMessage",
            "PIN must contain 4 digits."
        );

        return;
    }

    if (newPin !== confirmPin) {

        message(
            "forgotMessage",
            "New PINs do not match."
        );

        return;
    }

    const students =
        getStudents();

    const index =
        students.findIndex(student => {

            const identityMatch =
                student.mobile === identity ||
                normalize(student.email) ===
                normalize(identity);

            return (
                normalize(student.name) ===
                normalize(name) &&
                identityMatch
            );
        });

    if (index === -1) {

        message(
            "forgotMessage",
            "No matching account found."
        );

        return;
    }

    students[index].pin =
        newPin;

    saveStudents(students);

    message(
        "forgotMessage",
        "PIN reset successfully. You can login now.",
        true
    );

    setTimeout(
        openLogin,
        1200
    );
}

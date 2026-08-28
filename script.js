/* ============================================================
   SMART ATTENDANCE SYSTEM
   script.js
   Works with the supplied index.html
============================================================ */

"use strict";

/* ============================================================
   CONSTANTS
============================================================ */

const COLLEGE_NAME = "Hooghly Engineering & Technology College";
const ADMIN_NAME = "Ayush Chatterjee";

const STORAGE_USERS = "smartAttendanceUsers";
const STORAGE_ATTENDANCE = "smartAttendanceRecords";
const STORAGE_CURRENT_USER = "smartAttendanceCurrentUser";

let currentUser = null;
let registrationStream = null;
let attendanceStream = null;
let registrationTimer = null;
let attendanceTimer = null;
let registrationBusy = false;
let attendanceBusy = false;

/* ============================================================
   BASIC HELPERS
============================================================ */

function $(id) {
    return document.getElementById(id);
}

function show(element) {
    if (element) element.style.display = "";
}

function hide(element) {
    if (element) element.style.display = "none";
}

function setMessage(id, text, type = "info") {
    const el = $(id);

    if (!el) return;

    el.textContent = text;
    el.className = "auth-message " + type;
}

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function getAttendanceRecords() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_ATTENDANCE)) || [];
    } catch (error) {
        return [];
    }
}

function saveAttendanceRecords(records) {
    localStorage.setItem(STORAGE_ATTENDANCE, JSON.stringify(records));
}

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function validPin(pin) {
    return /^\d{4}$/.test(String(pin || ""));
}

function validMobile(mobile) {
    return /^\d{10}$/.test(String(mobile || ""));
}

/* ============================================================
   PAGE NAVIGATION
============================================================ */

function hideAllPages() {
    hide($("loginPage"));
    hide($("createAccountPage"));
    hide($("forgotPinPage"));
    hide($("dashboardPage"));
}

function showLoginPage() {
    stopAllCameras();
    hideAllPages();
    show($("loginPage"));

    setMessage("loginMessage", "", "info");
}

function showCreateAccountPage() {
    stopAllCameras();
    hideAllPages();
    show($("createAccountPage"));

    setMessage("createMessage", "", "info");
}

function showForgotPinPage() {
    stopAllCameras();
    hideAllPages();
    show($("forgotPinPage"));

    setMessage("forgotMessage", "", "info");
}

function showDashboard() {
    hideAllPages();
    show($("dashboardPage"));

    updateDashboardUser();
    updateCurrentDate();
    updateStatistics();

    showDashboardSection("dashboardHome");
}

/* ============================================================
   LOGIN
============================================================ */

function loginUser() {
    const name = $("loginName")?.value.trim();
    const identity = $("loginIdentity")?.value.trim();
    const pin = $("loginPin")?.value.trim();

    if (!name || !identity || !pin) {
        setMessage(
            "loginMessage",
            "Please fill in Name, Mobile/Email and PIN.",
            "error"
        );
        return;
    }

    if (!validPin(pin)) {
        setMessage(
            "loginMessage",
            "PIN must contain exactly 4 digits.",
            "error"
        );
        return;
    }

    /* Admin login */
    if (
        normalize(name) === normalize(ADMIN_NAME) &&
        pin === "1234"
    ) {
        currentUser = {
            id: "admin",
            name: ADMIN_NAME,
            mobile: identity,
            email: identity.includes("@") ? identity : "",
            college: COLLEGE_NAME,
            department: "Administration",
            roll: "ADMIN",
            role: "Admin"
        };

        localStorage.setItem(
            STORAGE_CURRENT_USER,
            JSON.stringify(currentUser)
        );

        setMessage(
            "loginMessage",
            "Login successful. Welcome Admin!",
            "success"
        );

        setTimeout(showDashboard, 400);
        return;
    }

    const users = getUsers();

    const user = users.find(function (u) {
        const sameName =
            normalize(u.name) === normalize(name);

        const sameIdentity =
            normalize(u.mobile) === normalize(identity) ||
            normalize(u.email) === normalize(identity);

        return sameName && sameIdentity && u.pin === pin;
    });

    if (!user) {
        setMessage(
            "loginMessage",
            "Account not found or PIN is incorrect.",
            "error"
        );
        return;
    }

    currentUser = user;

    localStorage.setItem(
        STORAGE_CURRENT_USER,
        JSON.stringify(currentUser)
    );

    setMessage(
        "loginMessage",
        "Login successful!",
        "success"
    );

    setTimeout(showDashboard, 400);
}

/* ============================================================
   CREATE ACCOUNT
============================================================ */

function createAccount() {
    const name = $("createName")?.value.trim();
    const mobile = $("createMobile")?.value.trim();
    const email = $("createEmail")?.value.trim();
    const pin = $("createPin")?.value.trim();
    const confirmPin = $("confirmPin")?.value.trim();
    const college = $("createCollege")?.value.trim() || COLLEGE_NAME;
    const department = $("createDepartment")?.value.trim();
    const roll = $("createRoll")?.value.trim();

    if (!name || !mobile || !pin || !confirmPin || !department || !roll) {
        setMessage(
            "createMessage",
            "Please fill all required (*) fields.",
            "error"
        );
        return;
    }

    if (!validMobile(mobile)) {
        setMessage(
            "createMessage",
            "Mobile number must contain exactly 10 digits.",
            "error"
        );
        return;
    }

    if (!validPin(pin)) {
        setMessage(
            "createMessage",
            "PIN must contain exactly 4 digits.",
            "error"
        );
        return;
    }

    if (pin !== confirmPin) {
        setMessage(
            "createMessage",
            "PIN and Confirm PIN do not match.",
            "error"
        );
        return;
    }

    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        setMessage(
            "createMessage",
            "Please enter a valid email address.",
            "error"
        );
        return;
    }

    const users = getUsers();

    const mobileExists = users.some(
        u => normalize(u.mobile) === normalize(mobile)
    );

    if (mobileExists) {
        setMessage(
            "createMessage",
            "This mobile number is already registered.",
            "error"
        );
        return;
    }

    if (email) {
        const emailExists = users.some(
            u => normalize(u.email) === normalize(email)
        );

        if (emailExists) {
            setMessage(
                "createMessage",
                "This email is already registered.",
                "error"
            );
            return;
        }
    }

    const rollExists = users.some(
        u =>
            normalize(u.roll) === normalize(roll) &&
            normalize(u.department) === normalize(department)
    );

    if (rollExists) {
        setMessage(
            "createMessage",
            "This roll number is already registered in this department.",
            "error"
        );
        return;
    }

    const newUser = {
        id: "student_" + Date.now(),
        name,
        mobile,
        email,
        pin,
        college,
        department,
        roll,
        role: "Student",
        faceRegistered: false,
        faceData: null,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    setMessage(
        "createMessage",
        "Account created successfully! Returning to Login...",
        "success"
    );

    setTimeout(function () {
        $("loginName").value = name;
        $("loginIdentity").value = mobile;
        $("loginPin").value = "";

        showLoginPage();
    }, 900);
}

/* ============================================================
   FORGOT PIN
============================================================ */

function resetPin() {
    const name = $("forgotName")?.value.trim();
    const identity = $("forgotIdentity")?.value.trim();
    const newPin = $("newPin")?.value.trim();
    const confirmNewPin = $("confirmNewPin")?.value.trim();

    if (!name || !identity || !newPin || !confirmNewPin) {
        setMessage(
            "forgotMessage",
            "Please fill all fields.",
            "error"
        );
        return;
    }

    if (!validPin(newPin)) {
        setMessage(
            "forgotMessage",
            "New PIN must contain exactly 4 digits.",
            "error"
        );
        return;
    }

    if (newPin !== confirmNewPin) {
        setMessage(
            "forgotMessage",
            "PINs do not match.",
            "error"
        );
        return;
    }

    const users = getUsers();

    const index = users.findIndex(function (u) {
        return (
            normalize(u.name) === normalize(name) &&
            (
                normalize(u.mobile) === normalize(identity) ||
                normalize(u.email) === normalize(identity)
            )
        );
    });

    if (index === -1) {
        setMessage(
            "forgotMessage",
            "No matching account was found.",
            "error"
        );
        return;
    }

    users[index].pin = newPin;
    saveUsers(users);

    setMessage(
        "forgotMessage",
        "PIN reset successfully. Returning to Login...",
        "success"
    );

    setTimeout(function () {
        $("loginName").value = users[index].name;
        $("loginIdentity").value = users[index].mobile;
        $("loginPin").value = "";

        showLoginPage();
    }, 900);
}

/* ============================================================
   DASHBOARD USER
============================================================ */

function updateDashboardUser() {
    if (!currentUser) return;

    if ($("dashboardUserName")) {
        $("dashboardUserName").textContent = currentUser.name;
    }

    if ($("dashboardUserRoll")) {
        $("dashboardUserRoll").textContent =
            currentUser.role === "Admin"
                ? "Admin"
                : currentUser.roll || "Student";
    }

    if ($("welcomeName")) {
        $("welcomeName").textContent = currentUser.name;
    }

    if ($("personalName")) {
        $("personalName").textContent = currentUser.name;
    }

    if ($("personalMobile")) {
        $("personalMobile").textContent =
            currentUser.mobile || "-";
    }

    if ($("personalEmail")) {
        $("personalEmail").textContent =
            currentUser.email || "-";
    }

    if ($("personalDepartment")) {
        $("personalDepartment").textContent =
            currentUser.department || "-";
    }

    if ($("personalRoll")) {
        $("personalRoll").textContent =
            currentUser.roll || "-";
    }

    fillEditFields();
    fillFaceFields();
}

/* ============================================================
   EDIT PROFILE
============================================================ */

function fillEditFields() {
    if (!currentUser) return;

    if ($("editName")) {
        $("editName").value = currentUser.name || "";
    }

    if ($("editRoll")) {
        $("editRoll").value = currentUser.roll || "";
    }

    if ($("editDepartment")) {
        $("editDepartment").value =
            currentUser.department || "";
    }

    if ($("editMobile")) {
        $("editMobile").value =
            currentUser.mobile || "";
    }

    if ($("editEmail")) {
        $("editEmail").value =
            currentUser.email || "";
    }
}

function saveProfile() {
    if (!currentUser) return;

    const name = $("editName")?.value.trim();
    const roll = $("editRoll")?.value.trim();
    const department =
        $("editDepartment")?.value.trim();

    if (!name || !roll || !department) {
        alert("Name, Roll and Department are required.");
        return;
    }

    if (currentUser.role !== "Admin") {
        const users = getUsers();

        const index = users.findIndex(
            u => u.id === currentUser.id
        );

        if (index !== -1) {
            users[index].name = name;
            users[index].roll = roll;
            users[index].department = department;

            currentUser = users[index];

            saveUsers(users);
        }
    } else {
        currentUser.name = name;
        currentUser.roll = roll;
        currentUser.department = department;
    }

    localStorage.setItem(
        STORAGE_CURRENT_USER,
        JSON.stringify(currentUser)
    );

    updateDashboardUser();

    alert("Profile updated successfully.");
}

function saveContact() {
    if (!currentUser) return;

    const mobile = $("editMobile")?.value.trim();
    const email = $("editEmail")?.value.trim();

    if (!validMobile(mobile)) {
        setMessage(
            "contactMessage",
            "Mobile number must contain exactly 10 digits.",
            "error"
        );
        return;
    }

    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        setMessage(
            "contactMessage",
            "Please enter a valid email.",
            "error"
        );
        return;
    }

    if (currentUser.role !== "Admin") {
        const users = getUsers();

        const index = users.findIndex(
            u => u.id === currentUser.id
        );

        if (index !== -1) {
            users[index].mobile = mobile;
            users[index].email = email;

            currentUser = users[index];

            saveUsers(users);
        }
    } else {
        currentUser.mobile = mobile;
        currentUser.email = email;
    }

    localStorage.setItem(
        STORAGE_CURRENT_USER,
        JSON.stringify(currentUser)
    );

    updateDashboardUser();

    setMessage(
        "contactMessage",
        "Contact details updated successfully.",
        "success"
    );
}

/* ============================================================
   FACE FIELDS
============================================================ */

function fillFaceFields() {
    if (!currentUser) return;

    if ($("faceName")) {
        $("faceName").value = currentUser.name || "";
    }

    if ($("faceMobile")) {
        $("faceMobile").value =
            currentUser.mobile || "";
    }

    if ($("faceEmail")) {
        $("faceEmail").value =
            currentUser.email || "";
    }

    if ($("collegeName")) {
        $("collegeName").value =
            currentUser.college || COLLEGE_NAME;
    }

    if ($("departmentName")) {
        $("departmentName").value =
            currentUser.department || "";
    }

    if ($("faceRoll")) {
        $("faceRoll").value =
            currentUser.roll || "";
    }
}

/* ============================================================
   SECTION NAVIGATION
============================================================ */

const dashboardSections = [
    "dashboardHome",
    "editProfileSection",
    "editContactSection",
    "personalDetailsSection",
    "faceRegistrationSection",
    "attendanceSection",
    "studentsSection",
    "checkAttendanceSection",
    "adminSection"
];

function showDashboardSection(sectionId) {
    dashboardSections.forEach(function (id) {
        const section = $(id);

        if (section) {
            hide(section);
        }
    });

    const selected = $(sectionId);

    if (selected) {
        show(selected);
    }

    document
        .querySelectorAll(".menu-item")
        .forEach(function (button) {
            button.classList.remove("active");
        });

    const buttonMap = {
        dashboardHome: "dashboardMenuButton",
        editProfileSection: "editProfileMenuButton",
        editContactSection: "editContactMenuButton",
        personalDetailsSection: "personalDetailsMenuButton",
        faceRegistrationSection: "faceRegistrationMenuButton",
        attendanceSection: "attendanceMenuButton",
        studentsSection: "studentsMenuButton",
        checkAttendanceSection: "checkAttendanceMenuButton",
        adminSection: "adminMenuButton"
    };

    const activeButton = $(buttonMap[sectionId]);

    if (activeButton) {
        activeButton.classList.add("active");
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

    if (sectionId === "faceRegistrationSection") {
        fillFaceFields();
    }
}

/* ============================================================
   DATE & TIME
============================================================ */

function getDateTimeInfo() {
    const now = new Date();

    const date = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    const day = now.toLocaleDateString("en-IN", {
        weekday: "long"
    });

    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    return {
        date,
        day,
        time,
        timestamp: now.toISOString()
    };
}

function updateCurrentDate() {
    const info = getDateTimeInfo();

    if ($("currentDate")) {
        $("currentDate").textContent =
            `${info.day} • ${info.date} • ${info.time}`;
    }
}

/* Keep dashboard clock updated */
setInterval(updateCurrentDate, 1000);

/* ============================================================
   CAMERA HELPERS
============================================================ */

async function startCamera(videoElement) {
    if (!videoElement) {
        throw new Error("Camera element not found.");
    }

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
                    ideal: 480
                }
            },
            audio: false
        });

    videoElement.srcObject = stream;

    videoElement.style.transform = "scaleX(-1)";

    await videoElement.play();

    return stream;
}

function stopStream(stream) {
    if (!stream) return;

    stream.getTracks().forEach(function (track) {
        track.stop();
    });
}

function stopAllCameras() {
    if (registrationTimer) {
        clearTimeout(registrationTimer);
        registrationTimer = null;
    }

    if (attendanceTimer) {
        clearTimeout(attendanceTimer);
        attendanceTimer = null;
    }

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

    if ($("registrationStatus")) {
        $("registrationStatus").textContent =
            "Camera is OFF";
    }

    if ($("attendanceStatus")) {
        $("attendanceStatus").textContent =
            "Camera is OFF";
    }

    registrationBusy = false;
    attendanceBusy = false;
}

/* ============================================================
   TAKE MIRROR CAMERA SNAPSHOT
============================================================ */

function captureMirrorImage(video) {
    if (!video || !video.videoWidth) {
        return null;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return canvas.toDataURL(
        "image/jpeg",
        0.85
    );
}

/* ============================================================
   FACE REGISTRATION
============================================================ */

async function startFaceRegistration() {
    if (registrationBusy) return;

    registrationBusy = true;

    const video = $("registrationCamera");

    if (!video) {
        registrationBusy = false;
        return;
    }

    try {
        setMessage(
            "registrationMessage",
            "Starting camera...",
            "info"
        );

        registrationStream =
            await startCamera(video);

        if ($("registrationStatus")) {
            $("registrationStatus").textContent =
                "Camera is ON";
        }

        setMessage(
            "registrationMessage",
            "Camera started. Keep your face inside the guide. Automatic capture will happen shortly.",
            "info"
        );

        /*
         * Automatic capture.
         * This version captures automatically after
         * the camera becomes ready.
         */
        registrationTimer = setTimeout(
            completeFaceRegistration,
            3500
        );

    } catch (error) {
        console.error(error);

        setMessage(
            "registrationMessage",
            "Camera could not start. Please allow camera permission and try again.",
            "error"
        );

        registrationBusy = false;
    }
}

function completeFaceRegistration() {
    const video = $("registrationCamera");

    if (!video || !video.videoWidth) {
        setMessage(
            "registrationMessage",
            "Camera is not ready. Please try again.",
            "error"
        );

        registrationBusy = false;
        return;
    }

    const imageData =
        captureMirrorImage(video);

    if (!imageData) {
        setMessage(
            "registrationMessage",
            "Could not capture image. Please try again.",
            "error"
        );

        registrationBusy = false;
        return;
    }

    const name = $("faceName")?.value.trim();
    const mobile = $("faceMobile")?.value.trim();
    const email = $("faceEmail")?.value.trim();
    const department =
        $("departmentName")?.value.trim();
    const roll = $("faceRoll")?.value.trim();

    if (!name || !mobile || !department || !roll) {
        setMessage(
            "registrationMessage",
            "Please complete the student details first.",
            "error"
        );

        registrationBusy = false;
        return;
    }

    currentUser.faceRegistered = true;
    currentUser.faceData = imageData;
    currentUser.name = name;
    currentUser.mobile = mobile;
    currentUser.email = email;
    currentUser.department = department;
    currentUser.roll = roll;

    if (currentUser.role !== "Admin") {
        const users = getUsers();

        const index = users.findIndex(
            u => u.id === currentUser.id
        );

        if (index !== -1) {
            users[index] = currentUser;
            saveUsers(users);
        }
    }

    localStorage.setItem(
        STORAGE_CURRENT_USER,
        JSON.stringify(currentUser)
    );

    stopStream(registrationStream);
    registrationStream = null;

    video.srcObject = null;

    if ($("registrationStatus")) {
        $("registrationStatus").textContent =
            "Face Captured ✓";
    }

    setMessage(
        "registrationMessage",
        "Face captured and registered successfully!",
        "success"
    );

    registrationBusy = false;

    updateDashboardUser();
}

/* ============================================================
   FACE ATTENDANCE
============================================================ */

async function startFaceAttendance() {
    if (attendanceBusy) return;

    attendanceBusy = true;

    const video = $("attendanceCamera");

    if (!video) {
        attendanceBusy = false;
        return;
    }

    try {
        if ($("attendanceResult")) {
            $("attendanceResult").textContent =
                "Starting camera...";
        }

        attendanceStream =
            await startCamera(video);

        if ($("attendanceStatus")) {
            $("attendanceStatus").textContent =
                "Camera is ON";
        }

        if ($("attendanceResult")) {
            $("attendanceResult").textContent =
                "Camera ready. Automatic face capture will happen shortly...";
        }

        attendanceTimer = setTimeout(
            completeFaceAttendance,
            3500
        );

    } catch (error) {
        console.error(error);

        if ($("attendanceResult")) {
            $("attendanceResult").textContent =
                "Camera permission was not allowed.";
        }

        attendanceBusy = false;
    }
}

function completeFaceAttendance() {
    const video = $("attendanceCamera");

    if (!video || !video.videoWidth) {
        if ($("attendanceResult")) {
            $("attendanceResult").textContent =
                "Camera is not ready. Please try again.";
        }

        attendanceBusy = false;
        return;
    }

    if (!currentUser) {
        attendanceBusy = false;
        return;
    }

    const imageData =
        captureMirrorImage(video);

    if (!imageData) {
        attendanceBusy = false;
        return;
    }

    /*
     * If student has not registered a face yet,
     * ask them to register first.
     */
    if (
        currentUser.role !== "Admin" &&
        !currentUser.faceRegistered
    ) {
        if ($("attendanceResult")) {
            $("attendanceResult").textContent =
                "Please register your face first.";
        }

        stopStream(attendanceStream);
        attendanceStream = null;
        video.srcObject = null;

        attendanceBusy = false;
        return;
    }

    const info = getDateTimeInfo();
    const records = getAttendanceRecords();

    const todayKey =
        info.date + "_" + currentUser.id;

    const alreadyMarked = records.some(
        record => record.todayKey === todayKey
    );

    if (alreadyMarked) {
        stopStream(attendanceStream);
        attendanceStream = null;
        video.srcObject = null;

        if ($("attendanceStatus")) {
            $("attendanceStatus").textContent =
                "Already Marked";
        }

        if ($("attendanceResult")) {
            $("attendanceResult").textContent =
                "Attendance has already been marked today.";
        }

        attendanceBusy = false;
        return;
    }

    const record = {
        id: "attendance_" + Date.now(),
        todayKey,
        userId: currentUser.id,
        name: currentUser.name,
        mobile: currentUser.mobile || "",
        email: currentUser.email || "",
        department: currentUser.department || "",
        roll: currentUser.roll || "",
        date: info.date,
        day: info.day,
        time: info.time,
        timestamp: info.timestamp,
        status: "Present",
        faceSnapshot: imageData
    };

    records.push(record);
    saveAttendanceRecords(records);

    stopStream(attendanceStream);
    attendanceStream = null;
    video.srcObject = null;

    if ($("attendanceStatus")) {
        $("attendanceStatus").textContent =
            "Attendance Marked ✓";
    }

    if ($("attendanceResult")) {
        $("attendanceResult").textContent =
            `Present • ${info.day} • ${info.date} • ${info.time}`;
    }

    attendanceBusy = false;

    updateStatistics();
    renderAttendanceHistory();

    showAttendancePopup(record);
}

/* ============================================================
   ATTENDANCE POPUP
============================================================ */

function showAttendancePopup(record) {
    if (!$("attendancePopup")) return;

    if ($("popupIcon")) {
        $("popupIcon").textContent = "✅";
    }

    if ($("popupTitle")) {
        $("popupTitle").textContent =
            "Attendance Marked!";
    }

    if ($("popupMessage")) {
        $("popupMessage").textContent =
            `${record.name}, your attendance was successfully saved on ${record.date} (${record.day}) at ${record.time}.`;
    }

    show($("attendancePopup"));
}

function closeAttendancePopup() {
    hide($("attendancePopup"));
}

/* ============================================================
   STATISTICS
============================================================ */

function updateStatistics() {
    const users = getUsers();
    const records = getAttendanceRecords();

    const totalStudents = users.length;

    const today = getDateTimeInfo().date;

    const presentToday = new Set(
        records
            .filter(r => r.date === today)
            .map(r => r.userId)
    ).size;

    const absentToday =
        Math.max(
            0,
            totalStudents - presentToday
        );

    let percentage = 0;

    if (totalStudents > 0) {
        percentage =
            Math.round(
                (presentToday / totalStudents) * 100
            );
    }

    if ($("totalStudents")) {
        $("totalStudents").textContent =
            totalStudents;
    }

    if ($("presentStudents")) {
        $("presentStudents").textContent =
            presentToday;
    }

    if ($("absentStudents")) {
        $("absentStudents").textContent =
            absentToday;
    }

    if ($("attendancePercentage")) {
        $("attendancePercentage").textContent =
            percentage + "%";
    }
}

/* ============================================================
   STUDENT LIST
============================================================ */

function renderStudents() {
    const container = $("studentList");

    if (!container) return;

    const users = getUsers();

    if (users.length === 0) {
        container.innerHTML =
            "<p>No students registered yet.</p>";
        return;
    }

    renderStudentCards(
        container,
        users
    );
}

function renderAdminStudents() {
    const container = $("adminStudentList");

    if (!container) return;

    const users = getUsers();

    if (users.length === 0) {
        container.innerHTML =
            "<p>No students registered yet.</p>";
        return;
    }

    renderStudentCards(
        container,
        users
    );
}

function renderStudentCards(container, users) {
    container.innerHTML = "";

    users.forEach(function (student) {
        const card =
            document.createElement("div");

        card.className = "student-item";

        card.innerHTML = `
            <h3>${escapeHtml(student.name)}</h3>

            <p>
                <strong>📱 Mobile:</strong>
                ${escapeHtml(student.mobile || "-")}
            </p>

            <p>
                <strong>📧 Email:</strong>
                ${escapeHtml(student.email || "-")}
            </p>

            <p>
                <strong>🏫 College:</strong>
                ${escapeHtml(student.college || COLLEGE_NAME)}
            </p>

            <p>
                <strong>📚 Branch:</strong>
                ${escapeHtml(student.department || "-")}
            </p>

            <p>
                <strong>🔢 Roll:</strong>
                ${escapeHtml(student.roll || "-")}
            </p>

            <p>
                <strong>👤 Face:</strong>
                ${student.faceRegistered ? "Registered ✓" : "Not Registered"}
            </p>
        `;

        container.appendChild(card);
    });
}

/* ============================================================
   SEARCH STUDENTS
============================================================ */

function searchStudents() {
    const input = $("searchStudent");

    if (!input) return;

    const query =
        normalize(input.value);

    const users = getUsers();

    const filtered = users.filter(
        function (student) {
            return (
                normalize(student.name).includes(query) ||
                normalize(student.roll).includes(query) ||
                normalize(student.department).includes(query) ||
                normalize(student.mobile).includes(query) ||
                normalize(student.email).includes(query)
            );
        }
    );

    renderStudentCards(
        $("studentList"),
        filtered
    );
}

/* ============================================================
   ATTENDANCE HISTORY
============================================================ */

function renderAttendanceHistory() {
    const container = $("attendanceHistory");

    if (!container) return;

    const records = getAttendanceRecords();

    let myRecords = records;

    if (
        currentUser &&
        currentUser.role !== "Admin"
    ) {
        myRecords = records.filter(
            r => r.userId === currentUser.id
        );
    }

    myRecords = myRecords.slice().reverse();

    const totalDays = myRecords.length;

    const presentDays =
        myRecords.filter(
            r => r.status === "Present"
        ).length;

    const absentDays = 0;

    if ($("attendanceTotalDays")) {
        $("attendanceTotalDays").textContent =
            totalDays;
    }

    if ($("attendancePresentDays")) {
        $("attendancePresentDays").textContent =
            presentDays;
    }

    if ($("attendanceAbsentDays")) {
        $("attendanceAbsentDays").textContent =
            absentDays;
    }

    if (myRecords.length === 0) {
        container.innerHTML =
            "<p>No attendance records yet.</p>";
        return;
    }

    container.innerHTML = "";

    myRecords.forEach(function (record) {
        const item =
            document.createElement("div");

        item.className =
            "attendance-history-item";

        item.innerHTML = `
            <div>
                <strong>
                    ${escapeHtml(record.name)}
                </strong>

                <br>

                <span>
                    ${escapeHtml(record.day)}
                    •
                    ${escapeHtml(record.date)}
                    •
                    ${escapeHtml(record.time)}
                </span>

                <br>

                <span>
                    Branch:
                    ${escapeHtml(record.department || "-")}
                    |
                    Roll:
                    ${escapeHtml(record.roll || "-")}
                </span>
            </div>

            <b>
                ✓ Present
            </b>
        `;

        container.appendChild(item);
    });
}

/* ============================================================
   ADMIN / STUDENT ACCESS
============================================================ */

function adminButtonAction() {
    if (!currentUser) return;

    if (currentUser.role === "Admin") {
        showDashboardSection("adminSection");
    } else {
        alert(
            "Admin panel is available only to the administrator."
        );
    }
}

/* ============================================================
   LOGOUT
============================================================ */

function logout() {
    stopAllCameras();

    currentUser = null;

    localStorage.removeItem(
        STORAGE_CURRENT_USER
    );

    $("loginName").value = "";
    $("loginIdentity").value = "";
    $("loginPin").value = "";

    showLoginPage();
}

/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ============================================================
   EVENT LISTENERS
============================================================ */

function setupEventListeners() {

    /* LOGIN */

    $("loginButton")?.addEventListener(
        "click",
        loginUser
    );

    $("createAccountButton")?.addEventListener(
        "click",
        showCreateAccountPage
    );

    $("forgotPinButton")?.addEventListener(
        "click",
        showForgotPinPage
    );


    /* CREATE ACCOUNT */

    $("createAccountSubmit")?.addEventListener(
        "click",
        createAccount
    );

    $("backToLoginButton")?.addEventListener(
        "click",
        showLoginPage
    );


    /* FORGOT PIN */

    $("resetPinButton")?.addEventListener(
        "click",
        resetPin
    );

    $("forgotBackButton")?.addEventListener(
        "click",
        showLoginPage
    );


    /* DASHBOARD */

    $("dashboardMenuButton")?.addEventListener(
        "click",
        function () {
            showDashboardSection(
                "dashboardHome"
            );
        }
    );


    /* EDIT PROFILE */

    $("editProfileMenuButton")?.addEventListener(
        "click",
        function () {
            fillEditFields();

            showDashboardSection(
                "editProfileSection"
            );
        }
    );

    $("saveEditedDetailsButton")?.addEventListener(
        "click",
        saveProfile
    );


    /* EDIT CONTACT */

    $("editContactMenuButton")?.addEventListener(
        "click",
        function () {
            fillEditFields();

            showDashboardSection(
                "editContactSection"
            );
        }
    );

    $("saveContactButton")?.addEventListener(
        "click",
        saveContact
    );


    /* PERSONAL DETAILS */

    $("personalDetailsMenuButton")?.addEventListener(
        "click",
        function () {
            updateDashboardUser();

            showDashboardSection(
                "personalDetailsSection"
            );
        }
    );


    /* FACE REGISTRATION */

    $("faceRegistrationMenuButton")?.addEventListener(
        "click",
        function () {
            showDashboardSection(
                "faceRegistrationSection"
            );
        }
    );

    $("quickFaceRegistration")?.addEventListener(
        "click",
        function () {
            showDashboardSection(
                "faceRegistrationSection"
            );
        }
    );

    $("startFaceRegistrationButton")?.addEventListener(
        "click",
        startFaceRegistration
    );


    /* ATTENDANCE */

    $("attendanceMenuButton")?.addEventListener(
        "click",
        function () {
            showDashboardSection(
                "attendanceSection"
            );
        }
    );

    $("quickAttendance")?.addEventListener(
        "click",
        function () {
            showDashboardSection(
                "attendanceSection"
            );
        }
    );

    $("startFaceAttendanceButton")?.addEventListener(
        "click",
        startFaceAttendance
    );


    /* STUDENTS */

    $("studentsMenuButton")?.addEventListener(
        "click",
        function () {
            showDashboardSection(
                "studentsSection"
            );
        }
    );

    $("searchStudent")?.addEventListener(
        "input",
        searchStudents
    );


    /* CHECK ATTENDANCE */

    $("checkAttendanceMenuButton")?.addEventListener(
        "click",
        function () {
            showDashboardSection(
                "checkAttendanceSection"
            );
        }
    );

    $("quickCheckAttendance")?.addEventListener(
        "click",
        function () {
            showDashboardSection(
                "checkAttendanceSection"
            );
        }
    );


    /* ADMIN */

    $("adminMenuButton")?.addEventListener(
        "click",
        adminButtonAction
    );


    /* LOGOUT */

    $("logoutButton")?.addEventListener(
        "click",
        logout
    );


    /* POPUP */

    $("closeAttendancePopup")?.addEventListener(
        "click",
        closeAttendancePopup
    );
}

/* ============================================================
   KEYBOARD SUPPORT
============================================================ */

function setupKeyboardSupport() {

    $("loginPin")?.addEventListener(
        "keydown",
        function (event) {
            if (event.key === "Enter") {
                loginUser();
            }
        }
    );

    $("createPin")?.addEventListener(
        "keydown",
        function (event) {
            if (event.key === "Enter") {
                createAccount();
            }
        }
    );

    $("confirmPin")?.addEventListener(
        "keydown",
        function (event) {
            if (event.key === "Enter") {
                createAccount();
            }
        }
    );

    $("confirmNewPin")?.addEventListener(
        "keydown",
        function (event) {
            if (event.key === "Enter") {
                resetPin();
            }
        }
    );
}

/* ============================================================
   LOAD SAVED LOGIN
============================================================ */

function loadSavedUser() {
    try {
        const saved =
            localStorage.getItem(
                STORAGE_CURRENT_USER
            );

        if (!saved) {
            showLoginPage();
            return;
        }

        const user =
            JSON.parse(saved);

        if (!user || !user.id) {
            showLoginPage();
            return;
        }

        currentUser = user;

        showDashboard();

    } catch (error) {
        console.error(error);

        localStorage.removeItem(
            STORAGE_CURRENT_USER
        );

        showLoginPage();
    }
}

/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupEventListeners();

        setupKeyboardSupport();

        updateCurrentDate();

        updateStatistics();

        loadSavedUser();

        console.log(
            "Smart Attendance System loaded successfully."
        );
    }
);

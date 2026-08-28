// =====================================================
// SMART ATTENDANCE SYSTEM
// script.js
// =====================================================

let currentUser = null;
let createConfirmationResult = null;
let forgotConfirmationResult = null;
let createRecaptcha = null;
let forgotRecaptcha = null;

// =====================================================
// BASIC HELPERS
// =====================================================

function $(id) {
    return document.getElementById(id);
}

function showMessage(id, message, success = false) {
    const el = $(id);
    if (!el) return;

    el.textContent = message;
    el.style.color = success ? "#16a34a" : "#dc2626";
}

function getStudents() {
    return JSON.parse(localStorage.getItem("students") || "[]");
}

function saveStudents(students) {
    localStorage.setItem("students", JSON.stringify(students));
}

function getAttendance() {
    return JSON.parse(localStorage.getItem("attendance") || "[]");
}

function saveAttendance(data) {
    localStorage.setItem("attendance", JSON.stringify(data));
}

function normalizeMobile(mobile) {
    return String(mobile || "").replace(/\D/g, "");
}

function validMobile(mobile) {
    return /^[6-9]\d{9}$/.test(normalizeMobile(mobile));
}

function validPin(pin) {
    return /^\d{4}$/.test(String(pin || ""));
}

function indianPhone(mobile) {
    return "+91" + normalizeMobile(mobile);
}

// =====================================================
// PAGE NAVIGATION
// =====================================================

function hideAllPages() {
    $("loginPage").style.display = "none";
    $("createAccountPage").style.display = "none";
    $("forgotPinPage").style.display = "none";
    $("dashboardPage").style.display = "none";
}

function showLoginPage() {
    hideAllPages();
    $("loginPage").style.display = "flex";
}

function showCreateAccountPage() {
    hideAllPages();
    $("createAccountPage").style.display = "flex";
}

function showForgotPage() {
    hideAllPages();
    $("forgotPinPage").style.display = "flex";
}

function showDashboard() {
    hideAllPages();
    $("dashboardPage").style.display = "block";

    updateDashboard();
    displayStudents();
    updateCurrentDate();
}

// =====================================================
// LOGIN
// =====================================================

function loginUser() {
    const name = $("loginName").value.trim();
    const mobile = normalizeMobile($("loginMobile").value);
    const pin = $("loginPin").value.trim();

    if (!name || !mobile || !pin) {
        showMessage(
            "loginMessage",
            "Please enter Name, Mobile Number and PIN."
        );
        return;
    }

    if (!validMobile(mobile)) {
        showMessage(
            "loginMessage",
            "Please enter a valid 10 digit mobile number."
        );
        return;
    }

    if (!validPin(pin)) {
        showMessage(
            "loginMessage",
            "PIN must be exactly 4 digits."
        );
        return;
    }

    const students = getStudents();

    const student = students.find(
        s =>
            s.name.toLowerCase() === name.toLowerCase() &&
            normalizeMobile(s.mobile) === mobile &&
            s.pin === pin
    );

    if (!student) {
        showMessage(
            "loginMessage",
            "Name, Mobile Number or PIN does not match."
        );
        return;
    }

    currentUser = student;
    localStorage.setItem("currentUserId", student.id);

    showMessage(
        "loginMessage",
        "Login successful! Opening dashboard...",
        true
    );

    setTimeout(showDashboard, 500);
}

// =====================================================
// CREATE ACCOUNT - SEND OTP
// =====================================================

async function sendCreateOTP() {
    const name = $("createName").value.trim();
    const mobile = normalizeMobile($("createMobile").value);
    const email = $("createEmail").value.trim();
    const pin = $("createPin").value.trim();
    const confirmPin = $("confirmPin").value.trim();

    if (!name) {
        showMessage("createMessage", "Please enter your name.");
        return;
    }

    if (!validMobile(mobile)) {
        showMessage(
            "createMessage",
            "Please enter a valid 10 digit mobile number."
        );
        return;
    }

    if (!validPin(pin)) {
        showMessage(
            "createMessage",
            "PIN must be exactly 4 digits."
        );
        return;
    }

    if (pin !== confirmPin) {
        showMessage(
            "createMessage",
            "PIN and Confirm PIN do not match."
        );
        return;
    }

    const students = getStudents();

    const alreadyExists = students.find(
        s => normalizeMobile(s.mobile) === mobile
    );

    if (alreadyExists) {
        showMessage(
            "createMessage",
            "This mobile number is already registered."
        );
        return;
    }

    if (!window.firebaseAuth || !window.signInWithPhoneNumber) {
        showMessage(
            "createMessage",
            "Firebase is not loaded. Please check your internet connection."
        );
        return;
    }

    try {
        showMessage(
            "createMessage",
            "Sending OTP to +91 " + mobile + "..."
        );

        if (createRecaptcha) {
            try {
                createRecaptcha.clear();
            } catch (e) {}
        }

        createRecaptcha = new window.RecaptchaVerifier(
            window.firebaseAuth,
            "recaptcha-container",
            {
                size: "normal"
            }
        );

        const phoneNumber = indianPhone(mobile);

        createConfirmationResult =
            await window.signInWithPhoneNumber(
                window.firebaseAuth,
                phoneNumber,
                createRecaptcha
            );

        $("createOtpSection").style.display = "block";

        showMessage(
            "createMessage",
            "✅ OTP sent to your mobile number. Check your SMS.",
            true
        );

    } catch (error) {
        console.error(error);

        showMessage(
            "createMessage",
            "OTP could not be sent: " +
            (error.message || "Unknown error")
        );

        if (createRecaptcha) {
            try {
                createRecaptcha.clear();
            } catch (e) {}
            createRecaptcha = null;
        }
    }
}

// =====================================================
// CREATE ACCOUNT - VERIFY OTP
// =====================================================

async function verifyCreateOTP() {
    const otp = $("createOtp").value.trim();

    if (!/^\d{6}$/.test(otp)) {
        showMessage(
            "createMessage",
            "Please enter the 6 digit OTP."
        );
        return;
    }

    if (!createConfirmationResult) {
        showMessage(
            "createMessage",
            "Please click Send OTP first."
        );
        return;
    }

    try {
        showMessage(
            "createMessage",
            "Verifying OTP..."
        );

        await createConfirmationResult.confirm(otp);

        const name = $("createName").value.trim();
        const mobile = normalizeMobile($("createMobile").value);
        const email = $("createEmail").value.trim();
        const pin = $("createPin").value.trim();

        const students = getStudents();

        const newStudent = {
            id: Date.now().toString(),
            name: name,
            mobile: mobile,
            email: email,
            pin: pin,
            roll: "",
            college: "Hooghly Engineering & Technology College",
            department: "",
            faceDescriptor: null,
            createdAt: new Date().toISOString()
        };

        students.push(newStudent);
        saveStudents(students);

        currentUser = newStudent;
        localStorage.setItem("currentUserId", newStudent.id);

        showMessage(
            "createMessage",
            "✅ Account created successfully!",
            true
        );

        setTimeout(showDashboard, 800);

    } catch (error) {
        console.error(error);

        showMessage(
            "createMessage",
            "Invalid OTP or verification failed."
        );
    }
}

// =====================================================
// FORGOT PIN - SEND OTP
// =====================================================

async function sendForgotOTP() {
    const name = $("forgotName").value.trim();
    const mobile = normalizeMobile($("forgotMobile").value);

    if (!name) {
        showMessage(
            "forgotMessage",
            "Please enter your registered name."
        );
        return;
    }

    if (!validMobile(mobile)) {
        showMessage(
            "forgotMessage",
            "Please enter a valid 10 digit mobile number."
        );
        return;
    }

    const students = getStudents();

    const student = students.find(
        s =>
            s.name.toLowerCase() === name.toLowerCase() &&
            normalizeMobile(s.mobile) === mobile
    );

    if (!student) {
        showMessage(
            "forgotMessage",
            "Name and registered mobile number do not match."
        );
        return;
    }

    if (!window.firebaseAuth || !window.signInWithPhoneNumber) {
        showMessage(
            "forgotMessage",
            "Firebase is not loaded."
        );
        return;
    }

    try {
        showMessage(
            "forgotMessage",
            "Sending OTP..."
        );

        if (forgotRecaptcha) {
            try {
                forgotRecaptcha.clear();
            } catch (e) {}
        }

        forgotRecaptcha = new window.RecaptchaVerifier(
            window.firebaseAuth,
            "forgot-recaptcha-container",
            {
                size: "normal"
            }
        );

        forgotConfirmationResult =
            await window.signInWithPhoneNumber(
                window.firebaseAuth,
                indianPhone(mobile),
                forgotRecaptcha
            );

        $("forgotOtpSection").style.display = "block";

        showMessage(
            "forgotMessage",
            "✅ OTP sent to your registered mobile number.",
            true
        );

    } catch (error) {
        console.error(error);

        showMessage(
            "forgotMessage",
            "OTP could not be sent: " +
            (error.message || "Unknown error")
        );
    }
}

// =====================================================
// FORGOT PIN - RESET
// =====================================================

async function resetPIN() {
    const otp = $("forgotOtp").value.trim();
    const newPin = $("newPin").value.trim();
    const confirmNewPin = $("confirmNewPin").value.trim();

    if (!/^\d{6}$/.test(otp)) {
        showMessage(
            "forgotMessage",
            "Please enter the 6 digit OTP."
        );
        return;
    }

    if (!validPin(newPin)) {
        showMessage(
            "forgotMessage",
            "New PIN must be exactly 4 digits."
        );
        return;
    }

    if (newPin !== confirmNewPin) {
        showMessage(
            "forgotMessage",
            "New PIN and Confirm PIN do not match."
        );
        return;
    }

    if (!forgotConfirmationResult) {
        showMessage(
            "forgotMessage",
            "Please send OTP first."
        );
        return;
    }

    try {
        await forgotConfirmationResult.confirm(otp);

        const mobile =
            normalizeMobile($("forgotMobile").value);

        const students = getStudents();

        const index = students.findIndex(
            s => normalizeMobile(s.mobile) === mobile
        );

        if (index === -1) {
            showMessage(
                "forgotMessage",
                "Student account not found."
            );
            return;
        }

        students[index].pin = newPin;

        saveStudents(students);

        showMessage(
            "forgotMessage",
            "✅ PIN reset successfully. You can login now.",
            true
        );

        setTimeout(showLoginPage, 1000);

    } catch (error) {
        console.error(error);

        showMessage(
            "forgotMessage",
            "Invalid OTP or PIN reset failed."
        );
    }
}

// =====================================================
// FACE REGISTRATION
// =====================================================

async function startAutomaticFaceRegistration() {

    if (!currentUser) {
        showMessage(
            "registrationMessage",
            "Please login first."
        );
        return;
    }

    const name = $("faceName").value.trim();
    const roll = $("faceRoll").value.trim();
    const college = $("collegeName").value.trim();
    const department = $("departmentName").value.trim();
    const mobile = normalizeMobile($("faceMobile").value);
    const email = $("faceEmail").value.trim();

    if (!name || !roll || !college || !department || !mobile) {
        showMessage(
            "registrationMessage",
            "Please fill all required student details."
        );
        return;
    }

    try {
        $("registrationStatus").textContent =
            "Camera starting...";

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        const video = $("registrationCamera");
        video.srcObject = stream;

        await video.play();

        $("registrationStatus").textContent =
            "Camera ON — detecting face...";

        if (typeof faceapi === "undefined") {
            showMessage(
                "registrationMessage",
                "Face API is not loaded."
            );
            return;
        }

        // Basic face detection
        const detection =
            await faceapi.detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions()
            );

        if (!detection) {
            showMessage(
                "registrationMessage",
                "No face detected. Please look at the camera."
            );
            return;
        }

        const students = getStudents();

        const index = students.findIndex(
            s => s.id === currentUser.id
        );

        if (index === -1) {
            showMessage(
                "registrationMessage",
                "Logged-in student not found."
            );
            return;
        }

        students[index].name = name;
        students[index].roll = roll;
        students[index].college = college;
        students[index].department = department;
        students[index].mobile = mobile;
        students[index].email = email;

        // Store basic registration information.
        // Real face recognition requires storing a face descriptor.
        students[index].faceRegistered = true;

        saveStudents(students);
        currentUser = students[index];

        $("registrationStatus").textContent =
            "Face detected ✅";

        showMessage(
            "registrationMessage",
            "✅ Face registration completed successfully!",
            true
        );

        updateDashboard();
        displayStudents();

        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            $("registrationStatus").textContent = "Camera is OFF";
        }, 1500);

    } catch (error) {
        console.error(error);

        showMessage(
            "registrationMessage",
            "Camera/face registration failed: " +
            error.message
        );
    }
}

// =====================================================
// FACE ATTENDANCE
// =====================================================

async function startFaceAttendance() {

    if (!currentUser) {
        showMessage(
            "attendanceResult",
            "Please login first."
        );
        return;
    }

    try {
        $("attendanceStatus").textContent =
            "Camera starting...";

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        const video = $("attendanceCamera");

        video.srcObject = stream;

        await video.play();

        $("attendanceStatus").textContent =
            "Camera ON — detecting face...";

        if (typeof faceapi === "undefined") {
            showMessage(
                "attendanceResult",
                "Face API is not loaded."
            );
            return;
        }

        const detection =
            await faceapi.detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions()
            );

        if (!detection) {
            showMessage(
                "attendanceResult",
                "No face detected. Please look at the camera."
            );
            return;
        }

        // Attendance is recorded for the logged-in verified user.
        const today =
            new Date().toISOString().split("T")[0];

        const attendance = getAttendance();

        const alreadyMarked = attendance.find(
            a =>
                a.studentId === currentUser.id &&
                a.date === today
        );

        if (alreadyMarked) {
            showMessage(
                "attendanceResult",
                "Attendance already marked for today.",
                true
            );
        } else {

            attendance.push({
                studentId: currentUser.id,
                name: currentUser.name,
                roll: currentUser.roll || "",
                date: today,
                time: new Date().toLocaleTimeString(),
                status: "Present"
            });

            saveAttendance(attendance);

            showMessage(
                "attendanceResult",
                "✅ Attendance marked successfully!",
                true
            );

            // Notification attempt
            sendAttendanceNotification();
        }

        $("attendanceStatus").textContent =
            "Face detected ✅";

        updateDashboard();

        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            $("attendanceStatus").textContent = "Camera is OFF";
        }, 1500);

    } catch (error) {
        console.error(error);

        showMessage(
            "attendanceResult",
            "Camera/attendance failed: " +
            error.message
        );
    }
}

// =====================================================
// ATTENDANCE NOTIFICATION
// =====================================================

function sendAttendanceNotification() {

    const message =
        "Smart Attendance: " +
        currentUser.name +
        ", your attendance has been marked Present today.";

    // Browser cannot directly send SMS/email by itself.
    // This creates a notification message for now.

    console.log("Attendance notification:", message);

    if (currentUser.email) {
        console.log(
            "Email notification target:",
            currentUser.email
        );
    }

    if (currentUser.mobile) {
        console.log(
            "SMS notification target:",
            currentUser.mobile
        );
    }
}

// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard() {

    const students = getStudents();
    const attendance = getAttendance();

    $("totalStudents").textContent = students.length;

    const today =
        new Date().toISOString().split("T")[0];

    const presentToday =
        attendance.filter(
            a => a.date === today
        ).length;

    $("presentStudents").textContent =
        presentToday;

    $("absentStudents").textContent =
        Math.max(students.length - presentToday, 0);

    const percentage =
        students.length > 0
            ? Math.round(
                (presentToday / students.length) * 100
            )
            : 0;

    $("attendancePercentage").textContent =
        percentage + "%";
}

// =====================================================
// STUDENT LIST
// =====================================================

function displayStudents() {

    const container = $("studentList");

    if (!container) return;

    const students = getStudents();

    const search =
        ($("searchStudent")?.value || "")
        .toLowerCase()
        .trim();

    const filtered =
        students.filter(s =>
            s.name.toLowerCase().includes(search) ||
            String(s.roll || "")
                .toLowerCase()
                .includes(search)
        );

    if (filtered.length === 0) {
        container.innerHTML =
            "<p>No registered students found.</p>";
        return;
    }

    container.innerHTML = filtered.map(s => `
        <div class="student-item">
            <h3>👤 ${escapeHTML(s.name)}</h3>
            <p>🔢 Roll: ${escapeHTML(s.roll || "Not added")}</p>
            <p>🏫 ${escapeHTML(s.college || "")}</p>
            <p>🎓 ${escapeHTML(s.department || "Not added")}</p>
            <p>📱 ${escapeHTML(s.mobile || "")}</p>
            <p>📧 ${escapeHTML(s.email || "Not added")}</p>
        </div>
    `).join("");
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// =====================================================
// REGISTERED STUDENTS MODAL
// =====================================================

function showRegisteredStudents() {

    const students = getStudents();

    const list = $("registeredStudentsList");

    if (!list) return;

    if (students.length === 0) {
        list.innerHTML =
            "<p>No students registered.</p>";
    } else {
        list.innerHTML = students.map(s => `
            <div class="student-item">
                <h3>👤 ${escapeHTML(s.name)}</h3>
                <p>📱 ${escapeHTML(s.mobile)}</p>
                <p>📧 ${escapeHTML(s.email || "Not added")}</p>
                <p>🔢 Roll: ${escapeHTML(s.roll || "Not added")}</p>
            </div>
        `).join("");
    }

    $("studentsModal").style.display = "flex";
}

function closeRegisteredStudents() {
    $("studentsModal").style.display = "none";
}

// =====================================================
// CHECK ATTENDANCE
// =====================================================

function showCheckAttendance() {

    if (!currentUser) return;

    const attendance = getAttendance();

    const mine =
        attendance.filter(
            a => a.studentId === currentUser.id
        );

    const totalDays =
        new Set(
            attendance.map(a => a.date)
        ).size;

    const presentDays = mine.length;

    $("attendanceTotalDays").textContent =
        totalDays;

    $("attendancePresentDays").textContent =
        presentDays;

    $("attendanceAbsentDays").textContent =
        Math.max(totalDays - presentDays, 0);

    const history = $("attendanceHistory");

    if (mine.length === 0) {
        history.innerHTML =
            "<p>No attendance history found.</p>";
    } else {
        history.innerHTML =
            mine
                .sort((a, b) =>
                    b.date.localeCompare(a.date)
                )
                .map(a => `
                    <div class="student-item">
                        <strong>📅 ${escapeHTML(a.date)}</strong>
                        <p>⏰ ${escapeHTML(a.time)}</p>
                        <p>✅ ${escapeHTML(a.status)}</p>
                    </div>
                `)
                .join("");
    }

    $("attendanceCheckModal").style.display = "flex";
}

function closeCheckAttendance() {
    $("attendanceCheckModal").style.display = "none";
}

// =====================================================
// EDIT DETAILS
// =====================================================

function openEditDetails() {

    if (!currentUser) return;

    $("editName").value =
        currentUser.name || "";

    $("editRoll").value =
        currentUser.roll || "";

    $("editCollege").value =
        currentUser.college || "";

    $("editDepartment").value =
        currentUser.department || "";

    $("editMobile").value =
        currentUser.mobile || "";

    $("editEmail").value =
        currentUser.email || "";

    $("editDetailsModal").style.display = "flex";
}

function closeEditDetails() {
    $("editDetailsModal").style.display = "none";
}

function saveEditedDetails() {

    if (!currentUser) return;

    const students = getStudents();

    const index =
        students.findIndex(
            s => s.id === currentUser.id
        );

    if (index === -1) return;

    students[index].name =
        $("editName").value.trim();

    students[index].roll =
        $("editRoll").value.trim();

    students[index].college =
        $("editCollege").value.trim();

    students[index].department =
        $("editDepartment").value.trim();

    const mobile =
        normalizeMobile(
            $("editMobile").value
        );

    if (mobile && !validMobile(mobile)) {
        alert("Please enter a valid mobile number.");
        return;
    }

    students[index].mobile = mobile;

    students[index].email =
        $("editEmail").value.trim();

    saveStudents(students);

    currentUser = students[index];

    closeEditDetails();

    updateDashboard();
    displayStudents();

    alert("Details updated successfully.");
}

// =====================================================
// MOBILE / EMAIL UPDATE
// =====================================================

function openMobileUpdate() {
    openEditDetails();
}

function openEmailUpdate() {
    openEditDetails();
}

// =====================================================
// ADMIN
// =====================================================

function showAdminDetails() {
    $("adminModal").style.display = "flex";
}

function closeAdminDetails() {
    $("adminModal").style.display = "none";
}

// =====================================================
// MENU
// =====================================================

function toggleMenu() {

    const menu = $("mainMenu");

    if (!menu) return;

    menu.classList.toggle("show");
}

// =====================================================
// LOGOUT
// =====================================================

function logoutUser() {

    currentUser = null;

    localStorage.removeItem("currentUserId");

    showLoginPage();

    $("loginName").value = "";
    $("loginMobile").value = "";
    $("loginPin").value = "";

    showMessage(
        "loginMessage",
        "You have been logged out.",
        true
    );
}

// =====================================================
// DATE
// =====================================================

function updateCurrentDate() {

    const el = $("currentDate");

    if (!el) return;

    el.textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}

// =====================================================
// BUTTON EVENTS
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // Login
    $("loginButton")?.addEventListener(
        "click",
        loginUser
    );

    // Create account page
    $("createAccountButton")?.addEventListener(
        "click",
        showCreateAccountPage
    );

    // Forgot PIN page
    $("forgotPinButton")?.addEventListener(
        "click",
        showForgotPage
    );

    // Back to login
    $("backToLoginButton")?.addEventListener(
        "click",
        showLoginPage
    );

    $("forgotBackButton")?.addEventListener(
        "click",
        showLoginPage
    );

    // Create OTP
    $("sendCreateOtpButton")?.addEventListener(
        "click",
        sendCreateOTP
    );

    $("verifyCreateOtpButton")?.addEventListener(
        "click",
        verifyCreateOTP
    );

    // Forgot OTP
    $("sendForgotOtpButton")?.addEventListener(
        "click",
        sendForgotOTP
    );

    $("resetPinButton")?.addEventListener(
        "click",
        resetPIN
    );

    // Enter key login
    $("loginPin")?.addEventListener(
        "keydown",
        e => {
            if (e.key === "Enter") {
                loginUser();
            }
        }
    );

    updateCurrentDate();

    // Restore login session
    const savedId =
        localStorage.getItem("currentUserId");

    if (savedId) {

        const students = getStudents();

        const student =
            students.find(
                s => s.id === savedId
            );

        if (student) {
            currentUser = student;
            showDashboard();
        } else {
            showLoginPage();
        }

    } else {
        showLoginPage();
    }

    console.log(
        "Smart Attendance System loaded successfully ✅"
    );
});

// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML onclick
// =====================================================

window.toggleMenu = toggleMenu;
window.openEditDetails = openEditDetails;
window.closeEditDetails = closeEditDetails;
window.saveEditedDetails = saveEditedDetails;
window.openMobileUpdate = openMobileUpdate;
window.openEmailUpdate = openEmailUpdate;
window.showRegisteredStudents = showRegisteredStudents;
window.closeRegisteredStudents = closeRegisteredStudents;
window.showCheckAttendance = showCheckAttendance;
window.closeCheckAttendance = closeCheckAttendance;
window.showAdminDetails = showAdminDetails;
window.closeAdminDetails = closeAdminDetails;
window.logoutUser = logoutUser;
window.startAutomaticFaceRegistration =
    startAutomaticFaceRegistration;
window.startFaceAttendance =
    startFaceAttendance;
window.displayStudents = displayStudents;

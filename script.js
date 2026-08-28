/* =========================================================
   SMART ATTENDANCE SYSTEM
   Firebase Phone OTP + Login + Forgot PIN + Face Attendance
========================================================= */

const STORAGE_KEY = "smartAttendanceUsers";
const ATTENDANCE_KEY = "smartAttendanceHistory";

let currentUser = null;
let createConfirmationResult = null;
let forgotConfirmationResult = null;

let registrationStream = null;
let attendanceStream = null;


/* =========================================================
   BASIC HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function showMessage(id, message, success = false) {
    const el = $(id);
    if (!el) return;

    el.textContent = message;
    el.style.color = success ? "#16a34a" : "#dc2626";
}

function cleanMobile(number) {
    return String(number || "").replace(/\D/g, "");
}

function phoneNumber(number) {
    const mobile = cleanMobile(number);

    if (mobile.length !== 10) {
        throw new Error("Enter a valid 10 digit mobile number.");
    }

    return "+91" + mobile;
}

function validPIN(pin) {
    return /^\d{4}$/.test(pin);
}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function hideAllPages() {
    if ($("loginPage")) $("loginPage").style.display = "none";
    if ($("createAccountPage")) $("createAccountPage").style.display = "none";
    if ($("forgotPinPage")) $("forgotPinPage").style.display = "none";
    if ($("dashboardPage")) $("dashboardPage").style.display = "none";
}

function showLoginPage() {
    hideAllPages();

    if ($("loginPage")) {
        $("loginPage").style.display = "flex";
    }
}

function showCreatePage() {
    hideAllPages();

    if ($("createAccountPage")) {
        $("createAccountPage").style.display = "flex";
    }
}

function showForgotPage() {
    hideAllPages();

    if ($("forgotPinPage")) {
        $("forgotPinPage").style.display = "flex";
    }
}

function showDashboard() {
    hideAllPages();

    if ($("dashboardPage")) {
        $("dashboardPage").style.display = "block";
    }

    updateDashboard();
    displayStudents();
    updateCurrentDate();
}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser() {

    const name = $("loginName")?.value.trim();
    const mobile = cleanMobile($("loginMobile")?.value);
    const pin = $("loginPin")?.value.trim();

    if (!name || !mobile || !pin) {
        showMessage(
            "loginMessage",
            "Please enter Name, Mobile Number and PIN."
        );
        return;
    }

    if (mobile.length !== 10) {
        showMessage(
            "loginMessage",
            "Mobile number must contain 10 digits."
        );
        return;
    }

    if (!validPIN(pin)) {
        showMessage(
            "loginMessage",
            "PIN must contain exactly 4 digits."
        );
        return;
    }

    const users = getUsers();

    const user = users.find(u =>
        u.mobile === mobile &&
        u.name.toLowerCase() === name.toLowerCase()
    );

    if (!user) {
        showMessage(
            "loginMessage",
            "Name and mobile number do not match any registered account."
        );
        return;
    }

    if (user.pin !== pin) {
        showMessage(
            "loginMessage",
            "Incorrect PIN."
        );
        return;
    }

    currentUser = user;

    localStorage.setItem(
        "currentAttendanceUser",
        JSON.stringify(user)
    );

    showMessage(
        "loginMessage",
        "Login successful ✅",
        true
    );

    setTimeout(showDashboard, 500);
}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

let createRecaptcha = null;

function setupCreateRecaptcha() {

    if (!window.firebaseAuth || !window.RecaptchaVerifier) {
        console.error("Firebase Auth not ready.");
        return false;
    }

    try {

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

        createRecaptcha.render();

        return true;

    } catch (error) {
        console.error(error);
        return false;
    }
}

async function sendCreateOTP() {

    const name = $("createName")?.value.trim();
    const mobile = cleanMobile($("createMobile")?.value);
    const email = $("createEmail")?.value.trim();
    const pin = $("createPin")?.value.trim();
    const confirmPin = $("confirmPin")?.value.trim();

    if (!name) {
        showMessage("createMessage", "Enter your name.");
        return;
    }

    if (mobile.length !== 10) {
        showMessage("createMessage", "Enter valid 10 digit mobile number.");
        return;
    }

    if (!validPIN(pin)) {
        showMessage("createMessage", "PIN must contain 4 digits.");
        return;
    }

    if (pin !== confirmPin) {
        showMessage("createMessage", "PIN and Confirm PIN do not match.");
        return;
    }

    const users = getUsers();

    const alreadyExists = users.some(
        u => u.mobile === mobile
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
            "Firebase is not ready. Check the Firebase script."
        );
        return;
    }

    try {

        if (!createRecaptcha) {
            const ok = setupCreateRecaptcha();

            if (!ok) {
                showMessage(
                    "createMessage",
                    "reCAPTCHA could not be started."
                );
                return;
            }
        }

        showMessage(
            "createMessage",
            "Sending OTP..."
        );

        const confirmation =
            await window.signInWithPhoneNumber(
                window.firebaseAuth,
                phoneNumber(mobile),
                createRecaptcha
            );

        createConfirmationResult = confirmation;

        if ($("createOtpSection")) {
            $("createOtpSection").style.display = "block";
        }

        showMessage(
            "createMessage",
            "OTP sent to your mobile number 📱",
            true
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "createMessage",
            error.message || "OTP could not be sent."
        );
    }
}


async function verifyCreateOTP() {

    if (!createConfirmationResult) {
        showMessage(
            "createMessage",
            "First click Send OTP."
        );
        return;
    }

    const otp = $("createOtp")?.value.trim();

    if (!/^\d{6}$/.test(otp)) {
        showMessage(
            "createMessage",
            "Enter the 6 digit OTP."
        );
        return;
    }

    try {

        showMessage(
            "createMessage",
            "Verifying OTP..."
        );

        const result =
            await createConfirmationResult.confirm(otp);

        const name = $("createName").value.trim();
        const mobile = cleanMobile($("createMobile").value);
        const email = $("createEmail").value.trim();
        const pin = $("createPin").value.trim();

        const users = getUsers();

        const user = {
            id: result.user.uid,
            name,
            mobile,
            email,
            pin,
            roll: "",
            college: "Hooghly Engineering & Technology College",
            department: "",
            faceDescriptor: null,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        saveUsers(users);

        currentUser = user;

        localStorage.setItem(
            "currentAttendanceUser",
            JSON.stringify(user)
        );

        showMessage(
            "createMessage",
            "Account created successfully ✅",
            true
        );

        setTimeout(showDashboard, 800);

    } catch (error) {

        console.error(error);

        showMessage(
            "createMessage",
            "Invalid OTP or OTP expired."
        );
    }
}


/* =========================================================
   FORGOT PIN
========================================================= */

let forgotRecaptcha = null;

function setupForgotRecaptcha() {

    if (!window.firebaseAuth || !window.RecaptchaVerifier) {
        return false;
    }

    try {

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

        forgotRecaptcha.render();

        return true;

    } catch (error) {

        console.error(error);
        return false;
    }
}


async function sendForgotOTP() {

    const name = $("forgotName")?.value.trim();
    const mobile = cleanMobile($("forgotMobile")?.value);

    if (!name) {
        showMessage(
            "forgotMessage",
            "Enter your registered name."
        );
        return;
    }

    if (mobile.length !== 10) {
        showMessage(
            "forgotMessage",
            "Enter valid 10 digit mobile number."
        );
        return;
    }

    const users = getUsers();

    const user = users.find(u =>
        u.mobile === mobile &&
        u.name.toLowerCase() === name.toLowerCase()
    );

    if (!user) {
        showMessage(
            "forgotMessage",
            "Name and mobile number do not match."
        );
        return;
    }

    try {

        if (!forgotRecaptcha) {
            const ok = setupForgotRecaptcha();

            if (!ok) {
                showMessage(
                    "forgotMessage",
                    "reCAPTCHA could not be started."
                );
                return;
            }
        }

        showMessage(
            "forgotMessage",
            "Sending OTP..."
        );

        forgotConfirmationResult =
            await window.signInWithPhoneNumber(
                window.firebaseAuth,
                phoneNumber(mobile),
                forgotRecaptcha
            );

        if ($("forgotOtpSection")) {
            $("forgotOtpSection").style.display = "block";
        }

        showMessage(
            "forgotMessage",
            "OTP sent to your registered mobile 📱",
            true
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "forgotMessage",
            error.message || "OTP could not be sent."
        );
    }
}


async function resetPIN() {

    if (!forgotConfirmationResult) {
        showMessage(
            "forgotMessage",
            "First click Send OTP."
        );
        return;
    }

    const otp = $("forgotOtp")?.value.trim();
    const newPin = $("newPin")?.value.trim();
    const confirmNewPin = $("confirmNewPin")?.value.trim();

    if (!/^\d{6}$/.test(otp)) {
        showMessage(
            "forgotMessage",
            "Enter the 6 digit OTP."
        );
        return;
    }

    if (!validPIN(newPin)) {
        showMessage(
            "forgotMessage",
            "New PIN must contain 4 digits."
        );
        return;
    }

    if (newPin !== confirmNewPin) {
        showMessage(
            "forgotMessage",
            "New PINs do not match."
        );
        return;
    }

    try {

        await forgotConfirmationResult.confirm(otp);

        const name = $("forgotName").value.trim();
        const mobile = cleanMobile($("forgotMobile").value);

        const users = getUsers();

        const index = users.findIndex(u =>
            u.mobile === mobile &&
            u.name.toLowerCase() === name.toLowerCase()
        );

        if (index === -1) {
            showMessage(
                "forgotMessage",
                "Account not found."
            );
            return;
        }

        users[index].pin = newPin;

        saveUsers(users);

        showMessage(
            "forgotMessage",
            "PIN reset successfully ✅",
            true
        );

        setTimeout(showLoginPage, 1000);

    } catch (error) {

        console.error(error);

        showMessage(
            "forgotMessage",
            "Invalid or expired OTP."
        );
    }
}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    stopCamera("registration");
    stopCamera("attendance");

    currentUser = null;

    localStorage.removeItem(
        "currentAttendanceUser"
    );

    showLoginPage();
}


/* =========================================================
   DATE
========================================================= */

function updateCurrentDate() {

    const element = $("currentDate");

    if (!element) return;

    element.textContent =
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


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const users = getUsers();

    const attendance =
        JSON.parse(
            localStorage.getItem(ATTENDANCE_KEY) || "[]"
        );

    const today =
        new Date().toISOString().split("T")[0];

    const presentToday =
        new Set(
            attendance
                .filter(a => a.date === today)
                .map(a => a.userId)
        );

    const total = users.length;
    const present = presentToday.size;
    const absent = Math.max(0, total - present);

    if ($("totalStudents"))
        $("totalStudents").textContent = total;

    if ($("presentStudents"))
        $("presentStudents").textContent = present;

    if ($("absentStudents"))
        $("absentStudents").textContent = absent;

    if ($("attendancePercentage")) {

        const percentage =
            total === 0
                ? 0
                : Math.round((present / total) * 100);

        $("attendancePercentage").textContent =
            percentage + "%";
    }
}


/* =========================================================
   STUDENT LIST
========================================================= */

function displayStudents() {

    const container = $("studentList");

    if (!container) return;

    const search =
        ($("searchStudent")?.value || "")
            .toLowerCase()
            .trim();

    const users = getUsers();

    const filtered =
        users.filter(u =>
            u.name.toLowerCase().includes(search) ||
            (u.roll || "").toLowerCase().includes(search)
        );

    if (filtered.length === 0) {

        container.innerHTML =
            "<p>No registered students found.</p>";

        return;
    }

    container.innerHTML =
        filtered.map(u => `
            <div class="student-item">
                <strong>👤 ${escapeHTML(u.name)}</strong>
                <br>
                🔢 Roll: ${escapeHTML(u.roll || "Not added")}
                <br>
                🏫 ${escapeHTML(u.college || "Not added")}
                <br>
                🎓 ${escapeHTML(u.department || "Not added")}
                <br>
                📱 ${escapeHTML(u.mobile || "Not added")}
                <br>
                📧 ${escapeHTML(u.email || "Not added")}
            </div>
        `).join("");
}

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   FACE REGISTRATION
========================================================= */

async function startAutomaticFaceRegistration() {

    if (!currentUser) {
        showMessage(
            "registrationMessage",
            "Please login first."
        );
        return;
    }

    const name = $("faceName")?.value.trim();
    const roll = $("faceRoll")?.value.trim();
    const college = $("collegeName")?.value.trim();
    const department = $("departmentName")?.value.trim();
    const mobile = cleanMobile($("faceMobile")?.value);
    const email = $("faceEmail")?.value.trim();

    if (!name || !roll || !college || !department || mobile.length !== 10) {

        showMessage(
            "registrationMessage",
            "Please fill Name, Roll, College, Department and valid Mobile."
        );

        return;
    }

    try {

        showMessage(
            "registrationMessage",
            "Starting camera..."
        );

        const video = $("registrationCamera");

        registrationStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        video.srcObject = registrationStream;

        $("registrationStatus").textContent =
            "Camera is ON 📸";

        await new Promise(resolve =>
            setTimeout(resolve, 1500)
        );

        const canvas =
            document.createElement("canvas");

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const context =
            canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        /*
           Face API detection is attempted only if
           models have been loaded by the project.
        */

        let descriptor = null;

        if (
            typeof faceapi !== "undefined" &&
            faceapi.nets &&
            faceapi.nets.tinyFaceDetector
        ) {

            try {

                const detection =
                    await faceapi
                        .detectSingleFace(
                            video,
                            new faceapi.TinyFaceDetectorOptions()
                        )
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                if (detection) {
                    descriptor =
                        Array.from(
                            detection.descriptor
                        );
                }

            } catch (faceError) {

                console.warn(
                    "Face model not available:",
                    faceError
                );
            }
        }

        const users = getUsers();

        const index =
            users.findIndex(
                u => u.id === currentUser.id
            );

        if (index === -1) {
            showMessage(
                "registrationMessage",
                "Current user was not found."
            );
            stopCamera("registration");
            return;
        }

        users[index].name = name;
        users[index].roll = roll;
        users[index].college = college;
        users[index].department = department;
        users[index].mobile = mobile;
        users[index].email = email;

        if (descriptor) {
            users[index].faceDescriptor = descriptor;
        }

        saveUsers(users);

        currentUser = users[index];

        localStorage.setItem(
            "currentAttendanceUser",
            JSON.stringify(currentUser)
        );

        showMessage(
            "registrationMessage",
            "Face registration completed successfully ✅",
            true
        );

        stopCamera("registration");

        displayStudents();

    } catch (error) {

        console.error(error);

        showMessage(
            "registrationMessage",
            "Camera could not be started. Please allow camera permission."
        );

        stopCamera("registration");
    }
}


/* =========================================================
   FACE ATTENDANCE
========================================================= */

async function startFaceAttendance() {

    if (!currentUser) {

        showMessage(
            "attendanceResult",
            "Please login first."
        );

        return;
    }

    try {

        const video = $("attendanceCamera");

        attendanceStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        video.srcObject = attendanceStream;

        $("attendanceStatus").textContent =
            "Camera is ON 📸";

        showMessage(
            "attendanceResult",
            "Look at the camera..."
        );

        await new Promise(resolve =>
            setTimeout(resolve, 2000)
        );

        /*
           If a face descriptor exists, try matching.
           Otherwise this demo marks attendance after
           camera capture.
        */

        const users = getUsers();

        const user =
            users.find(
                u => u.id === currentUser.id
            );

        if (!user) {
            showMessage(
                "attendanceResult",
                "Student account not found."
            );
            stopCamera("attendance");
            return;
        }

        const today =
            new Date().toISOString().split("T")[0];

        const attendance =
            JSON.parse(
                localStorage.getItem(ATTENDANCE_KEY) || "[]"
            );

        const alreadyMarked =
            attendance.some(a =>
                a.userId === user.id &&
                a.date === today
            );

        if (alreadyMarked) {

            showMessage(
                "attendanceResult",
                "Attendance already marked today ✅",
                true
            );

            stopCamera("attendance");
            return;
        }

        attendance.push({
            userId: user.id,
            name: user.name,
            roll: user.roll || "",
            date: today,
            time: new Date().toLocaleTimeString("en-IN"),
            status: "Present"
        });

        localStorage.setItem(
            ATTENDANCE_KEY,
            JSON.stringify(attendance)
        );

        showMessage(
            "attendanceResult",
            `Attendance marked successfully for ${user.name} ✅`,
            true
        );

        updateDashboard();

        stopCamera("attendance");

    } catch (error) {

        console.error(error);

        showMessage(
            "attendanceResult",
            "Camera permission is required."
        );

        stopCamera("attendance");
    }
}


/* =========================================================
   CAMERA STOP
========================================================= */

function stopCamera(type) {

    if (type === "registration") {

        if (registrationStream) {

            registrationStream
                .getTracks()
                .forEach(track => track.stop());

            registrationStream = null;
        }

        if ($("registrationCamera"))
            $("registrationCamera").srcObject = null;

        if ($("registrationStatus"))
            $("registrationStatus").textContent =
                "Camera is OFF";
    }

    if (type === "attendance") {

        if (attendanceStream) {

            attendanceStream
                .getTracks()
                .forEach(track => track.stop());

            attendanceStream = null;
        }

        if ($("attendanceCamera"))
            $("attendanceCamera").srcObject = null;

        if ($("attendanceStatus"))
            $("attendanceStatus").textContent =
                "Camera is OFF";
    }
}


/* =========================================================
   ATTENDANCE CHECK
========================================================= */

function showCheckAttendance() {

    const modal = $("attendanceCheckModal");

    if (!modal) return;

    modal.style.display = "flex";

    const attendance =
        JSON.parse(
            localStorage.getItem(ATTENDANCE_KEY) || "[]"
        );

    const userAttendance =
        currentUser
            ? attendance.filter(
                a => a.userId === currentUser.id
            )
            : [];

    const totalDays =
        new Set(
            attendance.map(a => a.date)
        ).size;

    const presentDays =
        userAttendance.length;

    const absentDays =
        Math.max(
            0,
            totalDays - presentDays
        );

    if ($("attendanceTotalDays"))
        $("attendanceTotalDays").textContent =
            totalDays;

    if ($("attendancePresentDays"))
        $("attendancePresentDays").textContent =
            presentDays;

    if ($("attendanceAbsentDays"))
        $("attendanceAbsentDays").textContent =
            absentDays;

    const history = $("attendanceHistory");

    if (!history) return;

    history.innerHTML =
        userAttendance.length
            ? userAttendance.map(a => `
                <div class="attendance-history-item">
                    📅 ${escapeHTML(a.date)}
                    <br>
                    ⏰ ${escapeHTML(a.time)}
                    <br>
                    ✅ ${escapeHTML(a.status)}
                </div>
            `).join("")
            : "<p>No attendance history.</p>";
}

function closeCheckAttendance() {

    if ($("attendanceCheckModal"))
        $("attendanceCheckModal").style.display = "none";
}


/* =========================================================
   REGISTERED STUDENTS MODAL
========================================================= */

function showRegisteredStudents() {

    const modal = $("studentsModal");

    if (!modal) return;

    modal.style.display = "flex";

    const container =
        $("registeredStudentsList");

    const users = getUsers();

    if (!users.length) {

        container.innerHTML =
            "<p>No registered students.</p>";

        return;
    }

    container.innerHTML =
        users.map(u => `
            <div class="student-item">
                <strong>👤 ${escapeHTML(u.name)}</strong>
                <br>
                🔢 Roll: ${escapeHTML(u.roll || "Not added")}
                <br>
                📱 ${escapeHTML(u.mobile)}
                <br>
                📧 ${escapeHTML(u.email || "Not added")}
            </div>
        `).join("");
}

function closeRegisteredStudents() {

    if ($("studentsModal"))
        $("studentsModal").style.display = "none";
}


/* =========================================================
   ADMIN
========================================================= */

function showAdminDetails() {

    if ($("adminModal"))
        $("adminModal").style.display = "flex";
}

function closeAdminDetails() {

    if ($("adminModal"))
        $("adminModal").style.display = "none";
}


/* =========================================================
   EDIT DETAILS
========================================================= */

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

    $("editDetailsModal").style.display =
        "flex";
}

function closeEditDetails() {

    $("editDetailsModal").style.display =
        "none";
}

function saveEditedDetails() {

    if (!currentUser) return;

    const name =
        $("editName").value.trim();

    const roll =
        $("editRoll").value.trim();

    const college =
        $("editCollege").value.trim();

    const department =
        $("editDepartment").value.trim();

    const mobile =
        cleanMobile($("editMobile").value);

    const email =
        $("editEmail").value.trim();

    if (!name || !roll || !college || !department) {
        alert("Please fill all required details.");
        return;
    }

    if (mobile.length !== 10) {
        alert("Enter valid 10 digit mobile number.");
        return;
    }

    const users = getUsers();

    const index =
        users.findIndex(
            u => u.id === currentUser.id
        );

    if (index === -1) return;

    users[index].name = name;
    users[index].roll = roll;
    users[index].college = college;
    users[index].department = department;
    users[index].mobile = mobile;
    users[index].email = email;

    saveUsers(users);

    currentUser = users[index];

    localStorage.setItem(
        "currentAttendanceUser",
        JSON.stringify(currentUser)
    );

    closeEditDetails();
    displayStudents();

    alert("Details updated successfully ✅");
}


/* =========================================================
   MOBILE / EMAIL MENU
========================================================= */

function openMobileUpdate() {

    if (!currentUser) return;

    const mobile =
        prompt(
            "Enter your 10 digit mobile number:",
            currentUser.mobile || ""
        );

    if (mobile === null) return;

    const clean = cleanMobile(mobile);

    if (clean.length !== 10) {
        alert("Invalid mobile number.");
        return;
    }

    const users = getUsers();

    const index =
        users.findIndex(
            u => u.id === currentUser.id
        );

    if (index === -1) return;

    users[index].mobile = clean;

    saveUsers(users);

    currentUser = users[index];

    localStorage.setItem(
        "currentAttendanceUser",
        JSON.stringify(currentUser)
    );

    alert("Mobile number updated ✅");
}

function openEmailUpdate() {

    if (!currentUser) return;

    const email =
        prompt(
            "Enter your email:",
            currentUser.email || ""
        );

    if (email === null) return;

    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        alert("Invalid email address.");
        return;
    }

    const users = getUsers();

    const index =
        users.findIndex(
            u => u.id === currentUser.id
        );

    if (index === -1) return;

    users[index].email = email;

    saveUsers(users);

    currentUser = users[index];

    localStorage.setItem(
        "currentAttendanceUser",
        JSON.stringify(currentUser)
    );

    alert("Email updated ✅");
}


/* =========================================================
   MENU
========================================================= */

function toggleMenu() {

    const menu = $("mainMenu");

    if (!menu) return;

    menu.classList.toggle("show");
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    $("loginButton")?.addEventListener(
        "click",
        loginUser
    );

    $("createAccountButton")?.addEventListener(
        "click",
        showCreatePage
    );

    $("forgotPinButton")?.addEventListener(
        "click",
        showForgotPage
    );

    $("backToLoginButton")?.addEventListener(
        "click",
        showLoginPage
    );

    $("forgotBackButton")?.addEventListener(
        "click",
        showLoginPage
    );

    $("sendCreateOtpButton")?.addEventListener(
        "click",
        sendCreateOTP
    );

    $("verifyCreateOtpButton")?.addEventListener(
        "click",
        verifyCreateOTP
    );

    $("sendForgotOtpButton")?.addEventListener(
        "click",
        sendForgotOTP
    );

    $("resetPinButton")?.addEventListener(
        "click",
        resetPIN
    );

    const savedUser =
        localStorage.getItem(
            "currentAttendanceUser"
        );

    if (savedUser) {

        try {

            currentUser =
                JSON.parse(savedUser);

            showDashboard();

        } catch (error) {

            localStorage.removeItem(
                "currentAttendanceUser"
            );

            showLoginPage();
        }

    } else {

        showLoginPage();
    }

    updateCurrentDate();
});


/* =========================================================
   MAKE FUNCTIONS AVAILABLE TO HTML onclick
========================================================= */

window.toggleMenu = toggleMenu;
window.openEditDetails = openEditDetails;
window.openMobileUpdate = openMobileUpdate;
window.openEmailUpdate = openEmailUpdate;
window.showRegisteredStudents = showRegisteredStudents;
window.showCheckAttendance = showCheckAttendance;
window.showAdminDetails = showAdminDetails;
window.logoutUser = logoutUser;

window.closeEditDetails = closeEditDetails;
window.closeRegisteredStudents = closeRegisteredStudents;
window.closeCheckAttendance = closeCheckAttendance;
window.closeAdminDetails = closeAdminDetails;

window.saveEditedDetails = saveEditedDetails;

window.startAutomaticFaceRegistration =
    startAutomaticFaceRegistration;

window.startFaceAttendance =
    startFaceAttendance;

window.displayStudents =
    displayStudents;

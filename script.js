/* =========================================================
   SMART ATTENDANCE SYSTEM
   COMPLETE SCRIPT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       STORAGE
    ===================================================== */

    const USERS_KEY = "smartAttendanceUsers";
    const ATTENDANCE_KEY = "smartAttendanceRecords";
    const CURRENT_USER_KEY = "smartAttendanceCurrentUser";

    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    let attendanceRecords =
        JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];

    let currentUser =
        JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;

    let registrationStream = null;
    let attendanceStream = null;

    let registrationRunning = false;
    let attendanceRunning = false;

    /* =====================================================
       HELPERS
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function saveUsers() {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function saveAttendance() {
        localStorage.setItem(
            ATTENDANCE_KEY,
            JSON.stringify(attendanceRecords)
        );
    }

    function showMessage(element, message, type = "success") {
        if (!element) return;

        element.textContent = message;
        element.className = "auth-message " + type;
    }

    function hideAllPages() {

        const pages = [
            "loginPage",
            "createAccountPage",
            "forgotPinPage",
            "dashboardPage"
        ];

        pages.forEach(id => {

            const element = $(id);

            if (element) {
                element.style.display = "none";
            }

        });
    }

    function showLogin() {

        hideAllPages();

        $("loginPage").style.display = "flex";

        stopRegistrationCamera();
        stopAttendanceCamera();
    }

    function showCreateAccount() {

        hideAllPages();

        $("createAccountPage").style.display = "flex";

        stopRegistrationCamera();
        stopAttendanceCamera();
    }

    function showForgotPin() {

        hideAllPages();

        $("forgotPinPage").style.display = "flex";

        stopRegistrationCamera();
        stopAttendanceCamera();
    }

    function showDashboard() {

        hideAllPages();

        $("dashboardPage").style.display = "flex";

        updateDashboard();

        showSection("dashboardHome");
    }

    /* =====================================================
       ADMIN
    ===================================================== */

    const ADMIN_NAME = "Ayush Chatterjee";

    function isAdmin() {

        if (!currentUser) return false;

        return (
            currentUser.isAdmin === true ||
            currentUser.name === ADMIN_NAME
        );
    }

    /* =====================================================
       PAGE NAVIGATION
    ===================================================== */

    function showSection(sectionId) {

        const sections = [
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

        sections.forEach(id => {

            const section = $(id);

            if (section) {
                section.style.display = "none";
            }

        });

        const target = $(sectionId);

        if (target) {
            target.style.display = "block";
        }

        updateMenuActive(sectionId);

        if (sectionId !== "faceRegistrationSection") {
            stopRegistrationCamera();
        }

        if (sectionId !== "attendanceSection") {
            stopAttendanceCamera();
        }

        if (sectionId === "studentsSection") {
            renderStudents();
        }

        if (sectionId === "checkAttendanceSection") {
            renderMyAttendance();
        }

        if (sectionId === "adminSection") {
            renderAdminStudents();
        }

        if (sectionId === "editProfileSection") {
            loadEditProfile();
        }

        if (sectionId === "editContactSection") {
            loadContactDetails();
        }

        if (sectionId === "personalDetailsSection") {
            updatePersonalDetails();
        }
    }

    function updateMenuActive(sectionId) {

        document
            .querySelectorAll(".menu-item")
            .forEach(button => {
                button.classList.remove("active");
            });

        const mapping = {

            dashboardHome: "dashboardMenuButton",

            editProfileSection:
                "editProfileMenuButton",

            editContactSection:
                "editContactMenuButton",

            personalDetailsSection:
                "personalDetailsMenuButton",

            faceRegistrationSection:
                "faceRegistrationMenuButton",

            attendanceSection:
                "attendanceMenuButton",

            studentsSection:
                "studentsMenuButton",

            checkAttendanceSection:
                "checkAttendanceMenuButton",

            adminSection:
                "adminMenuButton"
        };

        const buttonId = mapping[sectionId];

        if (buttonId && $(buttonId)) {
            $(buttonId).classList.add("active");
        }
    }

    /* =====================================================
       LOGIN
    ===================================================== */

    if ($("loginButton")) {

        $("loginButton").addEventListener("click", () => {

            const name =
                $("loginName").value.trim();

            const identity =
                $("loginIdentity").value.trim();

            const pin =
                $("loginPin").value.trim();

            if (!name || !identity || !pin) {

                showMessage(
                    $("loginMessage"),
                    "Please fill all login fields.",
                    "error"
                );

                return;
            }

            /* ADMIN LOGIN */

            if (
                name.toLowerCase() ===
                ADMIN_NAME.toLowerCase()
            ) {

                const adminPin =
                    localStorage.getItem("adminPin") || "1234";

                if (pin !== adminPin) {

                    showMessage(
                        $("loginMessage"),
                        "Invalid Admin PIN.",
                        "error"
                    );

                    return;
                }

                currentUser = {

                    id: "ADMIN",

                    name: ADMIN_NAME,

                    mobile: identity,

                    email: identity.includes("@")
                        ? identity
                        : "",

                    college:
                        "Hooghly Engineering & Technology College",

                    department: "Administration",

                    roll: "ADMIN",

                    isAdmin: true

                };

                localStorage.setItem(
                    CURRENT_USER_KEY,
                    JSON.stringify(currentUser)
                );

                showDashboard();

                return;
            }

            /* STUDENT LOGIN */

            const user = users.find(u => {

                const sameName =
                    u.name.toLowerCase() ===
                    name.toLowerCase();

                const sameIdentity =
                    u.mobile === identity ||
                    (
                        u.email &&
                        u.email.toLowerCase() ===
                        identity.toLowerCase()
                    );

                const samePin =
                    u.pin === pin;

                return (
                    sameName &&
                    sameIdentity &&
                    samePin
                );
            });

            if (!user) {

                showMessage(
                    $("loginMessage"),
                    "Invalid name, mobile/email or PIN.",
                    "error"
                );

                return;
            }

            currentUser = user;

            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(currentUser)
            );

            showDashboard();

        });

    }

    /* =====================================================
       CREATE ACCOUNT BUTTON
    ===================================================== */

    if ($("createAccountButton")) {

        $("createAccountButton")
            .addEventListener("click", () => {

                showCreateAccount();

            });

    }

    /* =====================================================
       CREATE ACCOUNT
    ===================================================== */

    if ($("createAccountSubmit")) {

        $("createAccountSubmit")
            .addEventListener("click", () => {

                const name =
                    $("createName").value.trim();

                const mobile =
                    $("createMobile").value.trim();

                const email =
                    $("createEmail").value.trim();

                const pin =
                    $("createPin").value.trim();

                const confirmPin =
                    $("confirmPin").value.trim();

                const college =
                    $("createCollege").value.trim();

                const department =
                    $("createDepartment").value.trim();

                const roll =
                    $("createRoll").value.trim();

                if (
                    !name ||
                    !mobile ||
                    !pin ||
                    !confirmPin ||
                    !college ||
                    !department ||
                    !roll
                ) {

                    showMessage(
                        $("createMessage"),
                        "Please fill all required fields.",
                        "error"
                    );

                    return;
                }

                if (!/^\d{10}$/.test(mobile)) {

                    showMessage(
                        $("createMessage"),
                        "Mobile number must contain 10 digits.",
                        "error"
                    );

                    return;
                }

                if (!/^\d{4}$/.test(pin)) {

                    showMessage(
                        $("createMessage"),
                        "PIN must contain exactly 4 digits.",
                        "error"
                    );

                    return;
                }

                if (pin !== confirmPin) {

                    showMessage(
                        $("createMessage"),
                        "PIN and Confirm PIN do not match.",
                        "error"
                    );

                    return;
                }

                const duplicateMobile =
                    users.some(u => u.mobile === mobile);

                if (duplicateMobile) {

                    showMessage(
                        $("createMessage"),
                        "This mobile number is already registered.",
                        "error"
                    );

                    return;
                }

                if (
                    email &&
                    users.some(
                        u =>
                            u.email &&
                            u.email.toLowerCase() ===
                            email.toLowerCase()
                    )
                ) {

                    showMessage(
                        $("createMessage"),
                        "This email is already registered.",
                        "error"
                    );

                    return;
                }

                const newUser = {

                    id:
                        "USER_" +
                        Date.now(),

                    name,

                    mobile,

                    email,

                    pin,

                    college,

                    department,

                    roll,

                    isAdmin: false,

                    faceRegistered: false,

                    faceDescriptor: null,

                    createdAt:
                        new Date().toISOString()

                };

                users.push(newUser);

                saveUsers();

                showMessage(
                    $("createMessage"),
                    "Account created successfully! Returning to Login...",
                    "success"
                );

                setTimeout(() => {

                    $("loginName").value =
                        name;

                    $("loginIdentity").value =
                        mobile;

                    $("loginPin").value = "";

                    showLogin();

                }, 1200);

            });

    }

    /* =====================================================
       BACK TO LOGIN
    ===================================================== */

    if ($("backToLoginButton")) {

        $("backToLoginButton")
            .addEventListener("click", () => {

                showLogin();

            });

    }

    if ($("forgotBackButton")) {

        $("forgotBackButton")
            .addEventListener("click", () => {

                showLogin();

            });

    }

    /* =====================================================
       FORGOT PIN
    ===================================================== */

    if ($("forgotPinButton")) {

        $("forgotPinButton")
            .addEventListener("click", () => {

                showForgotPin();

            });

    }

    if ($("resetPinButton")) {

        $("resetPinButton")
            .addEventListener("click", () => {

                const name =
                    $("forgotName").value.trim();

                const identity =
                    $("forgotIdentity").value.trim();

                const newPin =
                    $("newPin").value.trim();

                const confirmNewPin =
                    $("confirmNewPin").value.trim();

                if (
                    !name ||
                    !identity ||
                    !newPin ||
                    !confirmNewPin
                ) {

                    showMessage(
                        $("forgotMessage"),
                        "Please fill all fields.",
                        "error"
                    );

                    return;
                }

                if (!/^\d{4}$/.test(newPin)) {

                    showMessage(
                        $("forgotMessage"),
                        "New PIN must contain 4 digits.",
                        "error"
                    );

                    return;
                }

                if (newPin !== confirmNewPin) {

                    showMessage(
                        $("forgotMessage"),
                        "PINs do not match.",
                        "error"
                    );

                    return;
                }

                /* ADMIN RESET */

                if (
                    name.toLowerCase() ===
                    ADMIN_NAME.toLowerCase()
                ) {

                    if (
                        localStorage.getItem("adminIdentity") &&
                        localStorage.getItem("adminIdentity") !==
                        identity
                    ) {

                        showMessage(
                            $("forgotMessage"),
                            "Admin identity does not match.",
                            "error"
                        );

                        return;
                    }

                    localStorage.setItem(
                        "adminPin",
                        newPin
                    );

                    localStorage.setItem(
                        "adminIdentity",
                        identity
                    );

                    showMessage(
                        $("forgotMessage"),
                        "Admin PIN reset successfully.",
                        "success"
                    );

                    return;
                }

                const user =
                    users.find(u => {

                        return (
                            u.name.toLowerCase() ===
                            name.toLowerCase() &&
                            (
                                u.mobile === identity ||
                                (
                                    u.email &&
                                    u.email.toLowerCase() ===
                                    identity.toLowerCase()
                                )
                            )
                        );

                    });

                if (!user) {

                    showMessage(
                        $("forgotMessage"),
                        "Account not found.",
                        "error"
                    );

                    return;
                }

                user.pin = newPin;

                saveUsers();

                showMessage(
                    $("forgotMessage"),
                    "PIN reset successfully. You can login now.",
                    "success"
                );

            });

    }

    /* =====================================================
       DASHBOARD
    ===================================================== */

    function updateDashboard() {

        if (!currentUser) return;

        const name =
            currentUser.name || "Student";

        if ($("dashboardUserName")) {
            $("dashboardUserName").textContent =
                name;
        }

        if ($("welcomeName")) {
            $("welcomeName").textContent =
                name;
        }

        if ($("dashboardUserRoll")) {

            $("dashboardUserRoll").textContent =
                isAdmin()
                    ? "Administrator"
                    : "Roll: " +
                      (currentUser.roll || "-");

        }

        if ($("currentDate")) {

            const now = new Date();

            $("currentDate").textContent =
                now.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                ) +
                " • " +
                now.toLocaleTimeString(
                    "en-IN"
                );

        }

        updateStats();

        updatePersonalDetails();

    }

    /* =====================================================
       DASHBOARD STATS
    ===================================================== */

    function updateStats() {

        const total =
            users.length;

        const today =
            getTodayString();

        const presentToday =
            new Set(
                attendanceRecords
                    .filter(r =>
                        r.date === today &&
                        r.status === "Present"
                    )
                    .map(r => r.userId)
            ).size;

        const absentToday =
            Math.max(
                total - presentToday,
                0
            );

        const percentage =
            total > 0
                ? Math.round(
                    (presentToday / total) *
                    100
                )
                : 0;

        if ($("totalStudents")) {
            $("totalStudents").textContent =
                total;
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

    function getTodayString() {

        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    /* =====================================================
       MENU BUTTONS
    ===================================================== */

    if ($("dashboardMenuButton")) {

        $("dashboardMenuButton")
            .addEventListener(
                "click",
                () => showSection("dashboardHome")
            );

    }

    if ($("editProfileMenuButton")) {

        $("editProfileMenuButton")
            .addEventListener(
                "click",
                () =>
                    showSection(
                        "editProfileSection"
                    )
            );

    }

    if ($("editContactMenuButton")) {

        $("editContactMenuButton")
            .addEventListener(
                "click",
                () =>
                    showSection(
                        "editContactSection"
                    )
            );

    }

    if ($("personalDetailsMenuButton")) {

        $("personalDetailsMenuButton")
            .addEventListener(
                "click",
                () =>
                    showSection(
                        "personalDetailsSection"
                    )
            );

    }

    if ($("faceRegistrationMenuButton")) {

        $("faceRegistrationMenuButton")
            .addEventListener(
                "click",
                () =>
                    showSection(
                        "faceRegistrationSection"
                    )
            );

    }

    if ($("attendanceMenuButton")) {

        $("attendanceMenuButton")
            .addEventListener(
                "click",
                () =>
                    showSection(
                        "attendanceSection"
                    )
            );

    }

    if ($("studentsMenuButton")) {

        $("studentsMenuButton")
            .addEventListener(
                "click",
                () =>
                    showSection(
                        "studentsSection"
                    )
            );

    }

    if ($("checkAttendanceMenuButton")) {

        $("checkAttendanceMenuButton")
            .addEventListener(
                "click",
                () =>
                    showSection(
                        "checkAttendanceSection"
                    )
            );

    }

    if ($("adminMenuButton")) {

        $("adminMenuButton")
            .addEventListener(
                "click",
                () => {

                    if (!isAdmin()) {

                        alert(
                            "Admin access only."
                        );

                        return;
                    }

                    showSection("adminSection");

                }
            );

    }

    /* =====================================================
       QUICK ACTIONS
    ===================================================== */

    if ($("quickFaceRegistration")) {

        $("quickFaceRegistration")
            .addEventListener(
                "click",
                () =>
                    showSection(
                        "faceRegistrationSection"
                    )
            );

    }

    if ($("quickAttendance")) {

        $("quickAttendance")
            .addEventListener(
                "click",
                () =>
                    showSection(
                        "attendanceSection"
                    )
            );

    }

    if ($("quickCheckAttendance")) {

        $("quickCheckAttendance")
            .addEventListener(
                "click",
                () =>
                    showSection(
                        "checkAttendanceSection"
                    )
            );

    }

    /* =====================================================
       EDIT PROFILE
    ===================================================== */

    function loadEditProfile() {

        if (!currentUser) return;

        if ($("editName")) {
            $("editName").value =
                currentUser.name || "";
        }

        if ($("editRoll")) {
            $("editRoll").value =
                currentUser.roll || "";
        }

        if ($("editDepartment")) {
            $("editDepartment").value =
                currentUser.department || "";
        }
    }

    if ($("saveEditedDetailsButton")) {

        $("saveEditedDetailsButton")
            .addEventListener("click", () => {

                if (!currentUser) return;

                const name =
                    $("editName").value.trim();

                const roll =
                    $("editRoll").value.trim();

                const department =
                    $("editDepartment").value.trim();

                if (!name || !roll || !department) {

                    alert(
                        "Please fill all profile details."
                    );

                    return;
                }

                if (!isAdmin()) {

                    const user =
                        users.find(
                            u =>
                                u.id ===
                                currentUser.id
                        );

                    if (user) {

                        user.name =
                            name;

                        user.roll =
                            roll;

                        user.department =
                            department;

                        currentUser =
                            user;

                        saveUsers();

                    }

                } else {

                    currentUser.name =
                        name;

                    currentUser.roll =
                        roll;

                    currentUser.department =
                        department;

                }

                localStorage.setItem(
                    CURRENT_USER_KEY,
                    JSON.stringify(currentUser)
                );

                updateDashboard();

                alert(
                    "Profile updated successfully."
                );

            });

    }

    /* =====================================================
       CONTACT DETAILS
    ===================================================== */

    function loadContactDetails() {

        if (!currentUser) return;

        if ($("editMobile")) {

            $("editMobile").value =
                currentUser.mobile || "";

        }

        if ($("editEmail")) {

            $("editEmail").value =
                currentUser.email || "";

        }
    }

    if ($("saveContactButton")) {

        $("saveContactButton")
            .addEventListener("click", () => {

                if (!currentUser) return;

                const mobile =
                    $("editMobile").value.trim();

                const email =
                    $("editEmail").value.trim();

                if (!/^\d{10}$/.test(mobile)) {

                    showMessage(
                        $("contactMessage"),
                        "Enter a valid 10 digit mobile number.",
                        "error"
                    );

                    return;
                }

                if (!isAdmin()) {

                    const user =
                        users.find(
                            u =>
                                u.id ===
                                currentUser.id
                        );

                    if (user) {

                        user.mobile =
                            mobile;

                        user.email =
                            email;

                        currentUser =
                            user;

                        saveUsers();

                    }

                } else {

                    currentUser.mobile =
                        mobile;

                    currentUser.email =
                        email;

                }

                localStorage.setItem(
                    CURRENT_USER_KEY,
                    JSON.stringify(currentUser)
                );

                updateDashboard();

                showMessage(
                    $("contactMessage"),
                    "Contact details updated successfully.",
                    "success"
                );

            });

    }

    /* =====================================================
       PERSONAL DETAILS
    ===================================================== */

    function updatePersonalDetails() {

        if (!currentUser) return;

        if ($("personalName")) {
            $("personalName").textContent =
                currentUser.name || "-";
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
    }

    /* =====================================================
       FACE REGISTRATION CAMERA
    ===================================================== */

    async function startRegistrationCamera() {

        const video =
            $("registrationCamera");

        if (!video) return;

        try {

            registrationStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user"
                    },
                    audio: false
                });

            video.srcObject =
                registrationStream;

            registrationRunning =
                true;

            if ($("registrationStatus")) {

                $("registrationStatus")
                    .textContent =
                    "Camera is ON • Looking for face...";

            }

        } catch (error) {

            console.error(error);

            if ($("registrationStatus")) {

                $("registrationStatus")
                    .textContent =
                    "Camera permission denied";

            }

            showMessage(
                $("registrationMessage"),
                "Please allow camera permission.",
                "error"
            );
        }
    }

    function stopRegistrationCamera() {

        if (registrationStream) {

            registrationStream
                .getTracks()
                .forEach(track =>
                    track.stop()
                );

            registrationStream =
                null;
        }

        registrationRunning =
            false;

        if ($("registrationCamera")) {
            $("registrationCamera").srcObject =
                null;
        }

        if ($("registrationStatus")) {
            $("registrationStatus").textContent =
                "Camera is OFF";
        }
    }

    if ($("startFaceRegistrationButton")) {

        $("startFaceRegistrationButton")
            .addEventListener(
                "click",
                async () => {

                    if (registrationRunning) {

                        stopRegistrationCamera();

                        return;
                    }

                    const name =
                        $("faceName").value.trim();

                    const mobile =
                        $("faceMobile").value.trim();

                    const email =
                        $("faceEmail").value.trim();

                    const department =
                        $("departmentName").value.trim();

                    const roll =
                        $("faceRoll").value.trim();

                    if (
                        !name ||
                        !mobile ||
                        !department ||
                        !roll
                    ) {

                        showMessage(
                            $("registrationMessage"),
                            "Please enter name, mobile, branch and roll.",
                            "error"
                        );

                        return;
                    }

                    await startRegistrationCamera();

                    if (!registrationRunning) {
                        return;
                    }

                    /*
                       Demo automatic capture:
                       waits 3 seconds after camera starts.
                    */

                    showMessage(
                        $("registrationMessage"),
                        "Camera started. Keep your face inside the guide...",
                        "success"
                    );

                    setTimeout(() => {

                        if (!registrationRunning) {
                            return;
                        }

                        registerFaceData();

                    }, 3000);

                }
            );

    }

    function registerFaceData() {

        if (!currentUser) return;

        const user =
            users.find(
                u =>
                    u.id ===
                    currentUser.id
            );

        if (!user) {

            showMessage(
                $("registrationMessage"),
                "Please login as a student before registering your face.",
                "error"
            );

            return;
        }

        user.faceRegistered =
            true;

        user.faceRegisteredAt =
            new Date().toISOString();

        user.faceData =
            "FACE_REGISTERED";

        saveUsers();

        currentUser =
            user;

        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(currentUser)
        );

        showMessage(
            $("registrationMessage"),
            "✅ Face registered successfully!",
            "success"
        );

        stopRegistrationCamera();

    }

    /* =====================================================
       FACE ATTENDANCE CAMERA
    ===================================================== */

    async function startAttendanceCamera() {

        const video =
            $("attendanceCamera");

        if (!video) return;

        try {

            attendanceStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user"
                    },
                    audio: false
                });

            video.srcObject =
                attendanceStream;

            attendanceRunning =
                true;

            if ($("attendanceStatus")) {

                $("attendanceStatus")
                    .textContent =
                    "Camera is ON • Detecting face...";

            }

        } catch (error) {

            console.error(error);

            if ($("attendanceStatus")) {

                $("attendanceStatus")
                    .textContent =
                    "Camera permission denied";

            }

            showAttendanceResult(
                "❌ Camera permission is required.",
                "error"
            );
        }
    }

    function stopAttendanceCamera() {

        if (attendanceStream) {

            attendanceStream
                .getTracks()
                .forEach(track =>
                    track.stop()
                );

            attendanceStream =
                null;
        }

        attendanceRunning =
            false;

        if ($("attendanceCamera")) {

            $("attendanceCamera").srcObject =
                null;

        }

        if ($("attendanceStatus")) {

            $("attendanceStatus").textContent =
                "Camera is OFF";

        }
    }

    if ($("startFaceAttendanceButton")) {

        $("startFaceAttendanceButton")
            .addEventListener(
                "click",
                async () => {

                    if (!currentUser) {

                        showAttendanceResult(
                            "Please login first.",
                            "error"
                        );

                        return;
                    }

                    if (
                        !isAdmin() &&
                        !currentUser.faceRegistered
                    ) {

                        showAttendanceResult(
                            "Please register your face first.",
                            "error"
                        );

                        return;
                    }

                    if (attendanceRunning) {

                        stopAttendanceCamera();

                        return;
                    }

                    await startAttendanceCamera();

                    if (!attendanceRunning) {
                        return;
                    }

                    showAttendanceResult(
                        "Camera started. Keep your face inside the guide...",
                        "info"
                    );

                    /*
                       Automatic demo detection.
                       After 3 seconds attendance is marked.
                    */

                    setTimeout(() => {

                        if (!attendanceRunning) {
                            return;
                        }

                        markAttendanceAutomatically();

                    }, 3000);

                }
            );

    }

    /* =====================================================
       MARK ATTENDANCE
    ===================================================== */

    function markAttendanceAutomatically() {

        if (!currentUser) return;

        const now =
            new Date();

        const date =
            now.toISOString()
                .split("T")[0];

        const time =
            now.toLocaleTimeString(
                "en-IN"
            );

        const day =
            now.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long"
                }
            );

        const alreadyMarked =
            attendanceRecords.some(
                record =>
                    record.userId ===
                    currentUser.id &&
                    record.date ===
                    date
            );

        if (alreadyMarked) {

            stopAttendanceCamera();

            showAttendancePopup(
                "ℹ️",
                "Already Marked",
                `${currentUser.name}, your attendance for today has already been marked.`
            );

            return;
        }

        const record = {

            id:
                "ATT_" +
                Date.now(),

            userId:
                currentUser.id,

            name:
                currentUser.name,

            mobile:
                currentUser.mobile || "",

            email:
                currentUser.email || "",

            department:
                currentUser.department || "",

            roll:
                currentUser.roll || "",

            date,

            day,

            time,

            status: "Present"

        };

        attendanceRecords.push(
            record
        );

        saveAttendance();

        stopAttendanceCamera();

        updateStats();

        renderMyAttendance();

        showAttendancePopup(
            "✅",
            "Attendance Marked!",
            `${currentUser.name}, your attendance has been successfully marked on ${date} (${day}) at ${time}.`
        );

    }

    function showAttendanceResult(
        message,
        type = "success"
    ) {

        const result =
            $("attendanceResult");

        if (!result) return;

        result.textContent =
            message;

        result.className =
            "attendance-result " +
            type;

    }

    /* =====================================================
       ATTENDANCE POPUP
    ===================================================== */

    function showAttendancePopup(
        icon,
        title,
        message
    ) {

        if ($("popupIcon")) {
            $("popupIcon").textContent =
                icon;
        }

        if ($("popupTitle")) {
            $("popupTitle").textContent =
                title;
        }

        if ($("popupMessage")) {
            $("popupMessage").textContent =
                message;
        }

        if ($("attendancePopup")) {

            $("attendancePopup").style.display =
                "flex";

        }

    }

    if ($("closeAttendancePopup")) {

        $("closeAttendancePopup")
            .addEventListener(
                "click",
                () => {

                    if ($("attendancePopup")) {

                        $("attendancePopup")
                            .style.display =
                            "none";

                    }

                }
            );

    }

    /* =====================================================
       STUDENTS
    ===================================================== */

    function renderStudents() {

        const list =
            $("studentList");

        if (!list) return;

        list.innerHTML = "";

        if (users.length === 0) {

            list.innerHTML =
                "<p>No students registered yet.</p>";

            return;
        }

        users.forEach(user => {

            const card =
                document.createElement("div");

            card.className =
                "student-card";

            card.innerHTML = `

                <h3>${escapeHTML(user.name)}</h3>

                <p>
                    <strong>Mobile:</strong>
                    ${escapeHTML(user.mobile || "-")}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(user.email || "-")}
                </p>

                <p>
                    <strong>Branch:</strong>
                    ${escapeHTML(user.department || "-")}
                </p>

                <p>
                    <strong>Roll:</strong>
                    ${escapeHTML(user.roll || "-")}
                </p>

                <p>
                    <strong>Face:</strong>
                    ${
                        user.faceRegistered
                            ? "✅ Registered"
                            : "❌ Not Registered"
                    }
                </p>

            `;

            list.appendChild(card);

        });

    }

    /* =====================================================
       ADMIN STUDENTS
    ===================================================== */

    function renderAdminStudents() {

        const list =
            $("adminStudentList");

        if (!list) return;

        list.innerHTML = "";

        if (users.length === 0) {

            list.innerHTML =
                "<p>No students registered yet.</p>";

            return;
        }

        users.forEach(user => {

            const attendance =
                attendanceRecords.filter(
                    record =>
                        record.userId ===
                        user.id
                );

            const card =
                document.createElement("div");

            card.className =
                "student-card";

            card.innerHTML = `

                <h3>
                    👤 ${escapeHTML(user.name)}
                </h3>

                <p>
                    <strong>Mobile:</strong>
                    ${escapeHTML(user.mobile || "-")}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(user.email || "-")}
                </p>

                <p>
                    <strong>College:</strong>
                    ${escapeHTML(user.college || "-")}
                </p>

                <p>
                    <strong>Branch:</strong>
                    ${escapeHTML(user.department || "-")}
                </p>

                <p>
                    <strong>Roll:</strong>
                    ${escapeHTML(user.roll || "-")}
                </p>

                <p>
                    <strong>Face:</strong>
                    ${
                        user.faceRegistered
                            ? "✅ Registered"
                            : "❌ Not Registered"
                    }
                </p>

                <p>
                    <strong>Attendance:</strong>
                    ${attendance.length} days
                </p>

            `;

            list.appendChild(card);

        });

    }

    /* =====================================================
       SEARCH STUDENTS
    ===================================================== */

    if ($("searchStudent")) {

        $("searchStudent")
            .addEventListener(
                "input",
                () => {

                    const search =
                        $("searchStudent")
                            .value
                            .toLowerCase()
                            .trim();

                    const list =
                        $("studentList");

                    if (!list) return;

                    list.innerHTML = "";

                    const filtered =
                        users.filter(
                            user => {

                                return (

                                    user.name
                                        .toLowerCase()
                                        .includes(search)

                                    ||

                                    user.roll
                                        .toLowerCase()
                                        .includes(search)

                                    ||

                                    user.department
                                        .toLowerCase()
                                        .includes(search)

                                );

                            }
                        );

                    filtered.forEach(
                        user => {

                            const card =
                                document.createElement(
                                    "div"
                                );

                            card.className =
                                "student-card";

                            card.innerHTML = `

                                <h3>
                                    ${escapeHTML(user.name)}
                                </h3>

                                <p>
                                    Mobile:
                                    ${escapeHTML(user.mobile || "-")}
                                </p>

                                <p>
                                    Email:
                                    ${escapeHTML(user.email || "-")}
                                </p>

                                <p>
                                    Branch:
                                    ${escapeHTML(user.department || "-")}
                                </p>

                                <p>
                                    Roll:
                                    ${escapeHTML(user.roll || "-")}
                                </p>

                            `;

                            list.appendChild(card);

                        }
                    );

                }
            );

    }

    /* =====================================================
       ATTENDANCE HISTORY
    ===================================================== */

    function renderMyAttendance() {

        if (!currentUser) return;

        const records =
            attendanceRecords.filter(
                record =>
                    record.userId ===
                    currentUser.id
            );

        const present =
            records.filter(
                r =>
                    r.status === "Present"
            ).length;

        const total =
            records.length;

        const absent =
            Math.max(
                total - present,
                0
            );

        if ($("attendanceTotalDays")) {

            $("attendanceTotalDays")
                .textContent =
                total;

        }

        if ($("attendancePresentDays")) {

            $("attendancePresentDays")
                .textContent =
                present;

        }

        if ($("attendanceAbsentDays")) {

            $("attendanceAbsentDays")
                .textContent =
                absent;

        }

        const history =
            $("attendanceHistory");

        if (!history) return;

        history.innerHTML = "";

        if (records.length === 0) {

            history.innerHTML =
                "<p>No attendance records yet.</p>";

            return;
        }

        records
            .slice()
            .reverse()
            .forEach(record => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "attendance-history-item";

                item.innerHTML = `

                    <strong>
                        ${escapeHTML(record.date)}
                    </strong>

                    <span>
                        ${escapeHTML(record.day)}
                    </span>

                    <span>
                        ${escapeHTML(record.time)}
                    </span>

                    <b>
                        ${escapeHTML(record.status)}
                    </b>

                `;

                history.appendChild(item);

            });

    }

    /* =====================================================
       LOGOUT
    ===================================================== */

    if ($("logoutButton")) {

        $("logoutButton")
            .addEventListener(
                "click",
                () => {

                    stopRegistrationCamera();
                    stopAttendanceCamera();

                    currentUser =
                        null;

                    localStorage.removeItem(
                        CURRENT_USER_KEY
                    );

                    showLogin();

                    if ($("loginName")) {
                        $("loginName").value = "";
                    }

                    if ($("loginIdentity")) {
                        $("loginIdentity").value = "";
                    }

                    if ($("loginPin")) {
                        $("loginPin").value = "";
                    }

                }
            );

    }

    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }

    /* =====================================================
       INITIAL SETUP
    ===================================================== */

    if (!localStorage.getItem("adminPin")) {

        localStorage.setItem(
            "adminPin",
            "1234"
        );

    }

    if (currentUser) {

        showDashboard();

    } else {

        showLogin();

    }

});

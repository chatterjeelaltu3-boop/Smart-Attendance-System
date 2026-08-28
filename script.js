/* =========================================================
   SMART ATTENDANCE SYSTEM
   Complete Frontend Script
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    const USERS_KEY = "smartAttendanceUsers";
    const ATTENDANCE_KEY = "smartAttendanceRecords";
    const CURRENT_USER_KEY = "smartAttendanceCurrentUser";

    /* =====================================================
       ADMIN ACCOUNT
    ===================================================== */

    const ADMIN = {
        name: "Ayush Chatterjee",
        pin: "1234",
        role: "Admin",
        mobile: "",
        email: "",
        college: "Hooghly Engineering & Technology College",
        department: "Administration",
        roll: "ADMIN"
    };

    /* =====================================================
       GET ELEMENT
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    /* =====================================================
       PAGES
    ===================================================== */

    const loginPage = $("loginPage");
    const createAccountPage = $("createAccountPage");
    const forgotPinPage = $("forgotPinPage");
    const dashboardPage = $("dashboardPage");

    /* =====================================================
       LOGIN BUTTONS
    ===================================================== */

    const loginButton = $("loginButton");
    const createAccountButton = $("createAccountButton");
    const forgotPinButton = $("forgotPinButton");
    const createAccountSubmit = $("createAccountSubmit");
    const backToLoginButton = $("backToLoginButton");
    const resetPinButton = $("resetPinButton");
    const forgotBackButton = $("forgotBackButton");

    /* =====================================================
       DASHBOARD BUTTONS
    ===================================================== */

    const dashboardMenuButton = $("dashboardMenuButton");
    const editProfileMenuButton = $("editProfileMenuButton");
    const editContactMenuButton = $("editContactMenuButton");
    const personalDetailsMenuButton = $("personalDetailsMenuButton");
    const faceRegistrationMenuButton = $("faceRegistrationMenuButton");
    const attendanceMenuButton = $("attendanceMenuButton");
    const studentsMenuButton = $("studentsMenuButton");
    const checkAttendanceMenuButton = $("checkAttendanceMenuButton");
    const adminMenuButton = $("adminMenuButton");
    const logoutButton = $("logoutButton");

    const quickFaceRegistration = $("quickFaceRegistration");
    const quickAttendance = $("quickAttendance");
    const quickCheckAttendance = $("quickCheckAttendance");

    /* =====================================================
       DASHBOARD SECTIONS
    ===================================================== */

    const dashboardHome = $("dashboardHome");
    const editProfileSection = $("editProfileSection");
    const editContactSection = $("editContactSection");
    const personalDetailsSection = $("personalDetailsSection");
    const faceRegistrationSection = $("faceRegistrationSection");
    const attendanceSection = $("attendanceSection");
    const studentsSection = $("studentsSection");
    const checkAttendanceSection = $("checkAttendanceSection");
    const adminSection = $("adminSection");

    /* =====================================================
       CAMERA
    ===================================================== */

    const registrationCamera = $("registrationCamera");
    const attendanceCamera = $("attendanceCamera");

    let registrationStream = null;
    let attendanceStream = null;

    let registrationTimer = null;
    let attendanceTimer = null;

    /* =====================================================
       DATA FUNCTIONS
    ===================================================== */

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function getAttendance() {
        try {
            return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveAttendance(data) {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
        } catch {
            return null;
        }
    }

    function setCurrentUser(user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }

    function clearCurrentUser() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    /* =====================================================
       PAGE CONTROL
    ===================================================== */

    function hideAllPages() {

        if (loginPage) loginPage.style.display = "none";
        if (createAccountPage) createAccountPage.style.display = "none";
        if (forgotPinPage) forgotPinPage.style.display = "none";
        if (dashboardPage) dashboardPage.style.display = "none";
    }

    function showLogin() {
        stopAllCameras();
        hideAllPages();

        if (loginPage) {
            loginPage.style.display = "flex";
        }
    }

    function showCreateAccount() {
        hideAllPages();

        if (createAccountPage) {
            createAccountPage.style.display = "flex";
        }
    }

    function showForgotPin() {
        hideAllPages();

        if (forgotPinPage) {
            forgotPinPage.style.display = "flex";
        }
    }

    function showDashboard() {
        hideAllPages();

        if (dashboardPage) {
            dashboardPage.style.display = "flex";
        }

        updateDashboard();
        showSection("dashboardHome");
    }

    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(element, message, type = "info") {

        if (!element) return;

        element.textContent = message;

        element.className = "auth-message " + type;
    }

    /* =====================================================
       LOGIN
    ===================================================== */

    if (loginButton) {

        loginButton.addEventListener("click", () => {

            const name = $("loginName")?.value.trim();
            const identity = $("loginIdentity")?.value.trim();
            const pin = $("loginPin")?.value.trim();

            if (!name || !identity || !pin) {

                showMessage(
                    $("loginMessage"),
                    "Please fill all login details.",
                    "error"
                );

                return;
            }

            if (!/^\d{4}$/.test(pin)) {

                showMessage(
                    $("loginMessage"),
                    "PIN must be exactly 4 digits.",
                    "error"
                );

                return;
            }

            /* ADMIN LOGIN */

            if (
                name.toLowerCase() === ADMIN.name.toLowerCase() &&
                pin === ADMIN.pin
            ) {

                const adminUser = {
                    ...ADMIN,
                    loginIdentity: identity
                };

                setCurrentUser(adminUser);

                showMessage(
                    $("loginMessage"),
                    "Admin login successful!",
                    "success"
                );

                setTimeout(showDashboard, 400);

                return;
            }

            /* STUDENT LOGIN */

            const users = getUsers();

            const user = users.find(u => {

                const sameName =
                    u.name.toLowerCase() === name.toLowerCase();

                const sameMobile =
                    u.mobile === identity;

                const sameEmail =
                    u.email &&
                    u.email.toLowerCase() === identity.toLowerCase();

                const samePin =
                    u.pin === pin;

                return sameName && (sameMobile || sameEmail) && samePin;
            });

            if (!user) {

                showMessage(
                    $("loginMessage"),
                    "Invalid name, mobile/email or PIN.",
                    "error"
                );

                return;
            }

            setCurrentUser(user);

            showMessage(
                $("loginMessage"),
                "Login successful!",
                "success"
            );

            setTimeout(showDashboard, 400);
        });
    }

    /* =====================================================
       CREATE ACCOUNT PAGE
    ===================================================== */

    if (createAccountButton) {

        createAccountButton.addEventListener(
            "click",
            showCreateAccount
        );
    }

    /* =====================================================
       CREATE ACCOUNT
    ===================================================== */

    if (createAccountSubmit) {

        createAccountSubmit.addEventListener("click", () => {

            const name = $("createName")?.value.trim();
            const mobile = $("createMobile")?.value.trim();
            const email = $("createEmail")?.value.trim();
            const pin = $("createPin")?.value.trim();
            const confirmPin = $("confirmPin")?.value.trim();
            const college = $("createCollege")?.value.trim();
            const department = $("createDepartment")?.value.trim();
            const roll = $("createRoll")?.value.trim();

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

            if (
                name.toLowerCase() === ADMIN.name.toLowerCase()
            ) {

                showMessage(
                    $("createMessage"),
                    "This name is reserved for Admin.",
                    "error"
                );

                return;
            }

            const users = getUsers();

            const alreadyExists = users.some(user =>
                user.mobile === mobile ||
                (
                    email &&
                    user.email &&
                    user.email.toLowerCase() === email.toLowerCase()
                ) ||
                (
                    user.roll.toLowerCase() === roll.toLowerCase() &&
                    user.department.toLowerCase() === department.toLowerCase()
                )
            );

            if (alreadyExists) {

                showMessage(
                    $("createMessage"),
                    "An account with these details already exists.",
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

            showMessage(
                $("createMessage"),
                "Account created successfully! Returning to login...",
                "success"
            );

            setTimeout(() => {

                if ($("loginName"))
                    $("loginName").value = name;

                if ($("loginIdentity"))
                    $("loginIdentity").value = mobile;

                if ($("loginPin"))
                    $("loginPin").value = "";

                showLogin();

            }, 1000);
        });
    }

    /* =====================================================
       BACK TO LOGIN
    ===================================================== */

    if (backToLoginButton) {
        backToLoginButton.addEventListener(
            "click",
            showLogin
        );
    }

    if (forgotPinButton) {
        forgotPinButton.addEventListener(
            "click",
            showForgotPin
        );
    }

    if (forgotBackButton) {
        forgotBackButton.addEventListener(
            "click",
            showLogin
        );
    }

    /* =====================================================
       RESET PIN
    ===================================================== */

    if (resetPinButton) {

        resetPinButton.addEventListener("click", () => {

            const name = $("forgotName")?.value.trim();
            const identity = $("forgotIdentity")?.value.trim();
            const newPin = $("newPin")?.value.trim();
            const confirmNewPin =
                $("confirmNewPin")?.value.trim();

            if (!name || !identity || !newPin || !confirmNewPin) {

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
                    "PIN must be exactly 4 digits.",
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

            /* ADMIN PIN */

            if (
                name.toLowerCase() === ADMIN.name.toLowerCase()
            ) {

                showMessage(
                    $("forgotMessage"),
                    "Admin PIN cannot be reset from student reset.",
                    "error"
                );

                return;
            }

            const users = getUsers();

            const index = users.findIndex(user => {

                const sameName =
                    user.name.toLowerCase() === name.toLowerCase();

                const sameIdentity =
                    user.mobile === identity ||
                    (
                        user.email &&
                        user.email.toLowerCase() ===
                        identity.toLowerCase()
                    );

                return sameName && sameIdentity;
            });

            if (index === -1) {

                showMessage(
                    $("forgotMessage"),
                    "Account not found.",
                    "error"
                );

                return;
            }

            users[index].pin = newPin;

            saveUsers(users);

            showMessage(
                $("forgotMessage"),
                "PIN reset successfully! Please login.",
                "success"
            );

            setTimeout(showLogin, 1200);
        });
    }

    /* =====================================================
       SECTION CONTROL
    ===================================================== */

    function showSection(sectionId) {

        const sections = [
            dashboardHome,
            editProfileSection,
            editContactSection,
            personalDetailsSection,
            faceRegistrationSection,
            attendanceSection,
            studentsSection,
            checkAttendanceSection,
            adminSection
        ];

        sections.forEach(section => {

            if (section) {
                section.style.display = "none";
            }
        });

        const target = $(sectionId);

        if (target) {
            target.style.display = "block";
        }

        stopAllCameras();

        updateMenuActive(sectionId);

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
            fillFaceDetails();
        }

        if (sectionId === "editProfileSection") {
            fillEditProfile();
        }

        if (sectionId === "editContactSection") {
            fillEditContact();
        }

        if (sectionId === "personalDetailsSection") {
            fillPersonalDetails();
        }
    }

    /* =====================================================
       MENU ACTIVE
    ===================================================== */

    function updateMenuActive(sectionId) {

        document
            .querySelectorAll(".menu-item")
            .forEach(button => {
                button.classList.remove("active");
            });

        const mapping = {
            dashboardHome: dashboardMenuButton,
            editProfileSection: editProfileMenuButton,
            editContactSection: editContactMenuButton,
            personalDetailsSection: personalDetailsMenuButton,
            faceRegistrationSection: faceRegistrationMenuButton,
            attendanceSection: attendanceMenuButton,
            studentsSection: studentsMenuButton,
            checkAttendanceSection: checkAttendanceMenuButton,
            adminSection: adminMenuButton
        };

        if (mapping[sectionId]) {
            mapping[sectionId].classList.add("active");
        }
    }

    /* =====================================================
       MENU EVENTS
    ===================================================== */

    if (dashboardMenuButton)
        dashboardMenuButton.onclick =
            () => showSection("dashboardHome");

    if (editProfileMenuButton)
        editProfileMenuButton.onclick =
            () => showSection("editProfileSection");

    if (editContactMenuButton)
        editContactMenuButton.onclick =
            () => showSection("editContactSection");

    if (personalDetailsMenuButton)
        personalDetailsMenuButton.onclick =
            () => showSection("personalDetailsSection");

    if (faceRegistrationMenuButton)
        faceRegistrationMenuButton.onclick =
            () => showSection("faceRegistrationSection");

    if (attendanceMenuButton)
        attendanceMenuButton.onclick =
            () => showSection("attendanceSection");

    if (studentsMenuButton)
        studentsMenuButton.onclick =
            () => showSection("studentsSection");

    if (checkAttendanceMenuButton)
        checkAttendanceMenuButton.onclick =
            () => showSection("checkAttendanceSection");

    if (adminMenuButton)
        adminMenuButton.onclick =
            () => showSection("adminSection");

    if (quickFaceRegistration)
        quickFaceRegistration.onclick =
            () => showSection("faceRegistrationSection");

    if (quickAttendance)
        quickAttendance.onclick =
            () => showSection("attendanceSection");

    if (quickCheckAttendance)
        quickCheckAttendance.onclick =
            () => showSection("checkAttendanceSection");

    /* =====================================================
       UPDATE DASHBOARD
    ===================================================== */

    function updateDashboard() {

        const user = getCurrentUser();

        if (!user) return;

        if ($("dashboardUserName"))
            $("dashboardUserName").textContent =
                user.name;

        if ($("dashboardUserRoll"))
            $("dashboardUserRoll").textContent =
                user.role === "Admin"
                    ? "Admin"
                    : "Roll: " + user.roll;

        if ($("welcomeName"))
            $("welcomeName").textContent =
                user.name;

        updateDate();

        updateStatistics();
    }

    /* =====================================================
       DATE
    ===================================================== */

    function updateDate() {

        const now = new Date();

        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        };

        if ($("currentDate")) {

            $("currentDate").textContent =
                now.toLocaleDateString(
                    "en-IN",
                    options
                );
        }
    }

    /* =====================================================
       STATISTICS
    ===================================================== */

    function updateStatistics() {

        const users = getUsers();
        const attendance = getAttendance();

        const totalStudents = users.length;

        const today = new Date().toISOString().split("T")[0];

        const presentToday = attendance.filter(record =>
            record.date === today
        ).length;

        const absentToday =
            Math.max(totalStudents - presentToday, 0);

        const percentage =
            totalStudents > 0
                ? Math.round(
                    (presentToday / totalStudents) * 100
                )
                : 0;

        if ($("totalStudents"))
            $("totalStudents").textContent =
                totalStudents;

        if ($("presentStudents"))
            $("presentStudents").textContent =
                presentToday;

        if ($("absentStudents"))
            $("absentStudents").textContent =
                absentToday;

        if ($("attendancePercentage"))
            $("attendancePercentage").textContent =
                percentage + "%";
    }

    /* =====================================================
       EDIT PROFILE
    ===================================================== */

    function fillEditProfile() {

        const user = getCurrentUser();

        if (!user) return;

        if ($("editName"))
            $("editName").value = user.name || "";

        if ($("editRoll"))
            $("editRoll").value = user.roll || "";

        if ($("editDepartment"))
            $("editDepartment").value =
                user.department || "";
    }

    if ($("saveEditedDetailsButton")) {

        $("saveEditedDetailsButton")
            .addEventListener("click", () => {

                const currentUser = getCurrentUser();

                if (!currentUser) return;

                const newName =
                    $("editName")?.value.trim();

                const newRoll =
                    $("editRoll")?.value.trim();

                const newDepartment =
                    $("editDepartment")?.value.trim();

                if (!newName || !newRoll || !newDepartment) {

                    alert("Please fill all profile details.");

                    return;
                }

                if (currentUser.role === "Admin") {

                    currentUser.name = newName;
                    currentUser.roll = newRoll;
                    currentUser.department =
                        newDepartment;

                    setCurrentUser(currentUser);

                } else {

                    const users = getUsers();

                    const index =
                        users.findIndex(
                            u => u.id === currentUser.id
                        );

                    if (index === -1) return;

                    users[index].name = newName;
                    users[index].roll = newRoll;
                    users[index].department =
                        newDepartment;

                    saveUsers(users);

                    setCurrentUser(users[index]);
                }

                updateDashboard();

                alert("Profile updated successfully!");
            });
    }

    /* =====================================================
       EDIT CONTACT
    ===================================================== */

    function fillEditContact() {

        const user = getCurrentUser();

        if (!user) return;

        if ($("editMobile"))
            $("editMobile").value =
                user.mobile || "";

        if ($("editEmail"))
            $("editEmail").value =
                user.email || "";
    }

    if ($("saveContactButton")) {

        $("saveContactButton")
            .addEventListener("click", () => {

                const currentUser = getCurrentUser();

                if (!currentUser) return;

                const mobile =
                    $("editMobile")?.value.trim();

                const email =
                    $("editEmail")?.value.trim();

                if (!/^\d{10}$/.test(mobile)) {

                    showMessage(
                        $("contactMessage"),
                        "Enter a valid 10 digit mobile number.",
                        "error"
                    );

                    return;
                }

                if (currentUser.role === "Admin") {

                    currentUser.mobile = mobile;
                    currentUser.email = email;

                    setCurrentUser(currentUser);

                } else {

                    const users = getUsers();

                    const index =
                        users.findIndex(
                            u => u.id === currentUser.id
                        );

                    if (index === -1) return;

                    users[index].mobile = mobile;
                    users[index].email = email;

                    saveUsers(users);

                    setCurrentUser(users[index]);
                }

                showMessage(
                    $("contactMessage"),
                    "Contact details updated successfully!",
                    "success"
                );
            });
    }

    /* =====================================================
       PERSONAL DETAILS
    ===================================================== */

    function fillPersonalDetails() {

        const user = getCurrentUser();

        if (!user) return;

        if ($("personalName"))
            $("personalName").textContent =
                user.name || "-";

        if ($("personalMobile"))
            $("personalMobile").textContent =
                user.mobile || "-";

        if ($("personalEmail"))
            $("personalEmail").textContent =
                user.email || "-";

        if ($("personalDepartment"))
            $("personalDepartment").textContent =
                user.department || "-";

        if ($("personalRoll"))
            $("personalRoll").textContent =
                user.roll || "-";
    }

    /* =====================================================
       FACE DETAILS
    ===================================================== */

    function fillFaceDetails() {

        const user = getCurrentUser();

        if (!user) return;

        if ($("faceName"))
            $("faceName").value = user.name || "";

        if ($("faceMobile"))
            $("faceMobile").value =
                user.mobile || "";

        if ($("faceEmail"))
            $("faceEmail").value =
                user.email || "";

        if ($("collegeName"))
            $("collegeName").value =
                user.college ||
                "Hooghly Engineering & Technology College";

        if ($("departmentName"))
            $("departmentName").value =
                user.department || "";

        if ($("faceRoll"))
            $("faceRoll").value =
                user.roll || "";
    }

    /* =====================================================
       FACE REGISTRATION CAMERA
    ===================================================== */

    if ($("startFaceRegistrationButton")) {

        $("startFaceRegistrationButton")
            .addEventListener(
                "click",
                startFaceRegistration
            );
    }

    async function startFaceRegistration() {

        const user = getCurrentUser();

        if (!user) return;

        try {

            stopRegistrationCamera();

            registrationStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: {
                            ideal: 500
                        },
                        height: {
                            ideal: 500
                        }
                    },
                    audio: false
                });

            if (registrationCamera) {

                registrationCamera.srcObject =
                    registrationStream;

                registrationCamera.style.transform =
                    "scaleX(-1)";
            }

            if ($("registrationStatus"))
                $("registrationStatus").textContent =
                    "Camera ON — Detecting face...";

            showMessage(
                $("registrationMessage"),
                "Camera started. Look directly at the camera.",
                "info"
            );

            /*
               Automatic capture simulation.

               Real face recognition requires the face-api.js
               model files to be loaded. This version waits
               briefly and captures a frame automatically.
            */

            clearTimeout(registrationTimer);

            registrationTimer = setTimeout(() => {

                captureRegistrationFace();

            }, 3000);

        } catch (error) {

            console.error(error);

            showMessage(
                $("registrationMessage"),
                "Camera permission was denied or camera is unavailable.",
                "error"
            );

            if ($("registrationStatus"))
                $("registrationStatus").textContent =
                    "Camera is OFF";
        }
    }

    function captureRegistrationFace() {

        const user = getCurrentUser();

        if (!user || !registrationCamera) return;

        try {

            const canvas =
                document.createElement("canvas");

            canvas.width =
                registrationCamera.videoWidth ||
                500;

            canvas.height =
                registrationCamera.videoHeight ||
                500;

            const ctx =
                canvas.getContext("2d");

            /*
               Flip image back before storing.
            */

            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);

            ctx.drawImage(
                registrationCamera,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const imageData =
                canvas.toDataURL(
                    "image/jpeg",
                    0.75
                );

            const users = getUsers();

            const index =
                users.findIndex(
                    u => u.id === user.id
                );

            if (index !== -1) {

                users[index].faceRegistered = true;
                users[index].faceData = imageData;

                saveUsers(users);

                setCurrentUser(users[index]);
            }

            if ($("registrationStatus"))
                $("registrationStatus").textContent =
                    "Face Registered ✓";

            showMessage(
                $("registrationMessage"),
                "Face captured and registered successfully!",
                "success"
            );

            stopRegistrationCamera();

        } catch (error) {

            console.error(error);

            showMessage(
                $("registrationMessage"),
                "Could not capture face.",
                "error"
            );
        }
    }

    /* =====================================================
       FACE ATTENDANCE CAMERA
    ===================================================== */

    if ($("startFaceAttendanceButton")) {

        $("startFaceAttendanceButton")
            .addEventListener(
                "click",
                startFaceAttendance
            );
    }

    async function startFaceAttendance() {

        const user = getCurrentUser();

        if (!user) return;

        if (
            user.role !== "Admin" &&
            !user.faceRegistered
        ) {

            showAttendanceResult(
                "Please register your face first.",
                "error"
            );

            return;
        }

        try {

            stopAttendanceCamera();

            attendanceStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: {
                            ideal: 500
                        },
                        height: {
                            ideal: 500
                        }
                    },
                    audio: false
                });

            if (attendanceCamera) {

                attendanceCamera.srcObject =
                    attendanceStream;

                attendanceCamera.style.transform =
                    "scaleX(-1)";
            }

            if ($("attendanceStatus"))
                $("attendanceStatus").textContent =
                    "Camera ON — Detecting face...";

            showAttendanceResult(
                "Look directly at the camera. Attendance will be captured automatically.",
                "info"
            );

            clearTimeout(attendanceTimer);

            attendanceTimer = setTimeout(() => {

                markAttendance(user);

            }, 3000);

        } catch (error) {

            console.error(error);

            showAttendanceResult(
                "Camera permission was denied or camera is unavailable.",
                "error"
            );

            if ($("attendanceStatus"))
                $("attendanceStatus").textContent =
                    "Camera is OFF";
        }
    }

    /* =====================================================
       MARK ATTENDANCE
    ===================================================== */

    function markAttendance(user) {

        const now = new Date();

        const date =
            now.toISOString().split("T")[0];

        const time =
            now.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );

        const day =
            now.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long"
                }
            );

        const attendance =
            getAttendance();

        const alreadyMarked =
            attendance.some(record =>
                record.userId === user.id &&
                record.date === date
            );

        if (alreadyMarked) {

            showAttendancePopup(
                "Already Marked",
                `${user.name}, your attendance has already been marked today.`,
                "ℹ️"
            );

            stopAttendanceCamera();

            return;
        }

        const record = {

            id: "attendance_" + Date.now(),

            userId: user.id ||
                user.name,

            name: user.name,

            mobile: user.mobile || "",

            email: user.email || "",

            branch:
                user.department || "",

            department:
                user.department || "",

            roll:
                user.roll || "",

            date,

            day,

            time,

            status: "Present"
        };

        attendance.push(record);

        saveAttendance(attendance);

        if ($("attendanceStatus"))
            $("attendanceStatus").textContent =
                "Attendance Marked ✓";

        showAttendanceResult(
            `Attendance marked successfully for ${user.name} — ${date} (${day}) at ${time}.`,
            "success"
        );

        showAttendancePopup(
            "Attendance Marked!",
            `${user.name}<br>${date} (${day})<br>${time}<br><br>Your attendance has been successfully saved.`,
            "✅"
        );

        updateStatistics();

        stopAttendanceCamera();
    }

    /* =====================================================
       ATTENDANCE RESULT
    ===================================================== */

    function showAttendanceResult(message, type) {

        const element = $("attendanceResult");

        if (!element) return;

        element.innerHTML = message;

        element.className =
            "attendance-result " + type;
    }

    /* =====================================================
       ATTENDANCE POPUP
    ===================================================== */

    function showAttendancePopup(
        title,
        message,
        icon = "✅"
    ) {

        const popup =
            $("attendancePopup");

        if (!popup) return;

        if ($("popupIcon"))
            $("popupIcon").textContent = icon;

        if ($("popupTitle"))
            $("popupTitle").textContent = title;

        if ($("popupMessage"))
            $("popupMessage").innerHTML = message;

        popup.style.display = "flex";
    }

    if ($("closeAttendancePopup")) {

        $("closeAttendancePopup")
            .addEventListener(
                "click",
                () => {

                    if ($("attendancePopup"))
                        $("attendancePopup").style.display =
                            "none";
                }
            );
    }

    /* =====================================================
       STUDENTS
    ===================================================== */

    function renderStudents() {

        const list = $("studentList");

        if (!list) return;

        const users = getUsers();

        if (users.length === 0) {

            list.innerHTML = `
                <div class="details-card">
                    <h3>No students registered yet.</h3>
                    <p>Students will appear here after creating accounts.</p>
                </div>
            `;

            return;
        }

        list.innerHTML = users
            .map(studentCard)
            .join("");
    }

    function studentCard(user) {

        return `
            <div class="student-card">

                <div class="student-info">

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
                            ? "Registered ✓"
                            : "Not Registered"
                        }
                    </p>

                </div>

            </div>
        `;
    }

    /* =====================================================
       SEARCH STUDENTS
    ===================================================== */

    if ($("searchStudent")) {

        $("searchStudent")
            .addEventListener("input", () => {

                const query =
                    $("searchStudent")
                    .value
                    .toLowerCase()
                    .trim();

                const users = getUsers();

                const filtered =
                    users.filter(user =>
                        user.name.toLowerCase()
                            .includes(query) ||

                        user.roll.toLowerCase()
                            .includes(query) ||

                        user.department.toLowerCase()
                            .includes(query)
                    );

                const list = $("studentList");

                if (!list) return;

                list.innerHTML =
                    filtered.map(studentCard).join("");

                if (filtered.length === 0) {

                    list.innerHTML = `
                        <div class="details-card">
                            <p>No student found.</p>
                        </div>
                    `;
                }
            });
    }

    /* =====================================================
       ADMIN STUDENT LIST
    ===================================================== */

    function renderAdminStudents() {

        const list =
            $("adminStudentList");

        if (!list) return;

        const users = getUsers();
        const attendance = getAttendance();

        if (users.length === 0) {

            list.innerHTML = `
                <div class="details-card">
                    <h3>No students registered.</h3>
                </div>
            `;

            return;
        }

        list.innerHTML = users.map(user => {

            const studentAttendance =
                attendance.filter(
                    record =>
                        record.userId === user.id
                );

            return `
                <div class="student-card">

                    <div class="student-info">

                        <h3>
                            ${escapeHTML(user.name)}
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
                                ? "Registered ✓"
                                : "Not Registered"
                            }
                        </p>

                        <p>
                            <strong>Present Days:</strong>
                            ${studentAttendance.length}
                        </p>

                    </div>

                </div>
            `;

        }).join("");
    }

    /* =====================================================
       CHECK ATTENDANCE
    ===================================================== */

    function renderAttendanceHistory() {

        const user = getCurrentUser();

        if (!user) return;

        const attendance =
            getAttendance();

        let records;

        if (user.role === "Admin") {

            records = attendance;

        } else {

            records =
                attendance.filter(
                    record =>
                        record.userId === user.id
                );
        }

        const totalDays =
            new Set(
                records.map(record => record.date)
            ).size;

        const presentDays =
            records.filter(
                record =>
                    record.status === "Present"
            ).length;

        const absentDays =
            Math.max(
                totalDays - presentDays,
                0
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

        const history =
            $("attendanceHistory");

        if (!history) return;

        if (records.length === 0) {

            history.innerHTML = `
                <div class="details-card">
                    <p>No attendance records yet.</p>
                </div>
            `;

            return;
        }

        history.innerHTML =
            records
                .slice()
                .reverse()
                .map(record => `

                    <div class="attendance-record">

                        <h3>
                            ${escapeHTML(record.name)}
                        </h3>

                        <p>
                            📅
                            ${escapeHTML(record.date)}
                            —
                            ${escapeHTML(record.day)}
                        </p>

                        <p>
                            🕒
                            ${escapeHTML(record.time)}
                        </p>

                        <p>
                            👤
                            ${escapeHTML(record.department || "-")}
                            |
                            Roll:
                            ${escapeHTML(record.roll || "-")}
                        </p>

                        <strong>
                            ✅ ${escapeHTML(record.status)}
                        </strong>

                    </div>

                `)
                .join("");
    }

    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {

            stopAllCameras();

            clearCurrentUser();

            showLogin();

            if ($("loginName"))
                $("loginName").value = "";

            if ($("loginIdentity"))
                $("loginIdentity").value = "";

            if ($("loginPin"))
                $("loginPin").value = "";

            showMessage(
                $("loginMessage"),
                "You have been logged out.",
                "success"
            );
        });
    }

    /* =====================================================
       CAMERA STOP
    ===================================================== */

    function stopRegistrationCamera() {

        if (registrationTimer) {

            clearTimeout(registrationTimer);
            registrationTimer = null;
        }

        if (registrationStream) {

            registrationStream
                .getTracks()
                .forEach(track => track.stop());

            registrationStream = null;
        }

        if (registrationCamera) {

            registrationCamera.srcObject = null;
        }

        if ($("registrationStatus")) {

            $("registrationStatus").textContent =
                "Camera is OFF";
        }
    }

    function stopAttendanceCamera() {

        if (attendanceTimer) {

            clearTimeout(attendanceTimer);
            attendanceTimer = null;
        }

        if (attendanceStream) {

            attendanceStream
                .getTracks()
                .forEach(track => track.stop());

            attendanceStream = null;
        }

        if (attendanceCamera) {

            attendanceCamera.srcObject = null;
        }

        if ($("attendanceStatus")) {

            $("attendanceStatus").textContent =
                "Camera is OFF";
        }
    }

    function stopAllCameras() {

        stopRegistrationCamera();
        stopAttendanceCamera();
    }

    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       KEYBOARD SUPPORT
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                loginPage &&
                loginPage.style.display !== "none"
            ) {

                if (loginButton)
                    loginButton.click();
            }
        }
    );

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    const loggedUser =
        getCurrentUser();

    if (loggedUser) {

        showDashboard();

    } else {

        showLogin();
    }

    console.log(
        "Smart Attendance System loaded successfully."
    );

    console.log(
        "Admin Login: Ayush Chatterjee / PIN 1234"
    );

});

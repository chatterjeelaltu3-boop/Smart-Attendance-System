/* ============================================================
   SMART ATTENDANCE SYSTEM
   script.js
   Complete working version
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Smart Attendance JS Loaded");

    /* ========================================================
       STORAGE
    ======================================================== */

    const USERS_KEY = "smartAttendanceUsers";
    const CURRENT_USER_KEY = "smartAttendanceCurrentUser";
    const ATTENDANCE_KEY = "smartAttendanceRecords";

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

    function saveAttendance(records) {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
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


    /* ========================================================
       ELEMENT HELPER
    ======================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    /* ========================================================
       PAGE ELEMENTS
    ======================================================== */

    const loginPage = $("loginPage");
    const createAccountPage = $("createAccountPage");
    const forgotPinPage = $("forgotPinPage");
    const dashboardPage = $("dashboardPage");


    /* ========================================================
       SHOW / HIDE PAGES
    ======================================================== */

    function hideAllPages() {

        if (loginPage) loginPage.style.display = "none";
        if (createAccountPage) createAccountPage.style.display = "none";
        if (forgotPinPage) forgotPinPage.style.display = "none";
        if (dashboardPage) dashboardPage.style.display = "none";
    }


    function showLoginPage() {

        hideAllPages();

        if (loginPage) {
            loginPage.style.display = "flex";
        }

        stopAllCameras();
    }


    function showCreatePage() {

        hideAllPages();

        if (createAccountPage) {
            createAccountPage.style.display = "flex";
        }

        stopAllCameras();
    }


    function showForgotPage() {

        hideAllPages();

        if (forgotPinPage) {
            forgotPinPage.style.display = "flex";
        }

        stopAllCameras();
    }


    function showDashboard() {

        hideAllPages();

        if (dashboardPage) {
            dashboardPage.style.display = "flex";
        }

        updateDashboard();
        showSection("dashboardHome");
    }


    /* ========================================================
       MESSAGE
    ======================================================== */

    function showMessage(elementId, message, type = "info") {

        const element = $(elementId);

        if (!element) return;

        element.textContent = message;
        element.className = "auth-message " + type;
    }


    /* ========================================================
       CREATE ACCOUNT
    ======================================================== */

    const createAccountButton = $("createAccountButton");

    if (createAccountButton) {

        createAccountButton.addEventListener("click", () => {

            console.log("Create Account button clicked");

            showCreatePage();

        });
    }


    /* ========================================================
       BACK TO LOGIN FROM CREATE
    ======================================================== */

    const backToLoginButton = $("backToLoginButton");

    if (backToLoginButton) {

        backToLoginButton.addEventListener("click", () => {

            showLoginPage();

        });
    }


    /* ========================================================
       CREATE ACCOUNT SUBMIT
    ======================================================== */

    const createAccountSubmit = $("createAccountSubmit");

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


            /* REQUIRED CHECK */

            if (!name || !mobile || !pin || !confirmPin ||
                !college || !department || !roll) {

                showMessage(
                    "createMessage",
                    "⚠️ Please fill all required fields.",
                    "error"
                );

                return;
            }


            /* MOBILE CHECK */

            if (!/^[0-9]{10}$/.test(mobile)) {

                showMessage(
                    "createMessage",
                    "⚠️ Enter a valid 10 digit mobile number.",
                    "error"
                );

                return;
            }


            /* PIN CHECK */

            if (!/^[0-9]{4}$/.test(pin)) {

                showMessage(
                    "createMessage",
                    "⚠️ PIN must contain exactly 4 digits.",
                    "error"
                );

                return;
            }


            /* CONFIRM PIN */

            if (pin !== confirmPin) {

                showMessage(
                    "createMessage",
                    "❌ PIN and Confirm PIN do not match.",
                    "error"
                );

                return;
            }


            let users = getUsers();


            /* DUPLICATE MOBILE */

            const mobileExists = users.some(
                user => user.mobile === mobile
            );

            if (mobileExists) {

                showMessage(
                    "createMessage",
                    "⚠️ This mobile number is already registered.",
                    "error"
                );

                return;
            }


            /* DUPLICATE EMAIL */

            if (email) {

                const emailExists = users.some(
                    user =>
                        user.email &&
                        user.email.toLowerCase() === email.toLowerCase()
                );

                if (emailExists) {

                    showMessage(
                        "createMessage",
                        "⚠️ This email is already registered.",
                        "error"
                    );

                    return;
                }
            }


            /* CREATE USER */

            const newUser = {

                id: Date.now(),

                name: name,

                mobile: mobile,

                email: email,

                pin: pin,

                college: college,

                department: department,

                roll: roll,

                role: "Student",

                faceRegistered: false,

                createdAt: new Date().toISOString()
            };


            users.push(newUser);

            saveUsers(users);


            showMessage(
                "createMessage",
                "✅ Account created successfully! Returning to Login...",
                "success"
            );


            /* CLEAR FORM */

            setTimeout(() => {

                if ($("createName")) $("createName").value = "";
                if ($("createMobile")) $("createMobile").value = "";
                if ($("createEmail")) $("createEmail").value = "";
                if ($("createPin")) $("createPin").value = "";
                if ($("confirmPin")) $("confirmPin").value = "";
                if ($("createDepartment")) $("createDepartment").value = "";
                if ($("createRoll")) $("createRoll").value = "";

                showLoginPage();

                if ($("loginName")) {
                    $("loginName").value = name;
                }

                if ($("loginIdentity")) {
                    $("loginIdentity").value = mobile;
                }

                showMessage(
                    "loginMessage",
                    "✅ Account created. Please enter your PIN to login.",
                    "success"
                );

            }, 1200);

        });
    }


    /* ========================================================
       FORGOT PIN BUTTON
    ======================================================== */

    const forgotPinButton = $("forgotPinButton");

    if (forgotPinButton) {

        forgotPinButton.addEventListener("click", () => {

            console.log("Forgot PIN clicked");

            showForgotPage();

        });
    }


    /* ========================================================
       BACK FROM FORGOT PIN
    ======================================================== */

    const forgotBackButton = $("forgotBackButton");

    if (forgotBackButton) {

        forgotBackButton.addEventListener("click", () => {

            showLoginPage();

        });
    }


    /* ========================================================
       RESET PIN
    ======================================================== */

    const resetPinButton = $("resetPinButton");

    if (resetPinButton) {

        resetPinButton.addEventListener("click", () => {

            const name = $("forgotName")?.value.trim();
            const identity = $("forgotIdentity")?.value.trim();
            const newPin = $("newPin")?.value.trim();
            const confirmNewPin = $("confirmNewPin")?.value.trim();


            if (!name || !identity || !newPin || !confirmNewPin) {

                showMessage(
                    "forgotMessage",
                    "⚠️ Please fill all fields.",
                    "error"
                );

                return;
            }


            if (!/^[0-9]{4}$/.test(newPin)) {

                showMessage(
                    "forgotMessage",
                    "⚠️ New PIN must contain exactly 4 digits.",
                    "error"
                );

                return;
            }


            if (newPin !== confirmNewPin) {

                showMessage(
                    "forgotMessage",
                    "❌ PINs do not match.",
                    "error"
                );

                return;
            }


            let users = getUsers();


            const index = users.findIndex(user => {

                const nameMatch =
                    user.name.toLowerCase() === name.toLowerCase();

                const mobileMatch =
                    user.mobile === identity;

                const emailMatch =
                    user.email &&
                    user.email.toLowerCase() === identity.toLowerCase();

                return nameMatch && (mobileMatch || emailMatch);

            });


            if (index === -1) {

                showMessage(
                    "forgotMessage",
                    "❌ No matching account found.",
                    "error"
                );

                return;
            }


            users[index].pin = newPin;

            saveUsers(users);


            showMessage(
                "forgotMessage",
                "✅ PIN reset successfully! Returning to Login...",
                "success"
            );


            setTimeout(() => {

                showLoginPage();

                if ($("loginName")) {
                    $("loginName").value = users[index].name;
                }

                if ($("loginIdentity")) {
                    $("loginIdentity").value = identity;
                }

                showMessage(
                    "loginMessage",
                    "✅ PIN updated. Please login with your new PIN.",
                    "success"
                );

            }, 1200);

        });
    }


    /* ========================================================
       LOGIN
    ======================================================== */

    const loginButton = $("loginButton");

    if (loginButton) {

        loginButton.addEventListener("click", () => {

            console.log("Login button clicked");


            const name = $("loginName")?.value.trim();
            const identity = $("loginIdentity")?.value.trim();
            const pin = $("loginPin")?.value.trim();


            if (!name || !identity || !pin) {

                showMessage(
                    "loginMessage",
                    "⚠️ Please enter Name, Mobile/Email and PIN.",
                    "error"
                );

                return;
            }


            if (!/^[0-9]{4}$/.test(pin)) {

                showMessage(
                    "loginMessage",
                    "⚠️ PIN must be exactly 4 digits.",
                    "error"
                );

                return;
            }


            /* =================================================
               ADMIN LOGIN
            ================================================= */

            const adminName = "Ayush Chatterjee";

            const isAdmin =
                name.toLowerCase() === adminName.toLowerCase();


            if (isAdmin) {

                const adminMobile =
                    identity.replace(/\s/g, "");

                /*
                   Admin PIN:
                   1234

                   You can change it later.
                */

                if (pin === "1234") {

                    const admin = {

                        id: "admin",

                        name: "Ayush Chatterjee",

                        mobile: adminMobile,

                        email: "",

                        pin: "1234",

                        college:
                            "Hooghly Engineering & Technology College",

                        department: "",

                        roll: "",

                        role: "Admin"

                    };


                    setCurrentUser(admin);

                    showMessage(
                        "loginMessage",
                        "✅ Admin login successful!",
                        "success"
                    );


                    setTimeout(() => {

                        showDashboard();

                    }, 500);


                    return;

                } else {

                    showMessage(
                        "loginMessage",
                        "❌ Incorrect Admin PIN. Default Admin PIN is 1234.",
                        "error"
                    );

                    return;
                }
            }


            /* =================================================
               STUDENT LOGIN
            ================================================= */

            const users = getUsers();


            const user = users.find(student => {

                const nameMatch =
                    student.name.toLowerCase() === name.toLowerCase();

                const mobileMatch =
                    student.mobile === identity;

                const emailMatch =
                    student.email &&
                    student.email.toLowerCase() === identity.toLowerCase();

                return (
                    nameMatch &&
                    (mobileMatch || emailMatch) &&
                    student.pin === pin
                );

            });


            if (!user) {

                showMessage(
                    "loginMessage",
                    "❌ Invalid name, mobile/email or PIN.",
                    "error"
                );

                return;
            }


            setCurrentUser(user);


            showMessage(
                "loginMessage",
                "✅ Login successful!",
                "success"
            );


            setTimeout(() => {

                showDashboard();

            }, 500);

        });
    }


    /* ========================================================
       DASHBOARD SECTIONS
    ======================================================== */

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


    function showSection(sectionId) {

        sections.forEach(id => {

            const section = $(id);

            if (section) {
                section.style.display =
                    id === sectionId ? "block" : "none";
            }

        });


        document.querySelectorAll(".menu-item")
            .forEach(button => {

                button.classList.remove("active");

            });


        const menuMap = {

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


        const buttonId = menuMap[sectionId];

        if (buttonId && $(buttonId)) {

            $(buttonId).classList.add("active");

        }

    }


    /* ========================================================
       MENU BUTTONS
    ======================================================== */

    function menuClick(buttonId, sectionId) {

        const button = $(buttonId);

        if (!button) return;

        button.addEventListener("click", () => {

            showSection(sectionId);

            stopAllCameras();

            if (sectionId === "studentsSection") {

                renderStudents();

            }

            if (sectionId === "checkAttendanceSection") {

                renderAttendanceHistory();

            }

            if (sectionId === "adminSection") {

                renderAdminStudents();

            }

        });

    }


    menuClick("dashboardMenuButton", "dashboardHome");

    menuClick("editProfileMenuButton", "editProfileSection");

    menuClick("editContactMenuButton", "editContactSection");

    menuClick("personalDetailsMenuButton", "personalDetailsSection");

    menuClick("faceRegistrationMenuButton", "faceRegistrationSection");

    menuClick("attendanceMenuButton", "attendanceSection");

    menuClick("studentsMenuButton", "studentsSection");

    menuClick("checkAttendanceMenuButton", "checkAttendanceSection");

    menuClick("adminMenuButton", "adminSection");


    /* ========================================================
       QUICK ACTIONS
    ======================================================== */

    if ($("quickFaceRegistration")) {

        $("quickFaceRegistration").addEventListener("click", () => {

            showSection("faceRegistrationSection");

        });

    }


    if ($("quickAttendance")) {

        $("quickAttendance").addEventListener("click", () => {

            showSection("attendanceSection");

        });

    }


    if ($("quickCheckAttendance")) {

        $("quickCheckAttendance").addEventListener("click", () => {

            showSection("checkAttendanceSection");

            renderAttendanceHistory();

        });

    }


    /* ========================================================
       UPDATE DASHBOARD
    ======================================================== */

    function updateDashboard() {

        const user = getCurrentUser();

        if (!user) return;


        if ($("dashboardUserName")) {

            $("dashboardUserName").textContent =
                user.name;

        }


        if ($("dashboardUserRoll")) {

            $("dashboardUserRoll").textContent =
                user.role === "Admin"
                    ? "Admin"
                    : "Roll: " + user.roll;

        }


        if ($("welcomeName")) {

            $("welcomeName").textContent =
                user.name;

        }


        /* DATE */

        updateDate();


        /* EDIT PROFILE */

        if ($("editName")) {

            $("editName").value =
                user.name || "";

        }


        if ($("editRoll")) {

            $("editRoll").value =
                user.roll || "";

        }


        if ($("editDepartment")) {

            $("editDepartment").value =
                user.department || "";

        }


        /* CONTACT */

        if ($("editMobile")) {

            $("editMobile").value =
                user.mobile || "";

        }


        if ($("editEmail")) {

            $("editEmail").value =
                user.email || "";

        }


        /* PERSONAL DETAILS */

        if ($("personalName")) {

            $("personalName").textContent =
                user.name || "-";

        }


        if ($("personalMobile")) {

            $("personalMobile").textContent =
                user.mobile || "-";

        }


        if ($("personalEmail")) {

            $("personalEmail").textContent =
                user.email || "-";

        }


        if ($("personalDepartment")) {

            $("personalDepartment").textContent =
                user.department || "-";

        }


        if ($("personalRoll")) {

            $("personalRoll").textContent =
                user.roll || "-";

        }


        /* FACE DETAILS */

        if ($("faceName")) {

            $("faceName").value =
                user.name || "";

        }


        if ($("faceMobile")) {

            $("faceMobile").value =
                user.mobile || "";

        }


        if ($("faceEmail")) {

            $("faceEmail").value =
                user.email || "";

        }


        if ($("departmentName")) {

            $("departmentName").value =
                user.department || "";

        }


        if ($("faceRoll")) {

            $("faceRoll").value =
                user.roll || "";

        }


        updateStats();

    }


    /* ========================================================
       DATE
    ======================================================== */

    function updateDate() {

        if (!$("currentDate")) return;


        const now = new Date();


        const date = now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


        const time = now.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


        $("currentDate").textContent =
            date + " • " + time;

    }


    setInterval(updateDate, 1000);


    /* ========================================================
       SAVE PROFILE
    ======================================================== */

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

                    alert(
                        "Please fill Name, Roll and Department."
                    );

                    return;
                }


                if (currentUser.role === "Admin") {

                    currentUser.name = newName;
                    currentUser.roll = newRoll;
                    currentUser.department = newDepartment;

                    setCurrentUser(currentUser);

                } else {

                    let users = getUsers();

                    const index =
                        users.findIndex(
                            user =>
                                user.id === currentUser.id
                        );


                    if (index !== -1) {

                        users[index].name = newName;

                        users[index].roll = newRoll;

                        users[index].department =
                            newDepartment;

                        saveUsers(users);

                        setCurrentUser(users[index]);

                    }

                }


                updateDashboard();


                alert(
                    "✅ Profile updated successfully!"
                );

            });

    }


    /* ========================================================
       SAVE CONTACT
    ======================================================== */

    if ($("saveContactButton")) {

        $("saveContactButton")
            .addEventListener("click", () => {

                const currentUser = getCurrentUser();

                if (!currentUser) return;


                const mobile =
                    $("editMobile")?.value.trim();

                const email =
                    $("editEmail")?.value.trim();


                if (!/^[0-9]{10}$/.test(mobile)) {

                    showMessage(
                        "contactMessage",
                        "⚠️ Enter a valid 10 digit mobile number.",
                        "error"
                    );

                    return;
                }


                if (currentUser.role === "Admin") {

                    currentUser.mobile = mobile;

                    currentUser.email = email;

                    setCurrentUser(currentUser);

                } else {

                    let users = getUsers();

                    const index =
                        users.findIndex(
                            user =>
                                user.id === currentUser.id
                        );


                    if (index !== -1) {

                        users[index].mobile = mobile;

                        users[index].email = email;

                        saveUsers(users);

                        setCurrentUser(users[index]);

                    }

                }


                updateDashboard();


                showMessage(
                    "contactMessage",
                    "✅ Contact details saved successfully.",
                    "success"
                );

            });

    }


    /* ========================================================
       FACE REGISTRATION
    ======================================================== */

    let registrationStream = null;

    let registrationTimer = null;


    async function startRegistrationCamera() {

        const video = $("registrationCamera");

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


            if ($("registrationStatus")) {

                $("registrationStatus").textContent =
                    "Camera is ON";

            }


            if ($("registrationStatus")) {

                $("registrationStatus").style.background =
                    "#e9fff8";

                $("registrationStatus").style.color =
                    "#008f72";

            }


            showMessage(
                "registrationMessage",
                "📷 Camera started. Keep your face inside the guide.",
                "info"
            );


            /*
               Automatic capture simulation.

               The actual face-api recognition can be added
               after loading models.
            */

            registrationTimer =
                setTimeout(() => {

                    captureRegistration();

                }, 5000);


        } catch (error) {

            console.error(error);


            showMessage(
                "registrationMessage",
                "❌ Camera permission denied or camera unavailable.",
                "error"
            );

        }

    }


    function captureRegistration() {

        const user =
            getCurrentUser();

        if (!user) return;


        let users =
            getUsers();


        if (user.role !== "Admin") {

            const index =
                users.findIndex(
                    u => u.id === user.id
                );


            if (index !== -1) {

                users[index].faceRegistered =
                    true;

                users[index].faceRegisteredAt =
                    new Date().toISOString();


                saveUsers(users);

                setCurrentUser(users[index]);

            }

        }


        showMessage(
            "registrationMessage",
            "✅ Face captured and registered successfully!",
            "success"
        );


        if ($("registrationStatus")) {

            $("registrationStatus").textContent =
                "Face Registered ✓";

        }

    }


    if ($("startFaceRegistrationButton")) {

        $("startFaceRegistrationButton")
            .addEventListener(
                "click",
                startRegistrationCamera
            );

    }


    /* ========================================================
       FACE ATTENDANCE
    ======================================================== */

    let attendanceStream = null;

    let attendanceTimer = null;


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


            if ($("attendanceStatus")) {

                $("attendanceStatus").textContent =
                    "Camera is ON";

            }


            if ($("attendanceResult")) {

                $("attendanceResult").textContent =
                    "📷 Detecting face... Please look at the camera.";

            }


            attendanceTimer =
                setTimeout(() => {

                    markAttendance();

                }, 5000);


        } catch (error) {

            console.error(error);


            if ($("attendanceResult")) {

                $("attendanceResult").textContent =
                    "❌ Camera permission denied or camera unavailable.";

            }

        }

    }


    function markAttendance() {

        const user =
            getCurrentUser();

        if (!user) return;


        const now =
            new Date();


        const date =
            now.toLocaleDateString(
                "en-IN"
            );


        const day =
            now.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long"
                }
            );


        const time =
            now.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );


        let records =
            getAttendance();


        /*
           Prevent duplicate attendance
           for same user on same date.
        */

        const alreadyMarked =
            records.some(record =>
                record.userId === user.id &&
                record.date === date
            );


        if (alreadyMarked) {

            if ($("attendanceResult")) {

                $("attendanceResult").textContent =
                    "ℹ️ Attendance already marked today.";

            }

            return;
        }


        const record = {

            id: Date.now(),

            userId: user.id,

            name: user.name,

            mobile: user.mobile || "",

            email: user.email || "",

            branch: user.department || "",

            department: user.department || "",

            roll: user.roll || "",

            date: date,

            day: day,

            time: time,

            status: "Present"

        };


        records.push(record);

        saveAttendance(records);


        if ($("attendanceResult")) {

            $("attendanceResult").textContent =
                `✅ ${user.name} — Attendance marked successfully on ${day}, ${date} at ${time}.`;

        }


        showAttendancePopup(
            user,
            date,
            day,
            time
        );


        updateStats();

    }


    if ($("startFaceAttendanceButton")) {

        $("startFaceAttendanceButton")
            .addEventListener(
                "click",
                startAttendanceCamera
            );

    }


    /* ========================================================
       ATTENDANCE POPUP
    ======================================================== */

    function showAttendancePopup(
        user,
        date,
        day,
        time
    ) {

        const popup =
            $("attendancePopup");

        if (!popup) return;


        if ($("popupIcon")) {

            $("popupIcon").textContent =
                "✅";

        }


        if ($("popupTitle")) {

            $("popupTitle").textContent =
                "Attendance Marked!";

        }


        if ($("popupMessage")) {

            $("popupMessage").textContent =
                `${user.name}'s attendance has been successfully saved.\n\n${day}, ${date}\nTime: ${time}`;

        }


        popup.style.display =
            "flex";

    }


    if ($("closeAttendancePopup")) {

        $("closeAttendancePopup")
            .addEventListener("click", () => {

                if ($("attendancePopup")) {

                    $("attendancePopup").style.display =
                        "none";

                }

            });

    }


    /* ========================================================
       STUDENT LIST
    ======================================================== */

    function renderStudents() {

        const container =
            $("studentList");

        if (!container) return;


        const users =
            getUsers();


        if (users.length === 0) {

            container.innerHTML =
                `<div class="student-item">
                    <h3>No students registered yet.</h3>
                    <p>Students will appear here after creating an account.</p>
                </div>`;

            return;
        }


        container.innerHTML =
            users.map(user => {

                return `
                    <div class="student-item">

                        <h3>👤 ${escapeHTML(user.name)}</h3>

                        <p>
                            📱 <strong>Mobile:</strong>
                            ${escapeHTML(user.mobile || "-")}
                        </p>

                        <p>
                            📧 <strong>Email:</strong>
                            ${escapeHTML(user.email || "-")}
                        </p>

                        <p>
                            🏫 <strong>College:</strong>
                            ${escapeHTML(user.college || "-")}
                        </p>

                        <p>
                            🎓 <strong>Branch:</strong>
                            ${escapeHTML(user.department || "-")}
                        </p>

                        <p>
                            🆔 <strong>Roll:</strong>
                            ${escapeHTML(user.roll || "-")}
                        </p>

                        <p>
                            👤 <strong>Face:</strong>
                            ${user.faceRegistered
                                ? "✅ Registered"
                                : "❌ Not Registered"}
                        </p>

                    </div>
                `;

            }).join("");

    }


    /* ========================================================
       ADMIN STUDENT LIST
    ======================================================== */

    function renderAdminStudents() {

        const container =
            $("adminStudentList");

        if (!container) return;


        const users =
            getUsers();


        if (users.length === 0) {

            container.innerHTML =
                `<div class="student-item">
                    <h3>No students registered.</h3>
                </div>`;

            return;
        }


        container.innerHTML =
            users.map(user => {

                return `
                    <div class="student-item">

                        <h3>
                            👤 ${escapeHTML(user.name)}
                        </h3>

                        <p>
                            📱 Mobile:
                            ${escapeHTML(user.mobile || "-")}
                        </p>

                        <p>
                            📧 Email:
                            ${escapeHTML(user.email || "-")}
                        </p>

                        <p>
                            🎓 Branch:
                            ${escapeHTML(user.department || "-")}
                        </p>

                        <p>
                            🆔 Roll:
                            ${escapeHTML(user.roll || "-")}
                        </p>

                        <p>
                            🏫 College:
                            ${escapeHTML(user.college || "-")}
                        </p>

                        <p>
                            👤 Face:
                            ${user.faceRegistered
                                ? "✅ Registered"
                                : "❌ Not Registered"}
                        </p>

                    </div>
                `;

            }).join("");

    }


    /* ========================================================
       SEARCH STUDENTS
    ======================================================== */

    if ($("searchStudent")) {

        $("searchStudent")
            .addEventListener("input", function () {

                const search =
                    this.value.toLowerCase();


                const users =
                    getUsers();


                const filtered =
                    users.filter(user => {

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

                    });


                const container =
                    $("studentList");

                if (!container) return;


                container.innerHTML =
                    filtered.map(user => {

                        return `
                            <div class="student-item">

                                <h3>
                                    👤 ${escapeHTML(user.name)}
                                </h3>

                                <p>
                                    📱 Mobile:
                                    ${escapeHTML(user.mobile || "-")}
                                </p>

                                <p>
                                    📧 Email:
                                    ${escapeHTML(user.email || "-")}
                                </p>

                                <p>
                                    🎓 Branch:
                                    ${escapeHTML(user.department || "-")}
                                </p>

                                <p>
                                    🆔 Roll:
                                    ${escapeHTML(user.roll || "-")}
                                </p>

                            </div>
                        `;

                    }).join("");

            });

    }


    /* ========================================================
       ATTENDANCE HISTORY
    ======================================================== */

    function renderAttendanceHistory() {

        const container =
            $("attendanceHistory");

        if (!container) return;


        const user =
            getCurrentUser();

        if (!user) return;


        const records =
            getAttendance();


        const myRecords =
            records.filter(
                record =>
                    record.userId === user.id
            );


        const total =
            myRecords.length;


        const present =
            myRecords.filter(
                record =>
                    record.status === "Present"
            ).length;


        const absent =
            Math.max(0, total - present);


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


        if (myRecords.length === 0) {

            container.innerHTML =
                `<div class="attendance-history-item">
                    <span>No attendance records yet.</span>
                </div>`;

            return;
        }


        container.innerHTML =
            myRecords
                .slice()
                .reverse()
                .map(record => {

                    return `
                        <div class="attendance-history-item">

                            <div>

                                <strong>
                                    ${escapeHTML(record.day)}
                                </strong>

                                <br>

                                <span>
                                    ${escapeHTML(record.date)}
                                </span>

                            </div>

                            <div>

                                <b>
                                    ${escapeHTML(record.status)}
                                </b>

                                <br>

                                <span>
                                    ${escapeHTML(record.time)}
                                </span>

                            </div>

                        </div>
                    `;

                }).join("");

    }


    /* ========================================================
       DASHBOARD STATISTICS
    ======================================================== */

    function updateStats() {

        const users =
            getUsers();


        const records =
            getAttendance();


        const today =
            new Date()
                .toLocaleDateString("en-IN");


        const presentToday =
            records.filter(
                record =>
                    record.date === today
            );


        const totalStudents =
            users.length;


        const present =
            presentToday.length;


        const absent =
            Math.max(
                0,
                totalStudents - present
            );


        const percentage =
            totalStudents > 0
                ? Math.round(
                    (present / totalStudents) * 100
                )
                : 0;


        if ($("totalStudents")) {

            $("totalStudents")
                .textContent =
                totalStudents;

        }


        if ($("presentStudents")) {

            $("presentStudents")
                .textContent =
                present;

        }


        if ($("absentStudents")) {

            $("absentStudents")
                .textContent =
                absent;

        }


        if ($("attendancePercentage")) {

            $("attendancePercentage")
                .textContent =
                percentage + "%";

        }

    }


    /* ========================================================
       LOGOUT
    ======================================================== */

    if ($("logoutButton")) {

        $("logoutButton")
            .addEventListener("click", () => {

                stopAllCameras();

                clearCurrentUser();

                showLoginPage();


                if ($("loginName")) {

                    $("loginName").value = "";

                }

                if ($("loginIdentity")) {

                    $("loginIdentity").value = "";

                }

                if ($("loginPin")) {

                    $("loginPin").value = "";

                }


                showMessage(
                    "loginMessage",
                    "👋 You have been logged out.",
                    "info"
                );

            });

    }


    /* ========================================================
       CAMERA STOP
    ======================================================== */

    function stopAllCameras() {

        if (registrationTimer) {

            clearTimeout(
                registrationTimer
            );

            registrationTimer = null;

        }


        if (attendanceTimer) {

            clearTimeout(
                attendanceTimer
            );

            attendanceTimer = null;

        }


        if (registrationStream) {

            registrationStream
                .getTracks()
                .forEach(track =>
                    track.stop()
                );

            registrationStream = null;

        }


        if (attendanceStream) {

            attendanceStream
                .getTracks()
                .forEach(track =>
                    track.stop()
                );

            attendanceStream = null;

        }


        const regVideo =
            $("registrationCamera");

        if (regVideo) {

            regVideo.srcObject =
                null;

        }


        const attendanceVideo =
            $("attendanceCamera");

        if (attendanceVideo) {

            attendanceVideo.srcObject =
                null;

        }


        if ($("registrationStatus")) {

            $("registrationStatus").textContent =
                "Camera is OFF";

        }


        if ($("attendanceStatus")) {

            $("attendanceStatus").textContent =
                "Camera is OFF";

        }

    }


    /* ========================================================
       ESCAPE HTML
    ======================================================== */

    function escapeHTML(value) {

        if (value === null ||
            value === undefined) {

            return "";

        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    const existingUser =
        getCurrentUser();


    if (existingUser) {

        showDashboard();

    } else {

        showLoginPage();

    }


    console.log(
        "✅ Smart Attendance System Ready"
    );

});

```javascript
/* =========================================================
   SMART ATTENDANCE SYSTEM
   Complete script.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       STORAGE
    ===================================================== */

    const USERS_KEY = "smartAttendanceUsers";
    const ATTENDANCE_KEY = "smartAttendanceRecords";
    const CURRENT_USER_KEY = "smartAttendanceCurrentUser";


    function getUsers() {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function getAttendance() {
        return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
    }

    function saveAttendance(records) {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    }

    function getCurrentUser() {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    }

    function saveCurrentUser(user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }

    function clearCurrentUser() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }


    /* =====================================================
       PAGE ELEMENTS
    ===================================================== */

    const loginPage = document.getElementById("loginPage");
    const createAccountPage = document.getElementById("createAccountPage");
    const forgotPinPage = document.getElementById("forgotPinPage");
    const dashboardPage = document.getElementById("dashboardPage");


    /* =====================================================
       SHOW / HIDE PAGES
    ===================================================== */

    function showPage(page) {

        loginPage.style.display = "none";
        createAccountPage.style.display = "none";
        forgotPinPage.style.display = "none";
        dashboardPage.style.display = "none";

        page.style.display = page === dashboardPage ? "flex" : "flex";
    }


    /* =====================================================
       LOGIN PAGE BUTTONS
    ===================================================== */

    const createAccountButton =
        document.getElementById("createAccountButton");

    const forgotPinButton =
        document.getElementById("forgotPinButton");

    const backToLoginButton =
        document.getElementById("backToLoginButton");

    const forgotBackButton =
        document.getElementById("forgotBackButton");


    if (createAccountButton) {
        createAccountButton.addEventListener("click", () => {

            clearMessage("loginMessage");

            showPage(createAccountPage);

        });
    }


    if (forgotPinButton) {
        forgotPinButton.addEventListener("click", () => {

            clearMessage("loginMessage");

            showPage(forgotPinPage);

        });
    }


    if (backToLoginButton) {
        backToLoginButton.addEventListener("click", () => {

            clearMessage("createMessage");

            showPage(loginPage);

        });
    }


    if (forgotBackButton) {
        forgotBackButton.addEventListener("click", () => {

            clearMessage("forgotMessage");

            showPage(loginPage);

        });
    }


    /* =====================================================
       MESSAGE FUNCTION
    ===================================================== */

    function showMessage(id, message, type = "success") {

        const element = document.getElementById(id);

        if (!element) return;

        element.textContent = message;

        element.className = "auth-message " + type;
    }


    function clearMessage(id) {

        const element = document.getElementById(id);

        if (!element) return;

        element.textContent = "";
        element.className = "auth-message";
    }


    /* =====================================================
       CREATE ACCOUNT
    ===================================================== */

    const createAccountSubmit =
        document.getElementById("createAccountSubmit");


    if (createAccountSubmit) {

        createAccountSubmit.addEventListener("click", () => {

            const name =
                document.getElementById("createName").value.trim();

            const mobile =
                document.getElementById("createMobile").value.trim();

            const email =
                document.getElementById("createEmail").value.trim();

            const pin =
                document.getElementById("createPin").value.trim();

            const confirmPin =
                document.getElementById("confirmPin").value.trim();

            const college =
                document.getElementById("createCollege").value.trim();

            const department =
                document.getElementById("createDepartment").value.trim();

            const roll =
                document.getElementById("createRoll").value.trim();


            /* Validation */

            if (!name) {
                showMessage(
                    "createMessage",
                    "Please enter your full name.",
                    "error"
                );
                return;
            }


            if (!/^[0-9]{10}$/.test(mobile)) {

                showMessage(
                    "createMessage",
                    "Please enter a valid 10 digit mobile number.",
                    "error"
                );

                return;
            }


            if (pin.length !== 4 || !/^[0-9]+$/.test(pin)) {

                showMessage(
                    "createMessage",
                    "PIN must contain exactly 4 digits.",
                    "error"
                );

                return;
            }


            if (pin !== confirmPin) {

                showMessage(
                    "createMessage",
                    "PIN and Confirm PIN do not match.",
                    "error"
                );

                return;
            }


            if (!department) {

                showMessage(
                    "createMessage",
                    "Please enter Branch / Department.",
                    "error"
                );

                return;
            }


            if (!roll) {

                showMessage(
                    "createMessage",
                    "Please enter Roll Number.",
                    "error"
                );

                return;
            }


            let users = getUsers();


            /* Check duplicate mobile */

            const mobileExists =
                users.some(user => user.mobile === mobile);

            if (mobileExists) {

                showMessage(
                    "createMessage",
                    "This mobile number is already registered.",
                    "error"
                );

                return;
            }


            /* Check duplicate email */

            if (email) {

                const emailExists =
                    users.some(
                        user =>
                            user.email &&
                            user.email.toLowerCase() === email.toLowerCase()
                    );

                if (emailExists) {

                    showMessage(
                        "createMessage",
                        "This email is already registered.",
                        "error"
                    );

                    return;
                }
            }


            /* Create user */

            const newUser = {

                id: Date.now(),

                name: name,

                mobile: mobile,

                email: email,

                pin: pin,

                college: college,

                department: department,

                roll: roll,

                role: "student",

                faceRegistered: false,

                createdAt: new Date().toISOString()

            };


            users.push(newUser);

            saveUsers(users);


            showMessage(
                "createMessage",
                "🎉 Account created successfully! Please login.",
                "success"
            );


            /* Clear form */

            document.getElementById("createName").value = "";
            document.getElementById("createMobile").value = "";
            document.getElementById("createEmail").value = "";
            document.getElementById("createPin").value = "";
            document.getElementById("confirmPin").value = "";
            document.getElementById("createDepartment").value = "";
            document.getElementById("createRoll").value = "";


            setTimeout(() => {

                showPage(loginPage);

            }, 1200);

        });
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    const loginButton =
        document.getElementById("loginButton");


    if (loginButton) {

        loginButton.addEventListener("click", () => {

            const name =
                document.getElementById("loginName").value.trim();

            const identity =
                document.getElementById("loginIdentity").value.trim();

            const pin =
                document.getElementById("loginPin").value.trim();


            if (!name || !identity || !pin) {

                showMessage(
                    "loginMessage",
                    "Please fill all login fields.",
                    "error"
                );

                return;
            }


            /* =================================================
               ADMIN LOGIN
            ================================================= */

            if (
                name.toLowerCase() === "ayush chatterjee" &&
                identity &&
                pin === "1234"
            ) {

                const adminUser = {

                    id: "admin",

                    name: "Ayush Chatterjee",

                    mobile: identity,

                    email: "",

                    pin: "1234",

                    college:
                        "Hooghly Engineering & Technology College",

                    department: "Administration",

                    roll: "ADMIN",

                    role: "admin",

                    faceRegistered: false

                };


                saveCurrentUser(adminUser);

                openDashboard(adminUser);

                return;
            }


            /* =================================================
               STUDENT LOGIN
            ================================================= */

            const users = getUsers();


            const user = users.find(item => {

                const sameName =
                    item.name.toLowerCase() === name.toLowerCase();

                const sameMobile =
                    item.mobile === identity;

                const sameEmail =
                    item.email &&
                    item.email.toLowerCase() === identity.toLowerCase();

                const samePin =
                    item.pin === pin;

                return (
                    sameName &&
                    (sameMobile || sameEmail) &&
                    samePin
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


            saveCurrentUser(user);

            openDashboard(user);

        });
    }


    /* =====================================================
       OPEN DASHBOARD
    ===================================================== */

    function openDashboard(user) {

        showPage(dashboardPage);

        updateDashboardUser(user);

        updateDateTime();

        loadDashboardStats();

        loadPersonalDetails();

        loadEditProfile();

        loadEditContact();

        renderStudents();

        renderAdminStudents();

        stopAllCameras();

    }


    /* =====================================================
       UPDATE USER NAME
    ===================================================== */

    function updateDashboardUser(user) {

        const nameElement =
            document.getElementById("dashboardUserName");

        const rollElement =
            document.getElementById("dashboardUserRoll");

        const welcomeElement =
            document.getElementById("welcomeName");


        if (nameElement) {

            nameElement.textContent = user.name;

        }


        if (rollElement) {

            rollElement.textContent =
                user.role === "admin"
                    ? "Admin"
                    : "Roll: " + user.roll;

        }


        if (welcomeElement) {

            welcomeElement.textContent =
                user.name;

        }


        /* Admin icon */

        const profileIcon =
            document.querySelector(".profile-icon");

        if (profileIcon) {

            profileIcon.textContent =
                user.role === "admin"
                    ? "👨‍💼"
                    : "👤";

        }

    }


    /* =====================================================
       DATE / TIME
    ===================================================== */

    function updateDateTime() {

        const dateElement =
            document.getElementById("currentDate");

        if (!dateElement) return;


        function update() {

            const now = new Date();

            const date =
                now.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                });

            const time =
                now.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                });


            dateElement.textContent =
                date + " • " + time;

        }


        update();

        setInterval(update, 1000);

    }


    /* =====================================================
       DASHBOARD MENU
    ===================================================== */

    const dashboardMenuButton =
        document.getElementById("dashboardMenuButton");


    const editProfileMenuButton =
        document.getElementById("editProfileMenuButton");


    const editContactMenuButton =
        document.getElementById("editContactMenuButton");


    const personalDetailsMenuButton =
        document.getElementById("personalDetailsMenuButton");


    const faceRegistrationMenuButton =
        document.getElementById("faceRegistrationMenuButton");


    const attendanceMenuButton =
        document.getElementById("attendanceMenuButton");


    const studentsMenuButton =
        document.getElementById("studentsMenuButton");


    const checkAttendanceMenuButton =
        document.getElementById("checkAttendanceMenuButton");


    const adminMenuButton =
        document.getElementById("adminMenuButton");


    function showDashboardSection(sectionId, activeButton) {

        const sections = document.querySelectorAll(
            ".dashboard-section"
        );


        sections.forEach(section => {

            section.style.display = "none";

        });


        const section =
            document.getElementById(sectionId);


        if (section) {

            section.style.display = "block";

        }


        const menuItems =
            document.querySelectorAll(".menu-item");


        menuItems.forEach(item => {

            item.classList.remove("active");

        });


        if (activeButton) {

            activeButton.classList.add("active");

        }


        /* Close mobile menu */

        closeSidebar();

    }


    if (dashboardMenuButton) {

        dashboardMenuButton.addEventListener(
            "click",
            () =>
                showDashboardSection(
                    "dashboardHome",
                    dashboardMenuButton
                )
        );

    }


    if (editProfileMenuButton) {

        editProfileMenuButton.addEventListener(
            "click",
            () =>
                showDashboardSection(
                    "editProfileSection",
                    editProfileMenuButton
                )
        );

    }


    if (editContactMenuButton) {

        editContactMenuButton.addEventListener(
            "click",
            () =>
                showDashboardSection(
                    "editContactSection",
                    editContactMenuButton
                )
        );

    }


    if (personalDetailsMenuButton) {

        personalDetailsMenuButton.addEventListener(
            "click",
            () =>
                showDashboardSection(
                    "personalDetailsSection",
                    personalDetailsMenuButton
                )
        );

    }


    if (faceRegistrationMenuButton) {

        faceRegistrationMenuButton.addEventListener(
            "click",
            () => {

                showDashboardSection(
                    "faceRegistrationSection",
                    faceRegistrationMenuButton
                );

                loadFaceDetails();

            }
        );

    }


    if (attendanceMenuButton) {

        attendanceMenuButton.addEventListener(
            "click",
            () => {

                showDashboardSection(
                    "attendanceSection",
                    attendanceMenuButton
                );

                resetAttendanceCamera();

            }
        );

    }


    if (studentsMenuButton) {

        studentsMenuButton.addEventListener(
            "click",
            () => {

                showDashboardSection(
                    "studentsSection",
                    studentsMenuButton
                );

                renderStudents();

            }
        );

    }


    if (checkAttendanceMenuButton) {

        checkAttendanceMenuButton.addEventListener(
            "click",
            () => {

                showDashboardSection(
                    "checkAttendanceSection",
                    checkAttendanceMenuButton
                );

                renderAttendanceHistory();

            }
        );

    }


    if (adminMenuButton) {

        adminMenuButton.addEventListener(
            "click",
            () => {

                showDashboardSection(
                    "adminSection",
                    adminMenuButton
                );

                renderAdminStudents();

            }
        );

    }


    /* =====================================================
       QUICK ACTION BUTTONS
    ===================================================== */

    const quickFaceRegistration =
        document.getElementById("quickFaceRegistration");


    const quickAttendance =
        document.getElementById("quickAttendance");


    const quickCheckAttendance =
        document.getElementById("quickCheckAttendance");


    if (quickFaceRegistration) {

        quickFaceRegistration.addEventListener(
            "click",
            () => {

                showDashboardSection(
                    "faceRegistrationSection",
                    faceRegistrationMenuButton
                );

                loadFaceDetails();

            }
        );

    }


    if (quickAttendance) {

        quickAttendance.addEventListener(
            "click",
            () => {

                showDashboardSection(
                    "attendanceSection",
                    attendanceMenuButton
                );

                resetAttendanceCamera();

            }
        );

    }


    if (quickCheckAttendance) {

        quickCheckAttendance.addEventListener(
            "click",
            () => {

                showDashboardSection(
                    "checkAttendanceSection",
                    checkAttendanceMenuButton
                );

                renderAttendanceHistory();

            }
        );

    }


    /* =====================================================
       PERSONAL DETAILS
    ===================================================== */

    function loadPersonalDetails() {

        const user = getCurrentUser();

        if (!user) return;


        setText("personalName", user.name);

        setText("personalMobile", user.mobile || "-");

        setText("personalEmail", user.email || "-");

        setText(
            "personalDepartment",
            user.department || "-"
        );

        setText(
            "personalRoll",
            user.roll || "-"
        );

    }


    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent = value;

        }

    }


    /* =====================================================
       EDIT PROFILE
    ===================================================== */

    function loadEditProfile() {

        const user = getCurrentUser();

        if (!user) return;


        const name =
            document.getElementById("editName");

        const roll =
            document.getElementById("editRoll");

        const department =
            document.getElementById("editDepartment");


        if (name) name.value = user.name || "";

        if (roll) roll.value = user.roll || "";

        if (department)
            department.value = user.department || "";

    }


    const saveEditedDetailsButton =
        document.getElementById(
            "saveEditedDetailsButton"
        );


    if (saveEditedDetailsButton) {

        saveEditedDetailsButton.addEventListener(
            "click",
            () => {

                const currentUser =
                    getCurrentUser();

                if (!currentUser) return;


                const newName =
                    document.getElementById(
                        "editName"
                    ).value.trim();


                const newRoll =
                    document.getElementById(
                        "editRoll"
                    ).value.trim();


                const newDepartment =
                    document.getElementById(
                        "editDepartment"
                    ).value.trim();


                if (!newName || !newRoll || !newDepartment) {

                    alert(
                        "Please fill all profile details."
                    );

                    return;
                }


                currentUser.name = newName;

                currentUser.roll = newRoll;

                currentUser.department =
                    newDepartment;


                saveCurrentUser(currentUser);


                if (currentUser.role !== "admin") {

                    const users = getUsers();

                    const index =
                        users.findIndex(
                            u => u.id === currentUser.id
                        );


                    if (index !== -1) {

                        users[index] = currentUser;

                        saveUsers(users);

                    }

                }


                updateDashboardUser(currentUser);

                loadPersonalDetails();

                alert(
                    "✅ Profile updated successfully."
                );

            }
        );

    }


    /* =====================================================
       EDIT MOBILE & EMAIL
    ===================================================== */

    function loadEditContact() {

        const user = getCurrentUser();

        if (!user) return;


        const mobile =
            document.getElementById("editMobile");

        const email =
            document.getElementById("editEmail");


        if (mobile)
            mobile.value = user.mobile || "";

        if (email)
            email.value = user.email || "";

    }


    const saveContactButton =
        document.getElementById(
            "saveContactButton"
        );


    if (saveContactButton) {

        saveContactButton.addEventListener(
            "click",
            () => {

                const currentUser =
                    getCurrentUser();

                if (!currentUser) return;


                const mobile =
                    document.getElementById(
                        "editMobile"
                    ).value.trim();


                const email =
                    document.getElementById(
                        "editEmail"
                    ).value.trim();


                if (!/^[0-9]{10}$/.test(mobile)) {

                    showMessage(
                        "contactMessage",
                        "Enter a valid 10 digit mobile number.",
                        "error"
                    );

                    return;
                }


                currentUser.mobile = mobile;

                currentUser.email = email;


                saveCurrentUser(currentUser);


                if (currentUser.role !== "admin") {

                    const users = getUsers();

                    const index =
                        users.findIndex(
                            u => u.id === currentUser.id
                        );


                    if (index !== -1) {

                        users[index] = currentUser;

                        saveUsers(users);

                    }

                }


                loadPersonalDetails();


                showMessage(
                    "contactMessage",
                    "✅ Contact details updated successfully.",
                    "success"
                );

            }
        );

    }


    /* =====================================================
       FACE DETAILS
    ===================================================== */

    function loadFaceDetails() {

        const user = getCurrentUser();

        if (!user) return;


        setInput("faceName", user.name);

        setInput("faceMobile", user.mobile);

        setInput("faceEmail", user.email);

        setInput("collegeName", user.college);

        setInput(
            "departmentName",
            user.department
        );

        setInput("faceRoll", user.roll);

    }


    function setInput(id, value) {

        const element =
            document.getElementById(id);

        if (element) {

            element.value = value || "";

        }

    }


    /* =====================================================
       CAMERA VARIABLES
    ===================================================== */

    let registrationStream = null;

    let attendanceStream = null;

    let registrationTimer = null;

    let attendanceTimer = null;

    let registrationCaptured = false;

    let attendanceCaptured = false;


    /* =====================================================
       CAMERA START
    ===================================================== */

    async function startCamera(videoElement) {

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
                        ideal: 480
                    },

                    height: {
                        ideal: 480
                    }

                },

                audio: false

            });


        videoElement.srcObject = stream;

        videoElement.setAttribute(
            "playsinline",
            ""
        );

        videoElement.muted = true;


        await videoElement.play();


        /* Selfie mirror */

        videoElement.style.transform =
            "scaleX(-1)";


        return stream;

    }


    /* =====================================================
       REGISTER FACE
    ===================================================== */

    const startFaceRegistrationButton =
        document.getElementById(
            "startFaceRegistrationButton"
        );


    if (startFaceRegistrationButton) {

        startFaceRegistrationButton.addEventListener(
            "click",
            async () => {

                if (registrationCaptured) {

                    registrationCaptured = false;

                    startFaceRegistrationButton.textContent =
                        "📷 Start Automatic Face Capture";

                    stopRegistrationCamera();

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


                const message =
                    document.getElementById(
                        "registrationMessage"
                    );


                try {

                    registrationStream =
                        await startCamera(video);


                    status.textContent =
                        "🟢 Camera ON — Detecting Face";


                    message.textContent =
                        "Please look directly at the camera. Automatic capture will start when a face is detected.";


                    startFaceRegistrationButton.textContent =
                        "⏳ Detecting Face...";


                    registrationCaptured = false;


                    startAutomaticFaceRegistration();

                } catch (error) {

                    console.error(error);

                    status.textContent =
                        "🔴 Camera OFF";


                    showMessage(
                        "registrationMessage",
                        "Camera permission is required. Please allow camera access.",
                        "error"
                    );

                }

            }
        );

    }


    /* =====================================================
       AUTOMATIC FACE REGISTRATION
    ===================================================== */

    async function startAutomaticFaceRegistration() {

        const video =
            document.getElementById(
                "registrationCamera"
            );


        /* Try face-api.js if models are available */

        let faceApiReady = false;


        try {

            if (
                typeof faceapi !== "undefined"
            ) {

                /*
                   The actual model files must be available
                   in /models for full face detection.
                */

                await Promise.all([

                    faceapi.nets.tinyFaceDetector.loadFromUri(
                        "./models"
                    )

                ]);

                faceApiReady = true;

            }

        } catch (error) {

            console.log(
                "Face model not available. Using camera capture timer."
            );

        }


        let attempts = 0;


        registrationTimer =
            setInterval(async () => {

                if (registrationCaptured)
                    return;


                attempts++;


                let detected = false;


                if (
                    faceApiReady &&
                    video.readyState >= 2
                ) {

                    try {

                        const result =
                            await faceapi.detectSingleFace(
                                video,
                                new faceapi.TinyFaceDetectorOptions()
                            );


                        detected = !!result;

                    } catch (error) {

                        detected = false;

                    }

                }


                /*
                   If model is unavailable,
                   allow automatic capture after
                   a few seconds of camera preview.
                */

                if (
                    detected ||
                    (!faceApiReady && attempts >= 5)
                ) {

                    captureRegistrationFace();

                }


            }, 700);

    }


    /* =====================================================
       CAPTURE REGISTER FACE
    ===================================================== */

    function captureRegistrationFace() {

        if (registrationCaptured)
            return;


        registrationCaptured = true;


        clearInterval(registrationTimer);


        const currentUser =
            getCurrentUser();


        if (!currentUser) return;


        currentUser.faceRegistered = true;

        currentUser.faceRegisteredAt =
            new Date().toISOString();


        saveCurrentUser(currentUser);


        if (currentUser.role !== "admin") {

            const users = getUsers();

            const index =
                users.findIndex(
                    u => u.id === currentUser.id
                );


            if (index !== -1) {

                users[index] = currentUser;

                saveUsers(users);

            }

        }


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
                "startFaceRegistrationButton"
            );


        status.textContent =
            "🟢 Face Captured";


        message.textContent =
            "✅ Face registered successfully!";


        message.className =
            "auth-message success";


        button.textContent =
            "✅ Face Registered";


        setTimeout(() => {

            stopRegistrationCamera();

        }, 1500);

    }


    /* =====================================================
       STOP REGISTRATION CAMERA
    ===================================================== */

    function stopRegistrationCamera() {

        if (registrationTimer) {

            clearInterval(registrationTimer);

            registrationTimer = null;

        }


        if (registrationStream) {

            registrationStream
                .getTracks()
                .forEach(track => track.stop());

            registrationStream = null;

        }


        const video =
            document.getElementById(
                "registrationCamera"
            );


        if (video) {

            video.srcObject = null;

        }

    }


    /* =====================================================
       FACE ATTENDANCE
    ===================================================== */

    const startFaceAttendanceButton =
        document.getElementById(
            "startFaceAttendanceButton"
        );


    if (startFaceAttendanceButton) {

        startFaceAttendanceButton.addEventListener(
            "click",
            async () => {

                if (attendanceCaptured) {

                    attendanceCaptured = false;

                    stopAttendanceCamera();

                    startFaceAttendanceButton.textContent =
                        "📸 Start Automatic Attendance";

                    return;

                }


                const currentUser =
                    getCurrentUser();


                if (!currentUser) {

                    return;

                }


                if (
                    currentUser.role !== "admin" &&
                    !currentUser.faceRegistered
                ) {

                    showAttendanceResult(
                        "⚠️ Please register your face first."
                    );

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

                    attendanceStream =
                        await startCamera(video);


                    status.textContent =
                        "🟢 Camera ON — Detecting Face";


                    startFaceAttendanceButton.textContent =
                        "⏳ Detecting Face...";


                    attendanceCaptured = false;


                    startAutomaticAttendance();

                } catch (error) {

                    console.error(error);

                    status.textContent =
                        "🔴 Camera OFF";


                    showAttendanceResult(
                        "❌ Please allow camera permission."
                    );

                }

            }
        );

    }


    /* =====================================================
       AUTOMATIC ATTENDANCE
    ===================================================== */

    async function startAutomaticAttendance() {

        const video =
            document.getElementById(
                "attendanceCamera"
            );


        let faceApiReady = false;


        try {

            if (
                typeof faceapi !== "undefined"
            ) {

                await Promise.all([

                    faceapi.nets.tinyFaceDetector.loadFromUri(
                        "./models"
                    )

                ]);

                faceApiReady = true;

            }

        } catch (error) {

            console.log(
                "Face model unavailable. Automatic preview capture mode enabled."
            );

        }


        let attempts = 0;


        attendanceTimer =
            setInterval(async () => {

                if (attendanceCaptured)
                    return;


                attempts++;


                let detected = false;


                if (
                    faceApiReady &&
                    video.readyState >= 2
                ) {

                    try {

                        const result =
                            await faceapi.detectSingleFace(
                                video,
                                new faceapi.TinyFaceDetectorOptions()
                            );


                        detected = !!result;

                    } catch (error) {

                        detected = false;

                    }

                }


                if (
                    detected ||
                    (!faceApiReady && attempts >= 5)
                ) {

                    markAttendanceAutomatically();

                }


            }, 700);

    }


    /* =====================================================
       MARK ATTENDANCE
    ===================================================== */

    function markAttendanceAutomatically() {

        if (attendanceCaptured)
            return;


        attendanceCaptured = true;


        clearInterval(attendanceTimer);


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


        const records =
            getAttendance();


        /*
           Prevent duplicate attendance
           for same student on same date.
        */

        const alreadyMarked =
            records.some(
                record =>
                    record.userId === user.id &&
                    record.date === date
            );


        if (alreadyMarked) {

            showAttendancePopup(
                "ℹ️",
                "Already Marked",
                `${user.name}, your attendance has already been marked today.`
            );


            stopAttendanceCamera();

            return;

        }


        const record = {

            id: Date.now(),

            userId: user.id,

            name: user.name,

            mobile: user.mobile || "",

            email: user.email || "",

            college: user.college || "",

            department: user.department || "",

            roll: user.roll || "",

            date: date,

            day: day,

            time: time,

            status: "Present",

            timestamp: now.toISOString()

        };


        records.push(record);

        saveAttendance(records);


        showAttendanceResult(
            `✅ Attendance marked successfully for ${user.name}.`
        );


        showAttendancePopup(
            "✅",
            "Attendance Marked!",
            `${user.name}<br><br>${date}<br>${day}<br>${time}`
        );


        loadDashboardStats();

        renderAttendanceHistory();

        renderStudents();

        renderAdminStudents();


        setTimeout(() => {

            stopAttendanceCamera();

        }, 1000);

    }


    /* =====================================================
       ATTENDANCE RESULT
    ===================================================== */

    function showAttendanceResult(message) {

        const element =
            document.getElementById(
                "attendanceResult"
            );


        if (!element) return;


        element.innerHTML =
            message;


        element.className =
            "attendance-result";

    }


    /* =====================================================
       ATTENDANCE POPUP
    ===================================================== */

    function showAttendancePopup(
        icon,
        title,
        message
    ) {

        const popup =
            document.getElementById(
                "attendancePopup"
            );


        const popupIcon =
            document.getElementById(
                "popupIcon"
            );


        const popupTitle =
            document.getElementById(
                "popupTitle"
            );


        const popupMessage =
            document.getElementById(
                "popupMessage"
            );


        if (!popup) return;


        popupIcon.innerHTML = icon;

        popupTitle.textContent = title;

        popupMessage.innerHTML = message;

        popup.style.display = "flex";

    }


    const closeAttendancePopup =
        document.getElementById(
            "closeAttendancePopup"
        );


    if (closeAttendancePopup) {

        closeAttendancePopup.addEventListener(
            "click",
            () => {

                const popup =
                    document.getElementById(
                        "attendancePopup"
                    );


                if (popup) {

                    popup.style.display =
                        "none";

                }

            }
        );

    }


    /* =====================================================
       STOP ATTENDANCE CAMERA
    ===================================================== */

    function stopAttendanceCamera() {

        if (attendanceTimer) {

            clearInterval(attendanceTimer);

            attendanceTimer = null;

        }


        if (attendanceStream) {

            attendanceStream
                .getTracks()
                .forEach(track => track.stop());

            attendanceStream = null;

        }


        const video =
            document.getElementById(
                "attendanceCamera"
            );


        if (video) {

            video.srcObject = null;

        }


        const status =
            document.getElementById(
                "attendanceStatus"
            );


        if (status) {

            status.textContent =
                "Camera is OFF";

        }

    }


    function resetAttendanceCamera() {

        attendanceCaptured = false;

        stopAttendanceCamera();

        const button =
            document.getElementById(
                "startFaceAttendanceButton"
            );


        if (button) {

            button.textContent =
                "📸 Start Automatic Attendance";

        }


        const result =
            document.getElementById(
                "attendanceResult"
            );


        if (result) {

            result.innerHTML = "";

        }

    }


    /* =====================================================
       STUDENT LIST
    ===================================================== */

    function renderStudents() {

        const list =
            document.getElementById(
                "studentList"
            );


        if (!list) return;


        const users =
            getUsers();


        if (users.length === 0) {

            list.innerHTML =
                `<div class="details-card">
                    <h3>No Students Registered</h3>
                    <p>Students will appear here after creating an account.</p>
                </div>`;

            return;

        }


        list.innerHTML =
            users.map(user => {

                return `
                    <div class="student-card">

                        <div class="student-card-header">

                            <div class="student-avatar">
                                👤
                            </div>

                            <div>
                                <h3>${escapeHTML(user.name)}</h3>
                                <p>
                                    Roll: ${escapeHTML(user.roll)}
                                </p>
                            </div>

                        </div>

                        <div class="student-info">

                            <p>
                                <strong>📱 Mobile:</strong>
                                ${escapeHTML(user.mobile || "-")}
                            </p>

                            <p>
                                <strong>📧 Email:</strong>
                                ${escapeHTML(user.email || "-")}
                            </p>

                            <p>
                                <strong>🏫 College:</strong>
                                ${escapeHTML(user.college || "-")}
                            </p>

                            <p>
                                <strong>📚 Branch:</strong>
                                ${escapeHTML(user.department || "-")}
                            </p>

                            <p>
                                <strong>👤 Face:</strong>
                                ${
                                    user.faceRegistered
                                    ? "✅ Registered"
                                    : "❌ Not Registered"
                                }
                            </p>

                        </div>

                    </div>
                `;

            }).join("");

    }


    /* =====================================================
       ADMIN STUDENT LIST
    ===================================================== */

    function renderAdminStudents() {

        const list =
            document.getElementById(
                "adminStudentList"
            );


        if (!list) return;


        const users =
            getUsers();


        if (users.length === 0) {

            list.innerHTML =
                `<div class="details-card">
                    <h3>No Registered Students</h3>
                    <p>Student details will appear here.</p>
                </div>`;

            return;

        }


        list.innerHTML =
            users.map((user, index) => {

                return `
                    <div class="student-card">

                        <div class="student-card-header">

                            <div class="student-avatar">
                                ${index + 1}
                            </div>

                            <div>

                                <h3>
                                    ${escapeHTML(user.name)}
                                </h3>

                                <p>
                                    ${escapeHTML(user.department)}
                                    •
                                    Roll ${escapeHTML(user.roll)}
                                </p>

                            </div>

                        </div>


                        <div class="student-info">

                            <p>
                                <strong>📱 Mobile:</strong>
                                ${escapeHTML(user.mobile || "-")}
                            </p>

                            <p>
                                <strong>📧 Email:</strong>
                                ${escapeHTML(user.email || "-")}
                            </p>

                            <p>
                                <strong>🏫 College:</strong>
                                ${escapeHTML(user.college || "-")}
                            </p>

                            <p>
                                <strong>📚 Department:</strong>
                                ${escapeHTML(user.department || "-")}
                            </p>

                            <p>
                                <strong>🎫 Roll:</strong>
                                ${escapeHTML(user.roll || "-")}
                            </p>

                            <p>
                                <strong>👤 Face Registration:</strong>
                                ${
                                    user.faceRegistered
                                    ? "✅ Completed"
                                    : "❌ Pending"
                                }
                            </p>

                        </div>

                    </div>
                `;

            }).join("");

    }


    /* =====================================================
       SEARCH STUDENTS
    ===================================================== */

    const searchStudent =
        document.getElementById(
            "searchStudent"
        );


    if (searchStudent) {

        searchStudent.addEventListener(
            "input",
            () => {

                const query =
                    searchStudent.value
                        .trim()
                        .toLowerCase();


                const users =
                    getUsers();


                const filtered =
                    users.filter(user => {

                        return (

                            user.name
                                .toLowerCase()
                                .includes(query)

                            ||

                            user.roll
                                .toLowerCase()
                                .includes(query)

                            ||

                            user.department
                                .toLowerCase()
                                .includes(query)

                        );

                    });


                const list =
                    document.getElementById(
                        "studentList"
                    );


                if (!list) return;


                if (filtered.length === 0) {

                    list.innerHTML =
                        `<div class="details-card">
                            <h3>No student found</h3>
                        </div>`;

                    return;

                }


                list.innerHTML =
                    filtered.map(user => {

                        return `
                            <div class="student-card">

                                <div class="student-card-header">

                                    <div class="student-avatar">
                                        👤
                                    </div>

                                    <div>
                                        <h3>
                                            ${escapeHTML(user.name)}
                                        </h3>

                                        <p>
                                            Roll:
                                            ${escapeHTML(user.roll)}
                                        </p>
                                    </div>

                                </div>

                                <div class="student-info">

                                    <p>
                                        <strong>📱 Mobile:</strong>
                                        ${escapeHTML(user.mobile || "-")}
                                    </p>

                                    <p>
                                        <strong>📧 Email:</strong>
                                        ${escapeHTML(user.email || "-")}
                                    </p>

                                    <p>
                                        <strong>📚 Branch:</strong>
                                        ${escapeHTML(user.department || "-")}
                                    </p>

                                </div>

                            </div>
                        `;

                    }).join("");

            }
        );

    }


    /* =====================================================
       ATTENDANCE HISTORY
    ===================================================== */

    function renderAttendanceHistory() {

        const history =
            document.getElementById(
                "attendanceHistory"
            );


        if (!history) return;


        const currentUser =
            getCurrentUser();


        if (!currentUser) return;


        const records =
            getAttendance();


        const myRecords =
            records.filter(
                record =>
                    record.userId === currentUser.id
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


        setText(
            "attendanceTotalDays",
            total
        );


        setText(
            "attendancePresentDays",
            present
        );


        setText(
            "attendanceAbsentDays",
            absent
        );


        if (myRecords.length === 0) {

            history.innerHTML =
                `<div class="details-card">
                    <h3>No Attendance Records</h3>
                    <p>Your attendance history will appear here.</p>
                </div>`;

            return;

        }


        const sorted =
            [...myRecords].reverse();


        history.innerHTML =
            sorted.map(record => {

                return `
                    <div class="attendance-history-card">

                        <div>

                            <strong>
                                ${escapeHTML(record.date)}
                            </strong>

                            <span>
                                ${escapeHTML(record.day)}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(record.time)}
                            </strong>

                            <span class="present-badge">
                                ${escapeHTML(record.status)}
                            </span>

                        </div>

                    </div>
                `;

            }).join("");

    }


    /* =====================================================
       DASHBOARD STATISTICS
    ===================================================== */

    function loadDashboardStats() {

        const users =
            getUsers();


        const records =
            getAttendance();


        const today =
            new Date().toLocaleDateString(
                "en-IN"
            );


        const todayRecords =
            records.filter(
                record =>
                    record.date === today &&
                    record.status === "Present"
            );


        const totalStudents =
            users.length;


        const presentToday =
            todayRecords.length;


        const absentToday =
            Math.max(
                0,
                totalStudents - presentToday
            );


        const attendancePercentage =
            totalStudents > 0
                ? Math.round(
                    (presentToday / totalStudents) *
                    100
                )
                : 0;


        setText(
            "totalStudents",
            totalStudents
        );


        setText(
            "presentStudents",
            presentToday
        );


        setText(
            "absentStudents",
            absentToday
        );


        setText(
            "attendancePercentage",
            attendancePercentage + "%"
        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                stopAllCameras();

                clearCurrentUser();

                showPage(loginPage);


                document.getElementById(
                    "loginName"
                ).value = "";


                document.getElementById(
                    "loginIdentity"
                ).value = "";


                document.getElementById(
                    "loginPin"
                ).value = "";


                clearMessage(
                    "loginMessage"
                );

            }
        );

    }


    /* =====================================================
       ESCAPE HTML
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
       STOP ALL CAMERAS
    ===================================================== */

    function stopAllCameras() {

        stopRegistrationCamera();

        stopAttendanceCamera();

    }


    /* =====================================================
       SIDEBAR / HAMBURGER SUPPORT
    ===================================================== */

    /*
       This automatically creates the ☰ button
       if your HTML does not already contain one.
    */

    function createHamburgerButton() {

        if (!dashboardPage) return;


        let hamburger =
            document.getElementById(
                "hamburgerButton"
            );


        if (hamburger) return;


        hamburger =
            document.createElement("button");


        hamburger.id =
            "hamburgerButton";


        hamburger.className =
            "hamburger-button";


        hamburger.innerHTML =
            "☰";


        hamburger.setAttribute(
            "aria-label",
            "Open menu"
        );


        document.body.appendChild(
            hamburger
        );


        hamburger.addEventListener(
            "click",
            () => {

                const sidebar =
                    document.querySelector(
                        ".sidebar"
                    );


                if (!sidebar) return;


                sidebar.classList.toggle(
                    "sidebar-open"
                );

            }
        );

    }


    function closeSidebar() {

        const sidebar =
            document.querySelector(
                ".sidebar"
            );


        if (sidebar) {

            sidebar.classList.remove(
                "sidebar-open"
            );

        }

    }


    createHamburgerButton();


    /* =====================================================
       AUTO LOGIN CHECK
    ===================================================== */

    const savedUser =
        getCurrentUser();


    if (savedUser) {

        openDashboard(savedUser);

    } else {

        showPage(loginPage);

    }


    /* =====================================================
       CLOSE MODALS
    ===================================================== */

    const closeStudentsModal =
        document.getElementById(
            "closeStudentsModal"
        );


    if (closeStudentsModal) {

        closeStudentsModal.addEventListener(
            "click",
            () => {

                const modal =
                    document.getElementById(
                        "studentsModal"
                    );


                if (modal) {

                    modal.style.display =
                        "none";

                }

            }
        );

    }


    const closeCheckAttendanceModal =
        document.getElementById(
            "closeCheckAttendanceModal"
        );


    if (closeCheckAttendanceModal) {

        closeCheckAttendanceModal.addEventListener(
            "click",
            () => {

                const modal =
                    document.getElementById(
                        "attendanceCheckModal"
                    );


                if (modal) {

                    modal.style.display =
                        "none";

                }

            }
        );

    }


    const closeEditDetailsModal =
        document.getElementById(
            "closeEditDetailsModal"
        );


    if (closeEditDetailsModal) {

        closeEditDetailsModal.addEventListener(
            "click",
            () => {

                const modal =
                    document.getElementById(
                        "editDetailsModal"
                    );


                if (modal) {

                    modal.style.display =
                        "none";

                }

            }
        );

    }


    /* =====================================================
       FORGOT PIN
    ===================================================== */

    const resetPinButton =
        document.getElementById(
            "resetPinButton"
        );


    if (resetPinButton) {

        resetPinButton.addEventListener(
            "click",
            () => {

                const name =
                    document.getElementById(
                        "forgotName"
                    ).value.trim();


                const identity =
                    document.getElementById(
                        "forgotIdentity"
                    ).value.trim();


                const newPin =
                    document.getElementById(
                        "newPin"
                    ).value.trim();


                const confirmNewPin =
                    document.getElementById(
                        "confirmNewPin"
                    ).value.trim();


                if (
                    !name ||
                    !identity ||
                    !newPin ||
                    !confirmNewPin
                ) {

                    showMessage(
                        "forgotMessage",
                        "Please fill all fields.",
                        "error"
                    );

                    return;

                }


                if (
                    !/^[0-9]{4}$/.test(newPin)
                ) {

                    showMessage(
                        "forgotMessage",
                        "New PIN must contain 4 digits.",
                        "error"
                    );

                    return;

                }


                if (
                    newPin !== confirmNewPin
                ) {

                    showMessage(
                        "forgotMessage",
                        "PINs do not match.",
                        "error"
                    );

                    return;

                }


                const users =
                    getUsers();


                const index =
                    users.findIndex(user => {

                        const sameName =
                            user.name.toLowerCase() ===
                            name.toLowerCase();


                        const sameMobile =
                            user.mobile === identity;


                        const sameEmail =
                            user.email &&
                            user.email.toLowerCase() ===
                            identity.toLowerCase();


                        return (
                            sameName &&
                            (sameMobile || sameEmail)
                        );

                    });


                if (index === -1) {

                    showMessage(
                        "forgotMessage",
                        "❌ Account not found.",
                        "error"
                    );

                    return;

                }


                users[index].pin =
                    newPin;


                saveUsers(users);


                showMessage(
                    "forgotMessage",
                    "✅ PIN reset successfully. Please login.",
                    "success"
                );


                setTimeout(() => {

                    showPage(loginPage);

                }, 1200);

            }
        );

    }


    /* =====================================================
       INITIAL DASHBOARD
    ===================================================== */

    loadDashboardStats();


    console.log(
        "✅ Smart Attendance System loaded successfully."
    );

});
```

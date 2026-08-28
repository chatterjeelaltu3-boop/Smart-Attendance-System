```javascript
// ============================================================
// SMART ATTENDANCE SYSTEM
// script.js
// No OTP | Mobile OR Email + 4 Digit PIN
// Automatic Face Capture | Attendance Popup | Local Storage
// ============================================================

// ------------------------------------------------------------
// GLOBAL DATA
// ------------------------------------------------------------

let currentUser = null;
let registrationStream = null;
let attendanceStream = null;

let registeredStudents =
    JSON.parse(localStorage.getItem("registeredStudents") || "[]");

let attendanceData =
    JSON.parse(localStorage.getItem("attendanceData") || "{}");


// ------------------------------------------------------------
// HELPER
// ------------------------------------------------------------

function $(id) {
    return document.getElementById(id);
}

function cleanMobile(mobile) {
    return String(mobile || "")
        .replace(/\D/g, "")
        .slice(-10);
}

function validMobile(mobile) {
    return /^[6-9]\d{9}$/.test(cleanMobile(mobile));
}

function validPin(pin) {
    return /^\d{4}$/.test(String(pin || ""));
}

function validEmail(email) {
    if (!email) return false;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function saveStudents() {
    localStorage.setItem(
        "registeredStudents",
        JSON.stringify(registeredStudents)
    );
}

function saveAttendance() {
    localStorage.setItem(
        "attendanceData",
        JSON.stringify(attendanceData)
    );
}

function showMessage(id, message, type = "info") {

    const el = $(id);

    if (!el) return;

    el.textContent = message;
    el.className = "auth-message " + type;
}

function escapeHTML(value) {

    return String(value || "")
        .replace(
            /[&<>"']/g,
            char => {

                const map = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                };

                return map[char];
            }
        );
}


// ------------------------------------------------------------
// PAGE NAVIGATION
// ------------------------------------------------------------

function showPage(pageId) {

    const pages = [
        "loginPage",
        "createAccountPage",
        "forgotPinPage",
        "dashboardPage"
    ];

    pages.forEach(id => {

        const page = $(id);

        if (page) {

            page.style.display =
                id === pageId ? "block" : "none";
        }
    });
}


// ------------------------------------------------------------
// DASHBOARD SECTIONS
// ------------------------------------------------------------

function hideDashboardSections() {

    const sections = [
        "dashboardHome",
        "faceRegistrationSection",
        "attendanceSection",
        "studentsSection"
    ];

    sections.forEach(id => {

        const section = $(id);

        if (section) {
            section.style.display = "none";
        }
    });
}


function showDashboardHome() {

    hideDashboardSections();

    $("dashboardHome").style.display = "block";

    updateMenuActive("dashboardMenuButton");
}


function showFaceRegistration() {

    hideDashboardSections();

    $("faceRegistrationSection").style.display = "block";

    updateMenuActive("faceRegistrationMenuButton");

    if (currentUser) {
        fillFaceRegistrationFields(currentUser);
    }
}


function showAttendanceSection() {

    hideDashboardSections();

    $("attendanceSection").style.display = "block";

    updateMenuActive("attendanceMenuButton");
}


function showStudentsSection() {

    hideDashboardSections();

    $("studentsSection").style.display = "block";

    updateMenuActive("studentsMenuButton");

    displayStudents();
}


function updateMenuActive(activeId) {

    document
        .querySelectorAll(".menu-item")
        .forEach(button => {

            button.classList.remove("active");
        });

    $(activeId)?.classList.add("active");
}


// ------------------------------------------------------------
// CREATE ACCOUNT
// ------------------------------------------------------------

function openCreateAccount() {

    showPage("createAccountPage");

    showMessage("createMessage", "");

    $("createName")?.focus();
}


function createAccount() {

    const name =
        $("createName")?.value.trim();

    const mobile =
        cleanMobile(
            $("createMobile")?.value
        );

    const email =
        $("createEmail")?.value.trim();

    const pin =
        $("createPin")?.value.trim();

    const confirmPin =
        $("confirmPin")?.value.trim();

    const college =
        $("createCollege")?.value.trim();

    const department =
        $("createDepartment")?.value.trim();

    const roll =
        $("createRoll")?.value.trim();


    // ---------------- VALIDATION ----------------

    if (!name) {

        showMessage(
            "createMessage",
            "Please enter your full name.",
            "error"
        );

        return;
    }


    if (!validMobile(mobile)) {

        showMessage(
            "createMessage",
            "Please enter a valid 10 digit mobile number.",
            "error"
        );

        return;
    }


    if (email && !validEmail(email)) {

        showMessage(
            "createMessage",
            "Please enter a valid email address.",
            "error"
        );

        return;
    }


    if (!validPin(pin)) {

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


    if (!college) {

        showMessage(
            "createMessage",
            "Please enter your college name.",
            "error"
        );

        return;
    }


    if (!department) {

        showMessage(
            "createMessage",
            "Please enter your department / branch.",
            "error"
        );

        return;
    }


    if (!roll) {

        showMessage(
            "createMessage",
            "Please enter your roll number.",
            "error"
        );

        return;
    }


    // ---------------- DUPLICATE MOBILE ----------------

    const mobileExists =
        registeredStudents.some(
            student =>
                student.mobile === mobile
        );


    if (mobileExists) {

        showMessage(
            "createMessage",
            "This mobile number is already registered.",
            "error"
        );

        return;
    }


    // ---------------- DUPLICATE EMAIL ----------------

    if (email) {

        const emailExists =
            registeredStudents.some(
                student =>
                    student.email &&
                    student.email.toLowerCase() ===
                    email.toLowerCase()
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


    // ---------------- CREATE STUDENT ----------------

    const student = {

        id:
            "student_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 9),

        name: name,

        mobile: mobile,

        email: email,

        pin: pin,

        roll: roll,

        college: college,

        department: department,

        faceDescriptor: null,

        registeredAt:
            new Date().toISOString()
    };


    registeredStudents.push(student);

    saveStudents();


    currentUser = student;

    window.currentStudentId =
        student.id;


    showMessage(
        "createMessage",
        "Account created successfully! 🎉",
        "success"
    );


    setTimeout(
        () => {

            openDashboard(student);

        },
        700
    );
}


// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------

function loginUser() {

    const name =
        $("loginName")?.value.trim();

    const identity =
        $("loginIdentity")?.value.trim();

    const pin =
        $("loginPin")?.value.trim();


    if (!name) {

        showMessage(
            "loginMessage",
            "Please enter your name.",
            "error"
        );

        return;
    }


    if (!identity) {

        showMessage(
            "loginMessage",
            "Enter your mobile number or email.",
            "error"
        );

        return;
    }


    if (!validPin(pin)) {

        showMessage(
            "loginMessage",
            "PIN must be exactly 4 digits.",
            "error"
        );

        return;
    }


    const mobile =
        cleanMobile(identity);

    const isMobile =
        validMobile(identity);

    const identityLower =
        identity.toLowerCase();


    const student =
        registeredStudents.find(
            s => {

                const nameMatch =
                    s.name.toLowerCase() ===
                    name.toLowerCase();

                const mobileMatch =
                    isMobile &&
                    s.mobile === mobile;

                const emailMatch =
                    s.email &&
                    s.email.toLowerCase() ===
                    identityLower;

                return (
                    nameMatch &&
                    (mobileMatch || emailMatch) &&
                    s.pin === pin
                );
            }
        );


    if (!student) {

        showMessage(
            "loginMessage",
            "Name, mobile/email or PIN does not match.",
            "error"
        );

        return;
    }


    currentUser = student;

    window.currentStudentId =
        student.id;


    showMessage(
        "loginMessage",
        "Login successful! ✅",
        "success"
    );


    setTimeout(
        () => {

            openDashboard(student);

        },
        500
    );
}


// ------------------------------------------------------------
// FORGOT PIN
// ------------------------------------------------------------

function openForgotPin() {

    showPage("forgotPinPage");

    showMessage(
        "forgotMessage",
        ""
    );
}


function resetPIN() {

    const name =
        $("forgotName")?.value.trim();

    const identity =
        $("forgotIdentity")?.value.trim();

    const newPin =
        $("newPin")?.value.trim();

    const confirmNewPin =
        $("confirmNewPin")?.value.trim();


    if (!name) {

        showMessage(
            "forgotMessage",
            "Enter your registered name.",
            "error"
        );

        return;
    }


    if (!identity) {

        showMessage(
            "forgotMessage",
            "Enter your mobile number or email.",
            "error"
        );

        return;
    }


    if (!validPin(newPin)) {

        showMessage(
            "forgotMessage",
            "New PIN must contain 4 digits.",
            "error"
        );

        return;
    }


    if (newPin !== confirmNewPin) {

        showMessage(
            "forgotMessage",
            "New PINs do not match.",
            "error"
        );

        return;
    }


    const mobile =
        cleanMobile(identity);

    const isMobile =
        validMobile(identity);

    const identityLower =
        identity.toLowerCase();


    const student =
        registeredStudents.find(
            s => {

                const nameMatch =
                    s.name.toLowerCase() ===
                    name.toLowerCase();

                const mobileMatch =
                    isMobile &&
                    s.mobile === mobile;

                const emailMatch =
                    s.email &&
                    s.email.toLowerCase() ===
                    identityLower;

                return (
                    nameMatch &&
                    (mobileMatch || emailMatch)
                );
            }
        );


    if (!student) {

        showMessage(
            "forgotMessage",
            "Name and mobile/email do not match.",
            "error"
        );

        return;
    }


    student.pin =
        newPin;

    saveStudents();


    showMessage(
        "forgotMessage",
        "PIN reset successfully! ✅",
        "success"
    );


    setTimeout(
        () => {

            showPage("loginPage");

        },
        1000
    );
}


// ------------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------------

function openDashboard(student) {

    showPage("dashboardPage");

    currentUser =
        student;


    fillFaceRegistrationFields(student);

    updateDashboard();

    updateDate();

    updateProfile();

    showDashboardHome();

    displayStudents();
}


function updateProfile() {

    if (!currentUser) return;


    if ($("dashboardUserName")) {

        $("dashboardUserName")
            .textContent =
            currentUser.name || "Student";
    }


    if ($("dashboardUserRoll")) {

        $("dashboardUserRoll")
            .textContent =
            currentUser.roll || "Roll";
    }


    if ($("welcomeName")) {

        $("welcomeName")
            .textContent =
            currentUser.name || "Student";
    }
}


// ------------------------------------------------------------
// FILL FACE REGISTRATION FORM
// ------------------------------------------------------------

function fillFaceRegistrationFields(student) {

    if (!student) return;


    if ($("faceName"))
        $("faceName").value =
            student.name || "";


    if ($("faceRoll"))
        $("faceRoll").value =
            student.roll || "";


    if ($("collegeName"))
        $("collegeName").value =
            student.college || "";


    if ($("departmentName"))
        $("departmentName").value =
            student.department || "";


    if ($("faceMobile"))
        $("faceMobile").value =
            student.mobile || "";


    if ($("faceEmail"))
        $("faceEmail").value =
            student.email || "";
}


// ------------------------------------------------------------
// DATE
// ------------------------------------------------------------

function updateDate() {

    const el =
        $("currentDate");

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


// ------------------------------------------------------------
// DASHBOARD STATISTICS
// ------------------------------------------------------------

function updateDashboard() {

    const total =
        registeredStudents.length;


    const today =
        getToday();


    let present = 0;


    registeredStudents.forEach(
        student => {

            const records =
                attendanceData[student.id] || [];


            const isPresent =
                records.some(
                    record =>
                        record.date === today &&
                        record.status === "Present"
                );


            if (isPresent) {
                present++;
            }
        }
    );


    const absent =
        Math.max(
            0,
            total - present
        );


    const percentage =
        total > 0
            ? Math.round(
                (present / total) * 100
            )
            : 0;


    if ($("totalStudents"))
        $("totalStudents")
            .textContent =
            total;


    if ($("presentStudents"))
        $("presentStudents")
            .textContent =
            present;


    if ($("absentStudents"))
        $("absentStudents")
            .textContent =
            absent;


    if ($("attendancePercentage"))
        $("attendancePercentage")
            .textContent =
            percentage + "%";
}


function getToday() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


// ------------------------------------------------------------
// FACE API MODEL LOADING
// ------------------------------------------------------------

let faceModelsLoaded = false;
let faceModelsLoading = false;


async function loadFaceModels() {

    if (faceModelsLoaded) {
        return true;
    }


    if (faceModelsLoading) {

        while (faceModelsLoading) {

            await new Promise(
                resolve =>
                    setTimeout(resolve, 100)
            );
        }

        return faceModelsLoaded;
    }


    if (
        typeof faceapi ===
        "undefined"
    ) {

        console.error(
            "face-api.js is not loaded."
        );

        return false;
    }


    try {

        faceModelsLoading = true;


        const MODEL_URL =
            "https://justadudewhohacks.github.io/face-api.js/models";


        await Promise.all([

            faceapi.nets.tinyFaceDetector
                .loadFromUri(MODEL_URL),

            faceapi.nets.faceLandmark68Net
                .loadFromUri(MODEL_URL),

            faceapi.nets.faceRecognitionNet
                .loadFromUri(MODEL_URL)

        ]);


        faceModelsLoaded = true;


        console.log(
            "Face recognition models loaded ✅"
        );


        return true;

    }

    catch (error) {

        console.error(
            "Face model loading error:",
            error
        );

        return false;

    }

    finally {

        faceModelsLoading = false;
    }
}


// ------------------------------------------------------------
// AUTOMATIC FACE REGISTRATION
// ------------------------------------------------------------

async function startAutomaticFaceRegistration() {

    if (!currentUser) {

        showMessage(
            "registrationMessage",
            "Please login first.",
            "error"
        );

        return;
    }


    const name =
        $("faceName")?.value.trim();

    const roll =
        $("faceRoll")?.value.trim();

    const college =
        $("collegeName")?.value.trim();

    const department =
        $("departmentName")?.value.trim();

    const mobile =
        cleanMobile(
            $("faceMobile")?.value
        );

    const email =
        $("faceEmail")?.value.trim();


    if (
        !name ||
        !roll ||
        !college ||
        !department
    ) {

        showMessage(
            "registrationMessage",
            "Please fill Name, Roll, College and Department.",
            "error"
        );

        return;
    }


    if (!validMobile(mobile)) {

        showMessage(
            "registrationMessage",
            "Enter a valid mobile number.",
            "error"
        );

        return;
    }


    if (
        email &&
        !validEmail(email)
    ) {

        showMessage(
            "registrationMessage",
            "Enter a valid email address.",
            "error"
        );

        return;
    }


    try {

        showMessage(
            "registrationMessage",
            "Loading face recognition...",
            "info"
        );


        const modelsReady =
            await loadFaceModels();


        if (!modelsReady) {

            showMessage(
                "registrationMessage",
                "Face recognition models could not be loaded.",
                "error"
            );

            return;
        }


        const video =
            $("registrationCamera");


        registrationStream =
            await navigator.mediaDevices.getUserMedia(
                {
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
                }
            );


        video.srcObject =
            registrationStream;


        await video.play();


        $("registrationStatus")
            .textContent =
            "Camera ON — detecting face...";


        showMessage(
            "registrationMessage",
            "Look directly at the camera. Capturing automatically...",
            "info"
        );


        const descriptor =
            await waitForFaceDescriptor(
                video,
                10000
            );


        if (!descriptor) {

            showMessage(
                "registrationMessage",
                "No clear face detected. Please try again.",
                "error"
            );

            stopRegistrationCamera();

            return;
        }


        const student =
            registeredStudents.find(
                s =>
                    s.id ===
                    currentUser.id
            );


        if (!student) {

            showMessage(
                "registrationMessage",
                "Student account not found.",
                "error"
            );

            stopRegistrationCamera();

            return;
        }


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

        student.faceDescriptor =
            Array.from(descriptor);


        currentUser =
            student;


        saveStudents();


        fillFaceRegistrationFields(
            student
        );

        updateProfile();

        displayStudents();


        showMessage(
            "registrationMessage",
            "Face captured and registered successfully! ✅",
            "success"
        );


        stopRegistrationCamera();

    }

    catch (error) {

        console.error(
            "Face registration error:",
            error
        );


        showMessage(
            "registrationMessage",
            "Camera error: " +
            error.message,
            "error"
        );


        stopRegistrationCamera();
    }
}


// ------------------------------------------------------------
// WAIT FOR FACE
// ------------------------------------------------------------

async function waitForFaceDescriptor(
    video,
    timeout = 10000
) {

    const start =
        Date.now();


    while (
        Date.now() - start <
        timeout
    ) {

        const detection =
            await detectFaceDescriptor(
                video
            );


        if (detection) {

            return detection;
        }


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    500
                )
        );
    }


    return null;
}


// ------------------------------------------------------------
// DETECT FACE DESCRIPTOR
// ------------------------------------------------------------

async function detectFaceDescriptor(video) {

    if (
        typeof faceapi ===
        "undefined"
    ) {

        return null;
    }


    try {

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions(
                        {
                            inputSize: 224,
                            scoreThreshold: 0.5
                        }
                    )
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        if (!detection) {
            return null;
        }


        return detection.descriptor;

    }

    catch (error) {

        console.error(
            "Face detection error:",
            error
        );

        return null;
    }
}


// ------------------------------------------------------------
// STOP REGISTRATION CAMERA
// ------------------------------------------------------------

function stopRegistrationCamera() {

    if (registrationStream) {

        registrationStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        registrationStream =
            null;
    }


    const video =
        $("registrationCamera");


    if (video) {

        video.pause();

        video.srcObject =
            null;
    }


    if ($("registrationStatus")) {

        $("registrationStatus")
            .textContent =
            "Camera is OFF";
    }
}


// ------------------------------------------------------------
// FACE ATTENDANCE
// ------------------------------------------------------------

async function startFaceAttendance() {

    if (!currentUser) {

        showAttendanceResult(
            "Please login first.",
            "error"
        );

        return;
    }


    try {

        showAttendanceResult(
            "Loading face recognition...",
            "info"
        );


        const modelsReady =
            await loadFaceModels();


        if (!modelsReady) {

            showAttendanceResult(
                "Face recognition models could not be loaded.",
                "error"
            );

            return;
        }


        const video =
            $("attendanceCamera");


        attendanceStream =
            await navigator.mediaDevices.getUserMedia(
                {
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
                }
            );


        video.srcObject =
            attendanceStream;


        await video.play();


        $("attendanceStatus")
            .textContent =
            "Camera ON — detecting face...";


        showAttendanceResult(
            "Please look directly at the camera.",
            "info"
        );


        const descriptor =
            await waitForFaceDescriptor(
                video,
                10000
            );


        if (!descriptor) {

            showAttendanceResult(
                "No face detected. Please try again.",
                "error"
            );

            stopAttendanceCamera();

            return;
        }


        const student =
            findMatchingStudent(
                descriptor
            );


        if (!student) {

            showAttendanceResult(
                "Face not registered.",
                "error"
            );

            stopAttendanceCamera();

            return;
        }


        const result =
            markAttendance(student);


        stopAttendanceCamera();

        updateDashboard();


        if (result.marked) {

            showAttendanceResult(
                "Attendance marked successfully! ✅",
                "success"
            );


            showAttendancePopup(
                student,
                result.record
            );

        }

        else {

            showAttendanceResult(
                "Today's attendance is already marked. ✅",
                "info"
            );


            showAttendancePopup(
                student,
                result.record,
                true
            );
        }

    }

    catch (error) {

        console.error(
            "Attendance camera error:",
            error
        );


        showAttendanceResult(
            "Camera error: " +
            error.message,
            "error"
        );


        stopAttendanceCamera();
    }
}


// ------------------------------------------------------------
// MATCH FACE
// ------------------------------------------------------------

function findMatchingStudent(descriptor) {

    if (
        typeof faceapi ===
        "undefined"
    ) {

        return null;
    }


    let bestStudent =
        null;

    let bestDistance =
        Infinity;


    registeredStudents.forEach(
        student => {

            if (
                !student.faceDescriptor ||
                !Array.isArray(
                    student.faceDescriptor
                )
            ) {

                return;
            }


            try {

                const stored =
                    new Float32Array(
                        student.faceDescriptor
                    );


                const distance =
                    faceapi.euclideanDistance(
                        descriptor,
                        stored
                    );


                if (
                    distance <
                    bestDistance
                ) {

                    bestDistance =
                        distance;

                    bestStudent =
                        student;
                }

            }

            catch (error) {

                console.error(
                    "Face comparison error:",
                    error
                );
            }
        }
    );


    // 0.6 = normal face recognition threshold
    if (
        bestStudent &&
        bestDistance < 0.6
    ) {

        return bestStudent;
    }


    return null;
}


// ------------------------------------------------------------
// MARK ATTENDANCE
// ------------------------------------------------------------

function markAttendance(student) {

    const today =
        getToday();


    if (!attendanceData[student.id]) {

        attendanceData[student.id] =
            [];
    }


    const existing =
        attendanceData[student.id]
            .find(
                record =>
                    record.date === today
            );


    if (existing) {

        return {
            marked: false,
            record: existing
        };
    }


    const record = {

        date: today,

        time:
            new Date()
                .toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    }
                ),

        status:
            "Present"
    };


    attendanceData[student.id]
        .push(record);


    saveAttendance();


    return {
        marked: true,
        record: record
    };
}


// ------------------------------------------------------------
// ATTENDANCE RESULT
// ------------------------------------------------------------

function showAttendanceResult(
    message,
    type = "info"
) {

    const el =
        $("attendanceResult");

    if (!el) return;


    el.textContent =
        message;


    el.className =
        "attendance-result " +
        type;
}


// ------------------------------------------------------------
// ATTENDANCE POPUP
// ------------------------------------------------------------

function showAttendancePopup(
    student,
    record,
    alreadyMarked = false
) {

    const popup =
        $("attendancePopup");


    if (!popup) return;


    if ($("popupIcon")) {

        $("popupIcon")
            .textContent =
            alreadyMarked
                ? "ℹ️"
                : "✅";
    }


    if ($("popupTitle")) {

        $("popupTitle")
            .textContent =
            alreadyMarked
                ? "Already Marked"
                : "Attendance Marked!";
    }


    if ($("popupMessage")) {

        $("popupMessage")
            .textContent =
            alreadyMarked
                ? `${student.name}, today's attendance is already saved.`
                : `${student.name}, your attendance has been successfully saved at ${record.time}.`;
    }


    popup.style.display =
        "flex";
}


function closeAttendancePopup() {

    const popup =
        $("attendancePopup");

    if (popup) {

        popup.style.display =
            "none";
    }
}


// ------------------------------------------------------------
// STOP ATTENDANCE CAMERA
// ------------------------------------------------------------

function stopAttendanceCamera() {

    if (attendanceStream) {

        attendanceStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        attendanceStream =
            null;
    }


    const video =
        $("attendanceCamera");


    if (video) {

        video.pause();

        video.srcObject =
            null;
    }


    if ($("attendanceStatus")) {

        $("attendanceStatus")
            .textContent =
            "Camera is OFF";
    }
}


// ------------------------------------------------------------
// STUDENTS
// ------------------------------------------------------------

function displayStudents() {

    const container =
        $("studentList");


    if (!container) return;


    const search =
        (
            $("searchStudent")?.value ||
            ""
        )
            .toLowerCase()
            .trim();


    const students =
        registeredStudents.filter(
            student => {

                const name =
                    (
                        student.name ||
                        ""
                    )
                        .toLowerCase();

                const roll =
                    (
                        student.roll ||
                        ""
                    )
                        .toLowerCase();

                return (
                    name.includes(search) ||
                    roll.includes(search)
                );
            }
        );


    if (!students.length) {

        container.innerHTML =
            "<p>No registered students found.</p>";

        return;
    }


    container.innerHTML =
        students
            .map(
                student => `

                <div class="student-item">

                    <h3>
                        👤 ${escapeHTML(student.name)}
                    </h3>

                    <p>
                        🔢 Roll:
                        ${escapeHTML(
                            student.roll ||
                            "Not added"
                        )}
                    </p>

                    <p>
                        🏫 College:
                        ${escapeHTML(
                            student.college ||
                            "Not added"
                        )}
                    </p>

                    <p>
                        🎓 Department:
                        ${escapeHTML(
                            student.department ||
                            "Not added"
                        )}
                    </p>

                </div>

                `
            )
            .join("");
}


// ------------------------------------------------------------
// REGISTERED STUDENTS MODAL
// ------------------------------------------------------------

function showRegisteredStudents() {

    const modal =
        $("studentsModal");


    if (!modal) return;


    modal.style.display =
        "flex";


    const container =
        $("registeredStudentsList");


    if (!registeredStudents.length) {

        container.innerHTML =
            "<p>No students registered yet.</p>";

        return;
    }


    container.innerHTML =
        registeredStudents
            .map(
                student => `

                <div class="student-item">

                    <h3>
                        👤 ${escapeHTML(student.name)}
                    </h3>

                    <p>
                        📱 ${escapeHTML(student.mobile)}
                    </p>

                    <p>
                        📧 ${escapeHTML(
                            student.email ||
                            "Not added"
                        )}
                    </p>

                    <p>
                        🔢 ${escapeHTML(
                            student.roll ||
                            "Not added"
                        )}
                    </p>

                    <p>
                        🏫 ${escapeHTML(
                            student.college ||
                            "Not added"
                        )}
                    </p>

                </div>

                `
            )
            .join("");
}


function closeRegisteredStudents() {

    const modal =
        $("studentsModal");


    if (modal) {

        modal.style.display =
            "none";
    }
}


// ------------------------------------------------------------
// MY ATTENDANCE
// ------------------------------------------------------------

function showCheckAttendance() {

    const modal =
        $("attendanceCheckModal");


    if (!modal) return;


    modal.style.display =
        "flex";


    if (!currentUser) return;


    const records =
        attendanceData[currentUser.id] ||
        [];


    const presentDays =
        records.filter(
            record =>
                record.status === "Present"
        ).length;


    if ($("attendanceTotalDays"))
        $("attendanceTotalDays")
            .textContent =
            records.length;


    if ($("attendancePresentDays"))
        $("attendancePresentDays")
            .textContent =
            presentDays;


    if ($("attendanceAbsentDays"))
        $("attendanceAbsentDays")
            .textContent =
            0;


    const history =
        $("attendanceHistory");


    if (!records.length) {

        history.innerHTML =
            "<p>No attendance records yet.</p>";

        return;
    }


    history.innerHTML =
        records
            .slice()
            .reverse()
            .map(
                record => `

                <div class="attendance-history-item">

                    <strong>
                        📅 ${escapeHTML(record.date)}
                    </strong>

                    <span>
                        ${escapeHTML(record.time)}
                    </span>

                    <b>
                        ✅ ${escapeHTML(record.status)}
                    </b>

                </div>

                `
            )
            .join("");
}


function closeCheckAttendance() {

    const modal =
        $("attendanceCheckModal");


    if (modal) {

        modal.style.display =
            "none";
    }
}


// ------------------------------------------------------------
// EDIT DETAILS
// ------------------------------------------------------------

function openEditDetails() {

    if (!currentUser) return;


    const student =
        registeredStudents.find(
            s =>
                s.id ===
                currentUser.id
        );


    if (!student) return;


    $("editName").value =
        student.name || "";

    $("editRoll").value =
        student.roll || "";

    $("editCollege").value =
        student.college || "";

    $("editDepartment").value =
        student.department || "";

    $("editMobile").value =
        student.mobile || "";

    $("editEmail").value =
        student.email || "";


    $("editDetailsModal").style.display =
        "flex";
}


function closeEditDetails() {

    $("editDetailsModal").style.display =
        "none";
}


function saveEditedDetails() {

    if (!currentUser) return;


    const student =
        registeredStudents.find(
            s =>
                s.id ===
                currentUser.id
        );


    if (!student) return;


    const name =
        $("editName").value.trim();

    const roll =
        $("editRoll").value.trim();

    const college =
        $("editCollege").value.trim();

    const department =
        $("editDepartment").value.trim();

    const mobile =
        cleanMobile(
            $("editMobile").value
        );

    const email =
        $("editEmail").value.trim();


    if (!name) {

        alert(
            "Name is required."
        );

        return;
    }


    if (!validMobile(mobile)) {

        alert(
            "Enter a valid mobile number."
        );

        return;
    }


    if (
        email &&
        !validEmail(email)
    ) {

        alert(
            "Enter a valid email."
        );

        return;
    }


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


    currentUser =
        student;


    saveStudents();


    closeEditDetails();

    fillFaceRegistrationFields(
        student
    );

    updateProfile();

    displayStudents();

    updateDashboard();


    alert(
        "Details updated successfully. ✅"
    );
}


// ------------------------------------------------------------
// MOBILE / EMAIL UPDATE
// ------------------------------------------------------------

function openMobileUpdate() {
    openEditDetails();
}

function openEmailUpdate() {
    openEditDetails();
}


// ------------------------------------------------------------
// ADMIN
// ------------------------------------------------------------

function showAdminDetails() {

    const modal =
        $("adminModal");

    if (modal) {

        modal.style.display =
            "flex";
    }
}


function closeAdminDetails() {

    const modal =
        $("adminModal");

    if (modal) {

        modal.style.display =
            "none";
    }
}


// ------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------

function logoutUser() {

    stopRegistrationCamera();

    stopAttendanceCamera();


    currentUser =
        null;

    window.currentStudentId =
        null;


    showPage(
        "loginPage"
    );


    if ($("loginName"))
        $("loginName").value =
            "";

    if ($("loginIdentity"))
        $("loginIdentity").value =
            "";

    if ($("loginPin"))
        $("loginPin").value =
            "";


    showMessage(
        "loginMessage",
        "Logged out successfully.",
        "success"
    );
}


// ------------------------------------------------------------
// WINDOW FUNCTIONS
// ------------------------------------------------------------

window.openCreateAccount =
    openCreateAccount;

window.createAccount =
    createAccount;

window.loginUser =
    loginUser;

window.openForgotPin =
    openForgotPin;

window.resetPIN =
    resetPIN;

window.showDashboardHome =
    showDashboardHome;

window.showFaceRegistration =
    showFaceRegistration;

window.showAttendanceSection =
    showAttendanceSection;

window.showStudentsSection =
    showStudentsSection;

window.startAutomaticFaceRegistration =
    startAutomaticFaceRegistration;

window.startFaceAttendance =
    startFaceAttendance;

window.showRegisteredStudents =
    showRegisteredStudents;

window.closeRegisteredStudents =
    closeRegisteredStudents;

window.showCheckAttendance =
    showCheckAttendance;

window.closeCheckAttendance =
    closeCheckAttendance;

window.openEditDetails =
    openEditDetails;

window.closeEditDetails =
    closeEditDetails;

window.saveEditedDetails =
    saveEditedDetails;

window.openMobileUpdate =
    openMobileUpdate;

window.openEmailUpdate =
    openEmailUpdate;

window.showAdminDetails =
    showAdminDetails;

window.closeAdminDetails =
    closeAdminDetails;

window.logoutUser =
    logoutUser;

window.displayStudents =
    displayStudents;

window.closeAttendancePopup =
    closeAttendancePopup;


// ------------------------------------------------------------
// DOM READY
// ------------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // LOGIN
        $("loginButton")
            ?.addEventListener(
                "click",
                loginUser
            );


        // CREATE ACCOUNT
        $("createAccountButton")
            ?.addEventListener(
                "click",
                openCreateAccount
            );


        $("createAccountSubmit")
            ?.addEventListener(
                "click",
                createAccount
            );


        $("backToLoginButton")
            ?.addEventListener(
                "click",
                () => {

                    showPage(
                        "loginPage"
                    );
                }
            );


        // FORGOT PIN
        $("forgotPinButton")
            ?.addEventListener(
                "click",
                openForgotPin
            );


        $("resetPinButton")
            ?.addEventListener(
                "click",
                resetPIN
            );


        $("forgotBackButton")
            ?.addEventListener(
                "click",
                () => {

                    showPage(
                        "loginPage"
                    );
                }
            );


        // FACE REGISTRATION
        $("startFaceRegistrationButton")
            ?.addEventListener(
                "click",
                startAutomaticFaceRegistration
            );


        // ATTENDANCE
        $("startFaceAttendanceButton")
            ?.addEventListener(
                "click",
                startFaceAttendance
            );


        // DASHBOARD MENU
        $("dashboardMenuButton")
            ?.addEventListener(
                "click",
                showDashboardHome
            );


        $("faceRegistrationMenuButton")
            ?.addEventListener(
                "click",
                showFaceRegistration
            );


        $("attendanceMenuButton")
            ?.addEventListener(
                "click",
                showAttendanceSection
            );


        $("studentsMenuButton")
            ?.addEventListener(
                "click",
                showStudentsSection
            );


        $("checkAttendanceMenuButton")
            ?.addEventListener(
                "click",
                showCheckAttendance
            );


        $("editDetailsMenuButton")
            ?.addEventListener(
                "click",
                openEditDetails
            );


        $("logoutButton")
            ?.addEventListener(
                "click",
                logoutUser
            );


        // QUICK ACTIONS
        $("quickFaceRegistration")
            ?.addEventListener(
                "click",
                showFaceRegistration
            );


        $("quickAttendance")
            ?.addEventListener(
                "click",
                showAttendanceSection
            );


        $("quickCheckAttendance")
            ?.addEventListener(
                "click",
                showCheckAttendance
            );


        // MODALS
        $("closeAttendancePopup")
            ?.addEventListener(
                "click",
                closeAttendancePopup
            );


        $("closeStudentsModal")
            ?.addEventListener(
                "click",
                closeRegisteredStudents
            );


        $("closeCheckAttendanceModal")
            ?.addEventListener(
                "click",
                closeCheckAttendance
            );


        $("closeEditDetailsModal")
            ?.addEventListener(
                "click",
                closeEditDetails
            );


        // STUDENT SEARCH
        $("searchStudent")
            ?.addEventListener(
                "input",
                displayStudents
            );


        // ENTER KEY LOGIN
        [
            "loginName",
            "loginIdentity",
            "loginPin"
        ]
            .forEach(
                id => {

                    $(id)
                        ?.addEventListener(
                            "keydown",
                            event => {

                                if (
                                    event.key ===
                                    "Enter"
                                ) {

                                    loginUser();
                                }
                            }
                        );
                }
            );


        updateDate();


        setInterval(
            updateDate,
            60000
        );


        console.log(
            "Smart Attendance System loaded successfully ✅"
        );
    }
);
```

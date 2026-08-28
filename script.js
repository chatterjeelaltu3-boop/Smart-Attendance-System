// ============================================================
// SMART ATTENDANCE SYSTEM
// script.js
// OTP FREE VERSION
// ============================================================

// ============================================================
// GLOBAL VARIABLES
// ============================================================

let currentUser = null;

let registrationStream = null;
let attendanceStream = null;

let faceRegistrationRunning = false;
let faceAttendanceRunning = false;

let registeredStudents =
    JSON.parse(localStorage.getItem("registeredStudents") || "[]");

let attendanceData =
    JSON.parse(localStorage.getItem("attendanceData") || "{}");


// ============================================================
// HELPER
// ============================================================

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
    return /^\d{4}$/.test(pin);
}


function validEmail(email) {
    if (!email) return true;

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


function todayDate() {
    return new Date()
        .toISOString()
        .slice(0, 10);
}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(id, message, type = "info") {

    const el = $(id);

    if (!el) return;

    el.textContent = message;

    el.className =
        "auth-message " + type;
}


// ============================================================
// POPUP
// ============================================================

function showPopup(title, message, type = "success") {

    let popup =
        $("smartPopup");

    if (!popup) {

        popup =
            document.createElement("div");

        popup.id =
            "smartPopup";

        popup.innerHTML = `

            <div class="smart-popup-overlay">

                <div class="smart-popup-box">

                    <div
                        id="popupIcon"
                        class="smart-popup-icon">
                    </div>

                    <h2 id="popupTitle"></h2>

                    <p id="popupMessage"></p>

                    <button
                        id="popupCloseButton">
                        OK
                    </button>

                </div>

            </div>

        `;

        document.body.appendChild(popup);

        $("popupCloseButton")
            ?.addEventListener(
                "click",
                closePopup
            );
    }


    $("popupTitle").textContent =
        title;

    $("popupMessage").textContent =
        message;


    if (type === "success") {

        $("popupIcon").textContent =
            "✓";

    } else if (type === "error") {

        $("popupIcon").textContent =
            "✕";

    } else {

        $("popupIcon").textContent =
            "ℹ";
    }


    popup.style.display =
        "block";
}


function closePopup() {

    const popup =
        $("smartPopup");

    if (popup) {

        popup.style.display =
            "none";
    }
}


// ============================================================
// PAGE NAVIGATION
// ============================================================

function showPage(pageId) {

    const pages = [

        "loginPage",
        "createAccountPage",
        "forgotPinPage",
        "dashboardPage"

    ];


    pages.forEach(id => {

        const page =
            $(id);

        if (!page) return;


        page.style.display =
            id === pageId
                ? "block"
                : "none";
    });
}


// ============================================================
// CREATE ACCOUNT
// ============================================================

function openCreateAccount() {

    showPage(
        "createAccountPage"
    );


    if ($("createOtpSection")) {

        $("createOtpSection")
            .style.display =
            "none";
    }


    showMessage(
        "createMessage",
        ""
    );


    $("createName")?.focus();
}


// ============================================================
// CREATE ACCOUNT
// ============================================================

function createAccount() {

    const name =
        $("createName")
            ?.value
            .trim();


    const mobile =
        cleanMobile(
            $("createMobile")
                ?.value
        );


    const email =
        $("createEmail")
            ?.value
            .trim();


    const pin =
        $("createPin")
            ?.value
            .trim();


    const confirmPin =
        $("confirmPin")
            ?.value
            .trim();


    // -------------------------
    // VALIDATION
    // -------------------------

    if (!name) {

        showMessage(
            "createMessage",
            "Please enter your name.",
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


    if (!email) {

        showMessage(
            "createMessage",
            "Please enter your email address.",
            "error"
        );

        return;
    }


    if (!validEmail(email)) {

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


    // -------------------------
    // DUPLICATE MOBILE
    // -------------------------

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


    // -------------------------
    // DUPLICATE EMAIL
    // -------------------------

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


    // -------------------------
    // CREATE STUDENT
    // -------------------------

    const student = {

        id:
            "student_" +
            Date.now(),

        name:
            name,

        mobile:
            mobile,

        email:
            email,

        pin:
            pin,

        roll:
            "",

        college:
            "",

        department:
            "",

        faceDescriptor:
            null,

        registeredAt:
            new Date().toISOString()
    };


    registeredStudents.push(
        student
    );


    saveStudents();


    currentUser =
        student;


    window.currentStudentId =
        student.id;


    showMessage(
        "createMessage",
        "Account created successfully! Opening dashboard...",
        "success"
    );


    showPopup(
        "Account Created!",
        "Your Smart Attendance account has been created successfully.",
        "success"
    );


    setTimeout(() => {

        closePopup();

        openDashboard(
            student
        );

    }, 1200);
}


// ============================================================
// BACK TO LOGIN
// ============================================================

function backToLogin() {

    showPage(
        "loginPage"
    );

    showMessage(
        "loginMessage",
        ""
    );
}


function backFromForgot() {

    showPage(
        "loginPage"
    );

    showMessage(
        "forgotMessage",
        ""
    );
}


// ============================================================
// LOGIN
// ============================================================

function loginUser() {

    const loginValue =
        $("loginMobile")
            ?.value
            .trim();


    const pin =
        $("loginPin")
            ?.value
            .trim();


    if (!loginValue) {

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
        cleanMobile(
            loginValue
        );


    const isMobile =
        validMobile(
            mobile
        );


    const student =
        registeredStudents.find(
            s => {

                const mobileMatch =
                    isMobile &&
                    s.mobile === mobile;


                const emailMatch =
                    s.email &&
                    s.email.toLowerCase() ===
                    loginValue.toLowerCase();


                return (
                    mobileMatch ||
                    emailMatch
                );
            }
        );


    if (!student) {

        showMessage(
            "loginMessage",
            "Mobile number or email is not registered.",
            "error"
        );

        return;
    }


    if (student.pin !== pin) {

        showMessage(
            "loginMessage",
            "Incorrect PIN.",
            "error"
        );

        return;
    }


    currentUser =
        student;


    window.currentStudentId =
        student.id;


    showMessage(
        "loginMessage",
        "Login successful! ✅",
        "success"
    );


    setTimeout(() => {

        openDashboard(
            student
        );

    }, 500);
}


// ============================================================
// FORGOT PIN
// ============================================================

function openForgotPin() {

    showPage(
        "forgotPinPage"
    );

    showMessage(
        "forgotMessage",
        ""
    );
}


// ============================================================
// RESET PIN WITHOUT OTP
// ============================================================

function resetPIN() {

    const mobile =
        cleanMobile(
            $("forgotMobile")
                ?.value
        );


    const email =
        $("forgotEmail")
            ?.value
            .trim();


    const newPin =
        $("newPin")
            ?.value
            .trim();


    const confirmNewPin =
        $("confirmNewPin")
            ?.value
            .trim();


    if (
        !mobile &&
        !email
    ) {

        showMessage(
            "forgotMessage",
            "Enter your registered mobile number or email.",
            "error"
        );

        return;
    }


    if (!validPin(newPin)) {

        showMessage(
            "forgotMessage",
            "New PIN must contain exactly 4 digits.",
            "error"
        );

        return;
    }


    if (
        newPin !==
        confirmNewPin
    ) {

        showMessage(
            "forgotMessage",
            "New PINs do not match.",
            "error"
        );

        return;
    }


    const student =
        registeredStudents.find(
            s => {

                const mobileMatch =
                    mobile &&
                    s.mobile === mobile;


                const emailMatch =
                    email &&
                    s.email &&
                    s.email.toLowerCase() ===
                    email.toLowerCase();


                return (
                    mobileMatch ||
                    emailMatch
                );
            }
        );


    if (!student) {

        showMessage(
            "forgotMessage",
            "No account found with these details.",
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


    showPopup(
        "PIN Updated!",
        "Your 4-digit PIN has been changed successfully.",
        "success"
    );


    setTimeout(() => {

        closePopup();

        showPage(
            "loginPage"
        );

    }, 1200);
}


// ============================================================
// DASHBOARD
// ============================================================

function openDashboard(
    student
) {

    showPage(
        "dashboardPage"
    );


    currentUser =
        student;


    fillFaceRegistrationFields(
        student
    );


    updateDashboard();

    updateDate();

    displayStudents();
}


// ============================================================
// FACE REGISTRATION FIELDS
// ============================================================

function fillFaceRegistrationFields(
    student
) {

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


// ============================================================
// DATE
// ============================================================

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


// ============================================================
// DASHBOARD STATS
// ============================================================

function updateDashboard() {

    const total =
        registeredStudents.length;


    const today =
        todayDate();


    let present =
        0;


    registeredStudents.forEach(
        student => {

            const records =
                attendanceData[
                    student.id
                ] || [];


            const markedToday =
                records.some(
                    record =>
                        record.date === today &&
                        record.status === "Present"
                );


            if (markedToday) {

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


// ============================================================
// FACE API CHECK
// ============================================================

function faceApiReady() {

    return (
        typeof faceapi !==
        "undefined"
    );
}


// ============================================================
// AUTOMATIC FACE DETECTION
// ============================================================

async function detectFaceDescriptor(
    video
) {

    if (!faceApiReady()) {

        console.error(
            "face-api.js is not loaded."
        );

        return null;
    }


    try {

        const detection =
            await faceapi
                .detectSingleFace(
                    video
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


// ============================================================
// START AUTOMATIC FACE REGISTRATION
// ============================================================

async function startAutomaticFaceRegistration() {

    if (!currentUser) {

        showMessage(
            "registrationMessage",
            "Please login first.",
            "error"
        );

        return;
    }


    if (faceRegistrationRunning) {

        return;
    }


    const name =
        $("faceName")
            ?.value
            .trim();


    const roll =
        $("faceRoll")
            ?.value
            .trim();


    const college =
        $("collegeName")
            ?.value
            .trim();


    const department =
        $("departmentName")
            ?.value
            .trim();


    const mobile =
        cleanMobile(
            $("faceMobile")
                ?.value
        );


    const email =
        $("faceEmail")
            ?.value
            .trim();


    // -------------------------
    // VALIDATION
    // -------------------------

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


    if (!faceApiReady()) {

        showMessage(
            "registrationMessage",
            "Face recognition system is not loaded. Please check face-api.js.",
            "error"
        );

        return;
    }


    try {

        faceRegistrationRunning =
            true;


        const video =
            $("registrationCamera");


        if (!video) {

            throw new Error(
                "Registration camera element not found."
            );
        }


        registrationStream =
            await navigator
                .mediaDevices
                .getUserMedia(
                    {
                        video: {
                            facingMode: "user"
                        },

                        audio: false
                    }
                );


        video.srcObject =
            registrationStream;


        video.setAttribute(
            "autoplay",
            ""
        );


        video.setAttribute(
            "playsinline",
            ""
        );


        await video.play();


        if ($("registrationStatus")) {

            $("registrationStatus")
                .textContent =
                "📷 Camera ON — detecting your face...";
        }


        showMessage(
            "registrationMessage",
            "Camera started. Please look directly at the camera.",
            "info"
        );


        // -------------------------
        // AUTOMATIC CAPTURE
        // -------------------------

        let descriptor =
            null;


        for (
            let attempt = 0;
            attempt < 10;
            attempt++
        ) {

            await wait(500);


            descriptor =
                await detectFaceDescriptor(
                    video
                );


            if (descriptor) {

                break;
            }


            if ($("registrationMessage")) {

                $("registrationMessage")
                    .textContent =
                    "Looking for your face... " +
                    (attempt + 1) +
                    "/10";
            }
        }


        if (!descriptor) {

            showMessage(
                "registrationMessage",
                "Face not detected clearly. Please try again.",
                "error"
            );


            stopRegistrationCamera();

            faceRegistrationRunning =
                false;

            return;
        }


        // -------------------------
        // SAVE FACE
        // -------------------------

        const student =
            registeredStudents.find(
                s =>
                    s.id ===
                    currentUser.id
            );


        if (!student) {

            throw new Error(
                "Student account not found."
            );
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
            Array.from(
                descriptor
            );


        saveStudents();


        currentUser =
            student;


        fillFaceRegistrationFields(
            student
        );


        showMessage(
            "registrationMessage",
            "Face captured automatically and registered successfully ✅",
            "success"
        );


        showPopup(
            "Face Registered!",
            name +
            "'s face has been captured successfully.",
            "success"
        );


        stopRegistrationCamera();


        updateDashboard();

        displayStudents();


    }

    catch (error) {

        console.error(
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


    faceRegistrationRunning =
        false;
}


// ============================================================
// WAIT
// ============================================================

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


// ============================================================
// STOP REGISTRATION CAMERA
// ============================================================

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

        video.srcObject =
            null;
    }


    if ($("registrationStatus")) {

        $("registrationStatus")
            .textContent =
            "Camera is OFF";
    }


    faceRegistrationRunning =
        false;
}


// ============================================================
// FACE ATTENDANCE
// ============================================================

async function startFaceAttendance() {

    if (!currentUser) {

        showMessage(
            "attendanceResult",
            "Please login first.",
            "error"
        );

        return;
    }


    if (faceAttendanceRunning) {

        return;
    }


    if (!faceApiReady()) {

        showMessage(
            "attendanceResult",
            "Face recognition system is not loaded.",
            "error"
        );

        return;
    }


    try {

        faceAttendanceRunning =
            true;


        const video =
            $("attendanceCamera");


        if (!video) {

            throw new Error(
                "Attendance camera element not found."
            );
        }


        attendanceStream =
            await navigator
                .mediaDevices
                .getUserMedia(
                    {
                        video: {
                            facingMode: "user"
                        },

                        audio: false
                    }
                );


        video.srcObject =
            attendanceStream;


        video.setAttribute(
            "autoplay",
            ""
        );


        video.setAttribute(
            "playsinline",
            ""
        );


        await video.play();


        if ($("attendanceStatus")) {

            $("attendanceStatus")
                .textContent =
                "📷 Camera ON — automatically detecting face...";
        }


        showMessage(
            "attendanceResult",
            "Please look at the camera...",
            "info"
        );


        // -------------------------
        // AUTOMATIC FACE CAPTURE
        // -------------------------

        let descriptor =
            null;


        for (
            let attempt = 0;
            attempt < 12;
            attempt++
        ) {

            await wait(500);


            descriptor =
                await detectFaceDescriptor(
                    video
                );


            if (descriptor) {

                break;
            }


            if ($("attendanceResult")) {

                $("attendanceResult")
                    .textContent =
                    "Detecting face... " +
                    (attempt + 1) +
                    "/12";
            }
        }


        if (!descriptor) {

            showMessage(
                "attendanceResult",
                "No clear face detected. Please try again.",
                "error"
            );


            stopAttendanceCamera();

            faceAttendanceRunning =
                false;

            return;
        }


        // -------------------------
        // FIND STUDENT
        // -------------------------

        const student =
            findMatchingStudent(
                descriptor
            );


        if (!student) {

            showMessage(
                "attendanceResult",
                "Face not registered. Please register your face first.",
                "error"
            );


            showPopup(
                "Face Not Recognized",
                "This face is not registered in the Smart Attendance system.",
                "error"
            );


            stopAttendanceCamera();

            faceAttendanceRunning =
                false;

            return;
        }


        // -------------------------
        // CHECK CURRENT USER
        // -------------------------

        const marked =
            markAttendance(
                student
            );


        if (marked) {

            const time =
                new Date()
                    .toLocaleTimeString(
                        "en-IN"
                    );


            showMessage(
                "attendanceResult",
                "Attendance marked successfully ✅",
                "success"
            );


            showPopup(
                "Attendance Marked! 🎉",
                "Name: " +
                student.name +
                "\nRoll: " +
                (student.roll || "Not added") +
                "\nTime: " +
                time,
                "success"
            );


            // Optional email notification
            createAttendanceEmail(
                student
            );

        } else {

            showMessage(
                "attendanceResult",
                "Today's attendance is already marked ✅",
                "info"
            );


            showPopup(
                "Already Present",
                student.name +
                " has already marked attendance today.",
                "info"
            );
        }


        stopAttendanceCamera();


        updateDashboard();


        faceAttendanceRunning =
            false;

    }

    catch (error) {

        console.error(
            error
        );


        showMessage(
            "attendanceResult",
            "Camera error: " +
            error.message,
            "error"
        );


        stopAttendanceCamera();


        faceAttendanceRunning =
            false;
    }
}


// ============================================================
// MATCH STUDENT FACE
// ============================================================

function findMatchingStudent(
    descriptor
) {

    if (!faceApiReady()) {

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
    );


    // Lower = better match
    // 0.6 is normal threshold

    if (
        bestStudent &&
        bestDistance < 0.6
    ) {

        return bestStudent;
    }


    return null;
}


// ============================================================
// MARK ATTENDANCE
// ============================================================

function markAttendance(
    student
) {

    const today =
        todayDate();


    if (
        !attendanceData[
            student.id
        ]
    ) {

        attendanceData[
            student.id
        ] = [];
    }


    const alreadyMarked =
        attendanceData[
            student.id
        ].some(
            record =>
                record.date === today &&
                record.status === "Present"
        );


    if (alreadyMarked) {

        return false;
    }


    const record = {

        date:
            today,

        time:
            new Date()
                .toLocaleTimeString(
                    "en-IN"
                ),

        status:
            "Present",

        studentName:
            student.name,

        roll:
            student.roll || "",

        college:
            student.college || "",

        department:
            student.department || ""
    };


    attendanceData[
        student.id
    ].push(
        record
    );


    saveAttendance();


    return true;
}


// ============================================================
// STOP ATTENDANCE CAMERA
// ============================================================

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

        video.srcObject =
            null;
    }


    if ($("attendanceStatus")) {

        $("attendanceStatus")
            .textContent =
            "Camera is OFF";
    }


    faceAttendanceRunning =
        false;
}


// ============================================================
// ATTENDANCE EMAIL
// ============================================================

function createAttendanceEmail(
    student
) {

    if (!student.email) {

        return;
    }


    // This prepares an email.
    // It does NOT automatically send email.
    // A real email service/backend is needed
    // for automatic sending.


    const subject =
        encodeURIComponent(
            "Smart Attendance - Attendance Marked"
        );


    const body =
        encodeURIComponent(
            "Hello " +
            student.name +
            ",\n\n" +
            "Your attendance has been marked successfully.\n\n" +
            "Date: " +
            todayDate() +
            "\n" +
            "Time: " +
            new Date()
                .toLocaleTimeString(
                    "en-IN"
                ) +
            "\n\n" +
            "Smart Attendance System"
        );


    window.lastAttendanceEmail =
        "mailto:" +
        student.email +
        "?subject=" +
        subject +
        "&body=" +
        body;
}


// ============================================================
// STUDENT LIST
// ============================================================

function displayStudents() {

    const container =
        $("studentList");


    if (!container) return;


    const search =
        (
            $("searchStudent")
                ?.value ||
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
                        👤 ${escapeHTML(
                            student.name
                        )}
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

                    <p>
                        📱 ${escapeHTML(
                            student.mobile
                        )}
                    </p>

                    <p>
                        📧 ${escapeHTML(
                            student.email ||
                            "Not added"
                        )}
                    </p>

                </div>
            `
            )
            .join("");
}


// ============================================================
// REGISTERED STUDENTS MODAL
// ============================================================

function showRegisteredStudents() {

    const modal =
        $("studentsModal");


    if (!modal) return;


    modal.style.display =
        "flex";


    const container =
        $("registeredStudentsList");


    if (!container) return;


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
                        👤 ${escapeHTML(
                            student.name
                        )}
                    </h3>

                    <p>
                        📱 ${escapeHTML(
                            student.mobile
                        )}
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


// ============================================================
// CHECK ATTENDANCE
// ============================================================

function showCheckAttendance() {

    const modal =
        $("attendanceCheckModal");


    if (!modal) return;


    modal.style.display =
        "flex";


    if (!currentUser) return;


    const records =
        attendanceData[
            currentUser.id
        ] || [];


    const presentDays =
        records.filter(
            record =>
                record.status ===
                "Present"
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


    if (!history) return;


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
                        📅 ${escapeHTML(
                            record.date
                        )}
                    </strong>

                    <span>
                        ⏰ ${escapeHTML(
                            record.time
                        )}
                    </span>

                    <b>
                        ✅ ${escapeHTML(
                            record.status
                        )}
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


// ============================================================
// MENU
// ============================================================

function toggleMenu() {

    const menu =
        $("mainMenu");


    if (!menu) return;


    menu.classList.toggle(
        "show"
    );
}


// ============================================================
// EDIT DETAILS
// ============================================================

function openEditDetails() {

    if (!currentUser) return;


    const student =
        registeredStudents.find(
            s =>
                s.id ===
                currentUser.id
        );


    if (!student) return;


    if ($("editName"))
        $("editName").value =
            student.name || "";


    if ($("editRoll"))
        $("editRoll").value =
            student.roll || "";


    if ($("editCollege"))
        $("editCollege").value =
            student.college || "";


    if ($("editDepartment"))
        $("editDepartment").value =
            student.department || "";


    if ($("editMobile"))
        $("editMobile").value =
            student.mobile || "";


    if ($("editEmail"))
        $("editEmail").value =
            student.email || "";


    if ($("editDetailsModal"))
        $("editDetailsModal")
            .style.display =
            "flex";
}


function closeEditDetails() {

    if ($("editDetailsModal")) {

        $("editDetailsModal")
            .style.display =
            "none";
    }
}


// ============================================================
// SAVE EDITED DETAILS
// ============================================================

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
        $("editName")
            ?.value
            .trim();


    const roll =
        $("editRoll")
            ?.value
            .trim();


    const college =
        $("editCollege")
            ?.value
            .trim();


    const department =
        $("editDepartment")
            ?.value
            .trim();


    const mobile =
        cleanMobile(
            $("editMobile")
                ?.value
        );


    const email =
        $("editEmail")
            ?.value
            .trim();


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


    displayStudents();

    updateDashboard();


    showPopup(
        "Details Updated!",
        "Your student details have been updated successfully.",
        "success"
    );
}


// ============================================================
// MOBILE / EMAIL UPDATE
// ============================================================

function openMobileUpdate() {

    openEditDetails();
}


function openEmailUpdate() {

    openEditDetails();
}


// ============================================================
// ADMIN
// ============================================================

function showAdminDetails() {

    if ($("adminModal"))
        $("adminModal")
            .style.display =
            "flex";
}


function closeAdminDetails() {

    if ($("adminModal"))
        $("adminModal")
            .style.display =
            "none";
}


// ============================================================
// LOGOUT
// ============================================================

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


    if ($("loginMobile"))
        $("loginMobile")
            .value =
            "";


    if ($("loginPin"))
        $("loginPin")
            .value =
            "";


    showMessage(
        "loginMessage",
        "Logged out successfully.",
        "success"
    );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(
        value || ""
    )
        .replace(
            /[&<>"']/g,
            char => {

                const map = {

                    "&":
                        "&amp;",

                    "<":
                        "&lt;",

                    ">":
                        "&gt;",

                    '"':
                        "&quot;",

                    "'":
                        "&#039;"
                };


                return map[
                    char
                ];
            }
        );
}


// ============================================================
// WINDOW FUNCTIONS
// ============================================================

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

window.backToLogin =
    backToLogin;

window.backFromForgot =
    backFromForgot;

window.toggleMenu =
    toggleMenu;

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

window.showRegisteredStudents =
    showRegisteredStudents;

window.closeRegisteredStudents =
    closeRegisteredStudents;

window.showCheckAttendance =
    showCheckAttendance;

window.closeCheckAttendance =
    closeCheckAttendance;

window.showAdminDetails =
    showAdminDetails;

window.closeAdminDetails =
    closeAdminDetails;

window.logoutUser =
    logoutUser;

window.startAutomaticFaceRegistration =
    startAutomaticFaceRegistration;

window.startFaceAttendance =
    startFaceAttendance;

window.stopRegistrationCamera =
    stopRegistrationCamera;

window.stopAttendanceCamera =
    stopAttendanceCamera;

window.displayStudents =
    displayStudents;

window.closePopup =
    closePopup;


// ============================================================
// DOM READY
// ============================================================

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


        // NEW CREATE ACCOUNT BUTTON

        $("createButton")
            ?.addEventListener(
                "click",
                createAccount
            );


        $("createAccountSubmit")
            ?.addEventListener(
                "click",
                createAccount
            );


        // BACK

        $("backToLoginButton")
            ?.addEventListener(
                "click",
                backToLogin
            );


        // FORGOT PIN

        $("forgotPinButton")
            ?.addEventListener(
                "click",
                openForgotPin
            );


        $("forgotBackButton")
            ?.addEventListener(
                "click",
                backFromForgot
            );


        $("resetPinButton")
            ?.addEventListener(
                "click",
                resetPIN
            );


        // SEARCH

        $("searchStudent")
            ?.addEventListener(
                "input",
                displayStudents
            );


        // ENTER KEY LOGIN

        [
            "loginMobile",
            "loginPin"
        ].forEach(
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


        // ENTER KEY CREATE

        [
            "createName",
            "createMobile",
            "createEmail",
            "createPin",
            "confirmPin"
        ].forEach(
            id => {

                $(id)
                    ?.addEventListener(
                        "keydown",
                        event => {

                            if (
                                event.key ===
                                "Enter"
                            ) {

                                createAccount();
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


// ============================================================
// PAGE LOAD
// ============================================================

window.addEventListener(
    "load",
    () => {

        updateDashboard();

        updateDate();
    }
);

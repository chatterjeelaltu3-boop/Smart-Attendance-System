// ============================================================
// SMART ATTENDANCE SYSTEM
// script.js
// ============================================================

import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    sendEmailVerification,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let confirmationResult = null;
let forgotConfirmationResult = null;

let currentUser = null;

let registrationStream = null;
let attendanceStream = null;

let registeredStudents =
    JSON.parse(localStorage.getItem("registeredStudents") || "[]");

let attendanceData =
    JSON.parse(localStorage.getItem("attendanceData") || "{}");


// ============================================================
// FIREBASE AUTH
// ============================================================

const auth = window.firebaseAuth;


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function $(id) {
    return document.getElementById(id);
}

function showMessage(id, message, type = "info") {

    const el = $(id);

    if (!el) return;

    el.textContent = message;

    el.className = "auth-message " + type;
}

function cleanMobile(mobile) {

    return String(mobile || "")
        .replace(/\D/g, "")
        .slice(-10);
}

function getPhoneNumber(mobile) {

    const number = cleanMobile(mobile);

    return "+91" + number;
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


// ============================================================
// SAVE STUDENTS
// ============================================================

function saveStudents() {

    localStorage.setItem(
        "registeredStudents",
        JSON.stringify(registeredStudents)
    );
}


// ============================================================
// SAVE ATTENDANCE
// ============================================================

function saveAttendance() {

    localStorage.setItem(
        "attendanceData",
        JSON.stringify(attendanceData)
    );
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

        const page = $(id);

        if (page) {
            page.style.display =
                id === pageId ? "block" : "none";
        }

    });
}


// ============================================================
// CREATE ACCOUNT PAGE
// ============================================================

function openCreateAccount() {

    showPage("createAccountPage");

    $("createOtpSection").style.display = "none";

    showMessage("createMessage", "");

    $("createName").focus();
}


// ============================================================
// BACK TO LOGIN
// ============================================================

function backToLogin() {

    showPage("loginPage");

    showMessage("loginMessage", "");
}

function backFromForgot() {

    showPage("loginPage");

    showMessage("forgotMessage", "");
}


// ============================================================
// CREATE ACCOUNT
// ============================================================

async function sendCreateOTP() {

    const name =
        $("createName").value.trim();

    const mobile =
        cleanMobile($("createMobile").value);

    const email =
        $("createEmail").value.trim();

    const pin =
        $("createPin").value.trim();

    const confirmPin =
        $("confirmPin").value.trim();


    // VALIDATION

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


    // CHECK DUPLICATE MOBILE

    const existingMobile =
        registeredStudents.find(
            student =>
                student.mobile === mobile
        );

    if (existingMobile) {

        showMessage(
            "createMessage",
            "This mobile number is already registered.",
            "error"
        );

        return;
    }


    // CHECK DUPLICATE EMAIL

    if (email) {

        const existingEmail =
            registeredStudents.find(
                student =>
                    student.email &&
                    student.email.toLowerCase() ===
                    email.toLowerCase()
            );

        if (existingEmail) {

            showMessage(
                "createMessage",
                "This email is already registered.",
                "error"
            );

            return;
        }
    }


    if (!auth) {

        showMessage(
            "createMessage",
            "Firebase is not initialized. Please reload the page.",
            "error"
        );

        return;
    }


    try {

        showMessage(
            "createMessage",
            "Preparing secure OTP...",
            "info"
        );


        // Remove previous reCAPTCHA

        if (window.createRecaptchaVerifier) {

            try {
                window.createRecaptchaVerifier.clear();
            } catch (e) {}

        }


        window.createRecaptchaVerifier =
            new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "normal",
                    callback: function () {

                        console.log(
                            "Create account reCAPTCHA completed."
                        );

                    },

                    "expired-callback": function () {

                        showMessage(
                            "createMessage",
                            "reCAPTCHA expired. Please try again.",
                            "error"
                        );

                    }
                }
            );


        const phoneNumber =
            getPhoneNumber(mobile);


        confirmationResult =
            await signInWithPhoneNumber(
                auth,
                phoneNumber,
                window.createRecaptchaVerifier
            );


        // Save temporary registration data

        window.pendingRegistration = {

            name: name,

            mobile: mobile,

            email: email,

            pin: pin

        };


        $("createOtpSection").style.display =
            "block";


        showMessage(
            "createMessage",
            "OTP sent to +91 " + mobile,
            "success"
        );


        $("createOtp").focus();

    }

    catch (error) {

        console.error(error);

        let message =
            firebaseErrorMessage(error);

        showMessage(
            "createMessage",
            message,
            "error"
        );

        if (window.createRecaptchaVerifier) {

            try {
                window.createRecaptchaVerifier.clear();
            } catch (e) {}

        }

    }

}


// ============================================================
// VERIFY CREATE ACCOUNT OTP
// ============================================================

async function verifyCreateOTP() {

    const otp =
        $("createOtp").value.trim();

    if (!/^\d{6}$/.test(otp)) {

        showMessage(
            "createMessage",
            "Enter the 6 digit OTP.",
            "error"
        );

        return;
    }


    if (!confirmationResult) {

        showMessage(
            "createMessage",
            "Please request OTP first.",
            "error"
        );

        return;
    }


    const data =
        window.pendingRegistration;


    if (!data) {

        showMessage(
            "createMessage",
            "Registration session expired. Please start again.",
            "error"
        );

        return;
    }


    try {

        showMessage(
            "createMessage",
            "Verifying OTP...",
            "info"
        );


        const result =
            await confirmationResult.confirm(otp);


        currentUser =
            result.user;


        // Save local student

        const student = {

            id:
                currentUser.uid,

            name:
                data.name,

            mobile:
                data.mobile,

            email:
                data.email,

            pin:
                data.pin,

            faceDescriptor:
                null,

            registeredAt:
                new Date().toISOString(),

            attendance:
                []

        };


        registeredStudents.push(student);

        saveStudents();


        // EMAIL VERIFICATION

        if (currentUser && data.email) {

            try {

                // Firebase email verification requires
                // an email/password credential.
                //
                // Since PIN is not an email password,
                // we cannot directly attach this email here.

                console.log(
                    "Email saved for student:",
                    data.email
                );

            } catch (emailError) {

                console.error(emailError);

            }

        }


        // AUTO LOGIN

        window.currentStudentId =
            student.id;


        showMessage(
            "createMessage",
            "Account created successfully! Opening dashboard...",
            "success"
        );


        setTimeout(() => {

            openDashboard(student);

        }, 1000);


    }

    catch (error) {

        console.error(error);

        showMessage(
            "createMessage",
            firebaseErrorMessage(error),
            "error"
        );

    }

}


// ============================================================
// LOGIN
// ============================================================

function loginUser() {

    const name =
        $("loginName").value.trim();

    const mobile =
        cleanMobile($("loginMobile").value);

    const pin =
        $("loginPin").value.trim();


    if (!name) {

        showMessage(
            "loginMessage",
            "Please enter your name.",
            "error"
        );

        return;
    }


    if (!validMobile(mobile)) {

        showMessage(
            "loginMessage",
            "Please enter a valid mobile number.",
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


    const student =
        registeredStudents.find(
            s =>
                s.name.toLowerCase() ===
                name.toLowerCase() &&

                s.mobile === mobile &&

                s.pin === pin
        );


    if (!student) {

        showMessage(
            "loginMessage",
            "Name, mobile number or PIN does not match the registered account.",
            "error"
        );

        return;
    }


    window.currentStudentId =
        student.id;


    currentUser =
        student;


    showMessage(
        "loginMessage",
        "Login successful!",
        "success"
    );


    setTimeout(() => {

        openDashboard(student);

    }, 500);

}


// ============================================================
// FORGOT PIN PAGE
// ============================================================

function openForgotPin() {

    showPage("forgotPinPage");

    $("forgotOtpSection").style.display =
        "none";

    showMessage("forgotMessage", "");

}


// ============================================================
// FORGOT PIN OTP
// ============================================================

async function sendForgotOTP() {

    const name =
        $("forgotName").value.trim();

    const mobile =
        cleanMobile($("forgotMobile").value);


    if (!name) {

        showMessage(
            "forgotMessage",
            "Enter your registered name.",
            "error"
        );

        return;
    }


    if (!validMobile(mobile)) {

        showMessage(
            "forgotMessage",
            "Enter a valid mobile number.",
            "error"
        );

        return;
    }


    const student =
        registeredStudents.find(
            s =>
                s.name.toLowerCase() ===
                name.toLowerCase() &&

                s.mobile === mobile
        );


    if (!student) {

        showMessage(
            "forgotMessage",
            "Name and mobile number do not match any registered account.",
            "error"
        );

        return;
    }


    try {

        if (window.forgotRecaptchaVerifier) {

            try {
                window.forgotRecaptchaVerifier.clear();
            } catch (e) {}

        }


        window.forgotRecaptchaVerifier =
            new RecaptchaVerifier(
                auth,
                "forgot-recaptcha-container",
                {
                    size: "normal"
                }
            );


        forgotConfirmationResult =
            await signInWithPhoneNumber(
                auth,
                getPhoneNumber(mobile),
                window.forgotRecaptchaVerifier
            );


        window.pendingForgotStudent =
            student.id;


        $("forgotOtpSection").style.display =
            "block";


        showMessage(
            "forgotMessage",
            "OTP sent to +91 " + mobile,
            "success"
        );


    }

    catch (error) {

        console.error(error);

        showMessage(
            "forgotMessage",
            firebaseErrorMessage(error),
            "error"
        );

    }

}


// ============================================================
// RESET PIN
// ============================================================

async function resetPIN() {

    const otp =
        $("forgotOtp").value.trim();

    const newPin =
        $("newPin").value.trim();

    const confirmNewPin =
        $("confirmNewPin").value.trim();


    if (!/^\d{6}$/.test(otp)) {

        showMessage(
            "forgotMessage",
            "Enter the 6 digit OTP.",
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


    if (!forgotConfirmationResult) {

        showMessage(
            "forgotMessage",
            "Please request OTP first.",
            "error"
        );

        return;
    }


    try {

        await forgotConfirmationResult.confirm(otp);


        const student =
            registeredStudents.find(
                s =>
                    s.id ===
                    window.pendingForgotStudent
            );


        if (!student) {

            showMessage(
                "forgotMessage",
                "Student account not found.",
                "error"
            );

            return;
        }


        student.pin =
            newPin;


        saveStudents();


        showMessage(
            "forgotMessage",
            "PIN reset successfully. You can now login.",
            "success"
        );


        setTimeout(() => {

            showPage("loginPage");

        }, 1200);

    }

    catch (error) {

        console.error(error);

        showMessage(
            "forgotMessage",
            firebaseErrorMessage(error),
            "error"
        );

    }

}


// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function firebaseErrorMessage(error) {

    if (!error) {
        return "Something went wrong.";
    }


    const code =
        error.code || "";


    switch (code) {

        case "auth/invalid-phone-number":
            return "Mobile number is invalid.";

        case "auth/too-many-requests":
            return "Too many attempts. Please wait and try again.";

        case "auth/quota-exceeded":
            return "Firebase SMS quota has been exceeded.";

        case "auth/captcha-check-failed":
            return "reCAPTCHA verification failed. Please try again.";

        case "auth/invalid-verification-code":
            return "Incorrect OTP.";

        case "auth/code-expired":
            return "OTP expired. Please request a new OTP.";

        case "auth/missing-phone-number":
            return "Mobile number is required.";

        case "auth/billing-not-enabled":
            return "Firebase billing/SMS setup is not enabled.";

        default:

            return (
                error.message ||
                "Firebase authentication failed."
            );

    }

}


// ============================================================
// OPEN DASHBOARD
// ============================================================

function openDashboard(student) {

    showPage("dashboardPage");

    currentUser =
        student;


    fillFaceRegistrationFields(student);

    updateDashboard();

    updateDate();

    displayStudents();

}


// ============================================================
// FACE REGISTRATION FIELDS
// ============================================================

function fillFaceRegistrationFields(student) {

    if (!student) return;


    $("faceName").value =
        student.name || "";

    $("faceMobile").value =
        student.mobile || "";

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


    const now =
        new Date();


    el.textContent =
        now.toLocaleDateString(
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
// DASHBOARD
// ============================================================

function updateDashboard() {

    const total =
        registeredStudents.length;


    let present = 0;


    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    registeredStudents.forEach(student => {

        const records =
            attendanceData[student.id] || [];

        if (
            records.some(
                record =>
                    record.date === today
            )
        ) {
            present++;
        }

    });


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
        $("totalStudents").textContent =
            total;


    if ($("presentStudents"))
        $("presentStudents").textContent =
            present;


    if ($("absentStudents"))
        $("absentStudents").textContent =
            absent;


    if ($("attendancePercentage"))
        $("attendancePercentage").textContent =
            percentage + "%";

}


// ============================================================
// FACE REGISTRATION
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


    const name =
        $("faceName").value.trim();

    const roll =
        $("faceRoll").value.trim();

    const college =
        $("collegeName").value.trim();

    const department =
        $("departmentName").value.trim();

    const mobile =
        cleanMobile($("faceMobile").value);

    const email =
        $("faceEmail").value.trim();


    if (!name || !roll || !college || !department) {

        $("registrationMessage").textContent =
            "Please fill Name, Roll, College and Department.";

        return;
    }


    if (!validMobile(mobile)) {

        $("registrationMessage").textContent =
            "Enter a valid mobile number.";

        return;
    }


    try {

        const video =
            $("registrationCamera");


        registrationStream =
            await navigator.mediaDevices.getUserMedia(
                {
                    video: {
                        facingMode: "user"
                    },

                    audio: false
                }
            );


        video.srcObject =
            registrationStream;


        $("registrationStatus").textContent =
            "Camera ON — keep your face inside the guide.";


        $("registrationMessage").textContent =
            "Camera started. Capturing face...";


        await new Promise(
            resolve =>
                setTimeout(resolve, 2000)
        );


        const descriptor =
            await detectFaceDescriptor(video);


        if (!descriptor) {

            $("registrationMessage").textContent =
                "No clear face detected. Please try again.";

            stopRegistrationCamera();

            return;
        }


        const student =
            registeredStudents.find(
                s =>
                    s.id ===
                    currentUser.id
            );


        if (student) {

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

            saveStudents();

        }


        $("registrationMessage").textContent =
            "Face registered successfully ✅";


        stopRegistrationCamera();

        updateDashboard();

        displayStudents();

    }

    catch (error) {

        console.error(error);

        $("registrationMessage").textContent =
            "Camera error: " +
            error.message;

        stopRegistrationCamera();

    }

}


// ============================================================
// FACE API DESCRIPTOR
// ============================================================

async function detectFaceDescriptor(video) {

    if (
        typeof faceapi ===
        "undefined"
    ) {

        console.warn(
            "face-api.js not loaded."
        );

        return new Float32Array(
            128
        );

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

        console.error(error);

        return null;

    }

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
        video.srcObject = null;
    }


    if ($("registrationStatus")) {

        $("registrationStatus").textContent =
            "Camera is OFF";

    }

}


// ============================================================
// FACE ATTENDANCE
// ============================================================

async function startFaceAttendance() {

    if (!currentUser) {

        $("attendanceResult").textContent =
            "Please login first.";

        return;
    }


    try {

        const video =
            $("attendanceCamera");


        attendanceStream =
            await navigator.mediaDevices.getUserMedia(
                {
                    video: {
                        facingMode: "user"
                    },

                    audio: false
                }
            );


        video.srcObject =
            attendanceStream;


        $("attendanceStatus").textContent =
            "Camera ON — detecting face...";


        $("attendanceResult").textContent =
            "Please look at the camera.";


        await new Promise(
            resolve =>
                setTimeout(resolve, 2000)
        );


        const descriptor =
            await detectFaceDescriptor(video);


        if (!descriptor) {

            $("attendanceResult").textContent =
                "No face detected. Please try again.";

            stopAttendanceCamera();

            return;
        }


        const student =
            findMatchingStudent(
                descriptor
            );


        if (!student) {

            $("attendanceResult").textContent =
                "Face not registered.";

            stopAttendanceCamera();

            return;
        }


        markAttendance(student);


        $("attendanceResult").textContent =
            "Attendance marked successfully ✅";


        stopAttendanceCamera();

        updateDashboard();

    }

    catch (error) {

        console.error(error);

        $("attendanceResult").textContent =
            "Camera error: " +
            error.message;

        stopAttendanceCamera();

    }

}


// ============================================================
// FIND MATCHING STUDENT
// ============================================================

function findMatchingStudent(descriptor) {

    // If face-api.js is unavailable,
    // use logged-in student for prototype mode.

    if (
        typeof faceapi ===
        "undefined"
    ) {

        return registeredStudents.find(
            s =>
                s.id ===
                currentUser.id
        );

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


    // Face-api.js commonly uses
    // around 0.6 as a starting threshold.

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

function markAttendance(student) {

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    if (!attendanceData[student.id]) {

        attendanceData[student.id] =
            [];

    }


    const alreadyMarked =
        attendanceData[student.id]
            .some(
                record =>
                    record.date ===
                    today
            );


    if (alreadyMarked) {
        return;
    }


    attendanceData[student.id]
        .push(
            {
                date: today,

                time:
                    new Date()
                        .toLocaleTimeString(
                            "en-IN"
                        ),

                status:
                    "Present"
            }
        );


    saveAttendance();

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
        video.srcObject = null;
    }


    if ($("attendanceStatus")) {

        $("attendanceStatus").textContent =
            "Camera is OFF";

    }

}


// ============================================================
// DISPLAY STUDENTS
// ============================================================

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

                return (

                    student.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    (student.roll || "")
                        .toLowerCase()
                        .includes(search)

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
                        ${escapeHTML(student.roll || "Not added")}
                    </p>

                    <p>
                        🏫
                        ${escapeHTML(student.college || "Not added")}
                    </p>

                    <p>
                        🎓
                        ${escapeHTML(student.department || "Not added")}
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

    $("studentsModal").style.display =
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
                        📧 ${escapeHTML(student.email || "Not added")}
                    </p>

                    <p>
                        🔢 ${escapeHTML(student.roll || "Not added")}
                    </p>

                </div>

            `
            )
            .join("");

}


function closeRegisteredStudents() {

    $("studentsModal").style.display =
        "none";

}


// ============================================================
// ATTENDANCE MODAL
// ============================================================

function showCheckAttendance() {

    $("attendanceCheckModal").style.display =
        "flex";


    if (!currentUser) return;


    const records =
        attendanceData[currentUser.id] ||
        [];


    const totalDays =
        records.length;


    const presentDays =
        records.filter(
            r =>
                r.status ===
                "Present"
        ).length;


    const absentDays =
        Math.max(
            0,
            totalDays - presentDays
        );


    $("attendanceTotalDays")
        .textContent =
        totalDays;


    $("attendancePresentDays")
        .textContent =
        presentDays;


    $("attendanceAbsentDays")
        .textContent =
        absentDays;


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

    $("attendanceCheckModal").style.display =
        "none";

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

        alert("Name is required.");

        return;
    }


    if (!validMobile(mobile)) {

        alert("Enter a valid mobile number.");

        return;
    }


    if (
        email &&
        !validEmail(email)
    ) {

        alert("Enter a valid email.");

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


    alert(
        "Details updated successfully."
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

    $("adminModal").style.display =
        "flex";

}


function closeAdminDetails() {

    $("adminModal").style.display =
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


    $("loginName").value =
        "";

    $("loginMobile").value =
        "";

    $("loginPin").value =
        "";


    showMessage(
        "loginMessage",
        "Logged out successfully.",
        "success"
    );

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value || "")
        .replace(
            /[&<>"']/g,
            function (char) {

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


// ============================================================
// WINDOW FUNCTIONS
// Needed because HTML uses onclick="..."
// ============================================================

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

window.displayStudents =
    displayStudents;


// ============================================================
// BUTTON EVENT LISTENERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


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


        $("sendCreateOtpButton")
            ?.addEventListener(
                "click",
                sendCreateOTP
            );


        $("verifyCreateOtpButton")
            ?.addEventListener(
                "click",
                verifyCreateOTP
            );


        // BACK LOGIN

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


        $("sendForgotOtpButton")
            ?.addEventListener(
                "click",
                sendForgotOTP
            );


        $("resetPinButton")
            ?.addEventListener(
                "click",
                resetPIN
            );


        $("forgotBackButton")
            ?.addEventListener(
                "click",
                backFromForgot
            );


        // ENTER KEY LOGIN

        [
            "loginName",
            "loginMobile",
            "loginPin"
        ].forEach(
            id => {

                $(id)?.addEventListener(
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


        // CURRENT DATE

        updateDate();


        // AUTO REFRESH DATE

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
// FIREBASE AUTH STATE
// ============================================================

if (auth) {

    onAuthStateChanged(
        auth,
        user => {

            if (user) {

                console.log(
                    "Firebase user:",
                    user.uid
                );

            }

        }
    );

}

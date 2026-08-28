// ============================================================
// SMART ATTENDANCE SYSTEM
// script.js
// ============================================================


// ============================================================
// FIREBASE IMPORTS
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCcvk2aGKaVJvlDSS76DnkQCy8GwAuloEE",

    authDomain:
        "smart-attendance-system-82b82.firebaseapp.com",

    projectId:
        "smart-attendance-system-82b82",

    storageBucket:
        "smart-attendance-system-82b82.firebasestorage.app",

    messagingSenderId:
        "234543808646",

    appId:
        "1:234543808646:web:23aaab1d197522bd725107",

    measurementId:
        "G-58XHQHDY30"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


// Make available globally if needed

window.firebaseAuth =
    auth;


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let confirmationResult = null;

let forgotConfirmationResult = null;

let currentUser = null;

let registrationStream = null;

let attendanceStream = null;

let createRecaptchaVerifier = null;

let forgotRecaptchaVerifier = null;


// ============================================================
// LOCAL STORAGE
// ============================================================

let registeredStudents =
    JSON.parse(
        localStorage.getItem("registeredStudents") || "[]"
    );


let attendanceData =
    JSON.parse(
        localStorage.getItem("attendanceData") || "{}"
    );


// ============================================================
// FACE API MODEL STATUS
// ============================================================

let faceModelsLoaded = false;


// ============================================================
// HELPER
// ============================================================

function $(id) {

    return document.getElementById(id);

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    id,
    message,
    type = "info"
) {

    const element =
        $(id);

    if (!element) return;

    element.textContent =
        message;

    element.className =
        "auth-message " + type;

}


// ============================================================
// FACE MESSAGE
// ============================================================

function showFaceMessage(
    id,
    message,
    type = ""
) {

    const element =
        $(id);

    if (!element) return;

    element.textContent =
        message;

    element.className =
        "face-message " + type;

}


// ============================================================
// MOBILE
// ============================================================

function cleanMobile(mobile) {

    return String(mobile || "")
        .replace(/\D/g, "")
        .slice(-10);

}


function getPhoneNumber(mobile) {

    return "+91" + cleanMobile(mobile);

}


function validMobile(mobile) {

    return /^[6-9]\d{9}$/
        .test(cleanMobile(mobile));

}


// ============================================================
// PIN
// ============================================================

function validPin(pin) {

    return /^\d{4}$/.test(
        String(pin || "")
    );

}


// ============================================================
// EMAIL
// ============================================================

function validEmail(email) {

    if (!email) return true;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
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


// ============================================================
// SAVE STUDENTS
// ============================================================

function saveStudents() {

    localStorage.setItem(
        "registeredStudents",
        JSON.stringify(
            registeredStudents
        )
    );

}


// ============================================================
// SAVE ATTENDANCE
// ============================================================

function saveAttendance() {

    localStorage.setItem(
        "attendanceData",
        JSON.stringify(
            attendanceData
        )
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


    pages.forEach(
        id => {

            const page =
                $(id);

            if (!page) return;

            page.style.display =
                id === pageId
                    ? "block"
                    : "none";

        }
    );

}


// ============================================================
// CREATE ACCOUNT PAGE
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


    if ($("createName")) {

        $("createName").focus();

    }

}


// ============================================================
// BACK LOGIN
// ============================================================

function backToLogin() {

    cleanupCreateRecaptcha();

    showPage(
        "loginPage"
    );

    showMessage(
        "loginMessage",
        ""
    );

}


function backFromForgot() {

    cleanupForgotRecaptcha();

    showPage(
        "loginPage"
    );

    showMessage(
        "forgotMessage",
        ""
    );

}


// ============================================================
// CREATE ACCOUNT OTP
// ============================================================

async function sendCreateOTP() {

    const name =
        $("createName")
            .value
            .trim();


    const mobile =
        cleanMobile(
            $("createMobile").value
        );


    const email =
        $("createEmail")
            .value
            .trim();


    const pin =
        $("createPin")
            .value
            .trim();


    const confirmPin =
        $("confirmPin")
            .value
            .trim();


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

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


    if (
        email &&
        !validEmail(email)
    ) {

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


    // --------------------------------------------------------
    // DUPLICATE MOBILE
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // DUPLICATE EMAIL
    // --------------------------------------------------------

    if (email) {

        const existingEmail =
            registeredStudents.find(
                student =>
                    student.email &&
                    student.email
                        .toLowerCase() ===
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


    try {

        showMessage(
            "createMessage",
            "Preparing secure OTP...",
            "info"
        );


        cleanupCreateRecaptcha();


        createRecaptchaVerifier =
            new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {

                    size: "normal",

                    callback: () => {

                        console.log(
                            "Create reCAPTCHA completed."
                        );

                    },

                    "expired-callback": () => {

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
                createRecaptchaVerifier
            );


        // ----------------------------------------------------
        // TEMPORARY DATA
        // ----------------------------------------------------

        window.pendingRegistration = {

            name,
            mobile,
            email,
            pin

        };


        $("createOtpSection")
            .style.display =
            "block";


        showMessage(
            "createMessage",
            "OTP sent to +91 " + mobile,
            "success"
        );


        $("createOtp").focus();

    }

    catch (error) {

        console.error(
            "Create OTP error:",
            error
        );


        showMessage(
            "createMessage",
            firebaseErrorMessage(error),
            "error"
        );


        cleanupCreateRecaptcha();

    }

}


// ============================================================
// VERIFY CREATE OTP
// ============================================================

async function verifyCreateOTP() {

    const otp =
        $("createOtp")
            .value
            .trim();


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
            await confirmationResult
                .confirm(otp);


        const firebaseUser =
            result.user;


        const student = {

            id:
                firebaseUser.uid,

            name:
                data.name,

            mobile:
                data.mobile,

            email:
                data.email,

            pin:
                data.pin,

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


        window.pendingRegistration =
            null;


        confirmationResult =
            null;


        showMessage(
            "createMessage",
            "Account created successfully! Opening dashboard...",
            "success"
        );


        setTimeout(
            () => {

                openDashboard(
                    student
                );

            },
            800
        );

    }

    catch (error) {

        console.error(
            "OTP verification error:",
            error
        );


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
        $("loginName")
            .value
            .trim();


    const mobile =
        cleanMobile(
            $("loginMobile").value
        );


    const pin =
        $("loginPin")
            .value
            .trim();


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

                String(s.name)
                    .toLowerCase() ===
                name.toLowerCase()

                &&

                cleanMobile(s.mobile) ===
                mobile

                &&

                String(s.pin) ===
                pin
        );


    if (!student) {

        showMessage(
            "loginMessage",
            "Name, mobile number or PIN does not match the registered account.",
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
        "Login successful!",
        "success"
    );


    setTimeout(
        () => {

            openDashboard(
                student
            );

        },
        400
    );

}


// ============================================================
// FORGOT PIN
// ============================================================

function openForgotPin() {

    showPage(
        "forgotPinPage"
    );


    $("forgotOtpSection")
        .style.display =
        "none";


    showMessage(
        "forgotMessage",
        ""
    );

}


// ============================================================
// SEND FORGOT OTP
// ============================================================

async function sendForgotOTP() {

    const name =
        $("forgotName")
            .value
            .trim();


    const mobile =
        cleanMobile(
            $("forgotMobile").value
        );


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

                String(s.name)
                    .toLowerCase() ===
                name.toLowerCase()

                &&

                cleanMobile(s.mobile) ===
                mobile
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

        cleanupForgotRecaptcha();


        forgotRecaptchaVerifier =
            new RecaptchaVerifier(
                auth,
                "forgot-recaptcha-container",
                {

                    size: "normal",

                    callback: () => {

                        console.log(
                            "Forgot PIN reCAPTCHA completed."
                        );

                    },

                    "expired-callback": () => {

                        showMessage(
                            "forgotMessage",
                            "reCAPTCHA expired. Please try again.",
                            "error"
                        );

                    }

                }
            );


        forgotConfirmationResult =
            await signInWithPhoneNumber(
                auth,
                getPhoneNumber(mobile),
                forgotRecaptchaVerifier
            );


        window.pendingForgotStudent =
            student.id;


        $("forgotOtpSection")
            .style.display =
            "block";


        showMessage(
            "forgotMessage",
            "OTP sent to +91 " + mobile,
            "success"
        );


        $("forgotOtp").focus();

    }

    catch (error) {

        console.error(
            "Forgot OTP error:",
            error
        );


        showMessage(
            "forgotMessage",
            firebaseErrorMessage(error),
            "error"
        );


        cleanupForgotRecaptcha();

    }

}


// ============================================================
// RESET PIN
// ============================================================

async function resetPIN() {

    const otp =
        $("forgotOtp")
            .value
            .trim();


    const newPin =
        $("newPin")
            .value
            .trim();


    const confirmNewPin =
        $("confirmNewPin")
            .value
            .trim();


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
            "New PIN must contain exactly 4 digits.",
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

        showMessage(
            "forgotMessage",
            "Verifying OTP...",
            "info"
        );


        const result =
            await forgotConfirmationResult
                .confirm(otp);


        const firebaseUser =
            result.user;


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


        // Extra protection:
        // Firebase verified phone must match student mobile

        const firebasePhone =
            cleanMobile(
                firebaseUser.phoneNumber
            );


        if (
            firebasePhone &&
            firebasePhone !==
            cleanMobile(student.mobile)
        ) {

            showMessage(
                "forgotMessage",
                "Mobile verification does not match this account.",
                "error"
            );

            return;

        }


        student.pin =
            newPin;


        saveStudents();


        forgotConfirmationResult =
            null;


        window.pendingForgotStudent =
            null;


        showMessage(
            "forgotMessage",
            "PIN reset successfully. You can now login.",
            "success"
        );


        setTimeout(
            () => {

                showPage(
                    "loginPage"
                );

            },
            1200
        );

    }

    catch (error) {

        console.error(
            "PIN reset error:",
            error
        );


        showMessage(
            "forgotMessage",
            firebaseErrorMessage(error),
            "error"
        );

    }

}


// ============================================================
// FIREBASE ERROR
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
            return "reCAPTCHA verification failed.";

        case "auth/invalid-verification-code":
            return "Incorrect OTP.";

        case "auth/code-expired":
            return "OTP expired. Please request a new OTP.";

        case "auth/missing-phone-number":
            return "Mobile number is required.";

        case "auth/billing-not-enabled":
            return "Firebase billing/SMS setup is not enabled.";

        case "auth/operation-not-allowed":
            return "Phone authentication is not enabled in Firebase.";

        case "auth/app-not-authorized":
            return "This website domain is not authorized in Firebase.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        default:

            return (
                error.message ||
                "Firebase authentication failed."
            );

    }

}


// ============================================================
// DASHBOARD
// ============================================================

function openDashboard(student) {

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
// FILL FACE DETAILS
// ============================================================

function fillFaceRegistrationFields(
    student
) {

    if (!student) return;


    $("faceName").value =
        student.name || "";


    $("faceRoll").value =
        student.roll || "";


    $("collegeName").value =
        student.college || "";


    $("departmentName").value =
        student.department || "";


    $("faceMobile").value =
        student.mobile || "";


    $("faceEmail").value =
        student.email || "";

}


// ============================================================
// DATE
// ============================================================

function updateDate() {

    const element =
        $("currentDate");


    if (!element) return;


    element.textContent =
        new Date()
            .toLocaleDateString(
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
// TODAY DATE
// ============================================================

function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
            .padStart(2, "0");


    const day =
        String(
            now.getDate()
        )
            .padStart(2, "0");


    return `${year}-${month}-${day}`;

}


// ============================================================
// DASHBOARD UPDATE
// ============================================================

function updateDashboard() {

    const total =
        registeredStudents.length;


    const today =
        getTodayDate();


    let present =
        0;


    registeredStudents.forEach(
        student => {

            const records =
                attendanceData[
                    student.id
                ] || [];


            const isPresent =
                records.some(
                    record =>
                        record.date ===
                        today &&
                        record.status ===
                        "Present"
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


    if ($("totalStudents")) {

        $("totalStudents")
            .textContent =
            total;

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


// ============================================================
// FACE API MODEL LOADING
// ============================================================

async function loadFaceModels() {

    if (
        typeof faceapi ===
        "undefined"
    ) {

        console.error(
            "face-api.js is not loaded."
        );

        return false;

    }


    if (faceModelsLoaded) {

        return true;

    }


    try {

        console.log(
            "Loading Face API models..."
        );


        // ----------------------------------------------------
        // IMPORTANT
        // Models are loaded from jsDelivr
        // ----------------------------------------------------

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


        faceModelsLoaded =
            true;


        console.log(
            "Face API models loaded successfully ✅"
        );


        return true;

    }

    catch (error) {

        console.error(
            "Face model loading failed:",
            error
        );


        faceModelsLoaded =
            false;


        return false;

    }

}


// ============================================================
// WAIT FOR VIDEO
// ============================================================

async function waitForVideoReady(
    video
) {

    return new Promise(
        resolve => {

            if (
                video.readyState >=
                3
            ) {

                resolve();

                return;

            }


            const handler =
                () => {

                    video.removeEventListener(
                        "loadeddata",
                        handler
                    );

                    resolve();

                };


            video.addEventListener(
                "loadeddata",
                handler
            );

        }
    );

}


// ============================================================
// FACE DESCRIPTOR
// ============================================================

async function detectFaceDescriptor(
    video
) {

    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

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


// ============================================================
// FACE REGISTRATION
// ============================================================

async function startAutomaticFaceRegistration() {

    if (!currentUser) {

        showFaceMessage(
            "registrationMessage",
            "Please login first.",
            "error"
        );

        return;

    }


    const name =
        $("faceName")
            .value
            .trim();


    const roll =
        $("faceRoll")
            .value
            .trim();


    const college =
        $("collegeName")
            .value
            .trim();


    const department =
        $("departmentName")
            .value
            .trim();


    const mobile =
        cleanMobile(
            $("faceMobile").value
        );


    const email =
        $("faceEmail")
            .value
            .trim();


    if (
        !name ||
        !roll ||
        !college ||
        !department
    ) {

        showFaceMessage(
            "registrationMessage",
            "Please fill Name, Roll, College and Department.",
            "error"
        );

        return;

    }


    if (!validMobile(mobile)) {

        showFaceMessage(
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

        showFaceMessage(
            "registrationMessage",
            "Enter a valid email address.",
            "error"
        );

        return;

    }


    try {

        const modelsReady =
            await loadFaceModels();


        if (!modelsReady) {

            showFaceMessage(
                "registrationMessage",
                "Face recognition models could not be loaded. Check internet connection.",
                "error"
            );

            return;

        }


        const video =
            $("registrationCamera");


        registrationStream =
            await navigator
                .mediaDevices
                .getUserMedia(
                    {

                        video: {

                            facingMode:
                                "user",

                            width:
                                {
                                    ideal: 640
                                },

                            height:
                                {
                                    ideal: 480
                                }

                        },

                        audio: false

                    }
                );


        video.srcObject =
            registrationStream;


        await video.play();


        await waitForVideoReady(
            video
        );


        $("registrationStatus")
            .textContent =
            "Camera ON — keep your face inside the guide.";


        showFaceMessage(
            "registrationMessage",
            "Camera started. Please keep your face steady...",
            "info"
        );


        await delay(
            2000
        );


        const descriptor =
            await detectFaceDescriptor(
                video
            );


        if (!descriptor) {

            showFaceMessage(
                "registrationMessage",
                "No clear face detected. Keep your face inside the guide and try again.",
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

            showFaceMessage(
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
            Array.from(
                descriptor
            );


        if (!student.registeredAt) {

            student.registeredAt =
                new Date().toISOString();

        }


        saveStudents();


        currentUser =
            student;


        showFaceMessage(
            "registrationMessage",
            "Face registered successfully ✅",
            "success"
        );


        stopRegistrationCamera();


        updateDashboard();

        displayStudents();

    }

    catch (error) {

        console.error(
            "Registration camera error:",
            error
        );


        showFaceMessage(
            "registrationMessage",
            "Camera error: " +
            error.message,
            "error"
        );


        stopRegistrationCamera();

    }

}


// ============================================================
// DELAY
// ============================================================

function delay(ms) {

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

}


// ============================================================
// FACE ATTENDANCE
// ============================================================

async function startFaceAttendance() {

    if (!currentUser) {

        showFaceMessage(
            "attendanceResult",
            "Please login first.",
            "error"
        );

        return;

    }


    try {

        const modelsReady =
            await loadFaceModels();


        if (!modelsReady) {

            showFaceMessage(
                "attendanceResult",
                "Face recognition models could not be loaded.",
                "error"
            );

            return;

        }


        const video =
            $("attendanceCamera");


        attendanceStream =
            await navigator
                .mediaDevices
                .getUserMedia(
                    {

                        video: {

                            facingMode:
                                "user",

                            width:
                                {
                                    ideal: 640
                                },

                            height:
                                {
                                    ideal: 480
                                }

                        },

                        audio: false

                    }
                );


        video.srcObject =
            attendanceStream;


        await video.play();


        await waitForVideoReady(
            video
        );


        $("attendanceStatus")
            .textContent =
            "Camera ON — detecting face...";


        showFaceMessage(
            "attendanceResult",
            "Please look directly at the camera.",
            "info"
        );


        await delay(
            2000
        );


        const descriptor =
            await detectFaceDescriptor(
                video
            );


        if (!descriptor) {

            showFaceMessage(
                "attendanceResult",
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

            showFaceMessage(
                "attendanceResult",
                "Face not registered or face does not match.",
                "error"
            );


            stopAttendanceCamera();

            return;

        }


        const result =
            markAttendance(
                student
            );


        if (result === "already") {

            showFaceMessage(
                "attendanceResult",
                "Attendance is already marked for today ✅",
                "info"
            );

        }

        else {

            showFaceMessage(
                "attendanceResult",
                "Attendance marked successfully ✅",
                "success"
            );

        }


        stopAttendanceCamera();


        updateDashboard();

    }

    catch (error) {

        console.error(
            "Attendance camera error:",
            error
        );


        showFaceMessage(
            "attendanceResult",
            "Camera error: " +
            error.message,
            "error"
        );


        stopAttendanceCamera();

    }

}


// ============================================================
// FIND MATCHING STUDENT
// ============================================================

function findMatchingStudent(
    descriptor
) {

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


            if (
                student.faceDescriptor.length !==
                128
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


    // --------------------------------------------------------
    // 0.6 is a common starting threshold.
    // Lower = stricter.
    // --------------------------------------------------------

    if (
        bestStudent &&
        bestDistance < 0.6
    ) {

        console.log(
            "Best face distance:",
            bestDistance
        );


        return bestStudent;

    }


    console.log(
        "No face match. Distance:",
        bestDistance
    );


    return null;

}


// ============================================================
// MARK ATTENDANCE
// ============================================================

function markAttendance(
    student
) {

    const today =
        getTodayDate();


    if (
        !attendanceData[
            student.id
        ]
    ) {

        attendanceData[
            student.id
        ] = [];

    }


    const records =
        attendanceData[
            student.id
        ];


    const alreadyMarked =
        records.some(
            record =>
                record.date ===
                today
        );


    if (alreadyMarked) {

        return "already";

    }


    records.push({

        date:
            today,

        time:
            new Date()
                .toLocaleTimeString(
                    "en-IN"
                ),

        status:
            "Present"

    });


    saveAttendance();


    return "marked";

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
            $("searchStudent")
                ?.value || ""
        )
            .toLowerCase()
            .trim();


    const students =
        registeredStudents.filter(
            student => {

                const name =
                    String(
                        student.name || ""
                    )
                        .toLowerCase();


                const roll =
                    String(
                        student.roll || ""
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
// REGISTERED STUDENTS
// ============================================================

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
                        📧 ${escapeHTML(student.email || "Not added")}
                    </p>

                    <p>
                        🔢 ${escapeHTML(student.roll || "Not added")}
                    </p>

                    <p>
                        🏫 ${escapeHTML(student.college || "Not added")}
                    </p>

                    <p>
                        🎓 ${escapeHTML(student.department || "Not added")}
                    </p>

                    <p>
                        📸 ${
                            student.faceDescriptor
                                ? "Face Registered"
                                : "Face Not Registered"
                        }
                    </p>

                </div>

                `
            )
            .join("");

}


function closeRegisteredStudents() {

    $("studentsModal")
        .style.display =
        "none";

}


// ============================================================
// CHECK ATTENDANCE
// ============================================================

function showCheckAttendance() {

    $("attendanceCheckModal")
        .style.display =
        "flex";


    if (!currentUser) {

        return;

    }


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


    /*
       Here "Total Days" means the number of
       attendance records currently stored.
    */

    const totalDays =
        records.length;


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

    $("attendanceCheckModal")
        .style.display =
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


    $("editDetailsModal")
        .style.display =
        "flex";

}


function closeEditDetails() {

    $("editDetailsModal")
        .style.display =
        "none";

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
            .value
            .trim();


    const roll =
        $("editRoll")
            .value
            .trim();


    const college =
        $("editCollege")
            .value
            .trim();


    const department =
        $("editDepartment")
            .value
            .trim();


    const mobile =
        cleanMobile(
            $("editMobile").value
        );


    const email =
        $("editEmail")
            .value
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


    // --------------------------------------------------------
    // CHECK DUPLICATE MOBILE
    // --------------------------------------------------------

    const duplicateMobile =
        registeredStudents.find(
            s =>
                s.id !== student.id &&
                cleanMobile(s.mobile) ===
                mobile
        );


    if (duplicateMobile) {

        alert(
            "This mobile number is already used by another student."
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

    $("adminModal")
        .style.display =
        "flex";

}


function closeAdminDetails() {

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


    cleanupCreateRecaptcha();

    cleanupForgotRecaptcha();


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
// RECAPTCHA CLEANUP
// ============================================================

function cleanupCreateRecaptcha() {

    if (createRecaptchaVerifier) {

        try {

            createRecaptchaVerifier.clear();

        }

        catch (error) {

            console.warn(
                error
            );

        }

        createRecaptchaVerifier =
            null;

    }


    const container =
        $("recaptcha-container");


    if (container) {

        container.innerHTML =
            "";

    }

}


function cleanupForgotRecaptcha() {

    if (forgotRecaptchaVerifier) {

        try {

            forgotRecaptchaVerifier.clear();

        }

        catch (error) {

            console.warn(
                error
            );

        }

        forgotRecaptchaVerifier =
            null;

    }


    const container =
        $("forgot-recaptcha-container");


    if (container) {

        container.innerHTML =
            "";

    }

}


// ============================================================
// WINDOW FUNCTIONS
// HTML onclick NEEDS THESE
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
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {


        // ----------------------------------------------------
        // LOGIN
        // ----------------------------------------------------

        $("loginButton")
            ?.addEventListener(
                "click",
                loginUser
            );


        // ----------------------------------------------------
        // CREATE ACCOUNT
        // ----------------------------------------------------

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


        $("backToLoginButton")
            ?.addEventListener(
                "click",
                backToLogin
            );


        // ----------------------------------------------------
        // FORGOT PIN
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // ENTER KEY LOGIN
        // ----------------------------------------------------

        [

            "loginName",
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


        // ----------------------------------------------------
        // DATE
        // ----------------------------------------------------

        updateDate();


        setInterval(
            updateDate,
            60000
        );


        // ----------------------------------------------------
        // PRELOAD FACE MODELS
        // ----------------------------------------------------

        console.log(
            "Preparing face recognition..."
        );


        const loaded =
            await loadFaceModels();


        if (loaded) {

            console.log(
                "Face recognition ready ✅"
            );

        }

        else {

            console.warn(
                "Face recognition models are not ready."
            );

        }


        console.log(
            "Smart Attendance System loaded successfully ✅"
        );

    }
);


// ============================================================
// FIREBASE AUTH STATE
// ============================================================

onAuthStateChanged(
    auth,
    user => {

        if (user) {

            console.log(
                "Firebase authenticated user:",
                user.uid
            );

        }

        else {

            console.log(
                "No Firebase authenticated user."
            );

        }

    }
);

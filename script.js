// ============================================================
// SMART ATTENDANCE SYSTEM - script.js
// Firebase Phone OTP + Login + Forgot PIN + Attendance
// ============================================================

import {
    signInWithPhoneNumber,
    RecaptchaVerifier
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let createConfirmationResult = null;
let forgotConfirmationResult = null;

let createRecaptcha = null;
let forgotRecaptcha = null;

let currentUser = null;

let students = JSON.parse(
    localStorage.getItem("smartAttendanceStudents") || "[]"
);

let attendanceRecords = JSON.parse(
    localStorage.getItem("smartAttendanceRecords") || "[]"
);


// ============================================================
// HELPER
// ============================================================

function $(id) {
    return document.getElementById(id);
}

function showMessage(id, message, type = "normal") {
    const el = $(id);

    if (!el) return;

    el.textContent = message;

    el.className = "auth-message " + type;
}

function saveStudents() {
    localStorage.setItem(
        "smartAttendanceStudents",
        JSON.stringify(students)
    );
}

function saveAttendance() {
    localStorage.setItem(
        "smartAttendanceRecords",
        JSON.stringify(attendanceRecords)
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
// CREATE ACCOUNT
// ============================================================

function setupCreateRecaptcha() {

    if (createRecaptcha) return;

    try {

        createRecaptcha = new RecaptchaVerifier(
            window.firebaseAuth,
            "recaptcha-container",
            {
                size: "normal"
            }
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "createMessage",
            "reCAPTCHA load হয়নি। Page refresh করে আবার চেষ্টা করো।",
            "error"
        );
    }
}


async function sendCreateOTP() {

    const name = $("createName").value.trim();
    const mobile = $("createMobile").value.trim();
    const email = $("createEmail").value.trim();
    const pin = $("createPin").value.trim();
    const confirmPin = $("confirmPin").value.trim();

    if (!name) {
        showMessage("createMessage", "Name দাও।", "error");
        return;
    }

    if (!/^\d{10}$/.test(mobile)) {
        showMessage(
            "createMessage",
            "সঠিক 10 digit mobile number দাও।",
            "error"
        );
        return;
    }

    if (!/^\d{4}$/.test(pin)) {
        showMessage(
            "createMessage",
            "PIN অবশ্যই 4 digit হতে হবে।",
            "error"
        );
        return;
    }

    if (pin !== confirmPin) {
        showMessage(
            "createMessage",
            "দুটি PIN একই নয়।",
            "error"
        );
        return;
    }

    const alreadyExists = students.find(
        student => student.mobile === mobile
    );

    if (alreadyExists) {
        showMessage(
            "createMessage",
            "এই mobile number দিয়ে account আগে থেকেই আছে।",
            "error"
        );
        return;
    }

    setupCreateRecaptcha();

    showMessage(
        "createMessage",
        "OTP পাঠানো হচ্ছে...",
        "normal"
    );

    try {

        const phoneNumber = "+91" + mobile;

        createConfirmationResult =
            await signInWithPhoneNumber(
                window.firebaseAuth,
                phoneNumber,
                createRecaptcha
            );

        $("createOtpSection").style.display = "block";

        showMessage(
            "createMessage",
            "✅ OTP তোমার mobile number-এ পাঠানো হয়েছে।",
            "success"
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "createMessage",
            "OTP পাঠানো যায়নি: " + error.message,
            "error"
        );
    }
}


// ============================================================
// VERIFY CREATE OTP
// ============================================================

async function verifyCreateOTP() {

    const otp = $("createOtp").value.trim();

    const name = $("createName").value.trim();
    const mobile = $("createMobile").value.trim();
    const email = $("createEmail").value.trim();
    const pin = $("createPin").value.trim();

    if (!/^\d{6}$/.test(otp)) {
        showMessage(
            "createMessage",
            "6 digit OTP দাও।",
            "error"
        );
        return;
    }

    if (!createConfirmationResult) {
        showMessage(
            "createMessage",
            "আগে Send OTP চাপো।",
            "error"
        );
        return;
    }

    try {

        showMessage(
            "createMessage",
            "OTP verify হচ্ছে...",
            "normal"
        );

        const result =
            await createConfirmationResult.confirm(otp);

        const student = {
            id: Date.now(),
            uid: result.user.uid,
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

        students.push(student);

        saveStudents();

        currentUser = student;

        showMessage(
            "createMessage",
            "✅ Account successfully created!",
            "success"
        );

        setTimeout(() => {
            openDashboard();
        }, 1000);

    } catch (error) {

        console.error(error);

        showMessage(
            "createMessage",
            "❌ ভুল OTP অথবা verification failed।",
            "error"
        );
    }
}


// ============================================================
// FORGOT PIN
// ============================================================

function setupForgotRecaptcha() {

    if (forgotRecaptcha) return;

    try {

        forgotRecaptcha = new RecaptchaVerifier(
            window.firebaseAuth,
            "forgot-recaptcha-container",
            {
                size: "normal"
            }
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "forgotMessage",
            "reCAPTCHA load হয়নি। Page refresh করো।",
            "error"
        );
    }
}


async function sendForgotOTP() {

    const name = $("forgotName").value.trim();
    const mobile = $("forgotMobile").value.trim();

    if (!name) {
        showMessage(
            "forgotMessage",
            "Registered name দাও।",
            "error"
        );
        return;
    }

    if (!/^\d{10}$/.test(mobile)) {
        showMessage(
            "forgotMessage",
            "সঠিক 10 digit mobile number দাও।",
            "error"
        );
        return;
    }

    const student = students.find(
        s =>
            s.mobile === mobile &&
            s.name.toLowerCase() === name.toLowerCase()
    );

    if (!student) {
        showMessage(
            "forgotMessage",
            "Name ও mobile number registered account-এর সঙ্গে মিলছে না।",
            "error"
        );
        return;
    }

    setupForgotRecaptcha();

    showMessage(
        "forgotMessage",
        "OTP পাঠানো হচ্ছে...",
        "normal"
    );

    try {

        const phoneNumber = "+91" + mobile;

        forgotConfirmationResult =
            await signInWithPhoneNumber(
                window.firebaseAuth,
                phoneNumber,
                forgotRecaptcha
            );

        $("forgotOtpSection").style.display = "block";

        showMessage(
            "forgotMessage",
            "✅ OTP তোমার mobile number-এ পাঠানো হয়েছে।",
            "success"
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "forgotMessage",
            "OTP পাঠানো যায়নি: " + error.message,
            "error"
        );
    }
}


// ============================================================
// RESET PIN
// ============================================================

async function resetPIN() {

    const otp = $("forgotOtp").value.trim();
    const newPin = $("newPin").value.trim();
    const confirmNewPin = $("confirmNewPin").value.trim();

    if (!/^\d{6}$/.test(otp)) {
        showMessage(
            "forgotMessage",
            "6 digit OTP দাও।",
            "error"
        );
        return;
    }

    if (!/^\d{4}$/.test(newPin)) {
        showMessage(
            "forgotMessage",
            "New PIN অবশ্যই 4 digit হতে হবে।",
            "error"
        );
        return;
    }

    if (newPin !== confirmNewPin) {
        showMessage(
            "forgotMessage",
            "দুটি নতুন PIN একই নয়।",
            "error"
        );
        return;
    }

    if (!forgotConfirmationResult) {
        showMessage(
            "forgotMessage",
            "আগে Send OTP চাপো।",
            "error"
        );
        return;
    }

    try {

        showMessage(
            "forgotMessage",
            "OTP verify হচ্ছে...",
            "normal"
        );

        const result =
            await forgotConfirmationResult.confirm(otp);

        const mobile =
            $("forgotMobile").value.trim();

        const studentIndex =
            students.findIndex(
                s => s.mobile === mobile
            );

        if (studentIndex === -1) {
            showMessage(
                "forgotMessage",
                "Account পাওয়া যায়নি।",
                "error"
            );
            return;
        }

        students[studentIndex].pin = newPin;

        saveStudents();

        showMessage(
            "forgotMessage",
            "✅ PIN successfully reset হয়েছে। এখন Login করো।",
            "success"
        );

        setTimeout(() => {
            showPage("loginPage");
        }, 1500);

    } catch (error) {

        console.error(error);

        showMessage(
            "forgotMessage",
            "❌ OTP ভুল অথবা verification failed।",
            "error"
        );
    }
}


// ============================================================
// LOGIN
// ============================================================

function loginUser() {

    const name = $("loginName").value.trim();
    const mobile = $("loginMobile").value.trim();
    const pin = $("loginPin").value.trim();

    const student = students.find(
        s =>
            s.mobile === mobile &&
            s.pin === pin &&
            s.name.toLowerCase() === name.toLowerCase()
    );

    if (!student) {

        showMessage(
            "loginMessage",
            "❌ Name, mobile অথবা PIN ভুল।",
            "error"
        );

        return;
    }

    currentUser = student;

    showMessage(
        "loginMessage",
        "✅ Login successful!",
        "success"
    );

    setTimeout(() => {
        openDashboard();
    }, 700);
}


// ============================================================
// DASHBOARD
// ============================================================

function openDashboard() {

    showPage("dashboardPage");

    updateDate();

    displayStudents();

    updateDashboardCards();

    loadMyDetails();
}


function updateDate() {

    const dateElement = $("currentDate");

    if (!dateElement) return;

    dateElement.textContent =
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
// DASHBOARD CARDS
// ============================================================

function updateDashboardCards() {

    const total = students.length;

    const today =
        new Date().toISOString().slice(0, 10);

    const present =
        attendanceRecords.filter(
            record =>
                record.date === today
        ).length;

    const absent =
        Math.max(0, total - present);

    const percentage =
        total > 0
            ? Math.round((present / total) * 100)
            : 0;

    if ($("totalStudents"))
        $("totalStudents").textContent = total;

    if ($("presentStudents"))
        $("presentStudents").textContent = present;

    if ($("absentStudents"))
        $("absentStudents").textContent = absent;

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
            "আগে Login করো।",
            "error"
        );
        return;
    }

    const name = $("faceName").value.trim();
    const roll = $("faceRoll").value.trim();
    const college = $("collegeName").value.trim();
    const department = $("departmentName").value.trim();
    const mobile = $("faceMobile").value.trim();
    const email = $("faceEmail").value.trim();

    if (!name || !roll || !college || !department || !mobile) {

        $("registrationMessage").textContent =
            "⚠️ সব required details পূরণ করো।";

        return;
    }

    try {

        const video =
            $("registrationCamera");

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        video.srcObject = stream;

        $("registrationStatus").textContent =
            "Camera is ON";

        $("registrationMessage").textContent =
            "📸 Face camera-র সামনে রাখো...";

        await new Promise(
            resolve => setTimeout(resolve, 2500)
        );

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceLandmarks()
                .withFaceDescriptor();

        if (!detection) {

            $("registrationMessage").textContent =
                "❌ Face detect হয়নি। আবার চেষ্টা করো।";

            stream.getTracks().forEach(
                track => track.stop()
            );

            return;
        }

        const descriptor =
            Array.from(detection.descriptor);

        const index =
            students.findIndex(
                s => s.uid === currentUser.uid
            );

        if (index !== -1) {

            students[index].name = name;
            students[index].roll = roll;
            students[index].college = college;
            students[index].department = department;
            students[index].mobile = mobile;
            students[index].email = email;
            students[index].faceDescriptor = descriptor;

            currentUser = students[index];

            saveStudents();
        }

        $("registrationMessage").textContent =
            "✅ Face successfully registered!";

        stream.getTracks().forEach(
            track => track.stop()
        );

        $("registrationStatus").textContent =
            "Camera is OFF";

        displayStudents();

    } catch (error) {

        console.error(error);

        $("registrationMessage").textContent =
            "❌ Camera/Face registration failed.";
    }
}


// ============================================================
// FACE ATTENDANCE
// ============================================================

async function startFaceAttendance() {

    if (!currentUser) {

        $("attendanceResult").textContent =
            "❌ আগে Login করো।";

        return;
    }

    try {

        const video =
            $("attendanceCamera");

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        video.srcObject = stream;

        $("attendanceStatus").textContent =
            "Camera is ON";

        $("attendanceResult").textContent =
            "📸 Face detect করা হচ্ছে...";

        await new Promise(
            resolve => setTimeout(resolve, 2000)
        );

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceLandmarks()
                .withFaceDescriptor();

        if (!detection) {

            $("attendanceResult").textContent =
                "❌ Face detect হয়নি। আবার চেষ্টা করো।";

            stream.getTracks().forEach(
                track => track.stop()
            );

            return;
        }

        const today =
            new Date().toISOString().slice(0, 10);

        const alreadyMarked =
            attendanceRecords.some(
                record =>
                    record.uid === currentUser.uid &&
                    record.date === today
            );

        if (alreadyMarked) {

            $("attendanceResult").textContent =
                "ℹ️ আজকের attendance already marked.";

            stream.getTracks().forEach(
                track => track.stop()
            );

            return;
        }

        attendanceRecords.push({
            uid: currentUser.uid,
            name: currentUser.name,
            mobile: currentUser.mobile,
            email: currentUser.email,
            date: today,
            time: new Date().toLocaleTimeString("en-IN"),
            status: "Present"
        });

        saveAttendance();

        updateDashboardCards();

        $("attendanceResult").textContent =
            "✅ Attendance marked successfully!";

        stream.getTracks().forEach(
            track => track.stop()
        );

        $("attendanceStatus").textContent =
            "Camera is OFF";

        // Notification function
        sendAttendanceNotification(currentUser);

    } catch (error) {

        console.error(error);

        $("attendanceResult").textContent =
            "❌ Face attendance failed.";
    }
}


// ============================================================
// ATTENDANCE NOTIFICATION
// ============================================================

function sendAttendanceNotification(student) {

    /*
       IMPORTANT:

       Browser থেকে সরাসরি SMS/Email পাঠানো যায় না।

       এই function এখন confirmation message দেখাচ্ছে।
       Real SMS/Email notification-এর জন্য backend/email service
       লাগবে।
    */

    console.log(
        "Attendance notification:",
        student.name,
        student.mobile,
        student.email
    );

    if ($("attendanceResult")) {

        $("attendanceResult").textContent +=
            " 📱 Attendance notification ready.";
    }
}


// ============================================================
// STUDENT LIST
// ============================================================

function displayStudents() {

    const list =
        $("studentList");

    if (!list) return;

    const search =
        ($("searchStudent")?.value || "")
            .toLowerCase();

    const filtered =
        students.filter(student => {

            return (
                student.name
                    .toLowerCase()
                    .includes(search) ||

                (student.roll || "")
                    .toLowerCase()
                    .includes(search)
            );
        });

    if (filtered.length === 0) {

        list.innerHTML =
            "<p>No students found.</p>";

        return;
    }

    list.innerHTML =
        filtered.map(student => {

            return `
                <div class="student-item">

                    <strong>
                        👤 ${escapeHTML(student.name)}
                    </strong>

                    <br>

                    🔢 Roll:
                    ${escapeHTML(student.roll || "Not added")}

                    <br>

                    📱 Mobile:
                    ${escapeHTML(student.mobile)}

                    <br>

                    🎓 Department:
                    ${escapeHTML(student.department || "Not added")}

                </div>
            `;

        }).join("");
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// EDIT DETAILS
// ============================================================

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

    const index =
        students.findIndex(
            s => s.uid === currentUser.uid
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

    students[index].mobile =
        $("editMobile").value.trim();

    students[index].email =
        $("editEmail").value.trim();

    currentUser =
        students[index];

    saveStudents();

    closeEditDetails();

    displayStudents();

    alert("✅ Details updated successfully.");
}


// ============================================================
// REGISTERED STUDENTS MODAL
// ============================================================

function showRegisteredStudents() {

    const modal =
        $("studentsModal");

    const list =
        $("registeredStudentsList");

    if (!modal || !list) return;

    list.innerHTML =
        students.map((student, index) => {

            return `
                <div class="student-item">

                    <strong>
                        ${index + 1}. ${escapeHTML(student.name)}
                    </strong>

                    <br>

                    📱 ${escapeHTML(student.mobile)}

                    <br>

                    🔢 ${escapeHTML(student.roll || "No Roll")}

                </div>
            `;

        }).join("");

    modal.style.display =
        "flex";
}


function closeRegisteredStudents() {

    $("studentsModal").style.display =
        "none";
}


// ============================================================
// CHECK ATTENDANCE
// ============================================================

function showCheckAttendance() {

    if (!currentUser) return;

    const records =
        attendanceRecords.filter(
            record =>
                record.uid === currentUser.uid
        );

    const total =
        records.length;

    const present =
        records.filter(
            r => r.status === "Present"
        ).length;

    const absent =
        Math.max(0, total - present);

    $("attendanceTotalDays").textContent =
        total;

    $("attendancePresentDays").textContent =
        present;

    $("attendanceAbsentDays").textContent =
        absent;

    $("attendanceHistory").innerHTML =
        records.length
            ? records.map(record => `
                <div class="student-item">
                    📅 ${record.date}
                    <br>
                    🕐 ${record.time}
                    <br>
                    ✅ ${record.status}
                </div>
            `).join("")
            : "<p>No attendance history found.</p>";

    $("attendanceCheckModal").style.display =
        "flex";
}


function closeCheckAttendance() {

    $("attendanceCheckModal").style.display =
        "none";
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
// MOBILE / EMAIL UPDATE
// ============================================================

function openMobileUpdate() {

    if (!currentUser) return;

    const mobile =
        prompt(
            "Enter new 10 digit mobile number:",
            currentUser.mobile || ""
        );

    if (!mobile) return;

    if (!/^\d{10}$/.test(mobile)) {

        alert("❌ Invalid mobile number.");

        return;
    }

    const index =
        students.findIndex(
            s => s.uid === currentUser.uid
        );

    if (index !== -1) {

        students[index].mobile =
            mobile;

        currentUser =
            students[index];

        saveStudents();

        alert("✅ Mobile number updated.");
    }
}


function openEmailUpdate() {

    if (!currentUser) return;

    const email =
        prompt(
            "Enter email address:",
            currentUser.email || ""
        );

    if (email === null) return;

    const index =
        students.findIndex(
            s => s.uid === currentUser.uid
        );

    if (index !== -1) {

        students[index].email =
            email.trim();

        currentUser =
            students[index];

        saveStudents();

        alert("✅ Email updated.");
    }
}


// ============================================================
// LOAD DETAILS
// ============================================================

function loadMyDetails() {

    if (!currentUser) return;

    if ($("faceName"))
        $("faceName").value =
            currentUser.name || "";

    if ($("faceMobile"))
        $("faceMobile").value =
            currentUser.mobile || "";

    if ($("faceEmail"))
        $("faceEmail").value =
            currentUser.email || "";

    if ($("collegeName"))
        $("collegeName").value =
            currentUser.college ||
            "Hooghly Engineering & Technology College";

    if ($("departmentName"))
        $("departmentName").value =
            currentUser.department || "";

    if ($("faceRoll"))
        $("faceRoll").value =
            currentUser.roll || "";
}


// ============================================================
// MENU
// ============================================================

function toggleMenu() {

    const menu =
        $("mainMenu");

    if (!menu) return;

    menu.classList.toggle("show");
}


// ============================================================
// LOGOUT
// ============================================================

function logoutUser() {

    currentUser = null;

    showPage("loginPage");

    $("loginName").value = "";
    $("loginMobile").value = "";
    $("loginPin").value = "";

    console.log("Logged out.");
}


// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Login
        $("loginButton")
            ?.addEventListener(
                "click",
                loginUser
            );


        // Create account
        $("createAccountButton")
            ?.addEventListener(
                "click",
                () => {

                    showPage(
                        "createAccountPage"
                    );

                    setTimeout(
                        setupCreateRecaptcha,
                        300
                    );
                }
            );


        // Create OTP
        $("sendCreateOtpButton")
            ?.addEventListener(
                "click",
                sendCreateOTP
            );


        // Verify Create OTP
        $("verifyCreateOtpButton")
            ?.addEventListener(
                "click",
                verifyCreateOTP
            );


        // Back to Login
        $("backToLoginButton")
            ?.addEventListener(
                "click",
                () => {
                    showPage("loginPage");
                }
            );


        // Forgot PIN
        $("forgotPinButton")
            ?.addEventListener(
                "click",
                () => {

                    showPage(
                        "forgotPinPage"
                    );

                    setTimeout(
                        setupForgotRecaptcha,
                        300
                    );
                }
            );


        // Forgot OTP
        $("sendForgotOtpButton")
            ?.addEventListener(
                "click",
                sendForgotOTP
            );


        // Reset PIN
        $("resetPinButton")
            ?.addEventListener(
                "click",
                resetPIN
            );


        // Forgot back
        $("forgotBackButton")
            ?.addEventListener(
                "click",
                () => {
                    showPage("loginPage");
                }
            );


        // Initial page
        showPage("loginPage");

        console.log(
            "Smart Attendance System loaded successfully ✅"
        );
    }
);


// ============================================================
// MAKE INLINE HTML FUNCTIONS AVAILABLE
// ============================================================

window.startAutomaticFaceRegistration =
    startAutomaticFaceRegistration;

window.startFaceAttendance =
    startFaceAttendance;

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

window.displayStudents =
    displayStudents;

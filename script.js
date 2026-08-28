// ============================================================
// SMART ATTENDANCE SYSTEM - script.js
// ============================================================

let currentUser = null;
let registrationStream = null;
let attendanceStream = null;

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

function escapeHTML(value) {
    return String(value || "")
        .replace(/[&<>"']/g, char => {

            const map = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return map[char];
        });
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
// LOGIN
// ============================================================

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
            "Please enter mobile number or email.",
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


    const identityIsMobile =
        /^\d+$/.test(
            identity.replace(/\s/g, "")
        );


    const student =
        registeredStudents.find(student => {

            const sameName =
                student.name.toLowerCase() ===
                name.toLowerCase();

            const sameMobile =
                student.mobile === mobile;

            const sameEmail =
                student.email &&
                student.email.toLowerCase() ===
                identity.toLowerCase();

            if (identityIsMobile) {
                return sameName && sameMobile && student.pin === pin;
            }

            return sameName && sameEmail && student.pin === pin;
        });


    if (!student) {

        showMessage(
            "loginMessage",
            "Name, mobile/email or PIN does not match.",
            "error"
        );

        return;
    }


    currentUser = student;

    showMessage(
        "loginMessage",
        "Login successful! ✅",
        "success"
    );


    setTimeout(() => {

        openDashboard(student);

    }, 400);
}


// ============================================================
// CREATE ACCOUNT
// ============================================================

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
            "Enter a valid 10 digit mobile number.",
            "error"
        );

        return;
    }


    if (email && !validEmail(email)) {

        showMessage(
            "createMessage",
            "Enter a valid email address.",
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
            "College name is required.",
            "error"
        );

        return;
    }


    if (!department) {

        showMessage(
            "createMessage",
            "Please enter your department.",
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


    const student = {

        id:
            "student_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        name: name,

        mobile: mobile,

        email: email,

        pin: pin,

        roll: roll,

        college:
            "Hooghly Engineering & Technology College",

        department: department,

        faceDescriptor: null,

        registeredAt:
            new Date().toISOString()
    };


    registeredStudents.push(student);

    saveStudents();

    currentUser = student;


    showMessage(
        "createMessage",
        "Account created successfully! ✅",
        "success"
    );


    setTimeout(() => {

        openDashboard(student);

    }, 700);
}


// ============================================================
// FORGOT PIN
// ============================================================

function resetPIN() {

    const name =
        $("forgotName")?.value.trim();

    const identity =
        $("forgotIdentity")?.value.trim();

    const newPin =
        $("newPin")?.value.trim();

    const confirmNewPin =
        $("confirmNewPin")?.value.trim();


    if (!name || !identity) {

        showMessage(
            "forgotMessage",
            "Enter your name and mobile/email.",
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


    const identityIsMobile =
        /^\d+$/.test(
            identity.replace(/\s/g, "")
        );


    const student =
        registeredStudents.find(s => {

            const sameName =
                s.name.toLowerCase() ===
                name.toLowerCase();

            if (identityIsMobile) {

                return (
                    sameName &&
                    s.mobile === mobile
                );
            }


            return (
                sameName &&
                s.email &&
                s.email.toLowerCase() ===
                identity.toLowerCase()
            );
        });


    if (!student) {

        showMessage(
            "forgotMessage",
            "Name and mobile/email do not match.",
            "error"
        );

        return;
    }


    student.pin = newPin;

    saveStudents();


    showMessage(
        "forgotMessage",
        "PIN reset successfully! ✅",
        "success"
    );


    setTimeout(() => {

        showPage("loginPage");

        $("loginName").value =
            student.name;

        $("loginIdentity").value =
            identity;

    }, 1000);
}


// ============================================================
// DASHBOARD
// ============================================================

function openDashboard(student) {

    showPage("dashboardPage");

    currentUser = student;


    fillFaceRegistrationFields(student);

    updateDashboard();

    updateDate();

    displayStudents();


    $("dashboardUserName").textContent =
        student.name || "Student";

    $("dashboardUserRoll").textContent =
        "Roll: " +
        (student.roll || "Not added");

    $("welcomeName").textContent =
        student.name || "Student";
}


// ============================================================
// FACE FIELDS
// ============================================================

function fillFaceRegistrationFields(student) {

    if (!student) return;


    $("faceName").value =
        student.name || "";

    $("faceRoll").value =
        student.roll || "";

    $("collegeName").value =
        "Hooghly Engineering & Technology College";

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
        getToday();


    let present = 0;


    registeredStudents.forEach(student => {

        const records =
            attendanceData[student.id] || [];


        if (
            records.some(
                r =>
                    r.date === today &&
                    r.status === "Present"
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


function getToday() {

    const now =
        new Date();

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


// ============================================================
// SECTION NAVIGATION
// ============================================================

function showDashboardSection(section) {

    const sections = [

        "dashboardHome",

        "faceRegistrationSection",

        "attendanceSection",

        "studentsSection"

    ];


    sections.forEach(id => {

        const el = $(id);

        if (el) {

            el.style.display =
                id === section
                    ? "block"
                    : "none";
        }

    });


    document
        .querySelectorAll(".menu-item")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });
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

    const department =
        $("departmentName").value.trim();

    const mobile =
        cleanMobile(
            $("faceMobile").value
        );


    if (!name || !roll || !department) {

        showMessage(
            "registrationMessage",
            "Please fill Name, Roll and Department.",
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
            "Camera ON";

        $("registrationMessage").textContent =
            "Camera started. Capturing face...";


        await new Promise(resolve =>
            setTimeout(resolve, 2000)
        );


        let descriptor = null;


        if (
            typeof faceapi !== "undefined"
        ) {

            descriptor =
                await detectFaceDescriptor(
                    video
                );
        }


        const student =
            registeredStudents.find(
                s =>
                    s.id === currentUser.id
            );


        if (student) {

            student.name =
                name;

            student.roll =
                roll;

            student.college =
                "Hooghly Engineering & Technology College";

            student.department =
                department;

            student.mobile =
                mobile;

            student.email =
                $("faceEmail").value.trim();


            if (descriptor) {

                student.faceDescriptor =
                    Array.from(
                        descriptor
                    );
            }


            saveStudents();

            currentUser =
                student;
        }


        $("registrationMessage").textContent =
            descriptor
                ? "Face registered successfully ✅"
                : "Details saved. Face model is not loaded yet.";


        stopRegistrationCamera();

        updateDashboard();

        displayStudents();

    }

    catch (error) {

        console.error(error);

        showMessage(
            "registrationMessage",
            "Camera error: " +
            error.message,
            "error"
        );

        stopRegistrationCamera();
    }
}


// ============================================================
// FACE DETECTION
// ============================================================

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
// ATTENDANCE
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


        await new Promise(resolve =>
            setTimeout(resolve, 2000)
        );


        let student =
            null;


        if (
            typeof faceapi !== "undefined"
        ) {

            const descriptor =
                await detectFaceDescriptor(
                    video
                );


            if (descriptor) {

                student =
                    findMatchingStudent(
                        descriptor
                    );
            }
        }


        if (!student) {

            student =
                currentUser;
        }


        const marked =
            markAttendance(student);


        stopAttendanceCamera();

        updateDashboard();


        if (marked) {

            $("attendanceResult").textContent =
                "Attendance marked successfully ✅";


            showAttendancePopup(
                "✅",
                "Attendance Marked!",
                student.name +
                " — Attendance saved successfully."
            );

        } else {

            $("attendanceResult").textContent =
                "Today's attendance is already marked ✅";


            showAttendancePopup(
                "ℹ️",
                "Already Marked",
                "Today's attendance is already saved."
            );
        }

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
// MATCH FACE
// ============================================================

function findMatchingStudent(descriptor) {

    if (
        typeof faceapi === "undefined"
    ) {
        return null;
    }


    let bestStudent =
        null;

    let bestDistance =
        Infinity;


    registeredStudents.forEach(student => {

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

    });


    if (
        bestStudent &&
        bestDistance < 0.6
    ) {

        return bestStudent;
    }


    return null;
}


// ============================================================
// SAVE ATTENDANCE
// ============================================================

function markAttendance(student) {

    const today =
        getToday();


    if (!attendanceData[student.id]) {

        attendanceData[student.id] =
            [];
    }


    const alreadyMarked =
        attendanceData[student.id]
            .some(
                record =>
                    record.date === today
            );


    if (alreadyMarked) {
        return false;
    }


    attendanceData[student.id].push({

        date: today,

        time:
            new Date()
                .toLocaleTimeString(
                    "en-IN"
                ),

        status: "Present"

    });


    saveAttendance();

    return true;
}


// ============================================================
// ATTENDANCE POPUP
// ============================================================

function showAttendancePopup(
    icon,
    title,
    message
) {

    $("popupIcon").textContent =
        icon;

    $("popupTitle").textContent =
        title;

    $("popupMessage").textContent =
        message;

    $("attendancePopup").style.display =
        "flex";
}


function closeAttendancePopup() {

    $("attendancePopup").style.display =
        "none";
}


// ============================================================
// STOP CAMERAS
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
// STUDENTS
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
            student =>
                student.name
                    .toLowerCase()
                    .includes(search)
                ||
                (student.roll || "")
                    .toLowerCase()
                    .includes(search)
        );


    if (!students.length) {

        container.innerHTML =
            "<p>No registered students found.</p>";

        return;
    }


    container.innerHTML =
        students.map(student => `

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
                    🏫
                    Hooghly Engineering & Technology College
                </p>

                <p>
                    🎓
                    ${escapeHTML(
                        student.department ||
                        "Not added"
                    )}
                </p>

            </div>

        `).join("");
}


// ============================================================
// MY ATTENDANCE
// ============================================================

function showCheckAttendance() {

    $("attendanceCheckModal").style.display =
        "flex";


    if (!currentUser) return;


    const records =
        attendanceData[currentUser.id] ||
        [];


    const presentDays =
        records.filter(
            r =>
                r.status === "Present"
        ).length;


    $("attendanceTotalDays")
        .textContent =
        records.length;


    $("attendancePresentDays")
        .textContent =
        presentDays;


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
            .map(record => `

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

            `)
            .join("");
}


function closeCheckAttendance() {

    $("attendanceCheckModal").style.display =
        "none";
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
            .map(student => `

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

                </div>

            `)
            .join("");
}


function closeRegisteredStudents() {

    $("studentsModal").style.display =
        "none";
}


// ============================================================
// EDIT DETAILS
// ============================================================

function openEditDetails() {

    if (!currentUser) return;


    const student =
        registeredStudents.find(
            s =>
                s.id === currentUser.id
        );


    if (!student) return;


    $("editName").value =
        student.name || "";

    $("editRoll").value =
        student.roll || "";

    $("editCollege").value =
        "Hooghly Engineering & Technology College";

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
                s.id === currentUser.id
        );


    if (!student) return;


    const name =
        $("editName").value.trim();

    const roll =
        $("editRoll").value.trim();

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
        "Hooghly Engineering & Technology College";

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

    updateDashboard();

    displayStudents();


    alert(
        "Details updated successfully."
    );
}


// ============================================================
// LOGOUT
// ============================================================

function logoutUser() {

    stopRegistrationCamera();

    stopAttendanceCamera();

    currentUser =
        null;


    showPage(
        "loginPage"
    );


    $("loginName").value =
        "";

    $("loginIdentity").value =
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
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        $("loginButton")
            ?.addEventListener(
                "click",
                loginUser
            );


        $("createAccountButton")
            ?.addEventListener(
                "click",
                () => {

                    showPage(
                        "createAccountPage"
                    );

                    $("createName")?.focus();
                }
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


        $("forgotPinButton")
            ?.addEventListener(
                "click",
                () => {

                    showPage(
                        "forgotPinPage"
                    );
                }
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


        $("startFaceRegistrationButton")
            ?.addEventListener(
                "click",
                startAutomaticFaceRegistration
            );


        $("startFaceAttendanceButton")
            ?.addEventListener(
                "click",
                startFaceAttendance
            );


        $("dashboardMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showDashboardSection(
                        "dashboardHome"
                    );
                }
            );


        $("faceRegistrationMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showDashboardSection(
                        "faceRegistrationSection"
                    );
                }
            );


        $("attendanceMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showDashboardSection(
                        "attendanceSection"
                    );
                }
            );


        $("studentsMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showDashboardSection(
                        "studentsSection"
                    );

                    displayStudents();
                }
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


        $("quickFaceRegistration")
            ?.addEventListener(
                "click",
                () => {

                    showDashboardSection(
                        "faceRegistrationSection"
                    );
                }
            );


        $("quickAttendance")
            ?.addEventListener(
                "click",
                () => {

                    showDashboardSection(
                        "attendanceSection"
                    );
                }
            );


        $("quickCheckAttendance")
            ?.addEventListener(
                "click",
                showCheckAttendance
            );


        $("logoutButton")
            ?.addEventListener(
                "click",
                logoutUser
            );


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


        $("saveEditedDetailsButton")
            ?.addEventListener(
                "click",
                saveEditedDetails
            );


        $("searchStudent")
            ?.addEventListener(
                "input",
                displayStudents
            );


        [
            "loginName",
            "loginIdentity",
            "loginPin"
        ].forEach(id => {

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

        });


        updateDate();

        setInterval(
            updateDate,
            60000
        );

    }
);

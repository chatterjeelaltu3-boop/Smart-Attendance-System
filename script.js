// ============================================================
// SMART ATTENDANCE SYSTEM - script.js
// OTP FREE VERSION
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

function openCreateAccount() {

    showPage("createAccountPage");

    showMessage(
        "createMessage",
        ""
    );

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
            "Please enter college name.",
            "error"
        );
        return;
    }


    if (!department) {
        showMessage(
            "createMessage",
            "Please enter department / branch.",
            "error"
        );
        return;
    }


    if (!roll) {
        showMessage(
            "createMessage",
            "Please enter roll number.",
            "error"
        );
        return;
    }


    const duplicateMobile =
        registeredStudents.find(
            student =>
                student.mobile === mobile
        );


    if (duplicateMobile) {

        showMessage(
            "createMessage",
            "This mobile number is already registered.",
            "error"
        );

        return;
    }


    if (email) {

        const duplicateEmail =
            registeredStudents.find(
                student =>
                    student.email &&
                    student.email.toLowerCase() ===
                    email.toLowerCase()
            );


        if (duplicateEmail) {

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

        name,

        mobile,

        email,

        pin,

        roll,

        college,

        department,

        faceDescriptor: null,

        registeredAt:
            new Date().toISOString()
    };


    registeredStudents.push(student);

    saveStudents();


    currentUser =
        student;

    window.currentStudentId =
        student.id;


    showMessage(
        "createMessage",
        "Account created successfully! ✅",
        "success"
    );


    setTimeout(
        () => {
            openDashboard(student);
        },
        700
    );
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


    const student =
        registeredStudents.find(
            s => {

                const mobileMatch =
                    validMobile(identity) &&
                    s.mobile === mobile;

                const emailMatch =
                    s.email &&
                    s.email.toLowerCase() ===
                    identity.toLowerCase();

                const nameMatch =
                    s.name.toLowerCase() ===
                    name.toLowerCase();

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


    currentUser =
        student;

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


// ============================================================
// FORGOT PIN
// ============================================================

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


    const student =
        registeredStudents.find(
            s => {

                const mobileMatch =
                    validMobile(identity) &&
                    s.mobile === mobile;

                const emailMatch =
                    s.email &&
                    s.email.toLowerCase() ===
                    identity.toLowerCase();

                const nameMatch =
                    s.name.toLowerCase() ===
                    name.toLowerCase();

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


// ============================================================
// DASHBOARD
// ============================================================

function openDashboard(student) {

    showPage("dashboardPage");

    currentUser =
        student;


    fillFaceRegistrationFields(
        student
    );

    updateDashboard();

    updateDate();

    updateProfile();

    displayStudents();
}


function updateProfile() {

    if (!currentUser) return;


    if ($("dashboardUserName")) {

        $("dashboardUserName").textContent =
            currentUser.name || "Student";
    }


    if ($("dashboardUserRoll")) {

        $("dashboardUserRoll").textContent =
            "Roll: " +
            (currentUser.roll || "Not added");
    }


    if ($("welcomeName")) {

        $("welcomeName").textContent =
            currentUser.name || "Student";
    }
}


// ============================================================
// FILL FACE DETAILS
// ============================================================

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
        new Date()
            .toISOString()
            .slice(0, 10);


    let present = 0;


    registeredStudents.forEach(
        student => {

            const records =
                attendanceData[student.id] ||
                [];


            if (
                records.some(
                    r =>
                        r.date === today &&
                        r.status === "Present"
                )
            ) {
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
        $("faceName")?.value.trim();

    const roll =
        $("faceRoll")?.value.trim();

    const college =
        $("collegeName")?.value.trim();

    const department =
        $("departmentName")?.value.trim();


    if (
        !name ||
        !roll ||
        !college ||
        !department
    ) {

        showMessage(
            "registrationMessage",
            "Please fill all student details.",
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
            "Camera ON — detecting face...";


        $("registrationMessage").textContent =
            "Please look directly at the camera.";


        await waitForVideo(
            video
        );


        const descriptor =
            await detectFaceDescriptor(
                video
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
                    s.id === currentUser.id
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

            student.faceDescriptor =
                Array.from(
                    descriptor
                );


            currentUser =
                student;

            saveStudents();
        }


        showMessage(
            "registrationMessage",
            "Face captured and registered successfully ✅",
            "success"
        );


        stopRegistrationCamera();

        fillFaceRegistrationFields(
            currentUser
        );

        updateProfile();

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
// WAIT FOR VIDEO
// ============================================================

function waitForVideo(video) {

    return new Promise(
        resolve => {

            if (
                video.readyState >= 2
            ) {

                setTimeout(
                    resolve,
                    1200
                );

                return;
            }


            video.onloadedmetadata =
                () => {

                    video.play();

                    setTimeout(
                        resolve,
                        1200
                    );
                };
        }
    );
}


// ============================================================
// FACE API
// ============================================================

async function detectFaceDescriptor(video) {

    if (
        typeof faceapi ===
        "undefined"
    ) {

        console.error(
            "face-api.js not loaded."
        );

        return null;
    }


    try {

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions()
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

        $("registrationStatus").textContent =
            "Camera is OFF";
    }
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
            "Please look directly at the camera.";


        await waitForVideo(
            video
        );


        const descriptor =
            await detectFaceDescriptor(
                video
            );


        if (!descriptor) {

            showAttendanceResult(
                "No clear face detected. Please try again.",
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


        const marked =
            markAttendance(
                student
            );


        if (marked) {

            showAttendancePopup(
                student
            );

            showAttendanceResult(
                "Attendance marked successfully ✅",
                "success"
            );

        } else {

            showAttendancePopup(
                student,
                true
            );

            showAttendanceResult(
                "Today's attendance is already marked ✅",
                "info"
            );
        }


        stopAttendanceCamera();

        updateDashboard();
    }

    catch (error) {

        console.error(error);

        showAttendanceResult(
            "Camera error: " +
            error.message,
            "error"
        );

        stopAttendanceCamera();
    }
}


// ============================================================
// MATCH FACE
// ============================================================

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
                    record.date === today
            );


    if (alreadyMarked) {

        return false;
    }


    attendanceData[student.id]
        .push(
            {
                date:
                    today,

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

    return true;
}


// ============================================================
// ATTENDANCE POPUP
// ============================================================

function showAttendancePopup(
    student,
    alreadyMarked = false
) {

    const popup =
        $("attendancePopup");

    if (!popup) return;


    if ($("popupIcon")) {

        $("popupIcon").textContent =
            alreadyMarked
                ? "ℹ️"
                : "✅";
    }


    if ($("popupTitle")) {

        $("popupTitle").textContent =
            alreadyMarked
                ? "Already Marked"
                : "Attendance Marked!";
    }


    if ($("popupMessage")) {

        const today =
            new Date()
                .toLocaleDateString(
                    "en-IN"
                );


        $("popupMessage").textContent =
            alreadyMarked
                ? `${student.name}'s attendance is already saved for ${today}.`
                : `${student.name}'s attendance has been successfully saved for ${today}.`;
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
            student => {

                const name =
                    (student.name || "")
                        .toLowerCase();

                const roll =
                    (student.roll || "")
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
// MY ATTENDANCE
// ============================================================

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
            r =>
                r.status === "Present"
        ).length;


    if ($("attendanceTotalDays"))
        $("attendanceTotalDays").textContent =
            records.length;


    if ($("attendancePresentDays"))
        $("attendancePresentDays").textContent =
            presentDays;


    if ($("attendanceAbsentDays"))
        $("attendanceAbsentDays").textContent =
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
                        ${escapeHTML(
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
                s.id === currentUser.id
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
        "Details updated successfully."
    );
}


// ============================================================
// MENU
// ============================================================

function showDashboardHome() {

    showDashboardSection(
        "dashboardHome"
    );
}


function showFaceRegistration() {

    showDashboardSection(
        "faceRegistrationSection"
    );
}


function showAttendanceSection() {

    showDashboardSection(
        "attendanceSection"
    );
}


function showStudentsSection() {

    showDashboardSection(
        "studentsSection"
    );

    displayStudents();
}


function showDashboardSection(sectionId) {

    const sections = [
        "dashboardHome",
        "faceRegistrationSection",
        "attendanceSection",
        "studentsSection"
    ];


    sections.forEach(
        id => {

            const section =
                $(id);

            if (section) {

                section.style.display =
                    id === sectionId
                        ? "block"
                        : "none";
            }
        }
    );


    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            button =>
                button.classList.remove(
                    "active"
                )
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


// ============================================================
// ESCAPE HTML
// ============================================================

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

window.startAutomaticFaceRegistration =
    startAutomaticFaceRegistration;

window.startFaceAttendance =
    startFaceAttendance;

window.stopRegistrationCamera =
    stopRegistrationCamera;

window.stopAttendanceCamera =
    stopAttendanceCamera;

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

window.logoutUser =
    logoutUser;

window.displayStudents =
    displayStudents;

window.showDashboardHome =
    showDashboardHome;

window.showFaceRegistration =
    showFaceRegistration;

window.showAttendanceSection =
    showAttendanceSection;

window.showStudentsSection =
    showStudentsSection;

window.closeAttendancePopup =
    closeAttendancePopup;


// ============================================================
// DOM READY
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


        // Create Account
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


        // Back
        $("backToLoginButton")
            ?.addEventListener(
                "click",
                () => showPage("loginPage")
            );


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
                () => showPage("loginPage")
            );


        // Face Registration
        $("startFaceRegistrationButton")
            ?.addEventListener(
                "click",
                startAutomaticFaceRegistration
            );


        // Attendance
        $("startFaceAttendanceButton")
            ?.addEventListener(
                "click",
                startFaceAttendance
            );


        // Popup
        $("closeAttendancePopup")
            ?.addEventListener(
                "click",
                closeAttendancePopup
            );


        // Students
        $("closeStudentsModal")
            ?.addEventListener(
                "click",
                closeRegisteredStudents
            );


        // My Attendance
        $("closeCheckAttendanceModal")
            ?.addEventListener(
                "click",
                closeCheckAttendance
            );


        // Edit Details
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


        // Menu
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


        // Quick Actions
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


        // Logout
        $("logoutButton")
            ?.addEventListener(
                "click",
                logoutUser
            );


        // Search
        $("searchStudent")
            ?.addEventListener(
                "input",
                displayStudents
            );


        // Enter Login
        [
            "loginName",
            "loginIdentity",
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

```javascript
/* ============================================================
   SMART ATTENDANCE SYSTEM
   script.js
============================================================ */

const ADMIN_NAME = "Ayush Chatterjee";
const COLLEGE_NAME = "Hooghly Engineering & Technology College";

let currentUser = null;
let registrationStream = null;
let attendanceStream = null;
let faceModelsLoaded = false;


/* ============================================================
   STORAGE
============================================================ */

function getUsers() {
    return JSON.parse(localStorage.getItem("smartAttendanceUsers") || "[]");
}

function saveUsers(users) {
    localStorage.setItem("smartAttendanceUsers", JSON.stringify(users));
}

function getAttendance() {
    return JSON.parse(localStorage.getItem("smartAttendanceRecords") || "[]");
}

function saveAttendance(records) {
    localStorage.setItem("smartAttendanceRecords", JSON.stringify(records));
}


/* ============================================================
   HELPERS
============================================================ */

function $(id) {
    return document.getElementById(id);
}

function showMessage(id, message, type = "info") {
    const el = $(id);

    if (!el) return;

    el.textContent = message;
    el.className = `auth-message ${type}`;
}

function hideAllPages() {
    const pages = [
        "loginPage",
        "createAccountPage",
        "forgotPinPage",
        "dashboardPage"
    ];

    pages.forEach(id => {
        if ($(id)) {
            $(id).style.display = "none";
        }
    });
}

function showPage(id) {
    hideAllPages();

    if ($(id)) {
        $(id).style.display = id === "dashboardPage" ? "flex" : "flex";
    }
}

function validPin(pin) {
    return /^\d{4}$/.test(pin);
}

function validMobile(mobile) {
    return /^\d{10}$/.test(mobile);
}

function todayString() {
    return new Date().toISOString().split("T")[0];
}

function formatDate(date) {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

function formatTime(date) {
    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

function formatDay(date) {
    return date.toLocaleDateString("en-IN", {
        weekday: "long"
    });
}


/* ============================================================
   LOGIN
============================================================ */

function loginUser() {

    const name = $("loginName").value.trim();
    const identity = $("loginIdentity").value.trim();
    const pin = $("loginPin").value.trim();

    if (!name || !identity || !pin) {
        showMessage(
            "loginMessage",
            "Please fill all login fields.",
            "error"
        );
        return;
    }

    if (!validPin(pin)) {
        showMessage(
            "loginMessage",
            "PIN must contain exactly 4 digits.",
            "error"
        );
        return;
    }

    /*
       ADMIN LOGIN
    */

    if (
        name.toLowerCase() === ADMIN_NAME.toLowerCase() &&
        pin === "1234"
    ) {

        currentUser = {
            name: ADMIN_NAME,
            mobile: "",
            email: "",
            college: COLLEGE_NAME,
            department: "Administration",
            roll: "ADMIN",
            role: "admin"
        };

        localStorage.setItem(
            "smartAttendanceCurrentUser",
            JSON.stringify(currentUser)
        );

        openDashboard();
        return;
    }


    /*
       STUDENT LOGIN
    */

    const users = getUsers();

    const user = users.find(u => {

        const identityMatch =
            u.mobile === identity ||
            (
                u.email &&
                u.email.toLowerCase() === identity.toLowerCase()
            );

        return (
            u.name.toLowerCase() === name.toLowerCase() &&
            identityMatch &&
            u.pin === pin
        );
    });


    if (!user) {

        showMessage(
            "loginMessage",
            "Invalid name, mobile/email or PIN.",
            "error"
        );

        return;
    }


    currentUser = user;

    localStorage.setItem(
        "smartAttendanceCurrentUser",
        JSON.stringify(currentUser)
    );

    openDashboard();
}


/* ============================================================
   CREATE ACCOUNT
============================================================ */

function createAccount() {

    const name = $("createName").value.trim();
    const mobile = $("createMobile").value.trim();
    const email = $("createEmail").value.trim();
    const pin = $("createPin").value.trim();
    const confirmPin = $("confirmPin").value.trim();
    const department = $("createDepartment").value.trim();
    const roll = $("createRoll").value.trim();

    if (!name || !mobile || !pin || !confirmPin || !department || !roll) {

        showMessage(
            "createMessage",
            "Please fill all required fields.",
            "error"
        );

        return;
    }


    if (!validMobile(mobile)) {

        showMessage(
            "createMessage",
            "Mobile number must contain 10 digits.",
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


    const users = getUsers();


    if (
        users.some(
            u =>
                u.mobile === mobile ||
                (
                    email &&
                    u.email &&
                    u.email.toLowerCase() === email.toLowerCase()
                )
        )
    ) {

        showMessage(
            "createMessage",
            "This mobile number or email is already registered.",
            "error"
        );

        return;
    }


    const newUser = {

        id: Date.now().toString(),

        name,
        mobile,
        email,

        pin,

        college: COLLEGE_NAME,

        department,
        roll,

        role: "student",

        faceRegistered: false,

        faceData: null,

        createdAt: new Date().toISOString()

    };


    users.push(newUser);

    saveUsers(users);


    currentUser = newUser;

    localStorage.setItem(
        "smartAttendanceCurrentUser",
        JSON.stringify(currentUser)
    );


    showMessage(
        "createMessage",
        "Account created successfully!",
        "success"
    );


    setTimeout(() => {

        openDashboard();

    }, 700);
}


/* ============================================================
   FORGOT PIN
============================================================ */

function resetPin() {

    const name = $("forgotName").value.trim();
    const identity = $("forgotIdentity").value.trim();
    const newPin = $("newPin").value.trim();
    const confirmPin = $("confirmNewPin").value.trim();

    if (!name || !identity || !newPin || !confirmPin) {

        showMessage(
            "forgotMessage",
            "Please fill all fields.",
            "error"
        );

        return;
    }


    if (!validPin(newPin)) {

        showMessage(
            "forgotMessage",
            "PIN must contain exactly 4 digits.",
            "error"
        );

        return;
    }


    if (newPin !== confirmPin) {

        showMessage(
            "forgotMessage",
            "PINs do not match.",
            "error"
        );

        return;
    }


    const users = getUsers();

    const index = users.findIndex(u => {

        const identityMatch =
            u.mobile === identity ||
            (
                u.email &&
                u.email.toLowerCase() === identity.toLowerCase()
            );

        return (
            u.name.toLowerCase() === name.toLowerCase() &&
            identityMatch
        );
    });


    if (index === -1) {

        showMessage(
            "forgotMessage",
            "Account not found.",
            "error"
        );

        return;
    }


    users[index].pin = newPin;

    saveUsers(users);


    showMessage(
        "forgotMessage",
        "PIN reset successfully. You can login now.",
        "success"
    );
}


/* ============================================================
   DASHBOARD
============================================================ */

function openDashboard() {

    showPage("dashboardPage");

    updateDashboard();

    showDashboardHome();

    updateCurrentDate();
}


/* ============================================================
   DASHBOARD SECTIONS
============================================================ */

function hideDashboardSections() {

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


    sections.forEach(id => {

        if ($(id)) {
            $(id).style.display = "none";
        }

    });


    document
        .querySelectorAll(".menu-item")
        .forEach(button => {

            button.classList.remove("active");

        });
}


function showDashboardHome() {

    hideDashboardSections();

    $("dashboardHome").style.display = "block";

    if ($("dashboardMenuButton")) {
        $("dashboardMenuButton").classList.add("active");
    }

    updateDashboard();
}


function showSection(sectionId, buttonId) {

    hideDashboardSections();

    if ($(sectionId)) {
        $(sectionId).style.display = "block";
    }

    if ($(buttonId)) {
        $(buttonId).classList.add("active");
    }
}


/* ============================================================
   DASHBOARD DATA
============================================================ */

function updateDashboard() {

    if (!currentUser) return;


    $("dashboardUserName").textContent =
        currentUser.name || ADMIN_NAME;


    $("dashboardUserRoll").textContent =
        currentUser.role === "admin"
            ? "Admin"
            : `Roll: ${currentUser.roll || "-"}`;


    $("welcomeName").textContent =
        currentUser.name || ADMIN_NAME;


    updateStatistics();

    updatePersonalDetails();
}


function updateCurrentDate() {

    const now = new Date();

    if ($("currentDate")) {

        $("currentDate").textContent =
            `${formatDay(now)}, ${formatDate(now)} • ${formatTime(now)}`;

    }
}


/* ============================================================
   STATISTICS
============================================================ */

function updateStatistics() {

    const users = getUsers();

    const records = getAttendance();

    const today = todayString();


    const presentToday = records.filter(
        record => record.date === today
    );


    const totalStudents = users.length;

    const presentCount =
        new Set(
            presentToday.map(record => record.userId)
        ).size;


    const absentCount =
        Math.max(totalStudents - presentCount, 0);


    const percentage =
        totalStudents > 0
            ? Math.round((presentCount / totalStudents) * 100)
            : 0;


    if ($("totalStudents")) {
        $("totalStudents").textContent =
            totalStudents;
    }


    if ($("presentStudents")) {
        $("presentStudents").textContent =
            presentCount;
    }


    if ($("absentStudents")) {
        $("absentStudents").textContent =
            absentCount;
    }


    if ($("attendancePercentage")) {
        $("attendancePercentage").textContent =
            `${percentage}%`;
    }
}


/* ============================================================
   PERSONAL DETAILS
============================================================ */

function updatePersonalDetails() {

    if (!currentUser) return;


    if ($("personalName")) {
        $("personalName").textContent =
            currentUser.name || "-";
    }


    if ($("personalMobile")) {
        $("personalMobile").textContent =
            currentUser.mobile || "-";
    }


    if ($("personalEmail")) {
        $("personalEmail").textContent =
            currentUser.email || "-";
    }


    if ($("personalDepartment")) {
        $("personalDepartment").textContent =
            currentUser.department || "-";
    }


    if ($("personalRoll")) {
        $("personalRoll").textContent =
            currentUser.roll || "-";
    }
}


/* ============================================================
   EDIT PROFILE
============================================================ */

function openEditProfile() {

    showSection(
        "editProfileSection",
        "editProfileMenuButton"
    );


    if ($("editName")) {
        $("editName").value =
            currentUser.name || "";
    }


    if ($("editRoll")) {
        $("editRoll").value =
            currentUser.roll || "";
    }


    if ($("editDepartment")) {
        $("editDepartment").value =
            currentUser.department || "";
    }
}


function saveProfile() {

    const name = $("editName").value.trim();
    const roll = $("editRoll").value.trim();
    const department = $("editDepartment").value.trim();


    if (!name || !roll || !department) {
        alert("Please fill all profile details.");
        return;
    }


    currentUser.name = name;
    currentUser.roll = roll;
    currentUser.department = department;


    updateStoredCurrentUser();

    updateDashboard();

    alert("Profile updated successfully.");
}


/* ============================================================
   EDIT CONTACT
============================================================ */

function openEditContact() {

    showSection(
        "editContactSection",
        "editContactMenuButton"
    );


    $("editMobile").value =
        currentUser.mobile || "";


    $("editEmail").value =
        currentUser.email || "";
}


function saveContact() {

    const mobile = $("editMobile").value.trim();
    const email = $("editEmail").value.trim();


    if (!validMobile(mobile)) {

        showMessage(
            "contactMessage",
            "Enter a valid 10 digit mobile number.",
            "error"
        );

        return;
    }


    currentUser.mobile = mobile;
    currentUser.email = email;


    updateStoredCurrentUser();


    showMessage(
        "contactMessage",
        "Contact details updated successfully.",
        "success"
    );


    updateDashboard();
}


/* ============================================================
   SAVE CURRENT USER
============================================================ */

function updateStoredCurrentUser() {

    localStorage.setItem(
        "smartAttendanceCurrentUser",
        JSON.stringify(currentUser)
    );


    if (currentUser.role === "student") {

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
}


/* ============================================================
   FACE REGISTRATION
============================================================ */

async function startFaceRegistration() {

    if (!currentUser) return;


    const name =
        $("faceName").value.trim();

    const mobile =
        $("faceMobile").value.trim();

    const email =
        $("faceEmail").value.trim();

    const department =
        $("departmentName").value.trim();

    const roll =
        $("faceRoll").value.trim();


    if (!name || !mobile || !department || !roll) {

        showMessage(
            "registrationMessage",
            "Please fill Name, Mobile, Branch and Roll.",
            "error"
        );

        return;
    }


    try {

        if (!faceModelsLoaded) {

            showMessage(
                "registrationMessage",
                "Loading face recognition model...",
                "info"
            );

            await loadFaceModels();

        }


        registrationStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });


        const video =
            $("registrationCamera");


        video.srcObject =
            registrationStream;


        $("registrationStatus").textContent =
            "Camera ON • Looking for face...";


        showMessage(
            "registrationMessage",
            "Look straight at the camera. Face capture will happen automatically.",
            "info"
        );


        waitForFaceRegistration();

    } catch (error) {

        console.error(error);

        showMessage(
            "registrationMessage",
            "Camera permission is required.",
            "error"
        );

    }
}


/* ============================================================
   AUTOMATIC FACE REGISTRATION
============================================================ */

async function waitForFaceRegistration() {

    const video = $("registrationCamera");

    let attempts = 0;

    const timer = setInterval(async () => {

        attempts++;


        if (
            !video.videoWidth ||
            !video.videoHeight
        ) {
            return;
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


            if (detection) {

                clearInterval(timer);

                saveFaceRegistration(
                    detection.descriptor
                );

            }


            if (attempts > 100) {

                clearInterval(timer);

                showMessage(
                    "registrationMessage",
                    "Face not detected. Please try again.",
                    "error"
                );

            }

        } catch (error) {

            console.error(error);

        }

    }, 250);
}


/* ============================================================
   SAVE FACE
============================================================ */

function saveFaceRegistration(descriptor) {

    const faceData =
        Array.from(descriptor);


    currentUser.name =
        $("faceName").value.trim();

    currentUser.mobile =
        $("faceMobile").value.trim();

    currentUser.email =
        $("faceEmail").value.trim();

    currentUser.college =
        COLLEGE_NAME;

    currentUser.department =
        $("departmentName").value.trim();

    currentUser.roll =
        $("faceRoll").value.trim();

    currentUser.faceRegistered =
        true;

    currentUser.faceData =
        faceData;


    updateStoredCurrentUser();


    stopRegistrationCamera();


    $("registrationStatus").textContent =
        "Face Registered ✓";


    showMessage(
        "registrationMessage",
        "Face captured and registered successfully!",
        "success"
    );
}


/* ============================================================
   FACE ATTENDANCE
============================================================ */

async function startFaceAttendance() {

    if (!currentUser) return;


    try {

        if (!faceModelsLoaded) {

            $("attendanceResult").textContent =
                "Loading face recognition...";

            await loadFaceModels();

        }


        attendanceStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },

                audio: false

            });


        const video =
            $("attendanceCamera");


        video.srcObject =
            attendanceStream;


        $("attendanceStatus").textContent =
            "Camera ON • Detecting face...";


        $("attendanceResult").textContent =
            "Look straight at the camera. Attendance will be captured automatically.";


        waitForAttendanceFace();

    } catch (error) {

        console.error(error);

        $("attendanceResult").textContent =
            "Camera permission is required.";

    }
}


/* ============================================================
   AUTOMATIC ATTENDANCE
============================================================ */

async function waitForAttendanceFace() {

    const video =
        $("attendanceCamera");


    let attempts = 0;


    const timer =
        setInterval(async () => {

            attempts++;


            if (
                !video.videoWidth ||
                !video.videoHeight
            ) {
                return;
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


                if (detection) {

                    clearInterval(timer);

                    identifyFace(
                        detection.descriptor
                    );

                }


                if (attempts > 100) {

                    clearInterval(timer);

                    $("attendanceResult").textContent =
                        "Face not detected. Please try again.";

                }

            } catch (error) {

                console.error(error);

            }

        }, 300);
}


/* ============================================================
   IDENTIFY FACE
============================================================ */

function identifyFace(descriptor) {

    const users = getUsers();


    let matchedUser = null;

    let smallestDistance = Infinity;


    users.forEach(user => {

        if (
            !user.faceRegistered ||
            !Array.isArray(user.faceData)
        ) {
            return;
        }


        const distance =
            euclideanDistance(
                descriptor,
                user.faceData
            );


        if (
            distance < smallestDistance
        ) {

            smallestDistance =
                distance;

            matchedUser =
                user;

        }

    });


    /*
       If the current logged-in user has a face,
       check it as well.
    */

    if (
        currentUser.faceRegistered &&
        Array.isArray(currentUser.faceData)
    ) {

        const distance =
            euclideanDistance(
                descriptor,
                currentUser.faceData
            );


        if (distance < smallestDistance) {

            smallestDistance =
                distance;

            matchedUser =
                currentUser;

        }
    }


    /*
       Face distance threshold.
       Lower means stricter matching.
    */

    if (
        !matchedUser ||
        smallestDistance > 0.55
    ) {

        stopAttendanceCamera();


        $("attendanceStatus").textContent =
            "Face not recognised";


        $("attendanceResult").textContent =
            "Face not recognised. Please register your face first.";

        return;
    }


    markAttendance(matchedUser);

}


/* ============================================================
   DISTANCE
============================================================ */

function euclideanDistance(a, b) {

    let sum = 0;


    for (
        let i = 0;
        i < Math.min(a.length, b.length);
        i++
    ) {

        const difference =
            a[i] - b[i];

        sum +=
            difference * difference;

    }


    return Math.sqrt(sum);
}


/* ============================================================
   MARK ATTENDANCE
============================================================ */

function markAttendance(user) {

    const now = new Date();

    const date =
        todayString();


    const records =
        getAttendance();


    const alreadyMarked =
        records.some(record =>
            record.userId === user.id &&
            record.date === date
        );


    stopAttendanceCamera();


    if (alreadyMarked) {

        $("attendanceStatus").textContent =
            "Already Marked";


        $("attendanceResult").textContent =
            "Attendance for today is already saved.";


        showAttendancePopup(
            "ℹ️",
            "Attendance Already Marked",
            `${user.name}'s attendance for today is already saved.`
        );


        return;
    }


    const record = {

        id: Date.now().toString(),

        userId: user.id || user.mobile,

        name: user.name,

        mobile: user.mobile || "",

        email: user.email || "",

        college: COLLEGE_NAME,

        department:
            user.department || "",

        branch:
            user.department || "",

        roll:
            user.roll || "",

        date,

        day:
            formatDay(now),

        time:
            formatTime(now),

        timestamp:
            now.toISOString(),

        status:
            "Present"

    };


    records.push(record);

    saveAttendance(records);


    updateDashboard();


    $("attendanceStatus").textContent =
        "Attendance Captured ✓";


    $("attendanceResult").textContent =
        `${user.name} • ${formatDay(now)} • ${formatDate(now)} • ${formatTime(now)}`;


    showAttendancePopup(
        "✅",
        "Attendance Marked!",
        `${user.name}'s attendance has been successfully saved.\n\n${formatDay(now)}\n${formatDate(now)}\n${formatTime(now)}`
    );
}


/* ============================================================
   ATTENDANCE POPUP
============================================================ */

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


/* ============================================================
   ATTENDANCE HISTORY
============================================================ */

function showCheckAttendance() {

    showSection(
        "checkAttendanceSection",
        "checkAttendanceMenuButton"
    );


    renderAttendanceHistory();
}


function renderAttendanceHistory() {

    const records =
        getAttendance();


    let myRecords;


    if (currentUser.role === "admin") {

        myRecords =
            records;

    } else {

        myRecords =
            records.filter(record =>
                record.userId === currentUser.id ||
                record.userId === currentUser.mobile
            );

    }


    myRecords.sort(
        (a, b) =>
            new Date(b.timestamp) -
            new Date(a.timestamp)
    );


    const present =
        myRecords.length;


    const totalDays =
        new Set(
            myRecords.map(record => record.date)
        ).size;


    if ($("attendanceTotalDays")) {

        $("attendanceTotalDays").textContent =
            totalDays;

    }


    if ($("attendancePresentDays")) {

        $("attendancePresentDays").textContent =
            present;

    }


    if ($("attendanceAbsentDays")) {

        $("attendanceAbsentDays").textContent =
            0;

    }


    const container =
        $("attendanceHistory");


    if (!container) return;


    if (myRecords.length === 0) {

        container.innerHTML =
            "<p>No attendance records found.</p>";

        return;
    }


    container.innerHTML =
        myRecords.map(record => `

            <div class="attendance-history-item">

                <div>

                    <strong>
                        ${escapeHtml(record.name)}
                    </strong>

                    <br>

                    <span>
                        ${escapeHtml(record.department || "-")}
                        • Roll: ${escapeHtml(record.roll || "-")}
                    </span>

                </div>

                <div>

                    <b>
                        ${escapeHtml(record.status)}
                    </b>

                    <br>

                    <span>
                        ${escapeHtml(record.day)}
                    </span>

                    <br>

                    <span>
                        ${escapeHtml(record.date)}
                    </span>

                    <br>

                    <span>
                        ${escapeHtml(record.time)}
                    </span>

                </div>

            </div>

        `).join("");
}


/* ============================================================
   STUDENTS
============================================================ */

function showStudents() {

    showSection(
        "studentsSection",
        "studentsMenuButton"
    );


    renderStudents();

}


function renderStudents() {

    const users =
        getUsers();


    const list =
        $("studentList");


    if (!list) return;


    if (users.length === 0) {

        list.innerHTML =
            "<p>No registered students yet.</p>";

        return;
    }


    list.innerHTML =
        users.map(user => `

            <div class="student-item">

                <h3>
                    ${escapeHtml(user.name)}
                </h3>

                <p>
                    📱 Mobile:
                    ${escapeHtml(user.mobile || "-")}
                </p>

                <p>
                    📧 Email:
                    ${escapeHtml(user.email || "-")}
                </p>

                <p>
                    🏫 College:
                    ${COLLEGE_NAME}
                </p>

                <p>
                    🎓 Branch:
                    ${escapeHtml(user.department || "-")}
                </p>

                <p>
                    🔢 Roll:
                    ${escapeHtml(user.roll || "-")}
                </p>

                <p>
                    👤 Face:
                    ${user.faceRegistered ? "Registered ✓" : "Not Registered"}
                </p>

            </div>

        `).join("");
}


/* ============================================================
   ADMIN
============================================================ */

function showAdminPanel() {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        alert("Admin access only.");

        return;
    }


    showSection(
        "adminSection",
        "adminMenuButton"
    );


    renderAdminStudents();
}


function renderAdminStudents() {

    const users =
        getUsers();


    const records =
        getAttendance();


    const list =
        $("adminStudentList");


    if (!list) return;


    if (users.length === 0) {

        list.innerHTML =
            "<p>No students registered yet.</p>";

        return;
    }


    list.innerHTML =
        users.map(user => {

            const studentRecords =
                records.filter(record =>
                    record.userId === user.id ||
                    record.userId === user.mobile
                );


            return `

                <div class="student-item">

                    <h3>
                        ${escapeHtml(user.name)}
                    </h3>

                    <p>
                        📱 Mobile:
                        ${escapeHtml(user.mobile || "-")}
                    </p>

                    <p>
                        📧 Email:
                        ${escapeHtml(user.email || "-")}
                    </p>

                    <p>
                        🎓 Branch:
                        ${escapeHtml(user.department || "-")}
                    </p>

                    <p>
                        🔢 Roll:
                        ${escapeHtml(user.roll || "-")}
                    </p>

                    <p>
                        👤 Face:
                        ${user.faceRegistered ? "Registered ✓" : "Not Registered"}
                    </p>

                    <p>
                        📊 Attendance Records:
                        ${studentRecords.length}
                    </p>

                </div>

            `;

        }).join("");
}


/* ============================================================
   SEARCH STUDENTS
============================================================ */

function searchStudents() {

    const query =
        $("searchStudent")
            .value
            .toLowerCase()
            .trim();


    const users =
        getUsers();


    const filtered =
        users.filter(user =>

            user.name
                .toLowerCase()
                .includes(query)

            ||

            (user.roll || "")
                .toLowerCase()
                .includes(query)

            ||

            (user.department || "")
                .toLowerCase()
                .includes(query)

        );


    const list =
        $("studentList");


    list.innerHTML =
        filtered.map(user => `

            <div class="student-item">

                <h3>
                    ${escapeHtml(user.name)}
                </h3>

                <p>
                    📱 ${escapeHtml(user.mobile || "-")}
                </p>

                <p>
                    📧 ${escapeHtml(user.email || "-")}
                </p>

                <p>
                    🎓 ${escapeHtml(user.department || "-")}
                </p>

                <p>
                    🔢 Roll: ${escapeHtml(user.roll || "-")}
                </p>

            </div>

        `).join("");
}


/* ============================================================
   FACE API MODELS
============================================================ */

async function loadFaceModels() {

    const MODEL_URL =
        "https://justadudewhohacks.github.io/face-api.js/models";


    await faceapi.nets.tinyFaceDetector.loadFromUri(
        MODEL_URL
    );


    await faceapi.nets.faceLandmark68Net.loadFromUri(
        MODEL_URL
    );


    await faceapi.nets.faceRecognitionNet.loadFromUri(
        MODEL_URL
    );


    faceModelsLoaded =
        true;
}


/* ============================================================
   CAMERA CONTROL
============================================================ */

function stopRegistrationCamera() {

    if (registrationStream) {

        registrationStream
            .getTracks()
            .forEach(track =>
                track.stop()
            );

        registrationStream =
            null;
    }


    if ($("registrationCamera")) {

        $("registrationCamera").srcObject =
            null;

    }
}


function stopAttendanceCamera() {

    if (attendanceStream) {

        attendanceStream
            .getTracks()
            .forEach(track =>
                track.stop()
            );

        attendanceStream =
            null;
    }


    if ($("attendanceCamera")) {

        $("attendanceCamera").srcObject =
            null;

    }
}


/* ============================================================
   LOGOUT
============================================================ */

function logout() {

    stopRegistrationCamera();

    stopAttendanceCamera();


    currentUser = null;


    localStorage.removeItem(
        "smartAttendanceCurrentUser"
    );


    hideAllPages();


    $("loginPage").style.display =
        "flex";


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


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   NAVIGATION EVENTS
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* LOGIN */

        $("loginButton")
            ?.addEventListener(
                "click",
                loginUser
            );


        $("createAccountButton")
            ?.addEventListener(
                "click",
                () => {
                    showPage("createAccountPage");
                }
            );


        $("forgotPinButton")
            ?.addEventListener(
                "click",
                () => {
                    showPage("forgotPinPage");
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
                    showPage("loginPage");
                }
            );


        $("forgotBackButton")
            ?.addEventListener(
                "click",
                () => {
                    showPage("loginPage");
                }
            );


        $("resetPinButton")
            ?.addEventListener(
                "click",
                resetPin
            );


        /* DASHBOARD */

        $("dashboardMenuButton")
            ?.addEventListener(
                "click",
                showDashboardHome
            );


        $("editProfileMenuButton")
            ?.addEventListener(
                "click",
                openEditProfile
            );


        $("editContactMenuButton")
            ?.addEventListener(
                "click",
                openEditContact
            );


        $("personalDetailsMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "personalDetailsSection",
                        "personalDetailsMenuButton"
                    );

                    updatePersonalDetails();

                }
            );


        $("faceRegistrationMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "faceRegistrationSection",
                        "faceRegistrationMenuButton"
                    );


                    if (currentUser) {

                        $("faceName").value =
                            currentUser.name || "";

                        $("faceMobile").value =
                            currentUser.mobile || "";

                        $("faceEmail").value =
                            currentUser.email || "";

                        $("collegeName").value =
                            COLLEGE_NAME;

                        $("departmentName").value =
                            currentUser.department || "";

                        $("faceRoll").value =
                            currentUser.roll || "";

                    }

                }
            );


        $("attendanceMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "attendanceSection",
                        "attendanceMenuButton"
                    );

                }
            );


        $("studentsMenuButton")
            ?.addEventListener(
                "click",
                showStudents
            );


        $("checkAttendanceMenuButton")
            ?.addEventListener(
                "click",
                showCheckAttendance
            );


        $("adminMenuButton")
            ?.addEventListener(
                "click",
                showAdminPanel
            );


        $("logoutButton")
            ?.addEventListener(
                "click",
                logout
            );


        /* QUICK ACTIONS */

        $("quickFaceRegistration")
            ?.addEventListener(
                "click",
                () => {

                    $("faceRegistrationMenuButton")
                        ?.click();

                }
            );


        $("quickAttendance")
            ?.addEventListener(
                "click",
                () => {

                    $("attendanceMenuButton")
                        ?.click();

                }
            );


        $("quickCheckAttendance")
            ?.addEventListener(
                "click",
                () => {

                    $("checkAttendanceMenuButton")
                        ?.click();

                }
            );


        /* FACE */

        $("startFaceRegistrationButton")
            ?.addEventListener(
                "click",
                startFaceRegistration
            );


        $("startFaceAttendanceButton")
            ?.addEventListener(
                "click",
                startFaceAttendance
            );


        /* SAVE */

        $("saveEditedDetailsButton")
            ?.addEventListener(
                "click",
                saveProfile
            );


        $("saveContactButton")
            ?.addEventListener(
                "click",
                saveContact
            );


        /* SEARCH */

        $("searchStudent")
            ?.addEventListener(
                "input",
                searchStudents
            );


        /* POPUP */

        $("closeAttendancePopup")
            ?.addEventListener(
                "click",
                closeAttendancePopup
            );


        /*
           Restore logged-in user after refresh.
        */

        const savedUser =
            localStorage.getItem(
                "smartAttendanceCurrentUser"
            );


        if (savedUser) {

            try {

                currentUser =
                    JSON.parse(savedUser);

                openDashboard();

            } catch (error) {

                localStorage.removeItem(
                    "smartAttendanceCurrentUser"
                );

            }

        } else {

            showPage("loginPage");

        }


        updateCurrentDate();


        setInterval(
            updateCurrentDate,
            1000
        );

    }
);
```

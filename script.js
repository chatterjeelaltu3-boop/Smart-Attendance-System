// =====================================================
// SMART ATTENDANCE SYSTEM
// LOGIN + CREATE ACCOUNT + FORGOT PIN + ATTENDANCE
// =====================================================


// =====================================================
// GLOBAL DATA
// =====================================================

let students = JSON.parse(
    localStorage.getItem("students")
) || [];

let attendanceHistory = JSON.parse(
    localStorage.getItem("attendanceHistory")
) || {};

let registrationStream = null;
let attendanceStream = null;

let faceModelLoaded = false;
let registrationRunning = false;
let attendanceRunning = false;

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";


// =====================================================
// ACCOUNT HELPERS
// =====================================================

function getAccount() {
    try {
        return JSON.parse(
            localStorage.getItem("smartAttendanceAccount")
        );
    } catch {
        return null;
    }
}

function saveAccount(account) {
    localStorage.setItem(
        "smartAttendanceAccount",
        JSON.stringify(account)
    );
}


// =====================================================
// VALIDATION
// =====================================================

function isValidMobile(mobile) {
    return /^[0-9]{10}$/.test(mobile);
}

function isValidPIN(pin) {
    return /^[0-9]{4}$/.test(pin);
}

function isValidEmail(email) {
    if (!email) return true;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// =====================================================
// CREATE ACCOUNT
// =====================================================

function createAccount() {

    const name =
        document.getElementById("createName")?.value.trim();

    const mobile =
        document.getElementById("createMobile")?.value.trim();

    const email =
        document.getElementById("createEmail")?.value.trim() || "";

    const pin =
        document.getElementById("createPin")?.value.trim();

    const confirmPin =
        document.getElementById("confirmPin")?.value.trim();


    if (!name || !mobile || !pin || !confirmPin) {

        alert(
            "⚠️ Please fill Name, Mobile Number, PIN and Confirm PIN."
        );

        return;
    }


    if (!isValidMobile(mobile)) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    if (!isValidPIN(pin)) {

        alert(
            "🔐 PIN must contain exactly 4 digits."
        );

        return;
    }


    if (pin !== confirmPin) {

        alert(
            "❌ PIN and Confirm PIN do not match."
        );

        return;
    }


    if (!isValidEmail(email)) {

        alert(
            "📧 Please enter a valid email address."
        );

        return;
    }


    const existingAccount = getAccount();


    if (existingAccount) {

        const replace = confirm(
            "An account already exists.\n\nDo you want to replace it?"
        );

        if (!replace) return;
    }


    const account = {

        name: name,

        mobile: mobile,

        email: email,

        pin: pin,

        createdAt:
            new Date().toISOString()
    };


    saveAccount(account);


    // Also create/update student profile

    let existingStudent =
        students.find(
            student =>
                student.mobile === mobile
        );


    if (!existingStudent) {

        students.push({

            name: name,

            roll: "",

            college: "",

            department: "",

            mobile: mobile,

            email: email,

            status: "Not Marked",

            attendanceDate: "",

            attendanceDay: "",

            attendanceTime: ""
        });

    } else {

        existingStudent.name = name;
        existingStudent.email = email;
    }


    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );


    alert(
        "✅ Account created successfully!\n\n" +
        "You can now login with your Name, Mobile Number and 4-digit PIN."
    );


    // Clear fields

    [
        "createName",
        "createMobile",
        "createEmail",
        "createPin",
        "confirmPin"
    ].forEach(id => {

        const input =
            document.getElementById(id);

        if (input) {
            input.value = "";
        }
    });


    showLoginPage();
}


// =====================================================
// LOGIN
// =====================================================

function loginUser() {

    const name =
        document.getElementById("loginName")?.value.trim();

    const mobile =
        document.getElementById("loginMobile")?.value.trim();

    const pin =
        document.getElementById("loginPin")?.value.trim();


    if (!name || !mobile || !pin) {

        alert(
            "⚠️ Please enter Name, Mobile Number and PIN."
        );

        return;
    }


    if (!isValidMobile(mobile)) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    if (!isValidPIN(pin)) {

        alert(
            "🔐 PIN must contain exactly 4 digits."
        );

        return;
    }


    const account = getAccount();


    if (!account) {

        alert(
            "❌ No account found.\n\n" +
            "Please click 'Create Account' first."
        );

        showCreateAccount();

        return;
    }


    if (
        account.name === name &&
        account.mobile === mobile &&
        account.pin === pin
    ) {

        localStorage.setItem(
            "smartAttendanceLoggedIn",
            "true"
        );


        alert(
            "✅ Login Successful!"
        );


        showDashboard();


    } else {

        alert(
            "❌ Login failed!\n\n" +
            "Name, Mobile Number or PIN is incorrect."
        );
    }
}


// =====================================================
// SHOW LOGIN PAGE
// =====================================================

function showLoginPage() {

    const loginPage =
        document.getElementById("loginPage");

    const createPage =
        document.getElementById("createAccountPage");

    const dashboard =
        document.getElementById("dashboardPage");


    if (loginPage)
        loginPage.style.display = "flex";

    if (createPage)
        createPage.style.display = "none";

    if (dashboard)
        dashboard.style.display = "none";
}


// =====================================================
// SHOW CREATE ACCOUNT
// =====================================================

function showCreateAccount() {

    const loginPage =
        document.getElementById("loginPage");

    const createPage =
        document.getElementById("createAccountPage");


    if (loginPage)
        loginPage.style.display = "none";


    if (createPage) {

        createPage.style.display = "flex";

        return;
    }


    // If HTML doesn't contain Create Account page,
    // create it automatically.

    createAccountInterface();
}


// =====================================================
// CREATE ACCOUNT INTERFACE
// =====================================================

function createAccountInterface() {

    let page =
        document.getElementById(
            "createAccountPage"
        );


    if (!page) {

        page =
            document.createElement("div");

        page.id =
            "createAccountPage";

        page.className =
            "login-page create-account-page";


        page.innerHTML = `

            <div class="login-card">

                <div class="login-icon">
                    📝
                </div>

                <h1>
                    Create Account
                </h1>

                <p>
                    Smart Attendance System
                </p>


                <input
                    type="text"
                    id="createName"
                    placeholder="👤 Full Name"
                >


                <input
                    type="tel"
                    id="createMobile"
                    placeholder="📱 10 Digit Mobile Number"
                    maxlength="10"
                    inputmode="numeric"
                >


                <input
                    type="email"
                    id="createEmail"
                    placeholder="📧 Email (Optional)"
                >


                <input
                    type="password"
                    id="createPin"
                    placeholder="🔐 4 Digit PIN"
                    maxlength="4"
                    inputmode="numeric"
                >


                <input
                    type="password"
                    id="confirmPin"
                    placeholder="🔐 Confirm 4 Digit PIN"
                    maxlength="4"
                    inputmode="numeric"
                >


                <button
                    type="button"
                    class="create-account-button"
                    onclick="createAccount()"
                >
                    ✨ Create Account
                </button>


                <button
                    type="button"
                    class="back-login-button"
                    onclick="showLoginPage()"
                >
                    ← Back to Login
                </button>

            </div>
        `;


        document.body.prepend(page);
    }


    setupAccountInputs();
}


// =====================================================
// ACCOUNT INPUT LIMIT
// =====================================================

function setupAccountInputs() {

    const mobileIds = [
        "createMobile",
        "loginMobile"
    ];

    const pinIds = [
        "createPin",
        "confirmPin",
        "loginPin"
    ];


    mobileIds.forEach(id => {

        const input =
            document.getElementById(id);

        if (!input) return;

        input.maxLength = 10;
        input.inputMode = "numeric";

        input.addEventListener(
            "input",
            function () {

                this.value =
                    this.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
            }
        );
    });


    pinIds.forEach(id => {

        const input =
            document.getElementById(id);

        if (!input) return;

        input.maxLength = 4;
        input.inputMode = "numeric";

        input.addEventListener(
            "input",
            function () {

                this.value =
                    this.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
            }
        );
    });
}


// =====================================================
// FORGOT PIN
// =====================================================

function forgotPIN() {

    const account = getAccount();


    if (!account) {

        alert(
            "❌ No account found.\n\n" +
            "Please create an account first."
        );

        showCreateAccount();

        return;
    }


    const name =
        prompt(
            "Enter your registered name:"
        );


    if (!name) return;


    const mobile =
        prompt(
            "Enter your registered 10 digit mobile number:"
        );


    if (!mobile) return;


    const cleanMobile =
        mobile.trim();


    if (!isValidMobile(cleanMobile)) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    if (
        account.name === name.trim() &&
        account.mobile === cleanMobile
    ) {

        // Demo/local version:
        // We cannot actually send OTP from browser alone.

        alert(
            "✅ Identity verified!\n\n" +
            "For this local demo, your PIN is:\n\n" +
            "🔐 " + account.pin
        );

    } else {

        alert(
            "❌ Name and mobile number do not match."
        );
    }
}


// =====================================================
// SHOW DASHBOARD
// =====================================================

function showDashboard() {

    const loginPage =
        document.getElementById("loginPage");

    const createPage =
        document.getElementById("createAccountPage");

    const dashboard =
        document.getElementById("dashboardPage");

    const mainContainer =
        document.getElementById("mainContainer");


    if (loginPage)
        loginPage.style.display = "none";

    if (createPage)
        createPage.style.display = "none";

    if (dashboard)
        dashboard.style.display = "block";

    if (mainContainer)
        mainContainer.style.display = "block";


    displayStudents();
    updateDashboard();
    showCurrentDate();
}


// =====================================================
// CHECK LOGIN STATUS
// =====================================================

function checkLoginStatus() {

    const loggedIn =
        localStorage.getItem(
            "smartAttendanceLoggedIn"
        );


    const account =
        getAccount();


    if (
        loggedIn === "true" &&
        account
    ) {

        showDashboard();

    } else {

        showLoginPage();
    }
}


// =====================================================
// LOGOUT
// =====================================================

function logoutUser() {

    localStorage.removeItem(
        "smartAttendanceLoggedIn"
    );

    location.reload();
}


// =====================================================
// SAVE STUDENTS
// =====================================================

function saveStudents() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );
}


// =====================================================
// SAVE ATTENDANCE
// =====================================================

function saveAttendanceHistory() {

    localStorage.setItem(
        "attendanceHistory",
        JSON.stringify(attendanceHistory)
    );
}


// =====================================================
// DATE KEY
// =====================================================

function getDateKey() {

    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0")
    );
}


// =====================================================
// ATTENDANCE DATE TIME
// =====================================================

function getAttendanceDateTime() {

    const now = new Date();

    return {

        date: now.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ),

        day: now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long"
            }
        ),

        time: now.toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        )
    };
}


// =====================================================
// CURRENT DATE
// =====================================================

function showCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) return;


    const now = new Date();


    element.innerText =
        "📅 " +
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}


// =====================================================
// DISPLAY STUDENTS
// =====================================================

function displayStudents() {

    const list =
        document.getElementById(
            "studentList"
        );

    if (!list) return;


    const search =
        document.getElementById(
            "searchStudent"
        )?.value
        ?.toLowerCase()
        ?.trim() || "";


    list.innerHTML = "";


    const filtered =
        students.filter(student =>

            (student.name || "")
                .toLowerCase()
                .includes(search)

            ||

            (student.roll || "")
                .toLowerCase()
                .includes(search)
        );


    if (!filtered.length) {

        list.innerHTML =
            "<p>No students found.</p>";

        return;
    }


    filtered.forEach(student => {

        const index =
            students.indexOf(student);


        const row =
            document.createElement("div");


        row.className =
            "student-row";


        row.innerHTML = `

            <div class="student-info">

                <strong>
                    ${student.name || ""}
                </strong>

                <br>

                Roll:
                ${student.roll || "Not added"}

                <br>

                🏫 College:
                ${student.college || "Not added"}

                <br>

                🎓 Department:
                ${student.department || "Not added"}

                <br>

                📱 Mobile:
                ${student.mobile || "Not added"}

                <br>

                📧 Email:
                ${student.email || "Not added"}

                <div class="status">
                    Status:
                    ${student.status || "Not Marked"}
                </div>

            </div>


            <div class="student-actions">

                <button
                    class="present-btn"
                    onclick="markPresent(${index})"
                >
                    Present
                </button>

                <button
                    class="absent-btn"
                    onclick="markAbsent(${index})"
                >
                    Absent
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteStudent(${index})"
                >
                    Delete
                </button>

            </div>
        `;


        list.appendChild(row);
    });
}


// =====================================================
// MARK PRESENT
// =====================================================

function markPresent(index) {

    if (!students[index]) return;


    const attendance =
        getAttendanceDateTime();


    students[index].status =
        "Present";

    students[index].attendanceDate =
        attendance.date;

    students[index].attendanceDay =
        attendance.day;

    students[index].attendanceTime =
        attendance.time;


    saveDailyAttendance(
        students[index],
        "Present",
        attendance
    );


    saveStudents();

    displayStudents();

    updateDashboard();
}


// =====================================================
// MARK ABSENT
// =====================================================

function markAbsent(index) {

    if (!students[index]) return;


    const attendance =
        getAttendanceDateTime();


    students[index].status =
        "Absent";

    students[index].attendanceDate =
        attendance.date;

    students[index].attendanceDay =
        attendance.day;

    students[index].attendanceTime =
        attendance.time;


    saveDailyAttendance(
        students[index],
        "Absent",
        attendance
    );


    saveStudents();

    displayStudents();

    updateDashboard();
}


// =====================================================
// SAVE DAILY ATTENDANCE
// =====================================================

function saveDailyAttendance(
    student,
    status,
    attendance
) {

    const dateKey =
        getDateKey();


    if (!attendanceHistory[dateKey]) {

        attendanceHistory[dateKey] = {

            date: attendance.date,

            day: attendance.day,

            students: {}
        };
    }


    attendanceHistory[dateKey]
        .students[student.roll || student.mobile] = {

            name: student.name,

            roll: student.roll,

            college: student.college,

            department: student.department,

            mobile: student.mobile,

            email: student.email,

            status: status,

            time:
                status === "Present"
                    ? attendance.time
                    : ""
        };


    saveAttendanceHistory();
}


// =====================================================
// DELETE STUDENT
// =====================================================

function deleteStudent(index) {

    if (!students[index]) return;


    if (
        !confirm(
            "Delete this student?"
        )
    ) return;


    students.splice(index, 1);

    saveStudents();

    displayStudents();

    updateDashboard();
}


// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard() {

    const total =
        students.length;


    const present =
        students.filter(
            s => s.status === "Present"
        ).length;


    const absent =
        students.filter(
            s => s.status === "Absent"
        ).length;


    const percentage =
        total
            ? Math.round(
                present / total * 100
            )
            : 0;


    document.getElementById(
        "totalStudents"
    )?.replaceChildren(
        document.createTextNode(total)
    );


    document.getElementById(
        "presentStudents"
    )?.replaceChildren(
        document.createTextNode(present)
    );


    document.getElementById(
        "absentStudents"
    )?.replaceChildren(
        document.createTextNode(absent)
    );


    document.getElementById(
        "attendancePercentage"
    )?.replaceChildren(
        document.createTextNode(
            percentage + "%"
        )
    );
}


// =====================================================
// FACE MODEL
// =====================================================

async function loadFaceModels() {

    if (faceModelLoaded)
        return true;


    if (
        typeof faceapi ===
        "undefined"
    ) {

        console.error(
            "face-api.js not loaded"
        );

        return false;
    }


    try {

        await faceapi.nets
            .tinyFaceDetector
            .loadFromUri(MODEL_URL);

        await faceapi.nets
            .faceLandmark68Net
            .loadFromUri(MODEL_URL);

        await faceapi.nets
            .faceRecognitionNet
            .loadFromUri(MODEL_URL);


        faceModelLoaded = true;

        return true;

    } catch (error) {

        console.error(error);

        return false;
    }
}


// =====================================================
// CAMERA
// =====================================================

async function startCameraForVideo(
    videoId,
    statusId
) {

    const video =
        document.getElementById(videoId);


    const status =
        document.getElementById(statusId);


    if (!video) return null;


    try {

        const stream =
            await navigator.mediaDevices
                .getUserMedia({

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
                });


        video.srcObject =
            stream;


        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;


        // Mirror camera like normal selfie camera

        video.style.transform =
            "scaleX(-1)";


        await video.play();


        if (status)
            status.innerText =
                "Camera ON ✅";


        return stream;

    } catch (error) {

        console.error(error);


        if (status)
            status.innerText =
                "Camera permission denied ❌";


        alert(
            "Please allow camera permission."
        );


        return null;
    }
}


// =====================================================
// REGISTRATION CAMERA
// =====================================================

async function startRegistrationCamera() {

    if (registrationStream)
        return;


    registrationStream =
        await startCameraForVideo(
            "registrationCamera",
            "registrationStatus"
        );
}


// =====================================================
// ATTENDANCE CAMERA
// =====================================================

async function startAttendanceCamera() {

    if (attendanceStream)
        return;


    attendanceStream =
        await startCameraForVideo(
            "attendanceCamera",
            "attendanceStatus"
        );
}


// =====================================================
// FACE REGISTRATION
// =====================================================

async function startAutomaticFaceRegistration() {

    const name =
        document.getElementById(
            "faceName"
        )?.value.trim();

    const roll =
        document.getElementById(
            "faceRoll"
        )?.value.trim();

    const college =
        document.getElementById(
            "collegeName"
        )?.value.trim();

    const department =
        document.getElementById(
            "departmentName"
        )?.value.trim();

    const mobile =
        document.getElementById(
            "faceMobile"
        )?.value.trim();

    const email =
        document.getElementById(
            "faceEmail"
        )?.value.trim() || "";


    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        alert(
            "⚠️ Please fill all required details."
        );

        return;
    }


    if (!isValidMobile(mobile)) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    if (!isValidEmail(email)) {

        alert(
            "📧 Invalid email address."
        );

        return;
    }


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        alert(
            "❌ Face model could not load."
        );

        return;
    }


    if (!registrationStream) {

        registrationStream =
            await startRegistrationCamera();

        if (!registrationStream)
            return;
    }


    registrationRunning = true;


    detectRegistrationFace(
        name,
        roll,
        college,
        department,
        mobile,
        email
    );
}


// =====================================================
// DETECT REGISTRATION FACE
// =====================================================

async function detectRegistrationFace(
    name,
    roll,
    college,
    department,
    mobile,
    email
) {

    if (!registrationRunning)
        return;


    const video =
        document.getElementById(
            "registrationCamera"
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

        setTimeout(
            () =>
                detectRegistrationFace(
                    name,
                    roll,
                    college,
                    department,
                    mobile,
                    email
                ),
            400
        );

        return;
    }


    const descriptor =
        Array.from(
            detection.descriptor
        );


    localStorage.setItem(
        "registeredFaceStudent",
        JSON.stringify({

            name,
            roll,
            college,
            department,
            mobile,
            email,
            descriptor
        })
    );


    const index =
        students.findIndex(
            s =>
                String(s.roll) ===
                String(roll)
        );


    if (index >= 0) {

        students[index] = {

            ...students[index],

            name,
            college,
            department,
            mobile,
            email
        };

    } else {

        students.push({

            name,
            roll,
            college,
            department,
            mobile,
            email,

            status: "Not Marked",

            attendanceDate: "",
            attendanceDay: "",
            attendanceTime: ""
        });
    }


    saveStudents();


    registrationRunning = false;


    document.getElementById(
        "registrationStatus"
    )?.replaceChildren(
        document.createTextNode(
            "Face Captured Successfully ✅"
        )
    );


    document.getElementById(
        "registrationMessage"
    )?.replaceChildren(
        document.createTextNode(
            "🎉 Face Registration Completed Successfully!"
        )
    );


    stopRegistrationCamera();

    displayStudents();

    updateDashboard();


    alert(
        "✅ Face Registration Completed!"
    );
}


// =====================================================
// STOP REGISTRATION CAMERA
// =====================================================

function stopRegistrationCamera() {

    if (registrationStream) {

        registrationStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        registrationStream = null;
    }


    const video =
        document.getElementById(
            "registrationCamera"
        );


    if (video)
        video.srcObject = null;
}


// =====================================================
// FACE ATTENDANCE
// =====================================================

async function startFaceAttendance() {

    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );


    if (!saved) {

        alert(
            "❌ No face registered.\n\nPlease register your face first."
        );

        return;
    }


    const student =
        JSON.parse(saved);


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        alert(
            "❌ Face model could not load."
        );

        return;
    }


    if (!attendanceStream) {

        attendanceStream =
            await startCameraForVideo(
                "attendanceCamera",
                "attendanceStatus"
            );


        if (!attendanceStream)
            return;
    }


    attendanceRunning = true;


    detectAttendanceFace(
        student
    );
}


// =====================================================
// DETECT ATTENDANCE FACE
// =====================================================

async function detectAttendanceFace(
    registeredStudent
) {

    if (!attendanceRunning)
        return;


    const video =
        document.getElementById(
            "attendanceCamera"
        );


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

            setTimeout(
                () =>
                    detectAttendanceFace(
                        registeredStudent
                    ),
                400
            );

            return;
        }


        const registeredDescriptor =
            new Float32Array(
                registeredStudent.descriptor
            );


        const distance =
            faceapi.euclideanDistance(
                detection.descriptor,
                registeredDescriptor
            );


        if (distance < 0.55) {

            showAttendanceSuccess(
                registeredStudent
            );

        } else {

            attendanceRunning = false;

            stopAttendanceCamera();


            alert(
                "❌ Face does not match."
            );
        }

    } catch (error) {

        console.error(error);

        attendanceRunning = false;

        stopAttendanceCamera();
    }
}


// =====================================================
// ATTENDANCE SUCCESS
// =====================================================

function showAttendanceSuccess(
    student
) {

    attendanceRunning = false;


    const attendance =
        getAttendanceDateTime();


    let index =
        students.findIndex(
            s =>
                String(s.roll) ===
                String(student.roll)
        );


    if (index < 0) {

        students.push({

            name: student.name,

            roll: student.roll,

            college: student.college,

            department: student.department,

            mobile: student.mobile,

            email: student.email,

            status: "Present",

            attendanceDate:
                attendance.date,

            attendanceDay:
                attendance.day,

            attendanceTime:
                attendance.time
        });


        index =
            students.length - 1;

    } else {

        students[index].status =
            "Present";

        students[index].attendanceDate =
            attendance.date;

        students[index].attendanceDay =
            attendance.day;

        students[index].attendanceTime =
            attendance.time;
    }


    saveDailyAttendance(
        students[index],
        "Present",
        attendance
    );


    saveStudents();


    const result =
        document.getElementById(
            "attendanceResult"
        );


    if (result) {

        result.innerHTML = `

            <div class="success-message">

                <div class="success-icon">
                    ✅
                </div>

                <h3>
                    Attendance Successfully Marked
                </h3>

                <p>
                    👤 <strong>${student.name}</strong>
                </p>

                <p>
                    🔢 Roll: ${student.roll}
                </p>

                <p>
                    📅 ${attendance.date}
                </p>

                <p>
                    📆 ${attendance.day}
                </p>

                <p>
                    🕐 ${attendance.time}
                </p>

                ${
                    student.email
                    ?
                    `
                    <p>
                        📧 Attendance message can be sent to:
                        ${student.email}
                    </p>
                    `
                    :
                    `
                    <p>
                        📧 No email added
                    </p>
                    `
                }

            </div>
        `;
    }


    document.getElementById(
        "attendanceStatus"
    )?.replaceChildren(
        document.createTextNode(
            "Attendance marked successfully ✅"
        )
    );


    displayStudents();

    updateDashboard();

    stopAttendanceCamera();


    alert(
        "✅ Attendance Successfully Marked!\n\n" +
        "👤 " + student.name +
        "\n📅 " + attendance.date +
        "\n📆 " + attendance.day +
        "\n🕐 " + attendance.time
    );
}


// =====================================================
// STOP ATTENDANCE CAMERA
// =====================================================

function stopAttendanceCamera() {

    if (attendanceStream) {

        attendanceStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        attendanceStream = null;
    }


    const video =
        document.getElementById(
            "attendanceCamera"
        );


    if (video)
        video.srcObject = null;
}


// =====================================================
// MENU
// =====================================================

function toggleMenu() {

    document.getElementById(
        "mainMenu"
    )?.classList.toggle("show");
}


// =====================================================
// CHECK ATTENDANCE
// =====================================================

function showCheckAttendance() {

    const modal =
        document.getElementById(
            "attendanceCheckModal"
        );


    if (!modal) return;


    calculateAttendanceSummary();


    modal.classList.add("show");


    document.getElementById(
        "mainMenu"
    )?.classList.remove("show");
}


// =====================================================
// ATTENDANCE SUMMARY
// =====================================================

function calculateAttendanceSummary() {

    let present = 0;
    let absent = 0;


    Object.values(
        attendanceHistory
    ).forEach(day => {

        Object.values(
            day.students || {}
        ).forEach(student => {

            if (student.status === "Present")
                present++;

            if (student.status === "Absent")
                absent++;
        });
    });


    const total =
        present + absent;


    document.getElementById(
        "attendanceTotalDays"
    )?.replaceChildren(
        document.createTextNode(
            Object.keys(attendanceHistory).length
        )
    );


    document.getElementById(
        "attendancePresentDays"
    )?.replaceChildren(
        document.createTextNode(present)
    );


    document.getElementById(
        "attendanceAbsentDays"
    )?.replaceChildren(
        document.createTextNode(absent)
    );


    showAttendanceHistory();
}


// =====================================================
// ATTENDANCE HISTORY
// =====================================================

function showAttendanceHistory() {

    const history =
        document.getElementById(
            "attendanceHistory"
        );


    if (!history) return;


    history.innerHTML = "";


    Object.keys(
        attendanceHistory
    )
    .sort()
    .reverse()
    .forEach(dateKey => {

        const day =
            attendanceHistory[dateKey];


        const div =
            document.createElement("div");


        div.className =
            "registered-student";


        div.innerHTML = `

            <strong>
                📅 ${day.date}
            </strong>

            <br>

            📆 ${day.day}

            <hr>

            ${
                Object.values(
                    day.students || {}
                )
                .map(student => `

                    <p>

                        👤 ${student.name}

                        <br>

                        Roll:
                        ${student.roll || "N/A"}

                        <br>

                        Status:
                        <strong>
                            ${student.status}
                        </strong>

                        ${
                            student.time
                            ?
                            `<br>🕐 ${student.time}`
                            :
                            ""
                        }

                    </p>

                `)
                .join("")
            }

        `;


        history.appendChild(div);
    });
}


// =====================================================
// CLOSE CHECK ATTENDANCE
// =====================================================

function closeCheckAttendance() {

    document.getElementById(
        "attendanceCheckModal"
    )?.classList.remove("show");
}


// =====================================================
// REGISTERED STUDENTS
// =====================================================

function showRegisteredStudents() {

    const modal =
        document.getElementById(
            "studentsModal"
        );

    const list =
        document.getElementById(
            "registeredStudentsList"
        );


    if (!modal || !list) return;


    list.innerHTML = "";


    students.forEach(
        (student, index) => {

            const div =
                document.createElement("div");


            div.className =
                "registered-student";


            div.innerHTML = `

                <strong>
                    ${index + 1}.
                    ${student.name}
                </strong>

                <br>

                🔢 Roll:
                ${student.roll || "Not added"}

                <br>

                📱 Mobile:
                ${student.mobile || "Not added"}

                <br>

                📧 Email:
                ${student.email || "Not added"}

                <br>

                📌 Status:
                ${student.status}

            `;


            list.appendChild(div);
        }
    );


    modal.classList.add("show");


    document.getElementById(
        "mainMenu"
    )?.classList.remove("show");
}


// =====================================================
// CLOSE STUDENTS
// =====================================================

function closeRegisteredStudents() {

    document.getElementById(
        "studentsModal"
    )?.classList.remove("show");
}


// =====================================================
// ADMIN
// =====================================================

function showAdminDetails() {

    document.getElementById(
        "adminModal"
    )?.classList.add("show");


    document.getElementById(
        "mainMenu"
    )?.classList.remove("show");
}


function closeAdminDetails() {

    document.getElementById(
        "adminModal"
    )?.classList.remove("show");
}


// =====================================================
// EDIT DETAILS
// =====================================================

function openEditDetails() {

    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );


    if (!saved) {

        alert(
            "Please register your face first."
        );

        return;
    }


    const student =
        JSON.parse(saved);


    const fields = {

        editName: student.name || "",
        editRoll: student.roll || "",
        editCollege: student.college || "",
        editDepartment: student.department || "",
        editMobile: student.mobile || "",
        editEmail: student.email || ""
    };


    Object.entries(fields)
        .forEach(([id, value]) => {

            const input =
                document.getElementById(id);

            if (input)
                input.value = value;
        });


    document.getElementById(
        "editDetailsModal"
    )?.classList.add("show");
}


function closeEditDetails() {

    document.getElementById(
        "editDetailsModal"
    )?.classList.remove("show");
}


// =====================================================
// SAVE EDIT DETAILS
// =====================================================

function saveEditedDetails() {

    const name =
        document.getElementById(
            "editName"
        )?.value.trim();

    const roll =
        document.getElementById(
            "editRoll"
        )?.value.trim();

    const college =
        document.getElementById(
            "editCollege"
        )?.value.trim();

    const department =
        document.getElementById(
            "editDepartment"
        )?.value.trim();

    const mobile =
        document.getElementById(
            "editMobile"
        )?.value.trim();

    const email =
        document.getElementById(
            "editEmail"
        )?.value.trim() || "";


    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        alert(
            "Please fill all required details."
        );

        return;
    }


    if (!isValidMobile(mobile)) {

        alert(
            "Mobile number must contain exactly 10 digits."
        );

        return;
    }


    if (!isValidEmail(email)) {

        alert(
            "Invalid email address."
        );

        return;
    }


    const index =
        students.findIndex(
            s =>
                String(s.roll) ===
                String(roll)
        );


    if (index >= 0) {

        students[index].name = name;
        students[index].college = college;
        students[index].department = department;
        students[index].mobile = mobile;
        students[index].email = email;

        saveStudents();
    }


    const account =
        getAccount();


    if (account) {

        account.name = name;
        account.mobile = mobile;
        account.email = email;

        saveAccount(account);
    }


    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );


    if (saved) {

        const face =
            JSON.parse(saved);

        face.name = name;
        face.roll = roll;
        face.college = college;
        face.department = department;
        face.mobile = mobile;
        face.email = email;

        localStorage.setItem(
            "registeredFaceStudent",
            JSON.stringify(face)
        );
    }


    closeEditDetails();

    displayStudents();

    updateDashboard();


    alert(
        "✅ Details updated successfully!"
    );
}


// =====================================================
// MOBILE UPDATE
// =====================================================

function openMobileUpdate() {

    const mobile =
        prompt(
            "Enter your 10 digit mobile number:"
        );


    if (!mobile) return;


    const clean =
        mobile.trim();


    if (!isValidMobile(clean)) {

        alert(
            "Mobile number must contain exactly 10 digits."
        );

        return;
    }


    const account =
        getAccount();


    if (!account) {

        alert(
            "Please create an account first."
        );

        return;
    }


    account.mobile =
        clean;


    saveAccount(account);


    alert(
        "📱 Mobile number updated successfully!"
    );
}


// =====================================================
// EMAIL UPDATE
// =====================================================

function openEmailUpdate() {

    const email =
        prompt(
            "Enter email address (optional):"
        );


    if (!email) return;


    const clean =
        email.trim();


    if (!isValidEmail(clean)) {

        alert(
            "Invalid email address."
        );

        return;
    }


    const account =
        getAccount();


    if (!account) {

        alert(
            "Please create an account first."
        );

        return;
    }


    account.email =
        clean;


    saveAccount(account);


    alert(
        "📧 Email updated successfully!"
    );
}


// =====================================================
// CLOSE MODALS
// =====================================================

window.addEventListener(
    "click",
    event => {

        document
            .querySelectorAll(".modal")
            .forEach(modal => {

                if (
                    event.target ===
                    modal
                ) {

                    modal.classList.remove(
                        "show"
                    );
                }
            });
    }
);


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    async () => {

        setupAccountInputs();

        checkLoginStatus();

        displayStudents();

        updateDashboard();

        showCurrentDate();

        // Face models load in background

        loadFaceModels();
    }
);

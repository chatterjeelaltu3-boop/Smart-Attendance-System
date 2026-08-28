/* =========================================================
   SMART ATTENDANCE SYSTEM
   COMPLETE SCRIPT.JS
   LOGIN + CREATE ACCOUNT + FORGOT PIN
   FACE REGISTRATION + FACE ATTENDANCE
   DAILY ATTENDANCE + EMAIL
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

let students =
    JSON.parse(localStorage.getItem("students")) || [];

let attendanceHistory =
    JSON.parse(localStorage.getItem("attendanceHistory")) || {};

let account =
    JSON.parse(localStorage.getItem("smartAttendanceAccount")) || null;


/* =========================================================
   CAMERA
   ========================================================= */

let registrationStream = null;
let attendanceStream = null;

let faceModelLoaded = false;

let registrationRunning = false;
let attendanceRunning = false;


/* =========================================================
   FACE API MODEL
   ========================================================= */

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function saveStudents() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );
}


function saveAttendanceHistory() {

    localStorage.setItem(
        "attendanceHistory",
        JSON.stringify(attendanceHistory)
    );
}


function saveAccount() {

    localStorage.setItem(
        "smartAttendanceAccount",
        JSON.stringify(account)
    );
}


function isValidMobile(mobile) {

    return /^[0-9]{10}$/.test(
        String(mobile || "")
    );
}


function isValidPin(pin) {

    return /^[0-9]{4}$/.test(
        String(pin || "")
    );
}


function isValidEmail(email) {

    if (!email) {
        return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );
}


function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   DATE
   ========================================================= */

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


function showCurrentDate() {

    const element =
        document.getElementById("currentDate");

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


/* =========================================================
   LOGIN PAGE
   ========================================================= */

function loginUser() {

    const name =
        document.getElementById("loginName")
            ?.value.trim();

    const mobile =
        document.getElementById("loginMobile")
            ?.value.trim();

    const pin =
        document.getElementById("loginPin")
            ?.value.trim();


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


    if (!isValidPin(pin)) {

        alert(
            "🔐 PIN must contain exactly 4 digits."
        );

        return;
    }


    const savedAccount =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (!savedAccount) {

        alert(
            "❌ No account found.\n\n" +
            "Please create an account first."
        );

        return;
    }


    if (
        savedAccount.name === name &&
        savedAccount.mobile === mobile &&
        savedAccount.pin === pin
    ) {

        localStorage.setItem(
            "smartAttendanceLoggedIn",
            "true"
        );

        showDashboard();

    } else {

        alert(
            "❌ Login failed!\n\n" +
            "Name, Mobile Number or PIN is incorrect."
        );
    }
}


/* =========================================================
   SHOW DASHBOARD
   ========================================================= */

function showDashboard() {

    const loginPage =
        document.getElementById("loginPage");

    const createPage =
        document.getElementById("createAccountPage");

    const dashboardPage =
        document.getElementById("dashboardPage");

    const mainContainer =
        document.getElementById("mainContainer");


    if (loginPage) {

        loginPage.style.display = "none";
    }


    if (createPage) {

        createPage.style.display = "none";
    }


    if (dashboardPage) {

        dashboardPage.style.display = "block";
    }


    if (mainContainer) {

        mainContainer.style.display = "block";
    }


    displayStudents();

    updateDashboard();

    showCurrentDate();
}


/* =========================================================
   CREATE ACCOUNT
   ========================================================= */

function createAccount() {

    const name =
        document.getElementById("createName")
            ?.value.trim();

    const mobile =
        document.getElementById("createMobile")
            ?.value.trim();

    const email =
        document.getElementById("createEmail")
            ?.value.trim() || "";

    const pin =
        document.getElementById("createPin")
            ?.value.trim();

    const confirmPin =
        document.getElementById("confirmPin")
            ?.value.trim();


    if (!name || !mobile || !pin || !confirmPin) {

        alert(
            "⚠️ Please fill all required fields."
        );

        return;
    }


    if (!isValidMobile(mobile)) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    if (!isValidPin(pin)) {

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


    const existing =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (existing) {

        if (
            existing.name === name &&
            existing.mobile === mobile
        ) {

            alert(
                "⚠️ This account already exists.\n\n" +
                "Please login."
            );

            showLoginPage();

            return;
        }


        const overwrite =
            confirm(
                "An account already exists on this browser.\n\n" +
                "Create a new account and replace the existing account?"
            );


        if (!overwrite) {

            return;
        }
    }


    account = {

        name: name,

        mobile: mobile,

        email: email,

        pin: pin,

        createdAt:
            new Date().toISOString()
    };


    saveAccount();


    localStorage.setItem(
        "smartAttendanceLoggedIn",
        "true"
    );


    alert(
        "✅ Account created successfully!\n\n" +
        "You can now use Smart Attendance System."
    );


    showDashboard();
}


/* =========================================================
   SHOW CREATE ACCOUNT
   ========================================================= */

function showCreateAccount() {

    const loginPage =
        document.getElementById("loginPage");

    const createPage =
        document.getElementById("createAccountPage");

    if (loginPage) {

        loginPage.style.display = "none";
    }

    if (createPage) {

        createPage.style.display = "flex";
    }
}


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showLoginPage() {

    const loginPage =
        document.getElementById("loginPage");

    const createPage =
        document.getElementById("createAccountPage");

    const dashboardPage =
        document.getElementById("dashboardPage");


    if (loginPage) {

        loginPage.style.display = "flex";
    }


    if (createPage) {

        createPage.style.display = "none";
    }


    if (dashboardPage) {

        dashboardPage.style.display = "none";
    }
}


/* =========================================================
   FORGOT PIN
   ========================================================= */

function forgotPIN() {

    const savedAccount =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (!savedAccount) {

        alert(
            "❌ No account found.\n\n" +
            "Please create an account first."
        );

        return;
    }


    const name =
        prompt(
            "Enter your registered name:"
        );


    if (!name) return;


    const method =
        prompt(
            "Enter verification method:\n\n" +
            "1 = Mobile OTP\n" +
            "2 = Email OTP"
        );


    if (!method) return;


    let verified = false;


    if (method === "1") {

        const mobile =
            prompt(
                "Enter your registered 10 digit mobile number:"
            );


        if (!mobile) return;


        if (!isValidMobile(mobile.trim())) {

            alert(
                "📱 Mobile number must contain exactly 10 digits."
            );

            return;
        }


        if (
            name.trim() !==
                savedAccount.name ||
            mobile.trim() !==
                savedAccount.mobile
        ) {

            alert(
                "❌ Name and mobile number do not match."
            );

            return;
        }


        const otp =
            generateOTP();


        alert(
            "📱 Demo OTP: " +
            otp +
            "\n\n" +
            "In a real website this OTP would be sent by SMS."
        );


        const entered =
            prompt(
                "Enter the OTP:"
            );


        if (entered === otp) {

            verified = true;
        }

    } else if (method === "2") {

        if (!savedAccount.email) {

            alert(
                "📧 No email address is registered for this account."
            );

            return;
        }


        const email =
            prompt(
                "Enter your registered email:"
            );


        if (!email) return;


        if (
            name.trim() !==
                savedAccount.name ||
            email.trim().toLowerCase() !==
                savedAccount.email.toLowerCase()
        ) {

            alert(
                "❌ Name and email do not match."
            );

            return;
        }


        const otp =
            generateOTP();


        alert(
            "📧 Demo OTP: " +
            otp +
            "\n\n" +
            "In a real website this OTP would be sent by email."
        );


        const entered =
            prompt(
                "Enter the OTP:"
            );


        if (entered === otp) {

            verified = true;
        }

    } else {

        alert(
            "❌ Please select 1 or 2."
        );

        return;
    }


    if (!verified) {

        alert(
            "❌ Incorrect OTP."
        );

        return;
    }


    setNewPIN();
}


/* =========================================================
   GENERATE OTP
   ========================================================= */

function generateOTP() {

    return String(
        Math.floor(
            100000 +
            Math.random() * 900000
        )
    );
}


/* =========================================================
   SET NEW PIN
   ========================================================= */

function setNewPIN() {

    const newPin =
        prompt(
            "Enter your new 4 digit PIN:"
        );


    if (!newPin) return;


    if (!isValidPin(newPin)) {

        alert(
            "🔐 PIN must contain exactly 4 digits."
        );

        return;
    }


    const confirmPin =
        prompt(
            "Confirm your new 4 digit PIN:"
        );


    if (newPin !== confirmPin) {

        alert(
            "❌ PINs do not match."
        );

        return;
    }


    const savedAccount =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (!savedAccount) return;


    savedAccount.pin =
        newPin;


    localStorage.setItem(
        "smartAttendanceAccount",
        JSON.stringify(savedAccount)
    );


    account =
        savedAccount;


    alert(
        "✅ PIN changed successfully!\n\n" +
        "You can now login with your new PIN."
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    localStorage.removeItem(
        "smartAttendanceLoggedIn"
    );


    stopRegistrationCamera();

    stopAttendanceCamera();


    showLoginPage();
}


/* =========================================================
   LOGIN STATUS
   ========================================================= */

function checkLoginStatus() {

    const loggedIn =
        localStorage.getItem(
            "smartAttendanceLoggedIn"
        );


    const savedAccount =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (
        loggedIn === "true" &&
        savedAccount
    ) {

        showDashboard();

    } else {

        showLoginPage();
    }
}


/* =========================================================
   LOGIN INPUT LIMITS
   ========================================================= */

function setupLoginInputs() {

    const mobileIds = [

        "loginMobile",

        "createMobile",

        "faceMobile",

        "studentMobile",

        "editMobile"
    ];


    mobileIds.forEach(id => {

        const input =
            document.getElementById(id);

        if (!input) return;


        input.setAttribute(
            "maxlength",
            "10"
        );

        input.setAttribute(
            "inputmode",
            "numeric"
        );


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


    const pinIds = [

        "loginPin",

        "createPin",

        "confirmPin"
    ];


    pinIds.forEach(id => {

        const input =
            document.getElementById(id);

        if (!input) return;


        input.setAttribute(
            "maxlength",
            "4"
        );

        input.setAttribute(
            "inputmode",
            "numeric"
        );


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


/* =========================================================
   DISPLAY STUDENTS
   ========================================================= */

function displayStudents() {

    const list =
        document.getElementById(
            "studentList"
        );


    const searchElement =
        document.getElementById(
            "searchStudent"
        );


    if (!list) return;


    const search =
        searchElement
            ? searchElement.value
                .toLowerCase()
                .trim()
            : "";


    list.innerHTML = "";


    const filtered =
        students.filter(student => {

            return (

                String(
                    student.name || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    student.roll || ""
                )
                    .toLowerCase()
                    .includes(search)
            );
        });


    if (filtered.length === 0) {

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
                    ${escapeHTML(student.name)}
                </strong>

                <br>

                🔢 Roll:
                ${escapeHTML(student.roll)}

                <br>

                🏫 College:
                ${escapeHTML(student.college)}

                <br>

                🎓 Department:
                ${escapeHTML(student.department)}

                <br>

                📱 Mobile:
                ${escapeHTML(student.mobile || "Not added")}

                <br>

                📧 Email:
                ${escapeHTML(student.email || "Not added")}

                <br>

                <div class="status">

                    Status:
                    ${escapeHTML(
                        student.status || "Not Marked"
                    )}

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


/* =========================================================
   SAVE DAILY ATTENDANCE
   ========================================================= */

function saveStudentDailyAttendance(
    student,
    status,
    attendance
) {

    const dateKey =
        getDateKey();


    if (!attendanceHistory[dateKey]) {

        attendanceHistory[dateKey] = {

            date:
                attendance.date,

            day:
                attendance.day,

            students: {}
        };
    }


    attendanceHistory[dateKey]
        .students[student.roll] = {

            name:
                student.name,

            roll:
                student.roll,

            college:
                student.college,

            department:
                student.department,

            mobile:
                student.mobile || "",

            email:
                student.email || "",

            status:
                status,

            time:
                status === "Present"
                    ? attendance.time
                    : ""
        };


    saveAttendanceHistory();
}


/* =========================================================
   MARK PRESENT
   ========================================================= */

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


    saveStudentDailyAttendance(
        students[index],
        "Present",
        attendance
    );


    saveStudents();

    displayStudents();

    updateDashboard();
}


/* =========================================================
   MARK ABSENT
   ========================================================= */

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


    saveStudentDailyAttendance(
        students[index],
        "Absent",
        attendance
    );


    saveStudents();

    displayStudents();

    updateDashboard();
}


/* =========================================================
   DELETE STUDENT
   ========================================================= */

function deleteStudent(index) {

    if (!students[index]) return;


    if (
        !confirm(
            "Delete this student?"
        )
    ) {

        return;
    }


    const roll =
        students[index].roll;


    students.splice(
        index,
        1
    );


    Object.keys(
        attendanceHistory
    ).forEach(dateKey => {

        if (
            attendanceHistory[dateKey]
                ?.students?.[roll]
        ) {

            delete attendanceHistory[
                dateKey
            ].students[roll];
        }
    });


    saveStudents();

    saveAttendanceHistory();

    displayStudents();

    updateDashboard();
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const total =
        students.length;


    const present =
        students.filter(
            s =>
                s.status === "Present"
        ).length;


    const absent =
        students.filter(
            s =>
                s.status === "Absent"
        ).length;


    const percentage =
        total > 0
            ? Math.round(
                (present / total) * 100
            )
            : 0;


    const totalElement =
        document.getElementById(
            "totalStudents"
        );


    const presentElement =
        document.getElementById(
            "presentStudents"
        );


    const absentElement =
        document.getElementById(
            "absentStudents"
        );


    const percentageElement =
        document.getElementById(
            "attendancePercentage"
        );


    if (totalElement) {

        totalElement.innerText =
            total;
    }


    if (presentElement) {

        presentElement.innerText =
            present;
    }


    if (absentElement) {

        absentElement.innerText =
            absent;
    }


    if (percentageElement) {

        percentageElement.innerText =
            percentage + "%";
    }
}


/* =========================================================
   FACE MODEL
   ========================================================= */

async function loadFaceModels() {

    if (faceModelLoaded) {

        return true;
    }


    if (
        typeof faceapi ===
        "undefined"
    ) {

        console.error(
            "face-api.js not loaded."
        );

        return false;
    }


    try {

        await faceapi.nets
            .tinyFaceDetector
            .loadFromUri(
                MODEL_URL
            );


        await faceapi.nets
            .faceLandmark68Net
            .loadFromUri(
                MODEL_URL
            );


        await faceapi.nets
            .faceRecognitionNet
            .loadFromUri(
                MODEL_URL
            );


        faceModelLoaded =
            true;


        return true;

    } catch (error) {

        console.error(
            "Face model loading error:",
            error
        );

        return false;
    }
}


/* =========================================================
   CAMERA
   ========================================================= */

async function startCameraForVideo(
    videoId,
    statusId
) {

    const video =
        document.getElementById(
            videoId
        );


    const status =
        document.getElementById(
            statusId
        );


    if (!video) {

        return null;
    }


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


        video.autoplay =
            true;

        video.muted =
            true;

        video.playsInline =
            true;


        /*
         * IMPORTANT:
         * Mirror effect is handled by CSS.
         */

        await video.play();


        if (status) {

            status.innerText =
                "Camera ON ✅";
        }


        return stream;

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );


        if (status) {

            status.innerText =
                "Camera permission denied ❌";
        }


        alert(
            "📷 Camera could not start.\n\n" +
            "Please allow camera permission."
        );


        return null;
    }
}


/* =========================================================
   REGISTRATION CAMERA
   ========================================================= */

async function startRegistrationCamera() {

    if (registrationStream) {

        return registrationStream;
    }


    registrationStream =
        await startCameraForVideo(
            "registrationCamera",
            "registrationStatus"
        );


    return registrationStream;
}


/* =========================================================
   ATTENDANCE CAMERA
   ========================================================= */

async function startAttendanceCamera() {

    if (attendanceStream) {

        return attendanceStream;
    }


    attendanceStream =
        await startCameraForVideo(
            "attendanceCamera",
            "attendanceStatus"
        );


    return attendanceStream;
}


/* =========================================================
   FACE REGISTRATION
   ========================================================= */

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


    const message =
        document.getElementById(
            "registrationMessage"
        );


    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        if (message) {

            message.innerHTML =
                `
                <div class="success-message">
                    ⚠️ Please fill all required details.
                </div>
                `;
        }

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
            "📧 Please enter a valid email address."
        );

        return;
    }


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        alert(
            "❌ Face detection model could not load."
        );

        return;
    }


    const stream =
        await startRegistrationCamera();


    if (!stream) {

        return;
    }


    registrationRunning =
        true;


    const status =
        document.getElementById(
            "registrationStatus"
        );


    if (status) {

        status.innerText =
            "Looking for your face... 👤";
    }


    detectRegistrationFace(
        name,
        roll,
        college,
        department,
        mobile,
        email
    );
}


/* =========================================================
   DETECT REGISTRATION FACE
   ========================================================= */

async function detectRegistrationFace(
    name,
    roll,
    college,
    department,
    mobile,
    email
) {

    if (!registrationRunning) {

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


    try {

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi
                        .TinyFaceDetectorOptions({

                            inputSize: 320,

                            scoreThreshold: 0.5
                        })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        if (detection) {

            if (status) {

                status.innerText =
                    "Face detected ✅ Capturing...";
            }


            const descriptor =
                Array.from(
                    detection.descriptor
                );


            const faceData = {

                name,

                roll,

                college,

                department,

                mobile,

                email,

                descriptor
            };


            localStorage.setItem(
                "registeredFaceStudent",
                JSON.stringify(
                    faceData
                )
            );


            const existing =
                students.find(
                    s =>
                        String(s.roll) ===
                        String(roll)
                );


            if (existing) {

                existing.name =
                    name;

                existing.college =
                    college;

                existing.department =
                    department;

                existing.mobile =
                    mobile;

                existing.email =
                    email;

            } else {

                students.push({

                    name,

                    roll,

                    college,

                    department,

                    mobile,

                    email,

                    status:
                        "Not Marked",

                    attendanceDate:
                        "",

                    attendanceDay:
                        "",

                    attendanceTime:
                        ""
                });
            }


            saveStudents();

            displayStudents();

            updateDashboard();


            registrationSuccessful();


            return;
        }


        if (status) {

            status.innerText =
                "Looking for your face... 👤";
        }


        setTimeout(
            () => {

                detectRegistrationFace(
                    name,
                    roll,
                    college,
                    department,
                    mobile,
                    email
                );

            },
            300
        );

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        registrationRunning =
            false;


        if (status) {

            status.innerText =
                "Face detection error ❌";
        }


        stopRegistrationCamera();
    }
}


/* =========================================================
   REGISTRATION SUCCESS
   ========================================================= */

function registrationSuccessful() {

    registrationRunning =
        false;


    const status =
        document.getElementById(
            "registrationStatus"
        );


    const message =
        document.getElementById(
            "registrationMessage"
        );


    if (status) {

        status.innerText =
            "Face captured successfully ✅";
    }


    if (message) {

        message.innerHTML = `

            <div class="success-message">

                <div class="success-icon">
                    ✅
                </div>

                <strong>
                    Face Captured Successfully!
                </strong>

                <br>

                Face Registration Completed 🎉

            </div>
        `;
    }


    alert(
        "✅ Face Captured Successfully!\n\n" +
        "🎉 Face Registration Completed"
    );


    stopRegistrationCamera();
}


/* =========================================================
   STOP REGISTRATION CAMERA
   ========================================================= */

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
        document.getElementById(
            "registrationCamera"
        );


    if (video) {

        video.srcObject =
            null;
    }
}


/* =========================================================
   FACE ATTENDANCE
   ========================================================= */

async function startFaceAttendance() {

    const result =
        document.getElementById(
            "attendanceResult"
        );


    const status =
        document.getElementById(
            "attendanceStatus"
        );


    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );


    if (!saved) {

        if (result) {

            result.innerHTML = `

                <div class="success-message">

                    ❌ No face registered.

                    <br><br>

                    Please register your face first.

                </div>
            `;
        }

        return;
    }


    let student;


    try {

        student =
            JSON.parse(saved);

    } catch {

        alert(
            "❌ Registered face data is invalid."
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


    const stream =
        await startAttendanceCamera();


    if (!stream) {

        return;
    }


    if (result) {

        result.innerHTML = "";
    }


    if (status) {

        status.innerText =
            "Looking for your face... 👤";
    }


    attendanceRunning =
        true;


    detectAttendanceFace(
        student
    );
}


/* =========================================================
   DETECT ATTENDANCE FACE
   ========================================================= */

async function detectAttendanceFace(
    registeredStudent
) {

    if (!attendanceRunning) {

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

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi
                        .TinyFaceDetectorOptions({

                            inputSize: 320,

                            scoreThreshold: 0.5
                        })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        if (!detection) {

            if (status) {

                status.innerText =
                    "Looking for your face... 👤";
            }


            setTimeout(
                () => {

                    detectAttendanceFace(
                        registeredStudent
                    );

                },
                300
            );


            return;
        }


        if (status) {

            status.innerText =
                "Face detected ✅ Checking...";
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

            attendanceRunning =
                false;


            stopAttendanceCamera();


            if (status) {

                status.innerText =
                    "Face does not match ❌";
            }


            const result =
                document.getElementById(
                    "attendanceResult"
                );


            if (result) {

                result.innerHTML = `

                    <div class="success-message">

                        ❌ Face does not match.

                        <br><br>

                        Please try again.

                    </div>
                `;
            }


            alert(
                "❌ Face does not match.\n\n" +
                "Please try again."
            );
        }

    } catch (error) {

        console.error(
            "Attendance detection error:",
            error
        );


        attendanceRunning =
            false;


        stopAttendanceCamera();


        if (status) {

            status.innerText =
                "Face detection error ❌";
        }
    }
}


/* =========================================================
   ATTENDANCE SUCCESS
   ========================================================= */

function showAttendanceSuccess(
    student
) {

    attendanceRunning =
        false;


    const attendance =
        getAttendanceDateTime();


    const index =
        students.findIndex(
            s =>
                String(s.roll) ===
                String(student.roll)
        );


    if (index !== -1) {

        students[index].status =
            "Present";

        students[index].attendanceDate =
            attendance.date;

        students[index].attendanceDay =
            attendance.day;

        students[index].attendanceTime =
            attendance.time;

    } else {

        students.push({

            name:
                student.name,

            roll:
                student.roll,

            college:
                student.college,

            department:
                student.department,

            mobile:
                student.mobile || "",

            email:
                student.email || "",

            status:
                "Present",

            attendanceDate:
                attendance.date,

            attendanceDay:
                attendance.day,

            attendanceTime:
                attendance.time
        });
    }


    const studentIndex =
        students.findIndex(
            s =>
                String(s.roll) ===
                String(student.roll)
        );


    saveStudentDailyAttendance(
        students[studentIndex],
        "Present",
        attendance
    );


    saveStudents();

    saveAttendanceHistory();


    const email =
        student.email ||
        students[studentIndex].email ||
        "";


    const result =
        document.getElementById(
            "attendanceResult"
        );


    let emailButton = "";


    if (email) {

        const subject =
            encodeURIComponent(
                "Daily Attendance Confirmation"
            );


        const body =
            encodeURIComponent(

                "Hello " +
                student.name +
                ",\n\n" +

                "Your attendance has been successfully marked.\n\n" +

                "Name: " +
                student.name +
                "\n" +

                "Roll: " +
                student.roll +
                "\n" +

                "College: " +
                student.college +
                "\n" +

                "Department: " +
                student.department +
                "\n" +

                "Date: " +
                attendance.date +
                "\n" +

                "Day: " +
                attendance.day +
                "\n" +

                "Time: " +
                attendance.time +
                "\n\n" +

                "Smart Attendance System"
            );


        emailButton = `

            <a
                class="email-button"
                href="mailto:${encodeURIComponent(
                    email
                )}?subject=${subject}&body=${body}"
            >
                📧 Send Attendance Email
            </a>
        `;
    }


    if (result) {

        result.innerHTML = `

            <div class="success-message">

                <div class="success-icon">
                    ✅
                </div>

                <h3>
                    Attendance Successfully Marked!
                </h3>

                <p>
                    👤 <strong>Name:</strong>
                    ${escapeHTML(student.name)}
                </p>

                <p>
                    🔢 <strong>Roll:</strong>
                    ${escapeHTML(student.roll)}
                </p>

                <p>
                    🏫 <strong>College:</strong>
                    ${escapeHTML(student.college)}
                </p>

                <p>
                    🎓 <strong>Department:</strong>
                    ${escapeHTML(student.department)}
                </p>

                <hr>

                <p>
                    📅 <strong>Date:</strong>
                    ${escapeHTML(attendance.date)}
                </p>

                <p>
                    📆 <strong>Day:</strong>
                    ${escapeHTML(attendance.day)}
                </p>

                <p>
                    🕐 <strong>Time:</strong>
                    ${escapeHTML(attendance.time)}
                </p>

                ${
                    email
                        ? `
                            <p>
                                📧 <strong>Email:</strong>
                                ${escapeHTML(email)}
                            </p>

                            ${emailButton}
                          `
                        : `
                            <p>
                                📧 Email not added
                            </p>
                          `
                }

            </div>
        `;
    }


    const status =
        document.getElementById(
            "attendanceStatus"
        );


    if (status) {

        status.innerText =
            "Attendance marked successfully ✅";
    }


    displayStudents();

    updateDashboard();


    stopAttendanceCamera();


    alert(

        "✅ ATTENDANCE SUCCESSFUL!\n\n" +

        "👤 Name: " +
        student.name +

        "\n🔢 Roll: " +
        student.roll +

        "\n📅 Date: " +
        attendance.date +

        "\n📆 Day: " +
        attendance.day +

        "\n🕐 Time: " +
        attendance.time

    );
}


/* =========================================================
   STOP ATTENDANCE CAMERA
   ========================================================= */

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
        document.getElementById(
            "attendanceCamera"
        );


    if (video) {

        video.srcObject =
            null;
    }
}


/* =========================================================
   EDIT DETAILS
   ========================================================= */

function openEditDetails() {

    const modal =
        document.getElementById(
            "editDetailsModal"
        );


    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );


    if (saved) {

        const student =
            JSON.parse(saved);


        const fields = {

            editName:
                student.name || "",

            editRoll:
                student.roll || "",

            editCollege:
                student.college || "",

            editDepartment:
                student.department || "",

            editMobile:
                student.mobile || "",

            editEmail:
                student.email || ""
        };


        Object.keys(fields)
            .forEach(id => {

                const element =
                    document.getElementById(id);


                if (element) {

                    element.value =
                        fields[id];
                }
            });
    }


    if (modal) {

        modal.classList.add("show");
    }
}


function closeEditDetails() {

    const modal =
        document.getElementById(
            "editDetailsModal"
        );


    if (modal) {

        modal.classList.remove("show");
    }
}


/* =========================================================
   SAVE EDITED DETAILS
   ========================================================= */

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
            "📧 Please enter a valid email."
        );

        return;
    }


    const index =
        students.findIndex(
            s =>
                String(s.roll) ===
                String(roll)
        );


    if (index !== -1) {

        students[index].name =
            name;

        students[index].college =
            college;

        students[index].department =
            department;

        students[index].mobile =
            mobile;

        students[index].email =
            email;

        saveStudents();
    }


    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );


    if (saved) {

        const student =
            JSON.parse(saved);


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


        localStorage.setItem(
            "registeredFaceStudent",
            JSON.stringify(student)
        );
    }


    displayStudents();

    updateDashboard();

    closeEditDetails();


    alert(
        "✅ Details updated successfully!"
    );
}


/* =========================================================
   MOBILE UPDATE
   ========================================================= */

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
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


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


    student.mobile =
        clean;


    localStorage.setItem(
        "registeredFaceStudent",
        JSON.stringify(student)
    );


    const index =
        students.findIndex(
            s =>
                String(s.roll) ===
                String(student.roll)
        );


    if (index !== -1) {

        students[index].mobile =
            clean;

        saveStudents();
    }


    displayStudents();


    alert(
        "📱 Mobile number updated successfully!"
    );
}


/* =========================================================
   EMAIL UPDATE
   ========================================================= */

function openEmailUpdate() {

    const email =
        prompt(
            "Enter your email address:"
        );


    if (!email) return;


    const clean =
        email.trim();


    if (!isValidEmail(clean)) {

        alert(
            "📧 Please enter a valid email address."
        );

        return;
    }


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


    student.email =
        clean;


    localStorage.setItem(
        "registeredFaceStudent",
        JSON.stringify(student)
    );


    const index =
        students.findIndex(
            s =>
                String(s.roll) ===
                String(student.roll)
        );


    if (index !== -1) {

        students[index].email =
            clean;

        saveStudents();
    }


    displayStudents();


    alert(
        "📧 Email updated successfully!"
    );
}


/* =========================================================
   REGISTERED STUDENTS
   ========================================================= */

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


    if (students.length === 0) {

        list.innerHTML =
            "<p>No students registered yet.</p>";

    } else {

        students.forEach(
            (student, index) => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "registered-student";


                div.innerHTML = `

                    <strong>
                        ${index + 1}.
                        ${escapeHTML(student.name)}
                    </strong>

                    <br>

                    🔢 Roll:
                    ${escapeHTML(student.roll)}

                    <br>

                    🏫 College:
                    ${escapeHTML(student.college)}

                    <br>

                    🎓 Department:
                    ${escapeHTML(student.department)}

                    <br>

                    📱 Mobile:
                    ${escapeHTML(
                        student.mobile || "Not added"
                    )}

                    <br>

                    📧 Email:
                    ${escapeHTML(
                        student.email || "Not added"
                    )}

                    <br>

                    📌 Status:
                    ${escapeHTML(
                        student.status || "Not Marked"
                    )}

                `;


                list.appendChild(div);
            }
        );
    }


    modal.classList.add("show");


    const menu =
        document.getElementById(
            "mainMenu"
        );


    if (menu) {

        menu.classList.remove("show");
    }
}


function closeRegisteredStudents() {

    const modal =
        document.getElementById(
            "studentsModal"
        );


    if (modal) {

        modal.classList.remove("show");
    }
}


/* =========================================================
   CHECK ATTENDANCE
   ========================================================= */

function showCheckAttendance() {

    const modal =
        document.getElementById(
            "attendanceCheckModal"
        );


    if (!modal) {

        alert(
            "Check Attendance section is not available."
        );

        return;
    }


    calculateAttendanceSummary();


    modal.classList.add("show");


    const menu =
        document.getElementById(
            "mainMenu"
        );


    if (menu) {

        menu.classList.remove("show");
    }
}


/* =========================================================
   ATTENDANCE SUMMARY
   ========================================================= */

function calculateAttendanceSummary() {

    const dates =
        Object.keys(
            attendanceHistory
        );


    let presentDays = 0;

    let absentDays = 0;


    dates.forEach(dateKey => {

        const dayData =
            attendanceHistory[dateKey];


        if (
            !dayData ||
            !dayData.students
        ) {

            return;
        }


        Object.values(
            dayData.students
        ).forEach(student => {

            if (
                student.status ===
                "Present"
            ) {

                presentDays++;

            } else if (
                student.status ===
                "Absent"
            ) {

                absentDays++;
            }
        });
    });


    const totalElement =
        document.getElementById(
            "attendanceTotalDays"
        );


    const presentElement =
        document.getElementById(
            "attendancePresentDays"
        );


    const absentElement =
        document.getElementById(
            "attendanceAbsentDays"
        );


    if (totalElement) {

        totalElement.innerText =
            dates.length;
    }


    if (presentElement) {

        presentElement.innerText =
            presentDays;
    }


    if (absentElement) {

        absentElement.innerText =
            absentDays;
    }


    showAttendanceHistory();
}


/* =========================================================
   ATTENDANCE HISTORY
   ========================================================= */

function showAttendanceHistory() {

    const historyElement =
        document.getElementById(
            "attendanceHistory"
        );


    if (!historyElement) return;


    historyElement.innerHTML = "";


    const dates =
        Object.keys(
            attendanceHistory
        )
            .sort()
            .reverse();


    if (dates.length === 0) {

        historyElement.innerHTML =
            "<p>No attendance history available yet.</p>";

        return;
    }


    dates.forEach(dateKey => {

        const dayData =
            attendanceHistory[dateKey];


        const box =
            document.createElement(
                "div"
            );


        box.style.cssText = `

            background:#f8fafc;

            border:1px solid #e2e8f0;

            border-radius:14px;

            padding:15px;

            margin-bottom:12px;

        `;


        let html = `

            <strong>
                📅 ${escapeHTML(dayData.date)}
            </strong>

            <br>

            📆 ${escapeHTML(dayData.day)}

        `;


        Object.values(
            dayData.students || {}
        ).forEach(student => {

            const status =
                student.status ===
                "Present"
                    ? "🟢 Present"
                    : "🔴 Absent";


            html += `

                <div
                    style="
                        background:white;
                        padding:10px;
                        margin-top:8px;
                        border-radius:10px;
                        border:1px solid #e5e7eb;
                    "
                >

                    <strong>
                        ${escapeHTML(student.name)}
                    </strong>

                    <br>

                    Roll:
                    ${escapeHTML(student.roll)}

                    <br>

                    Status:
                    <strong>
                        ${status}
                    </strong>

                    ${
                        student.time
                            ? `
                                <br>
                                🕐 ${escapeHTML(student.time)}
                              `
                            : ""
                    }

                </div>
            `;
        });


        box.innerHTML =
            html;


        historyElement.appendChild(
            box
        );
    });
}


function closeCheckAttendance() {

    const modal =
        document.getElementById(
            "attendanceCheckModal"
        );


    if (modal) {

        modal.classList.remove("show");
    }
}


/* =========================================================
   ADMIN
   ========================================================= */

function showAdminDetails() {

    const modal =
        document.getElementById(
            "adminModal"
        );


    if (!modal) return;


    modal.classList.add(
        "show"
    );


    const menu =
        document.getElementById(
            "mainMenu"
        );


    if (menu) {

        menu.classList.remove(
            "show"
        );
    }
}


function closeAdminDetails() {

    const modal =
        document.getElementById(
            "adminModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   THREE LINE MENU
   ========================================================= */

function toggleMenu() {

    const menu =
        document.getElementById(
            "mainMenu"
        );


    if (!menu) return;


    menu.classList.toggle(
        "show"
    );
}


/* =========================================================
   CLOSE MODALS OUTSIDE
   ========================================================= */

window.addEventListener(
    "click",
    function(event) {

        document
            .querySelectorAll(
                ".modal"
            )
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


/* =========================================================
   PAGE LOAD
   ========================================================= */

window.addEventListener(
    "load",
    async function() {

        setupLoginInputs();

        checkLoginStatus();

        displayStudents();

        updateDashboard();

        showCurrentDate();


        /*
         * Do not force camera on page load.
         * Camera starts only when the user
         * chooses Face Registration or
         * Face Attendance.
         */

        try {

            await loadFaceModels();

        } catch (error) {

            console.log(
                "Face model loading skipped:",
                error
            );
        }
    }
);

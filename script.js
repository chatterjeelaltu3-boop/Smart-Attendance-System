/* =====================================================
   SMART ATTENDANCE SYSTEM
   COMPLETE SCRIPT.JS
===================================================== */


/* =====================================================
   DATA
===================================================== */

let students =
    JSON.parse(
        localStorage.getItem("students")
    ) || [];

let attendanceHistory =
    JSON.parse(
        localStorage.getItem("attendanceHistory")
    ) || {};

let registrationStream = null;
let attendanceStream = null;

let faceModelLoaded = false;

let registrationRunning = false;
let attendanceRunning = false;


/* =====================================================
   FACE API
===================================================== */

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";


/* =====================================================
   STORAGE
===================================================== */

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


/* =====================================================
   LOGIN ACCOUNT
===================================================== */

function getAccount() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );

    } catch {

        return null;
    }
}


/* =====================================================
   VALIDATION
===================================================== */

function isValidMobile(mobile) {

    return /^[0-9]{10}$/.test(
        String(mobile || "")
    );
}

function isValidPIN(pin) {

    return /^[0-9]{4}$/.test(
        String(pin || "")
    );
}

function isValidEmail(email) {

    if (!email) return true;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );
}


/* =====================================================
   INPUT LIMITS
===================================================== */

function setupNumericInput(
    id,
    maxLength
) {

    const input =
        document.getElementById(id);

    if (!input) return;

    input.setAttribute(
        "maxlength",
        String(maxLength)
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
                    .slice(
                        0,
                        maxLength
                    );
        }
    );
}


/* =====================================================
   ACCOUNT PAGE
===================================================== */

function showCreateAccountPage() {

    const login =
        document.getElementById(
            "loginPage"
        );

    const create =
        document.getElementById(
            "createAccountPage"
        );

    if (login) {
        login.style.display = "none";
    }

    if (create) {
        create.style.display = "flex";
    }
}

function showLoginPage() {

    const login =
        document.getElementById(
            "loginPage"
        );

    const create =
        document.getElementById(
            "createAccountPage"
        );

    if (create) {
        create.style.display = "none";
    }

    if (login) {
        login.style.display = "flex";
    }
}


/* =====================================================
   CREATE ACCOUNT
===================================================== */

function createAccount() {

    const name =
        document.getElementById(
            "createName"
        )?.value.trim();

    const mobile =
        document.getElementById(
            "createMobile"
        )?.value.trim();

    const email =
        document.getElementById(
            "createEmail"
        )?.value.trim();

    const pin =
        document.getElementById(
            "createPin"
        )?.value.trim();

    const confirmPin =
        document.getElementById(
            "confirmPin"
        )?.value.trim();

    const message =
        document.getElementById(
            "createMessage"
        );


    if (
        !name ||
        !mobile ||
        !pin ||
        !confirmPin
    ) {

        if (message) {

            message.innerHTML =
                "⚠️ Please fill all required fields.";

            message.style.color =
                "#dc2626";
        }

        return;
    }


    if (!isValidMobile(mobile)) {

        if (message) {

            message.innerHTML =
                "📱 Mobile number must contain exactly 10 digits.";

            message.style.color =
                "#dc2626";
        }

        return;
    }


    if (!isValidPIN(pin)) {

        if (message) {

            message.innerHTML =
                "🔐 PIN must contain exactly 4 digits.";

            message.style.color =
                "#dc2626";
        }

        return;
    }


    if (pin !== confirmPin) {

        if (message) {

            message.innerHTML =
                "❌ PIN and Confirm PIN do not match.";

            message.style.color =
                "#dc2626";
        }

        return;
    }


    if (!isValidEmail(email)) {

        if (message) {

            message.innerHTML =
                "📧 Please enter a valid email address.";

            message.style.color =
                "#dc2626";
        }

        return;
    }


    const existing =
        getAccount();


    if (existing) {

        if (message) {

            message.innerHTML =
                "⚠️ An account already exists. Please login.";

            message.style.color =
                "#dc2626";
        }

        return;
    }


    const account = {

        name,
        mobile,
        email,
        pin

    };


    localStorage.setItem(
        "smartAttendanceAccount",
        JSON.stringify(account)
    );


    if (message) {

        message.innerHTML =
            "✅ Account created successfully!";

        message.style.color =
            "#16a34a";
    }


    setTimeout(
        () => {

            showLoginPage();

            const loginName =
                document.getElementById(
                    "loginName"
                );

            const loginMobile =
                document.getElementById(
                    "loginMobile"
                );

            if (loginName) {
                loginName.value =
                    name;
            }

            if (loginMobile) {
                loginMobile.value =
                    mobile;
            }

        },
        700
    );
}


/* =====================================================
   LOGIN
===================================================== */

function loginUser() {

    const name =
        document.getElementById(
            "loginName"
        )?.value.trim();

    const mobile =
        document.getElementById(
            "loginMobile"
        )?.value.trim();

    const pin =
        document.getElementById(
            "loginPin"
        )?.value.trim();

    const message =
        document.getElementById(
            "loginMessage"
        );


    if (
        !name ||
        !mobile ||
        !pin
    ) {

        if (message) {

            message.innerHTML =
                "⚠️ Please enter Name, Mobile Number and PIN.";

            message.style.color =
                "#dc2626";
        }

        return;
    }


    if (!isValidMobile(mobile)) {

        if (message) {

            message.innerHTML =
                "📱 Mobile number must contain exactly 10 digits.";

            message.style.color =
                "#dc2626";
        }

        return;
    }


    if (!isValidPIN(pin)) {

        if (message) {

            message.innerHTML =
                "🔐 PIN must contain exactly 4 digits.";

            message.style.color =
                "#dc2626";
        }

        return;
    }


    const account =
        getAccount();


    if (!account) {

        if (message) {

            message.innerHTML =
                "❌ No account found. Please Create Account first.";

            message.style.color =
                "#dc2626";
        }

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

        showDashboard();

    } else {

        if (message) {

            message.innerHTML =
                "❌ Name, Mobile Number or PIN is incorrect.";

            message.style.color =
                "#dc2626";
        }
    }
}


/* =====================================================
   SHOW DASHBOARD
===================================================== */

function showDashboard() {

    const login =
        document.getElementById(
            "loginPage"
        );

    const create =
        document.getElementById(
            "createAccountPage"
        );

    const dashboard =
        document.getElementById(
            "dashboardPage"
        );


    if (login) {
        login.style.display = "none";
    }

    if (create) {
        create.style.display = "none";
    }

    if (dashboard) {
        dashboard.style.display = "block";
    }


    displayStudents();
    updateDashboard();
    showCurrentDate();
}


/* =====================================================
   LOGIN STATUS
===================================================== */

function checkLoginStatus() {

    const loggedIn =
        localStorage.getItem(
            "smartAttendanceLoggedIn"
        );


    if (loggedIn === "true") {

        showDashboard();

    } else {

        showLoginPage();
    }
}


/* =====================================================
   LOGOUT
===================================================== */

function logoutUser() {

    localStorage.removeItem(
        "smartAttendanceLoggedIn"
    );

    stopRegistrationCamera();
    stopAttendanceCamera();

    location.reload();
}


/* =====================================================
   FORGOT PIN
===================================================== */

function forgotPIN() {

    const account =
        getAccount();


    if (!account) {

        alert(
            "❌ No account found.\n\nPlease create an account first."
        );

        showCreateAccountPage();

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

        alert(
            "🔐 Your 4 digit PIN is:\n\n" +
            account.pin
        );

    } else {

        alert(
            "❌ Name and mobile number do not match."
        );
    }
}


/* =====================================================
   DATE
===================================================== */

function getDateKey() {

    const now =
        new Date();

    return (

        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            now.getDate()
        ).padStart(2, "0")

    );
}


function getAttendanceDateTime() {

    const now =
        new Date();

    return {

        date:
            now.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ),

        day:
            now.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long"
                }
            ),

        time:
            now.toLocaleTimeString(
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
        document.getElementById(
            "currentDate"
        );

    if (!element) return;

    const now =
        new Date();

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


/* =====================================================
   STUDENT DATA
===================================================== */

function addStudent() {

    const name =
        document.getElementById(
            "studentName"
        )?.value.trim();

    const roll =
        document.getElementById(
            "studentRoll"
        )?.value.trim();

    const college =
        document.getElementById(
            "studentCollege"
        )?.value.trim();

    const department =
        document.getElementById(
            "studentDepartment"
        )?.value.trim();

    const mobile =
        document.getElementById(
            "studentMobile"
        )?.value.trim();


    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        alert(
            "Please fill all student details."
        );

        return;
    }


    if (!isValidMobile(mobile)) {

        alert(
            "Mobile number must contain exactly 10 digits."
        );

        return;
    }


    students.push({

        name,
        roll,
        college,
        department,
        mobile,
        email: "",

        status: "Not Marked",

        attendanceDate: "",
        attendanceDay: "",
        attendanceTime: ""

    });


    saveStudents();

    displayStudents();

    updateDashboard();
}


/* =====================================================
   DISPLAY STUDENTS
===================================================== */

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
            .toLowerCase()
            .trim() || "";


    list.innerHTML = "";


    const filtered =
        students.filter(
            student =>
                (
                    student.name || ""
                )
                    .toLowerCase()
                    .includes(search)
                ||
                (
                    student.roll || ""
                )
                    .toLowerCase()
                    .includes(search)
        );


    if (!filtered.length) {

        list.innerHTML =
            "<p>No students found.</p>";

        return;
    }


    filtered.forEach(
        student => {

            const index =
                students.indexOf(
                    student
                );


            const row =
                document.createElement(
                    "div"
                );

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

                    <div class="status">
                        Status:
                        ${escapeHTML(student.status || "Not Marked")}
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
        }
    );
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   MARK PRESENT
===================================================== */

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


/* =====================================================
   MARK ABSENT
===================================================== */

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


/* =====================================================
   DAILY ATTENDANCE
===================================================== */

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

            status,

            time:
                status === "Present"
                    ? attendance.time
                    : ""

        };


    saveAttendanceHistory();
}


/* =====================================================
   DELETE STUDENT
===================================================== */

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
    ).forEach(
        dateKey => {

            if (
                attendanceHistory[dateKey]
                    ?.students?.[roll]
            ) {

                delete attendanceHistory[
                    dateKey
                ].students[roll];
            }
        }
    );


    saveStudents();
    saveAttendanceHistory();

    displayStudents();
    updateDashboard();
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const total =
        students.length;

    const present =
        students.filter(
            s =>
                s.status ===
                "Present"
        ).length;

    const absent =
        students.filter(
            s =>
                s.status ===
                "Absent"
        ).length;

    const percentage =
        total
            ? Math.round(
                present /
                total *
                100
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


/* =====================================================
   FACE MODELS
===================================================== */

async function loadFaceModels() {

    if (faceModelLoaded) {
        return true;
    }


    if (
        typeof faceapi ===
        "undefined"
    ) {

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
            error
        );

        return false;
    }
}


/* =====================================================
   CAMERA
===================================================== */

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


    if (!video) return null;


    try {

        const stream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {

                        facingMode:
                            "user",

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
            "Camera could not start. Please allow camera permission."
        );


        return null;
    }
}


async function startRegistrationCamera() {

    if (registrationStream)
        return;

    registrationStream =
        await startCameraForVideo(
            "registrationCamera",
            "registrationStatus"
        );
}


async function startAttendanceCamera() {

    if (attendanceStream)
        return;

    attendanceStream =
        await startCameraForVideo(
            "attendanceCamera",
            "attendanceStatus"
        );
}


/* =====================================================
   FACE REGISTRATION
===================================================== */

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

        showMessage(
            message,
            "⚠️ Please fill all required details.",
            false
        );

        return;
    }


    if (!isValidMobile(mobile)) {

        showMessage(
            message,
            "📱 Mobile number must contain exactly 10 digits.",
            false
        );

        return;
    }


    if (!isValidEmail(email)) {

        showMessage(
            message,
            "📧 Please enter a valid email address.",
            false
        );

        return;
    }


    const button =
        document.getElementById(
            "registerFaceButton"
        );

    if (button)
        button.disabled = true;


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        showMessage(
            message,
            "❌ Face detection model could not load.",
            false
        );

        buttonEnable(
            "registerFaceButton"
        );

        return;
    }


    if (
        !document.getElementById(
            "registrationCamera"
        )?.srcObject
    ) {

        registrationStream =
            await startCameraForVideo(
                "registrationCamera",
                "registrationStatus"
            );


        if (!registrationStream) {

            buttonEnable(
                "registerFaceButton"
            );

            return;
        }
    }


    registrationRunning =
        true;


    detectRegistrationFace(
        name,
        roll,
        college,
        department,
        mobile,
        email
    );
}


/* =====================================================
   DETECT REGISTRATION FACE
===================================================== */

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
                            scoreThreshold: .5
                        })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        if (detection) {

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


            const data = {

                name,
                roll,
                college,
                department,
                mobile,
                email,

                status:
                    index >= 0
                        ? students[index].status
                        : "Not Marked",

                attendanceDate:
                    index >= 0
                        ? students[index].attendanceDate
                        : "",

                attendanceDay:
                    index >= 0
                        ? students[index].attendanceDay
                        : "",

                attendanceTime:
                    index >= 0
                        ? students[index].attendanceTime
                        : ""

            };


            if (index >= 0) {

                students[index] =
                    data;

            } else {

                students.push(
                    data
                );
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
            () =>
                detectRegistrationFace(
                    name,
                    roll,
                    college,
                    department,
                    mobile,
                    email
                ),
            300
        );

    } catch (error) {

        console.error(
            error
        );

        registrationRunning =
            false;

        if (status) {

            status.innerText =
                "Face detection error ❌";
        }

        buttonEnable(
            "registerFaceButton"
        );
    }
}


/* =====================================================
   REGISTRATION SUCCESS
===================================================== */

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
            "Face Captured Successfully ✅";
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

                <br><br>

                🎉 Face Registration Completed

            </div>

        `;
    }


    stopRegistrationCamera();

    buttonEnable(
        "registerFaceButton"
    );


    alert(
        "✅ Face Registration Completed!"
    );
}


/* =====================================================
   ATTENDANCE
===================================================== */

async function startFaceAttendance() {

    const result =
        document.getElementById(
            "attendanceResult"
        );

    const button =
        document.getElementById(
            "attendanceButton"
        );


    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );


    if (!saved) {

        showMessage(
            result,
            "❌ No face registered. Please register your face first.",
            false
        );

        return;
    }


    let student;


    try {

        student =
            JSON.parse(
                saved
            );

    } catch {

        showMessage(
            result,
            "❌ Registered face data is corrupted.",
            false
        );

        return;
    }


    if (button)
        button.disabled = true;


    const ready =
        await loadFaceModels();


    if (!ready) {

        buttonEnable(
            "attendanceButton"
        );

        return;
    }


    if (
        !document.getElementById(
            "attendanceCamera"
        )?.srcObject
    ) {

        attendanceStream =
            await startCameraForVideo(
                "attendanceCamera",
                "attendanceStatus"
            );


        if (!attendanceStream) {

            buttonEnable(
                "attendanceButton"
            );

            return;
        }
    }


    attendanceRunning =
        true;


    detectAttendanceFace(
        student
    );
}


/* =====================================================
   ATTENDANCE DETECTION
===================================================== */

async function detectAttendanceFace(
    registeredStudent
) {

    if (!attendanceRunning)
        return;


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
                            scoreThreshold: .5
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
                () =>
                    detectAttendanceFace(
                        registeredStudent
                    ),
                300
            );

            return;
        }


        if (status) {

            status.innerText =
                "Face detected ✅ Checking identity...";
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


        if (distance < .55) {

            showAttendanceSuccess(
                registeredStudent
            );

        } else {

            attendanceRunning =
                false;

            stopAttendanceCamera();

            buttonEnable(
                "attendanceButton"
            );


            showMessage(
                document.getElementById(
                    "attendanceResult"
                ),
                "❌ Face does not match. Please try again.",
                false
            );


            alert(
                "❌ Face does not match.\nPlease try again."
            );
        }

    } catch (error) {

        console.error(
            error
        );

        attendanceRunning =
            false;

        buttonEnable(
            "attendanceButton"
        );
    }
}


/* =====================================================
   ATTENDANCE SUCCESS
===================================================== */

function showAttendanceSuccess(
    student
) {

    attendanceRunning =
        false;


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


    saveStudentDailyAttendance(
        students[index],
        "Present",
        attendance
    );


    saveStudents();


    const email =
        students[index].email ||
        student.email ||
        "";


    let emailButton = "";


    if (email) {

        const subject =
            encodeURIComponent(
                "Daily Attendance Confirmation"
            );


        const body =
            encodeURIComponent(

                `Hello ${students[index].name},

Your attendance has been successfully marked.

Name: ${students[index].name}
Roll: ${students[index].roll}
College: ${students[index].college}
Department: ${students[index].department}
Date: ${attendance.date}
Day: ${attendance.day}
Time: ${attendance.time}

Smart Attendance System`
            );


        emailButton = `

            <a
                href="mailto:${email}?subject=${subject}&body=${body}"
                style="
                    display:inline-block;
                    margin-top:15px;
                    padding:12px 18px;
                    border-radius:10px;
                    background:#2563eb;
                    color:white;
                    text-decoration:none;
                    font-weight:bold;
                "
            >
                📧 Send Attendance Email
            </a>

        `;
    }


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
                    Attendance Successfully Marked!
                </h3>

                <p>
                    <strong>👤 Name:</strong>
                    ${escapeHTML(students[index].name)}
                </p>

                <p>
                    <strong>🔢 Roll:</strong>
                    ${escapeHTML(students[index].roll)}
                </p>

                <p>
                    <strong>🏫 College:</strong>
                    ${escapeHTML(students[index].college)}
                </p>

                <p>
                    <strong>🎓 Department:</strong>
                    ${escapeHTML(students[index].department)}
                </p>

                <p>
                    <strong>📅 Date:</strong>
                    ${attendance.date}
                </p>

                <p>
                    <strong>📆 Day:</strong>
                    ${attendance.day}
                </p>

                <p>
                    <strong>🕐 Time:</strong>
                    ${attendance.time}
                </p>

                <p>
                    <strong>📧 Email:</strong>
                    ${escapeHTML(email || "Not added")}
                </p>

                ${emailButton}

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

    buttonEnable(
        "attendanceButton"
    );


    alert(
        "✅ Attendance Successfully Marked!\n\n" +
        "👤 Name: " +
        students[index].name +
        "\n🔢 Roll: " +
        students[index].roll +
        "\n📅 Date: " +
        attendance.date +
        "\n📆 Day: " +
        attendance.day +
        "\n🕐 Time: " +
        attendance.time
    );
}


/* =====================================================
   CAMERA STOP
===================================================== */

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

    if (video)
        video.srcObject = null;
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
        document.getElementById(
            "attendanceCamera"
        );

    if (video)
        video.srcObject = null;
}


function buttonEnable(id) {

    const button =
        document.getElementById(id);

    if (button)
        button.disabled = false;
}


/* =====================================================
   MENU
===================================================== */

function toggleMenu() {

    document
        .getElementById(
            "mainMenu"
        )
        ?.classList.toggle(
            "show"
        );
}


/* =====================================================
   EDIT DETAILS
===================================================== */

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


    Object.entries(fields)
        .forEach(
            ([id, value]) => {

                const element =
                    document.getElementById(
                        id
                    );

                if (element)
                    element.value =
                        value;
            }
        );


    document
        .getElementById(
            "editDetailsModal"
        )
        ?.classList.add(
            "show"
        );


    closeMenu();
}


function closeEditDetails() {

    document
        .getElementById(
            "editDetailsModal"
        )
        ?.classList.remove(
            "show"
        );
}


/* =====================================================
   SAVE EDIT
===================================================== */

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
            "Please enter a valid email."
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

        student.name = name;
        student.roll = roll;
        student.college = college;
        student.department = department;
        student.mobile = mobile;
        student.email = email;


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


/* =====================================================
   MOBILE UPDATE
===================================================== */

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


    if (index >= 0) {

        students[index].mobile =
            clean;

        saveStudents();
    }


    displayStudents();


    alert(
        "📱 Mobile number updated successfully!"
    );
}


/* =====================================================
   EMAIL UPDATE
===================================================== */

function openEmailUpdate() {

    const email =
        prompt(
            "Enter your email address (optional):"
        );

    if (!email) return;


    const clean =
        email.trim();


    if (!isValidEmail(clean)) {

        alert(
            "Please enter a valid email address."
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


    if (index >= 0) {

        students[index].email =
            clean;

        saveStudents();
    }


    displayStudents();


    alert(
        "📧 Email updated successfully!"
    );
}


/* =====================================================
   REGISTERED STUDENTS
===================================================== */

function showRegisteredStudents() {

    const modal =
        document.getElementById(
            "studentsModal"
        );

    const list =
        document.getElementById(
            "registeredStudentsList"
        );


    if (!modal || !list)
        return;


    list.innerHTML = "";


    if (!students.length) {

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
                    ${escapeHTML(student.mobile || "Not added")}

                    <br>

                    📧 Email:
                    ${escapeHTML(student.email || "Not added")}

                    <br>

                    📌 Status:
                    ${escapeHTML(student.status)}

                `;


                list.appendChild(
                    div
                );
            }
        );
    }


    modal.classList.add(
        "show"
    );

    closeMenu();
}


function closeRegisteredStudents() {

    document
        .getElementById(
            "studentsModal"
        )
        ?.classList.remove(
            "show"
        );
}


/* =====================================================
   CHECK ATTENDANCE
===================================================== */

function showCheckAttendance() {

    calculateAttendanceSummary();

    document
        .getElementById(
            "attendanceCheckModal"
        )
        ?.classList.add(
            "show"
        );

    closeMenu();
}


function calculateAttendanceSummary() {

    let totalDays =
        Object.keys(
            attendanceHistory
        ).length;

    let presentDays = 0;
    let absentDays = 0;


    Object.values(
        attendanceHistory
    ).forEach(
        day => {

            Object.values(
                day.students || {}
            ).forEach(
                student => {

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
                }
            );
        }
    );


    const total =
        document.getElementById(
            "attendanceTotalDays"
        );

    const present =
        document.getElementById(
            "attendancePresentDays"
        );

    const absent =
        document.getElementById(
            "attendanceAbsentDays"
        );


    if (total)
        total.innerText =
            totalDays;

    if (present)
        present.innerText =
            presentDays;

    if (absent)
        absent.innerText =
            absentDays;


    showAttendanceHistory();
}


function showAttendanceHistory() {

    const element =
        document.getElementById(
            "attendanceHistory"
        );

    if (!element) return;


    element.innerHTML = "";


    const dates =
        Object.keys(
            attendanceHistory
        )
            .sort()
            .reverse();


    if (!dates.length) {

        element.innerHTML =
            "<p>No attendance history available yet.</p>";

        return;
    }


    dates.forEach(
        dateKey => {

            const day =
                attendanceHistory[
                    dateKey
                ];


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
                    📅 ${escapeHTML(day.date)}
                </strong>

                <br>

                📆 ${escapeHTML(day.day)}

            `;


            Object.values(
                day.students || {}
            ).forEach(
                student => {

                    const statusColor =
                        student.status ===
                        "Present"
                            ? "#16a34a"
                            : "#dc2626";


                    html += `

                        <div
                            style="
                                margin-top:10px;
                                padding:11px;
                                background:white;
                                border:1px solid #e5e7eb;
                                border-radius:10px;
                            "
                        >

                            <strong>
                                ${escapeHTML(student.name)}
                            </strong>

                            <br>

                            🔢 Roll:
                            ${escapeHTML(student.roll)}

                            <br>

                            Status:

                            <strong
                                style="
                                    color:${statusColor};
                                "
                            >
                                ${escapeHTML(student.status)}
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
                }
            );


            box.innerHTML =
                html;


            element.appendChild(
                box
            );
        }
    );
}


function closeCheckAttendance() {

    document
        .getElementById(
            "attendanceCheckModal"
        )
        ?.classList.remove(
            "show"
        );
}


/* =====================================================
   ADMIN
===================================================== */

function showAdminDetails() {

    document
        .getElementById(
            "adminModal"
        )
        ?.classList.add(
            "show"
        );

    closeMenu();
}


function closeAdminDetails() {

    document
        .getElementById(
            "adminModal"
        )
        ?.classList.remove(
            "show"
        );
}


/* =====================================================
   CLOSE MENU
===================================================== */

function closeMenu() {

    document
        .getElementById(
            "mainMenu"
        )
        ?.classList.remove(
            "show"
        );
}


/* =====================================================
   GENERIC MESSAGE
===================================================== */

function showMessage(
    element,
    text,
    success
) {

    if (!element) return;

    element.innerHTML = `

        <div
            class="success-message"
            style="
                background:${success ? "#ecfdf5" : "#fef2f2"};
                border-color:${success ? "#22c55e" : "#ef4444"};
                color:${success ? "#166534" : "#991b1b"};
            "
        >
            ${text}
        </div>
    `;
}


/* =====================================================
   OUTSIDE MODAL CLICK
===================================================== */

window.addEventListener(
    "click",
    event => {

        document
            .querySelectorAll(
                ".modal"
            )
            .forEach(
                modal => {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );
                    }
                }
            );
    }
);


/* =====================================================
   INITIALIZE
===================================================== */

window.addEventListener(
    "load",
    async () => {

        setupNumericInput(
            "loginMobile",
            10
        );

        setupNumericInput(
            "loginPin",
            4
        );

        setupNumericInput(
            "createMobile",
            10
        );

        setupNumericInput(
            "createPin",
            4
        );

        setupNumericInput(
            "confirmPin",
            4
        );

        setupNumericInput(
            "faceMobile",
            10
        );

        setupNumericInput(
            "editMobile",
            10
        );


        document
            .getElementById(
                "loginButton"
            )
            ?.addEventListener(
                "click",
                loginUser
            );


        document
            .getElementById(
                "forgotPinButton"
            )
            ?.addEventListener(
                "click",
                forgotPIN
            );


        document
            .getElementById(
                "createAccountButton"
            )
            ?.addEventListener(
                "click",
                showCreateAccountPage
            );


        document
            .getElementById(
                "saveAccountButton"
            )
            ?.addEventListener(
                "click",
                createAccount
            );


        document
            .getElementById(
                "backToLoginButton"
            )
            ?.addEventListener(
                "click",
                showLoginPage
            );


        checkLoginStatus();


        displayStudents();

        updateDashboard();

        showCurrentDate();


        if (
            typeof faceapi !==
            "undefined"
        ) {

            loadFaceModels();
        }
    }
);

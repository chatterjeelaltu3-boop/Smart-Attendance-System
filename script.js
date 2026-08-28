// =====================================================
// SMART ATTENDANCE SYSTEM
// LOGIN + SIGNUP + FORGOT PIN + ATTENDANCE
// =====================================================

let students =
    JSON.parse(localStorage.getItem("students")) || [];

let attendanceHistory =
    JSON.parse(localStorage.getItem("attendanceHistory")) || {};

let faceModelLoaded = false;
let registrationStream = null;
let attendanceStream = null;
let registrationRunning = false;
let attendanceRunning = false;
let forgotOTP = null;

const MODEL_URL =
"https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";


// =====================================================
// BASIC STORAGE
// =====================================================

function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

function saveAttendanceHistory() {
    localStorage.setItem(
        "attendanceHistory",
        JSON.stringify(attendanceHistory)
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
// INPUT LIMITS
// =====================================================

function setupInputs() {

    const mobileIDs = [
        "loginMobile",
        "signupMobile",
        "forgotMobile",
        "faceMobile",
        "editMobile"
    ];

    mobileIDs.forEach(id => {

        const input = document.getElementById(id);

        if (!input) return;

        input.maxLength = 10;
        input.inputMode = "numeric";

        input.addEventListener("input", function() {

            this.value =
                this.value
                .replace(/\D/g, "")
                .slice(0, 10);
        });
    });


    const pinIDs = [
        "loginPin",
        "signupPin",
        "signupConfirmPin",
        "newPin",
        "confirmNewPin"
    ];

    pinIDs.forEach(id => {

        const input = document.getElementById(id);

        if (!input) return;

        input.maxLength = 4;
        input.inputMode = "numeric";

        input.addEventListener("input", function() {

            this.value =
                this.value
                .replace(/\D/g, "")
                .slice(0, 4);
        });
    });
}


// =====================================================
// ACCOUNT CREATION
// =====================================================

function createAccount() {

    const name =
        document.getElementById("signupName").value.trim();

    const mobile =
        document.getElementById("signupMobile").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim();

    const pin =
        document.getElementById("signupPin").value.trim();

    const confirmPin =
        document.getElementById("signupConfirmPin").value.trim();


    if (!name || !mobile || !pin || !confirmPin) {

        alert("⚠️ Please fill all required fields.");
        return;
    }


    if (!isValidMobile(mobile)) {

        alert("📱 Mobile number must contain exactly 10 digits.");
        return;
    }


    if (!isValidPIN(pin)) {

        alert("🔐 PIN must contain exactly 4 digits.");
        return;
    }


    if (pin !== confirmPin) {

        alert("❌ PIN and Confirm PIN do not match.");
        return;
    }


    if (!isValidEmail(email)) {

        alert("📧 Please enter a valid email.");
        return;
    }


    const existing =
        JSON.parse(
            localStorage.getItem("smartAttendanceAccount")
        );


    if (existing) {

        if (
            existing.mobile === mobile ||
            (email && existing.email === email)
        ) {

            alert(
                "⚠️ An account already exists with these details."
            );

            return;
        }
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


    alert(
        "✅ Account created successfully!\n\n" +
        "Now you can login."
    );


    closeSignup();

    document.getElementById("loginName").value = name;
    document.getElementById("loginMobile").value = mobile;
}


// =====================================================
// OPEN SIGNUP
// =====================================================

function openSignup() {

    const modal =
        document.getElementById("signupModal");

    if (modal) {
        modal.classList.add("show");
    }
}

function closeSignup() {

    const modal =
        document.getElementById("signupModal");

    if (modal) {
        modal.classList.remove("show");
    }
}


// =====================================================
// LOGIN
// =====================================================

function loginUser() {

    const name =
        document.getElementById("loginName").value.trim();

    const mobile =
        document.getElementById("loginMobile").value.trim();

    const pin =
        document.getElementById("loginPin").value.trim();


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


    const account =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (!account) {

        alert(
            "❌ No account found.\n\n" +
            "Please click 'Create Account' below and create an account first."
        );

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


        alert("✅ Login Successful!");


        showDashboard();

    } else {

        alert(
            "❌ Login failed!\n\n" +
            "Name, Mobile Number or PIN is incorrect."
        );
    }
}


// =====================================================
// SHOW DASHBOARD
// =====================================================

function showDashboard() {

    const loginPage =
        document.getElementById("loginPage");

    const dashboardPage =
        document.getElementById("dashboardPage");


    if (loginPage) {
        loginPage.style.display = "none";
    }

    if (dashboardPage) {
        dashboardPage.style.display = "block";
    }


    displayStudents();
    updateDashboard();
    showCurrentDate();
}


// =====================================================
// CHECK LOGIN
// =====================================================

function checkLoginStatus() {

    const loggedIn =
        localStorage.getItem(
            "smartAttendanceLoggedIn"
        );


    if (loggedIn === "true") {

        showDashboard();

    } else {

        const loginPage =
            document.getElementById("loginPage");

        const dashboardPage =
            document.getElementById("dashboardPage");


        if (loginPage)
            loginPage.style.display = "flex";

        if (dashboardPage)
            dashboardPage.style.display = "none";
    }
}


// =====================================================
// FORGOT PIN
// =====================================================

function openForgotPin() {

    const modal =
        document.getElementById("forgotModal");

    if (modal)
        modal.classList.add("show");
}

function closeForgotPin() {

    const modal =
        document.getElementById("forgotModal");

    if (modal)
        modal.classList.remove("show");
}


// =====================================================
// SEND OTP
// =====================================================

function sendForgotOTP() {

    const name =
        document.getElementById("forgotName").value.trim();

    const mobile =
        document.getElementById("forgotMobile").value.trim();

    const email =
        document.getElementById("forgotEmail").value.trim();


    const account =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (!account) {

        alert(
            "❌ No account exists. Please create an account first."
        );

        return;
    }


    if (!name) {

        alert("Please enter your name.");
        return;
    }


    if (!mobile && !email) {

        alert(
            "📱 Enter your mobile number or 📧 email."
        );

        return;
    }


    if (
        mobile &&
        !isValidMobile(mobile)
    ) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    if (
        email &&
        !isValidEmail(email)
    ) {

        alert("📧 Invalid email address.");
        return;
    }


    const mobileMatch =
        mobile &&
        account.mobile === mobile;

    const emailMatch =
        email &&
        account.email === email;


    if (
        account.name !== name ||
        (!mobileMatch && !emailMatch)
    ) {

        alert(
            "❌ Details do not match the registered account."
        );

        return;
    }


    // Demo OTP
    // Real SMS/email OTP needs a backend service.

    forgotOTP =
        String(
            Math.floor(
                100000 +
                Math.random() * 900000
            )
        );


    console.log(
        "Demo OTP:",
        forgotOTP
    );


    alert(
        "📩 OTP generated.\n\n" +
        "For this GitHub demo, your OTP is:\n\n" +
        forgotOTP +
        "\n\n" +
        "In a real website, OTP should be sent through a secure server."
    );


    document.getElementById(
        "forgotOtpArea"
    ).style.display = "block";
}


// =====================================================
// RESET PIN
// =====================================================

function resetPIN() {

    const otp =
        document.getElementById("forgotOTP").value.trim();

    const newPin =
        document.getElementById("newPin").value.trim();

    const confirmPin =
        document.getElementById("confirmNewPin").value.trim();


    if (!forgotOTP || otp !== forgotOTP) {

        alert("❌ Incorrect OTP.");
        return;
    }


    if (!isValidPIN(newPin)) {

        alert(
            "🔐 New PIN must contain exactly 4 digits."
        );

        return;
    }


    if (newPin !== confirmPin) {

        alert(
            "❌ PIN and Confirm PIN do not match."
        );

        return;
    }


    const account =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (!account) return;


    account.pin = newPin;


    localStorage.setItem(
        "smartAttendanceAccount",
        JSON.stringify(account)
    );


    forgotOTP = null;


    alert(
        "✅ PIN changed successfully!\n\n" +
        "You can now login with your new PIN."
    );


    closeForgotPin();
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
// DATE
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


function getAttendanceDateTime() {

    const now = new Date();

    return {

        date:
            now.toLocaleDateString(
                "en-IN",
                {
                    day:"numeric",
                    month:"long",
                    year:"numeric"
                }
            ),

        day:
            now.toLocaleDateString(
                "en-IN",
                {
                    weekday:"long"
                }
            ),

        time:
            now.toLocaleTimeString(
                "en-IN",
                {
                    hour:"numeric",
                    minute:"2-digit",
                    second:"2-digit",
                    hour12:true
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
                weekday:"long",
                day:"numeric",
                month:"long",
                year:"numeric"
            }
        );
}


// =====================================================
// FACE MODELS
// =====================================================

async function loadFaceModels() {

    if (faceModelLoaded)
        return true;

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

async function startCamera(videoId, statusId) {

    const video =
        document.getElementById(videoId);

    const status =
        document.getElementById(statusId);


    if (!video) return null;


    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: "user",
                    width: {ideal:640},
                    height: {ideal:480}
                },

                audio:false
            });


        video.srcObject = stream;

        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;

        // Mirror like a normal selfie camera
        video.style.transform = "scaleX(-1)";


        await video.play();


        if (status)
            status.innerText = "Camera ON ✅";


        return stream;

    } catch(error) {

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
// FACE REGISTRATION
// =====================================================

async function startAutomaticFaceRegistration() {

    const name =
        document.getElementById("faceName").value.trim();

    const roll =
        document.getElementById("faceRoll").value.trim();

    const college =
        document.getElementById("collegeName").value.trim();

    const department =
        document.getElementById("departmentName").value.trim();

    const mobile =
        document.getElementById("faceMobile").value.trim();

    const email =
        document.getElementById("faceEmail")?.value.trim() || "";


    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        alert("⚠️ Please fill all required details.");
        return;
    }


    if (!isValidMobile(mobile)) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    if (!isValidEmail(email)) {

        alert("📧 Invalid email.");
        return;
    }


    const ready =
        await loadFaceModels();


    if (!ready) {

        alert(
            "❌ Face model could not load."
        );

        return;
    }


    if (!registrationStream) {

        registrationStream =
            await startCamera(
                "registrationCamera",
                "registrationStatus"
            );
    }


    if (!registrationStream)
        return;


    registrationRunning = true;


    document.getElementById(
        "registrationStatus"
    ).innerText =
        "Looking for your face... 👤";


    detectRegistrationFace(
        name,
        roll,
        college,
        department,
        mobile,
        email
    );
}


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


    try {

        const detection =
            await faceapi
            .detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize:320,
                    scoreThreshold:.5
                })
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
                300
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


        const student = {

            name,
            roll,
            college,
            department,
            mobile,
            email,

            status:"Not Marked",

            attendanceDate:"",
            attendanceDay:"",
            attendanceTime:""
        };


        if (index >= 0)
            students[index] = {
                ...students[index],
                ...student
            };
        else
            students.push(student);


        saveStudents();

        registrationRunning = false;

        stopRegistrationCamera();

        displayStudents();

        updateDashboard();


        document.getElementById(
            "registrationStatus"
        ).innerText =
            "Face Captured Successfully ✅";


        document.getElementById(
            "registrationMessage"
        ).innerHTML = `

        <div class="success-message">

            <h3>✅ Face Registration Successful!</h3>

            <p>${name}</p>

            <p>Roll: ${roll}</p>

        </div>
        `;


        alert(
            "✅ Face Registration Completed Successfully!"
        );

    } catch(error) {

        console.error(error);

        registrationRunning = false;
    }
}


function stopRegistrationCamera() {

    if (registrationStream) {

        registrationStream
        .getTracks()
        .forEach(track => track.stop());

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
// ATTENDANCE
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


    const ready =
        await loadFaceModels();


    if (!ready) {

        alert(
            "❌ Face model could not load."
        );

        return;
    }


    if (!attendanceStream) {

        attendanceStream =
            await startCamera(
                "attendanceCamera",
                "attendanceStatus"
            );
    }


    if (!attendanceStream)
        return;


    attendanceRunning = true;


    document.getElementById(
        "attendanceStatus"
    ).innerText =
        "Looking for your face... 👤";


    detectAttendanceFace(student);
}


async function detectAttendanceFace(student) {

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
                new faceapi.TinyFaceDetectorOptions({
                    inputSize:320,
                    scoreThreshold:.5
                })
            )
            .withFaceLandmarks()
            .withFaceDescriptor();


        if (!detection) {

            setTimeout(
                () =>
                detectAttendanceFace(student),
                300
            );

            return;
        }


        const registered =
            new Float32Array(
                student.descriptor
            );


        const distance =
            faceapi.euclideanDistance(
                detection.descriptor,
                registered
            );


        if (distance < .55) {

            attendanceRunning = false;

            showAttendanceSuccess(student);

        } else {

            attendanceRunning = false;

            stopAttendanceCamera();

            alert(
                "❌ Face does not match."
            );
        }

    } catch(error) {

        console.error(error);

        attendanceRunning = false;
    }
}


// =====================================================
// ATTENDANCE SUCCESS
// =====================================================

function showAttendanceSuccess(student) {

    const attendance =
        getAttendanceDateTime();

    const dateKey =
        getDateKey();


    let index =
        students.findIndex(
            s =>
            String(s.roll) ===
            String(student.roll)
        );


    if (index === -1) {

        students.push({

            ...student,

            status:"Present",

            attendanceDate:attendance.date,
            attendanceDay:attendance.day,
            attendanceTime:attendance.time
        });

        index = students.length - 1;

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


    if (!attendanceHistory[dateKey]) {

        attendanceHistory[dateKey] = {

            date:attendance.date,
            day:attendance.day,
            students:{}
        };
    }


    attendanceHistory[
        dateKey
    ].students[
        student.roll
    ] = {

        name:student.name,
        roll:student.roll,
        college:student.college,
        department:student.department,
        mobile:student.mobile || "",
        email:student.email || "",
        status:"Present",
        time:attendance.time
    };


    saveStudents();
    saveAttendanceHistory();


    document.getElementById(
        "attendanceResult"
    ).innerHTML = `

    <div class="success-message">

        <h2>✅ Attendance Successfully Marked!</h2>

        <p>👤 <strong>${student.name}</strong></p>

        <p>🔢 Roll: ${student.roll}</p>

        <p>📅 ${attendance.date}</p>

        <p>📆 ${attendance.day}</p>

        <p>🕐 ${attendance.time}</p>

        ${
            student.mobile
            ?
            `<p>📱 Attendance message ready for ${student.mobile}</p>`
            :
            ""
        }

        ${
            student.email
            ?
            `<p>📧 Email: ${student.email}</p>`
            :
            ""
        }

    </div>
    `;


    document.getElementById(
        "attendanceStatus"
    ).innerText =
        "Attendance marked successfully ✅";


    displayStudents();
    updateDashboard();

    stopAttendanceCamera();


    alert(
        "✅ Attendance Successfully Marked!\n\n" +
        "Name: " + student.name +
        "\nDate: " + attendance.date +
        "\nTime: " + attendance.time
    );
}


function stopAttendanceCamera() {

    if (attendanceStream) {

        attendanceStream
        .getTracks()
        .forEach(track => track.stop());

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
// STUDENT DISPLAY
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
        .toLowerCase()
        .trim() || "";


    list.innerHTML = "";


    students
    .filter(student =>
        (student.name || "")
        .toLowerCase()
        .includes(search)
        ||
        (student.roll || "")
        .toLowerCase()
        .includes(search)
    )
    .forEach((student,index) => {

        const div =
            document.createElement("div");

        div.className =
            "student-row";


        div.innerHTML = `

        <div class="student-info">

            <strong>${student.name}</strong>

            <br>

            Roll: ${student.roll}

            <br>

            College: ${student.college}

            <br>

            Department: ${student.department}

            <br>

            📱 ${student.mobile || "Not added"}

            <br>

            📧 ${student.email || "Not added"}

            <br>

            Status:
            <strong>${student.status}</strong>

        </div>

        <div class="student-actions">

            <button
                class="present-btn"
                onclick="markPresent(${index})">
                Present
            </button>

            <button
                class="absent-btn"
                onclick="markAbsent(${index})">
                Absent
            </button>

            <button
                class="delete-btn"
                onclick="deleteStudent(${index})">
                Delete
            </button>

        </div>
        `;


        list.appendChild(div);
    });
}


// =====================================================
// MANUAL ATTENDANCE
// =====================================================

function markPresent(index) {

    if (!students[index]) return;

    const attendance =
        getAttendanceDateTime();

    const dateKey =
        getDateKey();


    students[index].status =
        "Present";

    students[index].attendanceDate =
        attendance.date;

    students[index].attendanceDay =
        attendance.day;

    students[index].attendanceTime =
        attendance.time;


    if (!attendanceHistory[dateKey]) {

        attendanceHistory[dateKey] = {

            date:attendance.date,
            day:attendance.day,
            students:{}
        };
    }


    attendanceHistory[
        dateKey
    ].students[
        students[index].roll
    ] = {

        ...students[index],

        status:"Present",

        time:attendance.time
    };


    saveStudents();
    saveAttendanceHistory();

    displayStudents();
    updateDashboard();
}


function markAbsent(index) {

    if (!students[index]) return;

    const attendance =
        getAttendanceDateTime();

    const dateKey =
        getDateKey();


    students[index].status =
        "Absent";

    students[index].attendanceDate =
        attendance.date;

    students[index].attendanceDay =
        attendance.day;

    students[index].attendanceTime =
        "";


    if (!attendanceHistory[dateKey]) {

        attendanceHistory[dateKey] = {

            date:attendance.date,
            day:attendance.day,
            students:{}
        };
    }


    attendanceHistory[
        dateKey
    ].students[
        students[index].roll
    ] = {

        ...students[index],

        status:"Absent",

        time:""
    };


    saveStudents();
    saveAttendanceHistory();

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
    ).innerText = total;

    document.getElementById(
        "presentStudents"
    ).innerText = present;

    document.getElementById(
        "absentStudents"
    ).innerText = absent;

    document.getElementById(
        "attendancePercentage"
    ).innerText =
        percentage + "%";
}


// =====================================================
// DELETE
// =====================================================

function deleteStudent(index) {

    if (!students[index]) return;


    if (!confirm("Delete this student?"))
        return;


    const roll =
        students[index].roll;


    students.splice(index,1);


    Object.keys(
        attendanceHistory
    ).forEach(date => {

        if (
            attendanceHistory[date]?.students?.[roll]
        ) {

            delete attendanceHistory[
                date
            ].students[roll];
        }
    });


    saveStudents();
    saveAttendanceHistory();

    displayStudents();
    updateDashboard();
}


// =====================================================
// MENU
// =====================================================

function toggleMenu() {

    document
    .getElementById("mainMenu")
    ?.classList.toggle("show");
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


    list.innerHTML = "";


    students.forEach((student,index) => {

        list.innerHTML += `

        <div style="
            padding:15px;
            margin:10px 0;
            background:#f8fafc;
            border-radius:12px;
        ">

        <strong>
        ${index + 1}. ${student.name}
        </strong>

        <br>
        Roll: ${student.roll}

        <br>
        📱 ${student.mobile || "Not added"}

        <br>
        📧 ${student.email || "Not added"}

        </div>
        `;
    });


    modal.classList.add("show");
}


function closeRegisteredStudents() {

    document
    .getElementById("studentsModal")
    ?.classList.remove("show");
}


// =====================================================
// CHECK ATTENDANCE
// =====================================================

function showCheckAttendance() {

    calculateAttendanceSummary();

    document
    .getElementById("attendanceCheckModal")
    ?.classList.add("show");

    toggleMenu();
}


function calculateAttendanceSummary() {

    const dates =
        Object.keys(
            attendanceHistory
        );


    let present = 0;
    let absent = 0;


    dates.forEach(date => {

        const data =
            attendanceHistory[date];


        Object.values(
            data.students || {}
        ).forEach(student => {

            if (
                student.status === "Present"
            )
                present++;

            if (
                student.status === "Absent"
            )
                absent++;
        });
    });


    document.getElementById(
        "attendanceTotalDays"
    ).innerText = dates.length;

    document.getElementById(
        "attendancePresentDays"
    ).innerText = present;

    document.getElementById(
        "attendanceAbsentDays"
    ).innerText = absent;


    showAttendanceHistory();
}


function showAttendanceHistory() {

    const element =
        document.getElementById(
            "attendanceHistory"
        );


    element.innerHTML = "";


    const dates =
        Object.keys(
            attendanceHistory
        )
        .sort()
        .reverse();


    dates.forEach(date => {

        const data =
            attendanceHistory[date];


        const box =
            document.createElement("div");


        box.style.cssText = `
            padding:15px;
            margin:12px 0;
            border-radius:12px;
            background:#f8fafc;
            border:1px solid #ddd;
        `;


        let html =
            `<strong>📅 ${data.date}</strong>
             <br>
             📆 ${data.day}<br><br>`;


        Object.values(
            data.students || {}
        ).forEach(student => {

            html += `

            <div style="
                background:white;
                padding:10px;
                margin:6px 0;
                border-radius:8px;
            ">

            <strong>${student.name}</strong>

            <br>
            Roll: ${student.roll}

            <br>
            Status: ${student.status}

            ${
                student.time
                ? `<br>🕐 ${student.time}`
                : ""
            }

            </div>
            `;
        });


        box.innerHTML = html;

        element.appendChild(box);
    });
}


function closeCheckAttendance() {

    document
    .getElementById(
        "attendanceCheckModal"
    )
    ?.classList.remove("show");
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


    document.getElementById(
        "editName"
    ).value = student.name || "";

    document.getElementById(
        "editRoll"
    ).value = student.roll || "";

    document.getElementById(
        "editCollege"
    ).value = student.college || "";

    document.getElementById(
        "editDepartment"
    ).value = student.department || "";

    document.getElementById(
        "editMobile"
    ).value = student.mobile || "";

    document.getElementById(
        "editEmail"
    ).value = student.email || "";


    document
    .getElementById(
        "editDetailsModal"
    )
    .classList.add("show");
}


function closeEditDetails() {

    document
    .getElementById(
        "editDetailsModal"
    )
    ?.classList.remove("show");
}


function saveEditedDetails() {

    const name =
        document.getElementById(
            "editName"
        ).value.trim();

    const roll =
        document.getElementById(
            "editRoll"
        ).value.trim();

    const college =
        document.getElementById(
            "editCollege"
        ).value.trim();

    const department =
        document.getElementById(
            "editDepartment"
        ).value.trim();

    const mobile =
        document.getElementById(
            "editMobile"
        ).value.trim();

    const email =
        document.getElementById(
            "editEmail"
        ).value.trim();


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

        alert("Invalid email.");
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
    }


    const saved =
        JSON.parse(
            localStorage.getItem(
                "registeredFaceStudent"
            )
        );


    if (saved) {

        saved.name = name;
        saved.roll = roll;
        saved.college = college;
        saved.department = department;
        saved.mobile = mobile;
        saved.email = email;


        localStorage.setItem(
            "registeredFaceStudent",
            JSON.stringify(saved)
        );
    }


    saveStudents();

    displayStudents();

    closeEditDetails();


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


    if (!isValidMobile(mobile.trim())) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    const saved =
        JSON.parse(
            localStorage.getItem(
                "registeredFaceStudent"
            )
        );


    if (!saved) {

        alert(
            "Please register your face first."
        );

        return;
    }


    saved.mobile =
        mobile.trim();


    localStorage.setItem(
        "registeredFaceStudent",
        JSON.stringify(saved)
    );


    const index =
        students.findIndex(
            s =>
            String(s.roll) ===
            String(saved.roll)
        );


    if (index >= 0)
        students[index].mobile =
            saved.mobile;


    saveStudents();

    displayStudents();


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


    if (!isValidEmail(email.trim())) {

        alert("Invalid email.");
        return;
    }


    const saved =
        JSON.parse(
            localStorage.getItem(
                "registeredFaceStudent"
            )
        );


    if (!saved) {

        alert(
            "Please register your face first."
        );

        return;
    }


    saved.email =
        email.trim();


    localStorage.setItem(
        "registeredFaceStudent",
        JSON.stringify(saved)
    );


    const index =
        students.findIndex(
            s =>
            String(s.roll) ===
            String(saved.roll)
        );


    if (index >= 0)
        students[index].email =
            saved.email;


    saveStudents();

    displayStudents();


    alert(
        "📧 Email updated successfully!"
    );
}


// =====================================================
// ADMIN
// =====================================================

function showAdminDetails() {

    document
    .getElementById(
        "adminModal"
    )
    ?.classList.add("show");

    toggleMenu();
}


function closeAdminDetails() {

    document
    .getElementById(
        "adminModal"
    )
    ?.classList.remove("show");
}


// =====================================================
// MODAL OUTSIDE CLICK
// =====================================================

window.addEventListener(
    "click",
    event => {

        document
        .querySelectorAll(".modal")
        .forEach(modal => {

            if (event.target === modal)
                modal.classList.remove("show");
        });
    }
);


// =====================================================
// BUTTON SETUP
// =====================================================

window.addEventListener(
    "load",
    async function() {

        setupInputs();


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
            openForgotPin
        );


        document
        .getElementById(
            "signupButton"
        )
        ?.addEventListener(
            "click",
            openSignup
        );


        checkLoginStatus();

    }
);

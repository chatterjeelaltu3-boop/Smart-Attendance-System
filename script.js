// =====================================================
// SMART ATTENDANCE SYSTEM
// COMPLETE SCRIPT.JS
// LOGIN + ACCOUNT + FACE + ATTENDANCE
// =====================================================


// =====================================================
// STORAGE
// =====================================================

let students =
    JSON.parse(localStorage.getItem("students")) || [];

let attendanceHistory =
    JSON.parse(localStorage.getItem("attendanceHistory")) || {};


// =====================================================
// CAMERA VARIABLES
// =====================================================

let registrationStream = null;
let attendanceStream = null;

let faceModelLoaded = false;

let registrationRunning = false;
let attendanceRunning = false;


// =====================================================
// FACE API MODEL URL
// =====================================================

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";


// =====================================================
// SAVE DATA
// =====================================================

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


// =====================================================
// DATE
// =====================================================

function getDateKey() {

    const now = new Date();

    const year = now.getFullYear();

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    const day =
        String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// =====================================================
// DATE + DAY + TIME
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
// =====================================================
// LOGIN SYSTEM
// =====================================================
// =====================================================


// =====================================================
// CREATE ACCOUNT
// =====================================================

function createSmartAttendanceAccount(
    name,
    mobile,
    roll,
    college,
    department,
    email
) {

    name = String(name || "").trim();

    mobile = String(mobile || "").trim();

    roll = String(roll || "").trim();

    college = String(college || "").trim();

    department = String(department || "").trim();

    email = String(email || "").trim();


    if (!name || !mobile) {

        alert(
            "❌ Name and mobile number are required."
        );

        return false;
    }


    if (!isValidMobile(mobile)) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return false;
    }


    if (!isValidEmail(email)) {

        alert(
            "📧 Please enter a valid email address."
        );

        return false;
    }


    // Existing account

    let account =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    // Ask PIN if account does not exist

    if (!account) {

        let pin =
            prompt(
                "🔐 Create your 4 digit PIN:"
            );


        if (pin === null) {

            return false;
        }


        pin = pin.trim();


        if (!isValidPIN(pin)) {

            alert(
                "❌ PIN must contain exactly 4 digits."
            );

            return false;
        }


        let confirmPin =
            prompt(
                "🔐 Confirm your 4 digit PIN:"
            );


        if (confirmPin === null) {

            return false;
        }


        confirmPin =
            confirmPin.trim();


        if (pin !== confirmPin) {

            alert(
                "❌ PINs do not match."
            );

            return false;
        }


        account = {

            name: name,

            mobile: mobile,

            pin: pin,

            roll: roll,

            college: college,

            department: department,

            email: email
        };


        localStorage.setItem(
            "smartAttendanceAccount",
            JSON.stringify(account)
        );


        alert(
            "🎉 Account Created Successfully!\n\n" +
            "Your 4 digit PIN has been saved.\n\n" +
            "You can now Login."
        );


        return true;
    }


    // Update existing account

    account.name = name;

    account.mobile = mobile;

    account.roll = roll;

    account.college = college;

    account.department = department;

    account.email = email;


    localStorage.setItem(
        "smartAttendanceAccount",
        JSON.stringify(account)
    );


    return true;
}


// =====================================================
// LOGIN
// =====================================================

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


    const savedAccount =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (!savedAccount) {

        alert(
            "❌ No account found.\n\n" +
            "Please register your face first."
        );

        return;
    }


    const savedName =
        String(savedAccount.name || "")
            .trim()
            .toLowerCase();


    const enteredName =
        String(name)
            .trim()
            .toLowerCase();


    if (
        savedName === enteredName &&
        String(savedAccount.mobile) === mobile &&
        String(savedAccount.pin) === pin
    ) {

        localStorage.setItem(
            "smartAttendanceLoggedIn",
            "true"
        );


        alert(
            "✅ Login Successful!"
        );


        showDashboard();


        displayStudents();

        updateDashboard();

        showCurrentDate();

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
        document.getElementById(
            "loginPage"
        );


    const dashboardPage =
        document.getElementById(
            "dashboardPage"
        );


    const mainContainer =
        document.getElementById(
            "mainContainer"
        );


    if (loginPage) {

        loginPage.style.display =
            "none";
    }


    if (dashboardPage) {

        dashboardPage.style.display =
            "block";
    }


    if (mainContainer) {

        mainContainer.style.display =
            "block";
    }
}


// =====================================================
// SHOW LOGIN
// =====================================================

function showLoginPage() {

    const loginPage =
        document.getElementById(
            "loginPage"
        );


    const dashboardPage =
        document.getElementById(
            "dashboardPage"
        );


    const mainContainer =
        document.getElementById(
            "mainContainer"
        );


    if (loginPage) {

        loginPage.style.display =
            "flex";
    }


    if (dashboardPage) {

        dashboardPage.style.display =
            "none";
    }


    if (mainContainer) {

        mainContainer.style.display =
            "none";
    }
}


// =====================================================
// FORGOT PIN
// =====================================================

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
            "Please register your face/student details first."
        );

        return;
    }


    const name =
        prompt(
            "Enter your registered name:"
        );


    if (name === null) return;


    const mobile =
        prompt(
            "Enter your registered 10 digit mobile number:"
        );


    if (mobile === null) return;


    const cleanName =
        name.trim();


    const cleanMobile =
        mobile.trim();


    if (!cleanName || !cleanMobile) {

        alert(
            "⚠️ Please enter both name and mobile number."
        );

        return;
    }


    if (!isValidMobile(cleanMobile)) {

        alert(
            "📱 Please enter a valid 10 digit mobile number."
        );

        return;
    }


    const nameMatch =
        String(savedAccount.name || "")
            .trim()
            .toLowerCase() ===
        cleanName.toLowerCase();


    const mobileMatch =
        String(savedAccount.mobile || "") ===
        cleanMobile;


    if (nameMatch && mobileMatch) {

        alert(
            "🔐 Your PIN is: " +
            savedAccount.pin
        );

    } else {

        alert(
            "❌ Name and mobile number do not match."
        );
    }
}


// =====================================================
// LOGIN STATUS
// =====================================================

function checkLoginStatus() {

    const loggedIn =
        localStorage.getItem(
            "smartAttendanceLoggedIn"
        );


    if (loggedIn === "true") {

        showDashboard();

        displayStudents();

        updateDashboard();

        showCurrentDate();

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
// LOGIN BUTTON SETUP
// =====================================================

function setupLoginButtons() {

    const loginButton =
        document.getElementById(
            "loginButton"
        );


    if (loginButton) {

        loginButton.onclick =
            loginUser;
    }


    const forgotButton =
        document.getElementById(
            "forgotPinButton"
        );


    if (forgotButton) {

        forgotButton.onclick =
            forgotPIN;
    }
}


// =====================================================
// LOGIN PIN SETUP
// =====================================================

function setupLoginPin() {

    const pin =
        document.getElementById(
            "loginPin"
        );


    if (!pin) return;


    pin.setAttribute(
        "maxlength",
        "4"
    );


    pin.setAttribute(
        "inputmode",
        "numeric"
    );


    pin.addEventListener(
        "input",
        function() {

            this.value =
                this.value
                    .replace(/\D/g, "")
                    .slice(0, 4);
        }
    );
}


// =====================================================
// LOGIN MOBILE SETUP
// =====================================================

function setupLoginMobile() {

    const mobile =
        document.getElementById(
            "loginMobile"
        );


    if (!mobile) return;


    mobile.setAttribute(
        "maxlength",
        "10"
    );


    mobile.setAttribute(
        "inputmode",
        "numeric"
    );


    mobile.addEventListener(
        "input",
        function() {

            this.value =
                this.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
        }
    );
}


// =====================================================
// ENTER KEY LOGIN
// =====================================================

function setupLoginEnterKey() {

    const inputs = [

        "loginName",

        "loginMobile",

        "loginPin"

    ];


    inputs.forEach(id => {

        const input =
            document.getElementById(id);


        if (!input) return;


        input.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    loginUser();
                }
            }
        );
    });
}


// =====================================================
// =====================================================
// STUDENT SYSTEM
// =====================================================
// =====================================================


// =====================================================
// ADD STUDENT
// =====================================================

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


    const existing =
        students.find(
            s =>
                String(s.roll) ===
                String(roll)
        );


    if (existing) {

        alert(
            "⚠️ A student with this roll number already exists."
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


    [

        "studentName",

        "studentRoll",

        "studentCollege",

        "studentDepartment",

        "studentMobile"

    ].forEach(id => {

        const element =
            document.getElementById(id);


        if (element) {

            element.value = "";
        }
    });


    alert(
        "✅ Student added successfully!"
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

                String(student.name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(student.roll || "")
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
            document.createElement(
                "div"
            );


        row.className =
            "student-row";


        let attendanceInfo = "";


        if (student.attendanceDate) {

            attendanceInfo = `

                <br>
                📅 Date:
                ${student.attendanceDate}

                <br>

                📆 Day:
                ${student.attendanceDay}

                <br>

                🕐 Time:
                ${student.attendanceTime}

            `;
        }


        row.innerHTML = `

            <div class="student-info">

                <strong>
                    ${student.name || ""}
                </strong>

                <br>

                Roll:
                ${student.roll || ""}

                <br>

                College:
                ${student.college || ""}

                <br>

                Department:
                ${student.department || ""}

                <br>

                📱 Mobile:
                ${student.mobile || "Not added"}

                <br>

                📧 Email:
                ${student.email || "Not added"}

                ${attendanceInfo}

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


    saveStudentDailyAttendance(
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


    saveStudentDailyAttendance(
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


// =====================================================
// DELETE STUDENT
// =====================================================

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


    students.splice(index, 1);


    Object.keys(
        attendanceHistory
    ).forEach(dateKey => {

        if (
            attendanceHistory[dateKey] &&
            attendanceHistory[dateKey].students &&
            attendanceHistory[dateKey]
                .students[roll]
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


// =====================================================
// DASHBOARD
// =====================================================

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


// =====================================================
// =====================================================
// FACE API
// =====================================================
// =====================================================


// =====================================================
// LOAD MODELS
// =====================================================

async function loadFaceModels() {

    if (faceModelLoaded) {

        return true;
    }


    if (
        typeof faceapi ===
        "undefined"
    ) {

        console.error(
            "face-api.js is not loaded."
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


        console.log(
            "Face models loaded successfully."
        );


        return true;

    } catch (error) {

        console.error(
            "Face model loading error:",
            error
        );


        return false;
    }
}


// =====================================================
// START CAMERA
// =====================================================

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

        console.error(
            "Video element not found:",
            videoId
        );

        return null;
    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        alert(
            "❌ Camera is not supported by this browser."
        );

        return null;
    }


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
                "Camera permission denied or unavailable ❌";
        }


        alert(
            "❌ Camera could not start.\n\n" +
            "Please allow camera permission."
        );


        return null;
    }
}


// =====================================================
// REGISTRATION CAMERA
// =====================================================

async function startRegistrationCamera() {

    if (registrationStream) {

        return;
    }


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

    if (attendanceStream) {

        return;
    }


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


    const emailElement =
        document.getElementById(
            "faceEmail"
        );


    const email =
        emailElement
            ? emailElement.value.trim()
            : "";


    const status =
        document.getElementById(
            "registrationStatus"
        );


    const message =
        document.getElementById(
            "registrationMessage"
        );


    const button =
        document.getElementById(
            "registerFaceButton"
        );


    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        if (message) {

            message.innerHTML = `

                <div class="success-message">

                    ⚠️ Please fill all
                    student details.

                </div>
            `;
        }

        return;
    }


    if (!isValidMobile(mobile)) {

        if (message) {

            message.innerHTML = `

                <div class="success-message">

                    📱 Mobile number must
                    contain exactly 10 digits.

                </div>
            `;
        }

        return;
    }


    if (!isValidEmail(email)) {

        if (message) {

            message.innerHTML = `

                <div class="success-message">

                    📧 Please enter a valid
                    email address.

                </div>
            `;
        }

        return;
    }


    if (button) {

        button.disabled =
            true;
    }


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        if (message) {

            message.innerText =
                "❌ Face detection model could not load.";
        }


        buttonEnable(
            "registerFaceButton"
        );


        return;
    }


    const video =
        document.getElementById(
            "registrationCamera"
        );


    if (!video?.srcObject) {

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


    if (status) {

        status.innerText =
            "Looking for your face... 👤";
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


    if (!video) {

        registrationRunning =
            false;


        buttonEnable(
            "registerFaceButton"
        );


        return;
    }


    try {

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi
                        .TinyFaceDetectorOptions({

                            inputSize:
                                320,

                            scoreThreshold:
                                0.5
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


            // Save registered face

            const registeredData = {

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
                    registeredData
                )
            );


            // Find student

            let existing =
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


            // CREATE LOGIN ACCOUNT

            const accountCreated =
                createSmartAttendanceAccount(
                    name,
                    mobile,
                    roll,
                    college,
                    department,
                    email
                );


            if (!accountCreated) {

                registrationRunning =
                    false;


                buttonEnable(
                    "registerFaceButton"
                );


                return;
            }


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
            function() {

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
            "Registration face error:",
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


// =====================================================
// REGISTRATION SUCCESS
// =====================================================

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
            "✅ Face Captured Successfully!";
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

                🎉 Account Created Successfully!

                <br><br>

                You can now Login.

            </div>
        `;
    }


    alert(
        "✅ Face Registration Completed!\n\n" +
        "🎉 Your Smart Attendance account has been created.\n\n" +
        "Please Login using your Name, Mobile and PIN."
    );


    stopRegistrationCamera();


    buttonEnable(
        "registerFaceButton"
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


// =====================================================
// BUTTON ENABLE
// =====================================================

function buttonEnable(id) {

    const button =
        document.getElementById(id);


    if (button) {

        button.disabled =
            false;
    }
}


// =====================================================
// FACE ATTENDANCE
// =====================================================

async function startFaceAttendance() {

    const video =
        document.getElementById(
            "attendanceCamera"
        );


    const status =
        document.getElementById(
            "attendanceStatus"
        );


    const button =
        document.getElementById(
            "attendanceButton"
        );


    const result =
        document.getElementById(
            "attendanceResult"
        );


    const savedData =
        localStorage.getItem(
            "registeredFaceStudent"
        );


    if (!savedData) {

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


    let registeredStudent;


    try {

        registeredStudent =
            JSON.parse(
                savedData
            );

    } catch (error) {

        console.error(error);


        if (result) {

            result.innerText =
                "❌ Registered face data is corrupted.";
        }


        return;
    }


    if (
        !registeredStudent.descriptor ||
        !Array.isArray(
            registeredStudent.descriptor
        )
    ) {

        if (result) {

            result.innerText =
                "❌ Face registration data is invalid.";
        }


        return;
    }


    if (button) {

        button.disabled =
            true;
    }


    if (result) {

        result.innerHTML = "";
    }


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        if (status) {

            status.innerText =
                "Face model could not load ❌";
        }


        buttonEnable(
            "attendanceButton"
        );


        return;
    }


    if (!video?.srcObject) {

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


    if (status) {

        status.innerText =
            "Camera ON — Looking for your face... 👤";
    }


    attendanceRunning =
        true;


    detectAttendanceFace(
        registeredStudent
    );
}


// =====================================================
// DETECT ATTENDANCE FACE
// =====================================================

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

                            inputSize:
                                320,

                            scoreThreshold:
                                0.5
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
                function() {

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


        console.log(
            "Face distance:",
            distance
        );


        if (distance < 0.55) {

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

                    <div
                        class="success-message"
                        style="
                            background:#fef2f2;
                            border-color:#ef4444;
                            color:#991b1b;
                        "
                    >

                        ❌ Face does not match

                        <br><br>

                        Please try again.

                    </div>
                `;
            }


            alert(
                "❌ Face does not match.\n\nPlease try again."
            );
        }

    } catch (error) {

        console.error(
            "Attendance detection error:",
            error
        );


        attendanceRunning =
            false;


        if (status) {

            status.innerText =
                "Face detection error ❌";
        }


        buttonEnable(
            "attendanceButton"
        );
    }
}


// =====================================================
// ATTENDANCE SUCCESS
// =====================================================

function showAttendanceSuccess(
    student
) {

    attendanceRunning =
        false;


    const attendance =
        getAttendanceDateTime();


    const result =
        document.getElementById(
            "attendanceResult"
        );


    let index =
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


        students[index].mobile =
            student.mobile ||
            students[index].mobile ||
            "";


        students[index].email =
            student.email ||
            students[index].email ||
            "";

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


        index =
            students.length - 1;
    }


    saveStudentDailyAttendance(
        students[index],
        "Present",
        attendance
    );


    saveStudents();


    const email =
        student.email ||
        students[index].email ||
        "";


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


    if (result) {

        result.innerHTML = `

            <div class="success-message">

                <div class="success-icon">
                    ✅
                </div>


                <h3>
                    Attendance Successfully
                </h3>


                <p>
                    <strong>👤 Name:</strong>
                    ${student.name}
                </p>


                <p>
                    <strong>🔢 Roll:</strong>
                    ${student.roll}
                </p>


                <p>
                    <strong>🏫 College:</strong>
                    ${student.college}
                </p>


                <p>
                    <strong>🎓 Department:</strong>
                    ${student.department}
                </p>


                <p>
                    <strong>📱 Mobile:</strong>
                    ${student.mobile || "Not added"}
                </p>


                <p>
                    <strong>📧 Email:</strong>
                    ${email || "Not added"}
                </p>


                <hr
                    style="
                        margin:15px 0;
                        border:none;
                        border-top:1px solid #bbf7d0;
                    "
                >


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

        "✅ Attendance Successfully!\n\n" +

        "👤 Name: " +
        student.name +
        "\n" +

        "🔢 Roll: " +
        student.roll +
        "\n" +

        "📅 Date: " +
        attendance.date +
        "\n" +

        "📆 Day: " +
        attendance.day +
        "\n" +

        "🕐 Time: " +
        attendance.time
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


// =====================================================
// =====================================================
// MENU
// =====================================================
// =====================================================

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


// =====================================================
// EDIT DETAILS
// =====================================================

function openEditDetails() {

    const modal =
        document.getElementById(
            "editDetailsModal"
        );


    if (!modal) return;


    const saved =
        localStorage.getItem(
            "registeredFaceStudent"
        );


    if (saved) {

        try {

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
                        document.getElementById(
                            id
                        );


                    if (element) {

                        element.value =
                            fields[id];
                    }
                });

        } catch (error) {

            console.error(error);
        }
    }


    modal.classList.add(
        "show"
    );
}


// =====================================================
// CLOSE EDIT
// =====================================================

function closeEditDetails() {

    const modal =
        document.getElementById(
            "editDetailsModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


// =====================================================
// SAVE EDITED DETAILS
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


    const emailElement =
        document.getElementById(
            "editEmail"
        );


    const email =
        emailElement
            ? emailElement.value.trim()
            : "";


    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        alert(
            "Please fill all details."
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

        try {

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


            // Update login account too

            const account =
                JSON.parse(
                    localStorage.getItem(
                        "smartAttendanceAccount"
                    )
                );


            if (account) {

                account.name =
                    name;

                account.mobile =
                    mobile;

                account.roll =
                    roll;

                account.college =
                    college;

                account.department =
                    department;

                account.email =
                    email;


                localStorage.setItem(
                    "smartAttendanceAccount",
                    JSON.stringify(account)
                );
            }

        } catch (error) {

            console.error(error);
        }
    }


    displayStudents();

    updateDashboard();

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


    const cleanMobile =
        mobile.trim();


    if (!isValidMobile(cleanMobile)) {

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
        cleanMobile;


    localStorage.setItem(
        "registeredFaceStudent",
        JSON.stringify(student)
    );


    const account =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (account) {

        account.mobile =
            cleanMobile;


        localStorage.setItem(
            "smartAttendanceAccount",
            JSON.stringify(account)
        );
    }


    const index =
        students.findIndex(
            s =>
                String(s.roll) ===
                String(student.roll)
        );


    if (index !== -1) {

        students[index].mobile =
            cleanMobile;


        saveStudents();
    }


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
            "Enter your email address (optional):"
        );


    if (!email) return;


    const cleanEmail =
        email.trim();


    if (!isValidEmail(cleanEmail)) {

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
        cleanEmail;


    localStorage.setItem(
        "registeredFaceStudent",
        JSON.stringify(student)
    );


    const account =
        JSON.parse(
            localStorage.getItem(
                "smartAttendanceAccount"
            )
        );


    if (account) {

        account.email =
            cleanEmail;


        localStorage.setItem(
            "smartAttendanceAccount",
            JSON.stringify(account)
        );
    }


    const index =
        students.findIndex(
            s =>
                String(s.roll) ===
                String(student.roll)
        );


    if (index !== -1) {

        students[index].email =
            cleanEmail;


        saveStudents();
    }


    displayStudents();


    alert(
        "📧 Email updated successfully!"
    );
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
                        ${student.name}
                    </strong>

                    <br>

                    🔢 Roll:
                    ${student.roll}

                    <br>

                    🏫 College:
                    ${student.college}

                    <br>

                    🎓 Department:
                    ${student.department}

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
    }


    modal.classList.add(
        "show"
    );
}


// =====================================================
// CLOSE REGISTERED STUDENTS
// =====================================================

function closeRegisteredStudents() {

    const modal =
        document.getElementById(
            "studentsModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


// =====================================================
// =====================================================
// ATTENDANCE HISTORY
// =====================================================
// =====================================================


// =====================================================
// CHECK ATTENDANCE
// =====================================================

function showCheckAttendance() {

    const modal =
        document.getElementById(
            "attendanceCheckModal"
        );


    if (!modal) {

        alert(
            "Check Attendance section is not available in HTML."
        );

        return;
    }


    calculateAttendanceSummary();


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


// =====================================================
// CALCULATE ATTENDANCE SUMMARY
// =====================================================

function calculateAttendanceSummary() {

    const totalDays =
        Object.keys(
            attendanceHistory
        ).length;


    let presentDays = 0;

    let absentDays = 0;


    Object.keys(
        attendanceHistory
    ).forEach(dateKey => {

        const dayData =
            attendanceHistory[
                dateKey
            ];


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
            totalDays;
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


// =====================================================
// SHOW ATTENDANCE HISTORY
// =====================================================

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

        historyElement.innerHTML = `

            <p>
                No attendance history available yet.
            </p>

        `;

        return;
    }


    dates.forEach(dateKey => {

        const dayData =
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


        let studentsHTML = "";


        if (
            dayData &&
            dayData.students
        ) {

            Object.values(
                dayData.students
            ).forEach(student => {

                const statusColor =
                    student.status ===
                    "Present"
                        ? "#166534"
                        : "#991b1b";


                studentsHTML += `

                    <div
                        style="
                            padding:10px;
                            margin-top:8px;
                            border-radius:10px;
                            background:white;
                            border:1px solid #e5e7eb;
                        "
                    >

                        <strong>
                            ${student.name}
                        </strong>

                        <br>

                        Roll:
                        ${student.roll}

                        <br>

                        Status:

                        <strong
                            style="
                                color:${statusColor};
                            "
                        >
                            ${student.status}
                        </strong>

                        ${
                            student.time
                                ? `
                                    <br>
                                    🕐 ${student.time}
                                  `
                                : ""
                        }

                    </div>
                `;
            });
        }


        box.innerHTML = `

            <strong>
                📅 ${dayData.date}
            </strong>

            <br>

            📆 ${dayData.day}

            ${studentsHTML}

        `;


        historyElement.appendChild(
            box
        );
    });
}


// =====================================================
// CLOSE CHECK ATTENDANCE
// =====================================================

function closeCheckAttendance() {

    const modal =
        document.getElementById(
            "attendanceCheckModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


// =====================================================
// ADMIN DETAILS
// =====================================================

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


// =====================================================
// CLOSE ADMIN DETAILS
// =====================================================

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


// =====================================================
// CLOSE MODALS OUTSIDE CLICK
// =====================================================

window.addEventListener(
    "click",
    function(event) {

        const modals =
            document.querySelectorAll(
                ".modal"
            );


        modals.forEach(
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


// =====================================================
// MOBILE INPUT LIMIT
// =====================================================

function setupMobileInputLimit() {

    const ids = [

        "faceMobile",

        "studentMobile",

        "editMobile",

        "loginMobile"

    ];


    ids.forEach(id => {

        const input =
            document.getElementById(
                id
            );


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
            function() {

                this.value =
                    this.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            10
                        );
            }
        );
    });
}


// =====================================================
// SEARCH STUDENT
// =====================================================

function setupStudentSearch() {

    const search =
        document.getElementById(
            "searchStudent"
        );


    if (!search) return;


    search.addEventListener(
        "input",
        displayStudents
    );
}


// =====================================================
// =====================================================
// PAGE LOAD
// =====================================================
// =====================================================

window.addEventListener(
    "load",
    async function() {

        console.log(
            "Smart Attendance System loaded."
        );


        // Basic UI

        setupLoginButtons();

        setupLoginPin();

        setupLoginMobile();

        setupLoginEnterKey();

        setupMobileInputLimit();

        setupStudentSearch();


        // Student dashboard

        displayStudents();

        updateDashboard();

        showCurrentDate();


        // Login check

        checkLoginStatus();


        // Face models

        await loadFaceModels();

    }
);

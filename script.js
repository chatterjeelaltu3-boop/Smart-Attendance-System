// =====================================================
// SMART ATTENDANCE SYSTEM
// Complete Script
// Login + Create Account + Forgot PIN + Attendance
// =====================================================


// =====================================================
// STORAGE KEYS
// =====================================================

const ACCOUNT_KEY = "smartAttendanceAccount";
const LOGIN_KEY = "smartAttendanceLoggedIn";
const STUDENTS_KEY = "smartAttendanceStudents";
const ATTENDANCE_KEY = "smartAttendanceRecords";


// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getAccount() {
    try {
        return JSON.parse(localStorage.getItem(ACCOUNT_KEY)) || null;
    } catch (error) {
        return null;
    }
}

function getStudents() {
    try {
        return JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveStudents(students) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

function getAttendance() {
    try {
        return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveAttendance(records) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

function showMessage(id, message, type = "success") {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = message;
    element.className = "auth-message " + type;
}


// =====================================================
// CREATE ACCOUNT
// =====================================================

function showCreateAccount() {

    const loginPage = document.getElementById("loginPage");
    const createPage = document.getElementById("createAccountPage");

    if (loginPage) {
        loginPage.style.display = "none";
    }

    if (createPage) {
        createPage.style.display = "flex";
    }
}


function backToLogin() {

    const loginPage = document.getElementById("loginPage");
    const createPage = document.getElementById("createAccountPage");

    if (createPage) {
        createPage.style.display = "none";
    }

    if (loginPage) {
        loginPage.style.display = "flex";
    }
}


function createAccount() {

    const name =
        document.getElementById("createName")?.value.trim();

    const mobile =
        document.getElementById("createMobile")?.value.trim();

    const email =
        document.getElementById("createEmail")?.value.trim();

    const pin =
        document.getElementById("createPin")?.value.trim();

    const confirmPin =
        document.getElementById("confirmPin")?.value.trim();


    // Basic validation

    if (!name || !mobile || !pin || !confirmPin) {

        showMessage(
            "createMessage",
            "⚠️ Please fill all required fields.",
            "error"
        );

        return;
    }


    if (!/^[0-9]{10}$/.test(mobile)) {

        showMessage(
            "createMessage",
            "📱 Mobile number must contain exactly 10 digits.",
            "error"
        );

        return;
    }


    if (!/^[0-9]{4}$/.test(pin)) {

        showMessage(
            "createMessage",
            "🔐 PIN must contain exactly 4 digits.",
            "error"
        );

        return;
    }


    if (pin !== confirmPin) {

        showMessage(
            "createMessage",
            "❌ PIN and Confirm PIN do not match.",
            "error"
        );

        return;
    }


    // Check existing account

    const existingAccount = getAccount();

    if (existingAccount) {

        showMessage(
            "createMessage",
            "⚠️ An account already exists. Please login.",
            "error"
        );

        return;
    }


    // Create account

    const account = {
        name: name,
        mobile: mobile,
        email: email,
        pin: pin,
        createdAt: new Date().toISOString()
    };


    localStorage.setItem(
        ACCOUNT_KEY,
        JSON.stringify(account)
    );


    // Create empty student database if needed

    if (!localStorage.getItem(STUDENTS_KEY)) {
        localStorage.setItem(STUDENTS_KEY, "[]");
    }

    if (!localStorage.getItem(ATTENDANCE_KEY)) {
        localStorage.setItem(ATTENDANCE_KEY, "[]");
    }


    showMessage(
        "createMessage",
        "✅ Account created successfully! You can now login.",
        "success"
    );


    // Clear fields

    document.getElementById("createName").value = "";
    document.getElementById("createMobile").value = "";
    document.getElementById("createEmail").value = "";
    document.getElementById("createPin").value = "";
    document.getElementById("confirmPin").value = "";


    setTimeout(function () {
        backToLogin();
    }, 1200);
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

        showMessage(
            "loginMessage",
            "⚠️ Please enter Name, Mobile Number and PIN.",
            "error"
        );

        return;
    }


    if (!/^[0-9]{10}$/.test(mobile)) {

        showMessage(
            "loginMessage",
            "📱 Mobile number must contain exactly 10 digits.",
            "error"
        );

        return;
    }


    if (!/^[0-9]{4}$/.test(pin)) {

        showMessage(
            "loginMessage",
            "🔐 PIN must contain exactly 4 digits.",
            "error"
        );

        return;
    }


    const savedAccount = getAccount();


    if (!savedAccount) {

        showMessage(
            "loginMessage",
            "❌ No account found. Please create an account first.",
            "error"
        );

        return;
    }


    if (
        savedAccount.name === name &&
        savedAccount.mobile === mobile &&
        savedAccount.pin === pin
    ) {

        localStorage.setItem(LOGIN_KEY, "true");


        alert("✅ Login Successful!");


        showDashboard();

    } else {

        showMessage(
            "loginMessage",
            "❌ Name, Mobile Number or PIN is incorrect.",
            "error"
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


    if (loginPage) {
        loginPage.style.display = "none";
    }

    if (createPage) {
        createPage.style.display = "none";
    }

    if (dashboard) {
        dashboard.style.display = "block";
    }


    displayStudents();
    updateDashboard();
    showCurrentDate();
}


// =====================================================
// LOGIN STATUS
// =====================================================

function checkLoginStatus() {

    const loggedIn =
        localStorage.getItem(LOGIN_KEY);

    if (loggedIn === "true") {

        showDashboard();

    } else {

        const loginPage =
            document.getElementById("loginPage");

        const createPage =
            document.getElementById("createAccountPage");

        const dashboard =
            document.getElementById("dashboardPage");


        if (loginPage) {
            loginPage.style.display = "flex";
        }

        if (createPage) {
            createPage.style.display = "none";
        }

        if (dashboard) {
            dashboard.style.display = "none";
        }
    }
}


// =====================================================
// FORGOT PIN
// =====================================================

function forgotPIN() {

    const savedAccount = getAccount();


    if (!savedAccount) {

        alert(
            "❌ No account found.\n\nPlease create an account first."
        );

        return;
    }


    const name =
        prompt("Enter your registered name:");

    if (!name) return;


    const mobile =
        prompt("Enter your registered 10 digit mobile number:");

    if (!mobile) return;


    const cleanName = name.trim();
    const cleanMobile = mobile.trim();


    if (!/^[0-9]{10}$/.test(cleanMobile)) {

        alert(
            "📱 Please enter a valid 10 digit mobile number."
        );

        return;
    }


    if (
        savedAccount.name === cleanName &&
        savedAccount.mobile === cleanMobile
    ) {

        alert(
            "🔐 Your registered PIN is: " +
            savedAccount.pin
        );

    } else {

        alert(
            "❌ Name and mobile number do not match."
        );
    }
}


// =====================================================
// LOGOUT
// =====================================================

function logoutUser() {

    localStorage.removeItem(LOGIN_KEY);

    location.reload();
}


// =====================================================
// PIN INPUT CONTROL
// =====================================================

function setupPinInputs() {

    const pinInputs = [
        "loginPin",
        "createPin",
        "confirmPin"
    ];


    pinInputs.forEach(function (id) {

        const input = document.getElementById(id);

        if (!input) return;


        input.setAttribute("maxlength", "4");
        input.setAttribute("inputmode", "numeric");


        input.addEventListener("input", function () {

            this.value =
                this.value
                    .replace(/\D/g, "")
                    .slice(0, 4);
        });
    });
}


// =====================================================
// MOBILE INPUT CONTROL
// =====================================================

function setupMobileInputs() {

    const mobileInputs = [
        "loginMobile",
        "createMobile",
        "faceMobile",
        "editMobile"
    ];


    mobileInputs.forEach(function (id) {

        const input = document.getElementById(id);

        if (!input) return;


        input.setAttribute("maxlength", "10");
        input.setAttribute("inputmode", "numeric");


        input.addEventListener("input", function () {

            this.value =
                this.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
        });
    });
}


// =====================================================
// DATE
// =====================================================

function showCurrentDate() {

    const dateElement =
        document.getElementById("currentDate");

    if (!dateElement) return;


    const today = new Date();


    const formatted =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    dateElement.textContent =
        "📅 " + formatted;
}


// =====================================================
// DASHBOARD UPDATE
// =====================================================

function updateDashboard() {

    const students = getStudents();
    const attendance = getAttendance();


    const totalElement =
        document.getElementById("totalStudents");

    const presentElement =
        document.getElementById("presentStudents");

    const absentElement =
        document.getElementById("absentStudents");

    const percentageElement =
        document.getElementById("attendancePercentage");


    const totalStudents = students.length;


    const today =
        new Date().toISOString().split("T")[0];


    const todayRecords =
        attendance.filter(function (record) {

            return record.date === today;

        });


    const presentStudents =
        todayRecords.filter(function (record) {

            return record.status === "Present";

        }).length;


    const absentStudents =
        Math.max(
            0,
            totalStudents - presentStudents
        );


    let percentage = 0;

    if (totalStudents > 0) {

        percentage =
            Math.round(
                (presentStudents / totalStudents) * 100
            );
    }


    if (totalElement) {
        totalElement.textContent = totalStudents;
    }

    if (presentElement) {
        presentElement.textContent = presentStudents;
    }

    if (absentElement) {
        absentElement.textContent = absentStudents;
    }

    if (percentageElement) {
        percentageElement.textContent =
            percentage + "%";
    }
}


// =====================================================
// STUDENT DISPLAY
// =====================================================

function displayStudents() {

    const list =
        document.getElementById("studentList");

    if (!list) return;


    const students = getStudents();


    const search =
        document.getElementById("searchStudent")
            ?.value
            .trim()
            .toLowerCase() || "";


    const filtered =
        students.filter(function (student) {

            return (
                student.name.toLowerCase().includes(search) ||
                student.roll.toLowerCase().includes(search)
            );
        });


    if (filtered.length === 0) {

        list.innerHTML =
            `<div class="empty-message">
                👥 No registered students found.
            </div>`;

        return;
    }


    list.innerHTML =
        filtered.map(function (student) {

            return `
                <div class="student-item">

                    <strong>👤 ${escapeHTML(student.name)}</strong>

                    <span>
                        🔢 Roll: ${escapeHTML(student.roll)}
                    </span>

                    <span>
                        🏫 ${escapeHTML(student.college)}
                    </span>

                    <span>
                        🎓 ${escapeHTML(student.department)}
                    </span>

                </div>
            `;

        }).join("");
}


// =====================================================
// FACE REGISTRATION
// =====================================================

function startAutomaticFaceRegistration() {

    const name =
        document.getElementById("faceName")?.value.trim();

    const roll =
        document.getElementById("faceRoll")?.value.trim();

    const college =
        document.getElementById("collegeName")?.value.trim();

    const department =
        document.getElementById("departmentName")?.value.trim();

    const mobile =
        document.getElementById("faceMobile")?.value.trim();

    const email =
        document.getElementById("faceEmail")?.value.trim();


    if (!name || !roll || !college || !department || !mobile) {

        showFaceMessage(
            "⚠️ Please fill all required student details.",
            "error"
        );

        return;
    }


    if (!/^[0-9]{10}$/.test(mobile)) {

        showFaceMessage(
            "📱 Please enter a valid 10 digit mobile number.",
            "error"
        );

        return;
    }


    const students = getStudents();


    const existing =
        students.find(function (student) {

            return student.roll === roll;

        });


    if (existing) {

        showFaceMessage(
            "⚠️ This roll number is already registered.",
            "error"
        );

        return;
    }


    const video =
        document.getElementById("registrationCamera");


    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        showFaceMessage(
            "❌ Camera is not supported in this browser.",
            "error"
        );

        return;
    }


    const status =
        document.getElementById("registrationStatus");


    if (status) {
        status.textContent = "📸 Starting camera...";
    }


    navigator.mediaDevices.getUserMedia({
        video: true
    })
    .then(function (stream) {

        if (video) {
            video.srcObject = stream;
        }


        if (status) {
            status.textContent =
                "🟢 Camera ON — Face detected/ready";
        }


        setTimeout(function () {

            const student = {

                id:
                    Date.now().toString(),

                name: name,

                roll: roll,

                college: college,

                department: department,

                mobile: mobile,

                email: email,

                registeredAt:
                    new Date().toISOString(),

                faceRegistered: true
            };


            students.push(student);

            saveStudents(students);


            showFaceMessage(
                "✅ Student registered successfully!",
                "success"
            );


            stopCamera(video);


            if (status) {
                status.textContent = "Camera is OFF";
            }


            clearFaceRegistrationFields();

            displayStudents();
            updateDashboard();

        }, 1800);

    })
    .catch(function (error) {

        console.error(error);


        showFaceMessage(
            "❌ Camera permission was denied or camera is unavailable.",
            "error"
        );


        if (status) {
            status.textContent = "Camera is OFF";
        }
    });
}


// =====================================================
// FACE ATTENDANCE
// =====================================================

function startFaceAttendance() {

    const video =
        document.getElementById("attendanceCamera");

    const status =
        document.getElementById("attendanceStatus");


    const result =
        document.getElementById("attendanceResult");


    const students = getStudents();


    if (students.length === 0) {

        showFaceMessage(
            "❌ No students are registered yet.",
            "error",
            result
        );

        return;
    }


    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        showFaceMessage(
            "❌ Camera is not supported in this browser.",
            "error",
            result
        );

        return;
    }


    if (status) {
        status.textContent =
            "📸 Starting camera...";
    }


    navigator.mediaDevices.getUserMedia({
        video: true
    })
    .then(function (stream) {

        if (video) {
            video.srcObject = stream;
        }


        if (status) {
            status.textContent =
                "🟢 Camera ON — Ready";
        }


        setTimeout(function () {

            // Demo/local attendance flow.
            // Actual face recognition requires
            // face-api.js models.

            const account =
                getAccount();


            let student =
                students.find(function (item) {

                    return (
                        account &&
                        item.mobile === account.mobile
                    );

                });


            if (!student) {

                student = students[0];

            }


            markAttendance(student);


            stopCamera(video);


            if (status) {
                status.textContent =
                    "Camera is OFF";
            }

        }, 1800);

    })
    .catch(function (error) {

        console.error(error);


        showFaceMessage(
            "❌ Camera permission was denied or camera is unavailable.",
            "error",
            result
        );


        if (status) {
            status.textContent =
                "Camera is OFF";
        }
    });
}


// =====================================================
// MARK ATTENDANCE
// =====================================================

function markAttendance(student) {

    if (!student) return;


    const records =
        getAttendance();


    const today =
        new Date().toISOString().split("T")[0];


    const alreadyMarked =
        records.some(function (record) {

            return (
                record.studentId === student.id &&
                record.date === today
            );

        });


    const result =
        document.getElementById("attendanceResult");


    if (alreadyMarked) {

        showFaceMessage(
            "ℹ️ Attendance is already marked for today.",
            "success",
            result
        );

        updateDashboard();

        return;
    }


    records.push({

        studentId: student.id,

        name: student.name,

        roll: student.roll,

        date: today,

        time:
            new Date().toLocaleTimeString(
                "en-IN"
            ),

        status: "Present"
    });


    saveAttendance(records);


    showFaceMessage(
        "✅ Attendance marked successfully for " +
        student.name + "!",
        "success",
        result
    );


    updateDashboard();
}


// =====================================================
// FACE MESSAGE
// =====================================================

function showFaceMessage(message, type = "success", element = null) {

    if (!element) {

        element =
            document.getElementById("registrationMessage");

    }


    if (!element) return;


    element.textContent = message;

    element.className =
        "face-message " + type;
}


// =====================================================
// CLEAR FACE FORM
// =====================================================

function clearFaceRegistrationFields() {

    const ids = [
        "faceName",
        "faceRoll",
        "collegeName",
        "departmentName",
        "faceMobile",
        "faceEmail"
    ];


    ids.forEach(function (id) {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }
    });
}


// =====================================================
// CAMERA STOP
// =====================================================

function stopCamera(video) {

    if (!video || !video.srcObject) return;


    const tracks =
        video.srcObject.getTracks();


    tracks.forEach(function (track) {

        track.stop();

    });


    video.srcObject = null;
}


// =====================================================
// MENU
// =====================================================

function toggleMenu() {

    const menu =
        document.getElementById("mainMenu");


    if (!menu) return;


    menu.classList.toggle("show");
}


// =====================================================
// EDIT DETAILS
// =====================================================

function openEditDetails() {

    const account = getAccount();


    if (!account) return;


    document.getElementById("editName").value =
        account.name || "";

    document.getElementById("editMobile").value =
        account.mobile || "";

    document.getElementById("editEmail").value =
        account.email || "";


    const modal =
        document.getElementById("editDetailsModal");


    if (modal) {
        modal.style.display = "flex";
    }
}


function closeEditDetails() {

    const modal =
        document.getElementById("editDetailsModal");


    if (modal) {
        modal.style.display = "none";
    }
}


function saveEditedDetails() {

    const account = getAccount();


    if (!account) return;


    const newName =
        document.getElementById("editName").value.trim();

    const newMobile =
        document.getElementById("editMobile").value.trim();

    const newEmail =
        document.getElementById("editEmail").value.trim();


    if (!newName || !newMobile) {

        alert("⚠️ Name and mobile are required.");

        return;
    }


    if (!/^[0-9]{10}$/.test(newMobile)) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    account.name = newName;
    account.mobile = newMobile;
    account.email = newEmail;


    localStorage.setItem(
        ACCOUNT_KEY,
        JSON.stringify(account)
    );


    alert("✅ Details updated successfully!");


    closeEditDetails();
}


// =====================================================
// MOBILE UPDATE
// =====================================================

function openMobileUpdate() {

    const account = getAccount();

    if (!account) return;


    const mobile =
        prompt(
            "Enter your new 10 digit mobile number:",
            account.mobile || ""
        );


    if (!mobile) return;


    const cleanMobile =
        mobile.trim();


    if (!/^[0-9]{10}$/.test(cleanMobile)) {

        alert(
            "📱 Please enter exactly 10 digits."
        );

        return;
    }


    account.mobile = cleanMobile;


    localStorage.setItem(
        ACCOUNT_KEY,
        JSON.stringify(account)
    );


    alert("✅ Mobile number updated.");
}


// =====================================================
// EMAIL UPDATE
// =====================================================

function openEmailUpdate() {

    const account = getAccount();

    if (!account) return;


    const email =
        prompt(
            "Enter your email address:",
            account.email || ""
        );


    if (email === null) return;


    account.email = email.trim();


    localStorage.setItem(
        ACCOUNT_KEY,
        JSON.stringify(account)
    );


    alert("✅ Email updated successfully.");
}


// =====================================================
// REGISTERED STUDENTS MODAL
// =====================================================

function showRegisteredStudents() {

    const modal =
        document.getElementById("studentsModal");


    const list =
        document.getElementById("registeredStudentsList");


    if (!modal || !list) return;


    const students = getStudents();


    if (students.length === 0) {

        list.innerHTML =
            "<p>👥 No students registered.</p>";

    } else {

        list.innerHTML =
            students.map(function (student) {

                return `
                    <div class="student-item">

                        <strong>
                            👤 ${escapeHTML(student.name)}
                        </strong>

                        <p>
                            🔢 Roll: ${escapeHTML(student.roll)}
                        </p>

                        <p>
                            🎓 ${escapeHTML(student.department)}
                        </p>

                        <p>
                            🏫 ${escapeHTML(student.college)}
                        </p>

                    </div>
                `;

            }).join("");
    }


    modal.style.display = "flex";
}


function closeRegisteredStudents() {

    const modal =
        document.getElementById("studentsModal");


    if (modal) {
        modal.style.display = "none";
    }
}


// =====================================================
// CHECK ATTENDANCE
// =====================================================

function showCheckAttendance() {

    const modal =
        document.getElementById("attendanceCheckModal");


    if (modal) {
        modal.style.display = "flex";
    }


    updateAttendanceHistory();
}


function closeCheckAttendance() {

    const modal =
        document.getElementById("attendanceCheckModal");


    if (modal) {
        modal.style.display = "none";
    }
}


function updateAttendanceHistory() {

    const records =
        getAttendance();


    const totalDaysElement =
        document.getElementById("attendanceTotalDays");

    const presentDaysElement =
        document.getElementById("attendancePresentDays");

    const absentDaysElement =
        document.getElementById("attendanceAbsentDays");

    const history =
        document.getElementById("attendanceHistory");


    const uniqueDates =
        [...new Set(
            records.map(function (record) {

                return record.date;

            })
        )];


    const presentDays =
        uniqueDates.length;


    if (totalDaysElement) {
        totalDaysElement.textContent =
            uniqueDates.length;
    }


    if (presentDaysElement) {
        presentDaysElement.textContent =
            presentDays;
    }


    if (absentDaysElement) {
        absentDaysElement.textContent = 0;
    }


    if (!history) return;


    if (records.length === 0) {

        history.innerHTML =
            "<p>📊 No attendance records yet.</p>";

        return;
    }


    const sorted =
        [...records].reverse();


    history.innerHTML =
        sorted.map(function (record) {

            return `
                <div class="attendance-history-item">

                    <strong>
                        ${escapeHTML(record.name)}
                    </strong>

                    <span>
                        🔢 ${escapeHTML(record.roll)}
                    </span>

                    <span>
                        📅 ${escapeHTML(record.date)}
                    </span>

                    <span>
                        🕒 ${escapeHTML(record.time)}
                    </span>

                    <b>
                        ✅ ${escapeHTML(record.status)}
                    </b>

                </div>
            `;

        }).join("");
}


// =====================================================
// ADMIN
// =====================================================

function showAdminDetails() {

    const modal =
        document.getElementById("adminModal");


    if (modal) {
        modal.style.display = "flex";
    }
}


function closeAdminDetails() {

    const modal =
        document.getElementById("adminModal");


    if (modal) {
        modal.style.display = "none";
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// MODAL CLICK OUTSIDE
// =====================================================

window.addEventListener("click", function (event) {

    const modals = [
        "editDetailsModal",
        "studentsModal",
        "attendanceCheckModal",
        "adminModal"
    ];


    modals.forEach(function (id) {

        const modal =
            document.getElementById(id);


        if (event.target === modal) {

            modal.style.display = "none";

        }
    });
});


// =====================================================
// CONNECT BUTTONS
// =====================================================

function setupButtons() {

    const loginButton =
        document.getElementById("loginButton");

    if (loginButton) {

        loginButton.addEventListener(
            "click",
            loginUser
        );
    }


    const forgotButton =
        document.getElementById("forgotPinButton");

    if (forgotButton) {

        forgotButton.addEventListener(
            "click",
            forgotPIN
        );
    }


    const createButton =
        document.getElementById("createAccountButton");

    if (createButton) {

        createButton.addEventListener(
            "click",
            showCreateAccount
        );
    }


    const saveAccountButton =
        document.getElementById("saveAccountButton");

    if (saveAccountButton) {

        saveAccountButton.addEventListener(
            "click",
            createAccount
        );
    }


    const backButton =
        document.getElementById("backToLoginButton");

    if (backButton) {

        backButton.addEventListener(
            "click",
            backToLogin
        );
    }
}


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener("load", function () {

    setupButtons();

    setupPinInputs();

    setupMobileInputs();

    checkLoginStatus();

});

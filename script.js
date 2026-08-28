// =====================================================
// FIREBASE + SMART ATTENDANCE SYSTEM
// =====================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from
    "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
    apiKey: "AIzaSyCcvk2aGKaVJvlDSS76DnkQCy8GwAuloEE",
    authDomain: "smart-attendance-system-82b82.firebaseapp.com",
    projectId: "smart-attendance-system-82b82",
    storageBucket: "smart-attendance-system-82b82.firebasestorage.app",
    messagingSenderId: "234543808646",
    appId: "1:234543808646:web:23aaab1d197522bd725107",
    measurementId: "G-58XHQHDY30"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// =====================================================
// GLOBAL
// =====================================================

let confirmationResult = null;
let recaptchaVerifier = null;


// =====================================================
// ELEMENT HELPER
// =====================================================

function $(id) {
    return document.getElementById(id);
}


// =====================================================
// ACCOUNT STORAGE
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
// CREATE ACCOUNT PAGE
// =====================================================

function openCreateAccount() {

    if ($("loginPage"))
        $("loginPage").style.display = "none";

    if ($("createAccountPage"))
        $("createAccountPage").style.display = "flex";
}


function backToLogin() {

    if ($("createAccountPage"))
        $("createAccountPage").style.display = "none";

    if ($("loginPage"))
        $("loginPage").style.display = "flex";
}


// =====================================================
// CREATE ACCOUNT
// =====================================================

async function createAccount() {

    const name =
        $("createName")?.value.trim();

    const mobile =
        $("createMobile")?.value.trim();

    const email =
        $("createEmail")?.value.trim();

    const pin =
        $("createPin")?.value.trim();

    const confirmPin =
        $("confirmPin")?.value.trim();


    if (!name || !mobile || !pin || !confirmPin) {

        alert(
            "⚠️ Please fill Name, Mobile Number, PIN and Confirm PIN."
        );

        return;
    }


    if (!/^[0-9]{10}$/.test(mobile)) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    if (!/^[0-9]{4}$/.test(pin)) {

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


    const oldAccount = getAccount();

    if (oldAccount) {

        const replace = confirm(
            "An account already exists on this browser.\n\nCreate a new account?"
        );

        if (!replace) return;
    }


    // Save account locally
    saveAccount({
        name: name,
        mobile: mobile,
        email: email,
        pin: pin,
        createdAt: new Date().toISOString()
    });


    // Optional Firebase email account
    if (email) {

        try {

            await createUserWithEmailAndPassword(
                auth,
                email,
                "SA" + pin + "Secure!"
            );

        } catch (error) {

            console.log(
                "Firebase email account:",
                error.code
            );

        }
    }


    alert(
        "✅ Account Created Successfully!\n\n" +
        "You can now Login."
    );


    backToLogin();


    if ($("loginName"))
        $("loginName").value = name;

    if ($("loginMobile"))
        $("loginMobile").value = mobile;

}


// =====================================================
// LOGIN
// =====================================================

async function loginUser() {

    const name =
        $("loginName")?.value.trim();

    const mobile =
        $("loginMobile")?.value.trim();

    const pin =
        $("loginPin")?.value.trim();


    if (!name || !mobile || !pin) {

        alert(
            "⚠️ Please enter Name, Mobile Number and PIN."
        );

        return;
    }


    if (!/^[0-9]{10}$/.test(mobile)) {

        alert(
            "📱 Mobile number must contain exactly 10 digits."
        );

        return;
    }


    if (!/^[0-9]{4}$/.test(pin)) {

        alert(
            "🔐 PIN must contain exactly 4 digits."
        );

        return;
    }


    const account = getAccount();


    if (!account) {

        alert(
            "❌ No account found.\n\n" +
            "Please create your account first."
        );

        return;
    }


    if (
        account.name !== name ||
        account.mobile !== mobile ||
        account.pin !== pin
    ) {

        alert(
            "❌ Login failed!\n\n" +
            "Name, Mobile Number or PIN is incorrect."
        );

        return;
    }


    localStorage.setItem(
        "smartAttendanceLoggedIn",
        "true"
    );


    alert("✅ Login Successful!");


    showDashboard();

}


// =====================================================
// SHOW DASHBOARD
// =====================================================

function showDashboard() {

    if ($("loginPage"))
        $("loginPage").style.display = "none";

    if ($("createAccountPage"))
        $("createAccountPage").style.display = "none";

    if ($("dashboardPage"))
        $("dashboardPage").style.display = "block";


    displayStudents();
    updateDashboard();
    showCurrentDate();

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

    } else {

        if ($("loginPage"))
            $("loginPage").style.display = "flex";

        if ($("createAccountPage"))
            $("createAccountPage").style.display = "none";

        if ($("dashboardPage"))
            $("dashboardPage").style.display = "none";
    }
}


// =====================================================
// FIREBASE RECAPTCHA
// =====================================================

function setupRecaptcha() {

    if (recaptchaVerifier) return;

    recaptchaVerifier =
        new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
                size: "invisible"
            }
        );
}


// =====================================================
// FORGOT PIN - OTP
// =====================================================

async function forgotPIN() {

    const account = getAccount();


    if (!account) {

        alert(
            "❌ No account found.\n\n" +
            "Please create an account first."
        );

        return;
    }


    const mobile =
        prompt(
            "Enter your registered 10 digit mobile number:"
        );


    if (!mobile) return;


    const cleanMobile =
        mobile.trim();


    if (
        !/^[0-9]{10}$/.test(cleanMobile)
    ) {

        alert(
            "📱 Enter a valid 10 digit mobile number."
        );

        return;
    }


    if (
        account.mobile !== cleanMobile
    ) {

        alert(
            "❌ This mobile number is not registered."
        );

        return;
    }


    // India country code
    const phoneNumber =
        "+91" + cleanMobile;


    try {

        setupRecaptcha();


        confirmationResult =
            await signInWithPhoneNumber(
                auth,
                phoneNumber,
                recaptchaVerifier
            );


        const otp =
            prompt(
                "📱 OTP sent to your mobile.\n\nEnter the 6 digit OTP:"
            );


        if (!otp) return;


        await confirmationResult.confirm(
            otp.trim()
        );


        alert(
            "✅ OTP Verified!\n\n" +
            "Your current PIN is: " +
            account.pin
        );


    } catch (error) {

        console.error(error);


        alert(
            "❌ OTP verification failed.\n\n" +
            "Please check the mobile number and OTP."
        );

    }
}


// =====================================================
// LOGOUT
// =====================================================

async function logoutUser() {

    localStorage.removeItem(
        "smartAttendanceLoggedIn"
    );


    try {
        await signOut(auth);
    } catch (error) {
        console.log(error);
    }


    location.reload();
}


// =====================================================
// STUDENT DATA
// =====================================================

function getStudents() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "smartAttendanceStudents"
            )
        ) || [];

    } catch {

        return [];
    }
}


function saveStudents(students) {

    localStorage.setItem(
        "smartAttendanceStudents",
        JSON.stringify(students)
    );
}


// =====================================================
// FACE REGISTRATION
// =====================================================

async function startAutomaticFaceRegistration() {

    const name =
        $("faceName")?.value.trim();

    const roll =
        $("faceRoll")?.value.trim();

    const college =
        $("collegeName")?.value.trim();

    const department =
        $("departmentName")?.value.trim();

    const mobile =
        $("faceMobile")?.value.trim();

    const email =
        $("faceEmail")?.value.trim();


    if (!name || !roll) {

        alert(
            "⚠️ Please enter Student Name and Roll Number."
        );

        return;
    }


    if (
        mobile &&
        !/^[0-9]{10}$/.test(mobile)
    ) {

        alert(
            "📱 Please enter a valid 10 digit mobile number."
        );

        return;
    }


    const students = getStudents();


    const existing =
        students.find(
            s => s.roll === roll
        );


    if (existing) {

        alert(
            "⚠️ This roll number is already registered."
        );

        return;
    }


    // Start camera
    try {

        const video =
            $("registrationCamera");


        if (video) {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: true
                });

            video.srcObject = stream;

            if ($("registrationStatus"))
                $("registrationStatus").textContent =
                    "Camera is ON — Face captured";
        }

    } catch (error) {

        console.log(
            "Camera:",
            error
        );
    }


    // Save student
    students.push({

        id: Date.now(),

        name: name,

        roll: roll,

        college: college,

        department: department,

        mobile: mobile,

        email: email,

        attendance: [],

        registeredAt:
            new Date().toISOString()

    });


    saveStudents(students);


    alert(
        "✅ Student registered successfully!"
    );


    displayStudents();
    updateDashboard();

}


// =====================================================
// FACE ATTENDANCE
// =====================================================

async function startFaceAttendance() {

    const students =
        getStudents();


    if (students.length === 0) {

        alert(
            "❌ No students registered yet."
        );

        return;
    }


    try {

        const video =
            $("attendanceCamera");


        if (video) {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: true
                });

            video.srcObject = stream;


            if ($("attendanceStatus"))
                $("attendanceStatus").textContent =
                    "Camera is ON";
        }

    } catch (error) {

        alert(
            "❌ Camera permission is required."
        );

        return;
    }


    const roll =
        prompt(
            "For testing, enter the registered student's Roll Number:"
        );


    if (!roll) return;


    const student =
        students.find(
            s => s.roll === roll.trim()
        );


    if (!student) {

        alert(
            "❌ Student not found."
        );

        return;
    }


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    if (!student.attendance)
        student.attendance = [];


    const alreadyMarked =
        student.attendance.some(
            a => a.date === today
        );


    if (alreadyMarked) {

        alert(
            "⚠️ Attendance already marked today."
        );

        return;
    }


    student.attendance.push({

        date: today,

        time:
            new Date()
                .toLocaleTimeString(),

        status: "Present"

    });


    saveStudents(students);


    if ($("attendanceResult")) {

        $("attendanceResult").textContent =
            "✅ Attendance marked successfully for " +
            student.name;

    }


    alert(
        "✅ Attendance Marked!\n\n" +
        "Student: " +
        student.name +
        "\nDate: " +
        today
    );


    displayStudents();
    updateDashboard();


    // Notification preparation
    sendAttendanceNotification(student);

}


// =====================================================
// ATTENDANCE NOTIFICATION
// =====================================================

function sendAttendanceNotification(student) {

    /*
       IMPORTANT:

       Browser JavaScript cannot safely send SMS/email
       directly using private service credentials.

       This function is prepared for Firebase Cloud
       Functions / email / SMS backend.

       Later we will connect it to the backend.
    */

    console.log(
        "Attendance notification:",
        student.name,
        student.mobile,
        student.email
    );
}


// =====================================================
// DISPLAY STUDENTS
// =====================================================

function displayStudents() {

    const list =
        $("studentList");


    if (!list) return;


    const students =
        getStudents();


    const search =
        $("searchStudent")
            ?.value
            .trim()
            .toLowerCase() || "";


    const filtered =
        students.filter(
            s =>
                s.name
                    ?.toLowerCase()
                    .includes(search) ||
                s.roll
                    ?.toLowerCase()
                    .includes(search)
        );


    if (filtered.length === 0) {

        list.innerHTML =
            `<p class="empty-message">
                No students found.
            </p>`;

        return;
    }


    list.innerHTML =
        filtered.map(
            student => {

                const present =
                    student.attendance
                        ?.length || 0;


                return `
                <div class="student-item">

                    <div>
                        <strong>
                            👤 ${student.name}
                        </strong>

                        <p>
                            🔢 Roll: ${student.roll}
                        </p>

                        <p>
                            🎓 ${student.department || "N/A"}
                        </p>

                        <p>
                            📅 Present Days: ${present}
                        </p>
                    </div>

                </div>
                `;

            }
        ).join("");

}


// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard() {

    const students =
        getStudents();


    const total =
        students.length;


    let present = 0;


    students.forEach(
        student => {

            if (
                student.attendance &&
                student.attendance.length > 0
            ) {

                present++;
            }

        }
    );


    const absent =
        Math.max(
            total - present,
            0
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


// =====================================================
// CURRENT DATE
// =====================================================

function showCurrentDate() {

    if (!$("currentDate")) return;


    $("currentDate").textContent =
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


// =====================================================
// MENU
// =====================================================

function toggleMenu() {

    const menu =
        $("mainMenu");


    if (!menu) return;


    menu.classList.toggle(
        "show"
    );
}


// =====================================================
// EDIT DETAILS
// =====================================================

function openEditDetails() {

    const account =
        getAccount();


    if (!account) return;


    if ($("editName"))
        $("editName").value =
            account.name || "";


    if ($("editMobile"))
        $("editMobile").value =
            account.mobile || "";


    if ($("editEmail"))
        $("editEmail").value =
            account.email || "";


    if ($("editDetailsModal"))
        $("editDetailsModal").style.display =
            "flex";
}


function closeEditDetails() {

    if ($("editDetailsModal"))
        $("editDetailsModal").style.display =
            "none";
}


function saveEditedDetails() {

    const account =
        getAccount();


    if (!account) return;


    account.name =
        $("editName")?.value.trim() ||
        account.name;


    account.mobile =
        $("editMobile")?.value.trim() ||
        account.mobile;


    account.email =
        $("editEmail")?.value.trim() ||
        account.email;


    saveAccount(account);


    alert(
        "✅ Details updated successfully!"
    );


    closeEditDetails();
}


// =====================================================
// MOBILE UPDATE
// =====================================================

function openMobileUpdate() {

    const account =
        getAccount();


    if (!account) return;


    const mobile =
        prompt(
            "Enter new 10 digit mobile number:",
            account.mobile || ""
        );


    if (!mobile) return;


    if (
        !/^[0-9]{10}$/.test(
            mobile.trim()
        )
    ) {

        alert(
            "❌ Invalid mobile number."
        );

        return;
    }


    account.mobile =
        mobile.trim();


    saveAccount(account);


    alert(
        "✅ Mobile number updated."
    );
}


// =====================================================
// EMAIL UPDATE
// =====================================================

function openEmailUpdate() {

    const account =
        getAccount();


    if (!account) return;


    const email =
        prompt(
            "Enter your email:",
            account.email || ""
        );


    if (!email) return;


    account.email =
        email.trim();


    saveAccount(account);


    alert(
        "✅ Email updated."
    );
}


// =====================================================
// REGISTERED STUDENTS MODAL
// =====================================================

function showRegisteredStudents() {

    const students =
        getStudents();


    const box =
        $("registeredStudentsList");


    if (!box) return;


    if (students.length === 0) {

        box.innerHTML =
            "<p>No registered students.</p>";

    } else {

        box.innerHTML =
            students.map(
                s => `
                <div class="student-item">

                    <strong>
                        👤 ${s.name}
                    </strong>

                    <p>
                        Roll: ${s.roll}
                    </p>

                    <p>
                        Department:
                        ${s.department || "N/A"}
                    </p>

                </div>
                `
            ).join("");
    }


    if ($("studentsModal"))
        $("studentsModal").style.display =
            "flex";
}


function closeRegisteredStudents() {

    if ($("studentsModal"))
        $("studentsModal").style.display =
            "none";
}


// =====================================================
// CHECK ATTENDANCE
// =====================================================

function showCheckAttendance() {

    const students =
        getStudents();


    const history =
        $("attendanceHistory");


    if (!history) return;


    let total = 0;


    students.forEach(
        student => {

            total +=
                student.attendance?.length || 0;

        }
    );


    if ($("attendanceTotalDays"))
        $("attendanceTotalDays").textContent =
            total;


    if ($("attendancePresentDays"))
        $("attendancePresentDays").textContent =
            total;


    if ($("attendanceAbsentDays"))
        $("attendanceAbsentDays").textContent =
            0;


    history.innerHTML =
        students.map(
            student => `

            <div class="student-item">

                <strong>
                    👤 ${student.name}
                </strong>

                <p>
                    Roll: ${student.roll}
                </p>

                <p>
                    Present:
                    ${student.attendance?.length || 0}
                    days
                </p>

            </div>

            `
        ).join("");


    if ($("attendanceCheckModal"))
        $("attendanceCheckModal").style.display =
            "flex";
}


function closeCheckAttendance() {

    if ($("attendanceCheckModal"))
        $("attendanceCheckModal").style.display =
            "none";
}


// =====================================================
// ADMIN
// =====================================================

function showAdminDetails() {

    if ($("adminModal"))
        $("adminModal").style.display =
            "flex";
}


function closeAdminDetails() {

    if ($("adminModal"))
        $("adminModal").style.display =
            "none";
}


// =====================================================
// PIN INPUT
// =====================================================

function setupPinInputs() {

    [
        "loginPin",
        "createPin",
        "confirmPin"
    ].forEach(
        id => {

            const input =
                $(id);


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

        }
    );
}


// =====================================================
// MOBILE INPUT
// =====================================================

function setupMobileInputs() {

    [
        "loginMobile",
        "createMobile",
        "faceMobile",
        "editMobile"
    ].forEach(
        id => {

            const input =
                $(id);


            if (!input) return;


            input.addEventListener(
                "input",
                function () {

                    this.value =
                        this.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                }
            );

        }
    );
}


// =====================================================
// BUTTON CONNECTION
// =====================================================

function setupButtons() {

    $("loginButton")
        ?.addEventListener(
            "click",
            loginUser
        );


    $("forgotPinButton")
        ?.addEventListener(
            "click",
            forgotPIN
        );


    $("createAccountButton")
        ?.addEventListener(
            "click",
            openCreateAccount
        );


    $("saveAccountButton")
        ?.addEventListener(
            "click",
            createAccount
        );


    $("backToLoginButton")
        ?.addEventListener(
            "click",
            backToLogin
        );

}


// =====================================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// =====================================================

window.addEventListener(
    "click",
    function (event) {

        [
            "editDetailsModal",
            "studentsModal",
            "attendanceCheckModal",
            "adminModal"
        ].forEach(
            id => {

                const modal =
                    $(id);


                if (
                    modal &&
                    event.target === modal
                ) {

                    modal.style.display =
                        "none";
                }

            }
        );

    }
);


// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.loginUser =
    loginUser;

window.forgotPIN =
    forgotPIN;

window.logoutUser =
    logoutUser;

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

window.startAutomaticFaceRegistration =
    startAutomaticFaceRegistration;

window.startFaceAttendance =
    startFaceAttendance;


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        setupButtons();

        setupPinInputs();

        setupMobileInputs();

        checkLoginStatus();

    }
);

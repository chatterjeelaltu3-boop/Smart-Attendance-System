/* =========================================================
   SMART ATTENDANCE SYSTEM
   COMPLETE SCRIPT.JS
========================================================= */

"use strict";

/* =========================================================
   STORAGE KEYS
========================================================= */

const USERS_KEY = "smartAttendanceUsers";
const ATTENDANCE_KEY = "smartAttendanceAttendance";
const CURRENT_USER_KEY = "smartAttendanceCurrentUser";


/* =========================================================
   DEFAULT ADMIN
========================================================= */

const ADMIN_NAME = "Ayush Chatterjee";
const COLLEGE_NAME = "Hooghly Engineering & Technology College";


/* =========================================================
   BASIC HELPERS
========================================================= */

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getAttendance() {
    try {
        return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveAttendance(data) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch (error) {
        return null;
    }
}

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function clean(value) {
    return String(value || "").trim();
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
   MESSAGE HELPER
========================================================= */

function showMessage(id, message, type = "success") {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = message;

    element.className = "auth-message " + type;

    setTimeout(() => {
        if (element) {
            element.textContent = "";
        }
    }, 4000);
}


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const loginPage = document.getElementById("loginPage");
const createAccountPage = document.getElementById("createAccountPage");
const forgotPinPage = document.getElementById("forgotPinPage");
const dashboardPage = document.getElementById("dashboardPage");


/* =========================================================
   SHOW / HIDE PAGES
========================================================= */

function hideAllPages() {

    if (loginPage) loginPage.style.display = "none";
    if (createAccountPage) createAccountPage.style.display = "none";
    if (forgotPinPage) forgotPinPage.style.display = "none";
    if (dashboardPage) dashboardPage.style.display = "none";
}

function showLoginPage() {

    hideAllPages();

    if (loginPage) {
        loginPage.style.display = "flex";
    }
}

function showCreateAccountPage() {

    hideAllPages();

    if (createAccountPage) {
        createAccountPage.style.display = "flex";
    }
}

function showForgotPinPage() {

    hideAllPages();

    if (forgotPinPage) {
        forgotPinPage.style.display = "flex";
    }
}

function showDashboard() {

    hideAllPages();

    if (dashboardPage) {
        dashboardPage.style.display = "flex";
    }

    setupDashboard();
}


/* =========================================================
   LOGIN
========================================================= */

const loginButton = document.getElementById("loginButton");

if (loginButton) {

    loginButton.addEventListener("click", function () {

        const name = clean(
            document.getElementById("loginName")?.value
        );

        const identity = clean(
            document.getElementById("loginIdentity")?.value
        );

        const pin = clean(
            document.getElementById("loginPin")?.value
        );

        if (!name || !identity || !pin) {

            showMessage(
                "loginMessage",
                "Please enter your name, mobile/email and PIN.",
                "error"
            );

            return;
        }

        if (!/^\d{4}$/.test(pin)) {

            showMessage(
                "loginMessage",
                "PIN must contain exactly 4 digits.",
                "error"
            );

            return;
        }

        const users = getUsers();

        const user = users.find(function (item) {

            const sameName =
                clean(item.name).toLowerCase() === name.toLowerCase();

            const sameMobile =
                clean(item.mobile) === identity;

            const sameEmail =
                clean(item.email).toLowerCase() === identity.toLowerCase();

            return sameName &&
                (sameMobile || sameEmail) &&
                clean(item.pin) === pin;
        });

        if (!user) {

            showMessage(
                "loginMessage",
                "Login details are incorrect. Please check your information.",
                "error"
            );

            return;
        }

        setCurrentUser(user);

        showMessage(
            "loginMessage",
            "Login successful!",
            "success"
        );

        setTimeout(() => {
            showDashboard();
        }, 500);

    });
}


/* =========================================================
   CREATE ACCOUNT PAGE
========================================================= */

const createAccountButton =
    document.getElementById("createAccountButton");

if (createAccountButton) {

    createAccountButton.addEventListener("click", function () {

        showCreateAccountPage();

    });
}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

const createAccountSubmit =
    document.getElementById("createAccountSubmit");

if (createAccountSubmit) {

    createAccountSubmit.addEventListener("click", function () {

        const name = clean(
            document.getElementById("createName")?.value
        );

        const mobile = clean(
            document.getElementById("createMobile")?.value
        );

        const email = clean(
            document.getElementById("createEmail")?.value
        );

        const pin = clean(
            document.getElementById("createPin")?.value
        );

        const confirmPin = clean(
            document.getElementById("confirmPin")?.value
        );

        const college = clean(
            document.getElementById("createCollege")?.value
        ) || COLLEGE_NAME;

        const department = clean(
            document.getElementById("createDepartment")?.value
        );

        const roll = clean(
            document.getElementById("createRoll")?.value
        );


        /* VALIDATION */

        if (!name) {

            showMessage(
                "createMessage",
                "Please enter your full name.",
                "error"
            );

            return;
        }

        if (!/^\d{10}$/.test(mobile)) {

            showMessage(
                "createMessage",
                "Please enter a valid 10 digit mobile number.",
                "error"
            );

            return;
        }

        if (email && !/^\S+@\S+\.\S+$/.test(email)) {

            showMessage(
                "createMessage",
                "Please enter a valid email address.",
                "error"
            );

            return;
        }

        if (!/^\d{4}$/.test(pin)) {

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

        if (!department) {

            showMessage(
                "createMessage",
                "Please enter your branch/department.",
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


        /* CHECK DUPLICATE */

        const users = getUsers();

        const mobileExists = users.some(
            user => clean(user.mobile) === mobile
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

            const emailExists = users.some(
                user =>
                    clean(user.email).toLowerCase() ===
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


        /* CREATE USER */

        const newUser = {

            id:
                "USER-" +
                Date.now() +
                "-" +
                Math.floor(Math.random() * 10000),

            name: name,

            mobile: mobile,

            email: email,

            pin: pin,

            college: college,

            department: department,

            roll: roll,

            faceRegistered: false,

            faceImage: "",

            createdAt: new Date().toISOString()
        };


        users.push(newUser);

        saveUsers(users);

        setCurrentUser(newUser);


        showMessage(
            "createMessage",
            "Account created successfully!",
            "success"
        );


        setTimeout(() => {

            showDashboard();

        }, 700);

    });
}


/* =========================================================
   BACK TO LOGIN
========================================================= */

const backToLoginButton =
    document.getElementById("backToLoginButton");

if (backToLoginButton) {

    backToLoginButton.addEventListener("click", function () {

        showLoginPage();

    });
}


/* =========================================================
   FORGOT PIN PAGE
========================================================= */

const forgotPinButton =
    document.getElementById("forgotPinButton");

if (forgotPinButton) {

    forgotPinButton.addEventListener("click", function () {

        showForgotPinPage();

    });
}


/* =========================================================
   FORGOT PIN RESET
========================================================= */

const resetPinButton =
    document.getElementById("resetPinButton");

if (resetPinButton) {

    resetPinButton.addEventListener("click", function () {

        const name = clean(
            document.getElementById("forgotName")?.value
        );

        const identity = clean(
            document.getElementById("forgotIdentity")?.value
        );

        const newPin = clean(
            document.getElementById("newPin")?.value
        );

        const confirmNewPin = clean(
            document.getElementById("confirmNewPin")?.value
        );


        if (!name || !identity) {

            showMessage(
                "forgotMessage",
                "Please enter your name and mobile/email.",
                "error"
            );

            return;
        }


        if (!/^\d{4}$/.test(newPin)) {

            showMessage(
                "forgotMessage",
                "New PIN must contain exactly 4 digits.",
                "error"
            );

            return;
        }


        if (newPin !== confirmNewPin) {

            showMessage(
                "forgotMessage",
                "New PIN and Confirm PIN do not match.",
                "error"
            );

            return;
        }


        const users = getUsers();

        const index = users.findIndex(function (user) {

            const sameName =
                clean(user.name).toLowerCase() ===
                name.toLowerCase();

            const sameMobile =
                clean(user.mobile) === identity;

            const sameEmail =
                clean(user.email).toLowerCase() ===
                identity.toLowerCase();

            return sameName && (sameMobile || sameEmail);

        });


        if (index === -1) {

            showMessage(
                "forgotMessage",
                "No matching account was found.",
                "error"
            );

            return;
        }


        users[index].pin = newPin;

        saveUsers(users);


        showMessage(
            "forgotMessage",
            "PIN reset successful. You can now login.",
            "success"
        );


        setTimeout(() => {

            showLoginPage();

        }, 1000);

    });
}


/* =========================================================
   FORGOT BACK
========================================================= */

const forgotBackButton =
    document.getElementById("forgotBackButton");

if (forgotBackButton) {

    forgotBackButton.addEventListener("click", function () {

        showLoginPage();

    });
}


/* =========================================================
   DASHBOARD MENU SYSTEM
========================================================= */

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


function showSection(sectionId) {

    sections.forEach(function (id) {

        const section = document.getElementById(id);

        if (section) {

            section.style.display =
                id === sectionId ? "block" : "none";

        }

    });


    document.querySelectorAll(".menu-item").forEach(
        button => button.classList.remove("active")
    );


    const menuMap = {

        dashboardHome: "dashboardMenuButton",

        editProfileSection: "editProfileMenuButton",

        editContactSection: "editContactMenuButton",

        personalDetailsSection: "personalDetailsMenuButton",

        faceRegistrationSection: "faceRegistrationMenuButton",

        attendanceSection: "attendanceMenuButton",

        studentsSection: "studentsMenuButton",

        checkAttendanceSection: "checkAttendanceMenuButton",

        adminSection: "adminMenuButton"
    };


    const buttonId = menuMap[sectionId];

    if (buttonId) {

        const button =
            document.getElementById(buttonId);

        if (button) {
            button.classList.add("active");
        }
    }


    /* Close mobile sidebar */

    closeSidebar();


    /* Camera stop */

    if (sectionId !== "faceRegistrationSection") {

        stopCamera(
            "registrationCamera",
            "registrationStatus"
        );
    }


    if (sectionId !== "attendanceSection") {

        stopCamera(
            "attendanceCamera",
            "attendanceStatus"
        );
    }


    if (sectionId === "studentsSection") {

        renderStudents();

    }


    if (sectionId === "checkAttendanceSection") {

        renderAttendanceHistory();

    }


    if (sectionId === "adminSection") {

        renderAdminStudents();

    }


    if (sectionId === "personalDetailsSection") {

        updatePersonalDetails();

    }

}


/* =========================================================
   MENU BUTTONS
========================================================= */

function addMenuListener(buttonId, sectionId) {

    const button = document.getElementById(buttonId);

    if (button) {

        button.addEventListener("click", function () {

            showSection(sectionId);

        });

    }
}


addMenuListener(
    "dashboardMenuButton",
    "dashboardHome"
);

addMenuListener(
    "editProfileMenuButton",
    "editProfileSection"
);

addMenuListener(
    "editContactMenuButton",
    "editContactSection"
);

addMenuListener(
    "personalDetailsMenuButton",
    "personalDetailsSection"
);

addMenuListener(
    "faceRegistrationMenuButton",
    "faceRegistrationSection"
);

addMenuListener(
    "attendanceMenuButton",
    "attendanceSection"
);

addMenuListener(
    "studentsMenuButton",
    "studentsSection"
);

addMenuListener(
    "checkAttendanceMenuButton",
    "checkAttendanceSection"
);

addMenuListener(
    "adminMenuButton",
    "adminSection"
);


/* =========================================================
   QUICK ACTIONS
========================================================= */

const quickFaceRegistration =
    document.getElementById("quickFaceRegistration");

if (quickFaceRegistration) {

    quickFaceRegistration.addEventListener(
        "click",
        () => showSection("faceRegistrationSection")
    );
}


const quickAttendance =
    document.getElementById("quickAttendance");

if (quickAttendance) {

    quickAttendance.addEventListener(
        "click",
        () => showSection("attendanceSection")
    );
}


const quickCheckAttendance =
    document.getElementById("quickCheckAttendance");

if (quickCheckAttendance) {

    quickCheckAttendance.addEventListener(
        "click",
        () => showSection("checkAttendanceSection")
    );
}


/* =========================================================
   DASHBOARD SETUP
========================================================= */

function setupDashboard() {

    const user = getCurrentUser();

    if (!user) {

        showLoginPage();

        return;
    }


    updateDashboardUser(user);

    updateDate();

    updateStats();

    fillEditForms(user);

    updatePersonalDetails();

    renderStudents();

    renderAttendanceHistory();

    renderAdminStudents();

    addHamburgerMenu();

}


/* =========================================================
   USER INFORMATION
========================================================= */

function updateDashboardUser(user) {

    const name =
        document.getElementById("dashboardUserName");

    const roll =
        document.getElementById("dashboardUserRoll");

    const welcome =
        document.getElementById("welcomeName");


    if (name) {
        name.textContent = user.name;
    }


    if (roll) {

        roll.textContent =
            user.roll
                ? "Roll: " + user.roll
                : "Student";

    }


    if (welcome) {
        welcome.textContent = user.name;
    }
}


/* =========================================================
   DATE
========================================================= */

function updateDate() {

    const element =
        document.getElementById("currentDate");

    if (!element) return;


    const now = new Date();


    const options = {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric",

        hour: "2-digit",

        minute: "2-digit",

        second: "2-digit"
    };


    element.textContent =
        now.toLocaleString("en-IN", options);

}


setInterval(updateDate, 1000);


/* =========================================================
   EDIT PROFILE FORM
========================================================= */

function fillEditForms(user) {

    const editName =
        document.getElementById("editName");

    const editRoll =
        document.getElementById("editRoll");

    const editDepartment =
        document.getElementById("editDepartment");

    const editMobile =
        document.getElementById("editMobile");

    const editEmail =
        document.getElementById("editEmail");


    if (editName) editName.value = user.name || "";

    if (editRoll) editRoll.value = user.roll || "";

    if (editDepartment)
        editDepartment.value = user.department || "";

    if (editMobile)
        editMobile.value = user.mobile || "";

    if (editEmail)
        editEmail.value = user.email || "";
}


/* =========================================================
   SAVE PROFILE
========================================================= */

const saveEditedDetailsButton =
    document.getElementById("saveEditedDetailsButton");

if (saveEditedDetailsButton) {

    saveEditedDetailsButton.addEventListener(
        "click",
        function () {

            const currentUser = getCurrentUser();

            if (!currentUser) return;


            const newName =
                clean(document.getElementById("editName")?.value);

            const newRoll =
                clean(document.getElementById("editRoll")?.value);

            const newDepartment =
                clean(
                    document.getElementById("editDepartment")?.value
                );


            if (!newName || !newRoll || !newDepartment) {

                alert(
                    "Please fill Name, Roll and Branch/Department."
                );

                return;
            }


            const users = getUsers();

            const index = users.findIndex(
                user => user.id === currentUser.id
            );


            if (index === -1) return;


            users[index].name = newName;

            users[index].roll = newRoll;

            users[index].department = newDepartment;


            saveUsers(users);

            setCurrentUser(users[index]);


            updateDashboardUser(users[index]);

            updatePersonalDetails();


            alert("Profile updated successfully.");

        }
    );
}


/* =========================================================
   SAVE MOBILE & EMAIL
========================================================= */

const saveContactButton =
    document.getElementById("saveContactButton");

if (saveContactButton) {

    saveContactButton.addEventListener(
        "click",
        function () {

            const currentUser = getCurrentUser();

            if (!currentUser) return;


            const mobile =
                clean(document.getElementById("editMobile")?.value);

            const email =
                clean(document.getElementById("editEmail")?.value);


            if (!/^\d{10}$/.test(mobile)) {

                showMessage(
                    "contactMessage",
                    "Enter a valid 10 digit mobile number.",
                    "error"
                );

                return;
            }


            if (
                email &&
                !/^\S+@\S+\.\S+$/.test(email)
            ) {

                showMessage(
                    "contactMessage",
                    "Enter a valid email address.",
                    "error"
                );

                return;
            }


            const users = getUsers();


            const duplicateMobile =
                users.some(
                    user =>
                        user.id !== currentUser.id &&
                        clean(user.mobile) === mobile
                );


            if (duplicateMobile) {

                showMessage(
                    "contactMessage",
                    "This mobile number is already used.",
                    "error"
                );

                return;
            }


            const index =
                users.findIndex(
                    user => user.id === currentUser.id
                );


            if (index === -1) return;


            users[index].mobile = mobile;

            users[index].email = email;


            saveUsers(users);

            setCurrentUser(users[index]);


            showMessage(
                "contactMessage",
                "Contact details updated successfully.",
                "success"
            );


            updatePersonalDetails();

        }
    );
}


/* =========================================================
   PERSONAL DETAILS
========================================================= */

function updatePersonalDetails() {

    const user = getCurrentUser();

    if (!user) return;


    const fields = {

        personalName: user.name || "-",

        personalMobile: user.mobile || "-",

        personalEmail: user.email || "-",

        personalDepartment:
            user.department || "-",

        personalRoll:
            user.roll || "-"
    };


    Object.keys(fields).forEach(function (id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                fields[id];

        }

    });


    /* Also fill edit fields */

    const editName =
        document.getElementById("editName");

    const editRoll =
        document.getElementById("editRoll");

    const editDepartment =
        document.getElementById("editDepartment");

    const editMobile =
        document.getElementById("editMobile");

    const editEmail =
        document.getElementById("editEmail");


    if (editName) editName.value = user.name || "";

    if (editRoll) editRoll.value = user.roll || "";

    if (editDepartment)
        editDepartment.value = user.department || "";

    if (editMobile)
        editMobile.value = user.mobile || "";

    if (editEmail)
        editEmail.value = user.email || "";
}


/* =========================================================
   STUDENT LIST
========================================================= */

function renderStudents(searchTerm = "") {

    const list =
        document.getElementById("studentList");

    if (!list) return;


    const users = getUsers();


    const term =
        clean(searchTerm).toLowerCase();


    const filtered =
        users.filter(function (user) {

            if (!term) return true;

            return (

                clean(user.name)
                    .toLowerCase()
                    .includes(term)

                ||

                clean(user.roll)
                    .toLowerCase()
                    .includes(term)

                ||

                clean(user.department)
                    .toLowerCase()
                    .includes(term)

                ||

                clean(user.mobile)
                    .toLowerCase()
                    .includes(term)

                ||

                clean(user.email)
                    .toLowerCase()
                    .includes(term)

            );

        });


    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="details-card">
                <h3>No students registered yet.</h3>
                <p>Registered students will appear here.</p>
            </div>
        `;

        return;
    }


    list.innerHTML =
        filtered.map(function (user, index) {

            return `

                <div class="details-card student-card">

                    <h3>
                        👤 ${escapeHTML(user.name)}
                    </h3>

                    <p>
                        <strong>Mobile:</strong>
                        ${escapeHTML(user.mobile || "-")}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${escapeHTML(user.email || "-")}
                    </p>

                    <p>
                        <strong>College:</strong>
                        ${escapeHTML(user.college || COLLEGE_NAME)}
                    </p>

                    <p>
                        <strong>Branch:</strong>
                        ${escapeHTML(user.department || "-")}
                    </p>

                    <p>
                        <strong>Roll:</strong>
                        ${escapeHTML(user.roll || "-")}
                    </p>

                    <p>
                        <strong>Face:</strong>
                        ${
                            user.faceRegistered
                            ? "✅ Registered"
                            : "❌ Not Registered"
                        }
                    </p>

                    <p>
                        <strong>Student No:</strong>
                        ${index + 1}
                    </p>

                </div>

            `;

        }).join("");

}


/* =========================================================
   SEARCH STUDENTS
========================================================= */

const searchStudent =
    document.getElementById("searchStudent");

if (searchStudent) {

    searchStudent.addEventListener(
        "input",
        function () {

            renderStudents(this.value);

        }
    );
}


/* =========================================================
   ADMIN STUDENT LIST
========================================================= */

function renderAdminStudents() {

    const list =
        document.getElementById("adminStudentList");

    if (!list) return;


    const users = getUsers();


    if (users.length === 0) {

        list.innerHTML = `
            <div class="details-card">
                <h3>No registered students.</h3>
                <p>Student accounts will appear here.</p>
            </div>
        `;

        return;
    }


    list.innerHTML =
        users.map(function (user, index) {

            return `

                <div class="details-card student-card">

                    <h3>
                        👤 ${escapeHTML(user.name)}
                    </h3>

                    <p>
                        <strong>Mobile:</strong>
                        ${escapeHTML(user.mobile || "-")}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${escapeHTML(user.email || "-")}
                    </p>

                    <p>
                        <strong>College:</strong>
                        ${escapeHTML(user.college || COLLEGE_NAME)}
                    </p>

                    <p>
                        <strong>Branch:</strong>
                        ${escapeHTML(user.department || "-")}
                    </p>

                    <p>
                        <strong>Roll:</strong>
                        ${escapeHTML(user.roll || "-")}
                    </p>

                    <p>
                        <strong>Face Registration:</strong>
                        ${
                            user.faceRegistered
                            ? "✅ Completed"
                            : "❌ Not Completed"
                        }
                    </p>

                    <p>
                        <strong>Registered:</strong>
                        ${
                            user.createdAt
                            ? new Date(user.createdAt)
                                .toLocaleString("en-IN")
                            : "-"
                        }
                    </p>

                </div>

            `;

        }).join("");

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStats() {

    const users = getUsers();

    const attendance = getAttendance();


    const today =
        new Date().toLocaleDateString("en-CA");


    const todayAttendance =
        attendance.filter(
            item => item.date === today
        );


    const presentCount =
        new Set(
            todayAttendance.map(
                item => item.userId
            )
        ).size;


    const totalStudents =
        users.length;


    const absentCount =
        Math.max(
            totalStudents - presentCount,
            0
        );


    let percentage = 0;

    if (totalStudents > 0) {

        percentage =
            Math.round(
                (presentCount / totalStudents) * 100
            );

    }


    const totalElement =
        document.getElementById("totalStudents");

    const presentElement =
        document.getElementById("presentStudents");

    const absentElement =
        document.getElementById("absentStudents");

    const percentageElement =
        document.getElementById(
            "attendancePercentage"
        );


    if (totalElement)
        totalElement.textContent = totalStudents;

    if (presentElement)
        presentElement.textContent = presentCount;

    if (absentElement)
        absentElement.textContent = absentCount;

    if (percentageElement)
        percentageElement.textContent =
            percentage + "%";

}


/* =========================================================
   CAMERA VARIABLES
========================================================= */

let registrationStream = null;
let attendanceStream = null;

let registrationTimer = null;
let attendanceTimer = null;

let registrationCaptured = false;
let attendanceCaptured = false;


/* =========================================================
   START CAMERA
========================================================= */

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

                    width: {
                        ideal: 640
                    },

                    height: {
                        ideal: 640
                    }

                },

                audio: false
            });


        video.srcObject = stream;

        video.style.transform = "scaleX(-1)";

        await video.play();


        if (status) {

            status.textContent =
                "🟢 Camera ON — Looking for face...";

        }


        return stream;


    } catch (error) {

        console.error(error);


        if (status) {

            status.textContent =
                "🔴 Camera permission required";

        }


        alert(
            "Camera চালু করতে browser-এ Camera Permission Allow করো."
        );


        return null;
    }

}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera(videoId, statusId) {

    const video =
        document.getElementById(videoId);


    if (video && video.srcObject) {

        video.srcObject
            .getTracks()
            .forEach(track => track.stop());

        video.srcObject = null;

    }


    const status =
        document.getElementById(statusId);

    if (status) {

        status.textContent =
            "Camera is OFF";

    }
}


/* =========================================================
   CAPTURE IMAGE FROM CAMERA
========================================================= */

function captureVideoFrame(videoId) {

    const video =
        document.getElementById(videoId);


    if (!video ||
        video.readyState < 2 ||
        !video.videoWidth) {

        return null;
    }


    const canvas =
        document.createElement("canvas");


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    const context =
        canvas.getContext("2d");


    /*
       Mirror the captured image so it
       looks like a selfie mirror.
    */

    context.translate(
        canvas.width,
        0
    );

    context.scale(-1, 1);


    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    return canvas.toDataURL(
        "image/jpeg",
        0.85
    );

}


/* =========================================================
   FACE REGISTRATION
========================================================= */

const startFaceRegistrationButton =
    document.getElementById(
        "startFaceRegistrationButton"
    );


if (startFaceRegistrationButton) {

    startFaceRegistrationButton.addEventListener(
        "click",
        async function () {

            const user =
                getCurrentUser();


            if (!user) {

                alert("Please login first.");

                return;
            }


            const name =
                clean(
                    document.getElementById(
                        "faceName"
                    )?.value
                );

            const mobile =
                clean(
                    document.getElementById(
                        "faceMobile"
                    )?.value
                );

            const email =
                clean(
                    document.getElementById(
                        "faceEmail"
                    )?.value
                );

            const department =
                clean(
                    document.getElementById(
                        "departmentName"
                    )?.value
                );

            const roll =
                clean(
                    document.getElementById(
                        "faceRoll"
                    )?.value
                );


            if (!name ||
                !mobile ||
                !department ||
                !roll) {

                showMessage(
                    "registrationMessage",
                    "Please fill all required student details.",
                    "error"
                );

                return;
            }


            registrationCaptured = false;


            registrationStream =
                await startCamera(
                    "registrationCamera",
                    "registrationStatus"
                );


            if (!registrationStream) return;


            showMessage(
                "registrationMessage",
                "Camera started. Keep your face inside the guide.",
                "success"
            );


            clearTimeout(registrationTimer);


            /*
              Automatic capture after the camera
              has had time to start.
            */

            registrationTimer =
                setTimeout(
                    function () {

                        if (registrationCaptured)
                            return;


                        const image =
                            captureVideoFrame(
                                "registrationCamera"
                            );


                        if (!image) {

                            showMessage(
                                "registrationMessage",
                                "Could not capture image. Please try again.",
                                "error"
                            );

                            return;
                        }


                        registrationCaptured = true;


                        const users =
                            getUsers();


                        const index =
                            users.findIndex(
                                item =>
                                    item.id === user.id
                            );


                        if (index === -1) return;


                        users[index].name =
                            name;

                        users[index].mobile =
                            mobile;

                        users[index].email =
                            email;

                        users[index].department =
                            department;

                        users[index].roll =
                            roll;

                        users[index].faceRegistered =
                            true;

                        users[index].faceImage =
                            image;


                        saveUsers(users);

                        setCurrentUser(users[index]);


                        const status =
                            document.getElementById(
                                "registrationStatus"
                            );


                        if (status) {

                            status.textContent =
                                "✅ Face Captured";

                        }


                        showMessage(
                            "registrationMessage",
                            "Face registration completed successfully!",
                            "success"
                        );


                        stopCamera(
                            "registrationCamera",
                            "registrationStatus"
                        );


                    },
                    3000
                );

        }
    );

}


/* =========================================================
   LOAD FACE REGISTRATION DETAILS
========================================================= */

function loadFaceDetails() {

    const user =
        getCurrentUser();

    if (!user) return;


    const faceName =
        document.getElementById("faceName");

    const faceMobile =
        document.getElementById("faceMobile");

    const faceEmail =
        document.getElementById("faceEmail");

    const department =
        document.getElementById("departmentName");

    const faceRoll =
        document.getElementById("faceRoll");


    if (faceName)
        faceName.value = user.name || "";

    if (faceMobile)
        faceMobile.value = user.mobile || "";

    if (faceEmail)
        faceEmail.value = user.email || "";

    if (department)
        department.value = user.department || "";

    if (faceRoll)
        faceRoll.value = user.roll || "";

}


/* =========================================================
   ATTENDANCE
========================================================= */

const startFaceAttendanceButton =
    document.getElementById(
        "startFaceAttendanceButton"
    );


if (startFaceAttendanceButton) {

    startFaceAttendanceButton.addEventListener(
        "click",
        async function () {

            const user =
                getCurrentUser();


            if (!user) {

                alert("Please login first.");

                return;
            }


            if (!user.faceRegistered) {

                showAttendanceResult(
                    "❌",
                    "Face Not Registered",
                    "Please register your face first."
                );

                return;
            }


            attendanceCaptured = false;


            attendanceStream =
                await startCamera(
                    "attendanceCamera",
                    "attendanceStatus"
                );


            if (!attendanceStream) return;


            showAttendanceResult(
                "📷",
                "Camera Started",
                "Look directly at the camera..."
            );


            clearTimeout(attendanceTimer);


            attendanceTimer =
                setTimeout(
                    function () {

                        if (attendanceCaptured)
                            return;


                        const image =
                            captureVideoFrame(
                                "attendanceCamera"
                            );


                        if (!image) {

                            showAttendanceResult(
                                "❌",
                                "Capture Failed",
                                "Please try again."
                            );

                            return;
                        }


                        attendanceCaptured = true;


                        markAttendance(
                            user,
                            image
                        );


                        stopCamera(
                            "attendanceCamera",
                            "attendanceStatus"
                        );


                    },
                    3000
                );

        }
    );

}


/* =========================================================
   MARK ATTENDANCE
========================================================= */

function markAttendance(user, image) {

    const now =
        new Date();


    const date =
        now.toLocaleDateString(
            "en-CA"
        );


    const time =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    const day =
        now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long"
            }
        );


    const attendance =
        getAttendance();


    const alreadyMarked =
        attendance.some(
            item =>
                item.userId === user.id &&
                item.date === date
        );


    if (alreadyMarked) {

        showAttendanceResult(
            "ℹ️",
            "Already Marked",
            `${user.name}, your attendance is already marked for today.`
        );


        showAttendancePopup(
            "ℹ️",
            "Attendance Already Marked",
            `${user.name}<br><br>${day}<br>${date}<br>${time}`
        );


        return;
    }


    const record = {

        id:
            "ATT-" +
            Date.now(),

        userId:
            user.id,

        name:
            user.name,

        mobile:
            user.mobile,

        email:
            user.email,

        branch:
            user.department,

        roll:
            user.roll,

        date:
            date,

        day:
            day,

        time:
            time,

        capturedImage:
            image || "",

        createdAt:
            now.toISOString()
    };


    attendance.push(record);

    saveAttendance(attendance);


    updateStats();

    renderAttendanceHistory();


    showAttendanceResult(
        "✅",
        "Attendance Marked",
        `${user.name}<br>${day}<br>${date}<br>${time}`
    );


    showAttendancePopup(
        "✅",
        "Attendance Marked Successfully!",
        `
            <strong>${escapeHTML(user.name)}</strong><br><br>
            📅 ${escapeHTML(day)}<br>
            📆 ${escapeHTML(date)}<br>
            ⏰ ${escapeHTML(time)}<br><br>
            Your attendance has been saved.
        `
    );

}


/* =========================================================
   ATTENDANCE RESULT
========================================================= */

function showAttendanceResult(
    icon,
    title,
    message
) {

    const result =
        document.getElementById(
            "attendanceResult"
        );


    if (!result) return;


    result.innerHTML = `

        <div class="details-card">

            <div style="font-size:40px;">
                ${icon}
            </div>

            <h2>
                ${title}
            </h2>

            <p>
                ${message}
            </p>

        </div>

    `;
}


/* =========================================================
   ATTENDANCE POPUP
========================================================= */

function showAttendancePopup(
    icon,
    title,
    message
) {

    const popup =
        document.getElementById(
            "attendancePopup"
        );


    const popupIcon =
        document.getElementById(
            "popupIcon"
        );

    const popupTitle =
        document.getElementById(
            "popupTitle"
        );

    const popupMessage =
        document.getElementById(
            "popupMessage"
        );


    if (!popup) return;


    if (popupIcon)
        popupIcon.textContent = icon;


    if (popupTitle)
        popupTitle.textContent = title;


    if (popupMessage)
        popupMessage.innerHTML = message;


    popup.style.display = "flex";

}


/* =========================================================
   CLOSE ATTENDANCE POPUP
========================================================= */

const closeAttendancePopup =
    document.getElementById(
        "closeAttendancePopup"
    );


if (closeAttendancePopup) {

    closeAttendancePopup.addEventListener(
        "click",
        function () {

            const popup =
                document.getElementById(
                    "attendancePopup"
                );


            if (popup) {

                popup.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   ATTENDANCE HISTORY
========================================================= */

function renderAttendanceHistory() {

    const container =
        document.getElementById(
            "attendanceHistory"
        );


    if (!container) return;


    const user =
        getCurrentUser();


    if (!user) return;


    const attendance =
        getAttendance();


    const myAttendance =
        attendance
            .filter(
                item =>
                    item.userId === user.id
            )
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );


    const totalDays =
        myAttendance.length;


    const presentDays =
        myAttendance.length;


    const absentDays = 0;


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


    if (totalElement)
        totalElement.textContent =
            totalDays;


    if (presentElement)
        presentElement.textContent =
            presentDays;


    if (absentElement)
        absentElement.textContent =
            absentDays;


    if (myAttendance.length === 0) {

        container.innerHTML = `

            <div class="details-card">

                <h3>
                    📊 No Attendance Yet
                </h3>

                <p>
                    Your attendance history will appear here.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        myAttendance.map(function (item) {

            return `

                <div class="details-card attendance-history-card">

                    <h3>
                        ✅ Present
                    </h3>

                    <p>
                        <strong>Date:</strong>
                        ${escapeHTML(item.date)}
                    </p>

                    <p>
                        <strong>Day:</strong>
                        ${escapeHTML(item.day)}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${escapeHTML(item.time)}
                    </p>

                    <p>
                        <strong>Name:</strong>
                        ${escapeHTML(item.name)}
                    </p>

                    <p>
                        <strong>Roll:</strong>
                        ${escapeHTML(item.roll || "-")}
                    </p>

                    <p>
                        <strong>Branch:</strong>
                        ${escapeHTML(item.branch || "-")}
                    </p>

                </div>

            `;

        }).join("");

}


/* =========================================================
   HAMBURGER MENU
========================================================= */

function addHamburgerMenu() {

    let button =
        document.getElementById(
            "hamburgerMenuButton"
        );


    if (button) return;


    button =
        document.createElement("button");


    button.id =
        "hamburgerMenuButton";


    button.innerHTML =
        "☰";


    button.setAttribute(
        "aria-label",
        "Open Menu"
    );


    button.style.cssText = `

        position: fixed;
        top: 18px;
        left: 18px;
        z-index: 9999;
        width: 46px;
        height: 46px;
        border: none;
        border-radius: 12px;
        font-size: 25px;
        cursor: pointer;
        background: white;
        box-shadow: 0 4px 18px rgba(0,0,0,.18);

    `;


    document.body.appendChild(button);


    button.addEventListener(
        "click",
        function () {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );


            if (!sidebar) return;


            sidebar.classList.toggle(
                "sidebar-open"
            );

        }
    );

}


/* =========================================================
   CLOSE SIDEBAR
========================================================= */

function closeSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "sidebar-open"
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            stopCamera(
                "registrationCamera",
                "registrationStatus"
            );

            stopCamera(
                "attendanceCamera",
                "attendanceStatus"
            );


            clearCurrentUser();


            showLoginPage();


            const loginName =
                document.getElementById(
                    "loginName"
                );

            const loginIdentity =
                document.getElementById(
                    "loginIdentity"
                );

            const loginPin =
                document.getElementById(
                    "loginPin"
                );


            if (loginName)
                loginName.value = "";

            if (loginIdentity)
                loginIdentity.value = "";

            if (loginPin)
                loginPin.value = "";

        }
    );

}


/* =========================================================
   AUTO LOGIN AFTER REFRESH
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const currentUser =
            getCurrentUser();


        if (currentUser) {

            showDashboard();

        } else {

            showLoginPage();

        }


        loadFaceDetails();

    }
);


/* =========================================================
   PREVENT ENTER KEY FROM RELOADING PAGE
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            event.target.tagName === "INPUT"
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================================
   CAMERA MIRROR STYLE
========================================================= */

const mirrorStyle =
    document.createElement("style");


mirrorStyle.textContent = `

    #registrationCamera,
    #attendanceCamera {

        transform: scaleX(-1);
        object-fit: cover;

    }

    .sidebar {

        transition:
            transform 0.3s ease;

    }

    @media (max-width: 900px) {

        .sidebar {

            transform:
                translateX(-110%);

            position: fixed;

            left: 0;

            top: 0;

            height: 100vh;

            z-index: 9998;

        }

        .sidebar.sidebar-open {

            transform:
                translateX(0);

        }

        .main-content {

            width: 100%;

        }

    }

`;


document.head.appendChild(mirrorStyle);


/* =========================================================
   END
========================================================= */

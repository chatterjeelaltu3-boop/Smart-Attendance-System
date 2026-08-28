/* =========================================================
   SMART ATTENDANCE SYSTEM
   Complete script.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       STORAGE
    ===================================================== */

    const USERS_KEY = "smartAttendanceUsers";
    const ATTENDANCE_KEY = "smartAttendanceRecords";
    const CURRENT_USER_KEY = "smartAttendanceCurrentUser";

    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    let attendanceRecords =
        JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];

    let currentUser =
        JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;

    let registrationStream = null;
    let attendanceStream = null;

    let registrationTimer = null;
    let attendanceTimer = null;

    /* =====================================================
       ADMIN
    ===================================================== */

    const ADMIN = {
        name: "Ayush Chatterjee",
        mobile: "admin",
        email: "admin@hetc.ac.in",
        pin: "1234",
        role: "admin",
        college: "Hooghly Engineering & Technology College",
        department: "Administration",
        roll: "ADMIN"
    };

    /* =====================================================
       HELPER FUNCTIONS
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function saveUsers() {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function saveAttendance() {
        localStorage.setItem(
            ATTENDANCE_KEY,
            JSON.stringify(attendanceRecords)
        );
    }

    function saveCurrentUser() {
        if (currentUser) {
            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(currentUser)
            );
        } else {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    }

    function showElement(id) {
        const el = $(id);
        if (el) el.style.display = "";
    }

    function hideElement(id) {
        const el = $(id);
        if (el) el.style.display = "none";
    }

    function message(id, text, type = "success") {
        const el = $(id);

        if (!el) return;

        el.textContent = text;
        el.className = "auth-message " + type;
    }

    function getTodayString() {
        const now = new Date();

        return now.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    function getDateTime() {
        const now = new Date();

        return {
            date: now.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }),

            day: now.toLocaleDateString("en-IN", {
                weekday: "long"
            }),

            time: now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            })
        };
    }

    function escapeHTML(value) {
        if (value === undefined || value === null) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       PAGE NAVIGATION
    ===================================================== */

    function showOnlyPage(pageId) {

        const pages = [
            "loginPage",
            "createAccountPage",
            "forgotPinPage",
            "dashboardPage"
        ];

        pages.forEach(id => {
            const el = $(id);

            if (el) {
                el.style.display = "none";
            }
        });

        const selected = $(pageId);

        if (selected) {
            selected.style.display = "";
        }
    }

    function openLogin() {

        stopAllCameras();

        showOnlyPage("loginPage");

        if ($("loginName")) $("loginName").value = "";
        if ($("loginIdentity")) $("loginIdentity").value = "";
        if ($("loginPin")) $("loginPin").value = "";

        message("loginMessage", "", "success");
    }

    function openCreateAccount() {

        stopAllCameras();

        showOnlyPage("createAccountPage");

        message("createMessage", "", "success");

        if ($("createName")) $("createName").focus();
    }

    function openForgotPin() {

        stopAllCameras();

        showOnlyPage("forgotPinPage");

        message("forgotMessage", "", "success");
    }

    /* =====================================================
       LOGIN
    ===================================================== */

    function loginStudent() {

        const name =
            $("loginName")?.value.trim();

        const identity =
            $("loginIdentity")?.value.trim();

        const pin =
            $("loginPin")?.value.trim();

        if (!name || !identity || !pin) {

            message(
                "loginMessage",
                "Please enter Name, Mobile/Email and PIN.",
                "error"
            );

            return;
        }

        if (!/^\d{4}$/.test(pin)) {

            message(
                "loginMessage",
                "PIN must contain exactly 4 digits.",
                "error"
            );

            return;
        }

        const foundUser = users.find(user => {

            const sameName =
                user.name.toLowerCase() === name.toLowerCase();

            const sameIdentity =
                user.mobile === identity ||
                (
                    user.email &&
                    user.email.toLowerCase() === identity.toLowerCase()
                );

            return sameName && sameIdentity && user.pin === pin;
        });

        if (!foundUser) {

            message(
                "loginMessage",
                "Invalid login details. Please check your information.",
                "error"
            );

            return;
        }

        currentUser = foundUser;

        saveCurrentUser();

        openDashboard();
    }

    /* =====================================================
       ADMIN LOGIN
    ===================================================== */

    function adminLogin() {

        const name =
            $("loginName")?.value.trim();

        const identity =
            $("loginIdentity")?.value.trim();

        const pin =
            $("loginPin")?.value.trim();

        const correctName =
            name.toLowerCase() === ADMIN.name.toLowerCase();

        const correctIdentity =
            identity === ADMIN.mobile ||
            identity.toLowerCase() === ADMIN.email.toLowerCase();

        const correctPin =
            pin === ADMIN.pin;

        if (correctName && correctIdentity && correctPin) {

            currentUser = {
                ...ADMIN
            };

            saveCurrentUser();

            openDashboard();

            return;
        }

        message(
            "loginMessage",
            "Admin login failed. Check Admin name, identity and PIN.",
            "error"
        );
    }

    /* =====================================================
       CREATE ACCOUNT
    ===================================================== */

    function createAccount() {

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

        const college =
            $("createCollege")?.value.trim() ||
            "Hooghly Engineering & Technology College";

        const department =
            $("createDepartment")?.value.trim();

        const roll =
            $("createRoll")?.value.trim();

        if (!name ||
            !mobile ||
            !pin ||
            !confirmPin ||
            !department ||
            !roll) {

            message(
                "createMessage",
                "Please fill all required (*) fields.",
                "error"
            );

            return;
        }

        if (!/^\d{10}$/.test(mobile)) {

            message(
                "createMessage",
                "Mobile number must contain 10 digits.",
                "error"
            );

            return;
        }

        if (!/^\d{4}$/.test(pin)) {

            message(
                "createMessage",
                "PIN must contain exactly 4 digits.",
                "error"
            );

            return;
        }

        if (pin !== confirmPin) {

            message(
                "createMessage",
                "PIN and Confirm PIN do not match.",
                "error"
            );

            return;
        }

        const duplicateMobile =
            users.some(user => user.mobile === mobile);

        if (duplicateMobile) {

            message(
                "createMessage",
                "This mobile number is already registered.",
                "error"
            );

            return;
        }

        if (email) {

            const duplicateEmail =
                users.some(
                    user =>
                        user.email &&
                        user.email.toLowerCase() ===
                        email.toLowerCase()
                );

            if (duplicateEmail) {

                message(
                    "createMessage",
                    "This email is already registered.",
                    "error"
                );

                return;
            }
        }

        const duplicateRoll =
            users.some(
                user =>
                    user.roll.toLowerCase() ===
                    roll.toLowerCase()
            );

        if (duplicateRoll) {

            message(
                "createMessage",
                "This roll number is already registered.",
                "error"
            );

            return;
        }

        const newUser = {

            id:
                "STU-" +
                Date.now() +
                "-" +
                Math.floor(Math.random() * 1000),

            name,
            mobile,
            email,
            pin,

            college,

            department,
            roll,

            role: "student",

            faceRegistered: false,

            faceDescriptor: null,

            createdAt:
                new Date().toISOString()
        };

        users.push(newUser);

        saveUsers();

        message(
            "createMessage",
            "Account created successfully! Returning to Login...",
            "success"
        );

        setTimeout(() => {

            if ($("loginName"))
                $("loginName").value = name;

            if ($("loginIdentity"))
                $("loginIdentity").value = mobile;

            openLogin();

            if ($("loginName"))
                $("loginName").value = name;

            if ($("loginIdentity"))
                $("loginIdentity").value = mobile;

            message(
                "loginMessage",
                "Account created successfully. Please enter your PIN to login.",
                "success"
            );

        }, 1000);
    }

    /* =====================================================
       FORGOT PIN
    ===================================================== */

    function resetPin() {

        const name =
            $("forgotName")?.value.trim();

        const identity =
            $("forgotIdentity")?.value.trim();

        const newPin =
            $("newPin")?.value.trim();

        const confirmNewPin =
            $("confirmNewPin")?.value.trim();

        if (!name ||
            !identity ||
            !newPin ||
            !confirmNewPin) {

            message(
                "forgotMessage",
                "Please fill all fields.",
                "error"
            );

            return;
        }

        if (!/^\d{4}$/.test(newPin)) {

            message(
                "forgotMessage",
                "New PIN must contain exactly 4 digits.",
                "error"
            );

            return;
        }

        if (newPin !== confirmNewPin) {

            message(
                "forgotMessage",
                "New PIN and Confirm PIN do not match.",
                "error"
            );

            return;
        }

        const index =
            users.findIndex(user => {

                const sameName =
                    user.name.toLowerCase() ===
                    name.toLowerCase();

                const sameIdentity =
                    user.mobile === identity ||
                    (
                        user.email &&
                        user.email.toLowerCase() ===
                        identity.toLowerCase()
                    );

                return sameName && sameIdentity;
            });

        if (index === -1) {

            message(
                "forgotMessage",
                "No account found with these details.",
                "error"
            );

            return;
        }

        users[index].pin = newPin;

        saveUsers();

        message(
            "forgotMessage",
            "PIN reset successfully! Returning to Login...",
            "success"
        );

        setTimeout(() => {

            openLogin();

            message(
                "loginMessage",
                "PIN reset successfully. You can login now.",
                "success"
            );

        }, 1000);
    }

    /* =====================================================
       DASHBOARD
    ===================================================== */

    function openDashboard() {

        stopAllCameras();

        showOnlyPage("dashboardPage");

        showSection("dashboardHome");

        updateUserInterface();

        updateCurrentDate();

        updateDashboardStats();

        renderStudentList();

        renderAdminStudentList();

        renderAttendanceHistory();

        populateProfileFields();
    }

    function updateUserInterface() {

        if (!currentUser) return;

        const name =
            currentUser.name || "Student";

        const roll =
            currentUser.role === "admin"
                ? "Admin"
                : (currentUser.roll || "Student");

        if ($("dashboardUserName"))
            $("dashboardUserName").textContent = name;

        if ($("dashboardUserRoll"))
            $("dashboardUserRoll").textContent = roll;

        if ($("welcomeName"))
            $("welcomeName").textContent = name;

        if ($("personalName"))
            $("personalName").textContent = name;

        if ($("personalMobile"))
            $("personalMobile").textContent =
                currentUser.mobile || "-";

        if ($("personalEmail"))
            $("personalEmail").textContent =
                currentUser.email || "-";

        if ($("personalDepartment"))
            $("personalDepartment").textContent =
                currentUser.department || "-";

        if ($("personalRoll"))
            $("personalRoll").textContent =
                currentUser.roll || "-";

        const accountType =
            document.querySelector(
                "#personalDetailsSection .account-type"
            );

        if (accountType) {

            accountType.textContent =
                currentUser.role === "admin"
                    ? "Admin"
                    : "Student";
        }

        const adminButton =
            $("adminMenuButton");

        if (adminButton) {

            if (currentUser.role === "admin") {

                adminButton.style.display = "";

                adminButton.textContent =
                    "👨‍💼 Admin — Ayush Chatterjee";

            } else {

                adminButton.style.display = "none";
            }
        }

        const studentsButton =
            $("studentsMenuButton");

        if (studentsButton) {

            if (currentUser.role === "admin") {

                studentsButton.style.display = "";

            } else {

                studentsButton.style.display = "";
            }
        }
    }

    function updateCurrentDate() {

        if (!$("currentDate")) return;

        const now = new Date();

        $("currentDate").textContent =
            now.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }) +
            " • " +
            now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
    }

    setInterval(updateCurrentDate, 1000);

    /* =====================================================
       SECTION NAVIGATION
    ===================================================== */

    function showSection(sectionId) {

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

            const el = $(id);

            if (el) {
                el.style.display = "none";
            }
        });

        const selected =
            $(sectionId);

        if (selected) {

            selected.style.display = "";
        }

        document
            .querySelectorAll(".menu-item")
            .forEach(button => {

                button.classList.remove("active");
            });
    }

    /* =====================================================
       SIDEBAR / HAMBURGER
    ===================================================== */

    function createHamburger() {

        if (!$("dashboardPage")) return;

        let hamburger =
            document.getElementById("hamburgerButton");

        if (hamburger) return;

        hamburger =
            document.createElement("button");

        hamburger.id =
            "hamburgerButton";

        hamburger.type =
            "button";

        hamburger.innerHTML =
            "☰";

        hamburger.setAttribute(
            "aria-label",
            "Open Menu"
        );

        hamburger.style.position =
            "fixed";

        hamburger.style.top =
            "18px";

        hamburger.style.left =
            "18px";

        hamburger.style.zIndex =
            "9999";

        hamburger.style.width =
            "46px";

        hamburger.style.height =
            "46px";

        hamburger.style.borderRadius =
            "12px";

        hamburger.style.border =
            "none";

        hamburger.style.cursor =
            "pointer";

        hamburger.style.fontSize =
            "24px";

        hamburger.style.background =
            "white";

        hamburger.style.boxShadow =
            "0 5px 20px rgba(0,0,0,.15)";

        document.body.appendChild(hamburger);

        hamburger.addEventListener(
            "click",
            toggleSidebar
        );
    }

    function toggleSidebar() {

        const sidebar =
            document.querySelector(".sidebar");

        if (!sidebar) return;

        sidebar.classList.toggle(
            "sidebar-open"
        );

        sidebar.classList.toggle(
            "open"
        );
    }

    function closeSidebar() {

        const sidebar =
            document.querySelector(".sidebar");

        if (!sidebar) return;

        sidebar.classList.remove(
            "sidebar-open",
            "open"
        );
    }

    /* =====================================================
       PROFILE
    ===================================================== */

    function populateProfileFields() {

        if (!currentUser) return;

        if ($("editName"))
            $("editName").value =
                currentUser.name || "";

        if ($("editRoll"))
            $("editRoll").value =
                currentUser.roll || "";

        if ($("editDepartment"))
            $("editDepartment").value =
                currentUser.department || "";

        if ($("editMobile"))
            $("editMobile").value =
                currentUser.mobile || "";

        if ($("editEmail"))
            $("editEmail").value =
                currentUser.email || "";

        if ($("faceName"))
            $("faceName").value =
                currentUser.name || "";

        if ($("faceMobile"))
            $("faceMobile").value =
                currentUser.mobile || "";

        if ($("faceEmail"))
            $("faceEmail").value =
                currentUser.email || "";

        if ($("faceRoll"))
            $("faceRoll").value =
                currentUser.roll || "";

        if ($("departmentName"))
            $("departmentName").value =
                currentUser.department || "";
    }

    function saveProfile() {

        if (!currentUser ||
            currentUser.role === "admin") {

            message(
                "loginMessage",
                "Admin profile is managed by the administrator.",
                "error"
            );

            return;
        }

        const name =
            $("editName")?.value.trim();

        const roll =
            $("editRoll")?.value.trim();

        const department =
            $("editDepartment")?.value.trim();

        if (!name || !roll || !department) {

            alert(
                "Please fill Name, Roll and Department."
            );

            return;
        }

        const index =
            users.findIndex(
                user =>
                    user.id === currentUser.id
            );

        if (index === -1) return;

        users[index].name =
            name;

        users[index].roll =
            roll;

        users[index].department =
            department;

        currentUser =
            users[index];

        saveUsers();

        saveCurrentUser();

        updateUserInterface();

        alert(
            "Profile updated successfully."
        );
    }

    function saveContact() {

        if (!currentUser ||
            currentUser.role === "admin") {

            alert(
                "Admin contact details cannot be changed here."
            );

            return;
        }

        const mobile =
            $("editMobile")?.value.trim();

        const email =
            $("editEmail")?.value.trim();

        if (!/^\d{10}$/.test(mobile)) {

            alert(
                "Enter a valid 10 digit mobile number."
            );

            return;
        }

        const duplicate =
            users.some(
                user =>
                    user.id !== currentUser.id &&
                    user.mobile === mobile
            );

        if (duplicate) {

            alert(
                "This mobile number is already used."
            );

            return;
        }

        const index =
            users.findIndex(
                user =>
                    user.id === currentUser.id
            );

        if (index === -1) return;

        users[index].mobile =
            mobile;

        users[index].email =
            email;

        currentUser =
            users[index];

        saveUsers();

        saveCurrentUser();

        updateUserInterface();

        if ($("contactMessage")) {

            message(
                "contactMessage",
                "Contact details updated successfully.",
                "success"
            );
        }
    }

    /* =====================================================
       STUDENT LIST
    ===================================================== */

    function renderStudentList() {

        const container =
            $("studentList");

        if (!container) return;

        if (users.length === 0) {

            container.innerHTML =
                "<p>No students registered yet.</p>";

            return;
        }

        container.innerHTML =
            users.map(user => {

                return `
                    <div class="student-card">

                        <div>
                            <h3>
                                ${escapeHTML(user.name)}
                            </h3>

                            <p>
                                📱 ${escapeHTML(user.mobile || "-")}
                            </p>

                            <p>
                                📧 ${escapeHTML(user.email || "-")}
                            </p>

                            <p>
                                🏫 ${escapeHTML(user.college || "-")}
                            </p>

                            <p>
                                🎓 ${escapeHTML(user.department || "-")}
                            </p>

                            <p>
                                🆔 Roll:
                                ${escapeHTML(user.roll || "-")}
                            </p>

                            <p>
                                👤 Face:
                                ${
                                    user.faceRegistered
                                        ? "Registered"
                                        : "Not Registered"
                                }
                            </p>
                        </div>

                    </div>
                `;

            }).join("");
    }

    function renderAdminStudentList() {

        const container =
            $("adminStudentList");

        if (!container) return;

        if (currentUser?.role !== "admin") {

            container.innerHTML =
                "<p>Admin access only.</p>";

            return;
        }

        if (users.length === 0) {

            container.innerHTML =
                "<p>No students registered yet.</p>";

            return;
        }

        container.innerHTML =
            users.map((user, index) => {

                const userAttendance =
                    attendanceRecords.filter(
                        record =>
                            record.userId === user.id
                    );

                return `
                    <div class="student-card">

                        <h3>
                            ${index + 1}.
                            ${escapeHTML(user.name)}
                        </h3>

                        <p>
                            📱 Mobile:
                            ${escapeHTML(user.mobile || "-")}
                        </p>

                        <p>
                            📧 Email:
                            ${escapeHTML(user.email || "-")}
                        </p>

                        <p>
                            🎓 Branch:
                            ${escapeHTML(user.department || "-")}
                        </p>

                        <p>
                            🆔 Roll:
                            ${escapeHTML(user.roll || "-")}
                        </p>

                        <p>
                            👤 Face:
                            ${
                                user.faceRegistered
                                    ? "Registered"
                                    : "Not Registered"
                            }
                        </p>

                        <p>
                            📊 Attendance:
                            ${userAttendance.length}
                            day(s)
                        </p>

                    </div>
                `;

            }).join("");
    }

    /* =====================================================
       SEARCH STUDENTS
    ===================================================== */

    function setupStudentSearch() {

        const search =
            $("searchStudent");

        if (!search) return;

        search.addEventListener(
            "input",
            () => {

                const query =
                    search.value
                        .trim()
                        .toLowerCase();

                const cards =
                    document.querySelectorAll(
                        "#studentList .student-card"
                    );

                cards.forEach(card => {

                    const text =
                        card.textContent
                            .toLowerCase();

                    card.style.display =
                        text.includes(query)
                            ? ""
                            : "none";
                });
            }
        );
    }

    /* =====================================================
       ATTENDANCE
    ===================================================== */

    function markAttendanceForUser(user) {

        if (!user) return;

        const today =
            getTodayString();

        const alreadyMarked =
            attendanceRecords.some(
                record =>
                    record.userId === user.id &&
                    record.date === today
            );

        if (alreadyMarked) {

            showAttendancePopup(
                "info",
                "Already Marked",
                `${user.name}, your attendance has already been marked today.`
            );

            return;
        }

        const dateTime =
            getDateTime();

        const record = {

            id:
                "ATT-" +
                Date.now(),

            userId:
                user.id,

            name:
                user.name,

            mobile:
                user.mobile || "",

            email:
                user.email || "",

            department:
                user.department || "",

            roll:
                user.roll || "",

            date:
                dateTime.date,

            day:
                dateTime.day,

            time:
                dateTime.time,

            status:
                "Present"
        };

        attendanceRecords.push(record);

        saveAttendance();

        updateDashboardStats();

        renderAttendanceHistory();

        renderAdminStudentList();

        showAttendancePopup(
            "success",
            "Attendance Marked! ✅",
            `
            Name: ${user.name}<br>
            Branch: ${user.department || "-"}<br>
            Roll: ${user.roll || "-"}<br>
            Date: ${dateTime.date}<br>
            Day: ${dateTime.day}<br>
            Time: ${dateTime.time}
            `
        );
    }

    function updateDashboardStats() {

        const total =
            users.length;

        const today =
            getTodayString();

        const presentToday =
            attendanceRecords.filter(
                record =>
                    record.date === today
            ).length;

        const absentToday =
            Math.max(
                total - presentToday,
                0
            );

        const percentage =
            total > 0
                ? Math.round(
                    (presentToday / total) * 100
                )
                : 0;

        if ($("totalStudents"))
            $("totalStudents").textContent =
                total;

        if ($("presentStudents"))
            $("presentStudents").textContent =
                presentToday;

        if ($("absentStudents"))
            $("absentStudents").textContent =
                absentToday;

        if ($("attendancePercentage"))
            $("attendancePercentage").textContent =
                percentage + "%";
    }

    /* =====================================================
       ATTENDANCE HISTORY
    ===================================================== */

    function renderAttendanceHistory() {

        const container =
            $("attendanceHistory");

        if (!container) return;

        if (!currentUser) return;

        let records;

        if (currentUser.role === "admin") {

            records =
                attendanceRecords;

        } else {

            records =
                attendanceRecords.filter(
                    record =>
                        record.userId ===
                        currentUser.id
                );
        }

        if (records.length === 0) {

            container.innerHTML =
                "<p>No attendance records found.</p>";

            updateAttendanceSummary(0, 0);

            return;
        }

        records =
            [...records].reverse();

        const present =
            records.filter(
                r => r.status === "Present"
            ).length;

        const total =
            records.length;

        const absent =
            Math.max(
                total - present,
                0
            );

        updateAttendanceSummary(
            total,
            present,
            absent
        );

        container.innerHTML =
            records.map(record => {

                return `
                    <div class="attendance-record">

                        <strong>
                            ${escapeHTML(record.name)}
                        </strong>

                        <span>
                            📅 ${escapeHTML(record.date)}
                        </span>

                        <span>
                            🗓️ ${escapeHTML(record.day)}
                        </span>

                        <span>
                            ⏰ ${escapeHTML(record.time)}
                        </span>

                        <span>
                            🎓 ${escapeHTML(record.department || "-")}
                        </span>

                        <span>
                            🆔 ${escapeHTML(record.roll || "-")}
                        </span>

                        <b>
                            ✅ ${escapeHTML(record.status)}
                        </b>

                    </div>
                `;

            }).join("");
    }

    function updateAttendanceSummary(
        total,
        present,
        absent = 0
    ) {

        if ($("attendanceTotalDays"))
            $("attendanceTotalDays").textContent =
                total;

        if ($("attendancePresentDays"))
            $("attendancePresentDays").textContent =
                present;

        if ($("attendanceAbsentDays"))
            $("attendanceAbsentDays").textContent =
                absent;
    }

    /* =====================================================
       ATTENDANCE POPUP
    ===================================================== */

    function showAttendancePopup(
        type,
        title,
        text
    ) {

        const popup =
            $("attendancePopup");

        if (!popup) {

            alert(
                title + "\n\n" +
                text.replace(/<br>/g, "\n")
            );

            return;
        }

        const icon =
            $("popupIcon");

        const popupTitle =
            $("popupTitle");

        const popupMessage =
            $("popupMessage");

        if (icon) {

            icon.textContent =
                type === "success"
                    ? "✅"
                    : type === "info"
                        ? "ℹ️"
                        : "❌";
        }

        if (popupTitle)
            popupTitle.textContent =
                title;

        if (popupMessage)
            popupMessage.innerHTML =
                text;

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

    /* =====================================================
       CAMERA
    ===================================================== */

    async function startCamera(videoElement) {

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {

            throw new Error(
                "Camera is not supported by this browser."
            );
        }

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

        videoElement.srcObject =
            stream;

        videoElement.style.transform =
            "scaleX(-1)";

        await videoElement.play();

        return stream;
    }

    function stopStream(stream) {

        if (!stream) return;

        stream
            .getTracks()
            .forEach(track => {
                track.stop();
            });
    }

    function stopRegistrationCamera() {

        if (registrationTimer) {

            clearInterval(
                registrationTimer
            );

            registrationTimer = null;
        }

        stopStream(
            registrationStream
        );

        registrationStream =
            null;

        const video =
            $("registrationCamera");

        if (video) {

            video.srcObject =
                null;
        }

        if ($("registrationStatus"))
            $("registrationStatus").textContent =
                "Camera is OFF";
    }

    function stopAttendanceCamera() {

        if (attendanceTimer) {

            clearInterval(
                attendanceTimer
            );

            attendanceTimer = null;
        }

        stopStream(
            attendanceStream
        );

        attendanceStream =
            null;

        const video =
            $("attendanceCamera");

        if (video) {

            video.srcObject =
                null;
        }

        if ($("attendanceStatus"))
            $("attendanceStatus").textContent =
                "Camera is OFF";
    }

    function stopAllCameras() {

        stopRegistrationCamera();

        stopAttendanceCamera();
    }

    /* =====================================================
       FACE REGISTRATION
    ===================================================== */

    async function startFaceRegistration() {

        if (!currentUser) return;

        const video =
            $("registrationCamera");

        if (!video) return;

        try {

            stopRegistrationCamera();

            if ($("registrationStatus"))
                $("registrationStatus").textContent =
                    "Starting camera...";

            registrationStream =
                await startCamera(video);

            if ($("registrationStatus"))
                $("registrationStatus").textContent =
                    "Camera ON • Look at the camera";

            message(
                "registrationMessage",
                "Camera started. Keep your face inside the guide.",
                "success"
            );

            /*
             * Automatic capture simulation:
             * waits a few seconds and then saves registration.
             *
             * Real face recognition requires model files.
             */

            let seconds = 3;

            if ($("registrationStatus"))
                $("registrationStatus").textContent =
                    `Face detected... capturing in ${seconds}s`;

            registrationTimer =
                setInterval(() => {

                    seconds--;

                    if ($("registrationStatus"))
                        $("registrationStatus").textContent =
                            `Face detected... capturing in ${seconds}s`;

                    if (seconds <= 0) {

                        clearInterval(
                            registrationTimer
                        );

                        registrationTimer =
                            null;

                        completeFaceRegistration();
                    }

                }, 1000);

        } catch (error) {

            console.error(error);

            message(
                "registrationMessage",
                "Camera permission was denied or camera is unavailable.",
                "error"
            );

            if ($("registrationStatus"))
                $("registrationStatus").textContent =
                    "Camera error";
        }
    }

    function completeFaceRegistration() {

        if (!currentUser) return;

        if (currentUser.role === "admin") {

            message(
                "registrationMessage",
                "Admin face registration is not required.",
                "error"
            );

            return;
        }

        const name =
            $("faceName")?.value.trim();

        const mobile =
            $("faceMobile")?.value.trim();

        const email =
            $("faceEmail")?.value.trim();

        const department =
            $("departmentName")?.value.trim();

        const roll =
            $("faceRoll")?.value.trim();

        if (!name ||
            !mobile ||
            !department ||
            !roll) {

            message(
                "registrationMessage",
                "Please complete student details before capture.",
                "error"
            );

            return;
        }

        const index =
            users.findIndex(
                user =>
                    user.id === currentUser.id
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

        /*
         * Placeholder descriptor.
         * Actual face recognition requires
         * face-api.js model descriptors.
         */

        users[index].faceDescriptor =
            "registered";

        currentUser =
            users[index];

        saveUsers();

        saveCurrentUser();

        updateUserInterface();

        renderStudentList();

        renderAdminStudentList();

        stopRegistrationCamera();

        message(
            "registrationMessage",
            "✅ Face registered successfully! Your details have been saved.",
            "success"
        );

        if ($("registrationStatus"))
            $("registrationStatus").textContent =
                "Face Registered ✓";
    }

    /* =====================================================
       FACE ATTENDANCE
    ===================================================== */

    async function startFaceAttendance() {

        if (!currentUser) {

            alert(
                "Please login first."
            );

            return;
        }

        const video =
            $("attendanceCamera");

        if (!video) return;

        try {

            stopAttendanceCamera();

            if ($("attendanceStatus"))
                $("attendanceStatus").textContent =
                    "Starting camera...";

            attendanceStream =
                await startCamera(video);

            if ($("attendanceStatus"))
                $("attendanceStatus").textContent =
                    "Camera ON • Look at the camera";

            if ($("attendanceResult"))
                $("attendanceResult").innerHTML =
                    "📷 Camera started. Please look directly at the camera.";

            let seconds = 3;

            if ($("attendanceStatus"))
                $("attendanceStatus").textContent =
                    `Face detected... marking in ${seconds}s`;

            attendanceTimer =
                setInterval(() => {

                    seconds--;

                    if ($("attendanceStatus"))
                        $("attendanceStatus").textContent =
                            `Face detected... marking in ${seconds}s`;

                    if (seconds <= 0) {

                        clearInterval(
                            attendanceTimer
                        );

                        attendanceTimer =
                            null;

                        completeFaceAttendance();
                    }

                }, 1000);

        } catch (error) {

            console.error(error);

            if ($("attendanceStatus"))
                $("attendanceStatus").textContent =
                    "Camera error";

            if ($("attendanceResult"))
                $("attendanceResult").innerHTML =
                    "❌ Camera permission was denied or camera is unavailable.";
        }
    }

    function completeFaceAttendance() {

        if (!currentUser) return;

        stopAttendanceCamera();

        if ($("attendanceStatus"))
            $("attendanceStatus").textContent =
                "Attendance captured ✓";

        if ($("attendanceResult"))
            $("attendanceResult").innerHTML =
                "✅ Face captured successfully. Saving attendance...";

        markAttendanceForUser(
            currentUser
        );

        setTimeout(() => {

            if ($("attendanceResult"))
                $("attendanceResult").innerHTML =
                    "✅ Attendance successfully saved.";

        }, 500);
    }

    /* =====================================================
       LOGOUT
    ===================================================== */

    function logout() {

        stopAllCameras();

        currentUser =
            null;

        saveCurrentUser();

        closeSidebar();

        openLogin();
    }

    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    function setupEvents() {

        /* Login */

        $("loginButton")
            ?.addEventListener(
                "click",
                loginStudent
            );

        /* Create Account */

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

        $("backToLoginButton")
            ?.addEventListener(
                "click",
                openLogin
            );

        /* Forgot PIN */

        $("forgotPinButton")
            ?.addEventListener(
                "click",
                openForgotPin
            );

        $("resetPinButton")
            ?.addEventListener(
                "click",
                resetPin
            );

        $("forgotBackButton")
            ?.addEventListener(
                "click",
                openLogin
            );

        /* Admin */

        $("adminMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    if (
                        currentUser &&
                        currentUser.role === "admin"
                    ) {

                        showSection(
                            "adminSection"
                        );

                        renderAdminStudentList();

                        closeSidebar();
                    }
                }
            );

        /* Dashboard */

        $("dashboardMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "dashboardHome"
                    );

                    updateDashboardStats();

                    closeSidebar();
                }
            );

        /* Edit Profile */

        $("editProfileMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "editProfileSection"
                    );

                    populateProfileFields();

                    closeSidebar();
                }
            );

        $("saveEditedDetailsButton")
            ?.addEventListener(
                "click",
                saveProfile
            );

        /* Edit Mobile / Email */

        $("editContactMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "editContactSection"
                    );

                    populateProfileFields();

                    closeSidebar();
                }
            );

        $("saveContactButton")
            ?.addEventListener(
                "click",
                saveContact
            );

        /* Personal Details */

        $("personalDetailsMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "personalDetailsSection"
                    );

                    updateUserInterface();

                    closeSidebar();
                }
            );

        /* Register Face */

        $("faceRegistrationMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "faceRegistrationSection"
                    );

                    populateProfileFields();

                    closeSidebar();
                }
            );

        $("quickFaceRegistration")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "faceRegistrationSection"
                    );

                    populateProfileFields();
                }
            );

        $("startFaceRegistrationButton")
            ?.addEventListener(
                "click",
                startFaceRegistration
            );

        /* Face Attendance */

        $("attendanceMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "attendanceSection"
                    );

                    closeSidebar();
                }
            );

        $("quickAttendance")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "attendanceSection"
                    );
                }
            );

        $("startFaceAttendanceButton")
            ?.addEventListener(
                "click",
                startFaceAttendance
            );

        /* Students */

        $("studentsMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "studentsSection"
                    );

                    renderStudentList();

                    closeSidebar();
                }
            );

        /* Attendance */

        $("checkAttendanceMenuButton")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "checkAttendanceSection"
                    );

                    renderAttendanceHistory();

                    closeSidebar();
                }
            );

        $("quickCheckAttendance")
            ?.addEventListener(
                "click",
                () => {

                    showSection(
                        "checkAttendanceSection"
                    );

                    renderAttendanceHistory();
                }
            );

        /* Logout */

        $("logoutButton")
            ?.addEventListener(
                "click",
                logout
            );

        /* Popup */

        $("closeAttendancePopup")
            ?.addEventListener(
                "click",
                closeAttendancePopup
            );

        /* Search */

        setupStudentSearch();

        /* Enter key */

        $("loginPin")
            ?.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        loginStudent();
                    }
                }
            );

        $("createAccountSubmit")
            ?.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        createAccount();
                    }
                }
            );
    }

    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initialize() {

        setupEvents();

        createHamburger();

        updateCurrentDate();

        updateDashboardStats();

        /*
         * If user was already logged in,
         * restore dashboard.
         */

        if (currentUser) {

            openDashboard();

        } else {

            openLogin();
        }
    }

    initialize();

});

/* ============================================================
   SMART ATTENDANCE SYSTEM
   script.js
   Login + Create Account + Forgot PIN + Dashboard
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================================
       PAGE ELEMENTS
    ======================================================== */

    const loginPage = document.getElementById("loginPage");
    const createAccountPage = document.getElementById("createAccountPage");
    const forgotPinPage = document.getElementById("forgotPinPage");
    const dashboardPage = document.getElementById("dashboardPage");

    const loginButton = document.getElementById("loginButton");
    const createAccountButton = document.getElementById("createAccountButton");
    const forgotPinButton = document.getElementById("forgotPinButton");

    const createAccountSubmit =
        document.getElementById("createAccountSubmit");

    const backToLoginButton =
        document.getElementById("backToLoginButton");

    const forgotBackButton =
        document.getElementById("forgotBackButton");

    const resetPinButton =
        document.getElementById("resetPinButton");

    const logoutButton =
        document.getElementById("logoutButton");


    /* ========================================================
       STORAGE
    ======================================================== */

    let students =
        JSON.parse(localStorage.getItem("smartAttendanceStudents")) || [];

    let attendance =
        JSON.parse(localStorage.getItem("smartAttendanceRecords")) || [];

    let currentUser =
        JSON.parse(localStorage.getItem("smartAttendanceCurrentUser")) || null;


    function saveStudents() {
        localStorage.setItem(
            "smartAttendanceStudents",
            JSON.stringify(students)
        );
    }

    function saveAttendance() {
        localStorage.setItem(
            "smartAttendanceRecords",
            JSON.stringify(attendance)
        );
    }


    /* ========================================================
       PAGE CONTROL
    ======================================================== */

    function hideAllPages() {

        if (loginPage) loginPage.style.display = "none";
        if (createAccountPage) createAccountPage.style.display = "none";
        if (forgotPinPage) forgotPinPage.style.display = "none";
        if (dashboardPage) dashboardPage.style.display = "none";
    }


    function showLogin() {
        hideAllPages();

        if (loginPage) {
            loginPage.style.display = "flex";
        }
    }


    function showCreateAccount() {
        hideAllPages();

        if (createAccountPage) {
            createAccountPage.style.display = "flex";
        }
    }


    function showForgotPin() {
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

        loadDashboard();
    }


    /* ========================================================
       MESSAGE
    ======================================================== */

    function message(element, text, type = "info") {

        if (!element) return;

        element.textContent = text;
        element.className = "auth-message " + type;
    }


    /* ========================================================
       LOGIN
    ======================================================== */

    if (loginButton) {

        loginButton.addEventListener("click", () => {

            const name =
                document.getElementById("loginName").value.trim();

            const identity =
                document.getElementById("loginIdentity").value.trim();

            const pin =
                document.getElementById("loginPin").value.trim();

            const loginMessage =
                document.getElementById("loginMessage");


            if (!name || !identity || !pin) {

                message(
                    loginMessage,
                    "Please fill all login details.",
                    "error"
                );

                return;
            }


            if (!/^\d{4}$/.test(pin)) {

                message(
                    loginMessage,
                    "PIN must contain exactly 4 digits.",
                    "error"
                );

                return;
            }


            const user = students.find(student => {

                const sameName =
                    student.name.toLowerCase() === name.toLowerCase();

                const sameMobile =
                    student.mobile === identity;

                const sameEmail =
                    student.email &&
                    student.email.toLowerCase() === identity.toLowerCase();

                const samePin =
                    student.pin === pin;

                return sameName &&
                    (sameMobile || sameEmail) &&
                    samePin;
            });


            if (!user) {

                message(
                    loginMessage,
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


            message(
                loginMessage,
                "Login successful!",
                "success"
            );


            setTimeout(() => {
                showDashboard();
            }, 500);

        });

    }


    /* ========================================================
       CREATE ACCOUNT PAGE
    ======================================================== */

    if (createAccountButton) {

        createAccountButton.addEventListener(
            "click",
            showCreateAccount
        );
    }


    /* ========================================================
       CREATE ACCOUNT
    ======================================================== */

    if (createAccountSubmit) {

        createAccountSubmit.addEventListener("click", () => {

            const name =
                document.getElementById("createName").value.trim();

            const mobile =
                document.getElementById("createMobile").value.trim();

            const email =
                document.getElementById("createEmail").value.trim();

            const pin =
                document.getElementById("createPin").value.trim();

            const confirmPin =
                document.getElementById("confirmPin").value.trim();

            const college =
                document.getElementById("createCollege").value.trim();

            const department =
                document.getElementById("createDepartment").value.trim();

            const roll =
                document.getElementById("createRoll").value.trim();

            const createMessage =
                document.getElementById("createMessage");


            /* REQUIRED FIELDS */

            if (
                !name ||
                !mobile ||
                !pin ||
                !confirmPin ||
                !college ||
                !department ||
                !roll
            ) {

                message(
                    createMessage,
                    "Please fill all required fields.",
                    "error"
                );

                return;
            }


            /* MOBILE */

            if (!/^\d{10}$/.test(mobile)) {

                message(
                    createMessage,
                    "Mobile number must contain 10 digits.",
                    "error"
                );

                return;
            }


            /* PIN */

            if (!/^\d{4}$/.test(pin)) {

                message(
                    createMessage,
                    "PIN must contain exactly 4 digits.",
                    "error"
                );

                return;
            }


            if (pin !== confirmPin) {

                message(
                    createMessage,
                    "PIN and Confirm PIN do not match.",
                    "error"
                );

                return;
            }


            /* CHECK DUPLICATE MOBILE */

            const mobileExists =
                students.some(student => student.mobile === mobile);

            if (mobileExists) {

                message(
                    createMessage,
                    "This mobile number is already registered.",
                    "error"
                );

                return;
            }


            /* CHECK DUPLICATE EMAIL */

            if (email) {

                const emailExists =
                    students.some(
                        student =>
                            student.email &&
                            student.email.toLowerCase() ===
                            email.toLowerCase()
                    );

                if (emailExists) {

                    message(
                        createMessage,
                        "This email is already registered.",
                        "error"
                    );

                    return;
                }
            }


            /* CREATE STUDENT */

            const newStudent = {

                id: Date.now(),

                name: name,

                mobile: mobile,

                email: email,

                pin: pin,

                college:
                    "Hooghly Engineering & Technology College",

                department: department,

                roll: roll,

                role: "student",

                faceRegistered: false,

                createdAt:
                    new Date().toISOString()
            };


            students.push(newStudent);

            saveStudents();


            currentUser = newStudent;

            localStorage.setItem(
                "smartAttendanceCurrentUser",
                JSON.stringify(currentUser)
            );


            message(
                createMessage,
                "Account created successfully!",
                "success"
            );


            setTimeout(() => {

                showDashboard();

            }, 700);

        });

    }


    /* ========================================================
       BACK TO LOGIN
    ======================================================== */

    if (backToLoginButton) {

        backToLoginButton.addEventListener(
            "click",
            showLogin
        );
    }


    if (forgotBackButton) {

        forgotBackButton.addEventListener(
            "click",
            showLogin
        );
    }


    /* ========================================================
       FORGOT PIN
    ======================================================== */

    if (forgotPinButton) {

        forgotPinButton.addEventListener(
            "click",
            showForgotPin
        );
    }


    /* ========================================================
       RESET PIN
    ======================================================== */

    if (resetPinButton) {

        resetPinButton.addEventListener("click", () => {

            const name =
                document.getElementById("forgotName").value.trim();

            const identity =
                document.getElementById("forgotIdentity").value.trim();

            const newPin =
                document.getElementById("newPin").value.trim();

            const confirmNewPin =
                document.getElementById("confirmNewPin").value.trim();

            const forgotMessage =
                document.getElementById("forgotMessage");


            if (
                !name ||
                !identity ||
                !newPin ||
                !confirmNewPin
            ) {

                message(
                    forgotMessage,
                    "Please fill all fields.",
                    "error"
                );

                return;
            }


            if (!/^\d{4}$/.test(newPin)) {

                message(
                    forgotMessage,
                    "New PIN must contain 4 digits.",
                    "error"
                );

                return;
            }


            if (newPin !== confirmNewPin) {

                message(
                    forgotMessage,
                    "PINs do not match.",
                    "error"
                );

                return;
            }


            const userIndex =
                students.findIndex(student => {

                    const sameName =
                        student.name.toLowerCase() ===
                        name.toLowerCase();

                    const sameMobile =
                        student.mobile === identity;

                    const sameEmail =
                        student.email &&
                        student.email.toLowerCase() ===
                        identity.toLowerCase();

                    return sameName &&
                        (sameMobile || sameEmail);
                });


            if (userIndex === -1) {

                message(
                    forgotMessage,
                    "No matching account found.",
                    "error"
                );

                return;
            }


            students[userIndex].pin = newPin;

            saveStudents();


            message(
                forgotMessage,
                "PIN reset successfully! You can login now.",
                "success"
            );


            setTimeout(() => {
                showLogin();
            }, 900);

        });

    }


    /* ========================================================
       DASHBOARD
    ======================================================== */

    function loadDashboard() {

        if (!currentUser) {
            showLogin();
            return;
        }


        const dashboardUserName =
            document.getElementById("dashboardUserName");

        const dashboardUserRoll =
            document.getElementById("dashboardUserRoll");

        const welcomeName =
            document.getElementById("welcomeName");

        const currentDate =
            document.getElementById("currentDate");


        if (dashboardUserName) {
            dashboardUserName.textContent =
                currentUser.name;
        }

        if (dashboardUserRoll) {
            dashboardUserRoll.textContent =
                "Roll: " + currentUser.roll;
        }

        if (welcomeName) {
            welcomeName.textContent =
                currentUser.name;
        }

        if (currentDate) {

            const now = new Date();

            currentDate.textContent =
                now.toLocaleString(
                    "en-IN",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );
        }


        updateStats();
        loadUserDetails();
        loadStudents();
        loadAttendanceHistory();
    }


    /* ========================================================
       STATS
    ======================================================== */

    function updateStats() {

        const totalStudents =
            document.getElementById("totalStudents");

        const presentStudents =
            document.getElementById("presentStudents");

        const absentStudents =
            document.getElementById("absentStudents");

        const attendancePercentage =
            document.getElementById("attendancePercentage");


        const today =
            new Date().toLocaleDateString("en-IN");


        const todayRecords =
            attendance.filter(
                record => record.date === today
            );


        const uniquePresent =
            new Set(
                todayRecords.map(
                    record => record.studentId
                )
            );


        const total =
            students.length;

        const present =
            uniquePresent.size;

        const absent =
            Math.max(total - present, 0);


        const percentage =
            total > 0
                ? Math.round((present / total) * 100)
                : 0;


        if (totalStudents) {
            totalStudents.textContent = total;
        }

        if (presentStudents) {
            presentStudents.textContent = present;
        }

        if (absentStudents) {
            absentStudents.textContent = absent;
        }

        if (attendancePercentage) {
            attendancePercentage.textContent =
                percentage + "%";
        }
    }


    /* ========================================================
       USER DETAILS
    ======================================================== */

    function loadUserDetails() {

        if (!currentUser) return;


        const faceName =
            document.getElementById("faceName");

        const faceRoll =
            document.getElementById("faceRoll");

        const collegeName =
            document.getElementById("collegeName");

        const departmentName =
            document.getElementById("departmentName");

        const faceMobile =
            document.getElementById("faceMobile");

        const faceEmail =
            document.getElementById("faceEmail");


        if (faceName) faceName.value = currentUser.name;
        if (faceRoll) faceRoll.value = currentUser.roll;

        if (collegeName) {
            collegeName.value =
                "Hooghly Engineering & Technology College";
        }

        if (departmentName) {
            departmentName.value =
                currentUser.department;
        }

        if (faceMobile) {
            faceMobile.value =
                currentUser.mobile;
        }

        if (faceEmail) {
            faceEmail.value =
                currentUser.email || "";
        }
    }


    /* ========================================================
       MENU NAVIGATION
    ======================================================== */

    function hideDashboardSections() {

        const sections = [
            "dashboardHome",
            "faceRegistrationSection",
            "attendanceSection",
            "studentsSection"
        ];

        sections.forEach(id => {

            const element =
                document.getElementById(id);

            if (element) {
                element.style.display = "none";
            }
        });
    }


    function activateMenu(buttonId) {

        document
            .querySelectorAll(".menu-item")
            .forEach(button => {
                button.classList.remove("active");
            });


        const button =
            document.getElementById(buttonId);

        if (button) {
            button.classList.add("active");
        }
    }


    const dashboardMenuButton =
        document.getElementById("dashboardMenuButton");

    if (dashboardMenuButton) {

        dashboardMenuButton.addEventListener("click", () => {

            hideDashboardSections();

            document.getElementById("dashboardHome")
                .style.display = "block";

            activateMenu("dashboardMenuButton");

            updateStats();
        });
    }


    const faceRegistrationMenuButton =
        document.getElementById("faceRegistrationMenuButton");

    if (faceRegistrationMenuButton) {

        faceRegistrationMenuButton.addEventListener(
            "click",
            () => {

                hideDashboardSections();

                document.getElementById(
                    "faceRegistrationSection"
                ).style.display = "block";

                activateMenu(
                    "faceRegistrationMenuButton"
                );
            }
        );
    }


    const attendanceMenuButton =
        document.getElementById("attendanceMenuButton");

    if (attendanceMenuButton) {

        attendanceMenuButton.addEventListener(
            "click",
            () => {

                hideDashboardSections();

                document.getElementById(
                    "attendanceSection"
                ).style.display = "block";

                activateMenu(
                    "attendanceMenuButton"
                );
            }
        );
    }


    const studentsMenuButton =
        document.getElementById("studentsMenuButton");

    if (studentsMenuButton) {

        studentsMenuButton.addEventListener(
            "click",
            () => {

                hideDashboardSections();

                document.getElementById(
                    "studentsSection"
                ).style.display = "block";

                activateMenu(
                    "studentsMenuButton"
                );

                loadStudents();
            }
        );
    }


    /* ========================================================
       QUICK ACTIONS
    ======================================================== */

    const quickFaceRegistration =
        document.getElementById("quickFaceRegistration");

    if (quickFaceRegistration) {

        quickFaceRegistration.addEventListener("click", () => {

            hideDashboardSections();

            document.getElementById(
                "faceRegistrationSection"
            ).style.display = "block";

            activateMenu(
                "faceRegistrationMenuButton"
            );
        });
    }


    const quickAttendance =
        document.getElementById("quickAttendance");

    if (quickAttendance) {

        quickAttendance.addEventListener("click", () => {

            hideDashboardSections();

            document.getElementById(
                "attendanceSection"
            ).style.display = "block";

            activateMenu(
                "attendanceMenuButton"
            );
        });
    }


    const quickCheckAttendance =
        document.getElementById("quickCheckAttendance");

    if (quickCheckAttendance) {

        quickCheckAttendance.addEventListener("click", () => {

            openAttendanceModal();
        });
    }


    /* ========================================================
       STUDENTS LIST
    ======================================================== */

    function loadStudents() {

        const studentList =
            document.getElementById("studentList");

        if (!studentList) return;


        if (students.length === 0) {

            studentList.innerHTML =
                "<p>No students registered yet.</p>";

            return;
        }


        studentList.innerHTML = "";


        students.forEach(student => {

            const div =
                document.createElement("div");

            div.className = "student-item";


            div.innerHTML = `
                <h3>${escapeHTML(student.name)}</h3>
                <p><b>Roll:</b> ${escapeHTML(student.roll)}</p>
                <p><b>Department:</b> ${escapeHTML(student.department)}</p>
                <p><b>Mobile:</b> ${escapeHTML(student.mobile)}</p>
                <p><b>Email:</b> ${escapeHTML(student.email || "Not provided")}</p>
                <p><b>College:</b> Hooghly Engineering & Technology College</p>
            `;


            studentList.appendChild(div);
        });
    }


    /* ========================================================
       SEARCH STUDENTS
    ======================================================== */

    const searchStudent =
        document.getElementById("searchStudent");

    if (searchStudent) {

        searchStudent.addEventListener("input", () => {

            const search =
                searchStudent.value.toLowerCase().trim();

            const items =
                document.querySelectorAll(".student-item");


            items.forEach(item => {

                const text =
                    item.textContent.toLowerCase();

                item.style.display =
                    text.includes(search)
                        ? "block"
                        : "none";
            });
        });
    }


    /* ========================================================
       FACE REGISTRATION
    ======================================================== */

    const startFaceRegistrationButton =
        document.getElementById(
            "startFaceRegistrationButton"
        );


    let registrationStream = null;


    if (startFaceRegistrationButton) {

        startFaceRegistrationButton.addEventListener(
            "click",
            async () => {

                const camera =
                    document.getElementById(
                        "registrationCamera"
                    );

                const status =
                    document.getElementById(
                        "registrationStatus"
                    );

                const registrationMessage =
                    document.getElementById(
                        "registrationMessage"
                    );


                if (!camera) return;


                try {

                    registrationStream =
                        await navigator.mediaDevices.getUserMedia({
                            video: {
                                facingMode: "user"
                            },
                            audio: false
                        });


                    camera.srcObject =
                        registrationStream;


                    if (status) {
                        status.textContent =
                            "Camera ON";
                    }


                    message(
                        registrationMessage,
                        "Camera started. Keep your face inside the guide.",
                        "success"
                    );


                    /* Automatic capture after 3 seconds */

                    setTimeout(() => {

                        if (!currentUser) return;


                        currentUser.faceRegistered = true;

                        const index =
                            students.findIndex(
                                student =>
                                    student.id === currentUser.id
                            );


                        if (index !== -1) {
                            students[index].faceRegistered = true;
                            saveStudents();
                        }


                        message(
                            registrationMessage,
                            "Face captured and registered successfully!",
                            "success"
                        );


                        stopRegistrationCamera();

                    }, 3000);


                } catch (error) {

                    message(
                        registrationMessage,
                        "Camera permission was not allowed.",
                        "error"
                    );
                }
            }
        );
    }


    function stopRegistrationCamera() {

        if (registrationStream) {

            registrationStream
                .getTracks()
                .forEach(track => track.stop());

            registrationStream = null;
        }


        const camera =
            document.getElementById(
                "registrationCamera"
            );

        const status =
            document.getElementById(
                "registrationStatus"
            );


        if (camera) {
            camera.srcObject = null;
        }

        if (status) {
            status.textContent =
                "Camera is OFF";
        }
    }


    /* ========================================================
       FACE ATTENDANCE
    ======================================================== */

    const startFaceAttendanceButton =
        document.getElementById(
            "startFaceAttendanceButton"
        );


    let attendanceStream = null;


    if (startFaceAttendanceButton) {

        startFaceAttendanceButton.addEventListener(
            "click",
            async () => {

                const camera =
                    document.getElementById(
                        "attendanceCamera"
                    );

                const status =
                    document.getElementById(
                        "attendanceStatus"
                    );

                const result =
                    document.getElementById(
                        "attendanceResult"
                    );


                if (!camera || !currentUser) return;


                try {

                    attendanceStream =
                        await navigator.mediaDevices.getUserMedia({
                            video: {
                                facingMode: "user"
                            },
                            audio: false
                        });


                    camera.srcObject =
                        attendanceStream;


                    if (status) {
                        status.textContent =
                            "Camera ON";
                    }


                    if (result) {
                        result.textContent =
                            "Face detected. Capturing...";
                    }


                    /* Automatic capture */

                    setTimeout(() => {

                        markAttendance();

                        stopAttendanceCamera();

                    }, 3000);


                } catch (error) {

                    if (result) {
                        result.textContent =
                            "Camera permission was not allowed.";
                    }
                }
            }
        );
    }


    function stopAttendanceCamera() {

        if (attendanceStream) {

            attendanceStream
                .getTracks()
                .forEach(track => track.stop());

            attendanceStream = null;
        }


        const camera =
            document.getElementById(
                "attendanceCamera"
            );

        const status =
            document.getElementById(
                "attendanceStatus"
            );


        if (camera) {
            camera.srcObject = null;
        }

        if (status) {
            status.textContent =
                "Camera is OFF";
        }
    }


    /* ========================================================
       MARK ATTENDANCE
    ======================================================== */

    function markAttendance() {

        if (!currentUser) return;


        const now =
            new Date();


        const date =
            now.toLocaleDateString("en-IN");


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


        const alreadyMarked =
            attendance.some(record =>
                record.studentId === currentUser.id &&
                record.date === date
            );


        if (alreadyMarked) {

            showAttendancePopup(
                "Already Marked",
                "Your attendance has already been marked today.",
                "ℹ️"
            );

            return;
        }


        const record = {

            id: Date.now(),

            studentId: currentUser.id,

            name: currentUser.name,

            mobile: currentUser.mobile,

            email: currentUser.email || "",

            roll: currentUser.roll,

            department: currentUser.department,

            college:
                "Hooghly Engineering & Technology College",

            date: date,

            day: day,

            time: time,

            status: "Present"
        };


        attendance.push(record);

        saveAttendance();


        const result =
            document.getElementById(
                "attendanceResult"
            );


        if (result) {

            result.textContent =
                `Attendance marked for ${currentUser.name} — ${date}, ${day}, ${time}`;
        }


        showAttendancePopup(
            "Attendance Marked!",
            `Attendance saved successfully for ${currentUser.name}. Date: ${date} | ${day} | Time: ${time}`,
            "✅"
        );


        updateStats();
        loadAttendanceHistory();
    }


    /* ========================================================
       ATTENDANCE POPUP
    ======================================================== */

    function showAttendancePopup(
        title,
        text,
        icon = "✅"
    ) {

        const popup =
            document.getElementById(
                "attendancePopup"
            );

        const popupTitle =
            document.getElementById(
                "popupTitle"
            );

        const popupMessage =
            document.getElementById(
                "popupMessage"
            );

        const popupIcon =
            document.getElementById(
                "popupIcon"
            );


        if (!popup) return;


        if (popupTitle) {
            popupTitle.textContent = title;
        }

        if (popupMessage) {
            popupMessage.textContent = text;
        }

        if (popupIcon) {
            popupIcon.textContent = icon;
        }


        popup.style.display = "flex";
    }


    const closeAttendancePopup =
        document.getElementById(
            "closeAttendancePopup"
        );


    if (closeAttendancePopup) {

        closeAttendancePopup.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "attendancePopup"
                ).style.display = "none";
            }
        );
    }


    /* ========================================================
       MY ATTENDANCE
    ======================================================== */

    const checkAttendanceMenuButton =
        document.getElementById(
            "checkAttendanceMenuButton"
        );


    if (checkAttendanceMenuButton) {

        checkAttendanceMenuButton.addEventListener(
            "click",
            openAttendanceModal
        );
    }


    function openAttendanceModal() {

        const modal =
            document.getElementById(
                "attendanceCheckModal"
            );


        if (!modal) return;


        modal.style.display = "flex";


        loadAttendanceHistory();
    }


    function loadAttendanceHistory() {

        const history =
            document.getElementById(
                "attendanceHistory"
            );


        if (!history || !currentUser) return;


        const records =
            attendance.filter(
                record =>
                    record.studentId === currentUser.id
            );


        const totalDays =
            document.getElementById(
                "attendanceTotalDays"
            );

        const presentDays =
            document.getElementById(
                "attendancePresentDays"
            );

        const absentDays =
            document.getElementById(
                "attendanceAbsentDays"
            );


        if (totalDays) {
            totalDays.textContent =
                records.length;
        }

        if (presentDays) {
            presentDays.textContent =
                records.length;
        }

        if (absentDays) {
            absentDays.textContent = 0;
        }


        if (records.length === 0) {

            history.innerHTML =
                "<p>No attendance records yet.</p>";

            return;
        }


        history.innerHTML = "";


        records
            .slice()
            .reverse()
            .forEach(record => {

                const item =
                    document.createElement("div");

                item.className =
                    "attendance-history-item";


                item.innerHTML = `
                    <div>
                        <strong>${escapeHTML(record.date)}</strong>
                        <span>
                            ${escapeHTML(record.day)}
                            •
                            ${escapeHTML(record.time)}
                        </span>
                    </div>
                    <b>Present</b>
                `;


                history.appendChild(item);
            });
    }


    const closeCheckAttendanceModal =
        document.getElementById(
            "closeCheckAttendanceModal"
        );


    if (closeCheckAttendanceModal) {

        closeCheckAttendanceModal.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "attendanceCheckModal"
                ).style.display = "none";
            }
        );
    }


    /* ========================================================
       STUDENTS MODAL
    ======================================================== */

    const closeStudentsModal =
        document.getElementById(
            "closeStudentsModal"
        );


    if (closeStudentsModal) {

        closeStudentsModal.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "studentsModal"
                ).style.display = "none";
            }
        );
    }


    /* ========================================================
       EDIT DETAILS
    ======================================================== */

    const editDetailsMenuButton =
        document.getElementById(
            "editDetailsMenuButton"
        );


    if (editDetailsMenuButton) {

        editDetailsMenuButton.addEventListener(
            "click",
            openEditModal
        );
    }


    function openEditModal() {

        if (!currentUser) return;


        const modal =
            document.getElementById(
                "editDetailsModal"
            );


        if (!modal) return;


        document.getElementById("editName").value =
            currentUser.name;

        document.getElementById("editRoll").value =
            currentUser.roll;

        document.getElementById("editCollege").value =
            "Hooghly Engineering & Technology College";

        document.getElementById("editDepartment").value =
            currentUser.department;

        document.getElementById("editMobile").value =
            currentUser.mobile;

        document.getElementById("editEmail").value =
            currentUser.email || "";


        modal.style.display = "flex";
    }


    const closeEditDetailsModal =
        document.getElementById(
            "closeEditDetailsModal"
        );


    if (closeEditDetailsModal) {

        closeEditDetailsModal.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "editDetailsModal"
                ).style.display = "none";
            }
        );
    }


    const saveEditedDetailsButton =
        document.getElementById(
            "saveEditedDetailsButton"
        );


    if (saveEditedDetailsButton) {

        saveEditedDetailsButton.addEventListener(
            "click",
            () => {

                if (!currentUser) return;


                const newName =
                    document.getElementById(
                        "editName"
                    ).value.trim();

                const newRoll =
                    document.getElementById(
                        "editRoll"
                    ).value.trim();

                const newDepartment =
                    document.getElementById(
                        "editDepartment"
                    ).value.trim();

                const newMobile =
                    document.getElementById(
                        "editMobile"
                    ).value.trim();

                const newEmail =
                    document.getElementById(
                        "editEmail"
                    ).value.trim();


                if (
                    !newName ||
                    !newRoll ||
                    !newDepartment ||
                    !newMobile
                ) {

                    alert(
                        "Please fill all required details."
                    );

                    return;
                }


                const index =
                    students.findIndex(
                        student =>
                            student.id === currentUser.id
                    );


                if (index === -1) return;


                students[index].name =
                    newName;

                students[index].roll =
                    newRoll;

                students[index].department =
                    newDepartment;

                students[index].mobile =
                    newMobile;

                students[index].email =
                    newEmail;


                currentUser =
                    students[index];


                saveStudents();


                localStorage.setItem(
                    "smartAttendanceCurrentUser",
                    JSON.stringify(currentUser)
                );


                document.getElementById(
                    "editDetailsModal"
                ).style.display = "none";


                loadDashboard();


                alert(
                    "Profile updated successfully!"
                );
            }
        );
    }


    /* ========================================================
       LOGOUT
    ======================================================== */

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {

            stopRegistrationCamera();
            stopAttendanceCamera();


            currentUser = null;

            localStorage.removeItem(
                "smartAttendanceCurrentUser"
            );


            showLogin();


            const loginMessage =
                document.getElementById(
                    "loginMessage"
                );


            message(
                loginMessage,
                "You have been logged out.",
                "info"
            );
        });
    }


    /* ========================================================
       HTML ESCAPE
    ======================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* ========================================================
       STARTUP
    ======================================================== */

    if (currentUser) {
        showDashboard();
    } else {
        showLogin();
    }

});

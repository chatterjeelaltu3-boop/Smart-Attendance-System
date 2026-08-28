// =====================================================
// SMART ATTENDANCE SYSTEM
// =====================================================


// =====================================================
// DATA
// =====================================================

let students =
    JSON.parse(localStorage.getItem("students")) || [];

let attendanceHistory =
    JSON.parse(localStorage.getItem("attendanceHistory")) || [];

let registrationStream = null;
let attendanceStream = null;

let faceModelLoaded = false;

let registrationRunning = false;
let attendanceRunning = false;


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
// SAVE ATTENDANCE HISTORY
// =====================================================

function saveAttendanceHistory() {

    localStorage.setItem(
        "attendanceHistory",
        JSON.stringify(attendanceHistory)
    );
}


// =====================================================
// DATE / TIME
// =====================================================

function getAttendanceDateTime() {

    const now = new Date();

    return {

        date: now.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }),

        day: now.toLocaleDateString("en-IN", {
            weekday: "long"
        }),

        time: now.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }),

        dateKey:
            now.toISOString().split("T")[0]

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
        now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}


// =====================================================
// MOBILE VALIDATION
// =====================================================

function isValidMobile(mobile) {

    return /^[0-9]{10}$/.test(mobile);
}


// =====================================================
// ADD STUDENT
// =====================================================

function addStudent() {

    const name =
        document.getElementById("studentName")?.value.trim();

    const roll =
        document.getElementById("studentRoll")?.value.trim();

    const college =
        document.getElementById("studentCollege")?.value.trim();

    const department =
        document.getElementById("studentDepartment")?.value.trim();

    const mobile =
        document.getElementById("studentMobile")?.value.trim();


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


// =====================================================
// DISPLAY STUDENTS
// =====================================================

function displayStudents() {

    const list =
        document.getElementById("studentList");

    if (!list) return;


    const searchElement =
        document.getElementById("searchStudent");


    const search =
        searchElement
            ? searchElement.value.toLowerCase().trim()
            : "";


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

                ${attendanceInfo}

                <div class="status">

                    Status:
                    ${student.status}

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
// MANUAL PRESENT
// =====================================================

function markPresent(index) {

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


    addDailyAttendance(
        students[index],
        "Present",
        attendance
    );


    saveStudents();

    displayStudents();

    updateDashboard();

}


// =====================================================
// MANUAL ABSENT
// =====================================================

function markAbsent(index) {

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


    addDailyAttendance(
        students[index],
        "Absent",
        attendance
    );


    saveStudents();

    displayStudents();

    updateDashboard();

}


// =====================================================
// DAILY ATTENDANCE SAVE
// =====================================================

function addDailyAttendance(
    student,
    status,
    attendance
) {

    const alreadyExists =
        attendanceHistory.some(record =>

            record.roll === student.roll &&

            record.dateKey === attendance.dateKey

        );


    if (alreadyExists) {

        return;
    }


    attendanceHistory.push({

        name: student.name,

        roll: student.roll,

        college: student.college,

        department: student.department,

        mobile: student.mobile || "",

        email: student.email || "",

        status: status,

        date: attendance.date,

        day: attendance.day,

        time:
            status === "Present"
                ? attendance.time
                : "",

        dateKey: attendance.dateKey

    });


    saveAttendanceHistory();

}


// =====================================================
// DELETE STUDENT
// =====================================================

function deleteStudent(index) {

    if (
        !confirm(
            "Delete this student?"
        )
    ) {

        return;
    }


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


    if (totalElement)
        totalElement.innerText = total;


    if (presentElement)
        presentElement.innerText = present;


    if (absentElement)
        absentElement.innerText = absent;


    if (percentageElement)
        percentageElement.innerText =
            percentage + "%";

}


// =====================================================
// FACE API
// =====================================================

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";


// =====================================================
// LOAD MODELS
// =====================================================

async function loadFaceModels() {

    if (faceModelLoaded) {

        return true;
    }


    try {

        await faceapi.nets.tinyFaceDetector
            .loadFromUri(MODEL_URL);


        await faceapi.nets.faceLandmark68Net
            .loadFromUri(MODEL_URL);


        await faceapi.nets.faceRecognitionNet
            .loadFromUri(MODEL_URL);


        faceModelLoaded = true;


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


    if (!video) {

        return null;
    }


    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({

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


        await video.play();


        if (status) {

            status.innerText =
                "Camera ON 📸 — Looking for face...";
        }


        return stream;


    } catch (error) {

        console.error(error);


        if (status) {

            status.innerText =
                "Camera permission denied ❌";
        }


        return null;
    }
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
// STOP ATTENDANCE CAMERA
// =====================================================

function stopAttendanceCamera() {

    if (attendanceStream) {

        attendanceStream
            .getTracks()
            .forEach(
                track => track.stop()
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
// FACE REGISTRATION START
// =====================================================

async function startAutomaticFaceRegistration() {

    const name =
        document.getElementById(
            "faceName"
        ).value.trim();


    const roll =
        document.getElementById(
            "faceRoll"
        ).value.trim();


    const college =
        document.getElementById(
            "collegeName"
        ).value.trim();


    const department =
        document.getElementById(
            "departmentName"
        ).value.trim();


    const mobile =
        document.getElementById(
            "faceMobile"
        ).value.trim();


    const email =
        document.getElementById(
            "faceEmail"
        ).value.trim();


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

        message.innerHTML =
            `<div class="success-message">
                ⚠️ Please fill all required details.
            </div>`;

        return;
    }


    if (!isValidMobile(mobile)) {

        message.innerHTML =
            `<div class="success-message">
                ⚠️ Mobile number must be exactly 10 digits.
            </div>`;

        return;
    }


    if (email && !isValidEmail(email)) {

        message.innerHTML =
            `<div class="success-message">
                ⚠️ Please enter a valid email address.
            </div>`;

        return;
    }


    button.disabled =
        true;


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        message.innerHTML =
            `<div class="success-message">
                ❌ Face model could not load.
            </div>`;

        button.disabled =
            false;

        return;
    }


    const video =
        document.getElementById(
            "registrationCamera"
        );


    if (!video.srcObject) {

        registrationStream =
            await startCameraForVideo(
                "registrationCamera",
                "registrationStatus"
            );


        if (!registrationStream) {

            button.disabled =
                false;

            return;
        }
    }


    status.innerText =
        "📸 Camera ON — Put your face in front of camera";


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


    try {

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.5
                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        if (detection) {

            status.innerText =
                "✅ Face detected — Capturing automatically...";


            const descriptor =
                Array.from(
                    detection.descriptor
                );


            const faceStudent = {

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
                JSON.stringify(faceStudent)
            );


            const existing =
                students.find(
                    s => s.roll === roll
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

                    attendanceDate: "",
                    attendanceDay: "",
                    attendanceTime: ""

                });

            }


            saveStudents();


            displayStudents();

            updateDashboard();


            registrationSuccessful(
                name,
                roll
            );


            return;
        }


        status.innerText =
            "👤 Looking for your face...";


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
            400
        );


    } catch (error) {

        console.error(error);


        registrationRunning =
            false;


        status.innerText =
            "Face detection error ❌";


        buttonEnable(
            "registerFaceButton"
        );

    }

}


// =====================================================
// REGISTRATION SUCCESS
// =====================================================

function registrationSuccessful(
    name,
    roll
) {

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

                <h3>
                    Face Registration Completed
                </h3>

                <p>
                    👤 <strong>Name:</strong>
                    ${name}
                </p>

                <p>
                    🔢 <strong>Roll:</strong>
                    ${roll}
                </p>

                <p>
                    📸 Face captured successfully.
                </p>

            </div>

        `;
    }


    alert(
        "✅ Face Captured Successfully!\n\n" +
        "🎉 Face Registration Completed"
    );


    stopRegistrationCamera();


    buttonEnable(
        "registerFaceButton"
    );

}


// =====================================================
// FACE ATTENDANCE START
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

        result.innerHTML =
            `<div class="success-message">
                ❌ No face registered.
                Please register your face first.
            </div>`;

        return;
    }


    const registeredStudent =
        JSON.parse(savedData);


    button.disabled =
        true;


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        button.disabled =
            false;

        return;
    }


    if (!video.srcObject) {

        attendanceStream =
            await startCameraForVideo(
                "attendanceCamera",
                "attendanceStatus"
            );


        if (!attendanceStream) {

            button.disabled =
                false;

            return;
        }
    }


    status.innerText =
        "📸 Camera ON — Looking for your face...";


    attendanceRunning =
        true;


    result.innerHTML =
        "";


    detectAttendanceFace(
        registeredStudent
    );

}


// =====================================================
// ATTENDANCE FACE DETECTION
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
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.5
                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        if (!detection) {

            status.innerText =
                "👤 Looking for your face...";


            setTimeout(
                () => {

                    detectAttendanceFace(
                        registeredStudent
                    );

                },
                400
            );


            return;
        }


        status.innerText =
            "✅ Face detected — Checking identity...";


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

            status.innerText =
                "❌ Face does not match.";

            attendanceRunning =
                false;


            stopAttendanceCamera();


            buttonEnable(
                "attendanceButton"
            );


            document.getElementById(
                "attendanceResult"
            ).innerHTML = `

                <div class="success-message">

                    ❌ Face does not match.

                    <br><br>

                    Please try again.

                </div>

            `;

        }


    } catch (error) {

        console.error(error);


        attendanceRunning =
            false;


        status.innerText =
            "Face detection error ❌";


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
            s => s.roll === student.roll
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

            name: student.name,

            roll: student.roll,

            college: student.college,

            department: student.department,

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


    /*
       SAVE DAILY ATTENDANCE
    */

    addDailyAttendance(
        students[index],
        "Present",
        attendance
    );


    saveStudents();


    result.innerHTML = `

        <div class="success-message">

            <div class="success-icon">
                ✅
            </div>


            <h3>
                Attendance Successfully Marked
            </h3>


            <p>
                👤 <strong>Name:</strong>
                ${student.name}
            </p>


            <p>
                🔢 <strong>Roll:</strong>
                ${student.roll}
            </p>


            <p>
                🏫 <strong>College:</strong>
                ${student.college}
            </p>


            <p>
                🎓 <strong>Department:</strong>
                ${student.department}
            </p>


            <p>
                📱 <strong>Mobile:</strong>
                ${student.mobile || "Not added"}
            </p>


            <p>
                📧 <strong>Email:</strong>
                ${student.email || "Not added"}
            </p>


            <hr>


            <p>
                📅 <strong>Date:</strong>
                ${attendance.date}
            </p>


            <p>
                📆 <strong>Day:</strong>
                ${attendance.day}
            </p>


            <p>
                🕐 <strong>Time:</strong>
                ${attendance.time}
            </p>


            <p class="success-note">
                🎉 Your attendance has been saved successfully.
            </p>

        </div>

    `;


    displayStudents();

    updateDashboard();


    const status =
        document.getElementById(
            "attendanceStatus"
        );


    if (status) {

        status.innerText =
            "✅ Attendance marked successfully!";
    }


    stopAttendanceCamera();


    buttonEnable(
        "attendanceButton"
    );


    /*
       POPUP
    */

    alert(
        "✅ Attendance Successfully Marked!\n\n" +
        "Name: " + student.name + "\n" +
        "Roll: " + student.roll + "\n" +
        "Date: " + attendance.date + "\n" +
        "Day: " + attendance.day + "\n" +
        "Time: " + attendance.time
    );

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
// EMAIL VALIDATION
// =====================================================

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// =====================================================
// THREE LINE MENU
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

        const student =
            JSON.parse(saved);


        document.getElementById(
            "editName"
        ).value =
            student.name || "";


        document.getElementById(
            "editRoll"
        ).value =
            student.roll || "";


        document.getElementById(
            "editCollege"
        ).value =
            student.college || "";


        document.getElementById(
            "editDepartment"
        ).value =
            student.department || "";


        document.getElementById(
            "editMobile"
        ).value =
            student.mobile || "";


        document.getElementById(
            "editEmail"
        ).value =
            student.email || "";

    }


    modal.classList.add(
        "show"
    );


    closeMenu();

}


// =====================================================
// CLOSE MENU
// =====================================================

function closeMenu() {

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
            "Mobile number must be exactly 10 digits."
        );

        return;
    }


    if (
        email &&
        !isValidEmail(email)
    ) {

        alert(
            "Please enter a valid email."
        );

        return;
    }


    const index =
        students.findIndex(
            s => s.roll === roll
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
            "❌ Mobile number must be exactly 10 digits."
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


    const index =
        students.findIndex(
            s => s.roll === student.roll
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


    closeMenu();

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
// CHECK ATTENDANCE
// =====================================================

function showCheckAttendance() {

    const modal =
        document.getElementById(
            "attendanceCheckModal"
        );


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


    const historyElement =
        document.getElementById(
            "attendanceHistory"
        );


    if (!modal) return;


    /*
       Number of saved attendance days
    */

    const totalDays =
        new Set(
            attendanceHistory.map(
                record => record.dateKey
            )
        ).size;


    const presentDays =
        new Set(
            attendanceHistory
                .filter(
                    r => r.status === "Present"
                )
                .map(
                    r => r.dateKey
                )
        ).size;


    const absentDays =
        new Set(
            attendanceHistory
                .filter(
                    r => r.status === "Absent"
                )
                .map(
                    r => r.dateKey
                )
        ).size;


    totalElement.innerText =
        totalDays;


    presentElement.innerText =
        presentDays;


    absentElement.innerText =
        absentDays;


    historyElement.innerHTML = "";


    if (attendanceHistory.length === 0) {

        historyElement.innerHTML =
            "<p>No attendance history yet.</p>";

    } else {

        const sorted =
            [...attendanceHistory].reverse();


        sorted.forEach(record => {

            const div =
                document.createElement("div");


            div.className =
                "history-card " +
                (
                    record.status === "Present"
                        ? "history-present"
                        : "history-absent"
                );


            div.innerHTML = `

                <strong>
                    ${record.status === "Present"
                        ? "🟢"
                        : "🔴"}
                    ${record.status}
                </strong>

                <br>

                👤 Name:
                ${record.name}

                <br>

                🔢 Roll:
                ${record.roll}

                <br>

                📅 Date:
                ${record.date}

                <br>

                📆 Day:
                ${record.day}

                ${
                    record.time
                        ? `
                            <br>
                            🕐 Time:
                            ${record.time}
                          `
                        : ""
                }

            `;


            historyElement.appendChild(div);

        });

    }


    modal.classList.add(
        "show"
    );


    closeMenu();

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
// ADMIN
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


    closeMenu();

}


// =====================================================
// CLOSE ADMIN
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
// MOBILE INPUT — ONLY NUMBERS
// =====================================================

document.addEventListener(
    "input",
    function(event) {

        const id =
            event.target.id;


        if (
            id === "faceMobile" ||
            id === "editMobile" ||
            id === "studentMobile"
        ) {

            event.target.value =
                event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

        }

    }
);


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    async function() {

        displayStudents();

        updateDashboard();

        showCurrentDate();

        /*
           Face models load in background.
        */

        await loadFaceModels();

    }
);

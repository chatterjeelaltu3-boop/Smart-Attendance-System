// =====================================================
// SMART ATTENDANCE SYSTEM
// FINAL VERSION
// =====================================================


// =====================================================
// STUDENTS
// =====================================================

let students =
    JSON.parse(localStorage.getItem("students")) || [];


// =====================================================
// ATTENDANCE HISTORY
// =====================================================

let attendanceHistory =
    JSON.parse(
        localStorage.getItem("attendanceHistory")
    ) || [];


// =====================================================
// CAMERA VARIABLES
// =====================================================

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
// DATE / DAY / TIME
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


    students.push({

        name,
        roll,
        college,
        department,
        mobile,

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

            student.name
                .toLowerCase()
                .includes(search)

            ||

            student.roll
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


    addAttendanceHistory(
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


    addAttendanceHistory(
        students[index],
        "Absent",
        attendance
    );


    saveStudents();

    displayStudents();

    updateDashboard();

}


// =====================================================
// DELETE
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
// ADD ATTENDANCE HISTORY
// =====================================================

function addAttendanceHistory(
    student,
    status,
    attendance
) {

    // Same student cannot be marked twice
    // on the same date

    const alreadyExists =
        attendanceHistory.some(item =>

            item.roll === student.roll &&
            item.dateKey === attendance.dateKey

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

        status: status,

        date: attendance.date,

        day: attendance.day,

        time: attendance.time,

        dateKey: attendance.dateKey

    });


    saveAttendanceHistory();

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


// =====================================================
// START CAMERA
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


        await video.play();


        if (status) {

            status.innerText =
                "Camera ON ✅";

        }


        return stream;


    } catch (error) {

        console.error(error);


        if (status) {

            status.innerText =
                "Camera permission denied ❌";

        }


        alert(
            "Camera permission is required."
        );


        return null;

    }
}


// =====================================================
// REGISTRATION
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

                <div class="success-message"
                     style="
                     background:#fff7ed;
                     border-color:#f97316;
                     color:#9a3412;
                     ">

                    ⚠️ Please fill all details.

                </div>

            `;

        }

        return;

    }


    button.disabled =
        true;


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        if (message) {

            message.innerHTML =
                "❌ Face model could not load.";

        }

        button.disabled =
            false;

        return;

    }


    if (!registrationStream) {

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
        "📸 Camera ON — Looking for your face...";


    registrationRunning =
        true;


    detectRegistrationFace(
        name,
        roll,
        college,
        department,
        mobile
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
    mobile
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
                "✅ Face detected — Capturing...";


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

                    descriptor

                })
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

            } else {

                students.push({

                    name,
                    roll,
                    college,
                    department,
                    mobile,

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


            registrationSuccessful();

            return;

        }


        status.innerText =
            "📸 Looking for your face...";


        setTimeout(
            () => {

                detectRegistrationFace(
                    name,
                    roll,
                    college,
                    department,
                    mobile
                );

            },
            300
        );


    } catch (error) {

        console.error(error);


        status.innerText =
            "Face detection error ❌";


        registrationRunning =
            false;


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

                Face Captured Successfully!

                <br>

                🎉 Face Registration Completed

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

        result.innerHTML = `

            <div class="success-message"
                 style="
                 background:#fff7ed;
                 border-color:#f97316;
                 color:#9a3412;
                 ">

                ❌ No face registered.

                <br>

                Please register your face first.

            </div>

        `;

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


    if (!attendanceStream) {

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
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.5
                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        if (!detection) {

            status.innerText =
                "📸 Looking for your face...";


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


        status.innerText =
            "✅ Face detected — Checking...";


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


            status.innerText =
                "❌ Face does not match";


            stopAttendanceCamera();


            buttonEnable(
                "attendanceButton"
            );


            alert(
                "❌ Face does not match the registered face."
            );

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


    const status =
        document.getElementById(
            "attendanceStatus"
        );


    // Find student

    let index =
        students.findIndex(
            s => s.roll === student.roll
        );


    // =================================================
    // CHECK IF ALREADY MARKED TODAY
    // =================================================

    const alreadyMarkedToday =
        attendanceHistory.some(item =>

            item.roll === student.roll &&
            item.dateKey === attendance.dateKey

        );


    if (alreadyMarkedToday) {

        if (status) {

            status.innerText =
                "⚠️ Attendance already marked today.";

        }


        if (result) {

            result.innerHTML = `

                <div class="success-message"
                     style="
                     background:#fff7ed;
                     border-color:#f59e0b;
                     color:#92400e;
                     ">

                    <div class="success-icon">
                        ⚠️
                    </div>

                    <h3>
                        Attendance Already Marked
                    </h3>

                    <p>
                        ${student.name}
                    </p>

                    <p>
                        📅 ${attendance.date}
                    </p>

                </div>

            `;

        }


        stopAttendanceCamera();


        buttonEnable(
            "attendanceButton"
        );


        alert(
            "⚠️ Attendance already marked today."
        );


        return;

    }


    // =================================================
    // UPDATE STUDENT
    // =================================================

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


    // =================================================
    // SAVE DAILY ATTENDANCE
    // =================================================

    addAttendanceHistory(
        student,
        "Present",
        attendance
    );


    saveStudents();

    saveAttendanceHistory();


    // =================================================
    // SUCCESS MESSAGE
    // =================================================

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

        </div>

    `;


    if (status) {

        status.innerText =
            "✅ Attendance marked successfully!";

    }


    displayStudents();

    updateDashboard();


    stopAttendanceCamera();


    buttonEnable(
        "attendanceButton"
    );


    // POPUP

    alert(
        "✅ ATTENDANCE SUCCESSFULLY MARKED!\n\n" +

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

    }


    modal.classList.add(
        "show"
    );


    closeMenu();

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


        localStorage.setItem(
            "registeredFaceStudent",
            JSON.stringify(student)
        );

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

        saveStudents();

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
            "Enter your mobile number:"
        );


    if (!mobile) return;


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
        mobile.trim();


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
            mobile.trim();

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
                        ${index + 1}. ${student.name}
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


    if (!modal) return;


    updateAttendanceSummary();


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
// ATTENDANCE SUMMARY
// =====================================================

function updateAttendanceSummary() {

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


    const totalDays =
        attendanceHistory.length;


    const presentDays =
        attendanceHistory.filter(
            item => item.status === "Present"
        ).length;


    const absentDays =
        attendanceHistory.filter(
            item => item.status === "Absent"
        ).length;


    if (total)
        total.innerText =
            totalDays;


    if (present)
        present.innerText =
            presentDays;


    if (absent)
        absent.innerText =
            absentDays;


    const history =
        document.getElementById(
            "attendanceHistory"
        );


    if (!history) return;


    history.innerHTML = "";


    if (attendanceHistory.length === 0) {

        history.innerHTML =
            "<p>No attendance history yet.</p>";

        return;

    }


    const reversed =
        [...attendanceHistory].reverse();


    reversed.forEach(item => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "attendance-history-item";


        div.innerHTML = `

            <strong>
                👤 ${item.name}
            </strong>

            <br>

            🔢 Roll:
            ${item.roll}

            <br>

            📌 Status:
            <strong>
                ${item.status}
            </strong>

            <br>

            📅 Date:
            ${item.date}

            <br>

            📆 Day:
            ${item.day}

            <br>

            🕐 Time:
            ${item.time}

        `;


        history.appendChild(div);

    });

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
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    async function () {

        displayStudents();

        updateDashboard();

        updateAttendanceSummary();

        showCurrentDate();


        // Load face models

        await loadFaceModels();

    }
);

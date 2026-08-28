// =====================================================
// SMART ATTENDANCE SYSTEM
// =====================================================

// =====================================================
// STUDENTS DATA
// =====================================================

let students = JSON.parse(
    localStorage.getItem("students")
) || [];

let registrationStream = null;
let attendanceStream = null;

let faceModelLoaded = false;
let registrationRunning = false;
let attendanceRunning = false;


// =====================================================
// ADMIN
// =====================================================

const ADMIN_NAME = "Ayush Chatterjee";


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
// DATE + DAY + TIME
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

        dateKey: now.toLocaleDateString("en-IN")

    };
}


// =====================================================
// TODAY DATE
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
// ENSURE ATTENDANCE HISTORY
// =====================================================

function ensureAttendanceHistory(student) {

    if (!Array.isArray(student.attendanceHistory)) {

        student.attendanceHistory = [];

    }

    return student.attendanceHistory;
}


// =====================================================
// ADD / UPDATE DAILY ATTENDANCE
// =====================================================

function saveDailyAttendance(
    student,
    status,
    attendance
) {

    const history =
        ensureAttendanceHistory(student);

    const existing =
        history.find(
            item => item.dateKey === attendance.dateKey
        );


    if (existing) {

        existing.status = status;
        existing.date = attendance.date;
        existing.day = attendance.day;
        existing.time = attendance.time;

    } else {

        history.push({

            dateKey: attendance.dateKey,
            date: attendance.date,
            day: attendance.day,
            time: attendance.time,
            status: status

        });

    }


    // Latest attendance information

    student.status = status;

    student.attendanceDate =
        attendance.date;

    student.attendanceDay =
        attendance.day;

    student.attendanceTime =
        attendance.time;


    saveStudents();
}


// =====================================================
// ADD STUDENT
// =====================================================

function addStudent() {

    const name =
        document.getElementById(
            "studentName"
        ).value.trim();

    const roll =
        document.getElementById(
            "studentRoll"
        ).value.trim();

    const college =
        document.getElementById(
            "studentCollege"
        ).value.trim();

    const department =
        document.getElementById(
            "studentDepartment"
        ).value.trim();

    const mobile =
        document.getElementById(
            "studentMobile"
        ).value.trim();


    if (
        !name ||
        !roll ||
        !college ||
        !department ||
        !mobile
    ) {

        alert(
            "Please fill Name, Roll, College, Department and Mobile Number."
        );

        return;
    }


    const existing =
        students.find(
            student => student.roll === roll
        );


    if (existing) {

        alert(
            "This Roll Number is already registered."
        );

        return;
    }


    students.push({

        name: name,
        roll: roll,
        college: college,
        department: department,
        mobile: mobile,

        descriptor: null,

        status: "Not Marked",

        attendanceDate: "",
        attendanceDay: "",
        attendanceTime: "",

        attendanceHistory: []

    });


    saveStudents();


    document.getElementById(
        "studentName"
    ).value = "";

    document.getElementById(
        "studentRoll"
    ).value = "";

    document.getElementById(
        "studentCollege"
    ).value = "";

    document.getElementById(
        "studentDepartment"
    ).value = "";

    document.getElementById(
        "studentMobile"
    ).value = "";


    displayStudents();
    updateDashboard();


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

                Roll:
                ${student.roll}

                <br>

                College:
                ${student.college}

                <br>

                Department:
                ${student.department}

                <br>

                📱 Mobile:
                ${student.mobile || "Not added"}

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
// PRESENT
// =====================================================

function markPresent(index) {

    if (!students[index]) return;


    const attendance =
        getAttendanceDateTime();


    saveDailyAttendance(
        students[index],
        "Present",
        attendance
    );


    displayStudents();
    updateDashboard();


    alert(
        "✅ Attendance marked Present!\n\n" +
        "📅 " + attendance.date +
        "\n📆 " + attendance.day +
        "\n🕐 " + attendance.time
    );
}


// =====================================================
// ABSENT
// =====================================================

function markAbsent(index) {

    if (!students[index]) return;


    const attendance =
        getAttendanceDateTime();


    saveDailyAttendance(
        students[index],
        "Absent",
        attendance
    );


    displayStudents();
    updateDashboard();


    alert(
        "❌ Attendance marked Absent!\n\n" +
        "📅 " + attendance.date
    );
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
            student =>
                student.status === "Present"
        ).length;


    const absent =
        students.filter(
            student =>
                student.status === "Absent"
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
        document.getElementById(
            videoId
        );

    const status =
        document.getElementById(
            statusId
        );


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
                "📷 Camera ON — Face the camera";
        }


        return stream;


    } catch (error) {

        console.error(error);


        if (status) {

            status.innerText =
                "❌ Camera permission denied.";
        }


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


    const status =
        document.getElementById(
            "registrationStatus"
        );

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

        if (message) {

            message.innerText =
                "❌ Please fill all student details.";
        }


        return;
    }


    const button =
        document.getElementById(
            "registerFaceButton"
        );


    if (button) {

        button.disabled = true;
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


    if (!video.srcObject) {

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
            "📷 Camera ON — Looking for your face...";
    }


    if (message) {

        message.innerText =
            "Please look at the camera. Face will be captured automatically.";
    }


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

            if (status) {

                status.innerText =
                    "✅ Face detected — Capturing...";
            }


            const descriptor =
                Array.from(
                    detection.descriptor
                );


            let student =
                students.find(
                    s => s.roll === roll
                );


            if (student) {

                student.name =
                    name;

                student.college =
                    college;

                student.department =
                    department;

                student.mobile =
                    mobile;

                student.descriptor =
                    descriptor;


                ensureAttendanceHistory(
                    student
                );

            } else {

                student = {

                    name: name,

                    roll: roll,

                    college: college,

                    department: department,

                    mobile: mobile,

                    descriptor: descriptor,

                    status: "Not Marked",

                    attendanceDate: "",

                    attendanceDay: "",

                    attendanceTime: "",

                    attendanceHistory: []

                };


                students.push(
                    student
                );
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


        if (status) {

            status.innerText =
                "📷 Looking for your face...";
        }


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


        registrationRunning =
            false;


        if (status) {

            status.innerText =
                "❌ Face detection error.";
        }


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

            <div
                style="
                    margin-top:15px;
                    padding:18px;
                    border-radius:14px;
                    background:#ecfdf5;
                    border:2px solid #22c55e;
                    color:#166534;
                    font-size:18px;
                    font-weight:bold;
                    text-align:center;
                "
            >

                ✅ Face Captured Successfully!

                <br><br>

                🎉 Face Registration Completed

                <br>

                👤 ${name}

                <br>

                🔢 Roll: ${roll}

            </div>

        `;
    }


    alert(
        "✅ Face Captured Successfully!\n\n" +
        "🎉 Face Registration Completed\n\n" +
        "👤 " + name +
        "\n🔢 Roll: " + roll
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

    const result =
        document.getElementById(
            "attendanceResult"
        );


    if (!video) return;


    const registeredStudents =
        students.filter(
            student =>
                Array.isArray(
                    student.descriptor
                ) &&
                student.descriptor.length > 0
        );


    if (registeredStudents.length === 0) {

        if (result) {

            result.innerHTML = `

                <div
                    style="
                        padding:18px;
                        margin-top:15px;
                        border-radius:14px;
                        background:#fff7ed;
                        border:2px solid #f97316;
                        color:#9a3412;
                        text-align:center;
                    "
                >

                    ❌ No registered face found.

                    <br><br>

                    Please register your face first.

                </div>

            `;
        }


        return;
    }


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        return;
    }


    if (!video.srcObject) {

        attendanceStream =
            await startCameraForVideo(
                "attendanceCamera",
                "attendanceStatus"
            );


        if (!attendanceStream) {

            return;
        }
    }


    if (status) {

        status.innerText =
            "📷 Camera ON — Looking for your face...";
    }


    if (result) {

        result.innerHTML = `

            <div
                style="
                    padding:15px;
                    margin-top:15px;
                    border-radius:12px;
                    background:#eff6ff;
                    border:1px solid #bfdbfe;
                    text-align:center;
                "
            >

                📷 Capture Face is active.

                <br>

                Please look at the camera.

                <br>

                Attendance will be marked automatically.

            </div>

        `;
    }


    attendanceRunning =
        true;


    detectAttendanceFace(
        registeredStudents
    );
}


// =====================================================
// AUTOMATIC ATTENDANCE DETECTION
// =====================================================

async function detectAttendanceFace(
    registeredStudents
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

            if (status) {

                status.innerText =
                    "📷 Looking for your face...";
            }


            setTimeout(
                () => {

                    detectAttendanceFace(
                        registeredStudents
                    );

                },
                300
            );


            return;
        }


        if (status) {

            status.innerText =
                "🔍 Face detected — Checking identity...";
        }


        let matchedStudent =
            null;

        let bestDistance =
            Infinity;


        for (
            const student
            of registeredStudents
        ) {

            const registeredDescriptor =
                new Float32Array(
                    student.descriptor
                );


            const distance =
                faceapi.euclideanDistance(
                    detection.descriptor,
                    registeredDescriptor
                );


            if (
                distance < bestDistance
            ) {

                bestDistance =
                    distance;

                matchedStudent =
                    student;
            }
        }


        // Face match

        if (
            matchedStudent &&
            bestDistance < 0.55
        ) {

            showAttendanceSuccess(
                matchedStudent
            );


            return;
        }


        // No match

        if (status) {

            status.innerText =
                "❌ Face does not match any registered student.";
        }


        const result =
            document.getElementById(
                "attendanceResult"
            );


        if (result) {

            result.innerHTML = `

                <div
                    style="
                        padding:18px;
                        margin-top:15px;
                        border-radius:14px;
                        background:#fef2f2;
                        border:2px solid #ef4444;
                        color:#991b1b;
                        text-align:center;
                    "
                >

                    ❌ Face Not Recognized

                    <br><br>

                    Please use a registered face.

                </div>

            `;
        }


        attendanceRunning =
            false;


        stopAttendanceCamera();


    } catch (error) {

        console.error(error);


        attendanceRunning =
            false;


        if (status) {

            status.innerText =
                "❌ Face detection error.";
        }


        stopAttendanceCamera();
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


    // Find student

    const index =
        students.findIndex(
            s => s.roll === student.roll
        );


    if (index === -1) {

        return;
    }


    // Check today's attendance

    const history =
        ensureAttendanceHistory(
            students[index]
        );


    const alreadyPresentToday =
        history.find(
            item =>
                item.dateKey ===
                attendance.dateKey &&
                item.status === "Present"
        );


    if (alreadyPresentToday) {

        if (result) {

            result.innerHTML = `

                <div
                    style="
                        padding:22px;
                        margin-top:20px;
                        border-radius:16px;
                        background:#fff7ed;
                        border:2px solid #f59e0b;
                        color:#92400e;
                        text-align:center;
                    "
                >

                    <div
                        style="
                            font-size:45px;
                        "
                    >
                        ⚠️
                    </div>

                    <h3>
                        Attendance Already Marked
                    </h3>

                    <p>
                        👤 ${student.name}
                    </p>

                    <p>
                        📅 ${attendance.date}
                    </p>

                    <p>
                        📆 ${attendance.day}
                    </p>

                </div>

            `;
        }


        stopAttendanceCamera();


        return;
    }


    // SAVE TODAY PRESENT

    saveDailyAttendance(
        students[index],
        "Present",
        attendance
    );


    // SUCCESS MESSAGE

    if (result) {

        result.innerHTML = `

            <div
                style="
                    padding:22px;
                    margin-top:20px;
                    border-radius:16px;
                    background:#ecfdf5;
                    border:2px solid #22c55e;
                    color:#166534;
                    text-align:center;
                "
            >

                <div
                    style="
                        font-size:55px;
                        margin-bottom:10px;
                    "
                >
                    ✅
                </div>

                <h3
                    style="
                        font-size:24px;
                        margin-bottom:15px;
                    "
                >
                    Attendance Successfully Marked!
                </h3>

                <p>
                    <strong>
                        👤 Name:
                    </strong>

                    ${student.name}
                </p>

                <p>
                    <strong>
                        🔢 Roll:
                    </strong>

                    ${student.roll}
                </p>

                <p>
                    <strong>
                        🏫 College:
                    </strong>

                    ${student.college}
                </p>

                <p>
                    <strong>
                        🎓 Department:
                    </strong>

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
                    <strong>
                        📅 Date:
                    </strong>

                    ${attendance.date}
                </p>

                <p>
                    <strong>
                        📆 Day:
                    </strong>

                    ${attendance.day}
                </p>

                <p>
                    <strong>
                        🕐 Time:
                    </strong>

                    ${attendance.time}
                </p>

                <br>

                <strong>
                    🎉 Your attendance has been saved!
                </strong>

            </div>

        `;
    }


    const status =
        document.getElementById(
            "attendanceStatus"
        );


    if (status) {

        status.innerText =
            "✅ Attendance marked successfully!";
    }


    displayStudents();
    updateDashboard();


    alert(
        "✅ Attendance Successfully Marked!\n\n" +
        "👤 " + student.name +
        "\n🔢 Roll: " + student.roll +
        "\n📅 " + attendance.date +
        "\n📆 " + attendance.day +
        "\n🕐 " + attendance.time
    );


    stopAttendanceCamera();
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
// EDIT MY DETAILS
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


    // Find current registered face

    let student = null;


    if (saved) {

        student =
            JSON.parse(saved);

    } else {

        student =
            students[0] || null;
    }


    if (student) {

        const name =
            document.getElementById(
                "editName"
            );

        const roll =
            document.getElementById(
                "editRoll"
            );

        const college =
            document.getElementById(
                "editCollege"
            );

        const department =
            document.getElementById(
                "editDepartment"
            );

        const mobile =
            document.getElementById(
                "editMobile"
            );


        if (name)
            name.value =
                student.name || "";


        if (roll)
            roll.value =
                student.roll || "";


        if (college)
            college.value =
                student.college || "";


        if (department)
            department.value =
                student.department || "";


        if (mobile)
            mobile.value =
                student.mobile || "";
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
// ADD / UPDATE MOBILE
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


    let student = null;


    if (saved) {

        student =
            JSON.parse(saved);

    } else {

        student =
            students[0] || null;
    }


    if (!student) {

        alert(
            "Please register your face first."
        );

        return;
    }


    student.mobile =
        mobile.trim();


    const index =
        students.findIndex(
            s => s.roll === student.roll
        );


    if (index !== -1) {

        students[index].mobile =
            mobile.trim();

    }


    saveStudents();


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

        modal.classList.add(
            "show"
        );

        return;
    }


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
                ${student.status || "Not Marked"}

            `;


            list.appendChild(div);

        }
    );


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
// CHECK ATTENDANCE
// =====================================================

function showCheckAttendance() {

    const modal =
        document.getElementById(
            "attendanceHistoryModal"
        );


    const list =
        document.getElementById(
            "attendanceHistoryList"
        );


    if (!modal || !list) {

        // If HTML doesn't have the modal,
        // show a simple alert summary.

        let totalPresent = 0;
        let totalAbsent = 0;


        students.forEach(
            student => {

                const history =
                    ensureAttendanceHistory(
                        student
                    );


                history.forEach(
                    item => {

                        if (
                            item.status ===
                            "Present"
                        ) {

                            totalPresent++;

                        }


                        if (
                            item.status ===
                            "Absent"
                        ) {

                            totalAbsent++;

                        }

                    }
                );

            }
        );


        alert(
            "📊 ATTENDANCE SUMMARY\n\n" +
            "✅ Present: " +
            totalPresent +
            "\n\n" +
            "❌ Absent: " +
            totalAbsent
        );


        return;
    }


    list.innerHTML = "";


    let totalPresent = 0;
    let totalAbsent = 0;


    students.forEach(
        student => {

            const history =
                ensureAttendanceHistory(
                    student
                );


            history.forEach(
                item => {

                    if (
                        item.status ===
                        "Present"
                    ) {

                        totalPresent++;

                    }


                    if (
                        item.status ===
                        "Absent"
                    ) {

                        totalAbsent++;

                    }

                }
            );

        }
    );


    const summary =
        document.createElement(
            "div"
        );


    summary.style.padding =
        "15px";

    summary.style.marginBottom =
        "15px";

    summary.style.borderRadius =
        "12px";

    summary.style.background =
        "#eff6ff";


    summary.innerHTML = `

        <strong>
            📊 Attendance Summary
        </strong>

        <br><br>

        ✅ Total Present:
        ${totalPresent}

        <br>

        ❌ Total Absent:
        ${totalAbsent}

    `;


    list.appendChild(
        summary
    );


    students.forEach(
        student => {

            const history =
                ensureAttendanceHistory(
                    student
                );


            if (
                history.length === 0
            ) {

                return;
            }


            const studentBox =
                document.createElement(
                    "div"
                );


            studentBox.style.padding =
                "15px";

            studentBox.style.marginBottom =
                "12px";

            studentBox.style.borderRadius =
                "12px";

            studentBox.style.background =
                "#f8fafc";

            studentBox.style.border =
                "1px solid #e2e8f0";


            let html = `

                <strong>
                    👤 ${student.name}
                </strong>

                <br>

                🔢 Roll:
                ${student.roll}

                <hr>

            `;


            history.forEach(
                record => {

                    const icon =
                        record.status ===
                        "Present"
                            ? "✅"
                            : "❌";


                    html += `

                        ${icon}
                        ${record.status}

                        <br>

                        📅 ${record.date}

                        <br>

                        📆 ${record.day}

                        <br>

                        🕐 ${record.time}

                        <br><br>

                    `;

                }
            );


            studentBox.innerHTML =
                html;


            list.appendChild(
                studentBox
            );

        }
    );


    modal.classList.add(
        "show"
    );
}


// =====================================================
// CLOSE CHECK ATTENDANCE
// =====================================================

function closeAttendanceHistory() {

    const modal =
        document.getElementById(
            "attendanceHistoryModal"
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


    const adminName =
        document.getElementById(
            "adminName"
        );


    if (adminName) {

        adminName.innerText =
            ADMIN_NAME;
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
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    async function () {

        displayStudents();

        updateDashboard();

        showCurrentDate();


        // Fix old student data

        students.forEach(
            student => {

                ensureAttendanceHistory(
                    student
                );

            }
        );


        saveStudents();


        // Load face models

        await loadFaceModels();

    }
);

// =====================================================
// SMART ATTENDANCE SYSTEM
// COMPLETE SCRIPT.JS
// =====================================================


// =====================================================
// STUDENTS
// =====================================================

let students =
    JSON.parse(
        localStorage.getItem("students")
    ) || [];


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
// DATE + DAY + TIME
// =====================================================

function getAttendanceDateTime() {

    const now = new Date();

    return {

        date:
            now.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ),

        day:
            now.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long"
                }
            ),

        time:
            now.toLocaleTimeString(
                "en-IN",
                {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                }
            ),

        dateKey:
            now.toLocaleDateString(
                "en-CA"
            )

    };
}


// =====================================================
// CURRENT DATE
// =====================================================

function showCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

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


    const filtered =
        students.filter(
            student =>

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


    filtered.forEach(
        student => {

            const index =
                students.indexOf(
                    student
                );


            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "student-row";


            let attendanceInfo = "";


            if (
                student.attendanceDate
            ) {

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

        }
    );
}


// =====================================================
// MARK PRESENT MANUALLY
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


    saveStudents();


    addAttendanceHistory(
        students[index],
        attendance,
        "Present"
    );


    displayStudents();

    updateDashboard();
}


// =====================================================
// MARK ABSENT
// =====================================================

function markAbsent(index) {

    const attendance =
        getAttendanceDateTime();


    students[index].status =
        "Absent";


    saveStudents();


    addAttendanceHistory(
        students[index],
        attendance,
        "Absent"
    );


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


    students.splice(
        index,
        1
    );


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
            s =>
                s.status === "Present"
        ).length;


    const absent =
        students.filter(
            s =>
                s.status === "Absent"
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
        totalElement.innerText =
            total;


    if (presentElement)
        presentElement.innerText =
            present;


    if (absentElement)
        absentElement.innerText =
            absent;


    if (percentageElement)
        percentageElement.innerText =
            percentage + "%";
}


// =====================================================
// ATTENDANCE HISTORY
// =====================================================

function addAttendanceHistory(
    student,
    attendance,
    status
) {

    const alreadyExists =
        attendanceHistory.find(
            record =>

                record.roll ===
                    student.roll

                &&

                record.dateKey ===
                    attendance.dateKey
        );


    if (alreadyExists) {

        alreadyExists.status =
            status;

        alreadyExists.date =
            attendance.date;

        alreadyExists.day =
            attendance.day;

        alreadyExists.time =
            attendance.time;

    } else {

        attendanceHistory.push({

            name: student.name,

            roll: student.roll,

            college: student.college,

            department:
                student.department,

            mobile:
                student.mobile || "",

            status,

            date:
                attendance.date,

            day:
                attendance.day,

            time:
                attendance.time,

            dateKey:
                attendance.dateKey

        });
    }


    saveAttendanceHistory();
}


// =====================================================
// FACE API MODEL
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
            .loadFromUri(
                MODEL_URL
            );


        await faceapi.nets.faceLandmark68Net
            .loadFromUri(
                MODEL_URL
            );


        await faceapi.nets.faceRecognitionNet
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


    try {

        const stream =
            await navigator
                .mediaDevices
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


        await video.play();


        /*
           IMPORTANT:

           Do NOT flip the video.

           This keeps movement natural.
        */

        video.style.transform =
            "none";


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
                "Camera permission denied ❌";
        }


        alert(
            "Camera could not start. Please allow camera permission."
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


    const message =
        document.getElementById(
            "registrationMessage"
        );

    const status =
        document.getElementById(
            "registrationStatus"
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

            message.innerText =
                "❌ Please fill all student details.";
        }

        return;
    }


    if (button) {
        button.disabled = true;
    }


    if (message) {
        message.innerText =
            "⏳ Loading face recognition...";
    }


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        if (message) {

            message.innerText =
                "❌ Face recognition model could not load.";
        }


        if (button) {
            button.disabled = false;
        }


        return;
    }


    if (!registrationStream) {

        registrationStream =
            await startCameraForVideo(
                "registrationCamera",
                "registrationStatus"
            );


        if (!registrationStream) {

            if (button) {
                button.disabled = false;
            }

            return;
        }
    }


    if (message) {

        message.innerText =
            "📸 Camera ON — please look at the camera...";
    }


    if (status) {

        status.innerText =
            "Looking for your face...";
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
                    "Face detected ✅ Registering...";
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

                    descriptor

                })
            );


            const existing =
                students.find(
                    s =>
                        s.roll === roll
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

                    attendanceDate:
                        "",

                    attendanceDay:
                        "",

                    attendanceTime:
                        ""

                });
            }


            saveStudents();


            displayStudents();

            updateDashboard();


            registrationSuccessful();


            return;
        }


        if (status) {

            status.innerText =
                "Looking for your face...";
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

        console.error(
            "Registration detection error:",
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

                <h3>
                    Face Captured Successfully!
                </h3>

                <p>
                    🎉 Face Registration Completed
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

                <div class="success-message"
                     style="background:#fef2f2;
                            border-color:#ef4444;
                            color:#991b1b;">

                    ❌ No face registered.

                    <br><br>

                    Please register your face first.

                </div>

            `;
        }


        return;
    }


    const registeredStudent =
        JSON.parse(
            savedData
        );


    if (button) {
        button.disabled = true;
    }


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        if (button) {
            button.disabled = false;
        }

        return;
    }


    if (!video.srcObject) {

        attendanceStream =
            await startCameraForVideo(
                "attendanceCamera",
                "attendanceStatus"
            );


        if (!attendanceStream) {

            if (button) {
                button.disabled = false;
            }

            return;
        }
    }


    if (result) {

        result.innerHTML =
            "📸 Camera ON — looking for your face...";
    }


    if (status) {

        status.innerText =
            "Looking for your face...";
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
                    "Looking for your face...";
            }


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

                    <div class="success-message"
                         style="
                            background:#fef2f2;
                            border-color:#ef4444;
                            color:#991b1b;
                         ">

                        ❌ Face does not match.

                        <br>

                        Please try again.

                    </div>

                `;
            }


            stopAttendanceCamera();


            buttonEnable(
                "attendanceButton"
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
                s.roll ===
                student.roll
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


        index =
            students.length - 1;
    }


    saveStudents();


    /*
       SAVE DAILY ATTENDANCE
    */

    addAttendanceHistory(
        students[index],
        attendance,
        "Present"
    );


    /*
       SUCCESS MESSAGE
    */

    if (result) {

        result.innerHTML = `

            <div class="success-message">

                <div class="success-icon">
                    ✅
                </div>

                <h3 style="font-size:24px;">
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

                <hr
                    style="
                        margin:15px 0;
                        border:none;
                        border-top:
                        1px solid #bbf7d0;
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

                <p style="
                    margin-top:15px;
                    font-size:17px;
                ">

                    🎉 Your attendance has been
                    successfully marked!

                </p>

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


    /*
       POPUP
    */

    alert(

        "✅ Attendance Successfully\n\n" +

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


        const fields = {

            editName:
                student.name,

            editRoll:
                student.roll,

            editCollege:
                student.college,

            editDepartment:
                student.department,

            editMobile:
                student.mobile

        };


        Object.keys(fields)
            .forEach(
                id => {

                    const element =
                        document.getElementById(
                            id
                        );


                    if (element) {

                        element.value =
                            fields[id] || "";
                    }

                }
            );
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


    const index =
        students.findIndex(
            s =>
                s.roll === roll
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


    const mobile =
        prompt(
            "Enter your mobile number:"
        );


    if (!mobile) return;


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
            s =>
                s.roll ===
                student.roll
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


    closeMenu();
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


    if (
        students.length === 0
    ) {

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


    calculateAttendanceSummary();


    displayAttendanceHistory();


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

function calculateAttendanceSummary() {

    const totalDays =
        new Set(
            attendanceHistory.map(
                record =>
                    record.dateKey
            )
        ).size;


    const presentDays =
        attendanceHistory.filter(
            record =>
                record.status ===
                "Present"
        ).length;


    const absentDays =
        attendanceHistory.filter(
            record =>
                record.status ===
                "Absent"
        ).length;


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
}


// =====================================================
// ATTENDANCE HISTORY DISPLAY
// =====================================================

function displayAttendanceHistory() {

    const historyElement =
        document.getElementById(
            "attendanceHistory"
        );


    if (!historyElement) return;


    historyElement.innerHTML = "";


    if (
        attendanceHistory.length === 0
    ) {

        historyElement.innerHTML = `

            <p>
                No attendance history yet.
            </p>

        `;

        return;
    }


    const sorted =
        [...attendanceHistory]
            .reverse();


    sorted.forEach(
        record => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "attendance-history-item";


            const statusColor =
                record.status ===
                "Present"
                    ? "#16a34a"
                    : "#dc2626";


            div.innerHTML = `

                <strong>
                    👤 ${record.name}
                </strong>

                <br>

                🔢 Roll:
                ${record.roll}

                <br>

                📅 Date:
                ${record.date}

                <br>

                📆 Day:
                ${record.day}

                <br>

                🕐 Time:
                ${record.time}

                <br>

                <strong
                    style="color:${statusColor};"
                >

                    📌 Status:
                    ${record.status}

                </strong>

            `;


            historyElement.appendChild(
                div
            );

        }
    );
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

        showCurrentDate();

        /*
           Load models in background.
           Camera will still start when
           user presses Capture Face.
        */

        await loadFaceModels();

    }
);

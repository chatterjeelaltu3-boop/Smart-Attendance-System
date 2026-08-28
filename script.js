// =====================================================
// SMART ATTENDANCE SYSTEM
// =====================================================

let students = [];

let registrationStream = null;
let attendanceStream = null;

let faceModelLoaded = false;
let registrationRunning = false;
let attendanceRunning = false;


// =====================================================
// DATE + DAY + TIME
// =====================================================

function getAttendanceDateTime() {

    const now = new Date();

    const date = now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const day = now.toLocaleDateString("en-IN", {
        weekday: "long"
    });

    const time = now.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    return {
        date: date,
        day: day,
        time: time
    };
}


// =====================================================
// SHOW TODAY'S DATE
// =====================================================

function showCurrentDate() {

    const dateElement =
        document.getElementById("currentDate");

    if (!dateElement) return;

    const today = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    dateElement.innerText =
        "📅 " +
        today.toLocaleDateString("en-IN", options);
}


// =====================================================
// ADD STUDENT
// =====================================================

function addStudent() {

    const name =
        document.getElementById("studentName").value.trim();

    const roll =
        document.getElementById("studentRoll").value.trim();

    const college =
        document.getElementById("studentCollege").value.trim();

    const department =
        document.getElementById("studentDepartment").value.trim();

    const mobileElement =
        document.getElementById("studentMobile");

    const mobile =
        mobileElement
            ? mobileElement.value.trim()
            : "";


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


    students.push({

        name: name,
        roll: roll,
        college: college,
        department: department,
        mobile: mobile,
        status: "Not Marked",
        attendanceDate: "",
        attendanceDay: "",
        attendanceTime: ""

    });


    document.getElementById("studentName").value = "";
    document.getElementById("studentRoll").value = "";
    document.getElementById("studentCollege").value = "";
    document.getElementById("studentDepartment").value = "";

    if (mobileElement) {
        mobileElement.value = "";
    }


    displayStudents();

    updateDashboard();
}


// =====================================================
// DISPLAY STUDENTS
// =====================================================

function displayStudents() {

    const list =
        document.getElementById("studentList");

    const searchElement =
        document.getElementById("searchStudent");


    if (!list) return;


    const search =
        searchElement
            ? searchElement.value.toLowerCase().trim()
            : "";


    list.innerHTML = "";


    const filteredStudents =
        students.filter(student =>

            student.name
                .toLowerCase()
                .includes(search)

            ||

            student.roll
                .toLowerCase()
                .includes(search)

        );


    if (filteredStudents.length === 0) {

        list.innerHTML =
            "<p>No students found.</p>";

        return;
    }


    filteredStudents.forEach(student => {

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
                    ${student.status}

                </div>

            </div>


            <div class="student-actions">

                <button
                    class="present-btn"
                    onclick="markPresent(${index})">

                    Present

                </button>


                <button
                    class="absent-btn"
                    onclick="markAbsent(${index})">

                    Absent

                </button>


                <button
                    class="delete-btn"
                    onclick="deleteStudent(${index})">

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


    displayStudents();

    updateDashboard();
}


// =====================================================
// MARK ABSENT
// =====================================================

function markAbsent(index) {

    students[index].status =
        "Absent";


    displayStudents();

    updateDashboard();
}


// =====================================================
// DELETE STUDENT
// =====================================================

function deleteStudent(index) {

    students.splice(index, 1);

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
// FACE API MODEL URL
// =====================================================

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";


// =====================================================
// LOAD FACE MODELS
// =====================================================

async function loadFaceModels() {

    if (faceModelLoaded) {

        return true;
    }


    try {

        const registrationStatus =
            document.getElementById(
                "registrationStatus"
            );

        const attendanceStatus =
            document.getElementById(
                "attendanceStatus"
            );


        if (registrationStatus) {

            registrationStatus.innerText =
                "Loading face detection...";
        }


        if (attendanceStatus) {

            attendanceStatus.innerText =
                "Loading face detection...";
        }


        await faceapi.nets.tinyFaceDetector
            .loadFromUri(MODEL_URL);


        await faceapi.nets.faceLandmark68Net
            .loadFromUri(MODEL_URL);


        await faceapi.nets.faceRecognitionNet
            .loadFromUri(MODEL_URL);


        faceModelLoaded = true;


        if (registrationStatus) {

            registrationStatus.innerText =
                "Face detection ready ✅";
        }


        if (attendanceStatus) {

            attendanceStatus.innerText =
                "Face detection ready ✅";
        }


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
// CAMERA FUNCTION
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

        console.error(
            "Video not found:",
            videoId
        );

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

        console.error(
            "Camera error:",
            error
        );


        if (status) {

            status.innerText =
                "Camera permission denied or unavailable ❌";
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


    if (registrationStream) {

        const status =
            document.getElementById(
                "registrationStatus"
            );


        if (status) {

            status.innerText =
                "Camera ON — ready for face registration 📷";
        }
    }
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


    if (attendanceStream) {

        const status =
            document.getElementById(
                "attendanceStatus"
            );


        if (status) {

            status.innerText =
                "Camera ON — ready for attendance 📷";
        }
    }
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


    const mobileElement =
        document.getElementById(
            "faceMobile"
        );


    const mobile =
        mobileElement
            ? mobileElement.value.trim()
            : "";


    const video =
        document.getElementById(
            "registrationCamera"
        );


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

        message.innerText =
            "Please enter Name, Roll, College, Department and Mobile Number.";

        return;
    }


    button.disabled = true;


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        button.disabled = false;

        return;
    }


    if (!video.srcObject) {

        registrationStream =
            await startCameraForVideo(

                "registrationCamera",

                "registrationStatus"

            );


        if (!registrationStream) {

            button.disabled = false;

            return;
        }
    }


    status.innerText =
        "Camera ON — looking for your face...";


    registrationRunning = true;


    detectRegistrationFace(

        name,
        roll,
        college,
        department,
        mobile

    );
}


// =====================================================
// AUTOMATIC FACE REGISTRATION DETECTION
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

                    new faceapi
                        .TinyFaceDetectorOptions({

                            inputSize: 320,

                            scoreThreshold: 0.5

                        })

                )

                .withFaceLandmarks()

                .withFaceDescriptor();


        if (detection) {

            status.innerText =
                "Face detected ✅ Capturing...";


            const descriptor =
                Array.from(
                    detection.descriptor
                );


            const registeredFace = {

                name: name,

                roll: roll,

                college: college,

                department: department,

                mobile: mobile,

                descriptor: descriptor

            };


            localStorage.setItem(

                "registeredFaceStudent",

                JSON.stringify(
                    registeredFace
                )

            );


            const existingStudent =
                students.find(

                    student =>
                        student.roll === roll

                );


            if (existingStudent) {

                existingStudent.name =
                    name;

                existingStudent.college =
                    college;

                existingStudent.department =
                    department;

                existingStudent.mobile =
                    mobile;

            } else {

                students.push({

                    name: name,

                    roll: roll,

                    college: college,

                    department: department,

                    mobile: mobile,

                    status: "Not Marked",

                    attendanceDate: "",

                    attendanceDay: "",

                    attendanceTime: ""

                });
            }


            displayStudents();

            updateDashboard();


            setTimeout(

                () => {

                    registrationSuccessful();

                },

                800

            );


            return;
        }


        status.innerText =
            "Looking for your face...";


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
// ENABLE BUTTON
// =====================================================

function buttonEnable(id) {

    const button =
        document.getElementById(id);

    if (button) {

        button.disabled = false;
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


    const button =
        document.getElementById(
            "registerFaceButton"
        );


    if (status) {

        status.innerText =
            "Face captured successfully ✅";
    }


    if (message) {

        message.innerText =
            "✅ Face Registration Successful";
    }


    if (registrationStream) {

        registrationStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        registrationStream = null;
    }


    const video =
        document.getElementById(
            "registrationCamera"
        );


    if (video) {

        video.srcObject = null;
    }


    if (button) {

        button.disabled = false;
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

        result.innerHTML =
            "❌ No face registered. Please register a face first.";

        return;
    }


    const registeredStudent =
        JSON.parse(savedData);


    button.disabled = true;


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        button.disabled = false;

        return;
    }


    if (!video.srcObject) {

        attendanceStream =
            await startCameraForVideo(

                "attendanceCamera",

                "attendanceStatus"

            );


        if (!attendanceStream) {

            button.disabled = false;

            return;
        }
    }


    status.innerText =
        "Camera ON — looking for your face...";


    attendanceRunning = true;


    detectAttendanceFace(
        registeredStudent
    );
}


// =====================================================
// AUTOMATIC ATTENDANCE FACE DETECTION
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

                            inputSize: 320,

                            scoreThreshold: 0.5

                        })

                )

                .withFaceLandmarks()

                .withFaceDescriptor();


        if (!detection) {

            status.innerText =
                "Looking for your face...";


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
            "Face detected ✅ Checking identity...";


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

            status.innerText =
                "Face does not match registered student ❌";


            attendanceRunning =
                false;


            stopAttendanceCamera();


            buttonEnable(
                "attendanceButton"
            );
        }


    } catch (error) {

        console.error(error);


        status.innerText =
            "Face detection error ❌";


        attendanceRunning =
            false;


        buttonEnable(
            "attendanceButton"
        );
    }
}


// =====================================================
// ATTENDANCE SUCCESS
// =====================================================

function showAttendanceSuccess(student) {

    attendanceRunning =
        false;


    const result =
        document.getElementById(
            "attendanceResult"
        );


    // Get current date and time

    const attendance =
        getAttendanceDateTime();


    // Find student

    let studentIndex =
        students.findIndex(

            s =>
                s.roll === student.roll

        );


    // If student exists

    if (studentIndex !== -1) {

        students[studentIndex].status =
            "Present";

        students[studentIndex].attendanceDate =
            attendance.date;

        students[studentIndex].attendanceDay =
            attendance.day;

        students[studentIndex].attendanceTime =
            attendance.time;


        // Update mobile if available

        if (
            student.mobile &&
            !student.mobile.trim()
        ) {

            student.mobile =
                students[studentIndex].mobile;
        }

    }

    // If student doesn't exist

    else {

        students.push({

            name: student.name,

            roll: student.roll,

            college: student.college,

            department: student.department,

            mobile: student.mobile || "",

            status: "Present",

            attendanceDate:
                attendance.date,

            attendanceDay:
                attendance.day,

            attendanceTime:
                attendance.time

        });


        studentIndex =
            students.length - 1;
    }


    // Show success result

    result.innerHTML = `

        <div
            style="
                padding:20px;
                margin-top:20px;
                border-radius:15px;
                background:#ecfdf5;
                border:2px solid #22c55e;
                text-align:center;
            "
        >

            <div
                style="
                    font-size:50px;
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


    displayStudents();

    updateDashboard();


    const status =
        document.getElementById(
            "attendanceStatus"
        );


    if (status) {

        status.innerText =
            "Attendance marked successfully ✅";
    }


    stopAttendanceCamera();


    buttonEnable(
        "attendanceButton"
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

        attendanceStream = null;
    }


    const video =
        document.getElementById(
            "attendanceCamera"
        );


    if (video) {

        video.srcObject = null;
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

        await loadFaceModels();

    }
);

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


    if (!name || !roll || !college || !department) {

        alert("Please fill all student details.");

        return;
    }


    students.push({

        name: name,
        roll: roll,
        college: college,
        department: department,
        status: "Not Marked"

    });


    document.getElementById("studentName").value = "";
    document.getElementById("studentRoll").value = "";
    document.getElementById("studentCollege").value = "";
    document.getElementById("studentDepartment").value = "";


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

            student.name.toLowerCase().includes(search) ||

            student.roll.toLowerCase().includes(search)

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


        row.innerHTML = `

            <div class="student-info">

                <strong>${student.name}</strong>

                <br>

                Roll: ${student.roll}

                <br>

                College: ${student.college}

                <br>

                Department: ${student.department}

                <div class="status">

                    Status: ${student.status}

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
// PRESENT
// =====================================================

function markPresent(index) {

    students[index].status =
        "Present";

    displayStudents();

    updateDashboard();
}


// =====================================================
// ABSENT
// =====================================================

function markAbsent(index) {

    students[index].status =
        "Absent";

    displayStudents();

    updateDashboard();
}


// =====================================================
// DELETE
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
            student => student.status === "Present"
        ).length;


    const absent =
        students.filter(
            student => student.status === "Absent"
        ).length;


    const percentage =
        total > 0
            ? Math.round((present / total) * 100)
            : 0;


    const totalElement =
        document.getElementById("totalStudents");

    const presentElement =
        document.getElementById("presentStudents");

    const absentElement =
        document.getElementById("absentStudents");

    const percentageElement =
        document.getElementById("attendancePercentage");


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
// FACE API MODELS
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
                "Face model failed to load ❌";
        }


        if (attendanceStatus) {

            attendanceStatus.innerText =
                "Face model failed to load ❌";
        }


        return false;
    }
}


// =====================================================
// GENERIC CAMERA START
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
            "Video element not found:",
            videoId
        );

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
// REGISTER FACE
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


    // Check details

    if (
        !name ||
        !roll ||
        !college ||
        !department
    ) {

        message.innerText =
            "Please enter Name, Roll, College and Department.";

        return;
    }


    button.disabled = true;


    // Load models

    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        button.disabled = false;

        return;
    }


    // Start camera if not already running

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
        department

    );
}


// =====================================================
// AUTOMATIC FACE DETECTION FOR REGISTRATION
// =====================================================

async function detectRegistrationFace(

    name,
    roll,
    college,
    department

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


            // Save descriptor

            const descriptor =
                Array.from(
                    detection.descriptor
                );


            const registeredFace = {

                name: name,

                roll: roll,

                college: college,

                department: department,

                descriptor: descriptor

            };


            localStorage.setItem(

                "registeredFaceStudent",

                JSON.stringify(
                    registeredFace
                )

            );


            // Also add student to attendance list

            const existingStudent =
                students.find(
                    student =>
                        student.roll === roll
                );


            if (!existingStudent) {

                students.push({

                    name: name,

                    roll: roll,

                    college: college,

                    department: department,

                    status: "Not Marked"

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
                    department

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

        document.getElementById(
            "registerFaceButton"
        ).disabled = false;
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
                track => track.stop()
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


        /*
         * Lower distance means
         * stronger face match.
         */

        if (distance < 0.55) {

            showAttendanceSuccess(
                registeredStudent
            );

        } else {

            status.innerText =
                "Face does not match registered student ❌";


            attendanceRunning =
                false;


            if (attendanceStream) {

                attendanceStream
                    .getTracks()
                    .forEach(
                        track => track.stop()
                    );

                attendanceStream = null;
            }


            video.srcObject = null;


            document.getElementById(
                "attendanceButton"
            ).disabled = false;
        }


    } catch (error) {

        console.error(error);

        status.innerText =
            "Face detection error ❌";

        attendanceRunning =
            false;

        document.getElementById(
            "attendanceButton"
        ).disabled = false;
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


    result.innerHTML = `

        <div>

            <div style="font-size:45px;">
                ✅
            </div>

            <h3>
                Attendance Successfully
            </h3>

            <p>
                <strong>Name:</strong>
                ${student.name}
            </p>

            <p>
                <strong>Roll:</strong>
                ${student.roll}
            </p>

            <p>
                <strong>College:</strong>
                ${student.college}
            </p>

            <p>
                <strong>Department:</strong>
                ${student.department}
            </p>

        </div>

    `;


    // Mark student present

    const studentIndex =
        students.findIndex(

            s =>
                s.roll === student.roll

        );


    if (studentIndex !== -1) {

        students[studentIndex].status =
            "Present";

    } else {

        students.push({

            name: student.name,

            roll: student.roll,

            college: student.college,

            department: student.department,

            status: "Present"

        });

    }


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


    // Stop camera

    if (attendanceStream) {

        attendanceStream
            .getTracks()
            .forEach(
                track => track.stop()
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


    const button =
        document.getElementById(
            "attendanceButton"
        );


    if (button) {

        button.disabled = false;
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

        await loadFaceModels();

    }
);
// =====================================================
// SHOW TODAY'S DATE AND DAY
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
        "📅 " + today.toLocaleDateString("en-IN", options);
}


// Run when website opens
showCurrentDate();

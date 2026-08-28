// =====================================================
// SMART ATTENDANCE SYSTEM
// COMPLETE SCRIPT
// =====================================================


// =====================================================
// STUDENT DATA
// =====================================================

let students =
    JSON.parse(
        localStorage.getItem("students")
    ) || [];


let attendanceHistory =
    JSON.parse(
        localStorage.getItem("attendanceHistory")
    ) || [];


let registrationStream = null;

let attendanceStream = null;

let faceModelLoaded = false;

let registrationRunning = false;

let attendanceRunning = false;


// =====================================================
// FACE MODEL URL
// =====================================================

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";


// =====================================================
// SAVE DATA
// =====================================================

function saveStudents() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );
}


function saveAttendanceHistory() {

    localStorage.setItem(
        "attendanceHistory",
        JSON.stringify(attendanceHistory)
    );
}


// =====================================================
// MOBILE VALIDATION
// =====================================================

function limitMobile(input) {

    input.value =
        input.value
            .replace(/\D/g, "")
            .slice(0, 10);
}


function isValidMobile(number) {

    return /^[0-9]{10}$/.test(number);
}


// =====================================================
// DATE + TIME
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

        key:
            now.toISOString().slice(0, 10)

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


    const email =
        document.getElementById(
            "studentEmail"
        )?.value.trim() || "";


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
        email,

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
        students.filter(
            student =>

                String(student.name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(student.roll || "")
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
                students.indexOf(student);


            const row =
                document.createElement(
                    "div"
                );


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

                    <br>

                    <strong>
                        Status:
                        ${student.status}
                    </strong>

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


    saveStudents();


    saveDailyAttendance(
        students[index],
        "Present",
        attendance
    );


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


    saveStudents();


    saveDailyAttendance(
        students[index],
        "Absent",
        attendance
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


    students.splice(index, 1);


    saveStudents();


    displayStudents();

    updateDashboard();
}


// =====================================================
// DAILY ATTENDANCE SAVE
// =====================================================

function saveDailyAttendance(
    student,
    status,
    attendance
) {

    const alreadyExists =
        attendanceHistory.some(
            record =>
                record.roll === student.roll &&
                record.dateKey === attendance.key
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

        time: attendance.time,

        dateKey: attendance.key

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
// LOAD FACE MODELS
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
            "Face model error:",
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

        return null;
    }


    try {

        const stream =
            await navigator
                .mediaDevices
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
                "Camera ON 🤳";
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
// REGISTRATION
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
            "Please fill all required details.";

        return;
    }


    if (!isValidMobile(mobile)) {

        message.innerText =
            "❌ Mobile number must be exactly 10 digits.";

        return;
    }


    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        message.innerText =
            "❌ Please enter a valid email.";

        return;
    }


    button.disabled =
        true;


    const modelsReady =
        await loadFaceModels();


    if (!modelsReady) {

        message.innerText =
            "❌ Face model could not load.";

        button.disabled =
            false;

        return;
    }


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
        "🤳 Camera ON — Looking for your face...";


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
                "✅ Face detected — Capturing...";


            const descriptor =
                Array.from(
                    detection.descriptor
                );


            const registeredStudent = {

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
                JSON.stringify(
                    registeredStudent
                )
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
                registeredStudent
            );


            return;
        }


        status.innerText =
            "🤳 Looking for your face...";


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

function registrationSuccessful(student) {

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
                    👤 <strong>
                    ${student.name}
                    </strong>
                </p>

                <p>
                    🔢 Roll:
                    ${student.roll}
                </p>

                <p>
                    📱 Mobile:
                    ${student.mobile}
                </p>

                <p>
                    📧 Email:
                    ${student.email || "Not added"}
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

            <div class="success-message">

                ❌ No face registered.

                <br><br>

                Please complete Face Registration first.

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
        "🤳 Camera ON — Looking for your face...";


    result.innerHTML = "";


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
                "🤳 Looking for your face...";


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

            status.innerText =
                "❌ Face does not match.";

            attendanceRunning =
                false;


            stopAttendanceCamera();


            buttonEnable(
                "attendanceButton"
            );


            alert(
                "❌ Face does not match the registered student."
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


    saveStudents();


    // SAVE TODAY'S ATTENDANCE

    saveDailyAttendance(
        students[index],
        "Present",
        attendance
    );


    // MESSAGE

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


            <div class="notification-info">

                📩 Attendance notification information
                saved successfully.

                <br>

                📱 ${student.mobile || "Mobile not added"}

                <br>

                📧 ${student.email || "Email not added"}

            </div>


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


    alert(
        "✅ Attendance Successfully Marked!\n\n" +

        "Name: " +
        student.name +

        "\nDate: " +
        attendance.date +

        "\nDay: " +
        attendance.day +

        "\nTime: " +
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


    modal.classList.add(
        "show"
    );


    toggleMenu();
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
            "Mobile number must contain exactly 10 digits."
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
            "Enter your 10 digit mobile number:"
        );


    if (!mobile) return;


    if (!isValidMobile(mobile)) {

        alert(
            "❌ Mobile number must be exactly 10 digits."
        );

        return;
    }


    const student =
        JSON.parse(saved);


    student.mobile =
        mobile;


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
            mobile;

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


    toggleMenu();
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


    toggleMenu();
}


// =====================================================
// ATTENDANCE SUMMARY
// =====================================================

function calculateAttendanceSummary() {

    const totalDays =
        new Set(
            attendanceHistory.map(
                record => record.dateKey
            )
        ).size;


    const presentDays =
        attendanceHistory.filter(
            record =>
                record.status === "Present"
        ).length;


    const absentDays =
        attendanceHistory.filter(
            record =>
                record.status === "Absent"
        ).length;


    document.getElementById(
        "attendanceTotalDays"
    ).innerText =
        totalDays;


    document.getElementById(
        "attendancePresentDays"
    ).innerText =
        presentDays;


    document.getElementById(
        "attendanceAbsentDays"
    ).innerText =
        absentDays;
}


// =====================================================
// DISPLAY ATTENDANCE HISTORY
// =====================================================

function displayAttendanceHistory() {

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


    const sorted =
        [...attendanceHistory].reverse();


    sorted.forEach(
        record => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "history-day " +
                (
                    record.status === "Present"
                        ? "history-present"
                        : "history-absent"
                );


            div.innerHTML = `

                <strong>
                    ${record.status === "Present"
                        ? "🟢"
                        : "🔴"
                    }

                    ${record.status}
                </strong>

                <br><br>

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

                <br>

                🕐 Time:
                ${record.time}

            `;


            history.appendChild(div);

        }
    );
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

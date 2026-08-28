let students = [];

function addStudent() {

    const nameInput = document.getElementById("studentName");
    const rollInput = document.getElementById("studentRoll");
    const collegeInput = document.getElementById("studentCollege");
    const departmentInput = document.getElementById("studentDepartment");

    const name = nameInput.value.trim();
    const roll = rollInput.value.trim();
    const college = collegeInput.value.trim();
    const department = departmentInput.value.trim();

    if (!name || !roll || !college || !department) {
        alert("Please fill all student details.");
        return;
    }

    const duplicate = students.some(
        student => student.roll === roll
    );

    if (duplicate) {
        alert("This roll number already exists.");
        return;
    }

    students.push({
        name: name,
        roll: roll,
        college: college,
        department: department,
        status: null
    });

    nameInput.value = "";
    rollInput.value = "";
    collegeInput.value = "";
    departmentInput.value = "";

    displayStudents();
    updateDashboard();
}


// Display Students
<strong>${student.name}</strong>
<br>
Roll: ${student.roll}
<br>
College: ${student.college}
<br>
Department: ${student.department}
function displayStudents() {
    const list = document.getElementById("studentList");
    const searchInput = document.getElementById("searchStudent");

    const searchText = searchInput.value.toLowerCase().trim();

    list.innerHTML = "";

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchText) ||
        student.roll.toLowerCase().includes(searchText)
    );

    if (filteredStudents.length === 0) {
        list.innerHTML = "<p>No students found.</p>";
        return;
    }

    filteredStudents.forEach(student => {

        const index = students.indexOf(student);

        const row = document.createElement("div");

        row.className = "student-row";

        let statusText = "Not Marked";

        if (student.status === "Present") {
            statusText = "Present";
        }

        if (student.status === "Absent") {
            statusText = "Absent";
        }

        row.innerHTML = `
            <div class="student-info">
                <strong>${student.name}</strong>
                <br>
                Roll: ${student.roll}
                <div class="status">
                    Status: ${statusText}
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


// Mark Present
function markPresent(index) {
    students[index].status = "Present";

    displayStudents();
    updateDashboard();
}


// Mark Absent
function markAbsent(index) {
    students[index].status = "Absent";

    displayStudents();
    updateDashboard();
}


// Delete Student
function deleteStudent(index) {

    const studentName = students[index].name;

    const confirmDelete = confirm(
        "Delete " + studentName + "?"
    );

    if (!confirmDelete) {
        return;
    }

    students.splice(index, 1);

    displayStudents();
    updateDashboard();
}


// Update Dashboard
function updateDashboard() {

    const total = students.length;

    const present = students.filter(
        student => student.status === "Present"
    ).length;

    const absent = students.filter(
        student => student.status === "Absent"
    ).length;

    let percentage = 0;

    if (total > 0) {
        percentage = Math.round((present / total) * 100);
    }

    document.getElementById("totalStudents").innerText = total;

    document.getElementById("presentStudents").innerText = present;

    document.getElementById("absentStudents").innerText = absent;

    document.getElementById("attendancePercentage").innerText =
        percentage + "%";
}


// Start Dashboard
displayStudents();
updateDashboard();
async function startCamera() {
    const video = document.getElementById("camera");
    const message = document.getElementById("faceMessage");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;

        message.innerText =
            "Camera is ON. Face detection will be added next.";

    } catch (error) {
        console.error(error);

        message.innerText =
            "Camera permission was denied or camera is unavailable.";
    }
}
function captureFace() {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("snapshot");
    const message = document.getElementById("captureMessage");

    if (!video.srcObject) {
        message.innerText = "First click Start Camera.";
        return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
        message.innerText = "Camera is not ready. Please wait a moment.";
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.maxWidth = "500px";
    canvas.style.margin = "15px auto";
window.addEventListener("load", function () {
    if (typeof faceapi !== "undefined") {
        console.log("Face recognition library loaded successfully.");
    } else {
        console.log("Face recognition library failed to load.");
    }
});
    const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";

let faceModelsLoaded = false;
let detectionRunning = false;


// Load face detection model
async function loadFaceDetectionModels() {

    const message =
        document.getElementById("faceDetectionMessage");

    try {

        message.innerText =
            "Loading face detection model...";

        await faceapi.nets.tinyFaceDetector.loadFromUri(
            MODEL_URL
        );

        faceModelsLoaded = true;

        message.innerText =
            "Face detection ready ✅";

    } catch (error) {

        console.error(error);

        message.innerText =
            "Face detection model failed to load.";

    }
}


// Start face detection
async function startFaceDetection() {

    const video = document.getElementById("camera");
    const canvas = document.getElementById("faceCanvas");
    const message =
        document.getElementById("faceDetectionMessage");

    if (!faceModelsLoaded) {
        message.innerText =
            "Please wait for face detection to load.";
        return;
    }

    if (!video.srcObject) {
        message.innerText =
            "First click Start Camera.";
        return;
    }

    detectionRunning = true;

    const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight
    };

    faceapi.matchDimensions(canvas, displaySize);

    async function detect() {

        if (!detectionRunning) return;

        const detections =
            await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: 0.5
                })
            );

        const resizedDetections =
            faceapi.resizeResults(
                detections,
                displaySize
            );

        const ctx = canvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        faceapi.draw.drawDetections(
            canvas,
            resizedDetections
        );

        if (detections.length > 0) {

            message.innerText =
                "Face detected ✅";

        } else {

            message.innerText =
                "Looking for a face...";

        }

        requestAnimationFrame(detect);
    }

    detect();
}


// Load model when page opens
window.addEventListener(
    "load",
    loadFaceDetectionModels
);
    message.innerText = "Photo captured successfully!";

    console.log("Photo captured successfully.");
}
// ==========================================
// AUTOMATIC FACE REGISTRATION
// ==========================================

const FACE_MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";

let faceRegistrationRunning = false;
let faceRegistrationStream = null;
let faceModelReady = false;


// Load face detector model
async function loadAutomaticFaceModel() {

    const status =
        document.getElementById("faceStatus");

    if (typeof faceapi === "undefined") {

        status.innerText =
            "Face recognition library not loaded.";

        return false;
    }

    try {

        status.innerText =
            "Loading face detection...";

        await faceapi.nets.tinyFaceDetector.loadFromUri(
            FACE_MODEL_URL
        );

        faceModelReady = true;

        status.innerText =
            "Face detection ready. Click the button.";

        return true;

    } catch (error) {

        console.error(
            "Face model error:",
            error
        );

        status.innerText =
            "Face model could not be loaded.";

        return false;
    }
}


// Start automatic registration
async function startAutomaticFaceRegistration() {

    const name =
        document.getElementById("faceName").value.trim();

    const roll =
        document.getElementById("faceRoll").value.trim();

    const college =
        document.getElementById("collegeName").value.trim();

    const department =
        document.getElementById("departmentName").value.trim();

    const video =
        document.getElementById("camera");

    const status =
        document.getElementById("faceStatus");

    const message =
        document.getElementById("captureMessage");

    const button =
        document.getElementById("registerFaceButton");


    // Check student information

    if (
        !name ||
        !roll ||
        !college ||
        !department
    ) {

        message.innerText =
            "Please fill Name, Roll, College and Department first.";

        return;
    }


    button.disabled = true;

    message.innerText =
        "";


    // Load model if needed

    if (!faceModelReady) {

        const loaded =
            await loadAutomaticFaceModel();

        if (!loaded) {

            button.disabled = false;

            return;
        }
    }


    // Start camera

    try {

        status.innerText =
            "Requesting camera permission...";

        faceRegistrationStream =
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
            faceRegistrationStream;

        await video.play();

        status.innerText =
            "Camera ON — looking for your face...";

        faceRegistrationRunning = true;


        // Start automatic detection

        detectFaceForRegistration(
            name,
            roll,
            college,
            department
        );


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        status.innerText =
            "Camera permission was denied or camera is unavailable.";

        button.disabled = false;
    }
}


// Detect face automatically
async function detectFaceForRegistration(
    name,
    roll,
    college,
    department
) {

    if (!faceRegistrationRunning) {
        return;
    }


    const video =
        document.getElementById("camera");

    const status =
        document.getElementById("faceStatus");


    try {

        const detections =
            await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: 0.5
                })
            );


        if (detections.length === 1) {

            status.innerText =
                "Face detected ✅ Hold still...";

            // Wait a little so the face is stable
            setTimeout(function () {

                if (faceRegistrationRunning) {

                    captureRegisteredFace(
                        name,
                        roll,
                        college,
                        department
                    );

                }

            }, 1200);

            return;
        }


        if (detections.length > 1) {

            status.innerText =
                "Please keep only one face in the camera.";

        } else {

            status.innerText =
                "Looking for your face...";

        }


        setTimeout(function () {

            detectFaceForRegistration(
                name,
                roll,
                college,
                department
            );

        }, 250);


    } catch (error) {

        console.error(
            "Face detection error:",
            error
        );

        status.innerText =
            "Face detection error.";

        faceRegistrationRunning = false;

        document.getElementById(
            "registerFaceButton"
        ).disabled = false;
    }
}


// Capture automatically
function captureRegisteredFace(
    name,
    roll,
    college,
    department
) {

    const video =
        document.getElementById("camera");

    const canvas =
        document.getElementById("snapshot");

    const status =
        document.getElementById("faceStatus");

    const message =
        document.getElementById("captureMessage");

    const button =
        document.getElementById("registerFaceButton");


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    const context =
        canvas.getContext("2d");


    // Undo mirror when saving photo
    context.save();

    context.translate(
        canvas.width,
        0
    );

    context.scale(
        -1,
        1
    );


    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    context.restore();


    const photo =
        canvas.toDataURL(
            "image/jpeg",
            0.90
        );


    // Save registration locally
    const registration = {

        name: name,

        roll: roll,

        college: college,

        department: department,

        photo: photo,

        registeredAt:
            new Date().toISOString()
    };


    localStorage.setItem(
        "registeredFaceStudent",
        JSON.stringify(registration)
    );


    status.innerText =
        "Face registered successfully ✅";


    message.innerText =
        name +
        " has been registered successfully!";


    faceRegistrationRunning =
        false;


    button.disabled =
        false;


    // Stop camera
    if (faceRegistrationStream) {

        faceRegistrationStream
            .getTracks()
            .forEach(track => track.stop());

        faceRegistrationStream = null;
    }


    video.srcObject =
        null;
}


// Try loading the model when page opens
window.addEventListener(
    "load",
    function () {

        setTimeout(
            loadAutomaticFaceModel,
            500
        );

    }
);

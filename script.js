// =====================================================
// SMART ATTENDANCE SYSTEM
// =====================================================

const ADMIN_DEFAULT = {
    name: "Pradyut Chatterjee",
    pin: "1234"
};

const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";

let students =
    JSON.parse(
        localStorage.getItem("students") || "[]"
    );

let attendanceHistory =
    JSON.parse(
        localStorage.getItem("attendanceHistory") || "[]"
    );

let registeredFace =
    JSON.parse(
        localStorage.getItem("registeredFaceStudent") || "null"
    );

let session =
    JSON.parse(
        sessionStorage.getItem("session") || "null"
    );

let faceModelLoaded = false;

let attendanceRunning = false;
let registrationRunning = false;

let attendanceStream = null;
let registrationStream = null;


// =====================================================
// SAVE
// =====================================================

function save(){

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

    localStorage.setItem(
        "attendanceHistory",
        JSON.stringify(attendanceHistory)
    );

    if(registeredFace){

        localStorage.setItem(
            "registeredFaceStudent",
            JSON.stringify(registeredFace)
        );

    }

}


// =====================================================
// DATE / DAY / TIME
// =====================================================

function today(){

    const d = new Date();

    return {

        date:
            d.toLocaleDateString(
                "en-IN",
                {
                    day:"numeric",
                    month:"long",
                    year:"numeric"
                }
            ),

        day:
            d.toLocaleDateString(
                "en-IN",
                {
                    weekday:"long"
                }
            ),

        time:
            d.toLocaleTimeString(
                "en-IN",
                {
                    hour:"numeric",
                    minute:"2-digit",
                    second:"2-digit",
                    hour12:true
                }
            ),

        key:
            d.toLocaleDateString(
                "en-CA"
            )

    };

}


// =====================================================
// LOGIN TAB
// =====================================================

function showLogin(type){

    document
        .getElementById("studentLogin")
        .classList
        .toggle(
            "hidden",
            type !== "student"
        );

    document
        .getElementById("adminLogin")
        .classList
        .toggle(
            "hidden",
            type !== "admin"
        );


    document
        .querySelectorAll(".tab")
        .forEach(
            (button,index)=>{

                button.classList.toggle(
                    "active",
                    (type==="student" && index===0) ||
                    (type==="admin" && index===1)
                );

            }
        );

}


// =====================================================
// CREATE ACCOUNT
// =====================================================

function openCreateAccount(){

    document
        .getElementById("createModal")
        .classList
        .remove("hidden");

}


function closeModal(id){

    document
        .getElementById(id)
        .classList
        .add("hidden");

}


function validPin(pin){

    return /^\d{4,6}$/.test(pin);

}


function validMobile(mobile){

    return /^\d{10}$/.test(mobile);

}


function createAccount(){

    const name =
        document
            .getElementById("createName")
            .value
            .trim();

    const email =
        document
            .getElementById("createEmail")
            .value
            .trim()
            .toLowerCase();

    const pin =
        document
            .getElementById("createPin")
            .value
            .trim();


    if(
        !name ||
        !email ||
        !validPin(pin)
    ){

        alert(
            "Name, valid email and 4-6 digit PIN are required."
        );

        return;

    }


    if(
        students.some(
            student =>
                student.email === email
        )
    ){

        alert(
            "This email already has an account."
        );

        return;

    }


    students.push({

        name:name,

        email:email,

        pin:pin,

        roll:"",

        college:
            "Hooghly Engineering & Technology College",

        department:"",

        mobile:"",

        status:"Not Marked"

    });


    save();


    closeModal(
        "createModal"
    );


    alert(
        "✅ Account created successfully.\n\nNow login."
    );

}


// =====================================================
// STUDENT LOGIN
// =====================================================

function studentLogin(){

    const name =
        document
            .getElementById("studentLoginName")
            .value
            .trim();

    const email =
        document
            .getElementById("studentLoginEmail")
            .value
            .trim()
            .toLowerCase();

    const pin =
        document
            .getElementById("studentLoginPin")
            .value
            .trim();


    const student =
        students.find(
            s =>
                s.name.toLowerCase() ===
                name.toLowerCase() &&

                s.email === email &&

                s.pin === pin
        );


    if(!student){

        alert(
            "❌ Student login details are incorrect."
        );

        return;

    }


    session = {

        role:"student",

        name:student.name,

        email:student.email

    };


    sessionStorage.setItem(
        "session",
        JSON.stringify(session)
    );


    openApp();

}


// =====================================================
// ADMIN LOGIN
// =====================================================

function adminLogin(){

    const name =
        document
            .getElementById("adminLoginName")
            .value
            .trim();

    const pin =
        document
            .getElementById("adminLoginPin")
            .value
            .trim();

    const savedPin =
        localStorage.getItem("adminPin") ||
        ADMIN_DEFAULT.pin;


    if(
        name !== ADMIN_DEFAULT.name ||
        pin !== savedPin
    ){

        alert(
            "❌ Admin name or PIN is incorrect."
        );

        return;

    }


    session = {

        role:"admin",

        name:ADMIN_DEFAULT.name

    };


    sessionStorage.setItem(
        "session",
        JSON.stringify(session)
    );


    openApp();

}


// =====================================================
// FORGOT STUDENT PIN
// =====================================================

function forgotStudentPin(){

    let email =
        prompt(
            "Enter your registered student email:"
        );


    if(!email) return;


    email =
        email
            .trim()
            .toLowerCase();


    const student =
        students.find(
            s =>
                s.email === email
        );


    if(!student){

        alert(
            "❌ No student account found for this email."
        );

        return;

    }


    const newPin =
        prompt(
            "Enter a new PIN (4-6 digits):"
        );


    if(!validPin(newPin)){

        alert(
            "PIN must contain 4-6 digits."
        );

        return;

    }


    student.pin =
        newPin;


    save();


    alert(
        "✅ Student PIN changed successfully."
    );

}


// =====================================================
// FORGOT ADMIN PIN
// =====================================================

function forgotAdminPin(){

    const code =
        prompt(
            "Enter Admin recovery code:\nADMIN-RESET"
        );


    if(
        code !== "ADMIN-RESET"
    ){

        alert(
            "❌ Incorrect recovery code."
        );

        return;

    }


    const newPin =
        prompt(
            "Enter new Admin PIN (4-6 digits):"
        );


    if(!validPin(newPin)){

        alert(
            "PIN must contain 4-6 digits."
        );

        return;

    }


    localStorage.setItem(
        "adminPin",
        newPin
    );


    alert(
        "✅ Admin PIN changed successfully."
    );

}


// =====================================================
// CHANGE PIN
// =====================================================

function changeMyPin(){

    if(
        session &&
        session.role === "admin"
    ){

        forgotAdminPin();

    }
    else{

        forgotStudentPin();

    }

}


// =====================================================
// LOGOUT
// =====================================================

function logout(){

    stopCamera();

    session = null;

    sessionStorage.removeItem(
        "session"
    );


    document
        .getElementById("appPage")
        .classList
        .add("hidden");


    document
        .getElementById("loginPage")
        .classList
        .remove("hidden");

}


// =====================================================
// OPEN APP
// =====================================================

function openApp(){

    document
        .getElementById("loginPage")
        .classList
        .add("hidden");


    document
        .getElementById("appPage")
        .classList
        .remove("hidden");


    updateDashboard();

    showSection(
        "dashboard"
    );

}


// =====================================================
// MENU
// =====================================================

function toggleMenu(){

    document
        .getElementById("sideMenu")
        .classList
        .toggle("show");

}


function toggleMenuClose(){

    document
        .getElementById("sideMenu")
        .classList
        .remove("show");

}


// =====================================================
// SECTION
// =====================================================

function showSection(id){

    document
        .querySelectorAll(
            "main .section"
        )
        .forEach(
            section =>
                section.classList.add("hidden")
        );


    const section =
        document.getElementById(id);


    if(section){

        section.classList.remove(
            "hidden"
        );

    }


    toggleMenuClose();


    if(
        id === "faceRegistration"
    ){

        prepareRegistration();

    }

}


// =====================================================
// PREPARE REGISTRATION
// =====================================================

function prepareRegistration(){

    if(
        !session ||
        session.role !== "student"
    ){

        return;

    }


    const student =
        students.find(
            s =>
                s.email ===
                session.email
        );


    if(!student){

        return;

    }


    document
        .getElementById("faceName")
        .value =
        student.name || "";


    document
        .getElementById("faceEmail")
        .value =
        student.email || "";


    document
        .getElementById("faceRoll")
        .value =
        student.roll || "";


    document
        .getElementById("collegeName")
        .value =
        student.college ||
        "Hooghly Engineering & Technology College";


    document
        .getElementById("departmentName")
        .value =
        student.department || "";


    document
        .getElementById("faceMobile")
        .value =
        student.mobile || "";

}


// =====================================================
// DASHBOARD
// =====================================================

function updateDashboard(){

    if(!session) return;


    const t =
        today();


    const present =
        students.filter(
            s =>
                s.status === "Present" &&
                s.attendanceKey === t.key
        ).length;


    const absent =
        students.filter(
            s =>
                s.status === "Absent" &&
                s.attendanceKey === t.key
        ).length;


    document
        .getElementById("totalStudents")
        .textContent =
        students.length;


    document
        .getElementById("presentStudents")
        .textContent =
        present;


    document
        .getElementById("absentStudents")
        .textContent =
        absent;


    document
        .getElementById("attendancePercentage")
        .textContent =
        students.length
            ? Math.round(
                present /
                students.length *
                100
            ) + "%"
            : "0%";


    document
        .getElementById("welcomeTitle")
        .textContent =
        "Welcome, " +
        session.name +
        "!";


    document
        .getElementById("welcomeText")
        .textContent =
        session.role === "admin"

            ?

        "Welcome Administrator. Manage student attendance from the menu."

            :

        "Welcome to your student dashboard. Your attendance is recorded automatically after face recognition.";


    document
        .getElementById("roleText")
        .textContent =
        session.role === "admin"
            ? "👑 Administrator"
            : "🎓 Student";


    document
        .getElementById("todayText")
        .textContent =
        "📅 " +
        t.day +
        ", " +
        t.date;

}


// =====================================================
// LOAD FACE MODELS
// =====================================================

async function loadModels(){

    if(faceModelLoaded){

        return true;

    }


    try{

        await faceapi.nets.tinyFaceDetector
            .loadFromUri(MODEL_URL);


        await faceapi.nets.faceLandmark68Net
            .loadFromUri(MODEL_URL);


        await faceapi.nets.faceRecognitionNet
            .loadFromUri(MODEL_URL);


        faceModelLoaded =
            true;


        return true;

    }
    catch(error){

        console.error(
            error
        );


        alert(
            "Face model could not load. Check your GitHub Pages connection."
        );


        return false;

    }

}


// =====================================================
// CAMERA
// =====================================================

async function startCamera(
    videoId,
    statusId
){

    const video =
        document.getElementById(
            videoId
        );


    const status =
        document.getElementById(
            statusId
        );


    try{

        const stream =
            await navigator.mediaDevices
                .getUserMedia({

                    video:{

                        facingMode:"user",

                        width:{
                            ideal:640
                        },

                        height:{
                            ideal:480
                        }

                    },

                    audio:false

                });


        video.srcObject =
            stream;


        await video.play();


        status.textContent =
            "Camera ON 🤳 — Mirror / Selfie View";


        return stream;

    }
    catch(error){

        console.error(
            error
        );


        status.textContent =
            "Camera permission unavailable ❌";


        alert(
            "Camera permission is required. Allow camera access on your GitHub Pages site."
        );


        return null;

    }

}


// =====================================================
// FACE REGISTRATION
// =====================================================

async function startAutomaticFaceRegistration(){

    const name =
        document
            .getElementById("faceName")
            .value
            .trim();


    const roll =
        document
            .getElementById("faceRoll")
            .value
            .trim();


    const college =
        document
            .getElementById("collegeName")
            .value
            .trim();


    const department =
        document
            .getElementById("departmentName")
            .value
            .trim();


    const mobile =
        document
            .getElementById("faceMobile")
            .value
            .trim();


    const email =
        document
            .getElementById("faceEmail")
            .value
            .trim()
            .toLowerCase();


    const message =
        document
            .getElementById(
                "registrationMessage"
            );


    if(
        !name ||
        !roll ||
        !college ||
        !department
    ){

        message.innerHTML =
            `
            <div class="success-message">
                ⚠️ Please fill all student details.
            </div>
            `;

        return;

    }


    if(
        !validMobile(mobile)
    ){

        message.innerHTML =
            `
            <div class="success-message">
                ⚠️ Mobile number must be exactly 10 digits.
            </div>
            `;

        return;

    }


    let finalEmail =
        email;


    if(
        !finalEmail &&
        session &&
        session.role === "student"
    ){

        finalEmail =
            session.email;

    }


    if(
        !await loadModels()
    ){

        return;

    }


    const button =
        document.getElementById(
            "registerFaceButton"
        );


    button.disabled =
        true;


    if(!registrationStream){

        registrationStream =
            await startCamera(
                "registrationCamera",
                "registrationStatus"
            );

    }


    if(!registrationStream){

        button.disabled =
            false;

        return;

    }


    registrationRunning =
        true;


    document
        .getElementById(
            "registrationStatus"
        )
        .textContent =
        "Looking for your face... 🤳";


    detectRegistration(
        name,
        roll,
        college,
        department,
        mobile,
        finalEmail
    );

}


// =====================================================
// DETECT REGISTRATION FACE
// =====================================================

async function detectRegistration(
    name,
    roll,
    college,
    department,
    mobile,
    email
){

    if(
        !registrationRunning
    ){

        return;

    }


    try{

        const video =
            document.getElementById(
                "registrationCamera"
            );


        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions({

                        inputSize:320,

                        scoreThreshold:0.5

                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        if(detection){

            registeredFace = {

                name:name,

                roll:roll,

                college:college,

                department:department,

                mobile:mobile,

                email:email,

                descriptor:
                    Array.from(
                        detection.descriptor
                    )

            };


            let student =
                students.find(
                    s =>
                        s.email === email
                );


            if(!student){

                student =
                    students.find(
                        s =>
                            s.roll === roll
                    );

            }


            if(!student){

                student = {

                    name:name,

                    email:email,

                    pin:"",

                    roll:roll,

                    college:college,

                    department:department,

                    mobile:mobile,

                    status:"Not Marked"

                };


                students.push(
                    student
                );

            }
            else{

                Object.assign(
                    student,
                    {

                        name:name,

                        roll:roll,

                        college:college,

                        department:department,

                        mobile:mobile,

                        email:email

                    }
                );

            }


            save();


            registrationRunning =
                false;


            stopRegistrationCamera();


            document
                .getElementById(
                    "registrationStatus"
                )
                .textContent =
                "✅ Face Captured Successfully";


            document
                .getElementById(
                    "registrationMessage"
                )
                .innerHTML =

                `
                <div class="success-message">

                    <div style="font-size:48px">
                        😊
                    </div>

                    <h3>
                        Face Captured Successfully!
                    </h3>

                    <p>
                        🎉 Face Registration Completed
                    </p>

                </div>
                `;


            alert(
                "😊 Face Captured Successfully!\n\n" +
                "🎉 Face Registration Completed"
            );


            document
                .getElementById(
                    "registerFaceButton"
                )
                .disabled =
                false;


            return;

        }


        setTimeout(
            () =>
                detectRegistration(
                    name,
                    roll,
                    college,
                    department,
                    mobile,
                    email
                ),
            300
        );

    }
    catch(error){

        console.error(
            error
        );


        registrationRunning =
            false;


        document
            .getElementById(
                "registerFaceButton"
            )
            .disabled =
            false;


        document
            .getElementById(
                "registrationStatus"
            )
            .textContent =
            "Face detection error ❌";

    }

}


// =====================================================
// FACE ATTENDANCE
// =====================================================

async function startFaceAttendance(){

    if(!registeredFace){

        alert(
            "❌ Please register your face first."
        );

        return;

    }


    if(
        !await loadModels()
    ){

        return;

    }


    const button =
        document.getElementById(
            "attendanceButton"
        );


    button.disabled =
        true;


    if(!attendanceStream){

        attendanceStream =
            await startCamera(
                "attendanceCamera",
                "attendanceStatus"
            );

    }


    if(!attendanceStream){

        button.disabled =
            false;

        return;

    }


    attendanceRunning =
        true;


    document
        .getElementById(
            "attendanceStatus"
        )
        .textContent =
        "Camera ON — looking for your face... 🤳";


    document
        .getElementById(
            "attendanceResult"
        )
        .innerHTML =
        "";


    detectAttendance();

}


// =====================================================
// DETECT ATTENDANCE
// =====================================================

async function detectAttendance(){

    if(
        !attendanceRunning
    ){

        return;

    }


    try{

        const video =
            document.getElementById(
                "attendanceCamera"
            );


        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions({

                        inputSize:320,

                        scoreThreshold:0.5

                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();


        if(!detection){

            setTimeout(
                detectAttendance,
                300
            );

            return;

        }


        const distance =
            faceapi.euclideanDistance(

                detection.descriptor,

                new Float32Array(
                    registeredFace.descriptor
                )

            );


        if(
            distance < 0.55
        ){

            markAttendance();

        }
        else{

            attendanceRunning =
                false;


            stopAttendanceCamera();


            document
                .getElementById(
                    "attendanceStatus"
                )
                .textContent =
                "Face does not match ❌";


            document
                .getElementById(
                    "attendanceButton"
                )
                .disabled =
                false;


            alert(
                "❌ Face does not match the registered student."
            );

        }

    }
    catch(error){

        console.error(
            error
        );


        attendanceRunning =
            false;


        document
            .getElementById(
                "attendanceButton"
            )
            .disabled =
            false;


        document
            .getElementById(
                "attendanceStatus"
            )
            .textContent =
            "Face detection error ❌";

    }

}


// =====================================================
// MARK ATTENDANCE
// =====================================================

function markAttendance(){

    attendanceRunning =
        false;


    const t =
        today();


    let student =
        students.find(
            s =>
                s.roll ===
                registeredFace.roll
        );


    if(!student){

        student =
            students.find(
                s =>
                    s.email ===
                    registeredFace.email
            );

    }


    if(!student){

        student = {

            name:registeredFace.name,

            email:registeredFace.email,

            pin:"",

            roll:registeredFace.roll,

            college:registeredFace.college,

            department:registeredFace.department,

            mobile:registeredFace.mobile,

            status:"Not Marked"

        };


        students.push(
            student
        );

    }


    student.status =
        "Present";


    student.attendanceKey =
        t.key;


    student.attendanceDate =
        t.date;


    student.attendanceDay =
        t.day;


    student.attendanceTime =
        t.time;


    const alreadyMarked =
        attendanceHistory.find(
            record =>

                record.studentEmail ===
                student.email &&

                record.dateKey ===
                t.key
        );


    if(!alreadyMarked){

        attendanceHistory.push({

            studentEmail:
                student.email,

            name:
                student.name,

            roll:
                student.roll,

            dateKey:
                t.key,

            date:
                t.date,

            day:
                t.day,

            time:
                t.time,

            status:
                "Present"

        });

    }


    save();


    stopAttendanceCamera();


    document
        .getElementById(
            "attendanceStatus"
        )
        .textContent =
        "Attendance marked successfully ✅";


    document
        .getElementById(
            "attendanceButton"
        )
        .disabled =
        false;


    // SUCCESS POPUP ON PAGE

    document
        .getElementById(
            "attendanceResult"
        )
        .innerHTML =

        `
        <div class="success-message">

            <div style="font-size:50px">
                😊
            </div>

            <h3>
                Attendance Successfully Marked!
            </h3>

            <p>
                <b>👤 Name:</b>
                ${student.name}
            </p>

            <p>
                <b>🔢 Roll:</b>
                ${student.roll || "Not added"}
            </p>

            <p>
                <b>🏫 College:</b>
                ${student.college}
            </p>

            <p>
                <b>🎓 Department:</b>
                ${student.department}
            </p>

            <hr>

            <p>
                <b>📅 Date:</b>
                ${t.date}
            </p>

            <p>
                <b>📆 Day:</b>
                ${t.day}
            </p>

            <p>
                <b>🕐 Exact Time:</b>
                ${t.time}
            </p>

        </div>
        `;


    // POPUP

    alert(

        "😊 Attendance Successfully Marked!\n\n" +

        "Name: " +
        student.name +

        "\nRoll: " +
        student.roll +

        "\nDate: " +
        t.date +

        "\nDay: " +
        t.day +

        "\nTime: " +
        t.time

    );


    updateDashboard();

}


// =====================================================
// STOP REGISTRATION CAMERA
// =====================================================

function stopRegistrationCamera(){

    if(
        registrationStream
    ){

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


    if(video){

        video.srcObject =
            null;

    }

}


// =====================================================
// STOP ATTENDANCE CAMERA
// =====================================================

function stopAttendanceCamera(){

    if(
        attendanceStream
    ){

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


    if(video){

        video.srcObject =
            null;

    }

}


// =====================================================
// STOP ALL CAMERA
// =====================================================

function stopCamera(){

    registrationRunning =
        false;

    attendanceRunning =
        false;


    stopRegistrationCamera();

    stopAttendanceCamera();

}


// =====================================================
// REGISTERED STUDENTS
// =====================================================

function showRegisteredStudents(){

    const list =
        document.getElementById(
            "registeredStudentsList"
        );


    list.innerHTML =

        students.length

            ?

        students
            .map(
                (student,index) =>

                `
                <div class="student-item">

                    <b>
                        ${index+1}.
                        ${student.name}
                    </b>

                    <br>

                    🔢 Roll:
                    ${student.roll || "Not added"}

                    <br>

                    ✉️ Email:
                    ${student.email || "Not added"}

                    <br>

                    🏫 College:
                    ${student.college || ""}

                    <br>

                    🎓 Department:
                    ${student.department || ""}

                    <br>

                    📱 Mobile:
                    ${student.mobile || "Not added"}

                    <br>

                    📌 Status:
                    ${student.status || "Not Marked"}

                </div>
                `
            )
            .join("")

            :

        "<p>No students registered.</p>";


    document
        .getElementById(
            "studentsModal"
        )
        .classList
        .remove("hidden");


    toggleMenuClose();

}


// =====================================================
// CHECK ATTENDANCE
// =====================================================

function showCheckAttendance(){

    const days =
        [
            ...new Set(
                attendanceHistory.map(
                    item =>
                        item.dateKey
                )
            )
        ]
        .sort()
        .reverse();


    const present =
        attendanceHistory.filter(
            item =>
                item.status ===
                "Present"
        ).length;


    document
        .getElementById(
            "attendanceTotalDays"
        )
        .textContent =
        days.length;


    document
        .getElementById(
            "attendancePresentDays"
        )
        .textContent =
        present;


    document
        .getElementById(
            "attendanceAbsentDays"
        )
        .textContent =
        Math.max(
            0,
            days.length - present
        );


    const history =
        document.getElementById(
            "attendanceHistory"
        );


    if(!days.length){

        history.innerHTML =
            "<p>No attendance history yet.</p>";

    }
    else{

        history.innerHTML =
            days
                .map(
                    day => {

                        const rows =
                            attendanceHistory.filter(
                                item =>
                                    item.dateKey ===
                                    day
                            );


                        return `

                        <div class="history-item">

                            <b>
                                📅
                                ${rows[0].date}
                                —
                                ${rows[0].day}
                            </b>

                            <br><br>

                            ${rows
                                .map(
                                    item =>

                                    `
                                    👤
                                    ${item.name}

                                    (${item.roll || "No roll"})

                                    —

                                    ${item.status}

                                    —

                                    🕐
                                    ${item.time}
                                    `
                                )
                                .join("<br>")}

                        </div>

                        `;

                    }
                )
                .join("");

    }


    document
        .getElementById(
            "attendanceModal"
        )
        .classList
        .remove("hidden");


    toggleMenuClose();

}


// =====================================================
// EDIT DETAILS
// =====================================================

function editMyDetails(){

    if(
        session.role === "admin"
    ){

        alert(
            "Admin details are fixed to Pradyut Chatterjee in this demo."
        );

        return;

    }


    const student =
        students.find(
            s =>
                s.email ===
                session.email
        );


    if(!student){

        return;

    }


    const name =
        prompt(
            "Name:",
            student.name
        );


    const mobile =
        prompt(
            "Mobile (exactly 10 digits):",
            student.mobile || ""
        );


    const department =
        prompt(
            "Department:",
            student.department || ""
        );


    if(
        name &&
        validMobile(mobile)
    ){

        student.name =
            name;

        student.mobile =
            mobile;

        student.department =
            department ||
            student.department;


        save();

        updateDashboard();


        alert(
            "✅ Details updated successfully."
        );

    }
    else{

        alert(
            "Mobile must be exactly 10 digits."
        );

    }

}


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    () => {

        if(session){

            openApp();

        }

    }
);


// =====================================================
// STOP CAMERA WHEN PAGE CLOSES
// =====================================================

window.addEventListener(
    "beforeunload",
    stopCamera
);

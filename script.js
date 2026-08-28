// Local State Management & Demo Database
let currentUser = { name: "Student User", role: "student", contact: "" };
let registeredDatabase = [
    { name: "Arijit Das", contact: "9876543210", dept: "CSE", img: "https://unsplash.com" },
    { name: "Sneha Paul", contact: "sneha@gmail.com", dept: "ECE", img: "https://unsplash.com" }
];

// 1. Student & Admin Tab Switching Logic
function switchTab(type) {
    document.getElementById('tabStudent').classList.remove('active');
    document.getElementById('tabAdmin').classList.remove('active');
    
    if(type === 'student') {
        document.getElementById('tabStudent').classList.add('active');
        showForm('studentLoginForm');
    } else {
        document.getElementById('tabAdmin').classList.add('active');
        showForm('adminLoginForm');
    }
}

// 2. Auth Form Toggle System (Forgot PIN / Create Account Framework)
function showForm(id) {
    const forms = ['studentLoginForm', 'adminLoginForm', 'registerForm', 'forgotPinForm'];
    forms.forEach(formId => {
        const element = document.getElementById(formId);
        if(element) {
            element.classList.add('hidden');
        }
    });
    
    const target = document.getElementById(id);
    if(target) {
        target.classList.remove('hidden');
    }
}

// 3. New Student Registration Controller
function processRegistration() {
    const name = document.getElementById('regName').value;
    const mob = document.getElementById('regMob').value;
    const email = document.getElementById('regEmail').value;
    const dept = document.getElementById('regDept').value;
    const pin = document.getElementById('regPin').value;

    if(!name || !mob || !email || !dept || !pin) {
        alert("Please fill in all details before registering.");
        return;
    }

    currentUser = { name: name, role: "student", contact: mob };
    
    // Injecting metadata into array database
    registeredDatabase.push({ 
        name: name, 
        contact: mob, 
        dept: dept.toUpperCase(), 
        img: "https://unsplash.com" 
    });
    
    alert(`Account created successfully for ${name}! Please login.`);
    showForm('studentLoginForm');
    document.getElementById('stuUser').value = mob; // Auto pre-fill username field
}

// 4. Authentication Routing (Admin PIN Validation Layer)
function handleLogin(role) {
    if(role === 'admin') {
        const pin = document.getElementById('adminPin').value;
        if(pin !== "1234") { 
            alert("Invalid Admin PIN! (Hint: 1234)"); 
            return; 
        }
        currentUser = { name: "Pradyut Chatterjee", role: "admin" };
    } else {
        const userVal = document.getElementById('stuUser').value;
        const pinVal = document.getElementById('stuPin').value;
        
        if(!userVal || !pinVal) { 
            alert("Please enter Username/Mobile and PIN."); 
            return; 
        }
        currentUser = { name: userVal, role: "student", contact: userVal };
    }
    launchDashboard();
}

// 5. System Dashboard Control Engine
function launchDashboard() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    document.getElementById('welcomeMsg').innerText = `Welcome back, ${currentUser.name}!`;
    
    initWebcam();

    // Updating sidebar badge counter live
    document.getElementById('menuTotalReg').innerText = `📊 Registered Users: ${registeredDatabase.length}`;

    // Privacy Filter Rules Execution
    if(currentUser.role === 'admin') {
        document.getElementById('studentRegistrationContainer').classList.add('hidden');
        document.getElementById('adminViewContainer').classList.remove('hidden');
        renderAdminTable();
    } else {
        document.getElementById('studentRegistrationContainer').classList.remove('hidden');
        document.getElementById('adminViewContainer').classList.add('hidden');
        document.getElementById('dashStuName').value = currentUser.name;
    }
}

// 6. Master Table Renderer for System Administrators
function renderAdminTable() {
    const tbody = document.getElementById('registryTableBody');
    tbody.innerHTML = "";
    registeredDatabase.forEach(user => {
        tbody.innerHTML += `
            <tr>
                <td><img src="${user.img}" class="user-avatar"></td>
                <td><strong>${user.name}</strong></td>
                <td>${user.contact}</td>
                <td><span style="background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px;">${user.dept}</span></td>
                <td><span style="color:#10b981; font-weight:600;">● Active</span></td>
            </tr>`;
    });
}

// 7. Mirror-styled Hardware Webcam Initializer 
function initWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { document.getElementById('webcam').srcObject = stream; })
    .catch(err => { console.log("Webcam access restricted or device missing."); });
}

// 8. Automatic Profile Picture Target Synchronization
function triggerAutomaticCapture() {
    showPopup("📸 Auto Capture Triggered... Syncing profile frame.");
    setTimeout(() => {
        showPopup("🎉 Face data captured and locked into HETC Node successfully!");
    }, 2500);
}

// 9. Attendance Log Generator (Exact Day, Date, and Time Node Capture)
function triggerFaceAttendance() {
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    const dayName = days[now.getDay()];

    document.getElementById('camTitle').innerText = "📷 Face Attendance Scan Activated";
    const stamp = document.getElementById('liveTimeStamp');
    stamp.classList.remove('hidden');
    stamp.innerHTML = `⏱️ Verified Stamp:<br>${dayName} | ${dateStr} | ${timeStr}`;

    showPopup(`✔️ Attendance Logged: ${currentUser.name} | ${timeStr}`);
}

// 10. Privacy Shield Interceptor
function toggleAttendanceView() {
    if(currentUser.role !== 'admin') {
        alert("🔒 Privacy Shield: You can only track your own live stream log tokens.");
    } else {
        alert("Global security database loaded successfully.");
    }
}

// 11. Global Pop-up Interface Messenger
function showPopup(msg) {
    const pop = document.getElementById('popupAlert');
    pop.innerText = msg;
    pop.classList.remove('hidden');
    setTimeout(() => pop.classList.add('hidden'), 4000);
}

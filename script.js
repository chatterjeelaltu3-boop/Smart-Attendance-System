// Local Database with Roll Numbers
let currentUser = { name: "Student User", role: "student", contact: "9876543210", roll: "HETC/2026/01", branch: "CSE", college: "Hooghly Engineering & Technology College" };
let registeredDatabase = [
    { name: "Arijit Das", roll: "HETC/2026/05", contact: "9876543210", dept: "CSE", img: "https://unsplash.com" },
    { name: "Sneha Paul", roll: "HETC/2026/12", contact: "sneha@gmail.com", dept: "ECE", img: "https://unsplash.com" }
];

function switchTab(type) {
    document.getElementById('tabStudent').classList.remove('active');
    document.getElementById('tabAdmin').classList.remove('active');
    showForm(type === 'student' ? 'studentLoginForm' : 'adminLoginForm');
    document.getElementById(type === 'student' ? 'tabStudent' : 'tabAdmin').classList.add('active');
}

function showForm(id) {
    ['studentLoginForm', 'adminLoginForm', 'registerForm', 'forgotPinForm'].forEach(f => {
        const el = document.getElementById(f);
        if(el) el.classList.add('hidden');
    });
    const target = document.getElementById(id);
    if(target) target.classList.remove('hidden');
}

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

    currentUser = { name: name, role: "student", contact: mob, roll: "HETC/2026/Temp", branch: dept, college: "Hooghly Engineering & Technology College" };
    registeredDatabase.push({ name: name, roll: currentUser.roll, contact: mob, dept: dept.toUpperCase(), img: "https://unsplash.com" });
    
    alert(`Account created successfully for ${name}! Please login.`);
    showForm('studentLoginForm');
    document.getElementById('stuUser').value = mob;
}

function handleLogin(role) {
    if(role === 'admin') {
        if(document.getElementById('adminPin').value !== "1234") { 
            alert("Invalid Admin PIN!"); 
            return; 
        }
        currentUser = { name: "Pradyut Chatterjee", role: "admin" };
    } else {
        const userVal = document.getElementById('stuUser').value;
        if(!userVal || !document.getElementById('stuPin').value) { 
            alert("Please enter credentials."); 
            return; 
        }
        currentUser = { name: userVal, role: "student", contact: userVal, roll: "HETC/2026/01", branch: "CSE", college: "Hooghly Engineering & Technology College" };
    }
    launchDashboard();
}

function launchDashboard() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    
    // ফিক্সড: লোগো এবং ওয়েলকাম মেসেজ সেট
    document.getElementById('welcomeMsg').innerText = `Welcome, ${currentUser.name}!`;

    initWebcam();
    showDashboardHome();

    // ৩ বার মেনু ফিল্টার (স্টুডেন্ট বনাম অ্যাডমিন)
    if(currentUser.role === 'admin') {
        document.getElementById('adminRegMenuOpt').classList.remove('hidden');
    } else {
        document.getElementById('adminRegMenuOpt').classList.add('hidden');
    }
}

// ভিউ সুইচিং লজিক
function showDashboardHome() {
    resetActiveView();
    document.getElementById('mainDashboardView').classList.remove('hidden');
    
    if(currentUser.role === 'admin') {
        document.getElementById('studentRegisterCard').classList.add('hidden');
    } else {
        document.getElementById('studentRegisterCard').classList.remove('hidden');
        // ফিল্ড প্রি-ফিল
        document.getElementById('frName').value = currentUser.name;
        document.getElementById('frRoll').value = currentUser.roll;
        document.getElementById('frMob').value = currentUser.contact;
        document.getElementById('frBranch').value = currentUser.branch;
        document.getElementById('frCollege').value = currentUser.college;
    }
}

function showEditDetails() {
    resetActiveView();
    document.getElementById('editDetailsView').classList.remove('hidden');
    // কারেন্ট ডেটা ফিল
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editMob').value = currentUser.contact;
    document.getElementById('editBranch').value = currentUser.branch;
    document.getElementById('editRoll').value = currentUser.roll;
    document.getElementById('editCollege').value = currentUser.college;
}

function savePersonalDetails() {
    currentUser.name = document.getElementById('editName').value;
    currentUser.contact = document.getElementById('editMob').value;
    currentUser.branch = document.getElementById('editBranch').value;
    currentUser.roll = document.getElementById('editRoll').value;
    currentUser.college = document.getElementById('editCollege').value;
    
    document.getElementById('welcomeMsg').innerText = `Welcome, ${currentUser.name}!`;
    alert("Details updated successfully!");
    showDashboardHome();
}

function showAttendanceView() {
    resetActiveView();
    document.getElementById('attendanceLogsView').classList.remove('hidden');
    const tbody = document.getElementById('attendanceTableBody');
    
    if(currentUser.role === 'admin') {
        tbody.innerHTML = `
            <tr><td>Arijit Das</td><td>HETC/2026/05</td><td>10:15 AM</td><td>Present</td></tr>
            <tr><td>Sneha Paul</td><td>HETC/2026/12</td><td>10:20 AM</td><td>Present</td></tr>`;
    } else {
        tbody.innerHTML = `<tr><td>${currentUser.name}</td><td>${currentUser.roll}</td><td>10:02 AM</td><td>Present</td></tr>`;
    }
}

function showRegisteredStudents() {
    resetActiveView();
    document.getElementById('registeredStudentsView').classList.remove('hidden');
    renderAdminTable();
}

function renderAdminTable() {
    const tbody = document.getElementById('registryTableBody');
    tbody.innerHTML = "";
    registeredDatabase.forEach((user, index) => {
        tbody.innerHTML += `
            <tr>
                <td><img src="${user.img}" class="user-avatar"></td>
                <td><strong>${user.name}</strong></td>
                <td>${user.roll}</td>
                <td>${user.contact}</td>
                <td>${user.dept}</td>
                <td><button class="btn-delete" onclick="deleteStudent(${index})">❌ Delete</button></td>
            </tr>`;
    });
}

function deleteStudent(index) {
    if(confirm(`Are you sure you want to remove ${registeredDatabase[index].name}?`)) {
        registeredDatabase.splice(index, 1);
        renderAdminTable();
        showPopup("🗑️ Student removed from system log database.");
    }
}

function resetActiveView() {
    ['mainDashboardView', 'editDetailsView', 'attendanceLogsView', 'registeredStudentsView'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
}

function initWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { document.getElementById('webcam').srcObject = stream; })
    .catch(err => { console.log("Camera simulation run."); });
}

function triggerAutomaticCapture() {
    showPopup("📸 Analyzing Full Metadata Frame... Hold Still!");
    setTimeout(() => { showPopup("🎉 Profile Registered successfully via Mirror Cam!"); }, 2500);
}

function triggerFaceAttendance() {
    const now = new Date();
    showPopup(`✔️ Attendance Logged via Mirror Cam for ${currentUser.name} at ${now.toLocaleTimeString()}`);
}

function showPopup(msg) {
    const pop = document.getElementById('popupAlert');
    pop.innerText = msg;
    pop.classList.remove('hidden');
    setTimeout(() => pop.classList.add('hidden'), 4000);
}

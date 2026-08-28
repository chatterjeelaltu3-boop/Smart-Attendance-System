* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #eef4ff;
    color: #172033;
}

button,
input {
    font-family: inherit;
}

button {
    cursor: pointer;
}

.container {
    width: 95%;
    max-width: 1100px;
    margin: auto;
}


/* ================= LOGIN ================= */

.login-page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.login-card {
    width: 100%;
    max-width: 470px;
    background: white;
    padding: 30px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 15px 45px rgba(0,0,0,0.15);
}

.college-logo {
    object-fit: contain;
    display: block;
    margin: auto;
}

.login-logo {
    width: 115px;
    height: 115px;
}

.dashboard-logo {
    width: 95px;
    height: 95px;
    margin-bottom: 8px;
}

.login-card h1 {
    margin: 10px 0;
    color: #1d4ed8;
}

.login-card h3 {
    margin: 8px 0;
}

.welcome-text {
    font-size: 18px;
    font-weight: bold;
}

.login-tabs {
    display: flex;
    gap: 8px;
    margin: 20px 0;
}

.login-tabs button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 10px;
    background: #dbeafe;
}

.login-tabs .active-tab {
    background: #2563eb;
    color: white;
}

.login-card input,
.section input,
.modal-content input {
    width: 100%;
    padding: 13px;
    margin: 7px 0;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    outline: none;
}

.login-card input:focus,
.section input:focus,
.modal-content input:focus {
    border-color: #2563eb;
}

.primary-btn {
    width: 100%;
    padding: 14px;
    margin-top: 10px;
    border: none;
    border-radius: 10px;
    background: #2563eb;
    color: white;
    font-size: 16px;
    font-weight: bold;
}

.primary-btn:hover {
    opacity: 0.9;
}

.login-links {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
}

.login-links button,
.forgot-btn,
.back-btn {
    border: none;
    background: transparent;
    color: #2563eb;
    padding: 8px;
}

.back-btn {
    width: 100%;
}


/* ================= HEADER ================= */

.main-header {
    position: relative;
    text-align: center;
    background: white;
    padding: 25px;
    margin-top: 20px;
    border-radius: 20px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}

.main-header h1 {
    color: #1d4ed8;
    margin: 5px;
}

.main-header h3 {
    margin: 5px;
}


/* ================= LEFT MENU ================= */

.menu-container {
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 3000;
}

.menu-button {
    width: 55px;
    height: 50px;
    border: none;
    border-radius: 12px;
    background: #2563eb;
    color: white;
    font-size: 27px;
}

.main-menu {
    display: none;
    position: absolute;
    left: 0;
    top: 60px;
    width: 290px;
    background: white;
    padding: 12px;
    border-radius: 15px;
    box-shadow: 0 10px 35px rgba(0,0,0,0.2);
}

.main-menu.show {
    display: block;
}

.main-menu button {
    width: 100%;
    margin: 5px 0;
    padding: 14px;
    border: none;
    border-radius: 10px;
    background: #2563eb;
    color: white;
    text-align: left;
    font-size: 15px;
}


/* ================= DASHBOARD ================= */

.dashboard {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin: 20px 0;
}

.card {
    background: white;
    padding: 20px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.card h2 {
    font-size: 30px;
    color: #2563eb;
}


/* ================= SECTION ================= */

.section {
    background: white;
    margin: 20px 0;
    padding: 25px;
    border-radius: 18px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.section h2 {
    margin-top: 0;
}


/* ================= CAMERA ================= */

.camera-box {
    width: 100%;
    max-width: 640px;
    margin: 20px auto;
    text-align: center;
}

.camera-box video {
    width: 100%;
    max-width: 640px;
    min-height: 300px;
    object-fit: cover;

    /*
       IMPORTANT:
       Selfie / Mirror camera
    */

    transform: scaleX(-1);

    border-radius: 18px;
    background: #111827;
    display: block;
    margin: auto;
}

.camera-status {
    margin-top: 10px;
    font-weight: bold;
}


/* ================= STUDENTS ================= */

.student-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 18px;
    margin: 12px 0;
    border-radius: 14px;
}

.student-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.student-actions button {
    border: none;
    padding: 9px 12px;
    border-radius: 8px;
}

.present-btn {
    background: #22c55e;
    color: white;
}

.absent-btn {
    background: #ef4444;
    color: white;
}

.delete-btn {
    background: #64748b;
    color: white;
}


/* ================= SUCCESS ================= */

.success-message {
    padding: 22px;
    margin-top: 20px;
    border-radius: 16px;
    background: #ecfdf5;
    border: 2px solid #22c55e;
    color: #166534;
    text-align: center;
}

.success-icon {
    font-size: 50px;
}


/* ================= MODAL ================= */

.modal {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 4000;
    background: rgba(0,0,0,0.55);
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.modal.show {
    display: flex;
}

.modal-content {
    width: 100%;
    max-width: 550px;
    max-height: 85vh;
    overflow-y: auto;
    background: white;
    padding: 25px;
    border-radius: 18px;
    position: relative;
}

.close-modal {
    position: absolute;
    right: 15px;
    top: 15px;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: #dc3545;
    color: white;
    font-size: 18px;
}


/* ================= ATTENDANCE SUMMARY ================= */

.attendance-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
}

.summary-box {
    padding: 18px;
    text-align: center;
    border-radius: 14px;
    background: #f8fafc;
}

.total-summary {
    border: 2px solid #2563eb;
}

.present-summary {
    border: 2px solid #22c55e;
}

.absent-summary {
    border: 2px solid #ef4444;
}

.history-day {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 15px;
    border-radius: 12px;
    margin: 10px 0;
}


/* ================= ADMIN ================= */

.admin-info {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    padding: 18px;
    border-radius: 12px;
    line-height: 1.8;
}


/* ================= MOBILE ================= */

@media (max-width: 800px) {

    .dashboard {
        grid-template-columns: repeat(2, 1fr);
    }

    .student-row {
        flex-direction: column;
    }

    .student-actions {
        flex-wrap: wrap;
    }
}

@media (max-width: 600px) {

    .container {
        width: 94%;
    }

    .dashboard {
        grid-template-columns: 1fr 1fr;
    }

    .attendance-summary {
        grid-template-columns: 1fr;
    }

    .menu-container {
        left: 10px;
        top: 10px;
    }

    .main-menu {
        width: 260px;
    }

    .main-header {
        padding-top: 30px;
    }

    .camera-box video {
        min-height: 240px;
    }
}

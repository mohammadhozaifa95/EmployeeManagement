// ============================================
// EMPLOYEE MANAGEMENT SYSTEM - JPDB
// Version: 2.0
// ============================================

// --------------------------------------------
// CONFIGURATION
// --------------------------------------------
const CONFIG = {
    token: "90935270|-31949237174214329|90958524",
    baseUrl: "http://api.login2explore.com:5577",
    dbName: "EmployeeDB",
    relName: "EmployeeData"
};

let currentEditRecord = null;

// --------------------------------------------
// UTILITY FUNCTIONS
// --------------------------------------------
function showNotification(message, type, elementId = "toastMsg") {
    const el = document.getElementById(elementId);
    if (!el) {
        alert(message);
        return;
    }
    el.textContent = message;
    el.className = `toast ${type}`;
    el.style.display = "block";
    setTimeout(() => {
        el.style.display = "none";
        el.className = "toast";
    }, 3000);
}

function formatDateForInput(dateStr) {
    if (!dateStr) return "";
    if (dateStr.includes("-")) return dateStr;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    return dateStr;
}

// --------------------------------------------
// API LAYER
// --------------------------------------------
async function insertRecord(data) {
    const url = `${CONFIG.baseUrl}/api/iml`;
    const body = {
        token: CONFIG.token,
        cmd: "PUT",
        dbName: CONFIG.dbName,
        rel: CONFIG.relName,
        jsonStr: data
    };
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return await response.json();
}

async function fetchData(cmd, query = {}) {
    const url = `${CONFIG.baseUrl}/api/irl`;
    const body = {
        token: CONFIG.token,
        cmd: cmd,
        dbName: CONFIG.dbName,
        rel: CONFIG.relName,
        jsonStr: query
    };
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return await response.json();
}

async function updateRecord(recordNo, data) {
    const url = `${CONFIG.baseUrl}/api/iml`;
    const body = {
        token: CONFIG.token,
        cmd: "UPDATE",
        dbName: CONFIG.dbName,
        rel: CONFIG.relName,
        jsonStr: {
            [recordNo]: data
        }
    };
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return await response.json();
}

async function deleteRecordApi(recordNo) {
    const url = `${CONFIG.baseUrl}/api/iml`;
    const body = {
        token: CONFIG.token,
        cmd: "REMOVE",
        dbName: CONFIG.dbName,
        rel: CONFIG.relName,
        record: recordNo,
        jsonStr: {}
    };
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return await response.json();
}

// --------------------------------------------
// UI NAVIGATION
// --------------------------------------------
function switchPanel(panelName) {
    const panels = document.querySelectorAll(".panel");
    panels.forEach(panel => panel.classList.remove("active"));
    
    const selectedPanel = document.getElementById(`${panelName}Panel`);
    if (selectedPanel) {
        selectedPanel.classList.add("active");
    }
    
    const navBtns = document.querySelectorAll(".nav-item");
    navBtns.forEach(btn => btn.classList.remove("active"));
    
    navBtns.forEach(btn => {
        const onclickAttr = btn.getAttribute("onclick");
        if (onclickAttr && onclickAttr.includes(`'${panelName}'`)) {
            btn.classList.add("active");
        }
    });
    
    if (panelName === "all") {
        loadAllRecords();
    }
}

// --------------------------------------------
// CREATE / SAVE
// --------------------------------------------
async function saveRecord() {
    const payload = {
        empId: document.getElementById("empId").value.trim(),
        empName: document.getElementById("empName").value.trim(),
        email: document.getElementById("email").value.trim(),
        salary: document.getElementById("salary").value,
        dept: document.getElementById("dept").value,
        joinDate: document.getElementById("joinDate").value
    };
    
    if (!payload.empId || !payload.empName) {
        showNotification("Employee ID and Name are required", "error");
        return;
    }
    
    const result = await insertRecord(payload);
    
    if (result.status === 200) {
        showNotification("Employee created successfully", "success");
        clearForm();
        loadAllRecords();
    } else {
        showNotification(result.message || "Failed to create employee", "error");
    }
}

function clearForm() {
    const fields = ["empId", "empName", "email", "salary", "dept", "joinDate"];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

// --------------------------------------------
// READ / FETCH
// --------------------------------------------
async function fetchEmployeeById() {
    const empId = document.getElementById("searchId").value.trim();
    if (!empId) {
        alert("Please enter Employee ID");
        return;
    }
    
    const result = await fetchData("GET_BY_KEY", { empId: empId });
    
    let record = null;
    let rawData = result.data;
    
    if (typeof rawData === "string") {
        try {
            rawData = JSON.parse(rawData);
        } catch (e) {}
    }
    
    if (rawData) {
        record = rawData.record || rawData;
    }
    
    if (record && record.empId) {
        document.getElementById("d_id").textContent = record.empId;
        document.getElementById("d_name").textContent = record.empName;
        document.getElementById("d_email").textContent = record.email;
        document.getElementById("d_salary").textContent = record.salary;
        document.getElementById("d_dept").textContent = record.dept;
        document.getElementById("d_join").textContent = record.joinDate;
        document.getElementById("detailBox").style.display = "block";
    } else {
        document.getElementById("detailBox").style.display = "none";
        alert("Employee not found");
    }
}

// --------------------------------------------
// LOAD ALL RECORDS (FILTER EMPTY ROWS)
// --------------------------------------------
async function loadAllRecords() {
    const result = await fetchData("GET_ALL", {});
    
    let rawData = result.data;
    if (typeof rawData === "string") {
        try {
            rawData = JSON.parse(rawData);
        } catch (e) {
            console.error("Parse error:", e);
        }
    }
    
    let records = [];
    if (rawData && rawData.json_records && Array.isArray(rawData.json_records)) {
        records = rawData.json_records;
    } else if (rawData && Array.isArray(rawData)) {
        records = rawData;
    }
    
    const tbody = document.getElementById("tableBody");
    
    // 🔥 FILTER: Sirf valid records dikhao (empId aur empName dono ho)
    const validRecords = records.filter(item => {
        const record = item.record || item;
        return record.empId && record.empId.trim() !== "" && 
               record.empName && record.empName.trim() !== "" &&
               record.empName !== "undefined" &&
               record.empName !== "null";
    });
    
    if (validRecords.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-muted">No records found</td></tr>`;
        return;
    }
    
    tbody.innerHTML = "";
    
    validRecords.forEach(item => {
        const record = item.record || item;
        const recordNo = item.rec_no || null;
        
        const row = tbody.insertRow();
        row.insertCell(0).textContent = record.empId || "";
        row.insertCell(1).textContent = record.empName || "";
        row.insertCell(2).textContent = record.email || "";
        row.insertCell(3).textContent = record.salary || "";
        row.insertCell(4).textContent = record.dept || "";
        row.insertCell(5).textContent = record.joinDate || "";
        
        const actionsCell = row.insertCell(6);
        
        const editIcon = document.createElement("i");
        editIcon.className = "fas fa-edit edit-icon";
        editIcon.title = "Edit";
        editIcon.onclick = () => openEditModal({ ...record, rec_no: recordNo });
        
        const deleteIcon = document.createElement("i");
        deleteIcon.className = "fas fa-trash-alt delete-icon";
        deleteIcon.title = "Delete";
        deleteIcon.onclick = () => deleteRecord({ ...record, rec_no: recordNo });
        
        actionsCell.appendChild(editIcon);
        actionsCell.appendChild(deleteIcon);
    });
}

// --------------------------------------------
// DELETE - SINGLE RECORD
// --------------------------------------------
async function deleteRecord(employee) {
    if (!employee || !employee.empId) {
        alert("Invalid employee data");
        return;
    }
    
    let empId = employee.empId;
    let recordNo = employee.rec_no;
    let empName = employee.empName || "Row";
    
    if (!confirm(`Delete "${empId} - ${empName}" permanently?`)) {
        return;
    }
    
    // Try to get record number if not present
    if (!recordNo) {
        const result = await fetchData("GET_BY_KEY", { empId: empId });
        let rawData = result.data;
        if (typeof rawData === "string") {
            try { rawData = JSON.parse(rawData); } catch(e) {}
        }
        recordNo = rawData?.rec_no || rawData?.record?.rec_no;
    }
    
    // Delete from API if record number exists
    if (recordNo) {
        const result = await deleteRecordApi(recordNo);
        if (result.status === 200) {
            showNotification("Employee deleted successfully", "success");
            loadAllRecords();
        } else {
            showNotification(result.message || "Delete failed", "error");
        }
    } else {
        showNotification("Row removed from view", "success");
        loadAllRecords();
    }
}

// --------------------------------------------
// UPDATE
// --------------------------------------------
function openEditModal(employee) {
    currentEditRecord = employee;
    
    document.getElementById("editId").value = employee.empId || "";
    document.getElementById("editName").value = employee.empName || "";
    document.getElementById("editEmail").value = employee.email || "";
    document.getElementById("editSalary").value = employee.salary || "";
    document.getElementById("editDept").value = employee.dept || "IT";
    document.getElementById("editDate").value = formatDateForInput(employee.joinDate);
    
    document.getElementById("editModal").style.display = "flex";
}

async function confirmUpdate() {
    if (!currentEditRecord) return;
    
    const updatedData = {
        empId: document.getElementById("editId").value,
        empName: document.getElementById("editName").value,
        email: document.getElementById("editEmail").value,
        salary: document.getElementById("editSalary").value,
        dept: document.getElementById("editDept").value,
        joinDate: document.getElementById("editDate").value
    };
    
    if (!updatedData.empName || !updatedData.email) {
        alert("Name and Email are required");
        return;
    }
    
    const result = await updateRecord(currentEditRecord.rec_no, updatedData);
    
    if (result.status === 200) {
        showNotification("Employee updated successfully", "success");
        closeModal();
        loadAllRecords();
        const detailBox = document.getElementById("detailBox");
        if (detailBox) detailBox.style.display = "none";
    } else {
        showNotification(result.message || "Update failed", "error");
    }
}

function closeModal() {
    document.getElementById("editModal").style.display = "none";
    currentEditRecord = null;
}

// --------------------------------------------
// INITIALIZATION
// --------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    switchPanel("add");
});
async function logout() {
    window.location.href = '/index.html';
}

let currentTable = '';
let columns = [];

const addButton = document.getElementById('addButton');
const tableSelect = document.getElementById('tableSelect');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');

// Define table schemas (columns for each table)
const tableColumns = {
    accounts: ['AccountID', 'Username', 'EmailMain', 'HashedPassword', 'CreatedAt', 'Status', 'AccountType', 'AccountEmail', 'AccountPhone'],
    customer: ['AccountID', 'Username', 'EmailMain', 'HashedPassword', 'CreatedAt', 'Status', 'LoyaltyLevel', 'RewardPoints', 'AccountEmail', 'AccountPhone'],
    seller: ['AccountID', 'Username', 'EmailMain', 'HashedPassword', 'CreatedAt', 'Status', 'ShopName', 'ShopAddress', 'Rating', 'TaxCode', 'BusinessLicenseNumber', 'AccountEmail', 'AccountPhone'],
    admin: ['AccountID', 'Username', 'EmailMain', 'HashedPassword', 'CreatedAt', 'Status', 'Role', 'Department', 'AccountEmail', 'AccountPhone'],
    affiliate: ['AccountID', 'Username', 'EmailMain', 'HashedPassword', 'CreatedAt', 'Status', 'AffiliateCode', 'CommissionRate', 'JoinDate', 'TotalEarnings', 'AccountEmail', 'AccountPhone']
};

// Multivalue columns (modify as needed)
const multivaluedColumns = ["AccountEmail", "AccountPhone"];

// Omitted input columns
const omittedColumns = ["AccountID", "CreatedAt"];
const omittedTables = ["accounts"];

addButton.addEventListener('click', () => {
    submitNewRow(tableSelect.value, tableColumns[tableSelect.value]);
});

// Load table data when table is selected
tableSelect.addEventListener('change', () => {
    loadTableData(tableSelect.value);
});

async function loadTableData(table) {
    const columns = tableColumns[table];
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // --- Top row for input boxes ---
    const trHead = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');

        if (omittedColumns.includes(col) || omittedTables.includes(table)) {
            th.textContent = col; // show the header text for read-only
        } else {
            // Only create input if not read-only
            const input = document.createElement('input');
            input.id = `input-${col}`;
            input.placeholder = col + (multivaluedColumns.includes(col) ? " (comma separated)" : "");
            th.appendChild(input);
        }

        trHead.appendChild(th);
    });
    tableHead.appendChild(trHead);

    // --- Load existing rows ---
    try {
        const res = await fetch(`http://localhost:3000/api/${table}`);
        const data = await res.json();

        data.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                
                // DISPLAY MULTIVALUE
                if (Array.isArray(row[col])) {
                    td.textContent = row[col].join(", ");
                } else {
                    td.textContent = row[col] ?? '';
                }
                
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    } 
    catch (err) {
        console.error('Error fetching table data:', err);
    }
}

async function submitNewRow(table, columns) {
    const newData = {};
    if (omittedTables.includes(table)) {
        return;
    }

    columns.forEach(col => {
        if (omittedColumns.includes(col)) {
            return;
        }
        const rawValue = document.getElementById(`input-${col}`).value;

        // --- MULTIVALUE HANDLING ---
        if (multivaluedColumns.includes(col)) {
            newData[col] = rawValue
                .split(", ")
                .map(v => v.trim())
                .filter(v => v.length > 0);
        } 
        else {
            newData[col] = rawValue;
        }
    });

    try {
        const res = await fetch(`http://localhost:3000/api/${table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        });

        const result = await res.json();
        alert(result.message);

        // Reload table after submission
        loadTableData(table);
    } 
    catch (err) {
        console.error('Error adding row:', err);
        alert('Error adding row');
    }
}

// Initial load
loadTableData(tableSelect.value);

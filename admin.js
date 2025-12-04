async function logout() {
    window.location.href = '/index.html';
}

let currentTable = '';
let columns = [];

const addButton = document.getElementById('addButton');
const tableSelect = document.getElementById('tableSelect');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');

// -------------------- Table schemas --------------------
const tableColumns = {
    accounts: ['AccountID','Username','EmailMain','HashedPassword','CreatedAt','Status','AccountType','AccountEmail','AccountPhone'],
    customer: ['AccountID','Username','EmailMain','HashedPassword','CreatedAt','Status','LoyaltyLevel','RewardPoints','AccountEmail','AccountPhone','OrderHistory','Wishlist'],
    seller: ['AccountID','Username','EmailMain','HashedPassword','CreatedAt','Status','ShopName','ShopAddress','Rating','TaxCode','BusinessLicenseNumber','AccountEmail','AccountPhone','SellerProduct'],
    admin: ['AccountID','Username','EmailMain','HashedPassword','CreatedAt','Status','Role','Department','AccountEmail','AccountPhone'],
    affiliate: ['AccountID','Username','EmailMain','HashedPassword','CreatedAt','Status','AffiliateCode','CommissionRate','JoinDate','TotalEarnings','AccountEmail','AccountPhone','Advertisement'],

    wishlist: ['WishlistID','AccountID','Name','CreatedDate','ProductID','ProductName'],
    advertisement: ['AdID','AffiliateAccountID','ProductID','ImageURL','Budget','CreatedAt','Active','Content'],
    paymentCash: ['PmID','Method','ActualReceivedMoney','MoneyBack','ShipperID'],
    paymentBank: ['PmID','Method','OwnerAccountID','BankName','CardType','CardNumber','ExpirationDate'],
    cart: ['CartID','AccountID','TotalPrice','TotalAmount','UpdatedAt','ShippingAddress','CartItem'],
    cartItem: ['CartID','ProductID','Quantity','SubTotal'],
    coupon: [],
    
    category: ['CategoryID','Name','Description','Brand','Color','PortableSpeakerFeature','ShippedFrom','WooferSize'],
    product: ['ProductID','CategoryID','CategoryName','Name','Price','ImageURL','Status','Stock','Brand'],
    review: ['ProductID','AccountID','Rating','Comment','ReviewDate','Moderated'],

    shipment: ['ShipmentID','OrderID','ShipperID','ShipmentDate','DeliveryDate','Status'],
    shipper: ['ShipperID','Name','PhoneNumber','Email','VehicleType']
};

// Multivalued attributes
const multivaluedPerTable = {
    customer: ['AccountEmail','AccountPhone','OrderHistory'],
    seller: ['AccountEmail','AccountPhone','SellerProduct'],
    admin: ['AccountEmail','AccountPhone'],
    affiliate: ['AccountEmail','AccountPhone','Advertisement'],
    wishlist: ['ProductID','ProductName'],
    category: ['Brand','Color','PortableSpeakerFeature','ShippedFrom','WooferSize'],
    cart: ['CartItem']
};

// Columns to omit for input
const omittedPerTable = {
    accounts: ['AccountID','CreatedAt'],
    customer: ['AccountID','CreatedAt','OrderHistory','Wishlist'],
    seller: ['AccountID','CreatedAt'],
    admin: ['AccountID','CreatedAt'],
    affiliate: ['AccountID','CreatedAt'],
    wishlist: ['WishlistID','CreatedDate','ProductName'],
    advertisement: ['AdID','CreatedAt','Active'],
    paymentCash: ['PmID'],
    paymentBank: ['PmID'],
    category: ['CategoryID'],
    product: ['ProductID','CategoryName']
};

// Map tables to their unique backend API endpoints
const tableApiMap = {
    accounts: '/api/accounts',
    customer: '/api/customer',
    seller: '/api/seller',
    admin: '/api/admin',
    affiliate: '/api/affiliate',

    wishlist: '/api/wishlist',
    advertisement: '/api/advertisement',
    paymentCash: '/api/payment/cash',
    paymentBank: '/api/payment/bank',
    cart: '/api/cart',
    cartItem: '/api/cart/items',
    coupon: '/api/coupon',

    category: '/api/category',
    product: '/api/product',
    review: '/api/review',

    shipment: '/api/shipment',
    shipper: '/api/shipper'
};

const primaryKeyMap = {
    accounts: "AccountID",
    customer: "AccountID",
    seller: "AccountID",
    admin: "AccountID",
    affiliate: "AccountID",

    wishlist: "WishlistID",
    advertisement: "AdID",
    paymentCash: "PmID",
    paymentBank: "PmID",
    cart: "CartID",
    cartItem: ["CartID","ProductID"],
    coupon: "CouponID",

    category: "CategoryID",
    product: "ProductID",
    review: ["ProductID","AccountID"],

    shipment: "ShipmentID",
    shipper: "ShipperID"
};

// -------------------- Event Listeners --------------------
addButton.addEventListener('click', () => submitNewRow(tableSelect.value, tableColumns[tableSelect.value]));
tableSelect.addEventListener('change', () => loadTableData(tableSelect.value));

// -------------------- Load Table Data --------------------
async function loadTableData(table) {
    const columns = tableColumns[table];
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // --- Top row: input boxes ---
    const trHead = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');

        if (omittedPerTable[table]?.includes(col)) {
            th.textContent = col;
        } else {
            const input = document.createElement('input');
            input.id = `input-${col}`;
            const multi = multivaluedPerTable[table] ?? [];
            input.placeholder = col + (multi.includes(col) ? " (comma separated)" : "");
            th.appendChild(input);
        }
        trHead.appendChild(th);
    });
    tableHead.appendChild(trHead);

    // --- Fetch existing rows ---
    try {
        const res = await fetch(`http://localhost:3000${tableApiMap[table]}`);
        const data = await res.json();

        data.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');

                if (multivaluedPerTable[table]?.includes(col) && Array.isArray(row[col])) {
                    td.textContent = row[col].join(", ");
                } else {
                    td.textContent = row[col] ?? '';
                }

                tr.appendChild(td);
            });
            tableBody.appendChild(tr);

            // --- Create external buttons ---
            const actionDiv = document.createElement('div');
            actionDiv.classList.add('row-actions');

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => editRow(row, table);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => deleteRow(row, table);

            actionDiv.appendChild(editBtn);
            actionDiv.appendChild(deleteBtn);

            // Insert action div after the table row
            tr.after(actionDiv);
        });
    } catch (err) {
        console.error('Error fetching table data:', err);
    }
}

// -------------------- Submit New Row --------------------
async function submitNewRow(table, columns) {
    const newData = {};

    columns.forEach(col => {
        if (omittedPerTable[table]?.includes(col)) return;

        const rawValue = document.getElementById(`input-${col}`).value;
        if (multivaluedPerTable[table]?.includes(col)) {
            newData[col] = rawValue
                .split(',')
                .map(v => v.trim())
                .filter(v => v.length > 0);
        } else {
            newData[col] = rawValue;
        }
    });

    try {
        const res = await fetch(`http://localhost:3000${tableApiMap[table]}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        });

        const result = await res.json();
        alert(result.message);

        // Reload table after submission
        loadTableData(table);
    } catch (err) {
        console.error('Error adding row:', err);
        alert('Error adding row');
    }
}

async function editRow(row, table) {
    const columns = tableColumns[table];
    const updatedData = {};

    columns.forEach(col => {
        if (omittedPerTable[table]?.includes(col)) return;
        const val = prompt(`Edit ${col}:`, row[col] ?? '');
        if (val !== null) {
            if (multivaluedPerTable[table]?.includes(col)) {
                updatedData[col] = val.split(',').map(v => v.trim()).filter(v => v.length > 0);
            } else {
                updatedData[col] = val;
            }
        }
    });

    // Include the ID if required by your API
    updatedData.id = row.AccountID ?? row.CustomerID ?? row.PmID ?? row.CartID;

    try {
        const res = await fetch(`http://localhost:3000${tableApiMap[table]}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        const result = await res.json();
        alert(result.message);
        loadTableData(table);
    } catch (err) {
        console.error('Error editing row:', err);
        alert('Error editing row');
    }
}

async function deleteRow(row, table) {
    if (!confirm('Are you sure you want to delete this row?')) return;

    const key = getRowKey(row, table);

    if (!key) {
        alert("Error: Could not find primary key for row.");
        console.error("Delete failed, row =", row);
        return;
    }

    let url = `http://localhost:3000${tableApiMap[table]}`;

    // Composite keys → send as query params
    if (typeof key === "object") {
        const query = Object.entries(key)
            .map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join("&");
        url += `?${query}`;
    } else {
        url += `/${key}`;
    }

    try {
        const res = await fetch(url, { method: 'DELETE' });
        const result = await res.json();
        alert(result.message);
        loadTableData(table);
    } catch (err) {
        console.error('Error deleting row:', err);
        alert('Error deleting row');
    }
}

function getRowKey(row, table) {
    const key = primaryKeyMap[table];

    if (Array.isArray(key)) {
        // Composite key
        const obj = {};
        key.forEach(k => obj[k] = row[k]);
        return obj;
    }

    return row[key];
}

// -------------------- Initial Load --------------------
loadTableData(tableSelect.value);



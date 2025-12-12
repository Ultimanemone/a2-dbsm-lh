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
    coupon: ['CouponID','Code','StartDate', 'EndDate','Type','DiscountPercent'],

    orderHistory: ['AccountID','OrderHistoryID','OrderID','CompletionDate','OrderStatus'],
    order: ['OrderID','AccountID','CreationDate','OrderDate','NoOfShipments','LastUpdateDate','ShippingAddress','Note','TotalPrice'],
    orderItem: ['OrderItemID','OrderID','ProductID','ProductName','Quantity','UnitPrice','SubTotal'],
    shipment: ['ShipmentID','OrderID','ShipperID','SellerAccountID','DeliveryStartDate','NumberOfProducts','EstimatedDeliveryTime','RealDeliveryTime'],
    shipper: ['ShipperID','Name','Phone','Email','Address'],
    
    category: ['CategoryID','Name','Description','Brand','Color','PortableSpeakerFeature','ShippedFrom','WooferSize'],
    product: ['ProductID','CategoryID','CategoryName','Name','Price','ImageURL','Status','Stock','Brand'],
    review: ['ProductID','AccountID','Rating','Comment','ReviewDate','Moderated'],

    statisticTopShipper: ['ShipperID','ShipperName','Phone','SuccessfulDeliveries'],
    customerLifetimeValue: ['AccountID','Username','Email','LoyaltyLevel','TotalSpent'],
    orderdetails: ['OrderID','Status','OrderDate','ProductName','Quantity','SubTotal','SellerAccountID','ShipperID','RealDeliveryTime']
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

    orderHistory: '/api/order/history',
    order: '/api/order',
    orderItem: '/api/order/item',
    shipment: '/api/shipment',
    shipper: '/api/shipper',

    category: '/api/category',
    product: '/api/product',
    review: '/api/review',

    statisticTopShipper: '/api/stats/top-shipper',
    customerLifetimeValue: '/api/stats/customer-ltv',
    orderdetails: '/api/stats/orderdetails'
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
    accounts: ['AccountID','Username','EmailMain','HashedPassword','CreatedAt','Status','AccountType','AccountEmail','AccountPhone'],
    customer: ['AccountID','CreatedAt','OrderHistory','Wishlist'],
    seller: ['AccountID','CreatedAt','SellerProduct'],
    admin: ['AccountID','CreatedAt'],
    affiliate: ['AccountID','CreatedAt'],

    wishlist: ['WishlistID','CreatedDate','ProductName'],
    advertisement: ['AdID','CreatedAt','Active'],
    paymentCash: ['PmID'],
    paymentBank: ['PmID'],
    cart: ['CartID','AccountID','TotalPrice','TotalAmount','UpdatedAt','ShippingAddress','CartItem'],
    cartItem: ['SubTotal'],
    coupon: ['CouponID','StartDate'],

    orderHistory: ['AccountID','OrderHistoryID'],
    order: ['OrderID','CreationDate','OrderDate','TotalAmount','LastUpdateDate'],
    orderItem: ['OrderItemID','ProductName','UnitPrice','SubTotal'],
    shipment: ['ShipmentID','ShipmentDate','DeliveryDate'],
    //shipper: ['ShipperID'],

    category: ['CategoryID'],
    product: ['ProductID','CategoryName'],

    //statisticTopShipper: ['SuccessfulDeliveries'],
    customerLifetimeValue: ['AccountID','Username','Email','LoyaltyLevel','TotalSpent']
};

const uneditableTables = ['accounts', 'cart', 'customerLifetimeValue'];

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

    orderHistory: "OrderHistoryID",
    order: "OrderID",
    orderItem: "OrderItemID",
    shipment: "ShipmentID",
    shipper: "ShipperID",

    category: "CategoryID",
    product: "ProductID",
    review: ["ProductID","AccountID"],

    statisticTopShipper: 'ShipperID',
};

const searchableTables = [
    'statisticTopShipper',
    'shipper'
];

const uneditablePerTable = {
    statisticTopShipper: ['ShipperID','SuccessfulDeliveries'],
    shipper: ['ShipperID']
}

// -------------------- Event Listeners --------------------
addButton.addEventListener('click', () => submitNewRow(tableSelect.value, tableColumns[tableSelect.value]));
tableSelect.addEventListener('change', () => loadTableData(tableSelect.value));

// -------------------- Load Table Data --------------------
async function loadTableData(table) {
    const columns = tableColumns[table];
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    prevInput = null;

    // --- Top row: input boxes ---
    const trHead = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');

        if (omittedPerTable[table]?.includes(col)) {
            th.textContent = col;
        } else {
            const input = document.createElement('input');
            input.id = `input-${table}-${col}`;
            const multi = multivaluedPerTable[table] ?? [];
            input.placeholder = col + (multi.includes(col) ? " (comma separated)" : "");

            // 👇 Live filter listener
            input.addEventListener("input", () => {
                applySearchFilter(table);
            });

            if (!(prevInput === null)) {
                prevInput.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        input.focus();
                    }
                })
            }

            prevInput = input;
            th.appendChild(input);
        }
        trHead.appendChild(th);
    });
    if (!(prevInput === null)) {
        prevInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                submitNewRow(table, columns);
            }
        });
    }
    tableHead.appendChild(trHead);

    // --- Fetch existing rows ---
    try {
        const res = await fetch(`http://localhost:3000${tableApiMap[table]}`);
        const data = await res.json();

        renderTableRows(data, table);
    } catch (err) {
        console.error('Error fetching table data:', err);
    }
}

// -------------------- Submit New Row --------------------
async function submitNewRow(table, columns) {
    const newData = {};

    columns.forEach(col => {
        if (omittedPerTable[table]?.includes(col)) return;

        const inputEl = document.getElementById(`input-${table}-${col}`);
        if (!inputEl) return; // safety check

        const rawValue = inputEl.value;

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
        if (uneditablePerTable[table]?.includes(col)) {
            updatedData[col] = row[col];
            return;
        }
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
    updatedData.id = row.AccountID ?? row.CustomerID ?? row.PmID ?? row.CartID ?? row.ShipperID;

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

async function applySearchFilter(table) {
    const columns = tableColumns[table];
    const params = {};

    columns.forEach(col => {
        if (omittedPerTable[table]?.includes(col)) return;

        const val = document.getElementById(`input-${table}-${col}`)?.value.trim();
        if (val) params[col] = val;
    });

    // Build URL query string
    let url = `http://localhost:3000${tableApiMap[table]}`;
    if (Object.keys(params).length > 0) {
        url += "?" + new URLSearchParams(params).toString();
    }

    tableBody.innerHTML = "";

    try {
        const res = await fetch(url);
        const data = await res.json();

        renderTableRows(data, table);
    } catch (err) {
        console.error("Search error:", err);
    }
}

function renderTableRows(data, table) {
    const columns = tableColumns[table];

    data.forEach(row => {
        const tr = document.createElement('tr');

        columns.forEach(col => {
            const td = document.createElement('td');

            if (multivaluedPerTable[table]?.includes(col) && Array.isArray(row[col])) {
                td.textContent = row[col].join(", ");
            } else {
                td.textContent = row[col] ?? '';
            }

            if (!uneditableTables.includes(table)) {
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
            }
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
        
        if (!uneditableTables.includes(table)) {
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
        }
    });
}

// -------------------- Initial Load --------------------
loadTableData(tableSelect.value);



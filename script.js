const tableInput = document.getAnimationsById('table-input');
const tableDropdown = document.getElementById('table-dropdown');
const dataLookupInput = document.getElementById('data-lookup-input');

let tables = [];

input.addEventListener('click', async() => {
    if (tables.length === 0) {
        tables = await fetchTables();
    }
    showDropdown(tables);
    dropdown.style.display = 'block';
});

input.addEventListener('input', () => {
    const search = input.value.toLowerCase();
    const filtered = tables.filter(t => t.toLowerCase().includes(search));
    showDropdown(filtered);
});

async function fetchTables() {
    const res = await fetch('/api/tables');
    return await res.json();
}

function showDropdown(list) {
    dropdown.innerHTML = '';
    list.forEach(table => {
        const item = document.createElement('div');
        item.textContent = table;

        item.onclick = () => {
            input.value = table;
            dropdown.style.display = 'none';
            loadTableForm(table);
        };

        dropdown.appendChild(item);
    });
}

async function loadTableForm(tableName) {
    const res = await fetch(`/api/columns?table=${tableName}`);
    const columns = await res.json();

    formPanel.innerHTML = `<h3>Insert into ${tableName}</h3>`;

    columns.forEach(col => {
        const label = document.createElement("label");
        label.textContent = col + ":";

        const field = document.createElement("input");
        field.type = "text";
        field.id = `col_${col}`;

        formPanel.appendChild(label);
        formPanel.appendChild(field);
    });

    // Add submit button
    const btn = document.createElement("button");
    btn.id = "addBtn";
    btn.textContent = "Add Record";
    btn.onclick = () => submitRecord(tableName, columns);

    formPanel.appendChild(btn);
}

async function submitRecord(tableName, columns) {
    const values = {};

    columns.forEach(col => {
        values[col] = document.getElementById(`col_${col}`).value;
    });

    const res = await fetch("/api/addRecord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: tableName, data: values })
    });

    if (res.ok) {
        alert("Record added!");
    } else {
        alert("Error adding record.");
    }
}

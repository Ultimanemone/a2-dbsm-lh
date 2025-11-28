const tableInput = document.getAnimationsById('table-input');
const tableDropdown = document.getElementById('table-dropdown');
const dataLookupInput = document.getElementById('data-lookup-input');

let tableReturn = [];

input.addEventListener('click', async() => {
    if (tableReturn.length === 0) {
        tableReturn = await fetchTables();
    }
    
});

input.addEventListener('input', () => {
    const searchTerm = input.value.toLowerCase();
    const filtered = tableReturn.filter(t => 
        t.toLowerCase().includes(searchTerm)
    );
    showDropdown(filtered);
});

async function fetchTables() {
    const res = await fetch("http://localhost:3000/api/tables");
    return await response.json();
}

function showDropdown(list) {
    dropdown.innerHTML = '';
    list.forEach(item => {
        const option = document.createElement('div');
        option.textContent = item;
        option.addEventListener('click', () => {
            input.value = item;
            dropdown.innerHTML = '';
        });
        dropdown.appendChild(option);
    });
}


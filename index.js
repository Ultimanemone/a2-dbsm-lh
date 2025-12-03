
async function submitLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    message.textContent = "";

    try {
        const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
        if (data.role === 'Admin') {
            window.location.href = '/admin.html';
        } else if (data.role === 'Seller') {
            window.location.href = '/seller.html';
        } else {
            window.location.href = '/customer.html';
        }
    } else {
        message.style.color = 'red';
        message.textContent = data.message;
    }
    } catch (err) {
        message.style.color = 'red';
        message.textContent = 'Error connecting to server';
    }
}
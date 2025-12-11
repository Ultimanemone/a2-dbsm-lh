async function logout() {
    window.location.href = '/index.html';
}

const productGrid = document.getElementById("productGrid");
const CURRENT_USER_ID = localStorage.getItem("accountID");

let cart = [];   // will store { ProductID, Quantity }

async function loadCart() {
    const res = await fetch(`http://localhost:3000/api/userCart/${CURRENT_USER_ID}`);
    const temp = await res.json();
    cart = temp.Items.map(item => ({
        ProductID: item.ProductID,
        Quantity: item.Quantity
    }));
}

async function loadProducts() {
    await loadCart();
    const res = await fetch("http://localhost:3000/api/product");
    const products = await res.json();
    renderProducts(products);
}

function getCartItem(productId) {
    return cart.find(item => item.ProductID === productId);
}

function renderProducts(products) {
    productGrid.innerHTML = "";

    products.forEach(prod => {
        const card = document.createElement("div");
        card.className = "product-card";

        const cartItem = getCartItem(prod.ProductID);
        const quantity = cartItem ? cartItem.Quantity : 0;

        // Product card base info
        card.innerHTML = `
            <img src="${prod.ImageURL || 'placeholder.png'}" alt="Product">
            <div class="product-name">${prod.Name}</div>
            <div class="product-brand">${prod.Brand || 'No Brand'}</div>
            <div class="product-price">$${prod.Price.toFixed(2)}</div>
        `;

        // Button container for +/- and main button
        const controlContainer = document.createElement("div");
        controlContainer.className = "cart-controls";

        if (quantity > 0) {
            // --------------------------
            //    ITEM ALREADY IN CART
            // --------------------------

            // Minus button
            const minusBtn = document.createElement("button");
            minusBtn.textContent = "−";
            minusBtn.className = "btn btn-qty";
            minusBtn.onclick = () => updateQuantity(prod.ProductID, quantity - 1);

            // Main button showing quantity
            const qtyBtn = document.createElement("button");
            qtyBtn.className = "btn btn-incart";
            qtyBtn.textContent = `In Cart (${quantity})`;
            qtyBtn.disabled = true;

            // Plus button
            const plusBtn = document.createElement("button");
            plusBtn.textContent = "+";
            plusBtn.className = "btn btn-qty";
            plusBtn.onclick = () => updateQuantity(prod.ProductID, quantity + 1);

            controlContainer.appendChild(minusBtn);
            controlContainer.appendChild(qtyBtn);
            controlContainer.appendChild(plusBtn);
        } else {
            // --------------------------
            //    ITEM NOT IN CART
            // --------------------------
            const addBtn = document.createElement("button");

            if (prod.Status === "Available" && prod.Stock > 0) {
                addBtn.className = "btn btn-add";
                addBtn.textContent = "Add to Cart";
                addBtn.onclick = () => addToCart(prod.ProductID);
            }
            else if (prod.Status === "OutOfStock" || prod.Stock === 0) {
                addBtn.className = "btn btn-out";
                addBtn.textContent = "Out of Stock";
                addBtn.disabled = true;
            }
            else {
                addBtn.className = "btn btn-unavailable";
                addBtn.textContent = "Unavailable";
                addBtn.disabled = true;
            }

            controlContainer.appendChild(addBtn);
        }

        card.appendChild(controlContainer);
        productGrid.appendChild(card);
    });
}

async function addToCart(productId) {
    await fetch("http://localhost:3000/api/userCart/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            accountId: CURRENT_USER_ID,
            productId: productId,
            quantity: 1
        })
    });

    loadProducts();
}

async function updateQuantity(productId, newQty) {
    if (newQty <= 0) {
        // Remove item
        await fetch(`http://localhost:3000/api/userCart/remove/${CURRENT_USER_ID}/${productId}`, {
            method: "DELETE"
        });
    } else {
        // Update quantity
        await fetch("http://localhost:3000/api/userCart/update", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                accountId: CURRENT_USER_ID,
                productId: productId,
                quantity: newQty
            })
        });
    }

    loadProducts();
}

loadProducts();

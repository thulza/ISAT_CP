// Global variables
let cart = [];
let currentCashier = null;
const VAT_RATE = 0.15;

// Product database
const products = {
    snacks: [
        { id: 1, name: "Marie Biscuits", price: 10.99 },
        { id: 2, name: "Simba Chips", price: 18.99 },
        { id: 3, name: "Lays Chips", price: 20.50 },
        { id: 4, name: "Dairy Milk", price: 25.99 }
    ],
    fruits: [
        { id: 5, name: "Banana", price: 5.99 },
        { id: 6, name: "Apple", price: 6.99 },
        { id: 7, name: "Peach", price: 8.99 },
        { id: 8, name: "Pear", price: 7.99 }
    ],
    beverages: [
        { id: 9, name: "Coca-Cola", price: 26.99 },
        { id: 10, name: "Pepsi", price: 24.99 },
        { id: 11, name: "Oros", price: 35.50 },
        { id: 12, name: "Cranberry Juice", price: 42.99 }
    ],
    bread: [
        { id: 13, name: "Sasko White", price: 18.99 },
        { id: 14, name: "Albany Low G.I", price: 22.99 },
        { id: 15, name: "Blue Ribbon Brown", price: 19.99 },
        { id: 16, name: "Non-name (None sliced)", price: 14.99 }
    ]
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the POS page
    if (document.getElementById('loginForm')) {
        setupPOS();
    }
});

// POS System Setup
function setupPOS() {
    // Set up event listeners
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('clearCart')?.addEventListener('click', clearCart);
    document.getElementById('checkout')?.addEventListener('click', processCheckout);
    
    // Load categories and products
    loadCategories();
    loadProducts();
    
    // Initialize cart
    updateCart();
}

// Handle Cashier Login
function handleLogin(e) {
    e.preventDefault();
    
    const cashierName = document.getElementById('cashierName').value.trim();
    
    if (!cashierName) {
        alert('Please enter your name');
        return;
    }
    
    currentCashier = cashierName;
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('posSection').style.display = 'block';
}

// Load Categories into Dropdown
function loadCategories() {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect) return;
    
    // Clear existing options except the first one
    categorySelect.innerHTML = '<option value="">-- Select a Category --</option>';
    
    // Add each category to the dropdown
    Object.keys(products).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
    
    // Add event listener for category selection
    categorySelect.addEventListener('change', function() {
        loadProducts(this.value);
    });
}

// Load Products into UI based on selected category
function loadProducts(selectedCategory = '') {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;
    
    // Clear existing products
    productsContainer.innerHTML = '';
    
    // If no category is selected, show message or all products
    if (!selectedCategory) {
        productsContainer.innerHTML = '<p class="select-category-message">Please select a category to view products</p>';
        return;
    }
    
    // Get products for the selected category
    const categoryProducts = products[selectedCategory] || [];
    
    if (categoryProducts.length === 0) {
        productsContainer.innerHTML = '<p>No products found in this category.</p>';
        return;
    }
    
    // Create product cards for each item in the category
    categoryProducts.forEach(item => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h4>${item.name}</h4>
            <div class="product-price">R${item.price.toFixed(2)}</div>
            <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})" class="add-to-cart-btn">
                Add to Cart
            </button>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Add item to cart
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity: 1
        });
    }
    
    updateCart();
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>
                <input type="number" min="1" value="${item.quantity}" 
                       onchange="updateQuantity(${index}, this.value)" class="quantity-input">
            </td>
            <td>R${item.price.toFixed(2)}</td>
            <td>R${itemTotal.toFixed(2)}</td>
            <td><button onclick="removeItem(${index})" class="btn btn-danger">Remove</button></td>
        `;
        
        cartItems.appendChild(row);
    });
    
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;
    
    document.getElementById('subtotal').textContent = '' + subtotal.toFixed(2);
    document.getElementById('vat').textContent = '' + vat.toFixed(2);
    document.getElementById('total').textContent = '' + total.toFixed(2);
}

// Update item quantity
function updateQuantity(index, newQuantity) {
    const quantity = parseInt(newQuantity);
    
    if (isNaN(quantity) || quantity < 1) {
        alert('Please enter a valid quantity');
        updateCart(); // Reset to previous value
        return;
    }
    
    cart[index].quantity = quantity;
    updateCart();
}

// Remove item from cart
function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

// Clear cart
function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        updateCart();
    }
}

// Function to save text to file
function saveTextAsFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Process checkout
function processCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Generate receipt
    let receipt = `=== GEDLEHLEKISA SPAZA ===\n`;
    receipt += '6866 Ext 7 Sakhile, Standerton\n';
    receipt += 'Tel: +27 60 642 9587\n';
    receipt += 'VAT: aa1\n';
    receipt += '------------------------\n';
    receipt += `Cashier: ${currentCashier}\n`;
    receipt += `Date: ${new Date().toLocaleString()}\n`;
    receipt += '------------------------\n\n';
    
    // Add items
    receipt += 'ITEM                QTY   PRICE    TOTAL\n';
    receipt += '----------------------------------------\n';
    
    cart.forEach(item => {
        const name = item.name.padEnd(20, ' ').substring(0, 20);
        const qty = item.quantity.toString().padStart(3, ' ');
        const price = `R${item.price.toFixed(2)}`.padStart(8, ' ');
        const total = `R${(item.price * item.quantity).toFixed(2)}`.padStart(9, ' ');
        receipt += `${name} ${qty} ${price} ${total}\n`;
    });
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;
    
    // Format numbers with 2 decimal places
    const formatCurrency = (amount) => {
        return amount.toFixed(2).padStart(8, ' ');
    };
    
    receipt += '\n';
    receipt += `SUBTOTAL: R${formatCurrency(subtotal)}\n`;
    receipt += `VAT (15%): R${formatCurrency(vat)}\n`;
    receipt += '------------------------\n';
    receipt += `TOTAL: R${formatCurrency(total)}\n`;
    receipt += '========================\n';
    receipt += '   THANK YOU FOR SHOPPING WITH US!\n';
    receipt += '     PLEASE COME AGAIN SOON!\n';
    receipt += '========================\n';
    
    // Show receipt in alert
    alert(receipt);
    
    // Save receipt as text file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveTextAsFile(receipt, `receipt-${timestamp}.txt`);
    
    // Clear the cart after checkout
    clearCart();
}
const API_BASE = '/api/products';
let products = [];

const searchInput = document.getElementById('searchInput');
const categoryInput = document.getElementById('categoryInput');
const loadBtn = document.getElementById('loadBtn');
const addBtn = document.getElementById('addBtn');
const productsEl = document.getElementById('products');
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');

// Load products
async function loadProducts(query = {}) {
    try {
        productsEl.innerHTML = '<div class="loading">Loading  products... ✨</div>';
        
        const params = new URLSearchParams(query);
        const response = await fetch(`${API_BASE}?${params}`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        productsEl.innerHTML = `<div class="error">❌ Error loading products: ${error.message}</div>`;
        console.error(error);
    }
}

// Display products
function displayProducts(productsList) {
    if (productsList.length === 0) {
        productsEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #718096;">No products found 🥺 Try a different search!</div>';
        return;
    }

    productsEl.innerHTML = productsList.map(product => `
        <div class="product-card" data-id="${product._id}">
            <button class="delete-btn" onclick="deleteProduct('${product._id}')">🗑️</button>
            <div class="product-name">${product.name || 'Unnamed Product'}</div>
            <div class="product-price">$${product.price?.toFixed(2) || '0.00'}</div>
            <div class="product-category">${product.category || 'Uncategorized'}</div>
            <div class="product-description">${product.description || 'No description available.'}</div>
    `).join('');
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Delete this product? 😢')) return;
    
    try {
        const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadProducts();
            showMessage('Product deleted successfully! 🗑️', 'success');
        } else {
            throw new Error('Failed to delete');
        }
    } catch (error) {
        showMessage(`Delete failed: ${error.message}`, 'error');
    }
}

// Show message
function showMessage(msg, type = 'error') {
    const el = document.createElement('div');
    el.className = type;
    el.textContent = msg;
    document.querySelector('.container').insertBefore(el, productsEl);
    setTimeout(() => el.remove(), 4000);
}

// Modal functions
addBtn.addEventListener('click', () => {
    addModal.style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
    addModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === addModal) addModal.style.display = 'none';
});

// Add product form
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value,
        description: document.getElementById('description').value
    };

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            addModal.style.display = 'none';
            addForm.reset();
            loadProducts();
            showMessage('New product added! 🎉', 'success');
        } else {
            throw new Error('Failed to add product');
        }
    } catch (error) {
        showMessage(`Add failed: ${error.message}`, 'error');
    }
});

// Search & events
function updateSearch() {
    const keyword = searchInput.value.trim();
    const category = categoryInput.value.trim();
    const query = {};
    
    if (keyword) query.keyword = keyword;
    if (category) query.category = category;
    
    loadProducts(query);
}

searchInput.addEventListener('input', debounce(updateSearch, 500));
categoryInput.addEventListener('input', debounce(updateSearch, 500));
loadBtn.addEventListener('click', () => loadProducts());

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initial load
loadProducts();

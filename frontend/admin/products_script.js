document.addEventListener('DOMContentLoaded', async () => {
    const productListContainer = document.getElementById('product-list-admin-container');
    const messageDiv = document.getElementById('admin-message');
    
    // Modal elements
    const editModal = document.getElementById('edit-product-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
    const editProductForm = document.getElementById('edit-product-form');

    // Form fields
    const productIdInput = document.getElementById('edit-product-id');
    const productNameInput = document.getElementById('edit-product-name');
    const productPriceInput = document.getElementById('edit-product-price');
    const productDescriptionInput = document.getElementById('edit-product-description');
    const productCategoryInput = document.getElementById('edit-product-category');
    const productSubcategoryInput = document.getElementById('edit-product-subcategory');
    const productColorInput = document.getElementById('edit-product-color');
    const productCountryInput = document.getElementById('edit-product-country');

    let allProducts = []; // To store fetched products for easy access

    async function checkAdminSessionAndFetchProducts() {
        try {
            const response = await fetch('/admin/products', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = 'login.html';
                } else {
                    const data = await response.json();
                    displayMessage('Error fetching products: ' + (data.message || response.statusText), true);
                }
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Error during session check or fetching products:', error);
            displayMessage('Could not connect to server or verify session.', true);
            return null;
        }
    }

    function displayMessage(message, isError = false) {
        if (!messageDiv) return;
        messageDiv.textContent = message;
        messageDiv.className = isError ? 'message error' : 'message success';
        messageDiv.style.display = 'block';
        setTimeout(() => { messageDiv.style.display = 'none'; }, 3000); // Hide after 3s
    }

    function renderProducts(products) {
        if (!productListContainer) return;
        allProducts = products; // Store for later use
        if (!products || products.length === 0) {
            productListContainer.innerHTML = '<p>No products found.</p>';
            return;
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Subcategory</th>
                    <th>Color</th><th>Origin</th><th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');
        products.forEach(product => {
            const row = tbody.insertRow();
            row.insertCell().textContent = product.id;
            row.insertCell().textContent = product.name;
            row.insertCell().textContent = product.price.toFixed(2);
            row.insertCell().textContent = product.category;
            row.insertCell().textContent = product.subcategory || 'N/A';
            row.insertCell().textContent = product.color || 'N/A';
            row.insertCell().textContent = product.country_of_origin || 'N/A';
            
            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-btn');
            editButton.dataset.productId = product.id;
            actionsCell.appendChild(editButton);
        });
        productListContainer.innerHTML = ''; // Clear "Loading..."
        productListContainer.appendChild(table);
    }

    // Event listener for Edit buttons (using event delegation)
    productListContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const productId = event.target.dataset.productId;
            const productToEdit = allProducts.find(p => p.id == productId);
            if (productToEdit) {
                openEditModal(productToEdit);
            }
        }
    });

    function openEditModal(product) {
        productIdInput.value = product.id;
        productNameInput.value = product.name;
        productPriceInput.value = product.price;
        productDescriptionInput.value = product.description || '';
        productCategoryInput.value = product.category || '';
        productSubcategoryInput.value = product.subcategory || '';
        productColorInput.value = product.color || '';
        productCountryInput.value = product.country_of_origin || '';
        editModal.style.display = 'block';
    }

    // Close modal
    if(closeEditModalBtn) {
        closeEditModalBtn.onclick = () => { editModal.style.display = 'none'; };
    }
    window.onclick = (event) => { // Close if clicked outside modal content
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    };

    // Handle Edit Form Submission
    editProductForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const productId = productIdInput.value;
        const updatedData = {
            name: productNameInput.value,
            price: parseFloat(productPriceInput.value),
            description: productDescriptionInput.value,
            category: productCategoryInput.value,
            subcategory: productSubcategoryInput.value,
            color: productColorInput.value,
            country_of_origin: productCountryInput.value,
        };
        
        try {
            const response = await fetch(`/admin/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const result = await response.json();
            if (response.ok) {
                displayMessage('Product updated successfully!', false);
                editModal.style.display = 'none';
                // Refresh product list
                const products = await checkAdminSessionAndFetchProducts();
                if (products) renderProducts(products);
            } else {
                displayMessage('Error updating product: ' + (result.message || 'Unknown error'), true);
            }
        } catch (error) {
            console.error('Error submitting product update:', error);
            displayMessage('Failed to submit update: ' + error.message, true);
        }
    });

    // Initial load
    async function init() {
        const products = await checkAdminSessionAndFetchProducts();
        if (products) {
            renderProducts(products);
        } else {
            if (productListContainer) productListContainer.innerHTML = '<p>Could not load product data.</p>';
        }
    }
    init();
});

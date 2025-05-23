document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and DOM Elements (Shared) ---
    const API_BASE_URL = 'http://127.0.0.1:5000/api';
    const userMessageArea = document.getElementById('user-message-area');

    // --- Product Display Elements ---
    const productListContainer = document.getElementById('product-list-container');
    const modal = document.getElementById('product-detail-modal');
    const closeModalButton = modal ? modal.querySelector('.close-button') : null;
    const modalProductName = document.getElementById('modal-product-name');
    const modalProductPrice = document.getElementById('modal-product-price');
    const modalProductCategory = document.getElementById('modal-product-category');
    const modalProductDescription = document.getElementById('modal-product-description');
    const modalAddToCartButton = document.getElementById('modal-add-to-cart-button');

    // --- Auth Elements ---
    const registrationSection = document.getElementById('registration-section');
    const loginSection = document.getElementById('login-section');
    const userProfileContainer = document.getElementById('user-profile-container');
    const mainContentArea = document.getElementById('main-content-area'); // Wraps products, login, register

    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    
    const loginNavLink = document.getElementById('login-nav-link');
    const registerNavLink = document.getElementById('register-nav-link');
    const profileNavLink = document.getElementById('profile-nav-link');
    const logoutButton = document.getElementById('logout-button');
    const viewCartLink = document.getElementById('view-cart-link');

    const profileUsernameSpan = document.getElementById('profile-username');
    const profileEmailSpan = document.getElementById('profile-email');

    const showLoginLink = document.getElementById('show-login-link');
    const showRegisterLink = document.getElementById('show-register-link');

    // --- Cart Elements ---
    const cartContainer = document.getElementById('cart-container');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPriceSpan = document.getElementById('cart-total-price');
    const checkoutButton = document.getElementById('checkout-button');

    // --- Global State ---
    let currentUser = null;

    // --- Utility Functions ---
    function displayMessage(message, type = 'info') {
        if (!userMessageArea) return;
        userMessageArea.textContent = message;
        userMessageArea.className = `message-area ${type}`;
        userMessageArea.style.display = 'block';
        setTimeout(() => {
            userMessageArea.style.display = 'none';
            userMessageArea.textContent = '';
            userMessageArea.className = 'message-area';
        }, 5000);
    }

    function showSection(sectionIdToShow) {
        const allSections = [registrationSection, loginSection, userProfileContainer, cartContainer, mainContentArea];
        allSections.forEach(section => {
            if (section) section.style.display = 'none';
        });
        const sectionElement = document.getElementById(sectionIdToShow);
        if (sectionElement) {
            sectionElement.style.display = 'block';
        }
         // If showing cart, profile, or main content (products), ensure main content wrapper is visible (if it exists)
        if (['cart-container', 'user-profile-container', 'main-content-area'].includes(sectionIdToShow)) {
            if(mainContentArea && sectionIdToShow !== 'cart-container' && sectionIdToShow !== 'user-profile-container') { // if showing main content area itself
                 // No, this logic is flawed. Let's simplify:
                 // mainContentArea (products, login, register forms) is one view.
                 // cartContainer is another view.
                 // userProfileContainer can be part of mainContentArea or its own view.
                 // For now, let's assume cart is exclusive. Profile can be shown with products.
            }
        }
        if (sectionIdToShow === 'cart-container') {
             if(mainContentArea) mainContentArea.style.display = 'none'; // Hide products/auth forms when cart is shown
        } else {
            if(mainContentArea) mainContentArea.style.display = 'block'; // Show products/auth forms otherwise
            if (sectionIdToShow === 'login-section' || sectionIdToShow === 'registration-section') {
                if(productListContainer) productListContainer.style.display = 'none'; // Hide products specifically
                if(userProfileContainer) userProfileContainer.style.display = 'none';
            } else {
                 if(productListContainer) productListContainer.style.display = 'grid'; // or 'block'
            }
        }
    }
    
    function updateNavLinks() {
        if (!loginNavLink || !registerNavLink || !profileNavLink || !logoutButton || !viewCartLink) return;
        if (currentUser) {
            loginNavLink.style.display = 'none';
            registerNavLink.style.display = 'none';
            profileNavLink.style.display = 'block';
            logoutButton.style.display = 'block';
            viewCartLink.style.display = 'block';
        } else {
            loginNavLink.style.display = 'block';
            registerNavLink.style.display = 'block';
            profileNavLink.style.display = 'none';
            logoutButton.style.display = 'none';
            viewCartLink.style.display = 'none';
            if (cartContainer) cartContainer.style.display = 'none'; // Hide cart if logged out
        }
    }

    // --- Product Display Logic ---
    async function fetchAndDisplayProducts() {
        if (!productListContainer) return;
        try {
            const response = await fetch('/api/products/'); // Changed to relative path
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const products = await response.json();
            productListContainer.innerHTML = '';
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.productId = product.id;
                card.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                    <button class="view-details-btn">View Details</button>
                `;
                card.querySelector('.view-details-btn').addEventListener('click', (event) => {
                    event.stopPropagation();
                    fetchProductDetails(product.id);
                });
                productListContainer.appendChild(card);
            });
        } catch (error) {
            productListContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
        }
    }

    async function fetchProductDetails(productId) {
        if (!modal) return;
        try {
            const response = await fetch(`/api/products/${productId}`); // Changed to relative path
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const product = await response.json();
            if(modalProductName) modalProductName.textContent = product.name;
            if(modalProductPrice) modalProductPrice.textContent = `$${product.price.toFixed(2)}`;
            if(modalProductCategory) modalProductCategory.textContent = product.category;
            if(modalProductDescription) modalProductDescription.textContent = product.description;
            if(modalAddToCartButton) modalAddToCartButton.dataset.productId = product.id;
            modal.style.display = 'block';
        } catch (error) {
            alert('Error loading product details.');
        }
    }

    if (closeModalButton) closeModalButton.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => { if (event.target === modal) modal.style.display = 'none'; });
    
    // --- Cart Logic ---
    async function fetchAndDisplayCart(userId) {
        if (!userId) {
            if (cartContainer) cartContainer.style.display = 'none';
            return;
        }
        if (!cartContainer || !cartItemsList || !cartTotalPriceSpan) return;

        try {
            const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
            if (!response.ok) {
                if(response.status === 404) { // User might not have a cart / or user not found by backend
                    displayMessage('Your cart is empty or could not be retrieved.', 'info');
                    cartItemsList.innerHTML = '<p>Your cart is currently empty.</p>';
                    cartTotalPriceSpan.textContent = '0.00';
                    if(checkoutButton) checkoutButton.style.display = 'none';
                    showSection('cart-container'); // Show the empty cart container
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cartData = await response.json();
            
            cartItemsList.innerHTML = ''; // Clear previous items
            if (cartData.cart_items && cartData.cart_items.length > 0) {
                cartData.cart_items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'cart-item';
                    itemDiv.dataset.cartItemId = item.cart_item_id;
                    itemDiv.innerHTML = `
                        <h4>${item.product.name}</h4>
                        <p>Price: $${item.product.price.toFixed(2)}</p>
                        <p>Quantity: 
                            <button class="cart-quantity-decrease" data-item-id="${item.cart_item_id}">-</button>
                            <span class="cart-item-quantity">${item.quantity}</span>
                            <button class="cart-quantity-increase" data-item-id="${item.cart_item_id}">+</button>
                        </p>
                        <p>Item Total: $${item.item_total_price.toFixed(2)}</p>
                        <button class="cart-remove-item" data-item-id="${item.cart_item_id}">Remove</button>
                    `;
                    cartItemsList.appendChild(itemDiv);
                });
                if(checkoutButton) checkoutButton.style.display = 'block';
            } else {
                cartItemsList.innerHTML = '<p>Your cart is currently empty.</p>';
                if(checkoutButton) checkoutButton.style.display = 'none';
            }
            cartTotalPriceSpan.textContent = cartData.total_cart_price.toFixed(2);
            attachCartItemEventListeners();
            showSection('cart-container'); // Display the cart section
        } catch (error) {
            displayMessage('Error fetching cart: ' + error.message, 'error');
            cartItemsList.innerHTML = '<p>Could not load cart items.</p>';
            cartTotalPriceSpan.textContent = '0.00';
        }
    }

    function attachCartItemEventListeners() {
        document.querySelectorAll('.cart-quantity-decrease').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        document.querySelectorAll('.cart-quantity-increase').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        document.querySelectorAll('.cart-remove-item').forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    }

    async function handleQuantityChange(event) {
        if (!currentUser) return;
        const cartItemId = event.target.dataset.itemId;
        const cartItemDiv = event.target.closest('.cart-item');
        const quantitySpan = cartItemDiv.querySelector('.cart-item-quantity');
        let currentQuantity = parseInt(quantitySpan.textContent);

        if (event.target.classList.contains('cart-quantity-decrease')) {
            currentQuantity--;
        } else {
            currentQuantity++;
        }

        if (currentQuantity < 0) currentQuantity = 0; // Should be handled by API too (0 means remove)

        try {
            const response = await fetch(`${API_BASE_URL}/cart/item/${cartItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: currentQuantity }),
            });
            if (!response.ok) throw new Error('Failed to update quantity');
            // const data = await response.json(); // Contains updated item or removal message
            // displayMessage(data.message || 'Quantity updated.', 'success');
            fetchAndDisplayCart(currentUser.id); // Refresh cart
        } catch (error) {
            displayMessage('Error updating quantity: ' + error.message, 'error');
        }
    }

    async function handleRemoveItem(event) {
        if (!currentUser) return;
        const cartItemId = event.target.dataset.itemId;
        try {
            const response = await fetch(`${API_BASE_URL}/cart/item/${cartItemId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to remove item');
            // const data = await response.json();
            // displayMessage(data.message || 'Item removed.', 'success');
            fetchAndDisplayCart(currentUser.id); // Refresh cart
        } catch (error) {
            displayMessage('Error removing item: ' + error.message, 'error');
        }
    }
    
    if (modalAddToCartButton) {
        modalAddToCartButton.addEventListener('click', async () => {
            const productId = modalAddToCartButton.dataset.productId;
            if (!currentUser || !currentUser.id) {
                displayMessage('Please login to add items to your cart.', 'error');
                showSection('login-section');
                if (modal) modal.style.display = 'none';
                return;
            }
            const userId = currentUser.id;
            const quantity = 1; // Default to 1

            try {
                const response = await fetch(`${API_BASE_URL}/cart/`, { // Note: API endpoint is /api/cart/
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, product_id: parseInt(productId), quantity: quantity }),
                });
                const data = await response.json();
                if (response.ok) {
                    displayMessage(data.message || 'Item added to cart!', 'success');
                    if (modal) modal.style.display = 'none';
                    fetchAndDisplayCart(userId); // Refresh cart view
                } else {
                    throw new Error(data.error || 'Failed to add item to cart');
                }
            } catch (error) {
                displayMessage('Error adding to cart: ' + error.message, 'error');
            }
        });
    }

    if (viewCartLink) {
        viewCartLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser && currentUser.id) {
                fetchAndDisplayCart(currentUser.id);
            } else {
                displayMessage('Please login to view your cart.', 'info');
                showSection('login-section');
            }
        });
    }


    // --- Auth Logic ---
    if (loginNavLink) loginNavLink.addEventListener('click', (e) => { e.preventDefault(); showSection('login-section'); if(cartContainer) cartContainer.style.display = 'none'; });
    if (registerNavLink) registerNavLink.addEventListener('click', (e) => { e.preventDefault(); showSection('registration-section'); if(cartContainer) cartContainer.style.display = 'none'; });
    if (profileNavLink) profileNavLink.addEventListener('click', (e) => { e.preventDefault(); fetchAndDisplayUserProfile(); if(cartContainer) cartContainer.style.display = 'none';});
    
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showSection('login-section'); });
    if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showSection('registration-section'); });

    if (registrationForm) {
        registrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // ... (registration logic as before)
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            try {
                const response = await fetch(`${API_BASE_URL}/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    displayMessage(`Registration successful for ${data.user.username}! Please login.`, 'success');
                    registrationForm.reset();
                    showSection('login-section');
                } else {
                    displayMessage(`Registration failed: ${data.error || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                displayMessage('Registration request failed. Please try again.', 'error');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // ... (login logic as before)
            const username_or_email = document.getElementById('login-username-email').value;
            const password = document.getElementById('login-password').value;
            try {
                const response = await fetch(`${API_BASE_URL}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username_or_email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    currentUser = data.user; 
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    displayMessage(`Login successful! Welcome ${currentUser.username}.`, 'success');
                    loginForm.reset();
                    updateNavLinks();
                    fetchAndDisplayUserProfile(); // Show profile
                    fetchAndDisplayCart(currentUser.id); // Fetch cart but don't show it yet unless view cart is clicked
                } else {
                    displayMessage(`Login failed: ${data.error || 'Invalid credentials'}`, 'error');
                }
            } catch (error) {
                displayMessage('Login request failed. Please try again.', 'error');
            }
        });
    }
    
    async function fetchAndDisplayUserProfile() {
        if (currentUser && currentUser.id) {
            if(profileUsernameSpan) profileUsernameSpan.textContent = currentUser.username;
            if(profileEmailSpan) profileEmailSpan.textContent = currentUser.email;
            showSection('user-profile-container');
             if(mainContentArea) mainContentArea.style.display = 'block'; // ensure products are visible with profile
             if(productListContainer) productListContainer.style.display = 'grid';
        } else {
            displayMessage('Please log in to view your profile.', 'info');
            showSection('login-section');
        }
        updateNavLinks();
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            currentUser = null;
            localStorage.removeItem('currentUser');
            displayMessage('Logged out successfully.', 'success');
            if(userProfileContainer) userProfileContainer.style.display = 'none';
            if(cartContainer) cartContainer.style.display = 'none';
            updateNavLinks();
            showSection('login-section'); // Or redirect to home/product view
            if(mainContentArea) mainContentArea.style.display = 'block';
            if(productListContainer) productListContainer.style.display = 'grid';

        });
    }

    function initializeAuthStatus() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            updateNavLinks();
            fetchAndDisplayUserProfile(); // Show profile by default if logged in
            fetchAndDisplayCart(currentUser.id); // Fetch cart data, but don't display it yet
        } else {
            updateNavLinks();
            showSection('main-content-area'); // Show products by default if not logged in
            if(loginSection) loginSection.style.display = 'none'; // Hide login form by default
            if(registrationSection) registrationSection.style.display = 'none';
        }
    }

    // Initial calls
    fetchAndDisplayProducts();
    initializeAuthStatus();

    // Overriding home link to ensure products are shown
    const homeNavLink = document.querySelector('nav ul li a[href="index.html"]');
    if(homeNavLink) {
        homeNavLink.addEventListener('click', (e) => {
            e.preventDefault();
            if(cartContainer) cartContainer.style.display = 'none';
            if(userProfileContainer) userProfileContainer.style.display = 'none';
            if(loginSection) loginSection.style.display = 'none';
            if(registrationSection) registrationSection.style.display = 'none';
            if(mainContentArea) mainContentArea.style.display = 'block';
            if(productListContainer) productListContainer.style.display = 'grid';
            fetchAndDisplayProducts(); // Re-fetch products or just ensure they are visible
        });
    }
});

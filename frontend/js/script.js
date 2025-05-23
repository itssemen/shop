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
    const mainContentArea = document.getElementById('main-content-area'); 

    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    
    // --- Navigation Elements ---
    const loginNavLink = document.getElementById('login-nav-link'); // Main "войти" link in nav
    const userGreetingNav = document.getElementById('user-greeting-nav'); // Span for "Welcome, User"
    const logoutButton = document.getElementById('logout-button'); // Main "выйти" button in nav
    const viewCartLink = document.getElementById('view-cart-link'); // Main "корзина" link in nav
    const catalogNavLink = document.getElementById('catalog-nav-link'); // Main "каталог" link in nav

    // Links in the hidden div, potentially used by JS but not primary navigation display items
    const actualRegisterNavLink = document.getElementById('register-nav-link'); 
    const actualProfileNavLink = document.getElementById('profile-nav-link'); 

    const profileUsernameSpan = document.getElementById('profile-username'); // In profile section
    const profileEmailSpan = document.getElementById('profile-email'); // In profile section

    const showLoginLink = document.getElementById('show-login-link'); // Link within registration form
    const showRegisterLink = document.getElementById('show-register-link'); // Link within login form

    // --- Cart Elements ---
    const cartContainer = document.getElementById('cart-container');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPriceSpan = document.getElementById('cart-total-price');
    const checkoutButton = document.getElementById('checkout-button');

    // --- Catalog Dropdown Elements ---
    let catalogDropdown = null; 

    // --- Filter and Sort Elements ---
    const productControlsSection = document.getElementById('product-controls-section');
    const sortBySelect = document.getElementById('sort-by-select');
    const sortOrderSelect = document.getElementById('sort-order-select');
    const filterCategoryDisplay = document.getElementById('filter-category-display');
    const filterSubcategoryDisplay = document.getElementById('filter-subcategory-display');
    const filterColorInput = document.getElementById('filter-color');
    const filterCountryInput = document.getElementById('filter-country');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

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
        const allPageSections = [registrationSection, loginSection, userProfileContainer, cartContainer, mainContentArea];
        allPageSections.forEach(section => {
            if (section) section.style.display = 'none';
        });
        
        const sectionElement = document.getElementById(sectionIdToShow);
        if (sectionElement) {
            sectionElement.style.display = 'block';
        }

        // Handle visibility of product-related sub-sections
        if (sectionIdToShow === 'main-content-area') {
            if (productListContainer) productListContainer.style.display = 'grid';
            if (productControlsSection) productControlsSection.style.display = 'block';
            // Ensure auth forms within mainContentArea are hidden if we are showing products
            if (loginSection) loginSection.style.display = 'none';
            if (registrationSection) registrationSection.style.display = 'none';
            if (userProfileContainer) userProfileContainer.style.display = 'none'; // Hide profile if showing all products
        } else if (sectionIdToShow === 'login-section' || sectionIdToShow === 'registration-section') {
            if (mainContentArea) mainContentArea.style.display = 'block'; // Auth forms are inside mainContentArea
            if (productListContainer) productListContainer.style.display = 'none';
            if (productControlsSection) productControlsSection.style.display = 'none';
            if (userProfileContainer) userProfileContainer.style.display = 'none';
        } else if (sectionIdToShow === 'user-profile-container') {
            if (mainContentArea) mainContentArea.style.display = 'block'; // Profile is inside mainContentArea
            if (productListContainer) productListContainer.style.display = 'grid'; // Show products with profile
            if (productControlsSection) productControlsSection.style.display = 'block'; // Show filters with profile
        } else if (sectionIdToShow === 'cart-container') {
            if (mainContentArea) mainContentArea.style.display = 'none'; // Cart is exclusive
            if (productControlsSection) productControlsSection.style.display = 'none';
        }
    }
    
    function updateNavLinks() {
        // Helper to set display style for a nav item (LI)
        const setNavDisplay = (element, displayStatus) => {
            if (element && element.parentElement.tagName === 'LI') {
                element.parentElement.style.display = displayStatus;
            } else if (element) { // Fallback if not in LI, though HTML structure implies LIs
                element.style.display = displayStatus;
            }
        };

        if (currentUser) {
            if(userGreetingNav) {
                userGreetingNav.textContent = currentUser.username; // No "Welcome," prefix to match issue
                setNavDisplay(userGreetingNav, 'list-item');
            }
            if(catalogNavLink) setNavDisplay(catalogNavLink, 'list-item');
            if(viewCartLink) setNavDisplay(viewCartLink, 'list-item');
            if(loginNavLink) setNavDisplay(loginNavLink, 'none');
            if(logoutButton) setNavDisplay(logoutButton, 'list-item');
        } else {
            if(userGreetingNav) setNavDisplay(userGreetingNav, 'none');
            if(catalogNavLink) setNavDisplay(catalogNavLink, 'list-item');
            if(viewCartLink) setNavDisplay(viewCartLink, 'list-item'); // Show cart link even if logged out
            if(loginNavLink) setNavDisplay(loginNavLink, 'list-item');
            if(logoutButton) setNavDisplay(logoutButton, 'none');
            if (cartContainer) cartContainer.style.display = 'none'; // Hide cart content if logged out
        }
    }

    // --- Product Display and Filtering Logic ---
    async function fetchAndDisplayProducts(category = null, subcategory = null, color = null, country = null, sortBy = null, sortOrder = null) {
        if (!productListContainer) return;
        let url = '/api/products/';
        const params = new URLSearchParams();

        if (category) params.append('category', category);
        if (subcategory) params.append('subcategory', subcategory);
        if (color) params.append('color', color);
        if (country) params.append('country_of_origin', country);
        if (sortBy) params.append('sort_by', sortBy);
        if (sortOrder) params.append('order', sortOrder);
        
        if (params.toString()) url += `?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const products = await response.json();
            productListContainer.innerHTML = ''; 
            if (products.length === 0) {
                productListContainer.innerHTML = '<p>No products found matching your criteria.</p>';
            } else {
                products.forEach(product => {
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.dataset.productId = product.id;
                    card.innerHTML = `
                        <h3>${product.name}</h3>
                        <p>$${product.price.toFixed(2)}</p>
                        <button class="view-details-btn" data-product-id="${product.id}">View Details</button>
                        <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button> 
                    `;
                    productListContainer.appendChild(card);
                });
                attachProductCardButtonListeners();
            }
        } catch (error) {
            productListContainer.innerHTML = `<p>Error loading products: ${error.message}. Please try again later.</p>`;
            console.error('Error fetching products:', error);
        }
    }

    function attachProductCardButtonListeners() {
        document.querySelectorAll('.product-card .view-details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const productId = event.target.dataset.productId;
                fetchProductDetails(productId);
            });
        });
        document.querySelectorAll('.product-card .add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const productId = event.target.dataset.productId;
                addItemToCart(productId, 1); // No need to check currentUser here, addItemToCart does it
            });
        });
    }

    async function fetchProductDetails(productId) {
        // ... (as before)
        if (!modal) return;
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const product = await response.json();
            if(modalProductName) modalProductName.textContent = product.name;
            if(modalProductPrice) modalProductPrice.textContent = `$${product.price.toFixed(2)}`;
            if(modalProductCategory) modalProductCategory.textContent = `${product.category} > ${product.subcategory || ''}`;
            if(modalProductDescription) modalProductDescription.textContent = product.description;
            if(modalAddToCartButton) modalAddToCartButton.dataset.productId = product.id;
            modal.style.display = 'block';
        } catch (error) {
            displayMessage('Error loading product details: ' + error.message, 'error');
        }
    }

    if (closeModalButton) closeModalButton.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => { if (event.target === modal) modal.style.display = 'none'; });
    
    // --- Cart Logic ---
    async function addItemToCart(productId, quantity = 1) {
        if (!currentUser || !currentUser.id) {
            displayMessage('Please login to add items to your cart.', 'error');
            showSection('login-section');
            if (modal && modal.style.display === 'block') modal.style.display = 'none'; 
            if (catalogDropdown && catalogDropdown.style.display === 'block') catalogDropdown.style.display = 'none'; 
            return;
        }
        const userId = currentUser.id;
        try {
            const response = await fetch(`${API_BASE_URL}/cart/`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, product_id: parseInt(productId), quantity: quantity }),
            });
            const data = await response.json();
            if (response.ok) {
                displayMessage(data.message || 'Item added to cart!', 'success');
                if (modal && modal.style.display === 'block') modal.style.display = 'none'; 
                if (cartContainer && cartContainer.style.display === 'block') {
                    fetchAndDisplayCart(userId);
                }
            } else {
                throw new Error(data.error || 'Failed to add item to cart');
            }
        } catch (error) {
            displayMessage(`Error adding to cart: ${error.message}`, 'error');
            console.error('addItemToCart error:', error);
        }
    }

    if (modalAddToCartButton) {
        modalAddToCartButton.addEventListener('click', async () => {
            const productId = modalAddToCartButton.dataset.productId;
            addItemToCart(productId, 1); 
        });
    }
    
    async function fetchAndDisplayCart(userId) {
        // ... (as before)
        if (!userId) {
            if (cartContainer) cartContainer.style.display = 'none';
            return;
        }
        if (!cartContainer || !cartItemsList || !cartTotalPriceSpan) return;

        try {
            const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
            if (!response.ok) {
                if(response.status === 404) { 
                    cartItemsList.innerHTML = '<p>Your cart is currently empty.</p>';
                    cartTotalPriceSpan.textContent = '0.00';
                    if(checkoutButton) checkoutButton.style.display = 'none';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cartData = await response.json();
            
            cartItemsList.innerHTML = ''; 
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
        } catch (error) {
            displayMessage('Error fetching cart: ' + error.message, 'error');
        }
    }

    function attachCartItemEventListeners() {
        // ... (as before)
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
        // ... (as before)
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

        if (currentQuantity < 0) currentQuantity = 0; 

        try {
            const response = await fetch(`${API_BASE_URL}/cart/item/${cartItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: currentQuantity }),
            });
            if (!response.ok) throw new Error('Failed to update quantity');
            fetchAndDisplayCart(currentUser.id); 
        } catch (error) {
            displayMessage('Error updating quantity: ' + error.message, 'error');
        }
    }

    async function handleRemoveItem(event) {
        // ... (as before)
        if (!currentUser) return;
        const cartItemId = event.target.dataset.itemId;
        try {
            const response = await fetch(`${API_BASE_URL}/cart/item/${cartItemId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to remove item');
            fetchAndDisplayCart(currentUser.id); 
        } catch (error) {
            displayMessage('Error removing item: ' + error.message, 'error');
        }
    }
    
    if (viewCartLink) {
        viewCartLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser && currentUser.id) {
                fetchAndDisplayCart(currentUser.id); 
                showSection('cart-container');    
            } else {
                displayMessage('Please login to view your cart.', 'info');
                showSection('login-section');
            }
        });
    }

    // --- Auth Logic & Navigation ---
    if (loginNavLink) { // This is the "войти" link in the nav
        loginNavLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            showSection('login-section'); 
            if(catalogDropdown) catalogDropdown.style.display = 'none'; 
        });
    }
    if (actualRegisterNavLink) { // This is the "Register" link from the hidden div
        actualRegisterNavLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            showSection('registration-section'); 
            if(catalogDropdown) catalogDropdown.style.display = 'none'; 
        });
    }
    if (actualProfileNavLink) { // This is the "Profile" link from the hidden div
        actualProfileNavLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            fetchAndDisplayUserProfile(); // This calls showSection('user-profile-container')
            if(catalogDropdown) catalogDropdown.style.display = 'none';
        });
    }
    
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showSection('login-section'); });
    if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showSection('registration-section'); });

    if (registrationForm) {
        registrationForm.addEventListener('submit', async (event) => {
            // ... (as before)
            event.preventDefault();
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
            // ... (as before)
            event.preventDefault();
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
                    showSection('main-content-area'); 
                    resetFilterControls(); 
                    fetchAndDisplayProducts(); 
                    fetchAndDisplayCart(currentUser.id); 
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
        } else {
            displayMessage('Please log in to view your profile.', 'info');
            showSection('login-section');
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            currentUser = null;
            localStorage.removeItem('currentUser');
            displayMessage('Logged out successfully.', 'success');
            
            if(userProfileContainer) userProfileContainer.style.display = 'none';
            if(cartContainer) cartContainer.style.display = 'none';
            if(catalogDropdown) catalogDropdown.style.display = 'none';
            
            updateNavLinks();
            resetFilterControls();
            showSection('main-content-area'); 
            fetchAndDisplayProducts();
        });
    }

    function initializeAuthStatus() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            fetchAndDisplayCart(currentUser.id); // Fetch cart but don't show it
        }
        updateNavLinks(); 
        resetFilterControls(); 
        showSection('main-content-area'); // Show products and filters by default
        fetchAndDisplayProducts(); 
    }

    // --- Catalog Dropdown Logic ---
    if (catalogNavLink) {
        catalogNavLink.addEventListener('click', async (event) => {
            // ... (as before)
            event.preventDefault();
            event.stopPropagation(); 
            if (catalogDropdown && catalogDropdown.style.display === 'block') {
                catalogDropdown.style.display = 'none';
                return;
            }
            if (catalogDropdown) { 
                positionAndShowDropdown();
                return;
            }
            try {
                const response = await fetch('/api/categories/');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const categoriesData = await response.json();
                buildAndShowCatalogDropdown(categoriesData);
            } catch (error) {
                displayMessage(`Error fetching categories: ${error.message}`, 'error');
                console.error('Error fetching categories:', error);
            }
        });
    }

    function buildAndShowCatalogDropdown(categoriesData) {
        // ... (as before, ensuring resetFilterControls is called correctly)
        if (catalogDropdown) catalogDropdown.remove(); 
        catalogDropdown = document.createElement('div');
        catalogDropdown.id = 'catalog-dropdown';
        // Basic inline styles (actual styling will be in CSS)
        catalogDropdown.style.position = 'absolute'; // Let CSS handle this
        catalogDropdown.style.zIndex = '1000';       // Let CSS handle this

        const mainCategoriesUl = document.createElement('ul');
        mainCategoriesUl.className = 'main-categories';

        categoriesData.forEach(category => {
            const mainCategoryLi = document.createElement('li');
            mainCategoryLi.className = 'main-category-item';
            mainCategoryLi.textContent = category.name;
            mainCategoryLi.dataset.categoryName = category.name;
            
            mainCategoryLi.addEventListener('click', (e) => {
                if (e.target === mainCategoryLi) { 
                    resetFilterControls(); 
                    if(filterCategoryDisplay) filterCategoryDisplay.value = category.name;
                    if(filterSubcategoryDisplay) filterSubcategoryDisplay.value = ''; 
                    fetchAndDisplayProducts(category.name, null, null, null, sortBySelect.value, sortOrderSelect.value);
                    if (catalogDropdown) catalogDropdown.style.display = 'none';
                }
            });

            if (category.subcategories && category.subcategories.length > 0) {
                const subcategoriesUl = document.createElement('ul');
                subcategoriesUl.className = 'subcategories';

                category.subcategories.forEach(subcategoryName => {
                    const subcategoryLi = document.createElement('li');
                    subcategoryLi.className = 'subcategory-item';
                    subcategoryLi.textContent = subcategoryName;
                    subcategoryLi.dataset.subcategoryName = subcategoryName;
                    
                    subcategoryLi.addEventListener('click', (e) => {
                        e.stopPropagation(); 
                        resetFilterControls(); 
                        if(filterCategoryDisplay) filterCategoryDisplay.value = category.name;
                        if(filterSubcategoryDisplay) filterSubcategoryDisplay.value = subcategoryName;
                        fetchAndDisplayProducts(category.name, subcategoryName, null, null, sortBySelect.value, sortOrderSelect.value);
                        if (catalogDropdown) catalogDropdown.style.display = 'none';
                    });
                    subcategoriesUl.appendChild(subcategoryLi);
                });
                mainCategoryLi.appendChild(subcategoriesUl);

                mainCategoryLi.addEventListener('mouseenter', () => {
                    const allSubULs = mainCategoryLi.parentElement.querySelectorAll('.subcategories');
                    allSubULs.forEach(ul => { if(ul !== subcategoriesUl) ul.style.display = 'none';});
                    subcategoriesUl.style.display = 'block';
                });
                mainCategoryLi.addEventListener('mouseleave', (e) => {
                     if (!subcategoriesUl.contains(e.relatedTarget) && e.relatedTarget !== subcategoriesUl) {
                        subcategoriesUl.style.display = 'none';
                    }
                });
                subcategoriesUl.addEventListener('mouseleave', (e) => {
                    if (!mainCategoryLi.contains(e.relatedTarget) && e.relatedTarget !== mainCategoryLi ) {
                         subcategoriesUl.style.display = 'none';
                    }
                });
            } else { 
                 mainCategoryLi.addEventListener('mouseenter', () => {
                    const allSubULs = mainCategoryLi.parentElement.querySelectorAll('.subcategories');
                    allSubULs.forEach(ul => ul.style.display = 'none');
                });
            }
            mainCategoriesUl.appendChild(mainCategoryLi);
        });
        catalogDropdown.appendChild(mainCategoriesUl);
        document.body.appendChild(catalogDropdown); 
        positionAndShowDropdown();
        if (!document.catalogDropdownClickListenerAdded) {
            document.addEventListener('click', handleClickOutsideDropdown, true); 
            document.catalogDropdownClickListenerAdded = true; 
        }
    }
    
    function positionAndShowDropdown() {
        if (!catalogDropdown || !catalogNavLink) return;
        const rect = catalogNavLink.getBoundingClientRect();
        catalogDropdown.style.top = `${rect.bottom + window.scrollY}px`;
        catalogDropdown.style.left = `${rect.left + window.scrollX}px`;
        catalogDropdown.style.display = 'block';
    }

    function handleClickOutsideDropdown(event) {
        if (catalogDropdown && catalogDropdown.style.display === 'block') {
            if (event.target === catalogNavLink || catalogDropdown.contains(event.target)) {
                return; 
            }
            catalogDropdown.style.display = 'none'; 
        }
    }

    // --- Filter and Sort Button Logic ---
    function resetFilterControls() {
        if (sortBySelect) sortBySelect.value = ""; 
        if (sortOrderSelect) sortOrderSelect.value = "asc"; 
        if (filterCategoryDisplay) filterCategoryDisplay.value = "";
        if (filterSubcategoryDisplay) filterSubcategoryDisplay.value = "";
        if (filterColorInput) filterColorInput.value = "";
        if (filterCountryInput) filterCountryInput.value = "";
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const category = filterCategoryDisplay ? filterCategoryDisplay.value : null;
            const subcategory = filterSubcategoryDisplay ? filterSubcategoryDisplay.value : null;
            const color = filterColorInput ? filterColorInput.value.trim() : null;
            const country = filterCountryInput ? filterCountryInput.value.trim() : null;
            const sortBy = sortBySelect ? sortBySelect.value : null;
            const sortOrder = sortOrderSelect ? sortOrderSelect.value : null;
            
            fetchAndDisplayProducts(category, subcategory, color, country, sortBy, sortOrder);
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            resetFilterControls();
            fetchAndDisplayProducts(); 
        });
    }
    
    // Initial calls
    initializeAuthStatus(); 

    const homeStoreLink = document.querySelector('header h1 a'); 
     if(homeStoreLink) {
        homeStoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            if(cartContainer) cartContainer.style.display = 'none';
            if(userProfileContainer) userProfileContainer.style.display = 'none';
            if(loginSection) loginSection.style.display = 'none';
            if(registrationSection) registrationSection.style.display = 'none';
            if(catalogDropdown && catalogDropdown.style.display !== 'none') {
                catalogDropdown.style.display = 'none';
            }
            resetFilterControls(); 
            showSection('main-content-area'); // This will show product list & controls
            fetchAndDisplayProducts(); 
        });
    }
});

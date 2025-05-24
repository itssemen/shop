document.addEventListener('DOMContentLoaded', async () => {
    const userListContainer = document.getElementById('user-list-container');
    const messageDiv = document.getElementById('admin-message'); // Assuming admin-message div exists

    async function checkAdminSessionAndFetchUsers() {
        try {
            const response = await fetch('/admin/users', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = 'login.html';
                } else {
                    const data = await response.json();
                    displayMessage('Error fetching users: ' + (data.message || response.statusText), true);
                }
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Error during session check or fetching users:', error);
            displayMessage('Could not connect to server or verify session.', true);
            return null;
        }
    }

    function displayMessage(message, isError = false) {
        if (!messageDiv) return;
        messageDiv.textContent = message;
        messageDiv.className = isError ? 'message error' : 'message success'; // Ensure .success styles are defined if used
        messageDiv.style.display = 'block';
    }

    function renderUsers(users) {
        if (!userListContainer) return;
        if (!users || users.length === 0) {
            userListContainer.innerHTML = '<p>No users found.</p>';
            return;
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Is Admin?</th>
                    <th>Last Login</th>
                    <th>Purchase Count</th>
                    <th>Total Purchase Amount</th>
                    <th>Purchases (Last 30 days)</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;
        const tbody = table.querySelector('tbody');
        users.forEach(user => {
            const row = tbody.insertRow();
            row.insertCell().textContent = user.id;
            row.insertCell().textContent = user.username;
            row.insertCell().textContent = user.email;
            row.insertCell().textContent = user.is_admin ? 'Yes' : 'No';
            // Placeholder stats - these will be 'null' or 0 based on backend
            row.insertCell().textContent = user.last_login || 'N/A';
            row.insertCell().textContent = user.purchase_count || 0;
            row.insertCell().textContent = user.total_purchase_amount ? user.total_purchase_amount.toFixed(2) : '0.00';
            row.insertCell().textContent = user.purchases_last_30_days || 0;
        });
        userListContainer.innerHTML = ''; // Clear "Loading..."
        userListContainer.appendChild(table);
    }

    const users = await checkAdminSessionAndFetchUsers();
    if (users) {
        renderUsers(users);
    } else {
         // Error message already shown by checkAdminSessionAndFetchUsers or user redirected
         if (userListContainer) userListContainer.innerHTML = '<p>Could not load user data.</p>';
    }
});

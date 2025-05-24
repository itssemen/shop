document.addEventListener('DOMContentLoaded', async () => {
    const orderListContainer = document.getElementById('order-list-admin-container');
    const messageDiv = document.getElementById('admin-message');

    async function checkAdminSessionAndFetchOrders() {
        try {
            const response = await fetch('/admin/orders', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = 'login.html';
                } else {
                    const data = await response.json();
                    displayMessage('Error fetching orders: ' + (data.message || response.statusText), true);
                }
                return null;
            }
            return await response.json(); // Expecting an array, even if empty
        } catch (error) {
            console.error('Error during session check or fetching orders:', error);
            displayMessage('Could not connect to server or verify session.', true);
            return null;
        }
    }

    function displayMessage(message, isError = false) {
        if (!messageDiv) return;
        messageDiv.textContent = message;
        messageDiv.className = isError ? 'message error' : 'message success';
        messageDiv.style.display = 'block';
        setTimeout(() => { messageDiv.style.display = 'none'; }, 3000);
    }

    function renderOrders(orders) {
        if (!orderListContainer) return;
        if (!orders || orders.length === 0) {
            orderListContainer.innerHTML = '<p>No orders found at the moment.</p>';
            // This is expected until the backend order functionality is fully implemented.
            return;
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Items (Count)</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');
        orders.forEach(order => {
            const row = tbody.insertRow();
            row.insertCell().textContent = order.id; // Assuming structure from future Order model
            row.insertCell().textContent = order.user_id;
            row.insertCell().textContent = new Date(order.order_date).toLocaleDateString();
            row.insertCell().textContent = order.status;
            row.insertCell().textContent = order.items ? order.items.length : 0; // Example
            row.insertCell().textContent = order.total_amount ? order.total_amount.toFixed(2) : '0.00'; // Example
            
            const actionsCell = row.insertCell();
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';
            approveButton.classList.add('approve-order-btn');
            approveButton.dataset.orderId = order.id;
            approveButton.disabled = order.status !== 'Pending'; // Example logic

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.classList.add('reject-order-btn');
            rejectButton.dataset.orderId = order.id;
            rejectButton.disabled = order.status !== 'Pending'; // Example logic
            
            actionsCell.appendChild(approveButton);
            actionsCell.appendChild(rejectButton);
            // Add margin between buttons
            rejectButton.style.marginLeft = '5px';
        });
        orderListContainer.innerHTML = ''; // Clear "Loading..."
        orderListContainer.appendChild(table);
    }
    
    // Placeholder for button actions
    orderListContainer.addEventListener('click', async (event) => {
        const target = event.target;
        const orderId = target.dataset.orderId;
        if (!orderId) return;

        let newStatus = '';
        if (target.classList.contains('approve-order-btn')) {
            newStatus = 'Approved';
        } else if (target.classList.contains('reject-order-btn')) {
            newStatus = 'Rejected';
        } else {
            return;
        }

        if (confirm(`Are you sure you want to ${newStatus.toLowerCase()} order ${orderId}?`)) {
            try {
                const response = await fetch(`/admin/orders/${orderId}/status`, {
                    method: 'POST', // As per current backend placeholder
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                const result = await response.json();
                if (response.ok) {
                    displayMessage(`Order ${orderId} status updated to ${newStatus}. Refreshing list...`, false);
                    // Refresh orders list
                    const updatedOrders = await checkAdminSessionAndFetchOrders();
                    if (updatedOrders) renderOrders(updatedOrders);
                } else {
                    displayMessage(`Error updating order: ${result.message || 'Unknown error'}`, true);
                }
            } catch (error) {
                console.error('Error updating order status:', error);
                displayMessage('Failed to update order status: ' + error.message, true);
            }
        }
    });

    // Initial load
    async function init() {
        const orders = await checkAdminSessionAndFetchOrders();
        // renderOrders will handle the case of empty or null orders.
        renderOrders(orders); 
    }
    init();
});

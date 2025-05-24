# README_ADMIN.md - Administrator Guide

This guide provides instructions for administrators to manage the e-commerce platform.

## 1. Accessing the Admin Panel

*   **URL**: Navigate to `http://[your-site-address]/admin/login.html` in your web browser.
    *   (If the application is running locally, this is typically `http://127.0.0.1:5000/admin/login.html`)
*   **Credentials**:
    *   Username: `admin`
    *   Password: `1234`

Upon successful login, you will be redirected to the Admin Dashboard.

## 2. Admin Dashboard

The dashboard is the central hub for admin activities. It provides navigation to various management sections:

*   **Dashboard**: The main landing page.
*   **Manage Users**: View and manage registered users.
*   **Manage Products**: View and edit product details.
*   **Manage Orders**: View and update the status of customer orders.
*   **Logout**: A button in the sidebar to log out of the admin panel.

## 3. Managing Users

*   Navigate to the "Manage Users" section from the sidebar.
*   **View Users**: A table displays all registered users with the following details:
    *   ID
    *   Username
    *   Email
    *   Is Admin? (Yes/No)
    *   *Placeholder Statistics (to be fully implemented):*
        *   Last Login
        *   Purchase Count
        *   Total Purchase Amount
        *   Purchases (Last 30 days)
*   Currently, user editing or deletion from the admin panel is not implemented in this version.

## 4. Managing Products

*   Navigate to the "Manage Products" section.
*   **View Products**: A table lists all products with details like ID, Name, Price, Category, etc.
*   **Edit Products**:
    *   Click the "Edit" button next to a product in the list.
    *   A modal form will appear, pre-filled with the product's current details.
    *   Modify the necessary fields (Name, Price, Description, Category, Subcategory, Color, Country of Origin).
    *   Click "Save Changes" to update the product. The list will refresh.
    *   Click the close button (×) or outside the modal to cancel editing.
*   Adding new products or deleting existing ones from the admin panel is not implemented in this version.

## 5. Managing Orders

*   Navigate to the "Manage Orders" section.
*   **View Orders**: A table displays all customer orders with details:
    *   Order ID
    *   User ID (of the customer)
    *   Order Date
    *   Status (e.g., Pending, Approved, Rejected, Shipped)
    *   Total Amount
    *   Items in the order (Product ID, Quantity, Price at Purchase).
*   **Update Order Status**:
    *   Each order will have "Approve" and "Reject" buttons (enabled if the order status is 'Pending' or similar).
    *   Clicking "Approve" will change the order status to 'Approved'.
    *   Clicking "Reject" will change the order status to 'Rejected'.
    *   The list will refresh to reflect the new status.

---
Manage the store effectively!

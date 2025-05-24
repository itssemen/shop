from flask import Blueprint, request, jsonify, session, redirect, url_for # Added redirect, url_for
from backend.models.user_model import User
from backend.extensions import db # If needed for other admin routes, not directly for login logic
from functools import wraps # For admin_required decorator

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/admin')

# Admin Protection Decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or not session.get('is_admin'):
            # For API routes, returning JSON is often better
            return jsonify({"message": "Admin access required. Please login."}), 403
            # For web pages, you might redirect to an admin login page:
            # return redirect(url_for('admin_bp.admin_login_page_route_name')) 
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password) and user.is_admin:
        session['user_id'] = user.id
        session['is_admin'] = True # Explicitly mark as admin in session
        return jsonify({"message": "Admin login successful"}), 200
    else:
        # Generic message to avoid revealing whether username exists or if user is not admin
        return jsonify({"message": "Invalid credentials or not an admin"}), 401

from backend.models.product_model import Product # Import Product model

# --- User Management ---
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    try:
        users = User.query.all()
        users_data = []
        for user in users:
            # Basic user data
            user_info = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin,
                # Placeholder for stats - these will require more models (Order, CartItem)
                # and logic, to be implemented fully when those models are available.
                "last_login": None, # Placeholder
                "purchase_count": 0, # Placeholder
                "total_purchase_amount": 0.0, # Placeholder
                "purchases_last_30_days": 0 # Placeholder
            }
            # For now, just include basic info. Stats will be enhanced later.
            users_data.append(user_info)
        return jsonify(users_data), 200
    except Exception as e:
        # Log the exception e
        print(f"Error in get_all_users: {str(e)}") # Basic logging
        return jsonify({"message": "Failed to retrieve users", "error": str(e)}), 500

# --- Product Management ---
@admin_bp.route('/products', methods=['GET'])
@admin_required
def get_all_products_admin():
    try:
        products = Product.query.all()
        products_data = [{
            "id": p.id, "name": p.name, "price": p.price, 
            "description": p.description, "category": p.category,
            "subcategory": p.subcategory, "color": p.color,
            "country_of_origin": p.country_of_origin
        } for p in products]
        return jsonify(products_data), 200
    except Exception as e:
        print(f"Error in get_all_products_admin: {str(e)}") # Basic logging
        return jsonify({"message": "Failed to retrieve products", "error": str(e)}), 500

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product_admin(product_id):
    try:
        # Using .first_or_404() is more common for specific lookups that should exist
        # product = Product.query.filter_by(id=product_id).first_or_404() 
        # However, get_or_404 is simpler for primary key lookups.
        product = Product.query.get_or_404(product_id)
        data = request.get_json()
        if not data:
            return jsonify({"message": "No input data provided"}), 400

        # Update fields if they are provided in the request
        product.name = data.get('name', product.name)
        product.price = data.get('price', product.price)
        product.description = data.get('description', product.description)
        product.category = data.get('category', product.category)
        product.subcategory = data.get('subcategory', product.subcategory)
        product.color = data.get('color', product.color)
        product.country_of_origin = data.get('country_of_origin', product.country_of_origin)
        
        # Add more fields as necessary if the Product model has them (e.g., stock)

        db.session.commit()
        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_product_admin for product_id {product_id}: {str(e)}") # Basic logging
        # Check if the error is because the product was not found by get_or_404
        if hasattr(e, 'code') and e.code == 404:
             return jsonify({"message": "Product not found"}), 404
        return jsonify({"message": "Failed to update product", "error": str(e)}), 500

from backend.models.order_model import Order, OrderItem # Import Order and OrderItem models

# --- Order Management ---
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders_admin():
    try:
        orders = Order.query.order_by(Order.order_date.desc()).all()
        orders_data = []
        for order in orders:
            items_data = [{
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase
            } for item in order.items]
            orders_data.append({
                "id": order.id,
                "user_id": order.user_id,
                "order_date": order.order_date.isoformat(),
                "status": order.status,
                "total_amount": order.total_amount,
                "items": items_data
                # "customer_name": order.user.username # If relationship is good
            })
        return jsonify(orders_data), 200
    except Exception as e:
        print(f"Error in get_all_orders_admin: {str(e)}") # Basic logging
        return jsonify({"message": "Failed to retrieve orders", "error": str(e)}), 500

@admin_bp.route('/orders/<int:order_id>/status', methods=['POST']) # Or PUT
@admin_required
def update_order_status_admin(order_id):
    data = request.get_json()
    new_status = data.get('status')

    if not new_status:
        return jsonify({"message": "Status is required"}), 400
    
    # Optional: Validate new_status against a list of allowed statuses
    allowed_statuses = ['Pending', 'Approved', 'Rejected', 'Shipped', 'Delivered', 'Cancelled']
    if new_status not in allowed_statuses:
        return jsonify({"message": f"Invalid status: {new_status}"}), 400

    try:
        order = Order.query.get_or_404(order_id)
        order.status = new_status
        db.session.commit()
        return jsonify({"message": f"Order {order_id} status updated to {new_status}"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_order_status_admin for order {order_id}: {str(e)}") # Basic logging
        return jsonify({"message": "Failed to update order status", "error": str(e)}), 500

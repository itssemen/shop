from flask import Blueprint, request, jsonify, session
from backend.extensions import db
from backend.models.user_model import User # If needed for user details
from backend.models.product_model import Product
from backend.models.cart_model import CartItem
from backend.models.order_model import Order, OrderItem # Newly created models
from datetime import datetime

# A decorator to ensure user is logged in (similar to admin_required but for general users)
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

orders_bp = Blueprint('orders_bp', __name__, url_prefix='/api/orders')

@orders_bp.route('/place', methods=['POST'])
@login_required
def place_order():
    user_id = session.get('user_id')
    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    if not cart_items:
        return jsonify({"message": "Your cart is empty"}), 400

    try:
        total_amount = 0
        order_items_to_create = []

        new_order = Order(user_id=user_id, order_date=datetime.utcnow(), status='Pending')
        # Add order to session to get an ID before creating items, if DB doesn't assign ID pre-flush
        # Or, add items after initial order commit if ID is auto-increment and available post-add/flush
        
        db.session.add(new_order)
        db.session.flush() # Flush to get new_order.id if it's an auto-incrementing PK

        for item in cart_items:
            product = Product.query.get(item.product_id)
            if not product:
                # This case should ideally be handled earlier, e.g., when adding to cart
                db.session.rollback()
                return jsonify({"message": f"Product with ID {item.product_id} not found."}), 404
            
            price_at_purchase = product.price # Use current product price
            total_amount += item.quantity * price_at_purchase
            
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_purchase=price_at_purchase
            )
            order_items_to_create.append(order_item)

        new_order.total_amount = total_amount
        db.session.add_all(order_items_to_create)

        # Clear user's cart
        CartItem.query.filter_by(user_id=user_id).delete()

        db.session.commit()
        return jsonify({"message": "Order placed successfully!", "order_id": new_order.id}), 201
    except Exception as e:
        db.session.rollback()
        # Log the exception e
        print(f"Error placing order: {str(e)}") # Basic logging
        return jsonify({"message": "Failed to place order", "error": str(e)}), 500

@orders_bp.route('/history', methods=['GET'])
@login_required
def get_order_history():
    user_id = session.get('user_id')
    try:
        user_orders = Order.query.filter_by(user_id=user_id).order_by(Order.order_date.desc()).all()
        orders_data = []
        for order in user_orders:
            items_data = [{
                "product_id": item.product_id,
                # "product_name": item.product.name, # Requires relationship eager loading or separate query
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase
            } for item in order.items] # Assuming order.items is the relationship to OrderItem

            # To get product names efficiently, you might want to fetch them separately or adjust your query/relationships.
            # For now, product_id is included.
            
            orders_data.append({
                "id": order.id,
                "order_date": order.order_date.isoformat(),
                "status": order.status,
                "total_amount": order.total_amount,
                "items": items_data
            })
        return jsonify(orders_data), 200
    except Exception as e:
        # Log the exception e
        print(f"Error retrieving order history: {str(e)}") # Basic logging
        return jsonify({"message": "Failed to retrieve order history", "error": str(e)}), 500

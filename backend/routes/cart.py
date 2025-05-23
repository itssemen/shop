from flask import Blueprint, request, jsonify
from backend.extensions import db
from backend.models.cart_model import CartItem
from backend.models.product_model import Product 
from backend.models.user_model import User # To ensure user exists

cart_bp = Blueprint('cart_bp', __name__, url_prefix='/api/cart')

# Add item to cart (or update quantity if item already exists)
@cart_bp.route('/', methods=['POST'])
def add_or_update_cart_item():
    data = request.get_json()
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1) # Default to 1 if not provided

    if not user_id or not product_id:
        return jsonify({'error': 'user_id and product_id are required'}), 400
    
    if not isinstance(quantity, int) or quantity < 0:
        return jsonify({'error': 'Quantity must be a non-negative integer'}), 400

    # Check if user and product exist
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    cart_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()

    try:
        if cart_item:
            if quantity == 0: # If quantity is 0, remove the item
                db.session.delete(cart_item)
                db.session.commit()
                return jsonify({'message': 'Cart item removed successfully'}), 200
            else: # Update quantity
                cart_item.quantity = quantity
                db.session.add(cart_item) # Re-add to session if needed, or just commit
        else:
            if quantity > 0: # Only add if quantity is positive
                cart_item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
                db.session.add(cart_item)
            else: # quantity is 0 for a new item, do nothing
                return jsonify({'message': 'Item not added to cart as quantity is 0'}), 200
        
        db.session.commit()
        
        if quantity > 0 and cart_item: # Ensure cart_item is defined
             return jsonify({
                'message': 'Cart updated successfully',
                'cart_item': {
                    'id': cart_item.id,
                    'user_id': cart_item.user_id,
                    'product_id': cart_item.product_id,
                    'quantity': cart_item.quantity,
                    'product_name': product.name # Include product name for easier frontend display
                }
            }), 200 if cart_item.quantity == quantity else 201 # 201 if created, 200 if updated
        else: # Item was removed or not added
            return jsonify({'message': 'Cart updated (item potentially removed or not added).'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in add_or_update_cart_item: {e}") # For logging
        return jsonify({'error': 'Failed to update cart due to a server error.'}), 500

# Get all items in a user's cart
@cart_bp.route('/<int:user_id>', methods=['GET'])
def get_cart_items(user_id):
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    try:
        cart_items = CartItem.query.filter_by(user_id=user_id).all()
        result = []
        total_price = 0
        for item in cart_items:
            product_info = {
                'id': item.product.id,
                'name': item.product.name,
                'price': item.product.price,
                'description': item.product.description,
                'category': item.product.category
            }
            result.append({
                'cart_item_id': item.id,
                'product': product_info,
                'quantity': item.quantity,
                'item_total_price': item.quantity * item.product.price
            })
            total_price += item.quantity * item.product.price
        
        return jsonify({
            'cart_items': result,
            'total_cart_price': round(total_price, 2)
        }), 200
    except Exception as e:
        print(f"Error in get_cart_items for user {user_id}: {e}") # For logging
        return jsonify({'error': 'Failed to retrieve cart items due to a server error.'}), 500

# Update quantity of a specific item in the cart
@cart_bp.route('/item/<int:item_id>', methods=['PUT'])
def update_cart_item_quantity(item_id):
    data = request.get_json()
    quantity = data.get('quantity')

    if quantity is None or not isinstance(quantity, int) or quantity < 0:
        return jsonify({'error': 'Valid quantity (non-negative integer) is required'}), 400

    cart_item = CartItem.query.get(item_id)

    if not cart_item:
        return jsonify({'error': 'Cart item not found'}), 404
    
    # For now, we are not re-validating user_id against the item_id's user.
    # This would be important in a real app with authentication.

    try:
        if quantity == 0:
            db.session.delete(cart_item)
            db.session.commit()
            return jsonify({'message': 'Cart item removed successfully'}), 200
        else:
            cart_item.quantity = quantity
            db.session.add(cart_item) # or just db.session.commit() if already tracked
            db.session.commit()
            # Fetch product details for the response
            product = Product.query.get(cart_item.product_id)
            return jsonify({
                'message': 'Cart item quantity updated successfully',
                'cart_item': {
                    'id': cart_item.id,
                    'user_id': cart_item.user_id,
                    'product_id': cart_item.product_id,
                    'quantity': cart_item.quantity,
                    'product_name': product.name if product else "Unknown Product"
                }
            }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_cart_item_quantity for item {item_id}: {e}") # For logging
        return jsonify({'error': 'Failed to update cart item due to a server error.'}), 500

# Remove a specific item from the cart
@cart_bp.route('/item/<int:item_id>', methods=['DELETE'])
def remove_cart_item(item_id):
    cart_item = CartItem.query.get(item_id)

    if not cart_item:
        return jsonify({'error': 'Cart item not found'}), 404

    # For now, we are not re-validating user_id against the item_id's user.
    # This would be important in a real app with authentication.

    try:
        db.session.delete(cart_item)
        db.session.commit()
        return jsonify({'message': 'Cart item removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in remove_cart_item for item {item_id}: {e}") # For logging
        return jsonify({'error': 'Failed to remove cart item due to a server error.'}), 500

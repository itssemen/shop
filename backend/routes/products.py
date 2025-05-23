from flask import Blueprint, jsonify
from backend.models.product_model import Product
from backend.extensions import db # Import db if direct session operations are needed, though Product.query is usually sufficient

# Define the blueprint
products_bp = Blueprint('products_bp', __name__, url_prefix='/api/products')

# Route to get all products
@products_bp.route('/', methods=['GET'])
def get_products():
    try:
        all_products = Product.query.all()
        result = []
        for product in all_products:
            result.append({
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'description': product.description,
                'category': product.category
            })
        return jsonify(result), 200
    except Exception as e:
        # Log the exception e for debugging
        print(f"Error in get_products: {e}")
        return jsonify({'error': 'Internal server error while retrieving products.'}), 500

# Route to get a single product by ID
@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        # Using .get_or_404() is a Flask-SQLAlchemy shortcut for fetching or returning 404
        # product = Product.query.get_or_404(product_id) 
        # However, to customize the 404 JSON response, manual check is better.
        product = Product.query.get(product_id)
        if product:
            return jsonify({
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'description': product.description,
                'category': product.category
            }), 200
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        # Log the exception e for debugging
        print(f"Error in get_product (id: {product_id}): {e}")
        return jsonify({'error': 'Internal server error while retrieving product.'}), 500

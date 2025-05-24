from flask import Blueprint, jsonify, request
from backend.models.product_model import Product
from backend.extensions import db # Import db if direct session operations are needed, though Product.query is usually sufficient
from sqlalchemy import desc

# Define the blueprint
products_bp = Blueprint('products_bp', __name__, url_prefix='/api/products')

# Route to get all products
@products_bp.route('/', methods=['GET'])
def get_products():
    try:
        # Start with a base query
        query = Product.query

        # Get filter parameters from query string
        category = request.args.get('category')
        subcategory = request.args.get('subcategory')
        color = request.args.get('color')
        country_of_origin = request.args.get('country_of_origin')

        # Apply filters
        if category:
            query = query.filter(Product.category == category)
        if subcategory:
            query = query.filter(Product.subcategory == subcategory)
        if color:
            query = query.filter(Product.color == color)
        if country_of_origin:
            query = query.filter(Product.country_of_origin == country_of_origin)

        # Get sorting parameters
        sort_by = request.args.get('sort_by')
        order = request.args.get('order')

        sortable_fields = {
            'price': Product.price,
            'name': Product.name
        }

        if sort_by in sortable_fields:
            sort_column = sortable_fields[sort_by]
            if order == 'desc':
                query = query.order_by(desc(sort_column))
            else: # Default to ascending
                query = query.order_by(sort_column)
        else:
            # Default sorting by product ID if no valid sort_by is provided
            query = query.order_by(Product.id)
            
        filtered_sorted_products = query.all()
        
        result = []
        for product in filtered_sorted_products:
            result.append({
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'description': product.description,
                'category': product.category,
                'subcategory': product.subcategory,
                'color': product.color,
                'country_of_origin': product.country_of_origin
            })
        return jsonify(result), 200
    except Exception as e:
        # Log the exception e for debugging
        print(f"Error in get_products: {e}")
        return jsonify({'error': 'Internal server error while retrieving products.'}), 500

# Route to get all unique categories and their subcategories
@products_bp.route('/categories/', methods=['GET'])
def get_categories():
    try:
        # Query for distinct category and subcategory combinations
        unique_combinations = db.session.query(Product.category, Product.subcategory).distinct().all()
        
        categories_map = {}
        for category, subcategory in unique_combinations:
            if category not in categories_map:
                categories_map[category] = []
            if subcategory and subcategory not in categories_map[category]:
                categories_map[category].append(subcategory)
        
        # Sort subcategories alphabetically for consistent output
        for category in categories_map:
            categories_map[category].sort()
            
        # Transform into the desired list format
        result = [{"name": cat_name, "subcategories": sub_list} for cat_name, sub_list in categories_map.items()]
        
        # Sort categories alphabetically by name for consistent output
        result.sort(key=lambda x: x['name'])

        return jsonify(result), 200
    except Exception as e:
        print(f"Error in get_categories: {e}")
        return jsonify({'error': 'Internal server error while retrieving categories.'}), 500

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
                'category': product.category,
                'subcategory': product.subcategory, # Added new field
                'color': product.color, # Added new field
                'country_of_origin': product.country_of_origin # Added new field
            }), 200
        else:
            return jsonify({'error': 'Product not found'}), 404
    except Exception as e:
        # Log the exception e for debugging
        print(f"Error in get_product (id: {product_id}): {e}")
        return jsonify({'error': 'Internal server error while retrieving product.'}), 500

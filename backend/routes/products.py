from flask import Blueprint, jsonify, request
from backend.models.product_model import Product
from backend.extensions import db # Import db if direct session operations are needed, though Product.query is usually sufficient
from sqlalchemy import desc

# Define the blueprint for products
products_bp = Blueprint('products_bp', __name__, url_prefix='/api/products')

# Define a new blueprint for general API routes like categories
categories_api_bp = Blueprint('categories_api_bp', __name__, url_prefix='/api')

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
# products_bp is already prefixed with /api/products.
# To achieve /api/categories, this route should be on a blueprint with /api prefix or on the app directly.
# For now, let's assume the intent is /api/products/categories as it was before, just fixing the trailing slash
# and ensuring logic matches the new example if different.
# The existing logic is actually more efficient than the example.
# Let's stick to the more efficient logic and adjust it.
# This old route will be removed.

# New route /api/categories
@categories_api_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        # Query for distinct category and subcategory combinations, filtering out None or empty categories
        unique_combinations = db.session.query(Product.category, Product.subcategory)\
            .filter(Product.category != None)\
            .filter(Product.category != '')\
            .distinct().all()
        
        categories_map = {}
        for category, subcategory in unique_combinations:
            # The query filters ensure category is not None or empty.
            # Initialize category in map if not present
            if category not in categories_map:
                categories_map[category] = set() # Use set for efficient addition and uniqueness
            
            # Add subcategory only if it's not None or empty (and not just whitespace)
            if subcategory and subcategory.strip(): 
                categories_map[category].add(subcategory.strip())
        
        # Transform into the desired list format
        structured_categories = []
        for cat_name, sub_cats_set in categories_map.items():
            # Sort subcategories alphabetically for consistent output
            sorted_sub_cats = sorted(list(sub_cats_set))
            structured_categories.append({"name": cat_name, "subcategories": sorted_sub_cats})
        
        # Sort main categories alphabetically by name for consistent output
        structured_categories.sort(key=lambda x: x['name'])

        return jsonify(structured_categories), 200
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

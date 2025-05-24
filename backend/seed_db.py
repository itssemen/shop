import os
import sys

# Add project root to sys.path to allow direct execution of script
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app import create_app, db
from backend.models.product_model import Product
from backend.models.user_model import User # Import User model

def seed_admin_user():
    app = create_app() # Ensure app context for db operations
    with app.app_context():
        admin_username = 'admin'
        admin_email = 'admin@example.com' # Provide a dummy email
        admin_password = '1234'

        # Check if admin user already exists
        existing_admin = User.query.filter_by(username=admin_username).first()
        if existing_admin:
            print(f"Admin user '{admin_username}' already exists.")
            # Optionally, update password or is_admin status if needed
            # existing_admin.set_password(admin_password)
            # existing_admin.is_admin = True
            # db.session.commit()
            return

        # Create new admin user
        admin_user = User(
            username=admin_username,
            email=admin_email, # Add email
            is_admin=True
        )
        admin_user.set_password(admin_password) # Set password using the model's method
        
        db.session.add(admin_user)
        try:
            db.session.commit()
            print(f"Admin user '{admin_username}' created successfully with password '1234'.")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating admin user: {e}")

def seed_data():
    app = create_app()
    with app.app_context():
        # Clear existing data
        Product.query.delete()
        db.session.commit()

        products_data = [
            # Clothing
            {"name": "Men's Classic T-Shirt", "price": 19.99, "description": "A comfortable cotton t-shirt for everyday wear.", "category": "Clothing", "subcategory": "Tops", "color": "White", "country_of_origin": "Vietnam"},
            {"name": "Women's Skinny Jeans", "price": 59.99, "description": "Modern skinny fit jeans with stretch.", "category": "Clothing", "subcategory": "Pants", "color": "Blue", "country_of_origin": "Bangladesh"},
            {"name": "Unisex Winter Hoodie", "price": 45.00, "description": "Warm fleece hoodie for cold weather.", "category": "Clothing", "subcategory": "Outerwear", "color": "Black", "country_of_origin": "China"},
            {"name": "Women's Summer Dress", "price": 39.99, "description": "Light and airy floral print summer dress.", "category": "Clothing", "subcategory": "Dresses", "color": "Red Floral", "country_of_origin": "India"},
            {"name": "Men's Leather Jacket", "price": 150.00, "description": "Stylish genuine leather biker jacket.", "category": "Clothing", "subcategory": "Outerwear", "color": "Brown", "country_of_origin": "Pakistan"},
            {"name": "Men's Chino Shorts", "price": 30.00, "description": "Comfortable cotton chino shorts.", "category": "Clothing", "subcategory": "Shorts", "color": "Khaki", "country_of_origin": "Vietnam"},
            {"name": "Women's Silk Blouse", "price": 65.00, "description": "Elegant silk blouse for formal occasions.", "category": "Clothing", "subcategory": "Tops", "color": "Cream", "country_of_origin": "China"},
            {"name": "Men's Wool Sweater", "price": 75.00, "description": "Warm merino wool sweater.", "category": "Clothing", "subcategory": "Knitwear", "color": "Grey", "country_of_origin": "Italy"},

            # Shoes
            {"name": "Running Sneakers", "price": 89.99, "description": "Lightweight sneakers for running and training.", "category": "Shoes", "subcategory": "Athletic", "color": "Blue/Green", "country_of_origin": "Indonesia"},
            {"name": "Leather Ankle Boots", "price": 120.00, "description": "Stylish leather ankle boots for women.", "category": "Shoes", "subcategory": "Boots", "color": "Black", "country_of_origin": "Portugal"},
            {"name": "Men's Formal Oxfords", "price": 110.00, "description": "Classic leather oxfords for formal wear.", "category": "Shoes", "subcategory": "Formal", "color": "Dark Brown", "country_of_origin": "Spain"},
            {"name": "Beach Sandals", "price": 25.00, "description": "Comfortable and durable sandals for the beach.", "category": "Shoes", "subcategory": "Sandals", "color": "Navy", "country_of_origin": "Brazil"},
            {"name": "Hiking Boots", "price": 140.00, "description": "Waterproof and sturdy boots for hiking.", "category": "Shoes", "subcategory": "Boots", "color": "Olive Green", "country_of_origin": "Germany"},

            # Accessories
            {"name": "Leather Belt", "price": 35.00, "description": "Genuine leather belt with a classic buckle.", "category": "Accessories", "subcategory": "Belts", "color": "Black", "country_of_origin": "India"},
            {"name": "Silk Scarf", "price": 45.00, "description": "Luxurious silk scarf with a vibrant print.", "category": "Accessories", "subcategory": "Scarves", "color": "Multicolor", "country_of_origin": "France"},
            {"name": "Designer Sunglasses", "price": 180.00, "description": "Stylish sunglasses with UV protection.", "category": "Accessories", "subcategory": "Eyewear", "color": "Tortoise Shell", "country_of_origin": "Italy"},
            {"name": "Wool Beanie", "price": 22.00, "description": "Warm wool beanie for cold days.", "category": "Accessories", "subcategory": "Hats", "color": "Charcoal", "country_of_origin": "USA"},
            {"name": "Leather Backpack", "price": 250.00, "description": "Durable and stylish leather backpack for daily use.", "category": "Accessories", "subcategory": "Bags", "color": "Cognac", "country_of_origin": "Mexico"},
            {"name": "Silver Necklace", "price": 95.00, "description": "Elegant sterling silver necklace with a pendant.", "category": "Accessories", "subcategory": "Jewelry", "color": "Silver", "country_of_origin": "Thailand"},
            {"name": "Cotton Socks (3-Pack)", "price": 15.00, "description": "Comfortable cotton socks for everyday wear.", "category": "Accessories", "subcategory": "Socks", "color": "Assorted", "country_of_origin": "Turkey"}
        ]
        
        total_products = len(products_data)

        for data in products_data:
            product = Product(**data) # Use dictionary unpacking for cleaner assignment
            db.session.add(product)
        
        db.session.commit()
        print(f"Database seeded with {total_products} sample products.")

        # Verification step
        print("\nVerifying seeded data:")
        all_products = Product.query.all()
        if all_products:
            for p in all_products:
                print(f"ID: {p.id}, Name: {p.name}, Price: {p.price}, Category: {p.category}, Subcategory: {p.subcategory}, Color: {p.color}, Origin: {p.country_of_origin}, Description: {p.description}")
            if len(all_products) == total_products:
                print(f"\nVerification successful: {total_products} products found in the database.")
            else:
                print(f"\nVerification issue: Expected {total_products} products, but found {len(all_products)}.")
        else:
            print("\nVerification failed: No products found in the database.")
        
        db_file_path = os.path.join(project_root, 'instance', 'database', 'store.db')
        if os.path.exists(db_file_path):
            print(f"\nDatabase file found at: {db_file_path}")
        else:
            print(f"\nDatabase file NOT found at: {db_file_path}")

if __name__ == '__main__':
    # Seed products first (if it clears data and recreates tables, relationships might matter)
    # However, current seed_data only clears Product table.
    # For robust seeding, consider order or make them independent.
    # Let's assume they can be called independently for now.
    seed_data() 
    seed_admin_user()

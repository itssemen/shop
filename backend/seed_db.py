import os
import sys

# Add project root to sys.path to allow direct execution of script
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app import create_app, db
from backend.models.product_model import Product

def seed_data():
    app = create_app()
    with app.app_context():
        # Clear existing data (optional, but good for repeatable seeding)
        Product.query.delete()
        db.session.commit()

        products_data = [
            {"name": "Classic T-Shirt", "price": 19.99, "description": "A comfortable cotton t-shirt.", "category": "clothing"},
            {"name": "Slim Fit Jeans", "price": 49.99, "description": "Modern slim fit jeans.", "category": "clothing"},
            {"name": "Winter Hoodie", "price": 35.00, "description": "Warm hoodie for cold weather.", "category": "clothing"},
            {"name": "Summer Dress", "price": 29.99, "description": "Light and airy summer dress.", "category": "clothing"},
            {"name": "Leather Jacket", "price": 120.00, "description": "Stylish genuine leather jacket.", "category": "clothing"}
        ]

        for data in products_data:
            product = Product(name=data['name'], price=data['price'], description=data['description'], category=data['category'])
            db.session.add(product)
        
        db.session.commit()
        print("Database seeded with sample products.")

        # Verification step
        print("\nVerifying seeded data:")
        all_products = Product.query.all()
        if all_products:
            for p in all_products:
                print(f"ID: {p.id}, Name: {p.name}, Price: {p.price}, Category: {p.category}, Description: {p.description}")
            if len(all_products) == 5:
                print("\nVerification successful: 5 products found in the database.")
            else:
                print(f"\nVerification issue: Expected 5 products, but found {len(all_products)}.")
        else:
            print("\nVerification failed: No products found in the database.")
        
        # Check if the database file exists
        # Corrected path for store.db relative to /app/instance/database/store.db
        db_file_path = os.path.join(project_root, 'instance', 'database', 'store.db')
        if os.path.exists(db_file_path):
            print(f"\nDatabase file found at: {db_file_path}")
        else:
            print(f"\nDatabase file NOT found at: {db_file_path}")


if __name__ == '__main__':
    seed_data()

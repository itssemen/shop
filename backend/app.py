from flask import Flask, send_from_directory
import os
from .extensions import db, migrate
# Ensure models are imported so Alembic can find them if not already by relationships
from .models.product_model import Product

# Import blueprints
from .routes.products import products_bp
from .routes.users import users_bp
from .routes.cart import cart_bp
from .routes.admin import admin_bp # Import admin_bp
from .routes.orders import orders_bp # Import orders_bp

def create_app():
    parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    static_folder_path = os.path.join(parent_dir, 'frontend')
    app = Flask(__name__, static_folder=static_folder_path, static_url_path='')

    instance_path = os.path.join(parent_dir, 'instance')

    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
    
    db_folder_path = os.path.join(instance_path, 'database')
    if not os.path.exists(db_folder_path):
        os.makedirs(db_folder_path)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(db_folder_path, 'store.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your_default_secret_key_here' # Added secret key

    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    app.register_blueprint(products_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(admin_bp) # Register admin_bp
    app.register_blueprint(orders_bp) # Register orders_bp

    @app.route('/')
    def serve_index():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:filename>.html')
    def serve_html(filename):
        return send_from_directory(app.static_folder, f"{filename}.html")

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)

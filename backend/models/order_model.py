from backend.extensions import db
from datetime import datetime # For order_date

# Ensure Product model is discoverable for ForeignKey relationship if not already globally.
# from .product_model import Product # Not strictly necessary if Product is imported elsewhere (e.g. app.py or models/__init__.py)
# Ensure User model is discoverable for ForeignKey relationship
# from .user_model import User 

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default='Pending') # e.g., Pending, Approved, Rejected, Shipped
    total_amount = db.Column(db.Float, nullable=False, default=0.0) # Calculated total

    user = db.relationship('User', backref=db.backref('orders', lazy=True))
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Order {self.id} by User {self.user_id}>'

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False) # Store price at time of purchase

    # Optional: relationship to Product model if you need to easily access product details from order item
    # product = db.relationship('Product') # This would require Product model to be imported

    def __repr__(self):
        return f'<OrderItem {self.id} for Order {self.order_id}>'

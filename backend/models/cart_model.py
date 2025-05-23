from backend.extensions import db
from sqlalchemy.schema import UniqueConstraint

class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    # Relationships
    # 'user' relationship links CartItem to User model
    # 'backref' creates 'cart_items' attribute on User model to access its cart items
    user = db.relationship('User', backref=db.backref('cart_items', lazy=True))
    
    # 'product' relationship links CartItem to Product model
    # No backref needed here unless we want to see all cart_items a product is in
    product = db.relationship('Product', lazy=True) 

    # Unique constraint for (user_id, product_id)
    __table_args__ = (UniqueConstraint('user_id', 'product_id', name='_user_product_uc'),)

    def __repr__(self):
        return f'<CartItem user_id={self.user_id} product_id={self.product_id} quantity={self.quantity}>'

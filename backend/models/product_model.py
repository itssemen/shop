from backend.extensions import db

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), default='clothing')
    subcategory = db.Column(db.String(50), nullable=True)
    color = db.Column(db.String(50), nullable=True)
    country_of_origin = db.Column(db.String(50), nullable=True)

    def __repr__(self):
        return f'<Product {self.name}>'

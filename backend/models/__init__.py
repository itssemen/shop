# This file can be empty or used to make models easily accessible.
# For Flask-Migrate to easily find all models, you can import them here.

from .user_model import User
from .product_model import Product
from .cart_model import CartItem
from .order_model import Order, OrderItem # Added Order and OrderItem

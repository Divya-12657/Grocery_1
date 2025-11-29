from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='customer')  # 'customer' or 'admin'
    address = db.Column(db.String(200))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship('Orders', backref='users', lazy=True)

class Category(db.Model):
    __tablename__ = 'category'
    __table_args__ = {'schema': 'grocery_market'}
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))  # Add this line

    products = db.relationship('Product', backref='category_obj', lazy=True)


class Product(db.Model):
    __tablename__ = 'product'
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, default=datetime.utcnow)

    # category = db.Column(db.String(50))
    image_url = db.Column(db.String(200))
    category_id = db.Column(db.Integer, db.ForeignKey('grocery_market.category.id'), nullable=False)
 
class Orders(db.Model):
    __tablename__ = 'orders'
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('grocery_market.users.id'), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    delivery_address = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')  # pending, paid, delivered, cancelled, etc.
    order_items = db.relationship('OrderItem', backref='order', lazy=True)
    payments = db.relationship('Payment', backref='order', lazy=True)

class OrderItem(db.Model):
    __tablename__ = 'order_item'
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('grocery_market.orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('grocery_market.product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)

    # order = db.relationship('Orders', backref=db.backref('items', lazy=True))
    product = db.relationship('Product', backref=db.backref('order_items', lazy=True))

    @property
    def total_price(self):
        return self.quantity * self.unit_price  


class Payment(db.Model):
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('grocery_market.users.id'), nullable=False)  # ✅ ADD THIS LINE
    order_id = db.Column(db.Integer, db.ForeignKey('grocery_market.orders.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    transaction_id = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), default='initiated')  # initiated, completed, failed
    razorpay_order_id = db.Column(db.String(100), nullable=True)     # ✅ New
    razorpay_payment_id = db.Column(db.String(100), nullable=True)   # ✅ New (optional)
    razorpay_signature = db.Column(db.String(255), nullable=True)  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Branches(db.Model):
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    manager_id = db.Column(db.Integer, db.ForeignKey('grocery_market.users.id'))  # assuming 'users' table exists
    status = db.Column(db.String(20), default='active')  # e.g., 'active', 'inactive'
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    

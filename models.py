from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='customer')  # 'customer' or 'admin'
    address = db.Column(db.String(200))
    phone = db.Column(db.String(20))
    
    orders = db.relationship('Orders', backref='user', lazy=True)

class Product(db.Model):
    __tablename__ = 'product'
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    category = db.Column(db.String(50))
    image_url = db.Column(db.String(200))

class Orders(db.Model):
    __tablename__ = 'orders'
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('grocery_market.user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, delivered
    total_amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    delivery_address = db.Column(db.String(200), nullable=False)

    items = db.relationship('OrderItem', backref='orders', lazy=True)
    payment = db.relationship('Payment', backref='orders', uselist=False, lazy=True)  # One-to-One

class OrderItem(db.Model):
    __tablename__ = 'order_item'
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('grocery_market.orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('grocery_market.product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

class Payment(db.Model):
    __tablename__ = 'payment'
    __table_args__ = {'schema': 'grocery_market'}

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('grocery_market.orders.id'), nullable=False, unique=True)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    payment_method = db.Column(db.String(50))
    transaction_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('grocery_market.user.id'), nullable=False)


# # Payment model for database
# class Payment(db.Model):
    
#     __tablename__ = 'payment'
#     __table_args__ = {'schema': 'grocery_market'}

#     id = db.Column(db.Integer, primary_key=True)
#     order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     amount = db.Column(db.Float, nullable=False)
#     payment_method = db.Column(db.String(50), nullable=False)
#     transaction_id = db.Column(db.String(100), nullable=False)
#     status = db.Column(db.String(20), nullable=False)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # # Relationships
    # order = db.relationship('Orders', backref=db.backref('payments', lazy=True))
    # user = db.relationship('User', backref=db.backref('payments', lazy=True))

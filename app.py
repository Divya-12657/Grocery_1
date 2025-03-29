
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Product, Order, OrderItem, Payment
from werkzeug.security import generate_password_hash, check_password_hash
import os
import jwt
from functools import wraps

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grocery.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.urandom(24)

db.init_app(app)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Auth routes
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        email=data['email'],
        password=hashed_password,
        name=data['name'],
        role=data.get('role', 'customer'),
        address=data.get('address', ''),
        phone=data.get('phone', '')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully!'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token, 'role': user.role})
    return jsonify({'message': 'Invalid credentials!'}), 401

# Product routes
@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'price': p.price,
        'stock': p.stock,
        'category': p.category,
        'image_url': p.image_url
    } for p in products])

@app.route('/products', methods=['POST'])
@token_required
def add_product(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized!'}), 403
    data = request.json
    new_product = Product(**data)
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Product added successfully!'})

# Order routes
@app.route('/orders', methods=['POST'])
@token_required
def create_order(current_user):
    data = request.json
    new_order = Order(
        user_id=current_user.id,
        total_amount=data['total_amount'],
        delivery_address=data['delivery_address']
    )
    db.session.add(new_order)
    
    for item in data['items']:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item['product_id'],
            quantity=item['quantity'],
            price=item['price']
        )
        db.session.add(order_item)
    
    db.session.commit()
    return jsonify({'message': 'Order created successfully!', 'order_id': new_order.id})

@app.route('/orders', methods=['GET'])
@token_required
def get_orders(current_user):
    if current_user.role == 'admin':
        orders = Order.query.all()
    else:
        orders = Order.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': o.id,
        'status': o.status,
        'total_amount': o.total_amount,
        'created_at': o.created_at,
        'delivery_address': o.delivery_address
    } for o in orders])

# Admin routes
@app.route('/admin/orders/<int:order_id>', methods=['PUT'])
@token_required
def update_order_status(current_user, order_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized!'}), 403
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found!'}), 404
    data = request.json
    order.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Order status updated successfully!'})

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

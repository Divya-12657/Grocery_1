
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Product, Orders, OrderItem, Payment
from werkzeug.security import generate_password_hash, check_password_hash
import os
import jwt
from functools import wraps
import uuid
import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


app = Flask(__name__)
CORS(app)

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grocery.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SECRET_KEY'] = os.urandom(24)


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://divs:foodforthought@localhost/Grocery_Market'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.urandom(24)

db.init_app(app)

# def token_required(f):
#     @wraps(f)
#     def decorated(*args, **kwargs):
#         token = request.headers.get('Authorization')
#         if not token:
#             return jsonify({'message': 'Token is missing!'}), 401
#         try:
#             data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
#             current_user = User.query.get(data['user_id'])
#             print(current_user)
#         except:
#             return jsonify({'message': 'Token is invalid!'}), 401
            
#         return f(current_user, *args, **kwargs)
#     return decorated

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        # Remove "Bearer " if present
        if token.startswith("Bearer "):
            token = token[len("Bearer "):].strip()
        print(f"Processed Token:{token}")  # Debugging
        print("Authorization Header:", request.headers.get("Authorization"))


        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
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
    print("LOGIN request received")
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
    if current_user.role != 'Admin':
        print(f"Current User Role: {current_user.role}")  # Debugging log
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
    new_order = Orders(
        user_id=current_user.id,
        total_amount=data['total_amount'],
        delivery_address=data['delivery_address']
    )
    db.session.add(new_order)
    db.session.commit()  # Commit the new order to generate the order ID

    
    for item in data['items']:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item['product_id'],
            quantity=item['quantity'],
            price=item['price']
        )
        db.sesion.add(order_item)
    
    db.session.commit()
    return jsonify({'message': 'Order created successfully!', 'order_id': new_order.id})

@app.route('/orders', methods=['GET'])
@token_required
def get_orders(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    print(f"[GET /orders] Current user: {current_user.name} | Role: {current_user.role}")

    # Admin sees all orders; customers only see their own
    if current_user.role == 'Admin':
        orders_query = Orders.query.paginate(page=page, per_page=per_page, error_out=False)
    else:
        orders_query = Orders.query.filter_by(user_id=current_user.id).paginate(page=page, per_page=per_page, error_out=False)

    orders = [{
        'id': order.id,
        'status': order.status,
        'total_amount': order.total_amount,
        'created_at': order.created_at,
        'delivery_address': order.delivery_address
    } for order in orders_query.items]

    return jsonify({
        'orders': orders,
        'total_pages': orders_query.pages,
        'current_page': orders_query.page,
        'total_items': orders_query.total
    })

# Admin routes
@app.route('/admin/orders/<int:order_id>', methods=['PUT'])
@token_required
def update_order_status(current_user, order_id):
    if current_user.role == 'Admin':
        return jsonify({'message': 'Unauthorized!'}), 403
    order = Orders.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found!'}), 404
    data = request.json
    order.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Order status updated successfully!'})


@app.route('/payment', methods=['POST'])
@token_required
def make_payment(current_user):
    """
    Generate a UPI payment link for the order instead of processing the payment directly.
    """
    try:
        data = request.json
        
        required_fields = ['amount', 'order_id', 'payment_method']
        if not all(field in data for field in required_fields):
            return jsonify({
                'message': 'Missing required payment information!',
                'required_fields': required_fields
            }), 400
        
        # Validate amount format
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'message': 'Invalid payment amount!'}), 400
        except ValueError:
            return jsonify({'message': 'Invalid amount format!'}), 400
        
        # Get the order
        order = Orders.query.get(data['order_id'])
        if not order:
            return jsonify({'message': 'Order not found!'}), 404

        # Authorization
        if order.user_id != current_user.id and current_user.role != 'Admin':
            return jsonify({'message': 'Unauthorized to make payment for this order!'}), 403
        
        # Validate payment amount
        if abs(float(data['amount']) - float(order.total_amount)) > 0.01:
            return jsonify({
                'message': 'Payment amount does not match order total!',
                'payment_amount': float(data['amount']),
                'order_total': float(order.total_amount)
            }), 400
        
        if data['payment_method'] == 'upi':
            # UPI payment - generate UPI link
            upi_link = (
                f"upi://pay?pa={data['upi_details']['payee_vpa']}&pn={data['upi_details']['payee_name']}"
                f"&mc=&tid={order.id}&tr={order.id}&tn=Order Payment&am={data['amount']}&cu=INR"
            )
            print(upi_link)

            return jsonify({
                'message': 'UPI payment link generated.',
                'upi_link': upi_link,
                'order_id': order.id,
                'amount': data['amount']
            })
        
        return jsonify({'message': 'Only UPI payment is supported for now.'}), 400
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"UPI Payment generation error: {str(e)}")
        return jsonify({'message': f'Error processing payment: {str(e)}'}), 500



with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

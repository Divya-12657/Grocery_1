
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
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# CORS(app, origins=["https://fe85-203-192-241-85.ngrok-free.app"])

# CORS(app, supports_credentials=True)

 
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grocery.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SECRET_KEY'] = os.urandom(24)


# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://divs:foodforthought@localhost/Grocery_Market'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SECRET_KEY'] = os.urandom(24)

# db.init_app(app)

on_render = os.getenv('RENDER', False)

if on_render:
    # Use Render's database URI
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://grocery_ny4h_user:xoKEcQ8yAbwC188syO7XcijvLfEnYY4Z@dpg-cvslu03uibrs73eb5cd0-a/grocery_ny4h'
else:
    # Use your local database URI
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

# @app.route('/login', methods=['POST'])
# def login():
#     print("LOGIN request received")
#     data = request.json
#     user = User.query.filter_by(email=data['email']).first()
#     if user and check_password_hash(user.password, data['password']):
#         token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm="HS256")
#         return jsonify({'token': token, 'role': user.role})
#     return jsonify({'message': 'Invalid credentials!'}), 401

@app.route('/login', methods=['POST'])
def login():
    print("LOGIN request received")
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password, data['password']):
        token_payload = {'user_id': user.id}
        print(f"Creating token for user ID: {user.id}, Role: {user.role}")
        token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm="HS256")
        
        # Print the token for debugging (remove in production)
        print(f"Generated token: {token}")
        
        return jsonify({
            'token': token, 
            'role': user.role,
            'user_id': user.id,  # Include user ID in response
            'name': user.name    # Include name for personalization
        })
    
    print("Invalid login attempt")
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


@app.route('/orders', methods=['POST'])
@token_required
def create_order(current_user):
    # Debug information
    print(f"Creating order for: User ID={current_user.id}, Name={current_user.name}, Role={current_user.role}")
    print(f"Token info: {request.headers.get('Authorization')}")
    
    data = request.json
    print(f"Order data: {data}")
    
    new_order = Orders(
        user_id=current_user.id,
        total_amount=data['total_amount'],
        delivery_address=data['delivery_address']
    )
    
    db.session.add(new_order)
    db.session.commit()
    
    print(f"Created order with ID: {new_order.id} for user: {new_order.user_id}")
    
    # Process order items
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
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 30, type=int)
        
        # Admin sees all orders; customers only see their own
        if current_user.role == 'Admin':
            print(f"Admin {current_user.name} retrieving all orders")
            orders_query = Orders.query.paginate(page=page, per_page=per_page, error_out=False)
        else:
            print(f"User {current_user.name} retrieving their orders")
            orders_query = Orders.query.filter_by(user_id=current_user.id).paginate(page=page, per_page=per_page, error_out=False)
        
        # Build order list properly
        orders = []
        for order in orders_query.items:
            order_data = {
                'id': order.id,
                'status': order.status,
                'total_amount': float(order.total_amount),  # Convert to float for serialization
                'created_at': order.created_at.isoformat(),  # Convert datetime to string
                'delivery_address': order.delivery_address,
                'user_id': order.user_id
            }
            orders.append(order_data)
        
        # Build proper JSON response
        response = {
            'orders': orders,
            'total_pages': orders_query.pages,
            'current_page': orders_query.page,
            'total_items': orders_query.total
        }
        print(response)
        
        return jsonify(response)
    except Exception as e:
        print(f"Error retrieving orders: {str(e)}")
        return jsonify({'message': 'Error retrieving orders', 'error': str(e)}), 500

# Admin routes
@app.route('/admin/orders/<int:order_id>', methods=['PUT'])
@token_required
def update_order_status(current_user, order_id):
    if current_user.role != 'Admin':
        return jsonify({'message': 'Unauthorized!'}), 403
    order = Orders.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found!'}), 404
    data = request.json
    order.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Order status updated successfully!'})

@app.route('/admin/orders/<int:order_id>/items', methods=['GET'])
@token_required
def get_order_items(current_user, order_id):
    if current_user.role != 'Admin':
        return jsonify({'message': 'Unauthorized!'}), 403

    order = Orders.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found!'}), 404

    order_items = OrderItem.query.filter_by(order_id=order_id).all()
    items = []

    for item in order_items:
        product = Product.query.get(item.product_id)
        if product:
            items.append({
                'product_id': product.id,
                'product_name': product.name,
                'product_image': product.image_url,
                'quantity': item.quantity,
                'price': float(item.price),
                'total_price': float(item.quantity * item.price)
            })

    return jsonify({
        'order_id': order_id,
        'items': items,
        'total_amount': float(order.total_amount),
        'status': order.status,
        'delivery_address': order.delivery_address,
        'user_id': order.user_id
    })



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

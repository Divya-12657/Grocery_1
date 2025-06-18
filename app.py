from flask import Flask, request, jsonify,current_app
from flask_cors import CORS
from models import db, User, Product, Orders, OrderItem, Payment,Category
from werkzeug.security import generate_password_hash, check_password_hash
import os
import jwt
import razorpay
from functools import wraps
import uuid
import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
from dotenv import load_dotenv
from decimal import Decimal
from datetime import datetime


load_dotenv()

# Your Razorpay credentials
RAZORPAY_KEY_ID = "rzp_test_SVRZFgLh78tXV6"
RAZORPAY_SECRET = "fVAs8GBL4CqIEnIzmKfSgnue"

razor_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET))

app = Flask(__name__)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# CORS(app, origins=["https://fe85-203-192-241-85.ngrok-free.app"])

# CORS(app, supports_credentials=True)

 
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grocery.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SECRET_KEY'] = os.urandom(24)


# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://divs:foodforthought@localhost/Grocery_Market'
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.urandom(24)

db.init_app(app)

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

@app.route('/')
def home():
    return "hello from flask!"

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

# Adding category when you are the admin 

@app.route('/categories', methods=['POST'])
@token_required
def add_category(current_user):
    if current_user.role != 'Admin':
        return jsonify({'message': 'Unauthorized!'}), 403

    data = request.json
    category_name = data.get('name')

    if not category_name:
        return jsonify({'message': 'Category name is required'}), 400

    existing_category = Category.query.filter_by(name=category_name).first()
    if existing_category:
        return jsonify({'message': 'Category already exists'}), 400

    new_category = Category(
        name=category_name,
        description=data.get('description')
    )

    db.session.add(new_category)
    db.session.commit()

    return jsonify({
        'message': 'Category added successfully!',
        'category': {
            'id': new_category.id,
            'name': new_category.name
        }
    })
# get all the category names which is used in Products  as a filter

@app.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{'id': c.id, 'name': c.name} for c in categories])

#Get products based on Category 

@app.route('/products/category/<int:category_id>', methods=['GET'])
def get_products_by_category(category_id):
    """
    Get all products that belong to a specific category
    """
    try:
        # Check if category exists
        category = Category.query.get(category_id)
        if not category:
            return jsonify({'message': 'Category not found'}), 404
        
        # Get all products for this category
        products = Product.query.filter_by(category_id=category_id).all()
        
        if not products:
            return jsonify({
                'message': f'No products found for category: {category.name}',
                'category': {'id': category.id, 'name': category.name},
                'products': []
            }), 200
        
        # Format product data
        products_data = []
        for p in products:
            products_data.append({
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'price': p.price,
                'stock': p.stock,
                'category': p.category_obj.name,
                'category_id': p.category_id,
                'image_url': p.image_url
            })
        
        return jsonify({
            'message': f'Products found for category: {category.name}',
            'category': {'id': category.id, 'name': category.name},
            'products': products_data,
            'total_products': len(products_data)
        }), 200
        
    except Exception as e:
        print(f"Error fetching products by category: {str(e)}")
        return jsonify({'error': 'Failed to fetch products by category'}), 500

    
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
        'category': p.category_obj.name,
        'image_url': p.image_url
    } for p in products])

@app.route('/products', methods=['POST'])
@token_required
def add_product(current_user):
    if current_user.role != 'Admin':
        print(f"Current User Role: {current_user.role}")  # Debugging log
        return jsonify({'message': 'Unauthorized!'}), 403
    data = request.json
    category_name = data.get('category')
    if not category_name:
        return jsonify({'message': 'Category is required'}), 400
    
    # Check if category exists, else create
    category = Category.query.filter_by(name=category_name).first()
    if not category:
        category = Category(name=category_name)
        db.session.add(category)
        db.session.commit()

    
    # new_product = Product(**data)  This was the previous to unpack the data 
    # Remove 'category' key so **data does not include it
    product_data = {k: v for k, v in data.items() if k != 'category'}
    new_product = Product(**product_data, category_id=category.id)
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Product added successfully!'})
# Edit prooduct name or stock or price 

@app.route('/products/<int:product_id>', methods=['PUT'])
@token_required  # if this route is protected
def update_product(current_user, product_id):
    data = request.get_json()
    product = Product.query.get(product_id)

    if not product:
        return jsonify({'message': 'Product not found'}), 404

    # Update fields if present in request
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)

    db.session.commit()

    return jsonify({'message': 'Product updated successfully'})

@app.route('/products/<int:product_id>', methods=['DELETE'])
@token_required  # if protected
def delete_product(current_user, product_id):
    product = Product.query.get(product_id)

    if not product:
        return jsonify({'message': 'Product not found'}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({'message': 'Product deleted successfully'})

@app.route('/orders', methods=['POST'])
@token_required
def create_or_update_order(current_user):
    try:
        data = request.get_json()
        delivery_address = data.get('delivery_address')
        items = data.get('items')

        if not items:
            return jsonify({'error': 'No items provided'}), 400

        order = Orders.query.filter_by(user_id=current_user.id, status='pending').first()

        if not order:
            order = Orders(
                user_id=current_user.id,
                delivery_address=delivery_address,
                total_amount=Decimal('0.00'),
                status='pending'
            )
            db.session.add(order)
            db.session.flush()
            print(f"Created new order with ID: {order.id}")
        elif delivery_address:
            order.delivery_address = delivery_address
            print(f"Using existing order ID: {order.id}")

        calculation_log = []

        for item in items:
            product_id = int(item['product_id'])
            new_quantity = int(item['quantity'])
            sent_unit_price = Decimal(str(item['price'])) if item['price'] > 0 else Decimal('0')

            product = Product.query.get(product_id)
            if not product:
                return jsonify({'error': f'Product ID {product_id} not found'}), 404

            actual_unit_price = Decimal(str(product.price))

            # Only validate price if it was sent (not 0)
            if sent_unit_price > 0 and abs(sent_unit_price - actual_unit_price) > Decimal('0.01'):
                print(f"WARNING: Price mismatch for product {product_id}")
                print(f"Sent: {sent_unit_price}, Actual: {actual_unit_price}")

            unit_price = actual_unit_price
            existing_item = OrderItem.query.filter_by(order_id=order.id, product_id=product_id).first()

            if existing_item:
                old_quantity = existing_item.quantity

                if new_quantity == 0:
                    # Remove item completely
                    db.session.delete(existing_item)
                    calculation_log.append({
                        'product_id': product_id,
                        'action': 'removed',
                        'old_quantity': old_quantity,
                        'new_quantity': 0,
                        'unit_price': float(unit_price),
                        'old_total': existing_item.price,
                        'new_total': 0
                    })

                elif new_quantity != old_quantity:
                    # Update quantity (can be increase or decrease)
                    quantity_change = new_quantity - old_quantity
                    existing_item.quantity = new_quantity
                    existing_item.price = float(unit_price * new_quantity)

                    calculation_log.append({
                        'product_id': product_id,
                        'action': 'updated_quantity',
                        'old_quantity': old_quantity,
                        'quantity_change': quantity_change,
                        'new_quantity': new_quantity,
                        'unit_price': float(unit_price),
                        'old_total': float(unit_price * old_quantity),
                        'new_total': existing_item.price
                    })
                else:
                    calculation_log.append({
                        'product_id': product_id,
                        'action': 'no_change',
                        'quantity': old_quantity,
                        'note': 'No quantity change, skipping update'
                    })

            else:
                if new_quantity > 0:
                    # Add new item
                    total_price_for_item = float(unit_price * new_quantity)
                    new_item = OrderItem(
                        order_id=order.id,
                        product_id=product_id,
                        quantity=new_quantity,
                        price=total_price_for_item
                    )
                    db.session.add(new_item)
                    
                    calculation_log.append({
                        'product_id': product_id,
                        'action': 'added_new',
                        'quantity': new_quantity,
                        'unit_price': float(unit_price),
                        'total_price': total_price_for_item
                    })
                else:
                    # Trying to set quantity to 0 for non-existent item - ignore
                    calculation_log.append({
                        'product_id': product_id,
                        'action': 'ignored',
                        'note': 'Trying to remove non-existent item'
                    })

        # Recalculate total from all remaining items
        all_items = OrderItem.query.filter_by(order_id=order.id).all()
        order.total_amount = sum(Decimal(str(item.price)) for item in all_items)

        # If no items left, delete the order
        if len(all_items) == 0:
            db.session.delete(order)
            db.session.commit()
            
            return jsonify({
                'message': 'Order deleted - no items remaining',
                'order_id': None,
                'total_amount': 0,
                'items': [],
                'debug_info': {
                    'items_count': 0,
                    'calculated_total': 0,
                    'calculation_log': calculation_log,
                    'sent_items': items
                }
            })

        db.session.commit()

        # Prepare response with updated items
        response_items = []
        for item in all_items:
            prod = Product.query.get(item.product_id)
            response_items.append({
                'product_id': item.product_id,
                'product_name': prod.name if prod else "Unknown",
                'quantity': item.quantity,
                'unit_price': float(prod.price) if prod else 0.0,
                'price': float(item.price),  # This is the total price for this item (quantity * unit_price)
                'total_price_for_item': float(item.price)  # Keep both for compatibility
            })

        return jsonify({
            'message': 'Order updated successfully',
            'order_id': order.id,
            'total_amount': float(order.total_amount),
            'items': response_items,
            'debug_info': {
                'items_count': len(all_items),
                'calculated_total': float(order.total_amount),
                'calculation_log': calculation_log,
                'sent_items': items
            }
        })

    except Exception as e:
        db.session.rollback()
        print(f"Order creation error: {str(e)}")
        return jsonify({'error': str(e)}), 500




@app.route('/payment/confirm', methods=['POST'])
@token_required
def confirm_payment(current_user):
    data = request.json
    
    if 'order_id' not in data:
        return jsonify({'message': 'Order ID is required'}), 400
        
    order = Orders.query.get(data['order_id'])
    
    if not order:
        return jsonify({'message': 'Order not found'}), 404
        
    # Security check - ensure user can only update their own orders
    if order.user_id != current_user.id and current_user.role != 'Admin':
        return jsonify({'message': 'Unauthorized to update this order'}), 403
    
    # Update the order status
    order.status = 'paid'
    db.session.commit()
    
    return jsonify({
        'message': 'Payment confirmed successfully',
        'order_id': order.id,
        'status': order.status
    })
@app.route('/cart', methods=['GET'])
@token_required
def get_cart(current_user):
    try:
        order = Orders.query.filter_by(user_id=current_user.id, status='pending').first()
        if not order:
            return jsonify({
                'message': 'Cart is empty',
                'cart_items': [],
                'total_amount': "0.00"
            }), 200

        items = []
        for item in order.order_items:
            items.append({
                'product_id': item.product_id,
                'quantity': item.quantity,
                'price': item.price
            })

        return jsonify({
            'message': 'Cart retrieved successfully',
            'order_id': order.id,
            'cart_items': items,
            'total_amount': str(order.total_amount)
        }), 200

    except Exception as e:
        print("Error retrieving cart:", str(e))
        return jsonify({'error': 'Failed to fetch cart'}), 500
    




@app.route('/orders', methods=['GET'])
@token_required
def get_orders(current_user):   
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 30, type=int)
        
        # Admin sees all orders; customers only see their own; delivery sees all orders
        if current_user.role in ['Admin', 'Delivery']:
            print(f"{current_user.role} {current_user.name} retrieving all orders")
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

@app.route('/orders/<int:order_id>/items', methods=['GET'])
@token_required
def get_user_order_items(current_user, order_id):
    # Admin and Delivery can see any order
    if current_user.role in ['Admin', 'Delivery']:
        order = Orders.query.get(order_id)
    else:
        # Customers can only see their own orders
        order = Orders.query.filter_by(id=order_id, user_id=current_user.id).first()

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

# NEW: Delivery personnel routes
@app.route('/delivery/orders', methods=['GET'])
@token_required
def get_delivery_orders(current_user):
    """
    Get orders that are ready for delivery with customer details
    Only accessible to delivery personnel
    """
    if current_user.role != 'Delivery':
        return jsonify({'message': 'Unauthorized!'}), 403
        
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Get orders that are processed/ready for delivery
        # Filter by order status (customizable based on your workflow)
        orders_query = Orders.query.filter(
            Orders.status.in_(['pending','delivery_failed'])
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        # Build order list with necessary delivery details
        orders = []
        for order in orders_query.items:
            # Get customer details for delivery
            customer = User.query.get(order.user_id)
            
            order_data = {
                'id': order.id,
                'status': order.status,
                'total_amount': float(order.total_amount),
                'created_at': order.created_at.isoformat(),
                'delivery_address': order.delivery_address,
                'user_id': order.user_id,
                'customer_name': customer.name if customer else 'Unknown',
                'customer_phone': customer.phone if customer else 'Not provided'
            }
            orders.append(order_data)
        
        response = {
            'orders': orders,
            'total_pages': orders_query.pages,
            'current_page': orders_query.page,
            'total_items': orders_query.total
        }
        
        return jsonify(response)
    except Exception as e:
        print(f"Error retrieving delivery orders: {str(e)}")
        return jsonify({'message': 'Error retrieving delivery orders', 'error': str(e)}), 500

@app.route('/delivery/orders/<int:order_id>/items', methods=['GET'])
@token_required
def get_delivery_order_items(current_user, order_id):
    """
    Get detailed order items for a specific order for delivery personnel
    """
    if current_user.role != 'delivery':
        return jsonify({'message': 'Unauthorized!'}), 403

    order = Orders.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found!'}), 404
        
    # Get customer info for delivery
    customer = User.query.get(order.user_id)

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
        'customer_name': customer.name if customer else 'Unknown',
        'customer_phone': customer.phone if customer else 'Not provided'
    })

@app.route('/delivery/orders/<int:order_id>/update', methods=['PUT'])
@token_required
def update_delivery_status(current_user, order_id):
    """
    Update the status of an order by delivery personnel
    """
    if current_user.role != 'Delivery':
        return jsonify({'message': 'Unauthorized!'}), 403
        
    order = Orders.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found!'}), 404
        
    data = request.json
    
    # Validate that delivery personnel can only set specific statuses
    allowed_statuses = ['out_for_delivery', 'delivered', 'delivery_failed']
    if data['status'] not in allowed_statuses:
        return jsonify({
            'message': f'Invalid status! Delivery personnel can only set status to: {", ".join(allowed_statuses)}'
        }), 400
    
    # Update order status
    previous_status = order.status
    order.status = data['status']
    
    # Add delivery notes if provided
    if 'delivery_notes' in data:
        # Assuming you might want to add a delivery_notes field to your Orders model
        # For now, we could just print it
        print(f"Delivery notes for order {order_id}: {data['delivery_notes']}")
        
    db.session.commit()
    
    # Notify admin about status change (you could implement a notification system)
    print(f"Order {order_id} status changed from {previous_status} to {order.status} by delivery personnel {current_user.name}")
    
    return jsonify({
        'message': 'Order status updated successfully!',
        'order_id': order_id,
        'new_status': order.status
    })

# @app.route('/payment', methods=['POST'])
# @token_required
# def make_payment(current_user):
#     """
#     Generate a UPI payment link for the order based on the selected payment app.
#     """
#     try:
#         data = request.json
#         required_fields = ['order_id', 'payment_method']
#         if not all(field in data for field in required_fields):
#             return jsonify({
#                 'message': 'Missing required payment information!',
#                 'required_fields': required_fields
#             }), 400
        
#         # Get the order
#         order = Orders.query.get(data['order_id'])
#         if not order:
#             return jsonify({'message': 'Order not found!'}), 404
        
#         # Authorization
#         if order.user_id != current_user.id and current_user.role != 'Admin':
#             return jsonify({'message': 'Unauthorized to make payment for this order!'}), 403
        
#         # Make sure we use the order's amount
#         amount = float(order.total_amount)
        
#         if data['payment_method'] == 'upi':
#             # Get UPI details
#             if 'upi_details' not in data:
#                 return jsonify({'message': 'UPI details are required!'}), 400
            
#             upi_details = data['upi_details']
#             app_name = data.get('app_name', '')
#             app_package = data.get('app_package', '')
            
#             # Common UPI parameters
#             payee_vpa = upi_details['payee_vpa']
#             payee_name = upi_details['payee_name']
#             tid = f"tid_{order.id}"
#             tr = f"tr_{order.id}"
#             tn = "Order Payment"
            
#             # Generate appropriate UPI link based on app
#             if app_name == "Google Pay":
#                 upi_link = (
#                     f"intent://pay?pa={payee_vpa}&pn={payee_name}"
#                     f"&mc=&tid={tid}&tr={tr}&tn={tn}&am={amount}&cu=INR"
#                     f"#Intent;scheme=upi;package={app_package};end;"
#                 )
#             else:
#                 upi_link = (
#                     f"upi://pay?pa={payee_vpa}&pn={payee_name}"
#                     f"&mc=&tid={tid}&tr={tr}&tn={tn}&am={amount}&cu=INR"
#                 )            
               

#             current_app.logger.info(f"Generated UPI link for {app_name}: {upi_link}")
            
#             # ✅ Check for existing payment
#             existing_payment = Payment.query.filter_by(order_id=order.id).first()
#             if existing_payment:
#                 existing_payment.amount = amount
#                 existing_payment.payment_method = 'upi'
#                 existing_payment.status = 'initiated'
#                 existing_payment.updated_at = datetime.utcnow()
#                 db.session.commit()
#                 payment = existing_payment
#             else:
#                 # Create new payment record
#                 payment = Payment(
#                     user_id=current_user.id,
#                     order_id=order.id,
#                     amount=amount,
#                     payment_method='upi',
#                     status='initiated'
#                 )
#                 db.session.add(payment)
#                 db.session.commit()
            
#             return jsonify({
#                 'message': f'UPI payment link generated for {app_name}.',
#                 'upi_link': upi_link,
#                 'order_id': order.id,
#                 'payment_id': payment.id,
#                 'amount': amount
#             })
        
#         return jsonify({'message': 'Only UPI payment is supported for now.'}), 400
    
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"UPI Payment generation error: {str(e)}")
#         return jsonify({'message': f'Error processing payment: {str(e)}'}), 500

# @app.route('/payment', methods=['POST'])
# @token_required
# def make_payment(current_user):
#     """
#     Generate a UPI or Razorpay payment link for the order.
#     """
#     try:
#         data = request.json
#         required_fields = ['order_id', 'payment_method']
#         if not all(field in data for field in required_fields):
#             return jsonify({
#                 'message': 'Missing required payment information!',
#                 'required_fields': required_fields
#             }), 400

#         # Fetch the order
#         order = Orders.query.get(data['order_id'])
#         if not order:
#             return jsonify({'message': 'Order not found!'}), 404

#         # Authorization
#         if order.user_id != current_user.id and current_user.role != 'Admin':
#             return jsonify({'message': 'Unauthorized!'}), 403

#         amount = float(order.total_amount)
#         payment_method = data['payment_method']

#         # ----------------------------------------
#         # ✅ RAZORPAY PAYMENT FLOW
#         # ----------------------------------------
#         if payment_method == 'razorpay':
#             razorpay_order = razor_client.order.create({
#                 "amount": int(amount * 100),  # paise
#                 "currency": "INR",
#                 "receipt": f"order_rcptid_{order.id}",
#                 "payment_capture": 1
#             })

#             # Optional: create/update Payment record
#             payment = Payment.query.filter_by(order_id=order.id).first()
#             if payment:
#                 payment.amount = amount
#                 payment.payment_method = 'razorpay'
#                 payment.status = 'initiated'
#                 payment.updated_at = datetime.utcnow()
#             else:
#                 payment = Payment(
#                     user_id=current_user.id,
#                     order_id=order.id,
#                     amount=amount,
#                     payment_method='razorpay',
#                     status='initiated'
#                 )
#                 db.session.add(payment)
#             db.session.commit()

#             return jsonify({
#                 'message': 'Razorpay order created.',
#                 'razorpay_order_id': razorpay_order["id"],
#                 'razorpay_key': RAZORPAY_KEY_ID,
#                 'order_id': order.id,
#                 'payment_id': payment.id,
#                 'amount': int(amount * 100),  # paise
#                 'currency': "INR"
#             }), 200

#         # ----------------------------------------
#         # ✅ UPI INTENT LINK FLOW
#         # ----------------------------------------
#         elif payment_method == 'upi':
#             if 'upi_details' not in data:
#                 return jsonify({'message': 'UPI details are required!'}), 400

#             upi_details = data['upi_details']
#             app_name = data.get('app_name', '')
#             app_package = data.get('app_package', '')

#             payee_vpa = upi_details['payee_vpa']
#             payee_name = upi_details['payee_name']
#             tid = f"tid_{order.id}"
#             tr = f"tr_{order.id}"
#             tn = "Order Payment"

#             if app_name == "Google Pay":
#                 upi_link = (
#                     f"intent://pay?pa={payee_vpa}&pn={payee_name}"
#                     f"&mc=&tid={tid}&tr={tr}&tn={tn}&am={amount}&cu=INR"
#                     f"#Intent;scheme=upi;package={app_package};end;"
#                 )
#             else:
#                 upi_link = (
#                     f"upi://pay?pa={payee_vpa}&pn={payee_name}"
#                     f"&mc=&tid={tid}&tr={tr}&tn={tn}&am={amount}&cu=INR"
#                 )

#             current_app.logger.info(f"Generated UPI link for {app_name}: {upi_link}")

#             existing_payment = Payment.query.filter_by(order_id=order.id).first()
#             if existing_payment:
#                 existing_payment.amount = amount
#                 existing_payment.payment_method = 'upi'
#                 existing_payment.status = 'initiated'
#                 existing_payment.updated_at = datetime.utcnow()
#                 db.session.commit()
#                 payment = existing_payment
#             else:
#                 payment = Payment(
#                     user_id=current_user.id,
#                     order_id=order.id,
#                     amount=amount,
#                     payment_method='upi',
#                     status='initiated'
#                 )
#                 db.session.add(payment)
#                 db.session.commit()

#             return jsonify({
#                 'message': f'UPI payment link generated for {app_name}.',
#                 'upi_link': upi_link,
#                 'order_id': order.id,
#                 'payment_id': payment.id,
#                 'amount': amount
#             }), 200

#         return jsonify({'message': 'Unsupported payment method!'}), 400

#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"Payment error: {str(e)}")
#         return jsonify({'message': f'Error processing payment: {str(e)}'}), 500


@app.route('/payment', methods=['POST'])
@token_required
def make_payment(current_user):
    try:
        data = request.json
        required_fields = ['order_id', 'payment_method']
        if not all(field in data for field in required_fields):
            return jsonify({
                'message': 'Missing required payment information!',
                'required_fields': required_fields
            }), 400

        order = Orders.query.get(data['order_id'])
        if not order:
            return jsonify({'message': 'Order not found!'}), 404

        if order.user_id != current_user.id and current_user.role != 'Admin':
            return jsonify({'message': 'Unauthorized!'}), 403

        amount = float(order.total_amount)
        payment_method = data['payment_method']

        # ----------------------------------------
        # ✅ RAZORPAY PAYMENT FLOW
        # ----------------------------------------
        if payment_method == 'razorpay':
            razorpay_order = razor_client.order.create({
                "amount": int(amount * 100),
                "currency": "INR",
                "receipt": f"order_rcptid_{order.id}",
                "payment_capture": 1
            })

            # Store or update payment
            payment = Payment.query.filter_by(order_id=order.id).first()
            if payment:
                payment.amount = amount
                payment.payment_method = 'razorpay'
                payment.status = 'initiated'
                payment.razorpay_order_id = razorpay_order["id"]
                payment.updated_at = datetime.utcnow()
            else:
                payment = Payment(
                    user_id=current_user.id,
                    order_id=order.id,
                    amount=amount,
                    payment_method='razorpay',
                    status='initiated',
                    razorpay_order_id=razorpay_order["id"]
                )
                db.session.add(payment)

            db.session.commit()

            return jsonify({
                'message': 'Razorpay order created.',
                'razorpay_order_id': razorpay_order["id"],
                'razorpay_key': RAZORPAY_KEY_ID,
                'order_id': order.id,
                'payment_id': payment.id,
                'amount': int(amount * 100),
                'currency': "INR"
            }), 200

        # ----------------------------------------
        # ✅ UPI PAYMENT FLOW
        # ----------------------------------------
        elif payment_method == 'upi':
            if 'upi_details' not in data:
                return jsonify({'message': 'UPI details are required!'}), 400

            upi_details = data['upi_details']
            app_name = data.get('app_name', '')
            app_package = data.get('app_package', '')

            payee_vpa = upi_details['payee_vpa']
            payee_name = upi_details['payee_name']
            tid = f"tid_{order.id}"
            tr = f"tr_{order.id}"
            tn = "Order Payment"

            if app_name == "Google Pay":
                upi_link = (
                    f"intent://pay?pa={payee_vpa}&pn={payee_name}"
                    f"&mc=&tid={tid}&tr={tr}&tn={tn}&am={amount}&cu=INR"
                    f"#Intent;scheme=upi;package={app_package};end;"
                )
            else:
                upi_link = (
                    f"upi://pay?pa={payee_vpa}&pn={payee_name}"
                    f"&mc=&tid={tid}&tr={tr}&tn={tn}&am={amount}&cu=INR"
                )

            payment = Payment.query.filter_by(order_id=order.id).first()
            if payment:
                payment.amount = amount
                payment.payment_method = 'upi'
                payment.status = 'initiated'
                payment.updated_at = datetime.utcnow()
            else:
                payment = Payment(
                    user_id=current_user.id,
                    order_id=order.id,
                    amount=amount,
                    payment_method='upi',
                    status='initiated'
                )
                db.session.add(payment)

            db.session.commit()

            return jsonify({
                'message': f'UPI payment link generated for {app_name}.',
                'upi_link': upi_link,
                'order_id': order.id,
                'payment_id': payment.id,
                'amount': amount
            }), 200

        return jsonify({'message': 'Unsupported payment method!'}), 400

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Payment error: {str(e)}")
        return jsonify({'message': f'Error processing payment: {str(e)}'}), 500

    


@app.route('/payment/confirm', methods=['POST'])
@token_required
def confirm_payment_and_reduce_stock(current_user):
    data = request.get_json()
    order_id = data.get('order_id')

    if not order_id:
        return jsonify({'error': 'Order ID is required'}), 400

    # Check if user is valid
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if order.status != 'pending':
        return jsonify({'error': 'Order already confirmed or not in pending status'}), 400

    try:
        order_items = OrderItem.query.filter_by(order_id=order_id).all()

        for item in order_items:
            product = Product.query.get(item.product_id)
            if not product:
                return jsonify({'error': f'Product ID {item.product_id} not found'}), 404

            if product.stock < item.quantity:
                return jsonify({'error': f'Not enough stock for {product.name}'}), 400

            product.stock -= item.quantity

        order.status = 'confirmed'
        db.session.commit()

        return jsonify({'message': 'Payment confirmed. Stock updated.'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pymysql
import pymysql.cursors
import os
from werkzeug.utils import secure_filename
import datetime
import base64
import requests
from requests.auth import HTTPBasicAuth
from functools import wraps
import jwt
from dotenv import load_dotenv
import uuid
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Updated CORS Configuration
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "https://saraicollection.pythonanywhere.com",
                "https://saraicollection.vercel.app"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "expose_headers": ["Content-Type"],
            "max_age": 86400
        }
    }
)

# Configuration
app.config['UPLOAD_FOLDER'] = '/home/saraicollection/mysite/static/images'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-very-secret-key-here')

# MPESA Configuration
app.config['MPESA_CONSUMER_KEY'] = os.getenv('MPESA_CONSUMER_KEY')
app.config['MPESA_CONSUMER_SECRET'] = os.getenv('MPESA_CONSUMER_SECRET')
app.config['MPESA_PASSKEY'] = os.getenv('MPESA_PASSKEY')
app.config['MPESA_BUSINESS_SHORTCODE'] = os.getenv('MPESA_BUSINESS_SHORTCODE', '174379')
app.config['MPESA_CALLBACK_URL'] = os.getenv('MPESA_CALLBACK_URL', 'https://yourdomain.com/api/mpesa_callback')

# Database Configuration
db_config = {
    'host': os.getenv('DB_HOST', 'saraicollection.mysql.pythonanywhere-services.com'),
    'user': os.getenv('DB_USER', 'saraicollection'),
    'password': os.getenv('DB_PASSWORD', 'unknownsara123'),
    'database': os.getenv('DB_NAME', 'saraicollection$saraicollections'),
    'cursorclass': pymysql.cursors.DictCursor
}

# Database Connection Helper
def get_db_connection():
    return pymysql.connect(**db_config)

# Helper Functions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Authentication Functions
def generate_token(user_id, is_admin=False):
    payload = {
        'user_id': user_id,
        'is_admin': is_admin,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)  # Bypass token check for OPTIONS
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        try:
            token = token.split()[1]  # Remove Bearer prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            request.user_id = data['user_id']
            request.is_admin = data.get('is_admin', False)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except Exception as e:
            return jsonify({"error": "Token is invalid", "details": str(e)}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not getattr(request, 'is_admin', False):
            return jsonify({"error": "Admin privileges required"}), 403
        return f(*args, **kwargs)
    return decorated_function

# Password Functions
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except (ValueError, TypeError):
        return False

import re

def validate_password_complexity(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one digit"
    if not re.search(r'[^A-Za-z0-9]', password):
        return False, "Password must contain at least one special character"
    return True, "Password meets complexity requirements"

# Log all responses for debugging
@app.after_request
def after_request_logging(response):
    logger.info(f"Response: {response.status} {request.method} {request.path}")
    logger.info(f"Response Headers: {response.headers}")
    return response

# ========== AUTHENTICATION ENDPOINTS ==========
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.form
        required_fields = ['username', 'email', 'password', 'first_name']
        missing = [field for field in required_fields if not data.get(field)]
        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

        is_valid, message = validate_password_complexity(data['password'])
        if not is_valid:
            return jsonify({"error": message}), 400

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM users WHERE email = %s OR username = %s",
                    (data['email'], data['username'])
                )
                if cursor.fetchone():
                    return jsonify({"error": "User already exists"}), 400

                password_hash = hash_password(data['password'])
                sql = """INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_admin)
                         VALUES (%s, %s, %s, %s, %s, %s, %s)"""
                cursor.execute(sql, (
                    data['username'],
                    data['email'],
                    password_hash,
                    data['first_name'],
                    data.get('last_name', ''),
                    data.get('phone', ''),
                    data.get('is_admin', False)
                ))
                user_id = cursor.lastrowid
            connection.commit()

        token = generate_token(user_id, data.get('is_admin', False))
        return jsonify({
            "message": "User registered successfully",
            "user_id": user_id,
            "token": token
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.form
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                user = cursor.fetchone()

                if not user or not verify_password(password, user['password_hash']):
                    return jsonify({"error": "Invalid credentials"}), 401

                token = generate_token(user['id'], user.get('is_admin', False))
                return jsonify({
                    "message": "Login successful",
                    "token": token,
                    "user": {
                        "id": user['id'],
                        "username": user['username'],
                        "email": user['email'],
                        "first_name": user['first_name'],
                        "is_admin": bool(user['is_admin'])
                    }
                })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== USER MANAGEMENT ENDPOINTS ==========
@app.route('/api/users', methods=['GET'])
def get_all_users():
    try:
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, username, email, first_name, last_name,
                           phone, is_admin, created_at
                    FROM users
                """)
                users = cursor.fetchall()
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
@token_required
@admin_required
def get_user(user_id):
    try:
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, username, email, first_name, last_name,
                           phone, is_admin, is_suspended, created_at
                    FROM users WHERE id = %s
                """, (user_id,))
                user = cursor.fetchone()
                if not user:
                    return jsonify({"error": "User not found"}), 404
                if user['created_at']:
                    user['created_at'] = user['created_at'].isoformat()
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@token_required
@admin_required
def update_user(user_id):
    try:
        data = request.form
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
                if not cursor.fetchone():
                    return jsonify({"error": "User not found"}), 404

                sql = """
                    UPDATE users SET
                        username = %s,
                        email = %s,
                        first_name = %s,
                        last_name = %s,
                        phone = %s,
                        is_admin = %s,
                        is_suspended = %s
                    WHERE id = %s
                """
                cursor.execute(sql, (
                    data.get('username'),
                    data.get('email'),
                    data.get('first_name'),
                    data.get('last_name'),
                    data.get('phone'),
                    bool(data.get('is_admin', False)),
                    bool(data.get('is_suspended', False)),
                    user_id
                ))
            connection.commit()
        return jsonify({"message": "User updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(user_id):
    try:
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
                if not cursor.fetchone():
                    return jsonify({"error": "User not found"}), 404

                cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            connection.commit()
        return jsonify({"message": "User deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Profile endpoint
@app.route('/api/users/me', methods=['GET', 'PUT', 'OPTIONS'])
def user_profile():
    if request.method == 'OPTIONS':
        logger.info("Handling OPTIONS request for /api/users/me")
        return jsonify({}), 200

    @token_required
    def protected_profile():
        if request.method == 'GET':
            try:
                connection = get_db_connection()
                with connection:
                    with connection.cursor() as cursor:
                        cursor.execute(
                            """SELECT id, username, email, first_name, last_name, phone,
                                      is_admin, created_at, avatar_url
                               FROM users
                               WHERE id = %s""",
                            (request.user_id,)
                        )
                        user = cursor.fetchone()

                        if not user:
                            return jsonify({"error": "User not found"}), 404

                        if user['created_at']:
                            user['created_at'] = user['created_at'].isoformat()

                return jsonify(user)

            except Exception as e:
                return jsonify({"error": str(e)}), 500

        elif request.method == 'PUT':
            try:
                data = request.form
                connection = get_db_connection()
                with connection:
                    with connection.cursor() as cursor:
                        if 'email' in data:
                            cursor.execute(
                                "SELECT id FROM users WHERE email = %s AND id != %s",
                                (data['email'], request.user_id)
                            )
                            if cursor.fetchone():
                                return jsonify({"error": "Email already in use"}), 400

                        update_fields = []
                        update_values = []

                        for field in ['username', 'email', 'first_name', 'last_name', 'phone']:
                            if field in data:
                                update_fields.append(f"{field} = %s")
                                update_values.append(data[field])

                        if update_fields:
                            update_values.append(request.user_id)
                            update_query = f"""
                                UPDATE users
                                SET {', '.join(update_fields)}
                                WHERE id = %s
                            """
                            cursor.execute(update_query, update_values)

                        cursor.execute(
                            """SELECT id, username, email, first_name, last_name, phone,
                                      is_admin, created_at, avatar_url
                               FROM users
                               WHERE id = %s""",
                            (request.user_id,)
                        )
                        updated_user = cursor.fetchone()
                        updated_user['created_at'] = updated_user['created_at'].isoformat()

                    connection.commit()

                return jsonify({
                    "message": "Profile updated successfully",
                    "user": updated_user
                })

            except Exception as e:
                return jsonify({"error": str(e)}), 500

    return protected_profile()

# Avatar endpoint
@app.route('/api/users/me/avatar', methods=['POST', 'OPTIONS'])
@token_required
def upload_avatar():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    if 'avatar' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    avatar = request.files['avatar']
    if avatar.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(avatar.filename):
        return jsonify({"error": "Allowed file types are: png, jpg, jpeg, gif"}), 400

    try:
        ext = secure_filename(avatar.filename).split('.')[-1]
        filename = f"avatar_{request.user_id}_{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

        avatar.save(filepath)

        avatar_url = f"/static/images/{filename}"

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT avatar_url FROM users WHERE id = %s",
                    (request.user_id,)
                )
                old_avatar = cursor.fetchone()

                if old_avatar and old_avatar['avatar_url']:
                    try:
                        old_path = os.path.join(app.config['UPLOAD_FOLDER'], old_avatar['avatar_url'].split('/')[-1])
                        if os.path.exists(old_path):
                            os.remove(old_path)
                    except Exception as e:
                        app.logger.error(f"Error deleting old avatar: {str(e)}")

                cursor.execute(
                    "UPDATE users SET avatar_url = %s WHERE id = %s",
                    (avatar_url, request.user_id)
                )

            connection.commit()

        return jsonify({
            "message": "Avatar uploaded successfully",
            "avatar_url": avatar_url
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/change-password', methods=['POST', 'OPTIONS'])
@token_required
def change_password():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        user_id = request.user_id
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({"error": "Current and new password required"}), 400

        is_valid, message = validate_password_complexity(new_password)
        if not is_valid:
            return jsonify({"error": message}), 400

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT password_hash FROM users WHERE id = %s",
                    (user_id,))
                user = cursor.fetchone()

                if not user:
                    return jsonify({"error": "User not found"}), 404

                if not bcrypt.checkpw(
                    current_password.encode('utf-8'),
                    user['password_hash'].encode('utf-8')
                ):
                    return jsonify({"error": "Current password is incorrect"}), 401

                new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cursor.execute(
                    "UPDATE users SET password_hash = %s WHERE id = %s",
                    (new_hash, user_id)
                )

            connection.commit()

        return jsonify({"message": "Password updated successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== CART ENDPOINTS ==========
@app.route('/api/cart/<int:item_id>', methods=['OPTIONS'])
def handle_cart_options(item_id):
    return jsonify({}), 200

@app.route('/api/cart/<int:item_id>', methods=['PUT'])
@token_required
def update_cart_item(item_id):
    try:
        data = request.form
        quantity = int(data.get('quantity', 1))
        if quantity < 1:
            return jsonify({"error": "Quantity must be at least 1"}), 400

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, cart_id FROM cart_items WHERE id = %s AND cart_id IN (SELECT id FROM carts WHERE user_id = %s)",
                    (item_id, request.user_id)
                )
                item = cursor.fetchone()
                if not item:
                    return jsonify({"error": "Cart item not found"}), 404

                cursor.execute(
                    "UPDATE cart_items SET quantity = %s WHERE id = %s",
                    (quantity, item_id)
                )
            connection.commit()

        logger.info(f"Updated cart item {item_id} to quantity {quantity} for user {request.user_id}")
        return jsonify({"message": "Cart item updated successfully"})

    except Exception as e:
        logger.error(f"Error in update_cart_item for item_id {item_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/cart/<int:item_id>', methods=['DELETE'])
@token_required
def remove_cart_item(item_id):
    try:
        user_id = request.user_id

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                # Verify that the cart item exists and belongs to the user
                cursor.execute(
                    """
                    SELECT ci.id, ci.cart_id
                    FROM cart_items ci
                    JOIN carts c ON ci.cart_id = c.id
                    WHERE ci.id = %s AND c.user_id = %s
                    """,
                    (item_id, user_id)
                )
                cart_item = cursor.fetchone()

                if not cart_item:
                    return jsonify({"error": "Cart item not found"}), 404

                # Delete the cart item
                cursor.execute(
                    "DELETE FROM cart_items WHERE id = %s",
                    (item_id,)
                )

            connection.commit()

        return jsonify({"message": "Cart item removed successfully"})

    except Exception as e:
        logger.error(f"Error removing cart item: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/cart/clear', methods=['DELETE'])
@token_required
def clear_cart():
    try:
        user_id = request.user_id
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM carts WHERE user_id = %s",
                    (user_id,)
                )
                cart = cursor.fetchone()
                if not cart:
                    return jsonify({"message": "Cart is already empty"}), 200
                cursor.execute(
                    "DELETE FROM cart_items WHERE cart_id = %s",
                    (cart['id'],)
                )
            connection.commit()
        return jsonify({"message": "Cart cleared successfully"})
    except Exception as e:
        logger.error(f"Error clearing cart: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/cart', methods=['GET'])
@token_required
def get_cart():
    try:
        user_id = request.user_id

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM carts WHERE user_id = %s",
                    (user_id,)
                )
                cart = cursor.fetchone()

                if not cart:
                    return jsonify({"items": []})

                cursor.execute(
                    """SELECT ci.*, p.name as product_name, p.price, pi.image_url as product_image
                       FROM cart_items ci
                       JOIN products p ON ci.product_id = p.id
                       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                       WHERE ci.cart_id = %s""",
                    (cart['id'],)
                )
                items = cursor.fetchall()

                subtotal = sum(item['price'] * item['quantity'] for item in items)
                total = subtotal

        return jsonify({
            "cart_id": cart['id'],
            "items": items,
            "subtotal": subtotal,
            "total": total
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/cart/add', methods=['POST'])
@token_required
def add_to_cart():
    try:
        data = request.form
        user_id = request.user_id
        product_id = data.get('product_id')
        quantity = int(data.get('quantity', 1))

        if not product_id:
            return jsonify({"error": "Product ID required"}), 400

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, price FROM products WHERE id = %s AND is_active = TRUE",
                    (product_id,)
                )
                product = cursor.fetchone()

                if not product:
                    return jsonify({"error": "Product not found"}), 404

                cursor.execute(
                    "SELECT id FROM carts WHERE user_id = %s",
                    (user_id,)
                )
                cart = cursor.fetchone()

                if not cart:
                    cursor.execute(
                        "INSERT INTO carts (user_id) VALUES (%s)",
                        (user_id,)
                    )
                    cart_id = cursor.lastrowid
                else:
                    cart_id = cart['id']

                cursor.execute(
                    "SELECT id, quantity FROM cart_items WHERE cart_id = %s AND product_id = %s",
                    (cart_id, product_id)
                )
                existing_item = cursor.fetchone()

                if existing_item:
                    new_quantity = existing_item['quantity'] + quantity
                    cursor.execute(
                        "UPDATE cart_items SET quantity = %s WHERE id = %s",
                        (new_quantity, existing_item['id'])
                    )
                else:
                    cursor.execute(
                        """INSERT INTO cart_items (cart_id, product_id, quantity, price)
                           VALUES (%s, %s, %s, %s)""",
                        (cart_id, product_id, quantity, product['price'])
                    )

            connection.commit()

        return jsonify({"message": "Item added to cart successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== PRODUCT ENDPOINTS ==========
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        category_id = request.args.get('category_id')
        featured = request.args.get('featured', '').lower() == 'true'
        search = request.args.get('search')
        limit = request.args.get('limit')

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                sql = """SELECT p.*, c.name as category_name
                         FROM products p
                         LEFT JOIN categories c ON p.category_id = c.id
                         WHERE p.is_active = TRUE"""
                params = []

                if category_id:
                    sql += " AND p.category_id = %s"
                    params.append(category_id)

                if featured:
                    sql += " AND p.is_featured = TRUE"

                if search:
                    sql += " AND (p.name LIKE %s OR p.description LIKE %s)"
                    params.extend([f"%{search}%", f"%{search}%"])

                sql += " ORDER BY p.created_at DESC"

                if limit and limit.isdigit():
                    sql += " LIMIT %s"
                    params.append(int(limit))

                cursor.execute(sql, params)
                products = cursor.fetchall()

                products = [dict(p) for p in products]

                for product in products:
                    product_id = product['id']
                    with connection.cursor() as img_cursor:
                        img_cursor.execute("""
                            SELECT image_url, is_primary, sort_order
                            FROM product_images
                            WHERE product_id = %s
                            ORDER BY is_primary DESC, sort_order ASC
                        """, (product_id,))
                        images = img_cursor.fetchall()
                        product['images'] = [dict(img) for img in images]

        return jsonify(products)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """SELECT p.*, c.name as category_name
                       FROM products p
                       LEFT JOIN categories c ON p.category_id = c.id
                       WHERE p.id = %s""",
                    (product_id,)
                )
                product = cursor.fetchone()

                if not product:
                    return jsonify({"error": "Product not found"}), 404

                cursor.execute(
                    "SELECT * FROM product_images WHERE product_id = %s ORDER BY sort_order",
                    (product_id,)
                )
                images = cursor.fetchall()
                product['images'] = images

        return jsonify(product)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products', methods=['POST'])
@token_required
@admin_required
def create_product():
    try:
        data = request.form
        files = request.files

        required_fields = ['name', 'price', 'category_id']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        if 'main_image' not in files:
            return jsonify({"error": "Main image is required"}), 400

        main_image = files['main_image']
        if not allowed_file(main_image.filename):
            return jsonify({"error": "Invalid file type"}), 400

        filename = secure_filename(main_image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        main_image.save(image_path)

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                slug = data['name'].lower().replace(' ', '-')

                cursor.execute(
                    """INSERT INTO products (
                        name, slug, description, short_description,
                        price, compare_price, cost_price, sku, barcode,
                        quantity, category_id, is_featured, is_active
                     ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (
                        data['name'],
                        slug,
                        data.get('description', ''),
                        data.get('short_description', ''),
                        float(data['price']),
                        float(data.get('compare_price', 0)),
                        float(data.get('cost_price', 0)),
                        data.get('sku', ''),
                        data.get('barcode', ''),
                        int(data.get('quantity', 0)),
                        int(data['category_id']),
                        bool(data.get('is_featured', False)),
                        bool(data.get('is_active', True))
                    )
                )
                product_id = cursor.lastrowid

                cursor.execute(
                    """INSERT INTO product_images (
                        product_id, image_url, is_primary
                       ) VALUES (%s, %s, %s)""",
                    (product_id, filename, True)
                )

                if 'additional_images' in files:
                    for img in files.getlist('additional_images'):
                        if allowed_file(img.filename):
                            filename = secure_filename(img.filename)
                            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                            img.save(image_path)

                            cursor.execute(
                                """INSERT INTO product_images (
                                    product_id, image_url, is_primary
                                   ) VALUES (%s, %s, %s)""",
                                (product_id, filename, False)
                            )

            connection.commit()

        return jsonify({
            "message": "Product created successfully",
            "product_id": product_id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@token_required
@admin_required
def update_product(product_id):
    try:
        data = request.form
        files = request.files

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
                if not cursor.fetchone():
                    return jsonify({"error": "Product not found"}), 404

                slug = data['name'].lower().replace(' ', '-')
                cursor.execute(
                    """UPDATE products SET
                        name = %s,
                        slug = %s,
                        description = %s,
                        short_description = %s,
                        price = %s,
                        compare_price = %s,
                        cost_price = %s,
                        sku = %s,
                        barcode = %s,
                        quantity = %s,
                        category_id = %s,
                        is_featured = %s,
                        is_active = %s
                     WHERE id = %s""",
                    (
                        data['name'],
                        slug,
                        data.get('description', ''),
                        data.get('short_description', ''),
                        float(data['price']),
                        float(data.get('compare_price', 0)),
                        float(data.get('cost_price', 0)),
                        data.get('sku', ''),
                        data.get('barcode', ''),
                        int(data.get('quantity', 0)),
                        int(data['category_id']),
                        bool(data.get('is_featured', False)),
                        bool(data.get('is_active', True)),
                        product_id
                    )
                )

                if 'images_to_delete[]' in data:
                    images_to_delete = request.form.getlist('images_to_delete[]')
                    for image_id in images_to_delete:
                        cursor.execute(
                            "SELECT image_url FROM product_images WHERE id = %s",
                            (image_id,)
                        )
                        image = cursor.fetchone()
                        if image:
                            try:
                                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], image['image_url'].split('/')[-1]))
                            except Exception as e:
                                app.logger.error(f"Error deleting image file: {str(e)}")

                        cursor.execute(
                            "DELETE FROM product_images WHERE id = %s",
                            (image_id,)
                        )

                if 'main_image' in files:
                    main_image = files['main_image']
                    if allowed_file(main_image.filename):
                        cursor.execute(
                            "SELECT id, image_url FROM product_images WHERE product_id = %s AND is_primary = TRUE",
                            (product_id,)
                        )
                        old_main = cursor.fetchone()
                        if old_main:
                            try:
                                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], old_main['image_url'].split('/')[-1]))
                            except Exception as e:
                                app.logger.error(f"Error deleting old main image: {str(e)}")

                            cursor.execute(
                                "DELETE FROM product_images WHERE id = %s",
                                (old_main['id'],)
                            )

                        filename = secure_filename(main_image.filename)
                        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                        main_image.save(image_path)

                        cursor.execute(
                            """INSERT INTO product_images (
                                product_id, image_url, is_primary
                               ) VALUES (%s, %s, %s)""",
                            (product_id, filename, True)
                        )

                if 'additional_images' in files:
                    for img in files.getlist('additional_images'):
                        if allowed_file(img.filename):
                            filename = secure_filename(img.filename)
                            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                            img.save(image_path)

                            cursor.execute(
                                """INSERT INTO product_images (
                                    product_id, image_url, is_primary
                                   ) VALUES (%s, %s, %s)""",
                                (product_id, filename, False)
                            )

            connection.commit()

        return jsonify({"message": "Product updated successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders', methods=['GET'])
@token_required
@admin_required
def get_orders():
    try:
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT o.id, o.order_number, o.status, o.total_amount,
                           o.created_at, u.username, u.email
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    ORDER BY o.created_at DESC
                """)
                orders = cursor.fetchall()

                # Convert datetime objects to strings
                for order in orders:
                    if order['created_at']:
                        order['created_at'] = order['created_at'].isoformat()

        return jsonify(orders)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders/<int:order_id>', methods=['GET'])
@token_required
def get_order_details(order_id):
    try:
        user_id = request.user_id
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                # Get order basic info
                cursor.execute("""
                    SELECT o.*, u.username, u.email, u.phone
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    WHERE o.id = %s AND (o.user_id = %s OR %s = TRUE)
                """, (order_id, user_id, request.is_admin))
                order = cursor.fetchone()

                if not order:
                    return jsonify({"error": "Order not found"}), 404

                if order['created_at']:
                    order['created_at'] = order['created_at'].isoformat()

                # Get order items
                cursor.execute("""
                    SELECT
                        oi.*,
                        pi.image_url as product_image,
                        p.sku,
                        CONCAT('https://saraicollection.pythonanywhere.com', pi.image_url) as full_image_url
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
                    WHERE oi.order_id = %s
                """, (order_id,))
                items = cursor.fetchall()

                # Convert to dictionary and handle image URLs
                order_items = []
                for item in items:
                    item_dict = dict(item)
                    # Fallback to default image if none exists
                    if not item_dict['product_image']:
                        item_dict['full_image_url'] = 'https://via.placeholder.com/100?text=No+Image'
                    order_items.append(item_dict)

                order['items'] = order_items

        return jsonify(order)
    except Exception as e:
        logger.error(f"Error fetching order details: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_product(product_id):
    try:
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id, slug FROM products WHERE id = %s", (product_id,))
                product = cursor.fetchone()
                if not product:
                    return jsonify({"error": "Product not found"}), 404

                cursor.execute("SELECT image_url FROM product_images WHERE product_id = %s", (product_id,))
                images = cursor.fetchall()

                for image in images:
                    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image['image_url'].split('/')[-1])
                    try:
                        if os.path.exists(image_path):
                            os.remove(image_path)
                    except Exception as e:
                        app.logger.error(f"Error deleting image {image_path}: {str(e)}")

                cursor.execute("DELETE FROM product_images WHERE product_id = %s", (product_id,))
                cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))

            connection.commit()

        return jsonify({"message": "Product deleted successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/static/images/<filename>')
def serve_image(filename):
    if '..' in filename or filename.startswith('/'):
        return jsonify({"error": "Invalid filename"}), 400

    image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    if not os.path.exists(image_path):
        return jsonify({"error": "Image not found"}), 404

    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ========== CATEGORY ENDPOINTS ==========
@app.route('/api/products/categories', methods=['GET'])
def get_product_categories():
    try:
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """SELECT id, name, slug
                       FROM categories
                       WHERE is_active = TRUE
                       ORDER BY name"""
                )
                categories = cursor.fetchall()

        return jsonify(categories)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/category/<string:category_slug>', methods=['GET'])
def get_products_by_category(category_slug):
    try:
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM categories WHERE slug = %s",
                    (category_slug,)
                )
                category = cursor.fetchone()

                if not category:
                    return jsonify({"error": "Category not found"}), 404

                cursor.execute(
                    """SELECT p.*,
                          (SELECT image_url FROM product_images
                           WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as main_image
                       FROM products p
                       WHERE p.category_id = %s AND p.is_active = TRUE
                       ORDER BY p.is_featured DESC, p.created_at DESC""",
                    (category['id'],)
                )
                products = cursor.fetchall()

                for product in products:
                    product['colors'] = ['black', 'white', 'gray']
                    product['sizes'] = ['S', 'M', 'L', 'XL', 'XXL']

        return jsonify(products)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, name, description FROM categories WHERE is_active = TRUE ORDER BY name"
                )
                categories = cursor.fetchall()

        return jsonify(categories)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/categories', methods=['POST'])
@token_required
@admin_required
def create_category():
    try:
        data = request.form
        name = data.get('name')
        description = data.get('description', '')

        if not name:
            return jsonify({"error": "Category name is required"}), 400

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM categories WHERE name = %s",
                    (name,)
                )
                if cursor.fetchone():
                    return jsonify({"error": "Category already exists"}), 400

                slug = name.lower().replace(' ', '-').replace('&', 'and')

                cursor.execute(
                    """INSERT INTO categories (name, slug, description, is_active)
                       VALUES (%s, %s, %s, %s)""",
                    (name, slug, description, True)
                )
                category_id = cursor.lastrowid

            connection.commit()

        return jsonify({
            "message": "Category created successfully",
            "category_id": category_id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/categories/setup', methods=['POST'])
@token_required
@admin_required
def setup_default_categories():
    try:
        default_categories = [
            {'name': 'Hoodies', 'description': 'Comfortable hoodies and sweatshirts'},
            {'name': 'Clothing', 'description': 'General clothing items'},
            {'name': 'Home & Garden', 'description': 'Home and garden products'}
        ]

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                created_categories = []

                for category in default_categories:
                    cursor.execute(
                        "SELECT id FROM categories WHERE name = %s",
                        (category['name'],)
                    )
                    existing = cursor.fetchone()

                    if not existing:
                        slug = category['name'].lower().replace(' ', '-').replace('&', 'and')
                        cursor.execute(
                            """INSERT INTO categories (name, slug, description, is_active)
                               VALUES (%s, %s, %s, %s)""",
                            (category['name'], slug, category['description'], True)
                        )
                        created_categories.append({
                            'id': cursor.lastrowid,
                            'name': category['name']
                        })

            connection.commit()

        return jsonify({
            "message": f"Created {len(created_categories)} categories",
            "categories": created_categories
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== ORDER ENDPOINTS ==========
@app.route('/api/orders', methods=['POST'])
@token_required
def create_order():
    try:
        data = request.form
        user_id = request.user_id
        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id FROM carts WHERE user_id = %s", (user_id,))
                cart = cursor.fetchone()
                if not cart:
                    return jsonify({"error": "Cart not found"}), 404

                cursor.execute(
                    """SELECT ci.*, p.name as product_name, p.price
                       FROM cart_items ci
                       JOIN products p ON ci.product_id = p.id
                       WHERE ci.cart_id = %s""",
                    (cart['id'],)
                )
                items = cursor.fetchall()
                if not items:
                    return jsonify({"error": "Cart is empty"}), 400

                subtotal = sum(item['price'] * item['quantity'] for item in items)
                tax = 0
                shipping = 0
                total = subtotal + tax + shipping

                # Insert order first
                cursor.execute(
                    """INSERT INTO orders (
                        order_number, user_id, status, subtotal, tax_amount,
                        shipping_amount, total_amount, shipping_address, billing_address
                       ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (
                        'TEMP',  # Temporary placeholder
                        user_id,
                        'pending',
                        subtotal,
                        tax,
                        shipping,
                        total,
                        data.get('shipping_address', ''),
                        data.get('billing_address', data.get('shipping_address', ''))
                    )
                )
                order_id = cursor.lastrowid
                # Update order_number with correct value
                order_number = f"ORD-{datetime.datetime.now().strftime('%Y%m%d')}-{order_id}"
                cursor.execute(
                    "UPDATE orders SET order_number = %s WHERE id = %s",
                    (order_number, order_id)
                )

                for item in items:
                    cursor.execute(
                        """INSERT INTO order_items (
                            order_id, product_id, product_name, product_price, quantity, total_price
                           ) VALUES (%s, %s, %s, %s, %s, %s)""",
                        (
                            order_id,
                            item['product_id'],
                            item['product_name'],
                            item['price'],
                            item['quantity'],
                            item['price'] * item['quantity']
                        )
                    )

                cursor.execute("DELETE FROM cart_items WHERE cart_id = %s", (cart['id'],))
                cursor.execute("DELETE FROM carts WHERE id = %s", (cart['id'],))

            connection.commit()
        return jsonify({"message": "Order created successfully", "order_id": order_id, "order_number": order_number}), 201
    except Exception as e:
        logger.error(f"Error in create_order: {str(e)}")  # Log detailed error
        return jsonify({"error": str(e)}), 500

# ========== PAYMENT ENDPOINTS ==========
@app.route('/api/payments/mpesa', methods=['POST'])
def mpesa_payment():
    if request.method == 'POST':
        amount = request.form['amount']
        phone = request.form['phone']
        # GENERATING THE ACCESS TOKEN
        consumer_key = "GTWADFxIpUfDoNikNGqq1C3023evM6UH"
        consumer_secret = "amFbAoUByPV2rM5A"

        api_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"  # AUTH URL
        r = requests.get(api_URL, auth=HTTPBasicAuth(consumer_key, consumer_secret))

        data = r.json()
        access_token = "Bearer" + ' ' + data['access_token']

        #  GETTING THE PASSWORD
        timestamp = datetime.datetime.today().strftime('%Y%m%d%H%M%S')
        passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
        business_short_code = "174379"
        data = business_short_code + passkey + timestamp
        encoded = base64.b64encode(data.encode())
        password = encoded.decode('utf-8')

        # BODY OR PAYLOAD
        payload = {
            "BusinessShortCode": "174379",
            "Password": "{}".format(password),
            "Timestamp": "{}".format(timestamp),
            "TransactionType": "CustomerPayBillOnline",
            "Amount": "1",  # use 1 when testing
            "PartyA": phone,  # change to your number
            "PartyB": "174379",
            "PhoneNumber": phone,
            "CallBackURL": "https://modcom.co.ke/api/confirmation.php",
            "AccountReference": "account",
            "TransactionDesc": "account"
        }

        # POPULAING THE HTTP HEADER
        headers = {
            "Authorization": access_token,
            "Content-Type": "application/json"
        }

        url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"  # C2B URL

        response = requests.post(url, json=payload, headers=headers)
        print(response.text)
        return jsonify({"message": "Please Complete Payment in Your Phone and we will deliver in minutes"})

# ========CALL_BACK ENDPOINT=======
@app.route('/api/mpesa_callback', methods=['POST'])
def mpesa_callback():
    try:
        data = request.get_json()
        logger.info(f"M-Pesa Callback received: {data}")

        # Extract relevant data from callback
        checkout_request_id = data.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID')
        result_code = data.get('Body', {}).get('stkCallback', {}).get('ResultCode')

        connection = get_db_connection()
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT payment_id FROM mpesa_transactions WHERE checkout_request_id = %s",
                    (checkout_request_id,)
                )
                transaction = cursor.fetchone()

                if not transaction:
                    logger.error("Transaction not found for CheckoutRequestID: %s", checkout_request_id)
                    return jsonify({"error": "Transaction not found"}), 404

                # Update payment status based on result
                status = 'completed' if result_code == 0 else 'failed'
                cursor.execute(
                    "UPDATE payments SET status = %s WHERE id = %s",
                    (status, transaction['payment_id'])
                )
                if result_code == 0:
                    cursor.execute(
                        "UPDATE orders SET status = %s WHERE id = (SELECT order_id FROM payments WHERE id = %s)",
                        ('completed', transaction['payment_id'])
                    )

            connection.commit()

        return jsonify({"message": "Callback processed successfully"})

    except Exception as e:
        logger.error(f"Error processing callback: {str(e)}")
        return jsonify({"error": str(e)}), 500

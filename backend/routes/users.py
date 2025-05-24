from flask import Blueprint, request, jsonify, session # Add session here
from backend.models.user_model import User
from backend.extensions import db

users_bp = Blueprint('users_bp', __name__, url_prefix='/api/users')

@users_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing username, email, or password'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        # Log the exception e for debugging
        print(f"Error in register_user: {e}")
        return jsonify({'error': 'Failed to register user due to a server error.'}), 500

@users_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    username_or_email = data.get('username_or_email')
    password = data.get('password')

    if not username_or_email or not password:
        return jsonify({'error': 'Missing username/email or password'}), 400

    # Check if input is email or username
    user = User.query.filter((User.username == username_or_email) | (User.email == username_or_email)).first()

    if user and user.check_password(password):
        session['user_id'] = user.id # <--- ADD THIS LINE
        session['username'] = user.username # Optional: store username also
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
                # Consider not sending email back here if not strictly needed by frontend post-login
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid username/email or password'}), 401

# Placeholder for Get User Profile
@users_bp.route('/profile', methods=['GET'])
def get_user_profile():
    # This is a placeholder. In a real app, you would get the user ID
    # from a session or a token (e.g., after login).
    # For now, let's try to retrieve a user, e.g., user with ID 1,
    # or return a generic message if no specific user context.
    
    # Example: Attempt to get user 1 (assuming this user might exist after registration/seeding)
    # In a real app, this ID would come from an authenticated session/token.
    user_id_to_fetch = 1 
    user = User.query.get(user_id_to_fetch)

    if user:
        return jsonify({
            'message': 'User profile retrieved successfully.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    else:
        # If user 1 doesn't exist or no specific user context is available yet
        return jsonify({'message': 'This is the user profile endpoint. No specific user logged in or found for default view.'}), 200

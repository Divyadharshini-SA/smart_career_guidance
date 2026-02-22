from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db, bcrypt
from models import User, UserProfile, Progress

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(k in data for k in ['name', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(
        name=data['name'], email=data['email'], password_hash=hashed,
        college=data.get('college'), branch=data.get('branch'), year=data.get('year')
    )
    db.session.add(user)
    db.session.flush()
    db.session.add(UserProfile(user_id=user.id, interests=[], skills={}))
    db.session.add(Progress(user_id=user.id))
    db.session.commit()
    # AFTER
    token = create_access_token(identity=str(user.id))
    # token = create_access_token(identity=user.id)
    return jsonify({'message': 'Registration successful', 'token': token, 'user_id': user.id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, data.get('password','')):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({
        'token'  : token,
        'user_id': user.id,
        'name'   : user.name,
        'role'   : user.role        # ← ADD THIS
    }), 200

# @auth_bp.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     user = User.query.filter_by(email=data.get('email')).first()
#     if not user or not bcrypt.check_password_hash(user.password_hash, data.get('password', '')):
#         return jsonify({'error': 'Invalid credentials'}), 401
#     token = create_access_token(identity=str(user.id))
#     return jsonify({'token': token, 'user_id': user.id, 'name': user.name}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'id': user.id, 'name': user.name, 'email': user.email})


# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
# from extensions import db, bcrypt
# from models import User, UserProfile, Progress

# auth_bp = Blueprint('auth', __name__)


# @auth_bp.route('/register', methods=['POST'])
# def register():
#     data = request.get_json()
#     required = ['name', 'email', 'password']
#     if not all(k in data for k in required):
#         return jsonify({'error': 'Missing required fields'}), 400

#     if User.query.filter_by(email=data['email']).first():
#         return jsonify({'error': 'Email already registered'}), 409

#     hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
#     user = User(
#         name=data['name'],
#         email=data['email'],
#         password_hash=hashed,
#         college=data.get('college'),
#         branch=data.get('branch'),
#         year=data.get('year')
#     )
#     db.session.add(user)
#     db.session.flush()   # get user.id before commit

#     # Create empty profile and progress records
#     db.session.add(UserProfile(user_id=user.id, interests=[], skills={}))
#     db.session.add(Progress(user_id=user.id))
#     db.session.commit()

#     token = create_access_token(identity=user.id)
#     return jsonify({'message': 'Registration successful', 'token': token, 'user_id': user.id}), 201


# @auth_bp.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     user = User.query.filter_by(email=data.get('email')).first()
#     if not user or not bcrypt.check_password_hash(user.password_hash, data.get('password', '')):
#         return jsonify({'error': 'Invalid credentials'}), 401

#     token = create_access_token(identity=user.id)
#     return jsonify({'token': token, 'user_id': user.id, 'name': user.name}), 200


# @auth_bp.route('/me', methods=['GET'])
# @jwt_required()
# def me():
#     user = User.query.get(get_jwt_identity())
#     if not user:
#         return jsonify({'error': 'User not found'}), 404
#     return jsonify({
#         'id': user.id, 'name': user.name, 'email': user.email,
#         'college': user.college, 'branch': user.branch, 'year': user.year
#     })
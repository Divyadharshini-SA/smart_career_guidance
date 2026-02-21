from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import UserProfile

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/', methods=['GET'])
@jwt_required()
def get_profile():
    uid = int(get_jwt_identity())
    p = UserProfile.query.filter_by(user_id=uid).first()
    if not p:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'interests': p.interests, 'skills': p.skills, 'personality': p.personality, 'career_goal': p.career_goal})

@profile_bp.route('/', methods=['PUT'])
@jwt_required()
def update_profile():
    uid = int(get_jwt_identity())
    # uid = get_jwt_identity()
    data = request.get_json()
    p = UserProfile.query.filter_by(user_id=uid).first()
    if not p:
        p = UserProfile(user_id=uid)
        db.session.add(p)
    if 'interests'   in data: p.interests   = data['interests']
    if 'skills'      in data: p.skills      = data['skills']
    if 'personality' in data: p.personality = data['personality']
    if 'career_goal' in data: p.career_goal = data['career_goal']
    db.session.commit()
    return jsonify({'message': 'Profile updated'})


# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from extensions import db
# from models import UserProfile

# profile_bp = Blueprint('profile', __name__)


# @profile_bp.route('/', methods=['GET'])
# @jwt_required()
# def get_profile():
#     uid = get_jwt_identity()
#     p = UserProfile.query.filter_by(user_id=uid).first()
#     if not p:
#         return jsonify({'error': 'Profile not found'}), 404
#     return jsonify({
#         'interests': p.interests,
#         'skills': p.skills,
#         'personality': p.personality,
#         'career_goal': p.career_goal
#     })


# @profile_bp.route('/', methods=['PUT'])
# @jwt_required()
# def update_profile():
#     uid = get_jwt_identity()
#     data = request.get_json()
#     p = UserProfile.query.filter_by(user_id=uid).first()
#     if not p:
#         p = UserProfile(user_id=uid)
#         db.session.add(p)

#     if 'interests'   in data: p.interests   = data['interests']
#     if 'skills'      in data: p.skills      = data['skills']
#     if 'personality' in data: p.personality = data['personality']
#     if 'career_goal' in data: p.career_goal = data['career_goal']

#     db.session.commit()
#     return jsonify({'message': 'Profile updated successfully'})
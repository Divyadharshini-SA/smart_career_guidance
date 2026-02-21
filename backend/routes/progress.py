from flask import jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Progress

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/', methods=['GET'])
@jwt_required()
def get_progress():
    # uid  = get_jwt_identity()
    # AFTER
    uid = int(get_jwt_identity())
    prog = Progress.query.filter_by(user_id=uid).first()
    if not prog:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({
        'skill_score': prog.skill_score,
        'aptitude_score': prog.aptitude_score,
        'resume_score': prog.resume_score,
        'roadmap_completion': prog.roadmap_completion,
        'placement_readiness': prog.placement_readiness,
        'completed_roadmap_steps': prog.completed_roadmap_steps or []
    })

# from flask import jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from flask import Blueprint
# from models import Progress

# progress_bp = Blueprint('progress', __name__)


# @progress_bp.route('/', methods=['GET'])
# @jwt_required()
# def get_progress():
#     uid  = get_jwt_identity()
#     prog = Progress.query.filter_by(user_id=uid).first()
#     if not prog:
#         return jsonify({'error': 'Progress record not found'}), 404
#     return jsonify({
#         'skill_score'            : prog.skill_score,
#         'aptitude_score'         : prog.aptitude_score,
#         'resume_score'           : prog.resume_score,
#         'roadmap_completion'     : prog.roadmap_completion,
#         'placement_readiness'    : prog.placement_readiness,
#         'completed_roadmap_steps': prog.completed_roadmap_steps or []
#     })
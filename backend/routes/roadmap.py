from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Roadmap, SkillGap, Progress
from ml.skill_gap_engine import SkillGapEngine

roadmap_bp = Blueprint('roadmap', __name__)


@roadmap_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_roadmap():
    uid           = get_jwt_identity()
    data          = request.get_json()
    career_domain = data.get('career_domain', 'Software Engineer')

    engine    = SkillGapEngine()
    gap_data  = engine.analyze(uid, career_domain)
    roadmap   = engine.generate_roadmap(career_domain, gap_data['missing_skills'])

    # Save skill gap
    sg = SkillGap(
        user_id         = uid,
        career_domain   = career_domain,
        required_skills = gap_data['required_skills'],
        current_skills  = gap_data['current_skills'],
        missing_skills  = gap_data['missing_skills'],
        gap_percentage  = gap_data['gap_percentage']
    )
    db.session.add(sg)

    # Save roadmap
    rm = Roadmap(
        user_id       = uid,
        career_domain = career_domain,
        steps         = roadmap['steps'],
        timeline      = roadmap['timeline']
    )
    db.session.add(rm)
    db.session.commit()

    return jsonify({
        'skill_gap': gap_data,
        'roadmap'  : roadmap
    })


@roadmap_bp.route('/latest', methods=['GET'])
@jwt_required()
def latest():
    uid = int(get_jwt_identity())
    rm  = Roadmap.query.filter_by(user_id=uid).order_by(Roadmap.generated_at.desc()).first()
    sg  = SkillGap.query.filter_by(user_id=uid).order_by(SkillGap.analyzed_at.desc()).first()
    if not rm:
        return jsonify({'error': 'No roadmap found. Generate one first.'}), 404
    return jsonify({'roadmap': {'steps': rm.steps, 'timeline': rm.timeline, 'career_domain': rm.career_domain},
                    'skill_gap': {'missing_skills': sg.missing_skills, 'gap_percentage': sg.gap_percentage} if sg else {}})


@roadmap_bp.route('/complete-step', methods=['POST'])
@jwt_required()
def complete_step():
    uid  = int(get_jwt_identity())
    step = request.get_json().get('step')
    prog = Progress.query.filter_by(user_id=uid).first()
    if not prog:
        return jsonify({'error': 'Progress not found'}), 404

    completed = prog.completed_roadmap_steps or []
    if step not in completed:
        completed.append(step)
        prog.completed_roadmap_steps = completed

    rm = Roadmap.query.filter_by(user_id=uid).order_by(Roadmap.generated_at.desc()).first()
    if rm:
        all_steps = (rm.steps.get('beginner', []) +
                     rm.steps.get('intermediate', []) +
                     rm.steps.get('advanced', []))
        prog.roadmap_completion = round(len(completed) / max(len(all_steps), 1) * 100, 2)

    db.session.commit()
    return jsonify({'roadmap_completion': prog.roadmap_completion})
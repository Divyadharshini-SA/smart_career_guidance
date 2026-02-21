from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import UserProfile, Assessment, Resume, CareerRecommendation
from ml.career_engine import CareerEngine

career_bp = Blueprint('career', __name__)


@career_bp.route('/recommend', methods=['GET'])
@jwt_required()
def recommend():
    uid     = get_jwt_identity()
    profile = UserProfile.query.filter_by(user_id=uid).first()
    resume  = Resume.query.filter_by(user_id=uid).order_by(Resume.uploaded_at.desc()).first()

    aptitude_rec = Assessment.query.filter_by(user_id=uid, type='aptitude')\
                                   .order_by(Assessment.taken_at.desc()).first()
    technical_rec = Assessment.query.filter_by(user_id=uid, type='technical')\
                                    .order_by(Assessment.taken_at.desc()).first()

    user_skills    = profile.skills if profile else {}
    interests      = profile.interests if profile else []
    aptitude_score = aptitude_rec.percentage if aptitude_rec else 0
    resume_skills  = resume.extracted_skills if resume else []
    tech_score     = technical_rec.percentage if technical_rec else 0

    engine = CareerEngine()
    result = engine.predict(
        skills        = user_skills,
        interests     = interests,
        aptitude_score= aptitude_score,
        resume_skills = resume_skills,
        tech_score    = tech_score
    )

    rec = CareerRecommendation(
        user_id              = uid,
        top_careers          = result['top_careers'],
        skill_match_score    = result['skill_match_score'],
        aptitude_score       = aptitude_score,
        interest_match_score = result['interest_match_score'],
        confidence_score     = result['confidence_score']
    )
    db.session.add(rec)
    db.session.commit()

    return jsonify(result)


@career_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    uid     = int(get_jwt_identity())
    records = CareerRecommendation.query.filter_by(user_id=uid)\
                                        .order_by(CareerRecommendation.generated_at.desc()).all()
    return jsonify([{
        'top_careers'    : r.top_careers,
        'confidence_score': r.confidence_score,
        'generated_at'   : r.generated_at.isoformat()
    } for r in records])
import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from extensions import db
from models import Resume, Progress
from services.resume_service import ResumeService

resume_bp = Blueprint('resume', __name__)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


@resume_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_resume():
    uid = int(get_jwt_identity())
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Use PDF or DOC/DOCX'}), 400

    filename = secure_filename(f"user_{uid}_{file.filename}")
    save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)

    service   = ResumeService()
    text      = service.extract_text(save_path)
    skills    = service.extract_skills(text)
    score     = service.calculate_resume_score(text, skills)

    resume = Resume(
        user_id          = uid,
        filename         = filename,
        extracted_text   = text,
        extracted_skills = skills,
        resume_score     = score
    )
    db.session.add(resume)

    prog = Progress.query.filter_by(user_id=uid).first()
    if prog:
        prog.resume_score = score
        prog.placement_readiness = round(
            (prog.skill_score * 0.4) + (prog.aptitude_score * 0.3) +
            (score * 0.2) + (prog.roadmap_completion * 0.1), 2
        )

    db.session.commit()
    return jsonify({
        'message'         : 'Resume uploaded and analyzed',
        'extracted_skills': skills,
        'resume_score'    : score
    }), 201


@resume_bp.route('/latest', methods=['GET'])
@jwt_required()
def latest_resume():
    uid = int(get_jwt_identity())
    resume = Resume.query.filter_by(user_id=uid).order_by(Resume.uploaded_at.desc()).first()
    if not resume:
        return jsonify({'error': 'No resume found'}), 404
    return jsonify({
        'filename'        : resume.filename,
        'extracted_skills': resume.extracted_skills,
        'resume_score'    : resume.resume_score,
        'uploaded_at'     : resume.uploaded_at.isoformat()
    })
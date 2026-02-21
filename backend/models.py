from extensions import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'users'
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    college       = db.Column(db.String(150))
    branch        = db.Column(db.String(100))
    year          = db.Column(db.Integer)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    profile       = db.relationship('UserProfile', backref='user', uselist=False)
    assessments   = db.relationship('Assessment', backref='user', lazy=True)
    resumes       = db.relationship('Resume', backref='user', lazy=True)
    progress      = db.relationship('Progress', backref='user', uselist=False)


class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    interests      = db.Column(db.JSON)          # list of interest strings
    skills         = db.Column(db.JSON)          # {"Python": 7, "ML": 5, ...}
    personality    = db.Column(db.String(50))    # e.g. INTJ, Analytical, etc.
    career_goal    = db.Column(db.String(200))
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Assessment(db.Model):
    __tablename__ = 'assessments'
    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type            = db.Column(db.String(50))   # 'technical', 'aptitude', 'soft_skill'
    scores          = db.Column(db.JSON)         # {"topic": score, ...}
    total_score     = db.Column(db.Float)
    max_score       = db.Column(db.Float)
    percentage      = db.Column(db.Float)
    taken_at        = db.Column(db.DateTime, default=datetime.utcnow)


class Resume(db.Model):
    __tablename__ = 'resumes'
    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename         = db.Column(db.String(255))
    extracted_text   = db.Column(db.Text)
    extracted_skills = db.Column(db.JSON)
    resume_score     = db.Column(db.Float)
    uploaded_at      = db.Column(db.DateTime, default=datetime.utcnow)


class CareerRecommendation(db.Model):
    __tablename__ = 'career_recommendations'
    id                   = db.Column(db.Integer, primary_key=True)
    user_id              = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    top_careers          = db.Column(db.JSON)    # [{"domain": "...", "score": 87.5}, ...]
    skill_match_score    = db.Column(db.Float)
    aptitude_score       = db.Column(db.Float)
    interest_match_score = db.Column(db.Float)
    confidence_score     = db.Column(db.Float)
    generated_at         = db.Column(db.DateTime, default=datetime.utcnow)


class SkillGap(db.Model):
    __tablename__ = 'skill_gaps'
    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    career_domain   = db.Column(db.String(100))
    required_skills = db.Column(db.JSON)
    current_skills  = db.Column(db.JSON)
    missing_skills  = db.Column(db.JSON)
    gap_percentage  = db.Column(db.Float)
    analyzed_at     = db.Column(db.DateTime, default=datetime.utcnow)


class Roadmap(db.Model):
    __tablename__ = 'roadmaps'
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    career_domain = db.Column(db.String(100))
    steps         = db.Column(db.JSON)   # {beginner: [], intermediate: [], advanced: []}
    timeline      = db.Column(db.JSON)   # {"week1": [...], ...}
    generated_at  = db.Column(db.DateTime, default=datetime.utcnow)


class Progress(db.Model):
    __tablename__ = 'progress'
    id                      = db.Column(db.Integer, primary_key=True)
    user_id                 = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    skill_score             = db.Column(db.Float, default=0)
    aptitude_score          = db.Column(db.Float, default=0)
    resume_score            = db.Column(db.Float, default=0)
    roadmap_completion      = db.Column(db.Float, default=0)
    placement_readiness     = db.Column(db.Float, default=0)
    completed_roadmap_steps = db.Column(db.JSON, default=list)
    updated_at              = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
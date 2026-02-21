from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import UserProfile, CareerRecommendation

placement_bp = Blueprint('placement', __name__)

# ---- Static placement preparation data ----
APTITUDE_TOPICS = [
    {"topic": "Quantitative Aptitude", "subtopics": ["Percentages","Profit & Loss","Time & Work","Speed & Distance"]},
    {"topic": "Logical Reasoning",     "subtopics": ["Syllogisms","Blood Relations","Coding-Decoding","Puzzles"]},
    {"topic": "Verbal Ability",        "subtopics": ["Reading Comprehension","Fill in the Blanks","Sentence Correction"]},
]

CODING_TOPICS = [
    {"topic": "Data Structures", "subtopics": ["Arrays","Linked Lists","Stacks & Queues","Trees","Graphs"]},
    {"topic": "Algorithms",      "subtopics": ["Sorting","Searching","Dynamic Programming","Greedy","Backtracking"]},
    {"topic": "System Design",   "subtopics": ["REST APIs","Database Design","Caching","Load Balancing"]},
]

INTERVIEW_TOPICS = [
    "HR Questions & STAR Method",
    "Technical MCQ Practice",
    "Group Discussion Tips",
    "Resume Walkthrough Preparation",
    "Situational & Behavioural Questions",
]

RESOURCES = {
    "aptitude"  : [
        {"title": "IndiaBix Aptitude Practice",      "url": "https://www.indiabix.com"},
        {"title": "RS Aggarwal Solutions - YouTube",  "url": "https://youtube.com/results?search_query=rs+aggarwal+aptitude"},
    ],
    "coding"    : [
        {"title": "LeetCode",                        "url": "https://leetcode.com"},
        {"title": "GeeksforGeeks DSA Course",        "url": "https://www.geeksforgeeks.org/data-structures"},
        {"title": "Striver DSA Sheet - YouTube",     "url": "https://youtube.com/results?search_query=striver+dsa+sheet"},
    ],
    "interview" : [
        {"title": "InterviewBit",                    "url": "https://www.interviewbit.com"},
        {"title": "Glassdoor Interview Questions",   "url": "https://www.glassdoor.com/Interview"},
    ],
    "ml"        : [
        {"title": "Andrew Ng ML Course - Coursera",  "url": "https://www.coursera.org/learn/machine-learning"},
        {"title": "Kaggle Learn",                    "url": "https://www.kaggle.com/learn"},
    ],
}

JOBS_BY_DOMAIN = {
    "Software Engineer"      : ["Junior Developer","Backend Engineer","Full Stack Developer","Software Trainee"],
    "Data Scientist"         : ["Data Analyst","ML Engineer","Junior Data Scientist","BI Analyst"],
    "Cybersecurity"          : ["Security Analyst","Penetration Tester","SOC Analyst","Security Intern"],
    "Cloud Engineer"         : ["Cloud Support Intern","DevOps Trainee","AWS/GCP/Azure Associate"],
    "AI/ML Engineer"         : ["ML Researcher","AI Engineer Trainee","NLP Engineer"],
    "Web Developer"          : ["Frontend Developer","React Developer","UI/UX Developer"],
    "Embedded Systems"       : ["Firmware Engineer","IoT Developer","Hardware Test Engineer"],
    "Data Engineer"          : ["ETL Developer","Big Data Intern","Spark/Kafka Engineer"],
}


@placement_bp.route('/preparation', methods=['GET'])
@jwt_required()
def preparation():
    return jsonify({
        'aptitude_topics' : APTITUDE_TOPICS,
        'coding_topics'   : CODING_TOPICS,
        'interview_topics': INTERVIEW_TOPICS,
        'resources'       : RESOURCES
    })


@placement_bp.route('/jobs', methods=['GET'])
@jwt_required()
def jobs():
    uid  = int(get_jwt_identity())
    rec  = CareerRecommendation.query.filter_by(user_id=uid).order_by(
               CareerRecommendation.generated_at.desc()).first()

    if rec and rec.top_careers:
        domain = rec.top_careers[0]['domain']
    else:
        profile = UserProfile.query.filter_by(user_id=uid).first()
        domain  = (profile.career_goal or 'Software Engineer') if profile else 'Software Engineer'

    roles = JOBS_BY_DOMAIN.get(domain, JOBS_BY_DOMAIN['Software Engineer'])
    return jsonify({'career_domain': domain, 'recommended_roles': roles})


@placement_bp.route('/resources/<category>', methods=['GET'])
@jwt_required()
def resources(category):
    if category not in RESOURCES:
        return jsonify({'error': 'Category not found', 'available': list(RESOURCES.keys())}), 404
    return jsonify({'category': category, 'resources': RESOURCES[category]})
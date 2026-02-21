from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Assessment, Progress

assessment_bp = Blueprint('assessment', __name__)

QUESTION_BANK = {
    "aptitude": [
        {"id": 1, "topic": "quantitative", "question": "If 5x + 3 = 23, find x.", "options": ["4","3","5","2"], "answer": "4"},
        {"id": 2, "topic": "quantitative", "question": "A train travels 360 km in 4 hrs. Speed?", "options": ["80","90","100","70"], "answer": "90"},
        {"id": 3, "topic": "logical", "question": "Next in series: 2, 6, 12, 20, ?", "options": ["28","30","32","26"], "answer": "30"},
        {"id": 4, "topic": "logical", "question": "All A are B. Some B are C. Then?", "options": ["All A are C","Some A are C","No A are C","Cannot determine"], "answer": "Cannot determine"},
        {"id": 5, "topic": "verbal", "question": "Synonym of Eloquent?", "options": ["Fluent","Silent","Angry","Confused"], "answer": "Fluent"},
        {"id": 6, "topic": "verbal", "question": "Choose the correct sentence:", "options": ["She don't know","She doesn't knows","She doesn't know","She not knows"], "answer": "She doesn't know"},
    ],
    "technical": [
        {"id": 7,  "topic": "python",     "question": "Which keyword defines a function in Python?", "options": ["func","def","define","function"], "answer": "def"},
        {"id": 8,  "topic": "python",     "question": "Output of print(type([]))?", "options": ["<class 'list'>","<class 'tuple'>","list","array"], "answer": "<class 'list'>"},
        {"id": 9,  "topic": "dbms",       "question": "Which SQL command retrieves data?", "options": ["INSERT","SELECT","UPDATE","DELETE"], "answer": "SELECT"},
        {"id": 10, "topic": "os",         "question": "Which is NOT an OS?", "options": ["Linux","Windows","Oracle","macOS"], "answer": "Oracle"},
        {"id": 11, "topic": "dsa",        "question": "Time complexity of binary search?", "options": ["O(n)","O(log n)","O(n^2)","O(1)"], "answer": "O(log n)"},
        {"id": 12, "topic": "networking", "question": "HTTP default port?", "options": ["21","22","80","443"], "answer": "80"},
    ],
    "soft_skill": [
        {"id": 13, "topic": "communication",   "question": "Best approach to resolve team conflict?", "options": ["Ignore it","Escalate immediately","Open discussion","Avoid the person"], "answer": "Open discussion"},
        {"id": 14, "topic": "time_management", "question": "Which technique helps prioritise tasks?", "options": ["Pomodoro","Eisenhower Matrix","GTD","All of the above"], "answer": "All of the above"},
        {"id": 15, "topic": "leadership",      "question": "A good leader should primarily?", "options": ["Command","Inspire","Demand","Control"], "answer": "Inspire"},
    ]
}

@assessment_bp.route('/questions/<assessment_type>', methods=['GET'])
def get_questions(assessment_type):
    if assessment_type not in QUESTION_BANK:
        return jsonify({'error': 'Invalid type'}), 400
    questions = [{k: v for k, v in q.items() if k != 'answer'} for q in QUESTION_BANK[assessment_type]]
    return jsonify({'questions': questions})

@assessment_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_assessment():
    # AFTER
    uid = int(get_jwt_identity())
    # uid  = get_jwt_identity()
    data = request.get_json()
    assessment_type = data.get('type')
    answers = data.get('answers', {})
    if assessment_type not in QUESTION_BANK:
        return jsonify({'error': 'Invalid type'}), 400
    bank = QUESTION_BANK[assessment_type]
    topic_score = {}
    correct = 0
    for q in bank:
        topic = q['topic']
        user_ans = answers.get(str(q['id']))
        if user_ans == q['answer']:
            correct += 1
            topic_score[topic] = topic_score.get(topic, 0) + 1
    total = len(bank)
    percentage = round((correct / total) * 100, 2)
    db.session.add(Assessment(user_id=uid, type=assessment_type, scores=topic_score, total_score=correct, max_score=total, percentage=percentage))
    prog = Progress.query.filter_by(user_id=uid).first()
    if prog:
        if assessment_type == 'aptitude': prog.aptitude_score = percentage
        elif assessment_type == 'technical': prog.skill_score = percentage
        prog.placement_readiness = round((prog.skill_score*0.4)+(prog.aptitude_score*0.3)+(prog.resume_score*0.2)+(prog.roadmap_completion*0.1), 2)
    db.session.commit()
    return jsonify({'score': correct, 'total': total, 'percentage': percentage, 'topic_scores': topic_score})


# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from extensions import db
# from models import Assessment, Progress

# assessment_bp = Blueprint('assessment', __name__)
# # assessment_bp = Blueprint('assessment', __name__)
# # ---------- Question bank (embedded for simplicity) ----------
# QUESTION_BANK = {
#     "aptitude": [
#         {"id": 1, "topic": "quantitative", "question": "If 5x + 3 = 23, find x.", "options": ["4","3","5","2"], "answer": "4"},
#         {"id": 2, "topic": "quantitative", "question": "A train travels 360 km in 4 hrs. Speed?", "options": ["80","90","100","70"], "answer": "90"},
#         {"id": 3, "topic": "logical",      "question": "Next in series: 2, 6, 12, 20, ?", "options": ["28","30","32","26"], "answer": "30"},
#         {"id": 4, "topic": "logical",      "question": "All A are B. Some B are C. Then?", "options": ["All A are C","Some A are C","No A are C","Cannot determine"], "answer": "Cannot determine"},
#         {"id": 5, "topic": "verbal",       "question": "Synonym of 'Eloquent'?", "options": ["Fluent","Silent","Angry","Confused"], "answer": "Fluent"},
#         {"id": 6, "topic": "verbal",       "question": "Choose the correct sentence:", "options": ["She don't know","She doesn't knows","She doesn't know","She not knows"], "answer": "She doesn't know"},
#     ],
#     "technical": [
#         {"id": 7,  "topic": "python",    "question": "Which keyword defines a function in Python?", "options": ["func","def","define","function"], "answer": "def"},
#         {"id": 8,  "topic": "python",    "question": "Output of print(type([]))?", "options": ["<class 'list'>","<class 'tuple'>","list","array"], "answer": "<class 'list'>"},
#         {"id": 9,  "topic": "dbms",      "question": "Which SQL command retrieves data?", "options": ["INSERT","SELECT","UPDATE","DELETE"], "answer": "SELECT"},
#         {"id": 10, "topic": "os",        "question": "Which is NOT an OS?", "options": ["Linux","Windows","Oracle","macOS"], "answer": "Oracle"},
#         {"id": 11, "topic": "dsa",       "question": "Time complexity of binary search?", "options": ["O(n)","O(log n)","O(n²)","O(1)"], "answer": "O(log n)"},
#         {"id": 12, "topic": "networking","question": "HTTP default port?", "options": ["21","22","80","443"], "answer": "80"},
#     ],
#     "soft_skill": [
#         {"id": 13, "topic": "communication",  "question": "Best approach to resolve team conflict?", "options": ["Ignore it","Escalate immediately","Open discussion","Avoid the person"], "answer": "Open discussion"},
#         {"id": 14, "topic": "time_management","question": "Which technique helps prioritise tasks?", "options": ["Pomodoro","Eisenhower Matrix","GTD","All of the above"], "answer": "All of the above"},
#         {"id": 15, "topic": "leadership",     "question": "A good leader should primarily?", "options": ["Command","Inspire","Demand","Control"], "answer": "Inspire"},
#     ]
# }

# # @assessment_bp.route('/questions/<assessment_type>', methods=['GET'])
# @assessment_bp.route('/questions/<assessment_type>', methods=['GET'])
# # def get_questions(assessment_type):
# def get_questions(assessment_type):
#     if assessment_type not in QUESTION_BANK:
#         return jsonify({'error': 'Invalid assessment type'}), 400
#     questions = [{k: v for k, v in q.items() if k != 'answer'}
#                  for q in QUESTION_BANK[assessment_type]]
#     return jsonify({'questions': questions})


# @assessment_bp.route('/submit', methods=['POST'])
# @jwt_required()

# def submit_assessment():
#     uid  = get_jwt_identity()
#     data = request.get_json()
#     assessment_type = data.get('type')
#     answers         = data.get('answers', {})   # {question_id: chosen_option}

#     if assessment_type not in QUESTION_BANK:
#         return jsonify({'error': 'Invalid assessment type'}), 400

#     bank        = QUESTION_BANK[assessment_type]
#     topic_score = {}
#     topic_count = {}
#     correct     = 0

#     for q in bank:
#         topic = q['topic']
#         topic_count[topic] = topic_count.get(topic, 0) + 1
#         user_ans = answers.get(str(q['id']))
#         if user_ans == q['answer']:
#             correct += 1
#             topic_score[topic] = topic_score.get(topic, 0) + 1

#     total      = len(bank)
#     percentage = round((correct / total) * 100, 2)

#     assessment = Assessment(
#         user_id     = uid,
#         type        = assessment_type,
#         scores      = topic_score,
#         total_score = correct,
#         max_score   = total,
#         percentage  = percentage
#     )
#     db.session.add(assessment)

#     # Update progress
#     prog = Progress.query.filter_by(user_id=uid).first()
#     if prog:
#         if assessment_type == 'aptitude':
#             prog.aptitude_score = percentage
#         elif assessment_type == 'technical':
#             prog.skill_score = percentage
#         _recalculate_readiness(prog)

#     db.session.commit()
#     return jsonify({
#         'score'       : correct,
#         'total'       : total,
#         'percentage'  : percentage,
#         'topic_scores': topic_score
#     })


# @assessment_bp.route('/history', methods=['GET'])
# @jwt_required()
# def history():
#     uid = get_jwt_identity()
#     records = Assessment.query.filter_by(user_id=uid).order_by(Assessment.taken_at.desc()).all()
#     return jsonify([{
#         'id': r.id, 'type': r.type, 'percentage': r.percentage,
#         'scores': r.scores, 'taken_at': r.taken_at.isoformat()
#     } for r in records])


# def _recalculate_readiness(prog):
#     prog.placement_readiness = round(
#         (prog.skill_score * 0.4) +
#         (prog.aptitude_score * 0.3) +
#         (prog.resume_score * 0.2) +
#         (prog.roadmap_completion * 0.1), 2
#     )
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Assessment, Progress, Question, User
import random
import csv
import io
from functools import wraps
assessment_bp = Blueprint('assessment', __name__)

# ── Admin required decorator ───────────────────────────────────
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        uid  = int(get_jwt_identity())
        user = User.query.get(uid)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required. Students cannot access this.'}), 403
        return fn(*args, **kwargs)
    return wrapper

# ── ADMIN: Upload questions via CSV ───────────────────────────
@assessment_bp.route('/upload-questions', methods=['POST'])
@admin_required  
def upload_questions():
    """
    CSV format (no header row needed, just data):
    test_type, topic, level, question, option_a, option_b, option_c, option_d, answer, source

    Example row:
    aptitude, Percentages, easy, What is 20% of 150?, 25, 30, 35, 20, 30, indiabix
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file    = request.files['file']
    content = file.read().decode('utf-8')
    reader  = csv.reader(io.StringIO(content))

    added   = 0
    skipped = 0
    errors  = []

    for i, row in enumerate(reader, 1):
        # Skip header row if present
        if i == 1 and row[0].strip().lower() in ['test_type', 'type']:
            continue
        if len(row) < 9:
            errors.append(f"Row {i}: insufficient columns ({len(row)} found, need 9)")
            continue
        try:
            q = Question(
                test_type = row[0].strip().lower(),
                topic     = row[1].strip(),
                level     = row[2].strip().lower(),
                question  = row[3].strip(),
                option_a  = row[4].strip(),
                option_b  = row[5].strip(),
                option_c  = row[6].strip(),
                option_d  = row[7].strip(),
                answer    = row[8].strip(),
                source    = row[9].strip() if len(row) > 9 else 'csv'
            )
            db.session.add(q)
            added += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")
            skipped += 1

    db.session.commit()
    return jsonify({
        'message': f'{added} questions added, {skipped} skipped',
        'errors': errors[:10]
    }), 201


# ── ADMIN: Add single question ─────────────────────────────────
@assessment_bp.route('/add-question', methods=['POST'])
@admin_required  
def add_question():
    data = request.get_json()
    required = ['test_type','topic','level','question','option_a','option_b','option_c','option_d','answer']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing fields', 'required': required}), 400

    q = Question(**{k: data[k] for k in required}, source=data.get('source','manual'))
    db.session.add(q)
    db.session.commit()
    return jsonify({'message': 'Question added', 'id': q.id}), 201


# ── ADMIN: Get all topics ──────────────────────────────────────
@assessment_bp.route('/topics/<test_type>', methods=['GET'])
@admin_required  
def get_topics(test_type):
    topics = db.session.query(Question.topic).filter_by(test_type=test_type).distinct().all()
    return jsonify({'topics': [t[0] for t in topics]})


# ── ADMIN: Stats ───────────────────────────────────────────────
@assessment_bp.route('/stats', methods=['GET'])
@admin_required  
def stats():
    result = {}
    for test_type in ['aptitude', 'technical', 'soft_skill']:
        total  = Question.query.filter_by(test_type=test_type).count()
        topics = db.session.query(Question.topic, db.func.count(Question.id))\
                           .filter_by(test_type=test_type)\
                           .group_by(Question.topic).all()
        result[test_type] = {
            'total': total,
            'topics': {t: c for t, c in topics}
        }
    return jsonify(result)

@assessment_bp.route('/questions/<test_type>', methods=['GET'])
def get_questions(test_type):
    level  = request.args.get('level', 'all')
    topic  = request.args.get('topic', 'all')
    count  = int(request.args.get('count', 10))
    skip   = int(request.args.get('skip', 0))      # ← ADD THIS

    query = Question.query.filter_by(test_type=test_type)
    if level != 'all':
        query = query.filter_by(level=level)
    if topic != 'all':
        query = query.filter_by(topic=topic)

    all_qs   = query.all()
    total_db = len(all_qs)

    if total_db == 0:
        return jsonify({'error': 'No questions found', 'total': 0}), 404

    # For topic tests use skip to get specific set
    # For general test use random sample
    if topic != 'all' and skip > 0:
        sliced   = all_qs[skip: skip + count]       # ← specific test set
        selected = sliced if sliced else all_qs[:count]
    else:
        selected = random.sample(all_qs, min(count, total_db))  # ← random

    questions = [{
        'id'      : q.id,
        'topic'   : q.topic,
        'level'   : q.level,
        'question': q.question,
        'options' : [q.option_a, q.option_b, q.option_c, q.option_d]
    } for q in selected]

    return jsonify({'questions': questions, 'total': len(questions), 'available': total_db})
# # ── STUDENT: Get questions ─────────────────────────────────────
# @assessment_bp.route('/questions/<test_type>', methods=['GET'])
# def get_questions(test_type):
#     level  = request.args.get('level', 'all')
#     topic  = request.args.get('topic', 'all')
#     count  = int(request.args.get('count', 10))

#     query = Question.query.filter_by(test_type=test_type)
#     if level != 'all':
#         query = query.filter_by(level=level)
#     if topic != 'all':
#         query = query.filter_by(topic=topic)

#     all_qs   = query.all()
#     total_db = len(all_qs)

#     if total_db == 0:
#         return jsonify({'error': 'No questions found for this filter. Please upload questions first.', 'total': 0}), 404

#     selected = random.sample(all_qs, min(count, total_db))
#     questions = [{
#         'id'      : q.id,
#         'topic'   : q.topic,
#         'level'   : q.level,
#         'question': q.question,
#         'options' : [q.option_a, q.option_b, q.option_c, q.option_d]
#     } for q in selected]

#     return jsonify({'questions': questions, 'total': len(questions), 'available': total_db})


# ── STUDENT: Submit ────────────────────────────────────────────
@assessment_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_assessment():
    uid             = int(get_jwt_identity())
    data            = request.get_json()
    test_type       = data.get('type')
    answers         = data.get('answers', {})   # {question_id: chosen_option}

    if not answers:
        return jsonify({'error': 'No answers submitted'}), 400

    q_ids     = [int(k) for k in answers.keys()]
    questions = Question.query.filter(Question.id.in_(q_ids)).all()
    q_map     = {q.id: q for q in questions}

    topic_correct = {}
    topic_total   = {}
    correct       = 0

    for qid_str, user_ans in answers.items():
        qid = int(qid_str)
        q   = q_map.get(qid)
        if not q:
            continue
        topic_total[q.topic]   = topic_total.get(q.topic, 0) + 1
        topic_correct[q.topic] = topic_correct.get(q.topic, 0)
        if user_ans.strip() == q.answer.strip():
            correct += 1
            topic_correct[q.topic] += 1

    total      = len(answers)
    percentage = round((correct / total) * 100, 2)

    topic_percentage = {
        t: round((topic_correct.get(t, 0) / topic_total[t]) * 100, 1)
        for t in topic_total
    }

    db.session.add(Assessment(
        user_id=uid, type=test_type,
        scores=topic_percentage,
        total_score=correct, max_score=total, percentage=percentage
    ))

    prog = Progress.query.filter_by(user_id=uid).first()
    if prog:
        if test_type == 'aptitude':
            prog.aptitude_score = percentage
        elif test_type == 'technical':
            prog.skill_score = percentage
        prog.placement_readiness = round(
            (prog.skill_score * 0.4) + (prog.aptitude_score * 0.3) +
            (prog.resume_score * 0.2) + (prog.roadmap_completion * 0.1), 2
        )
    db.session.commit()

    return jsonify({
        'score'       : correct,
        'total'       : total,
        'percentage'  : percentage,
        'topic_scores': topic_percentage
    })


# ── STUDENT: History ───────────────────────────────────────────
@assessment_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    uid     = int(get_jwt_identity())
    records = Assessment.query.filter_by(user_id=uid).order_by(Assessment.taken_at.desc()).all()
    return jsonify([{
        'id'        : r.id,
        'type'      : r.type,
        'percentage': r.percentage,
        'scores'    : r.scores,
        'taken_at'  : r.taken_at.isoformat()
    } for r in records])

# ── Topic question counts ──────────────────────────────────────
@assessment_bp.route('/topic-counts/<test_type>', methods=['GET'])
def topic_counts(test_type):
    topics = db.session.query(
        Question.topic,
        db.func.count(Question.id)
    ).filter_by(test_type=test_type).group_by(Question.topic).all()
    return jsonify({t: c for t, c in topics})




# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from extensions import db
# from models import Assessment, Progress

# assessment_bp = Blueprint('assessment', __name__)

# QUESTION_BANK = {
#     "aptitude": [
#         {"id": 1, "topic": "quantitative", "question": "If 5x + 3 = 23, find x.", "options": ["4","3","5","2"], "answer": "4"},
#         {"id": 2, "topic": "quantitative", "question": "A train travels 360 km in 4 hrs. Speed?", "options": ["80","90","100","70"], "answer": "90"},
#         {"id": 3, "topic": "logical", "question": "Next in series: 2, 6, 12, 20, ?", "options": ["28","30","32","26"], "answer": "30"},
#         {"id": 4, "topic": "logical", "question": "All A are B. Some B are C. Then?", "options": ["All A are C","Some A are C","No A are C","Cannot determine"], "answer": "Cannot determine"},
#         {"id": 5, "topic": "verbal", "question": "Synonym of Eloquent?", "options": ["Fluent","Silent","Angry","Confused"], "answer": "Fluent"},
#         {"id": 6, "topic": "verbal", "question": "Choose the correct sentence:", "options": ["She don't know","She doesn't knows","She doesn't know","She not knows"], "answer": "She doesn't know"},
#     ],
#     "technical": [
#         {"id": 7,  "topic": "python",     "question": "Which keyword defines a function in Python?", "options": ["func","def","define","function"], "answer": "def"},
#         {"id": 8,  "topic": "python",     "question": "Output of print(type([]))?", "options": ["<class 'list'>","<class 'tuple'>","list","array"], "answer": "<class 'list'>"},
#         {"id": 9,  "topic": "dbms",       "question": "Which SQL command retrieves data?", "options": ["INSERT","SELECT","UPDATE","DELETE"], "answer": "SELECT"},
#         {"id": 10, "topic": "os",         "question": "Which is NOT an OS?", "options": ["Linux","Windows","Oracle","macOS"], "answer": "Oracle"},
#         {"id": 11, "topic": "dsa",        "question": "Time complexity of binary search?", "options": ["O(n)","O(log n)","O(n^2)","O(1)"], "answer": "O(log n)"},
#         {"id": 12, "topic": "networking", "question": "HTTP default port?", "options": ["21","22","80","443"], "answer": "80"},
#     ],
#     "soft_skill": [
#         {"id": 13, "topic": "communication",   "question": "Best approach to resolve team conflict?", "options": ["Ignore it","Escalate immediately","Open discussion","Avoid the person"], "answer": "Open discussion"},
#         {"id": 14, "topic": "time_management", "question": "Which technique helps prioritise tasks?", "options": ["Pomodoro","Eisenhower Matrix","GTD","All of the above"], "answer": "All of the above"},
#         {"id": 15, "topic": "leadership",      "question": "A good leader should primarily?", "options": ["Command","Inspire","Demand","Control"], "answer": "Inspire"},
#     ]
# }

# @assessment_bp.route('/questions/<assessment_type>', methods=['GET'])
# def get_questions(assessment_type):
#     if assessment_type not in QUESTION_BANK:
#         return jsonify({'error': 'Invalid type'}), 400
#     questions = [{k: v for k, v in q.items() if k != 'answer'} for q in QUESTION_BANK[assessment_type]]
#     return jsonify({'questions': questions})

# @assessment_bp.route('/submit', methods=['POST'])
# @jwt_required()
# def submit_assessment():
#     # AFTER
#     uid = int(get_jwt_identity())
#     # uid  = get_jwt_identity()
#     data = request.get_json()
#     assessment_type = data.get('type')
#     answers = data.get('answers', {})
#     if assessment_type not in QUESTION_BANK:
#         return jsonify({'error': 'Invalid type'}), 400
#     bank = QUESTION_BANK[assessment_type]
#     topic_score = {}
#     correct = 0
#     for q in bank:
#         topic = q['topic']
#         user_ans = answers.get(str(q['id']))
#         if user_ans == q['answer']:
#             correct += 1
#             topic_score[topic] = topic_score.get(topic, 0) + 1
#     total = len(bank)
#     percentage = round((correct / total) * 100, 2)
#     db.session.add(Assessment(user_id=uid, type=assessment_type, scores=topic_score, total_score=correct, max_score=total, percentage=percentage))
#     prog = Progress.query.filter_by(user_id=uid).first()
#     if prog:
#         if assessment_type == 'aptitude': prog.aptitude_score = percentage
#         elif assessment_type == 'technical': prog.skill_score = percentage
#         prog.placement_readiness = round((prog.skill_score*0.4)+(prog.aptitude_score*0.3)+(prog.resume_score*0.2)+(prog.roadmap_completion*0.1), 2)
#     db.session.commit()
#     return jsonify({'score': correct, 'total': total, 'percentage': percentage, 'topic_scores': topic_score})


# # from flask import Blueprint, request, jsonify
# # from flask_jwt_extended import jwt_required, get_jwt_identity
# # from extensions import db
# # from models import Assessment, Progress

# # assessment_bp = Blueprint('assessment', __name__)
# # # assessment_bp = Blueprint('assessment', __name__)
# # # ---------- Question bank (embedded for simplicity) ----------
# # QUESTION_BANK = {
# #     "aptitude": [
# #         {"id": 1, "topic": "quantitative", "question": "If 5x + 3 = 23, find x.", "options": ["4","3","5","2"], "answer": "4"},
# #         {"id": 2, "topic": "quantitative", "question": "A train travels 360 km in 4 hrs. Speed?", "options": ["80","90","100","70"], "answer": "90"},
# #         {"id": 3, "topic": "logical",      "question": "Next in series: 2, 6, 12, 20, ?", "options": ["28","30","32","26"], "answer": "30"},
# #         {"id": 4, "topic": "logical",      "question": "All A are B. Some B are C. Then?", "options": ["All A are C","Some A are C","No A are C","Cannot determine"], "answer": "Cannot determine"},
# #         {"id": 5, "topic": "verbal",       "question": "Synonym of 'Eloquent'?", "options": ["Fluent","Silent","Angry","Confused"], "answer": "Fluent"},
# #         {"id": 6, "topic": "verbal",       "question": "Choose the correct sentence:", "options": ["She don't know","She doesn't knows","She doesn't know","She not knows"], "answer": "She doesn't know"},
# #     ],
# #     "technical": [
# #         {"id": 7,  "topic": "python",    "question": "Which keyword defines a function in Python?", "options": ["func","def","define","function"], "answer": "def"},
# #         {"id": 8,  "topic": "python",    "question": "Output of print(type([]))?", "options": ["<class 'list'>","<class 'tuple'>","list","array"], "answer": "<class 'list'>"},
# #         {"id": 9,  "topic": "dbms",      "question": "Which SQL command retrieves data?", "options": ["INSERT","SELECT","UPDATE","DELETE"], "answer": "SELECT"},
# #         {"id": 10, "topic": "os",        "question": "Which is NOT an OS?", "options": ["Linux","Windows","Oracle","macOS"], "answer": "Oracle"},
# #         {"id": 11, "topic": "dsa",       "question": "Time complexity of binary search?", "options": ["O(n)","O(log n)","O(n²)","O(1)"], "answer": "O(log n)"},
# #         {"id": 12, "topic": "networking","question": "HTTP default port?", "options": ["21","22","80","443"], "answer": "80"},
# #     ],
# #     "soft_skill": [
# #         {"id": 13, "topic": "communication",  "question": "Best approach to resolve team conflict?", "options": ["Ignore it","Escalate immediately","Open discussion","Avoid the person"], "answer": "Open discussion"},
# #         {"id": 14, "topic": "time_management","question": "Which technique helps prioritise tasks?", "options": ["Pomodoro","Eisenhower Matrix","GTD","All of the above"], "answer": "All of the above"},
# #         {"id": 15, "topic": "leadership",     "question": "A good leader should primarily?", "options": ["Command","Inspire","Demand","Control"], "answer": "Inspire"},
# #     ]
# # }

# # # @assessment_bp.route('/questions/<assessment_type>', methods=['GET'])
# # @assessment_bp.route('/questions/<assessment_type>', methods=['GET'])
# # # def get_questions(assessment_type):
# # def get_questions(assessment_type):
# #     if assessment_type not in QUESTION_BANK:
# #         return jsonify({'error': 'Invalid assessment type'}), 400
# #     questions = [{k: v for k, v in q.items() if k != 'answer'}
# #                  for q in QUESTION_BANK[assessment_type]]
# #     return jsonify({'questions': questions})


# # @assessment_bp.route('/submit', methods=['POST'])
# # @jwt_required()

# # def submit_assessment():
# #     uid  = get_jwt_identity()
# #     data = request.get_json()
# #     assessment_type = data.get('type')
# #     answers         = data.get('answers', {})   # {question_id: chosen_option}

# #     if assessment_type not in QUESTION_BANK:
# #         return jsonify({'error': 'Invalid assessment type'}), 400

# #     bank        = QUESTION_BANK[assessment_type]
# #     topic_score = {}
# #     topic_count = {}
# #     correct     = 0

# #     for q in bank:
# #         topic = q['topic']
# #         topic_count[topic] = topic_count.get(topic, 0) + 1
# #         user_ans = answers.get(str(q['id']))
# #         if user_ans == q['answer']:
# #             correct += 1
# #             topic_score[topic] = topic_score.get(topic, 0) + 1

# #     total      = len(bank)
# #     percentage = round((correct / total) * 100, 2)

# #     assessment = Assessment(
# #         user_id     = uid,
# #         type        = assessment_type,
# #         scores      = topic_score,
# #         total_score = correct,
# #         max_score   = total,
# #         percentage  = percentage
# #     )
# #     db.session.add(assessment)

# #     # Update progress
# #     prog = Progress.query.filter_by(user_id=uid).first()
# #     if prog:
# #         if assessment_type == 'aptitude':
# #             prog.aptitude_score = percentage
# #         elif assessment_type == 'technical':
# #             prog.skill_score = percentage
# #         _recalculate_readiness(prog)

# #     db.session.commit()
# #     return jsonify({
# #         'score'       : correct,
# #         'total'       : total,
# #         'percentage'  : percentage,
# #         'topic_scores': topic_score
# #     })


# # @assessment_bp.route('/history', methods=['GET'])
# # @jwt_required()
# # def history():
# #     uid = get_jwt_identity()
# #     records = Assessment.query.filter_by(user_id=uid).order_by(Assessment.taken_at.desc()).all()
# #     return jsonify([{
# #         'id': r.id, 'type': r.type, 'percentage': r.percentage,
# #         'scores': r.scores, 'taken_at': r.taken_at.isoformat()
# #     } for r in records])


# # def _recalculate_readiness(prog):
# #     prog.placement_readiness = round(
# #         (prog.skill_score * 0.4) +
# #         (prog.aptitude_score * 0.3) +
# #         (prog.resume_score * 0.2) +
# #         (prog.roadmap_completion * 0.1), 2
# #     )
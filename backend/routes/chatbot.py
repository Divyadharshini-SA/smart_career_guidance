from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.chatbot_service import ChatbotService

chatbot_bp = Blueprint('chatbot', __name__)
service    = ChatbotService()


@chatbot_bp.route('/ask', methods=['POST'])
@jwt_required()
def ask():
    uid     = int(get_jwt_identity())
    data    = request.get_json()
    message = data.get('message', '').strip()

    if not message:
        return jsonify({'error': 'Empty message'}), 400

    response = service.get_response(uid, message)
    return jsonify({'response': response})


@chatbot_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    uid = int(get_jwt_identity())
    return jsonify({'history': service.get_history(uid)})
from flask import Flask
from flask_cors import CORS
from extensions import db, jwt, bcrypt
from config import Config

# Import routes (matching YOUR actual file names)
from routes.auth       import auth_bp
from routes.profile    import profile_bp
from routes.assessment import assessment_bp
from routes.resume     import resume_bp
from routes.career     import career_bp
from routes.roadmap    import roadmap_bp
from routes.placement  import placement_bp
from routes.chatbot    import chatbot_bp
from routes.progress   import progress_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Force JWT config
    app.config['JWT_SECRET_KEY'] = 'smart-career-jwt-secret-key-minimum-32-chars-2024'
    app.config['JWT_ALGORITHM']  = 'HS256'

    # Init extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp,       url_prefix='/api/auth')
    app.register_blueprint(profile_bp,    url_prefix='/api/profile')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessment')
    app.register_blueprint(resume_bp,     url_prefix='/api/resume')
    app.register_blueprint(career_bp,     url_prefix='/api/career')
    app.register_blueprint(roadmap_bp,    url_prefix='/api/roadmap')
    app.register_blueprint(placement_bp,  url_prefix='/api/placement')
    app.register_blueprint(chatbot_bp,    url_prefix='/api/chatbot')
    app.register_blueprint(progress_bp,   url_prefix='/api/progress')

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)


# from flask import Flask
# from flask_cors import CORS
# from extensions import db, jwt, bcrypt
# from config import Config

# # Import routes
# from routes.auth import auth_bp
# from routes.profile import profile_bp
# from routes.assessment import assessment_bp
# from routes.resume import resume_bp
# from routes.career import career_bp
# from routes.roadmap import roadmap_bp
# from routes.placement import placement_bp
# from routes.chatbot import chatbot_bp
# from routes.progress import progress_bp

# def create_app():
#     app = Flask(__name__)
#     app.config.from_object(Config)

#     # Init extensions
#     CORS(app, resources={r"/api/*": {"origins": "*"}})
#     db.init_app(app)
#     jwt.init_app(app)
#     bcrypt.init_app(app)

#     # Register blueprints
#     app.register_blueprint(auth_bp,       url_prefix='/api/auth')
#     app.register_blueprint(profile_bp,    url_prefix='/api/profile')
#     app.register_blueprint(assessment_bp, url_prefix='/api/assessment')
#     app.register_blueprint(resume_bp,     url_prefix='/api/resume')
#     app.register_blueprint(career_bp,     url_prefix='/api/career')
#     app.register_blueprint(roadmap_bp,    url_prefix='/api/roadmap')
#     app.register_blueprint(placement_bp,  url_prefix='/api/placement')
#     app.register_blueprint(chatbot_bp,    url_prefix='/api/chatbot')
#     app.register_blueprint(progress_bp,   url_prefix='/api/progress')

#     with app.app_context():
#         db.create_all()

#     return app

# if __name__ == '__main__':
#     app = create_app()
#     app.run(debug=True, host='0.0.0.0', port=5000)
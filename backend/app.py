from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
import os
import uuid
from datetime import datetime, timedelta
from openai import OpenAI
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
import json
from flask_migrate import Migrate
from sqlalchemy import func, desc, distinct


load_dotenv(dotenv_path="./.env")

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quizzes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://192.168.0.174:3000",
    "https://quizgenie-8be1.onrender.com"
]}}, supports_credentials=True)

# Initialize database
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Add this to your models section
tags = db.Table('quiz_tags',
    db.Column('quiz_id', db.String(36), db.ForeignKey('quizzes.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

class Tag(db.Model):
    __tablename__ = 'tags'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    category = db.Column(db.String(50))  # Optional: for grouping tags
    
    def __repr__(self):
        return f'<Tag {self.name}>'

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    
    id = db.Column(db.String(36), primary_key=True)
    original_text = db.Column(db.Text, nullable=False)
    quiz_content = db.Column(db.Text, nullable=False)
    quiz_type = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    is_public = db.Column(db.Boolean, default=True)
    title = db.Column(db.String(200), default='Interactive Quiz')
    description = db.Column(db.String(500), default='Test your knowledge with this interactive quiz')
    difficulty = db.Column(db.String(20))
    plays = db.Column(db.Integer, default=0)  # Add this line
    rating = db.Column(db.Float, default=0.0)  # Also add rating if not present
    
    # Relationships
    tags = db.relationship('Tag', secondary=tags, lazy='subquery',
                         backref=db.backref('quizzes', lazy=True))
    # Add to Quiz model
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('quizzes', lazy=True))
    def to_dict(self):
        return {
            'id': self.id,
            'original_text': self.original_text,
            'quiz_content': self.quiz_content,
            'quiz_type': self.quiz_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_public': self.is_public,
            'title': self.title,
            'description': self.description,
            'difficulty': self.difficulty,
            'plays': self.plays,
            'rating': self.rating,
            'user_id': self.user_id,
            'tags': [tag.name for tag in self.tags]  # Assuming Tag has a 'name' attribute
        }
    def __repr__(self):
        return f'<Quiz {self.id}>'
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_score = db.Column(db.Integer, default=0)  # Add this field
    badge = db.Column(db.String(50), default='Member')  # Add this field
    
# Add these models to track quiz attempts
class QuizAttempt(db.Model):
    __tablename__ = 'quiz_attempts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.String(36), db.ForeignKey('quizzes.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    time_spent = db.Column(db.String(20))  # Format: "MM:SS"
    user_answers = db.Column(db.Text)  # JSON string of all user answers
    details = db.Column(db.Text)  # JSON string of evaluation details
    
    # Relationships
    user = db.relationship('User', backref=db.backref('attempts', lazy=True))
    quiz = db.relationship('Quiz', backref=db.backref('attempts', lazy=True))
    
    def __repr__(self):
        return f'<QuizAttempt {self.id} - User {self.user_id} - Quiz {self.quiz_id}>'


# ---------------------------------------------------------------------------
# 1) Runs ONCE when each Gunicorn worker starts (before it serves requests)
# ---------------------------------------------------------------------------
@app.before_serving               # <— replaces @app.before_first_request
def initialise():
    """Create tables & seed initial data right before the worker begins."""
    with app.app_context():       # safe even inside the hook
        db.create_all()           # create tables if they don't exist
        seed_database()           # any custom seeding logic

def seed_database():
    """Example seeding function — tweak to your needs."""
    from models import User       # import inside function to avoid circular deps

    if not User.query.first():    # only seed if DB is empty
        admin = User(username="admin", email="admin@example.com")
        db.session.add(admin)
        db.session.commit()

# ---------------------------------------------------------------------------
# 2) (Optional) Runs when the worker is shutting down
# ---------------------------------------------------------------------------
@app.after_serving
def shutdown():
    """Clean-up tasks after the worker stops accepting requests."""
    db.session.remove()           # close DB session, release connections


@app.route('/verify-token', methods=['GET'])
def verify_token():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        print("Missing or malformed Authorization header")  # Debug
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(' ')[1]
    try:
        decoded = jwt.decode(
            token,
            app.config['SECRET_KEY'],  # Use same key as login
            algorithms=["HS256"]
        )
        print("Decoded token:", decoded)  # Debug
        
        user = User.query.get(decoded['id'])
        if not user:
            print("User not found for ID:", decoded['id'])  # Debug
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        })
        
    except jwt.ExpiredSignatureError:
        print("Token expired")  # Debug
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError as e:
        print("Invalid token:", str(e))  # Debug
        return jsonify({"error": "Invalid token"}), 401

# JWT Required decorator (optional, for protecting other endpoints)
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header missing or invalid'}), 401
            
        token = auth_header.split(' ')[1]
        
        try:
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(decoded['id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated
# Initialize OpenAI
client = OpenAI()
@app.route('/generate-quiz', methods=['POST'])
@token_required
def generate_quiz(current_user):
    """Generate quiz from user input text with all metadata (title, description, difficulty)"""
    data = request.json
    text = data.get('text')
    
    quiz_type = data.get('type', 'mcq')
    num_questions = data.get('num_questions', 5)
    is_public = data.get('is_public', True)  # Default to True if not provided

    if not text:
        return jsonify({'error': 'Text input is required'}), 400

    try:
        # Comprehensive prompt for full quiz generation
        combined_prompt = f"""
        Generate a complete quiz package from the following passage:

        Passage:
        \"\"\"{text}\"\"\"

        Requirements:
        1. Title: Create a unique, descriptive title (5-8 words)
        2. Description: Write a compelling description (1-2 sentences, max 30 words)
        3. Quiz: Create {num_questions} {quiz_type.upper()} questions
        4. Tags: Generate 3-5 relevant tags
        5. Difficulty: Determine appropriate level (Easy, Medium, Hard) based on:
           - Question complexity
           - Required prior knowledge
           - Conceptual difficulty

        Output format (STRICTLY FOLLOW THIS JSON STRUCTURE):
        {{
            "title": "Generated quiz title",
            "description": "Generated description",
            "quiz": [
                {{
                    "question": "...",
                    "options": ["...", "...", "...", "..."],
                    "answer": "...",
                    "explanation": "...",
                    "difficulty": "Easy/Medium/Hard"  # Per-question difficulty
                }}
            ],
            "tags": ["tag1", "tag2"],
            "overall_difficulty": "Easy/Medium/Hard"  # Comprehensive difficulty
        }}

        Guidelines:
        - Difficulty Assessment:
          * Easy: Basic recall, straightforward questions
          * Medium: Requires some analysis/application
          * Hard: Complex reasoning or specialized knowledge
        - Be consistent between per-question and overall difficulty
        - For mixed difficulty quizzes, weight toward most common level
        """

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": combined_prompt}],
            temperature=0.7
        )

        result = json.loads(response.choices[0].message.content.strip())
        
        # Extract all generated components
        quiz_data = result['quiz']
        suggested_tags = result['tags']
        title = result['title']
        description = result['description']
        difficulty = result['overall_difficulty']  # Using comprehensive difficulty

        # Calculate average difficulty if you want to be precise
        if all('difficulty' in q for q in quiz_data):
            difficulty_levels = {'Easy': 1, 'Medium': 2, 'Hard': 3}
            avg_score = sum(difficulty_levels[q.get('difficulty', 'Medium')] for q in quiz_data)/len(quiz_data)
            difficulty = ('Easy' if avg_score < 1.5 else 
                         'Medium' if avg_score < 2.5 else 'Hard')

        # Save to database
        quiz_id = str(uuid.uuid4())
        new_quiz = Quiz(
            id=quiz_id,
            original_text=text,
            quiz_content=json.dumps(quiz_data),
            quiz_type=quiz_type,
            created_at=datetime.utcnow(),
            is_public=is_public,  # Use the is_public from request
            title=title,
            description=description,
            difficulty=difficulty,
            user_id=current_user.id
        )

        # Process tags
        for tag_name in suggested_tags:
            tag = Tag.query.filter_by(name=tag_name.lower().strip()).first() or \
                  Tag(name=tag_name.lower().strip())
            new_quiz.tags.append(tag)

        db.session.add(new_quiz)
        db.session.commit()

        return jsonify({
            'quiz_id': quiz_id,
            'content': quiz_data,
            'metadata': {
                'title': title,
                'description': description,
                'difficulty': difficulty,
                'tags': suggested_tags,
                'is_public': is_public,  # Include in response
                'creator_id': current_user.id
            },
            'shareable_url': f'/quiz/{quiz_id}'
        })

    except Exception as e:
        current_app.logger.error(f"Quiz generation failed: {str(e)}")
        return jsonify({'error': f"Quiz generation failed: {str(e)}"}), 500  
    

@app.route('/quiz/<quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    """Retrieve a quiz by its ID"""
    quiz = Quiz.query.get_or_404(quiz_id)
    
    return jsonify({
        'id': quiz.id,
        'title': quiz.title,
        'description': quiz.description,
        'content': json.loads(quiz.quiz_content),
        'type': quiz.quiz_type,
        'created_at': quiz.created_at.isoformat()
    })

@app.route('/submit-quiz', methods=['POST'])
@token_required
def submit_quiz(current_user):
    data = request.json
    quiz_id = data.get('quiz_id')
    answers = data.get('answers')
    time_spent = data.get('time_spent', '00:00')  # Default if not provided
    
    if not quiz_id or not answers:
        return jsonify({'error': 'Missing quiz ID or answers'}), 400
    
    quiz = Quiz.query.get_or_404(quiz_id)
    quiz_content = json.loads(quiz.quiz_content)
    
    evaluation = []
    correct_count = 0
    
    # Increment play count for the quiz
    quiz.plays = (quiz.plays or 0) + 1
    
    for i, question in enumerate(quiz_content):
        user_answer_raw = answers.get(str(i), '')
        user_answer = str(user_answer_raw).strip()
        correct_answer = str(question['answer']).strip()
        
        is_correct = False
        explanation = question.get('explanation', '')
        verdict = "exact match"  # Default for MCQ
        
        if quiz.quiz_type == 'mcq':
            is_correct = user_answer.lower() == correct_answer.lower()
        else:
            # Use ChatGPT to evaluate short answers
            prompt = (
                f"Question: {question['question']}\n"
                f"Correct Answer: {correct_answer}\n"
                f"User's Answer: {user_answer}\n\n"
                "Determine if the user's answer is correct, partially correct, or incorrect. "
                "Reply with JSON format like: {\"verdict\": \"correct\" | \"partial\" | \"incorrect\", \"reason\": \"...\"}"
            )
            
            try:
                chat_response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0,
                    response_format={"type": "json_object"}  # Ensure JSON response
                )
                
                if chat_response.choices:
                    reply_content = chat_response.choices[0].message.content.strip()
                    try:
                        result_json = json.loads(reply_content)
                        verdict = result_json.get("verdict", "incorrect").lower()
                        is_correct = verdict in ["correct", "partial"]
                        explanation = result_json.get("reason", explanation)
                    except json.JSONDecodeError:
                        current_app.logger.error(f"Failed to parse GPT response: {reply_content}")
            except Exception as e:
                current_app.logger.error(f"GPT evaluation failed: {str(e)}")

        if is_correct:
            correct_count += 1

        evaluation.append({
            'question': question['question'],
            'user_answer': user_answer_raw,
            'correct_answer': correct_answer,
            'is_correct': is_correct,
            'verdict': verdict,
            'explanation': explanation
        })
    
    score = (correct_count / len(quiz_content)) * 100
    
    # Create and save the quiz attempt
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score,
        correct_answers=correct_count,
        total_questions=len(quiz_content),
        time_spent=time_spent,
        user_answers=json.dumps(answers),
        details=json.dumps(evaluation)
    )
    
    # Update user's total score (simple implementation)
    current_user.total_score = (current_user.total_score or 0) + score
    
    # Update quiz rating (simple average)
    if quiz.rating:
        quiz.rating = (quiz.rating + score) / 2
    else:
        quiz.rating = score
    
    db.session.add(attempt)
    db.session.commit()
    
    return jsonify({
        'evaluation': evaluation,
        'score': score,
        'correct_count': correct_count,
        'total_questions': len(quiz_content),
        'quiz_type': quiz.quiz_type,
        'attempt_id': attempt.id,
        'new_plays_count': quiz.plays,
        'new_rating': quiz.rating
    })

@app.route('/api/attempts/<quiz_id>', methods=['GET'])
@token_required
def get_quiz_attempts(current_user, quiz_id):
    """Get all attempts for a specific quiz by the current user"""
    attempts = QuizAttempt.query.filter_by(
        user_id=current_user.id,
        quiz_id=quiz_id
    ).order_by(QuizAttempt.completed_at.desc()).all()
    
    attempts_data = []
    for attempt in attempts:
        attempts_data.append({
            'id': attempt.id,
            'score': attempt.score,
            'correct_answers': attempt.correct_answers,
            'total_questions': attempt.total_questions,
            'completed_at': attempt.completed_at.isoformat(),
            'time_spent': attempt.time_spent,
            'details': json.loads(attempt.details) if attempt.details else None
        })
    
    return jsonify(attempts_data)

@app.route('/api/attempts/user/recent', methods=['GET'])
@token_required
def get_recent_attempts(current_user):
    """Get recent attempts across all quizzes"""
    attempts = QuizAttempt.query.filter_by(
        user_id=current_user.id
    ).order_by(QuizAttempt.completed_at.desc()).limit(10).all()
    
    attempts_data = []
    for attempt in attempts:
        attempts_data.append({
            'id': attempt.id,
            'quiz_id': attempt.quiz_id,
            'quiz_title': attempt.quiz.title if attempt.quiz else 'Deleted Quiz',
            'score': attempt.score,
            'completed_at': attempt.completed_at.isoformat(),
            'time_spent': attempt.time_spent
        })
    
    return jsonify(attempts_data)

# Auth routes
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    
    hashed_password = generate_password_hash(data['password'])  # uses default pbkdf2:sha256
    
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully!'})
    except:
        return jsonify({'message': 'Username or email already exists!'}), 400

@app.route('/login', methods=['POST'])
def login():
    auth = request.json
    
    if not auth or not auth['username'] or not auth['password']:
        return jsonify({'message': 'Could not verify'}), 404
    
    user = User.query.filter_by(username=auth['username']).first()
    
    if not user:
        return jsonify({'message': 'Username or password is incorrect!'}), 404
    
    print(user)
    
    if check_password_hash(user.password, auth['password']):
        token = jwt.encode({
            'id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    
    
    return jsonify({'message': 'Wrong password!'}), 401

@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    print("\n=== New Request ===")
    
    # Get filter parameters
    search = request.args.get('search', '')
    category = request.args.get('category', 'all')
    difficulty = request.args.get('difficulty', 'all')
    sort = request.args.get('sort', 'trending')
    tags = request.args.get('tags', '')
    
    print(f"Filters - search: '{search}', category: '{category}', difficulty: '{difficulty}', sort: '{sort}', tags: '{tags}'")

    # Base query
    query = Quiz.query.filter_by(is_public=False)
    print(f"\nInitial query count: {query.count()}")

    for q in query:
        print(q.is_public)
    
    # Apply filters
    if search:
        query = query.filter(db.or_(
            Quiz.title.ilike(f'%{search}%'),
            Quiz.description.ilike(f'%{search}%')
        ))
    
    if difficulty != 'all':
        query = query.filter_by(difficulty=difficulty)
    
    # Tag filtering - only if tags are specified
    if tags:
        tag_list = [tag.strip().lower() for tag in tags.split(',') if tag.strip()]
        if tag_list:
            query = query.join(Quiz.tags).filter(Tag.name.in_(tag_list))
    
    # Apply sorting
    if sort == 'trending':
        query = query.order_by(Quiz.plays.desc())
    elif sort == 'newest':
        query = query.order_by(Quiz.created_at.desc())
    elif sort == 'top-rated':
        query = query.order_by(Quiz.rating.desc())
    
    print(f"\nQuery after filters: {query}")
    
    # Execute query
    quizzes = Quiz.query.filter_by(is_public=True)  # Remove distinct() temporarily for debugging
    
    # Debug: print raw quiz data
    for i, quiz in enumerate(quizzes):
        print(f"\nQuiz {i+1}:")
        print(f"ID: {quiz.id}")
        print(f"Title: {quiz.title}")
        print(f"Content length: {len(quiz.quiz_content)}")
        print(f"Tags: {[tag.name for tag in quiz.tags]}")
        
    
    # Serialize
    quizzes_data = []
    for quiz in quizzes:
        try:
            quiz_data = {
                'id': quiz.id,
                'title': quiz.title,
                'description': quiz.description,
                'difficulty': quiz.difficulty,
                'plays': quiz.plays,
                'createdAt': quiz.created_at.isoformat(),
                'isPublic': quiz.is_public,
                'tags': [tag.name for tag in quiz.tags],
                'questionCount': len(json.loads(quiz.quiz_content)) if quiz.quiz_content else 0
            }
            quizzes_data.append(quiz_data)
        except Exception as e:
            print(f"Failed to serialize quiz {quiz.id}: {str(e)}")
            continue
    
    print(f"\nSuccessfully serialized {len(quizzes_data)} quizzes")
    return jsonify(quizzes_data)

# Protected route example
@app.route('/protected', methods=['GET'])
@token_required
def protected(current_user):  # Note the current_user parameter
    return jsonify({'message': f'Hello {current_user.username}! This is a protected route.'})

@app.route('/routes')
def list_routes():
    return jsonify({
        'routes': [str(rule) for rule in app.url_map.iter_rules()] 
    })

@app.route('/get-user-data', methods=['GET'])
@token_required
def get_user_data(current_user):
    """Get comprehensive user data including full quiz details for created and taken quizzes"""
    try:
        print(f"Getting data for user ID: {current_user.id}")
        
        # 1. Basic user info
        user_info = {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'created_at': current_user.created_at.isoformat(),
            'total_score': getattr(current_user, 'total_score', 0),
            'badge': getattr(current_user, 'badge', 'Member')
        }
        
        # 2. Get created quizzes with full details and participants
        created_quizzes = []
        try:
            user_quizzes = Quiz.query.filter_by(user_id=current_user.id)\
                         .order_by(Quiz.created_at.desc())\
                         .all()
            
            for quiz in user_quizzes:
                # Get quiz attempts/participants with detailed info
                attempts = QuizAttempt.query.filter_by(quiz_id=quiz.id)\
                          .order_by(QuizAttempt.completed_at.desc())\
                          .all()
                
                participants = []
                total_score_sum = 0
                for attempt in attempts:
                    participant_data = {
                        'username': attempt.user.username if attempt.user else 'Anonymous',
                        'score': attempt.score,
                        'completed_at': attempt.completed_at.isoformat() if attempt.completed_at else None,
                        'completedAt': attempt.completed_at.isoformat() if attempt.completed_at else None,
                        'timeSpent': attempt.time_spent,
                        'correct_answers': attempt.correct_answers,
                        'total_questions': attempt.total_questions
                        
                    }
                    participants.append(participant_data)
                    total_score_sum += attempt.score
                
                # Calculate average score for this quiz
                average_score = total_score_sum / len(participants) if participants else 0
                
                # Parse questions count safely
                question_count = 0
                quiz_content = []
                try:
                    quiz_content = json.loads(quiz.quiz_content) if quiz.quiz_content else []
                    question_count = len(quiz_content)
                except json.JSONDecodeError:
                    print(f"Error parsing quiz content for quiz {quiz.id}")
                    question_count = 0
                
                # Extract category from quiz content or use default
                category = getattr(quiz, 'category', None)
                if not category and quiz_content:
                    # Try to infer category from tags or use default
                    category = 'General'
                
                created_quiz_data = {
                    'id': quiz.id,
                    'title': quiz.title or 'Untitled Quiz',
                    'description': quiz.description or 'No description available',
                    'difficulty': quiz.difficulty or 'Medium',
                    'category': category or 'General',
                    'plays': quiz.plays or 0,
                    'rating': quiz.rating or 0,
                    'created_at': quiz.created_at.isoformat(),
                    'createdAt': quiz.created_at.isoformat(),
                    'questions': question_count,
                    'recent_attempts': participants,  # <-- UPDATE THIS LINE
                    'averageScore': round(average_score, 1),
                    'totalAttempts': len(participants),
                    'tags': [tag.name for tag in quiz.tags] if quiz.tags else [],
                    'is_public': quiz.is_public,
                    'quiz_type': quiz.quiz_type
                }

                created_quizzes.append(created_quiz_data)
                
        except Exception as e:
            print(f"Error getting created quizzes: {str(e)}")
            created_quizzes = []
        
        # 3. Get taken quizzes with FULL quiz details extracted from quiz_id
        taken_quizzes = []
        try:
            # Get all attempts by the user, ordered by most recent
            attempts = QuizAttempt.query.filter_by(user_id=current_user.id)\
                      .order_by(QuizAttempt.completed_at.desc())\
                      .all()
            
            for attempt in attempts:
                quiz = attempt.quiz
                if quiz:  # Only include if quiz exists
                    # Parse quiz content to get question count and other details
                    question_count = 0
                    try:
                        quiz_content = json.loads(quiz.quiz_content) if quiz.quiz_content else []
                        question_count = len(quiz_content)
                    except json.JSONDecodeError:
                        question_count = attempt.total_questions or 0
                    
                    taken_quiz_data = {
                        'id': attempt.id,
                        'quiz_id': quiz.id,
                        'title': quiz.title,
                        'description': quiz.description,
                        'creator': quiz.user.username if quiz.user else 'System',
                        'category': getattr(quiz, 'category', 'General'),
                        'difficulty': quiz.difficulty,
                        'question_count': question_count,
                        'score': attempt.score,
                        'correct_answers': attempt.correct_answers,
                        'questions': attempt.total_questions,
                        'completed_at': attempt.completed_at.isoformat(),
                        'time_spent': attempt.time_spent,
                        'rating': quiz.rating,
                        'plays': quiz.plays,
                        'created_at': quiz.created_at.isoformat(),
                        'quiz_type': quiz.quiz_type,
                        'tags': [tag.name for tag in quiz.tags] if quiz.tags else [],
                    }
                    taken_quizzes.append(taken_quiz_data)
                    
        except Exception as e:
            print(f"Error getting taken quizzes: {str(e)}")
            taken_quizzes = []
        
        # 4. Calculate comprehensive statistics
        total_created_plays = sum(quiz['plays'] for quiz in created_quizzes)
        total_user_attempts = len(QuizAttempt.query.filter_by(user_id=current_user.id).all())
        
        # Calculate average score across all attempts (not just unique quizzes)
        all_attempts = QuizAttempt.query.filter_by(user_id=current_user.id).all()
        average_score = sum(attempt.score for attempt in all_attempts) / len(all_attempts) if all_attempts else 0
        
        stats = {
            'quizzesCreated': len(created_quizzes),
            'quizzesTaken': len(taken_quizzes),  # Unique quizzes taken
            'totalPlays': total_created_plays,  # Total plays on quizzes they created
            'totalAttempts': total_user_attempts,  # Total attempts by user
            'averageScore': round(average_score, 1)
        }
        
        # 5. Calculate rank
        try:
            user_count = User.query.count()
            rank = db.session.query(
                func.count(User.id)
            ).filter(
                User.total_score > current_user.total_score
            ).scalar() + 1
        except Exception as e:
            print(f"Error calculating rank: {str(e)}")
            rank = user_count if 'user_count' in locals() else 1
        
        response_data = {
            'user': {
                **user_info,
                'stats': stats,
                'createdQuizzes': created_quizzes,
                'takenQuizzes': taken_quizzes,
                'rank': rank,
            },
            
            'success': True
        }
        
        print(f"Returning enhanced data: Created={len(created_quizzes)}, Taken={len(taken_quizzes)}")
        return jsonify(response_data)
        
    except Exception as e:
        current_app.logger.error(f"Error in get_user_data: {str(e)}", exc_info=True)
        print(f"Full error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e),
            'success': False,
            'user': {
                'createdQuizzes': [],
                'takenQuizzes': [],
                'stats': {
                    'quizzesCreated': 0,
                    'quizzesTaken': 0,
                    'totalPlays': 0,
                    'totalAttempts': 0,
                    'averageScore': 0
                }
            }
        }), 500

# Additional endpoint to get detailed quiz attempt history for a specific quiz
@app.route('/api/quiz/<quiz_id>/attempts', methods=['GET'])
@token_required
def get_quiz_attempt_history(current_user, quiz_id):
    """Get all attempts by current user for a specific quiz"""
    try:
        attempts = QuizAttempt.query.filter_by(
            user_id=current_user.id,
            quiz_id=quiz_id
        ).order_by(QuizAttempt.completed_at.desc()).all()
        
        attempts_data = []
        for attempt in attempts:
            attempt_data = {
                'id': attempt.id,
                'score': attempt.score,
                'correct_answers': attempt.correct_answers,
                'total_questions': attempt.total_questions,
                'completed_at': attempt.completed_at.isoformat(),
                'time_spent': attempt.time_spent,
                'details': json.loads(attempt.details) if attempt.details else None,
                'user_answers': json.loads(attempt.user_answers) if attempt.user_answers else None
            }
            attempts_data.append(attempt_data)
        
        return jsonify({
            'success': True,
            'attempts': attempts_data,
            'total_attempts': len(attempts_data),
            'best_score': max(attempt['score'] for attempt in attempts_data) if attempts_data else 0
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint to get detailed quiz information by ID
@app.route('/api/quiz/<quiz_id>/details', methods=['GET'])
def get_quiz_details(quiz_id):
    """Get comprehensive quiz details including content and statistics"""
    try:
        quiz = Quiz.query.get_or_404(quiz_id)
        
        # Parse quiz content
        quiz_content = []
        try:
            quiz_content = json.loads(quiz.quiz_content) if quiz.quiz_content else []
        except json.JSONDecodeError:
            quiz_content = []
        
        # Get attempt statistics
        attempts = QuizAttempt.query.filter_by(quiz_id=quiz_id).all()
        total_attempts = len(attempts)
        average_score = sum(attempt.score for attempt in attempts) / total_attempts if attempts else 0
        
        # Get recent attempts (last 10)
        recent_attempts = QuizAttempt.query.filter_by(quiz_id=quiz_id)\
                         .order_by(QuizAttempt.completed_at.desc())\
                         .limit(10).all()
        
        recent_attempts_data = []
        for attempt in recent_attempts:
            recent_attempts_data.append({
                'username': attempt.user.username if attempt.user else 'Anonymous',
                'score': attempt.score,
                'completed_at': attempt.completed_at.isoformat(),
                'time_spent': attempt.time_spent
            })
        
        quiz_details = {
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'difficulty': quiz.difficulty,
            'category': getattr(quiz, 'category', 'General'),
            'creator': quiz.user.username if quiz.user else 'System',
            'created_at': quiz.created_at.isoformat(),
            'is_public': quiz.is_public,
            'quiz_type': quiz.quiz_type,
            'questions': quiz_content,
            'question_count': len(quiz_content),
            'tags': [tag.name for tag in quiz.tags] if quiz.tags else [],
            'statistics': {
                'total_attempts': total_attempts,
                'total_plays': quiz.plays or 0,
                'average_score': round(average_score, 1),
                'rating': quiz.rating or 0
            },
            'recent_attempts': recent_attempts_data
        }
        
        return jsonify({
            'success': True,
            'quiz': quiz_details
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
# Helper function to extract quiz metadata
def extract_quiz_metadata(quiz):
    """Extract comprehensive metadata from a quiz object"""
    if not quiz:
        return {
            'title': 'Deleted Quiz',
            'description': 'This quiz is no longer available',
            'difficulty': 'Unknown',
            'category': 'Unknown',
            'question_count': 0,
            'creator': 'Unknown',
            'tags': [],
            'is_public': False,
            'quiz_type': 'mcq'
        }
    
    # Parse quiz content safely
    question_count = 0
    try:
        quiz_content = json.loads(quiz.quiz_content) if quiz.quiz_content else []
        question_count = len(quiz_content)
    except (json.JSONDecodeError, TypeError):
        question_count = 0
    
    return {
        'title': quiz.title or 'Untitled Quiz',
        'description': quiz.description or 'No description available',
        'difficulty': quiz.difficulty or 'Medium', 
        'category': getattr(quiz, 'category', 'General'),
        'question_count': question_count,
        'creator': quiz.user.username if quiz.user else 'System',
        'tags': [tag.name for tag in quiz.tags] if quiz.tags else [],
        'is_public': quiz.is_public,
        'quiz_type': quiz.quiz_type,
        'rating': quiz.rating or 0,
        'total_plays': quiz.plays or 0,
        'created_at': quiz.created_at.isoformat() if quiz.created_at else None
    }

# Enhanced endpoint for user's quiz history with full details
@app.route('/api/user/quiz-history', methods=['GET'])
@token_required  
def get_user_quiz_history(current_user):
    """Get user's complete quiz history with full quiz details"""
    try:
        # Get filter parameters
        filter_type = request.args.get('type', 'all')  # 'created', 'taken', or 'all'
        limit = int(request.args.get('limit', 50))
        
        result = {
            'success': True,
            'created_quizzes': [],
            'taken_quizzes': [],
            'summary': {}
        }
        
        if filter_type in ['created', 'all']:
            # Get created quizzes with participant data
            created_quizzes = Quiz.query.filter_by(user_id=current_user.id)\
                            .order_by(Quiz.created_at.desc())\
                            .limit(limit).all()
            
            for quiz in created_quizzes:
                # Get all attempts for this quiz
                attempts = QuizAttempt.query.filter_by(quiz_id=quiz.id)\
                          .order_by(QuizAttempt.completed_at.desc()).all()
                
                # Calculate statistics
                total_attempts = len(attempts)
                avg_score = sum(attempt.score for attempt in attempts) / total_attempts if attempts else 0
                
                # Get recent participants (last 5)
                recent_participants = []
                for attempt in attempts[:5]:
                    recent_participants.append({
                        'username': attempt.user.username if attempt.user else 'Anonymous',
                        'score': attempt.score,
                        'completed_at': attempt.completed_at.isoformat(),
                        'time_spent': attempt.time_spent
                    })
                
                quiz_metadata = extract_quiz_metadata(quiz)
                quiz_data = {
                    'id': quiz.id,
                    **quiz_metadata,
                    'statistics': {
                        'total_attempts': total_attempts,
                        'average_score': round(avg_score, 1),
                        'plays': quiz.plays or 0
                    },
                    'recent_participants': recent_participants,
                    'created_at': quiz.created_at.isoformat()
                }
                result['created_quizzes'].append(quiz_data)
        
        if filter_type in ['taken', 'all']:
            # Get taken quizzes with attempt details
            attempts = QuizAttempt.query.filter_by(user_id=current_user.id)\
                      .order_by(QuizAttempt.completed_at.desc())\
                      .limit(limit).all()
            
            # Group by quiz to get unique quizzes with best scores
            quiz_attempts = {}
            for attempt in attempts:
                quiz_id = attempt.quiz_id
                if quiz_id not in quiz_attempts:
                    quiz_attempts[quiz_id] = {
                        'attempts': [],
                        'best_score': attempt.score,
                        'latest_attempt': attempt,
                        'quiz': attempt.quiz
                    }
                
                quiz_attempts[quiz_id]['attempts'].append(attempt)
                if attempt.score > quiz_attempts[quiz_id]['best_score']:
                    quiz_attempts[quiz_id]['best_score'] = attempt.score
            
            # Format taken quizzes data
            for quiz_id, data in quiz_attempts.items():
                quiz = data['quiz']
                latest_attempt = data['latest_attempt']
                all_attempts = data['attempts']
                
                quiz_metadata = extract_quiz_metadata(quiz)
                taken_quiz_data = {
                    'id': quiz_id,
                    **quiz_metadata,
                    'attempt_data': {
                        'latest_score': latest_attempt.score,
                        'best_score': data['best_score'],
                        'total_attempts': len(all_attempts),
                        'latest_completed_at': latest_attempt.completed_at.isoformat(),
                        'latest_time_spent': latest_attempt.time_spent,
                        'correct_answers': latest_attempt.correct_answers,
                        'total_questions': latest_attempt.total_questions
                    },
                    'all_attempts': [
                        {
                            'id': att.id,
                            'score': att.score,
                            'completed_at': att.completed_at.isoformat(),
                            'time_spent': att.time_spent,
                            'correct_answers': att.correct_answers,
                            'total_questions': att.total_questions
                        }
                        for att in all_attempts
                    ]
                }
                result['taken_quizzes'].append(taken_quiz_data)
        
        # Add summary statistics
        result['summary'] = {
            'total_created': len(result['created_quizzes']),
            'total_taken': len(result['taken_quizzes']),
            'total_attempts': QuizAttempt.query.filter_by(user_id=current_user.id).count(),
            'average_score': round(
                db.session.query(func.avg(QuizAttempt.score))
                .filter_by(user_id=current_user.id)
                .scalar() or 0, 1
            )
        }
        
        return jsonify(result)
        
    except Exception as e:
        current_app.logger.error(f"Error in get_user_quiz_history: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'created_quizzes': [],
            'taken_quizzes': [],
            'summary': {}
        }), 500

# Endpoint to get quiz performance analytics
@app.route('/api/quiz/<quiz_id>/analytics', methods=['GET'])
@token_required
def get_quiz_analytics(current_user, quiz_id):
    """Get detailed analytics for a quiz (only for quiz owner)"""
    try:
        quiz = Quiz.query.filter_by(id=quiz_id, user_id=current_user.id).first()
        if not quiz:
            return jsonify({'success': False, 'error': 'Quiz not found or access denied'}), 404
        
        # Get all attempts
        attempts = QuizAttempt.query.filter_by(quiz_id=quiz_id)\
                  .order_by(QuizAttempt.completed_at.desc()).all()
        
        if not attempts:
            return jsonify({
                'success': True,
                'analytics': {
                    'total_attempts': 0,
                    'unique_users': 0,
                    'average_score': 0,
                    'score_distribution': {},
                    'difficulty_analysis': 'No data available',
                    'time_analysis': {},
                    'recent_attempts': []
                }
            })
        
        # Calculate analytics
        total_attempts = len(attempts)
        unique_users = len(set(attempt.user_id for attempt in attempts))
        average_score = sum(attempt.score for attempt in attempts) / total_attempts
        
        # Score distribution
        score_ranges = {'0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0}
        for attempt in attempts:
            score = attempt.score
            if score <= 20:
                score_ranges['0-20'] += 1
            elif score <= 40:
                score_ranges['21-40'] += 1
            elif score <= 60:
                score_ranges['41-60'] += 1
            elif score <= 80:
                score_ranges['61-80'] += 1
            else:
                score_ranges['81-100'] += 1
        
        # Time analysis
        time_data = []
        for attempt in attempts:
            if attempt.time_spent and ':' in attempt.time_spent:
                try:
                    minutes, seconds = map(int, attempt.time_spent.split(':'))
                    total_seconds = minutes * 60 + seconds
                    time_data.append(total_seconds)
                except ValueError:
                    continue
        
        time_analysis = {}
        if time_data:
            time_analysis = {
                'average_time_seconds': sum(time_data) / len(time_data),
                'min_time_seconds': min(time_data),
                'max_time_seconds': max(time_data)
            }
        
        # Recent attempts with user details
        recent_attempts = []
        for attempt in attempts[:10]:
            recent_attempts.append({
                'username': attempt.user.username if attempt.user else 'Anonymous',
                'score': attempt.score,
                'correct_answers': attempt.correct_answers,
                'total_questions': attempt.total_questions,
                'completed_at': attempt.completed_at.isoformat(),
                'time_spent': attempt.time_spent
            })
        
        analytics = {
            'total_attempts': total_attempts,
            'unique_users': unique_users,
            'average_score': round(average_score, 1),
            'score_distribution': score_ranges,
            'time_analysis': time_analysis,
            'recent_attempts': recent_attempts,
            'difficulty_analysis': f"Average score of {round(average_score, 1)}% suggests this quiz is {'Easy' if average_score > 80 else 'Medium' if average_score > 60 else 'Challenging'}"
        }
        
        return jsonify({
            'success': True,
            'analytics': analytics
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/quizzes/created', methods=['GET'])
@token_required
def get_created_quizzes(current_user):
    """Get quizzes created by current user with detailed stats"""
    try:
        quizzes = Quiz.query.filter_by(user_id=current_user.id)\
                   .order_by(Quiz.created_at.desc())\
                   .all()
        
        quizzes_data = []
        for quiz in quizzes:
            # Calculate average score for this quiz
            avg_score = db.session.query(func.avg(QuizAttempt.score))\
                .filter_by(quiz_id=quiz.id)\
                .scalar() or 0
            
            # Get recent attempts (3 most recent)
            recent_attempts = QuizAttempt.query\
                .filter_by(quiz_id=quiz.id)\
                .order_by(QuizAttempt.completed_at.desc())\
                .limit(3)\
                .all()
            
            attempts_data = []
            for attempt in recent_attempts:
                attempts_data.append({
                    'user_id': attempt.user_id,
                    'username': attempt.user.username if attempt.user else 'Anonymous',
                    'score': attempt.score,
                    'date': attempt.completed_at.isoformat()
                })
            
            quizzes_data.append({
                'id': quiz.id,
                'title': quiz.title,
                'description': quiz.description,
                'difficulty': quiz.difficulty,
                'category': quiz.category,
                'plays': quiz.plays,
                'average_score': round(float(avg_score), 1),
                'question_count': len(json.loads(quiz.quiz_content)) if quiz.quiz_content else 0,
                'created_at': quiz.created_at.isoformat(),
                'is_public': quiz.is_public,
                'recent_attempts': attempts_data,
                'tags': [tag.name for tag in quiz.tags]
            })
        
        return jsonify({
            'success': True,
            'quizzes': quizzes_data,
            'count': len(quizzes_data)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/quizzes/<quiz_id>', methods=['PUT', 'GET'])
@token_required
def edit_quiz(current_user, quiz_id):
    quiz = Quiz.query.filter_by(id=quiz_id, user_id=current_user.id).first()
    if not quiz:
        return jsonify({'success': False, 'error': 'Quiz not found'}), 404

    if request.method == 'GET':
        quiz_dict = quiz.to_dict()
        try:
            quiz_dict['quiz_content'] = json.loads(quiz_dict['quiz_content']) if isinstance(quiz_dict['quiz_content'], str) else quiz_dict['quiz_content']
        except Exception:
            quiz_dict['quiz_content'] = []
        return jsonify({'success': True, 'quiz': quiz_dict})

    if request.method == 'PUT':
        try:
            data = request.get_json()
            print(f"Updating quiz {quiz_id}: {data}")

            quiz.title = data.get('title', quiz.title)
            quiz.description = data.get('description', quiz.description)
            quiz.difficulty = data.get('difficulty', quiz.difficulty)
            quiz.is_public = data.get('is_public', quiz.is_public)
            quiz.quiz_content = json.dumps(data.get('quiz_content', []))  # 👈🏽 Important!

            # Handle tags
            if 'tags' in data:
                quiz.tags.clear()
                for tag_name in data['tags']:
                    tag = Tag.query.filter_by(name=tag_name).first()
                    if not tag:
                        tag = Tag(name=tag_name)
                        db.session.add(tag)
                    quiz.tags.append(tag)

            db.session.commit()  # 👈🏽 This is what actually saves it
            print("PUT received for quiz:", quiz_id)
            return jsonify({'success': True, 'quiz': quiz.to_dict()})
        except Exception as e:
            print("Save failed:", str(e))
            return jsonify({'success': False, 'error': 'Save failed', 'details': str(e)}), 500


@app.route('/quizzes/all', methods=['GET'])
@token_required
def get_user_quizzes(current_user):
    """Get all quizzes created by the current user"""
    try:
        # Debug: Print current user info
        print(f"Current user ID: {current_user.id}, Username: {current_user.username}")
        
        # Get quizzes with explicit ordering
        quizzes = Quiz.query.filter_by(user_id=current_user.id)\
                   .order_by(Quiz.created_at.desc())\
                   .all()
        
        # Debug: Print number of quizzes found
        print(f"Found {len(quizzes)} quizzes for user {current_user.id}")
        
        quizzes_data = []
        for quiz in quizzes:
            try:
                # Safely parse quiz content
                quiz_content = json.loads(quiz.quiz_content) if quiz.quiz_content else []
                
                # Get participants with null checks
                participants = []
                for attempt in quiz.participants.order_by(QuizAttempt.completed_at.desc()).limit(5):
                    participants.append({
                        'id': attempt.user_id,
                        'username': attempt.user.username if attempt.user else 'Unknown',
                        'score': attempt.score,
                        'completedAt': attempt.completed_at.isoformat() if attempt.completed_at else None,
                        'timeSpent': attempt.time_spent
                    })
                
                quizzes_data.append({
                    'id': quiz.id,
                    'title': quiz.title,
                    'description': quiz.description,
                    'difficulty': quiz.difficulty,
                    'questions': len(quiz_content),
                    'plays': quiz.plays or 0,
                    'rating': quiz.rating or 0,
                    'createdAt': quiz.created_at.isoformat(),
                    'participants': participants
                })
            except json.JSONDecodeError:
                print(f"Error parsing quiz content for quiz {quiz.id}")
                continue
            except Exception as e:
                print(f"Error processing quiz {quiz.id}: {str(e)}")
                continue
        
        # Ensure we always return a valid response
        return jsonify({
            'success': True,
            'count': len(quizzes_data),
            'quizzes': quizzes_data
        })

    except Exception as e:
        print(f"Error in get_user_quizzes: {str(e)}")
        # Return a proper error response
        return jsonify({
            'success': False,
            'error': 'Failed to fetch quizzes',
            'details': str(e)
        }), 500
    
@app.route('/show-all-quizzes')
def show_quizzes():
    quizzes = Quiz.query.all()
    quizzes_data = [quiz.to_dict() for quiz in quizzes]
    return jsonify(quizzes_data)

@app.route('/api/quizzes/taken', methods=['GET'])
@token_required
def get_taken_quizzes(current_user):
    """Get all quizzes taken by the current user"""
    try:
        attempts = QuizAttempt.query\
            .filter_by(user_id=current_user.id)\
            .order_by(QuizAttempt.completed_at.desc())\
            .all()
        
        taken_quizzes = []
        for attempt in attempts:
            quiz = attempt.quiz
            taken_quizzes.append({
                'id': quiz.id,
                'title': quiz.title,
                'creator': quiz.user.username if quiz.user else 'System',
                'category': quiz.category,
                'difficulty': quiz.difficulty,
                'score': attempt.score,
                'completedAt': attempt.completed_at.isoformat(),
                'timeSpent': attempt.time_spent,
                'rating': quiz.rating,
                'myRating': attempt.user_rating,  # Assuming you have this field
                'questions': attempt.total_questions
            })
        
        return jsonify(taken_quizzes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/quiz-analytics/<quiz_id>', methods=['GET'])
@token_required
def quiz_analytics(current_user, quiz_id):

    quiz = Quiz.query.filter_by(id=quiz_id, user_id=current_user.id).first()
    if not quiz:
        return jsonify({'success': False, 'error': 'Quiz not found'}), 404

    attempts = QuizAttempt.query.filter_by(quiz_id=quiz.id).order_by(desc(QuizAttempt.completed_at)).all()
    total_attempts = len(attempts)
    avg_score = round(sum(a.score for a in attempts) / total_attempts, 1) if attempts else 0

    recent_attempts = [{
        'username': a.user.username if a.user else 'Anonymous',
        'score': a.score,
        'timeSpent': a.time_spent,
        'completedAt': a.completed_at.isoformat() if a.completed_at else None
    } for a in attempts[:10]]

    top_performers = sorted(attempts, key=lambda x: x.score, reverse=True)[:5]
    leaderboard = [{
        'username': a.user.username if a.user else 'Anonymous',
        'score': a.score,
        'completedAt': a.completed_at.isoformat() if a.completed_at else None
    } for a in top_performers]

    return jsonify({
        'success': True,
        'quiz': {
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'difficulty': quiz.difficulty or 'Medium',
            'category': quiz.tags[0].name if quiz.tags else 'General',
            'created_at': quiz.created_at.isoformat(),
            'questionCount': len(json.loads(quiz.quiz_content)) if quiz.quiz_content else 0,
            'tags': [tag.name for tag in quiz.tags],
        },
        'totalAttempts': total_attempts,
        'averageScore': avg_score,
        'recent_attempts': recent_attempts,
        'leaderboard': leaderboard
    })

@app.route('/api/stats', methods=['GET'])
def get_global_stats():
    """Get global statistics for the platform"""
    try:
        # 1. Get total active learners (unique users who have taken quizzes)
        active_learners = db.session.query(
            func.count(distinct(QuizAttempt.user_id))
        ).scalar() or 0
        
        # 2. Get total quizzes created
        quizzes_created = Quiz.query.count()
        
        # 3. Get total questions answered (sum of all questions in all attempts)
        total_questions_answered = db.session.query(
            func.sum(QuizAttempt.total_questions)
        ).scalar() or 0
        
        # 4. Calculate average success rate across all attempts
        avg_success_rate = db.session.query(
            func.avg(QuizAttempt.score)
        ).scalar() or 0
        
        return jsonify({
            'success': True,
            'stats': [
                { 'number': str(active_learners), 'label': "Active Learners" },
                { 'number': str(quizzes_created), 'label': "Quizzes Created" },
                { 'number': str(total_questions_answered), 'label': "Questions Answered" },
                { 'number': f"{round(avg_success_rate, 1)}%", 'label': "Success Rate" }
            ]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'stats': [
                { 'number': "0", 'label': "Active Learners" },
                { 'number': "0", 'label': "Quizzes Created" },
                { 'number': "0", 'label': "Questions Answered" },
                { 'number': "0%", 'label': "Success Rate" }
            ]
        }), 500
    
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    with app.app_context():
        port = int(os.environ.get('PORT', 5000))
        app.run(debug=False, host="0.0.0.0", port=port)

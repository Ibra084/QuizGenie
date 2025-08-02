from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Quiz(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    original_text = db.Column(db.Text, nullable=False)
    quiz_content = db.Column(db.Text, nullable=False)
    quiz_type = db.Column(db.String(20), nullable=False)  # 'mcq' or 'short_answer'
    created_at = db.Column(db.DateTime, nullable=False)
    is_public = db.Column(db.Boolean, default=True)
    
    questions = db.relationship('Question', backref='quiz', lazy=True)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.String(36), db.ForeignKey('quiz.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.Text, nullable=False)
    options = db.Column(db.JSON)  # For MCQs
    explanation = db.Column(db.Text)
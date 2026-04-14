from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS # Added this
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "../frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app) # Enable CORS for smoother deployment

# Note: This resets when the server restarts!
users = {}

@app.route('/')
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route('/dashboard')
def dashboard():
    return send_from_directory(FRONTEND_DIR, "dashboard.html")

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username in users:
        return jsonify({"message": "User already exists"}), 400
    users[username] = password
    return jsonify({"message": "User registered successfully"})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username not in users or users[username] != password:
        return jsonify({"message": "Invalid credentials"}), 401
    return jsonify({"message": "Login successful"})

if __name__ == "__main__":
    # Crucial for Render/Heroku deployment
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
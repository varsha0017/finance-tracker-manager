import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# This finds the current directory where app.py lives
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Since your HTML/CSS/JS files are in the same place as app.py on GitHub,
# we tell Flask that the static folder is right here.
app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")
CORS(app)

# Note: This is an in-memory dictionary. 
# It resets if the Render server restarts!
users = {}

@app.route('/')
def home():
    # Serves index.html from the root folder
    return send_from_directory(BASE_DIR, "index.html")

@app.route('/dashboard')
def dashboard():
    # Serves dashboard.html from the root folder
    return send_from_directory(BASE_DIR, "dashboard.html")

@app.route('/<path:path>')
def static_files(path):
    # This handles style.css, script.js, and any other assets
    return send_from_directory(BASE_DIR, path)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Fields cannot be empty"}), 400

    if username in users:
        return jsonify({"message": "User already exists"}), 400

    users[username] = password
    return jsonify({"message": "User registered successfully"})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username not in users:
        return jsonify({"message": "User not found"}), 404

    if users[username] != password:
        return jsonify({"message": "Wrong password"}), 401

    return jsonify({"message": "Login successful"})

if __name__ == "__main__":
    # This is required for Render deployment to handle the dynamic port
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
import socket
import threading
import json
import os
from flask import Flask, request, render_template_string
from datetime import datetime

HONEPOT_LOG = "logs/honeypot_events.json"
os.makedirs("logs", exist_ok=True)

# Shared list for events
events = []

# Load existing events if any
if os.path.exists(HONEPOT_LOG):
    try:
        with open(HONEPOT_LOG, "r") as f:
            events = json.load(f)
    except:
        events = []

def save_event(event):
    event["timestamp"] = datetime.now().strftime("%H:%M:%S")
    event["date"] = datetime.now().strftime("%Y-%m-%d")
    events.insert(0, event)
    # Keep only last 100 events
    if len(events) > 100:
        events.pop()
    
    with open(HONEPOT_LOG, "w") as f:
        json.dump(events, f, indent=4)

# --- FAKE SSH SERVICE ---
def start_ssh_honeypot(port=2222):
    try:
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind(("0.0.0.0", port))
        server.listen(5)
        print(f">>> Honeypot SSH listening on port {port}...")

        while True:
            client, addr = server.accept()
            ip = addr[0]
            save_event({
                "type": "SSH Connection",
                "ip": ip,
                "details": "Connection established to fake SSH service"
            })
            
            try:
                client.send(b"SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.1\n")
                data = client.recv(1024).decode().strip()
                if data:
                    save_event({
                        "type": "SSH Attempt",
                        "ip": ip,
                        "details": f"Attempted command/payload: {data}"
                    })
                client.send(b"Access denied\n")
            except Exception as e:
                print(f"SSH Honeypot Error during session: {e}")
            finally:
                client.close()
    except Exception as e:
        print(f"!!! CRITICAL: SSH Honeypot failed to start on port {port}: {e}")

# --- FAKE WEB LOGIN ---
honeypot_app = Flask("honeypot_web")

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Admin Login - Secure Portal</title>
    <style>
        body { background: #0f172a; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-card { background: #1e293b; padding: 2rem; rounded: 8px; border: 1px solid #334155; width: 300px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        h2 { text-align: center; color: #38bdf8; }
        input { width: 100%; padding: 0.5rem; margin: 0.5rem 0; background: #0f172a; border: 1px solid #334155; color: white; box-sizing: border-box; }
        button { width: 100%; padding: 0.5rem; background: #0ea5e9; border: none; color: white; font-weight: bold; cursor: pointer; margin-top: 1rem; }
        .error { color: #f87171; font-size: 0.8rem; text-align: center; margin-top: 0.5rem; }
    </style>
</head>
<body>
    <div class="login-card">
        <h2>System Portal</h2>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        {% if error %} <div class="error">Invalid credentials. Access denied.</div> {% endif %}
    </div>
</body>
</html>
"""

@honeypot_app.route("/", methods=["GET", "POST"])
def login():
    error = False
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        ip = request.remote_addr
        
        save_event({
            "type": "Web Login Attempt",
            "ip": ip,
            "details": f"User: {username} | Pass: {password}"
        })
        error = True
        
    return render_template_string(HTML_TEMPLATE, error=error)

def start_web_honeypot(port=8080):
    try:
        print(f">>> Honeypot Web Login listening on port {port}...")
        honeypot_app.run(port=port, host="0.0.0.0", debug=False)
    except Exception as e:
        print(f"!!! CRITICAL: Web Honeypot failed to start on port {port}: {e}")

# --- START THREADS ---
def run_honeypot():
    ssh_thread = threading.Thread(target=start_ssh_honeypot, daemon=True)
    web_thread = threading.Thread(target=start_web_honeypot, daemon=True)
    
    ssh_thread.start()
    web_thread.start()

def get_honeypot_events():
    return events

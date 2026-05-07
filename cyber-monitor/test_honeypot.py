import requests
import socket
import time

def test_web_honeypot():
    print(">>> Testing Web Honeypot (Port 8080)...")
    url = "http://127.0.0.1:8080/"
    data = {"username": "admin_hacker", "password": "password123"}
    try:
        response = requests.post(url, data=data)
        if response.status_code == 200:
            print("Successfully submitted fake login!")
        else:
            print(f"Web honeypot returned status: {response.status_code}")
    except Exception as e:
        print(f"Web honeypot test failed: {e}")

def test_ssh_honeypot():
    print("\n>>> Testing SSH Honeypot (Port 2222)...")
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(("127.0.0.1", 2222))
        banner = s.recv(1024)
        print(f"Received SSH Banner: {banner.decode().strip()}")
        s.send(b"cat /etc/passwd\n")
        response = s.recv(1024)
        print(f"Received SSH Response: {response.decode().strip()}")
        s.close()
    except Exception as e:
        print(f"SSH honeypot test failed: {e}")

if __name__ == "__main__":
    test_web_honeypot()
    time.sleep(1)
    test_ssh_honeypot()

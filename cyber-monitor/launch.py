import urllib.request
import json
import time
import sys

def launch():
    print("\n" + "="*60)
    print("      CYBERSECURE: NEURAL PROTOCOL INITIATOR [MAC OS]")
    print("="*60 + "\n")
    
    print(">> ACCESSING SECURITY KERNEL...")
    time.sleep(0.8)
    
    url = "http://127.0.0.1:5001/api/protocol/activate"
    
    try:
        # Using built-in urllib to avoid 'requests' dependency errors
        req = urllib.request.Request(url, method='POST')
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print(">> KERNEL HANDSHAKE: SUCCESSFUL")
                print(">> INITIATING SYSTEM BOOT...")
                time.sleep(1.2)
                print("\n" + "*"*60)
                print(">>> SUCCESS: PROTOCOL IS LIVE. DASHBOARD IS NOW ACTIVE.")
                print("*"*60 + "\n")
            else:
                print(f">> ERROR: KERNEL REJECTED CONNECTION (STATUS {response.status})")
    except Exception as e:
        print(f">> ERROR: UNABLE TO CONNECT TO MONITOR KERNEL")
        print(f">> Ensure 'sudo python monitor.py' is running in another tab.")

if __name__ == "__main__":
    launch()

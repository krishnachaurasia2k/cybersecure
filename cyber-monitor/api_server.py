from flask import Flask, jsonify
from scapy.all import sniff, IP, TCP, UDP
import threading
import time
from datetime import datetime
from collections import deque
import sys
import os

# Import the user's detector logic
# Ensure we can import from current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from detector import detect_threat

app = Flask(__name__)

# Shared data structures
# Deque to store the last 50 packets for the stream
packets_log = deque(maxlen=50)

# Global stats counter
stats = {
    "totalPackets": 0,
    "tcpTraffic": 0,
    "udpTraffic": 0,
    "threatAlerts": 0
}

def process_packet(packet):
    """Callback for scapy sniff to process each captured packet."""
    if packet.haslayer(IP):
        src = packet[IP].src
        dst = packet[IP].dst
        protocol = "OTHER"
        port = 0

        if packet.haslayer(TCP):
            protocol = "TCP"
            port = packet[TCP].dport
            stats["tcpTraffic"] += 1
        elif packet.haslayer(UDP):
            protocol = "UDP"
            port = packet[UDP].dport
            stats["udpTraffic"] += 1

        stats["totalPackets"] += 1
        
        # Run threat detection
        risk_label = detect_threat(src, protocol, port)
        is_suspicious = risk_label != "Normal"
        
        if is_suspicious:
            stats["threatAlerts"] += 1

        p_data = {
            "id": int(time.time() * 1000) + stats["totalPackets"], # Unique-ish ID
            "time": datetime.now().strftime("%H:%M:%S"),
            "srcIp": src,
            "destIp": dst,
            "protocol": protocol,
            "port": port,
            "risk": "Suspicious" if is_suspicious else "Normal",
            "threatType": risk_label
        }
        
        packets_log.appendleft(p_data)

def start_sniffing():
    """Background task to sniff network traffic."""
    # We use en0 for Mac Wi-Fi usually. 
    # If it fails, scapy usually picks the default interface.
    print(">>> LIVE NETWORK MONITOR STARTING (Press Ctrl+C to stop)")
    print(">>> Sniffing on default interface...")
    try:
        sniff(prn=process_packet, store=False)
    except Exception as e:
        print(f"!!! Error sniffing: {e}")
        print("!!! Try running with sudo if you see permission errors.")

@app.route('/api/packets')
def get_packets():
    """Returns the most recent packets captured."""
    return jsonify(list(packets_log))

@app.route('/api/stats')
def get_stats():
    """Returns real-time network statistics."""
    return jsonify({
        "totalPackets": stats["totalPackets"],
        "tcpTraffic": stats["tcpTraffic"],
        "udpTraffic": stats["udpTraffic"],
        "threatAlerts": stats["threatAlerts"]
    })

if __name__ == '__main__':
    # Start sniffing in a background daemon thread
    sniff_thread = threading.Thread(target=start_sniffing, daemon=True)
    sniff_thread.start()
    
    print(">>> API SERVER running on http://localhost:5000")
    print(">>> Proxied by Vite to /api")
    app.run(port=5000, debug=False, threaded=True)

from scapy.all import sniff, IP, TCP, UDP, DNS, DNSQR
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
import threading
from collections import deque, defaultdict
import time
import sys
import os

# Ensure we can import from current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# User's modules
try:
    from detector import detect_threat
    from storage import setup_log_file, save_log
    from ai_model import predict_traffic
    from responder import take_action, get_blocked_list, get_incident_reports, unblock_ip, blocked_ips
    from honeypot import run_honeypot, get_honeypot_events
except ImportError as e:
    print(f">>> CRITICAL ERROR: Could not import a module: {e}")
    sys.exit(1)

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Shared data structures
packets_log = deque(maxlen=100)
packet_count = defaultdict(int)
auto_defense_enabled = True  # Global flag for automated response
protocol_launched = False   # Global flag for terminal initiation
dns_cache = {}              # IP to Hostname mapping

stats = {
    "totalPackets": 0,
    "tcpTraffic": 0,
    "udpTraffic": 0,
    "threatAlerts": 0
}

@app.route('/api/protocol/status')
def get_protocol_status():
    return jsonify({"launched": protocol_launched})

@app.route('/api/protocol/activate', methods=['POST'])
def activate_protocol():
    global protocol_launched
    protocol_launched = True
    print("\n" + "="*50)
    print(">>> PROTOCOL INITIATED: SYSTEM IS NOW LIVE <<<")
    print("="*50 + "\n")
    return jsonify({"status": "success", "launched": True})

def resolve_ip(ip):
    """Return hostname if in cache, otherwise the IP."""
    return dns_cache.get(ip, ip)

def process_packet(packet):
    global dns_cache
    
    # DNS Resolution Logic: Update cache when we see DNS responses
    if packet.haslayer(DNS) and packet.getlayer(DNS).qr == 1:
        try:
            for i in range(packet[DNS].ancount):
                dns_res = packet[DNS].an[i]
                if dns_res.type == 1: # A record
                    name = dns_res.rrname.decode().strip('.')
                    ip = dns_res.rdata
                    dns_cache[ip] = name
        except:
            pass

    if packet.haslayer(IP):
        time_now = datetime.now().strftime("%H:%M:%S")

        src = packet[IP].src
        dst = packet[IP].dst

        # Use resolved names for display
        src_name = resolve_ip(src)
        dst_name = resolve_ip(dst)

        # Simulated Firewall: Log and Drop packets from blocked IPs (Rate limited)
        if src in blocked_ips:
            stats["totalPackets"] += 1
            stats["threatAlerts"] += 1
            
            # Rate limit logging to 1 per second to avoid crashing the dashboard
            current_time = time.time()
            last_log_time = getattr(process_packet, "last_blocked_log", 0)
            if current_time - last_log_time > 1.0:
                packet_info = {
                    "id": f"{int(current_time * 1000)}-{stats['totalPackets']}",
                    "time": time_now,
                    "srcIp": src_name,
                    "destIp": dst_name,
                    "source_ip": src,
                    "destination_ip": dst,
                    "protocol": "FIREWALL",
                    "port": 0,
                    "risk": "Blocked",
                    "threatType": "Blocked Attempt",
                    "ai_prediction": "Blocked",
                    "ai_score": 100
                }
                packets_log.appendleft(packet_info)
                process_packet.last_blocked_log = current_time
            return

        protocol = "OTHER"
        port = 0

        if packet.haslayer(TCP):
            protocol = "TCP"
            port = packet[TCP].dport
            sport = packet[TCP].sport
            stats["tcpTraffic"] += 1
            # Identify Web Traffic (Check both sides for reliability)
            if port == 443 or sport == 443: protocol = "HTTPS (Web)"
            elif port == 80 or sport == 80: protocol = "HTTP (Web)"
            elif port == 22 or sport == 22: protocol = "SSH (Remote)"
            elif port == 3389 or sport == 3389: protocol = "RDP (Remote)"
        elif packet.haslayer(UDP):
            protocol = "UDP"
            port = packet[UDP].dport
            sport = packet[UDP].sport
            stats["udpTraffic"] += 1
            # Identify Video & System Services (QUIC can use high ports on one side)
            if port == 443 or sport == 443: protocol = "QUIC (Video/Web)"
            elif port == 53 or sport == 53: protocol = "DNS Query"
            elif port == 123 or sport == 123: protocol = "NTP (Time Sync)"
            elif port == 853 or sport == 853: protocol = "DNS-over-TLS"
            elif port == 1900 or sport == 1900: protocol = "SSDP (Discovery)"
            elif port > 30000 and "google" in src_name.lower(): protocol = "QUIC (Video/Web)"

        stats["totalPackets"] += 1
        
        # Threat detection (Rule based)
        risk = detect_threat(src, protocol, port)
        
        # AI Prediction
        packet_count[src] += 1
        try:
            prediction, score = predict_traffic(packet_count[src], port)
        except Exception as e:
            prediction, score = "Error", 0
        
        if risk != "Normal":
            stats["threatAlerts"] += 1

        # This dictionary must have keys expected by both React and storage.py
        packet_info = {
            "id": f"{int(time.time() * 1000)}-{stats['totalPackets']}",
            "time": time_now,
            "srcIp": src_name,
            "destIp": dst_name,
            "source_ip": src,       # For storage.py
            "destination_ip": dst,  # For storage.py
            "protocol": protocol,
            "port": port,
            "risk": "Suspicious" if risk != "Normal" else "Normal",
            "threatType": risk,
            "ai_prediction": prediction,
            "ai_score": score
        }

        packets_log.appendleft(packet_info)
        
        try:
            save_log(packet_info)
            if auto_defense_enabled:
                take_action(packet_info) # Phase 5: Automated Response
        except Exception as e:
            pass

        # Console Output
        print(f"{src_name:<20} {dst_name:<20} {protocol:<12} {port:<6} {risk:<12} AI: {prediction}")

@app.route('/api/packets')
def get_packets():
    return jsonify(list(packets_log))

@app.route('/api/stats')
def get_stats():
    return jsonify({
        "totalPackets": stats["totalPackets"],
        "tcpTraffic": stats["tcpTraffic"],
        "udpTraffic": stats["udpTraffic"],
        "threatAlerts": stats["threatAlerts"]
    })

@app.route('/api/responses')
def get_responses():
    return jsonify(get_blocked_list())

@app.route('/api/responses/unblock', methods=['POST'])
def handle_unblock():
    from flask import request
    data = request.json
    ip = data.get("ip")
    if unblock_ip(ip):
        return jsonify({"status": "success", "message": f"IP {ip} unblocked"})
    return jsonify({"status": "error", "message": "IP not found"}), 404

@app.route('/api/incidents')
def get_incidents():
    return jsonify(get_incident_reports())

@app.route('/api/honeypot/events')
def get_honeypot():
    return jsonify(get_honeypot_events())

@app.route('/api/defense/status')
def get_defense_status():
    return jsonify({"enabled": auto_defense_enabled})

@app.route('/api/defense/toggle', methods=['POST'])
def toggle_defense():
    global auto_defense_enabled
    from flask import request
    data = request.json
    auto_defense_enabled = data.get("enabled", True)
    status_str = "ENABLED" if auto_defense_enabled else "PAUSED"
    print(f">>> SYSTEM: Automated Defense is now {status_str}")
    return jsonify({"status": "success", "enabled": auto_defense_enabled})

def start_monitor():
    setup_log_file()
    print(">>> Phase 2 Threat Detection Started with AI Integration...")
    print(">>> Source IP      Destination IP   Proto  Port   Risk         AI Prediction")
    print("-" * 100)
    # On Mac, 'en0' is usually the active WiFi interface. 
    # Forcing it ensures we capture external web traffic.
    print(">>> Sniffing on interface: en0")
    sniff(iface="en0", prn=process_packet, store=False)

if __name__ == "__main__":
    # Start Monitor thread
    monitor_thread = threading.Thread(target=start_monitor, daemon=True)
    monitor_thread.start()
    
    # Start Honeypot threads
    run_honeypot()
    
    print(">>> Dashboard API available at http://localhost:5001/api/packets")
    app.run(port=5001, debug=False, host='0.0.0.0')

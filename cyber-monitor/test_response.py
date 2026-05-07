from scapy.all import IP, TCP, send
import time
import sys

# Target is localhost where monitor.py is sniffing
target_ip = "127.0.0.1"
# Port 22 is in SUSPICIOUS_PORTS in detector.py
suspicious_port = 22

def trigger_threat():
    print(f">>> Sending suspicious packet to {target_ip}:{suspicious_port}...")
    packet = IP(dst=target_ip)/TCP(dport=suspicious_port)
    send(packet, verbose=False)
    print(">>> Packet sent. Check monitor logs for blocking action.")

if __name__ == "__main__":
    trigger_threat()

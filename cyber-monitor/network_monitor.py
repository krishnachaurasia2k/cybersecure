from scapy.all import sniff, IP, TCP, UDP
import csv
from datetime import datetime
from collections import defaultdict

csv_file = "network_logs.csv"

suspicious_ports = [22, 23, 3389]
packet_count = defaultdict(int)

with open(csv_file, "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow([
        "Time",
        "Source IP",
        "Destination IP",
        "Protocol",
        "Port",
        "Risk"
    ])


def check_risk(source_ip, protocol, port):
    packet_count[source_ip] += 1

    if port in suspicious_ports:
        return "Suspicious Port"

    if packet_count[source_ip] > 50:
        return "High Traffic"

    if protocol == "OTHER":
        return "Unknown Protocol"

    return "Normal"


def process_packet(packet):
    if packet.haslayer(IP):
        time_now = datetime.now().strftime("%H:%M:%S")

        src = packet[IP].src
        dst = packet[IP].dst

        protocol = "OTHER"
        port = "-"

        if packet.haslayer(TCP):
            protocol = "TCP"
            port = packet[TCP].dport

        elif packet.haslayer(UDP):
            protocol = "UDP"
            port = packet[UDP].dport

        risk = check_risk(src, protocol, port)

        print(f"{src:<18} {dst:<18} {protocol:<6} {port:<6} {risk}")

        with open(csv_file, "a", newline="") as file:
            writer = csv.writer(file)
            writer.writerow([time_now, src, dst, protocol, port, risk])


print("Threat Detection Started...")
print("Source IP          Destination IP     Protocol Port   Risk")
print("-" * 70)

sniff(iface="en0", prn=process_packet, store=False)

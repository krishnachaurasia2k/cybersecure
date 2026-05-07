import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Simple training data
data = pd.DataFrame({
    "packet_count": [10, 20, 50, 200, 300],
    "port": [80, 443, 53, 22, 3389],
    "label": ["Normal", "Normal", "Normal", "Attack", "Attack"]
})

X = data[["packet_count", "port"]]
y = data["label"]

model = RandomForestClassifier()
model.fit(X, y)


def predict_traffic(packet_count, port):
    prediction = model.predict([[packet_count, port]])[0]
    prob = model.predict_proba([[packet_count, port]])[0]

    score = max(prob) * 100

    return prediction, round(score, 2)

from flask import Flask, jsonify, render_template, request
from ultralytics import YOLO
import base64
import cv2
import numpy as np

app = Flask(__name__)
model = YOLO("yolov8n.pt")
TARGET_LABELS = {"cat", "dog"}
CONFIDENCE_THRESHOLD = 0.5


def decode_image(data_url: str) -> np.ndarray:
    encoded = data_url.split(",", 1)[1]
    image_bytes = base64.b64decode(encoded)
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    return cv2.imdecode(image_array, cv2.IMREAD_COLOR)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(silent=True) or {}
    frame_data = payload.get("image")

    if not frame_data:
        return jsonify({"error": "Missing image payload."}), 400

    frame = decode_image(frame_data)
    if frame is None:
        return jsonify({"error": "Unable to decode image."}), 400

    result = model(frame, verbose=False)[0]
    detections = []

    for box in result.boxes:
        cls_id = int(box.cls[0])
        label = model.names[cls_id]
        confidence = float(box.conf[0])

        if label in TARGET_LABELS and confidence >= CONFIDENCE_THRESHOLD:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            detections.append(
                {
                    "label": label,
                    "confidence": round(confidence, 3),
                    "bbox": [x1, y1, x2, y2],
                }
            )

    return jsonify({"detections": detections})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

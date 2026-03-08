# Object Detection using YOLOv8 in Python

A modern web-based **cat & dog detector** powered by **YOLOv8**. The app opens a live camera stream in your browser, sends frames to a Flask backend for inference, and overlays real-time bounding boxes with confidence scores.

## ✨ Features
- Live browser camera feed (`getUserMedia`)
- Real-time cat/dog detection with YOLOv8 (`yolov8n.pt`)
- Responsive, modern UI with detection cards and status indicators
- Lightweight Flask backend API (`/predict`)

## 📦 Requirements
- Python 3.8+
- Webcam-enabled device
- Dependencies:
  - `flask`
  - `ultralytics`
  - `opencv-python`
  - `numpy`

## 🚀 Quick Start
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install flask ultralytics opencv-python numpy
python app.py
```

Then open: `http://localhost:5000`

## 🧠 How it works
1. Frontend requests camera access and displays the live stream.
2. Every ~350ms, a compressed frame is sent to `/predict`.
3. Backend runs YOLOv8 inference and filters detections to only `cat` and `dog`.
4. Frontend draws bounding boxes + confidence labels and updates the detection list.

## 📁 Project Structure
- `app.py` — Flask server + YOLO inference endpoint
- `templates/index.html` — web page layout
- `static/style.css` — modern responsive styling
- `static/app.js` — camera + inference loop + overlays
- `yolo.py` — original OpenCV-only local script

## ✅ Notes
- HTTPS or `localhost` is required by browsers for camera access.
- For better accuracy, swap `yolov8n.pt` with a larger model (e.g., `yolov8s.pt`) in `app.py`.

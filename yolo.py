from ultralytics import YOLO
import cv2

# Load YOLOv8 model (pretrained on COCO dataset)
model = YOLO("yolov8n.pt")  # Small and fast. Use 'yolov8s.pt' for better accuracy.

# Open webcam
cap = cv2.VideoCapture(0)

print("Starting camera... Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Perform object detection
    results = model(frame, verbose=False)[0]

    # Draw detection boxes for cats and dogs
    for box in results.boxes:
        cls_id = int(box.cls[0])
        label = model.names[cls_id]
        confidence = float(box.conf[0])

        if label in ["cat", "dog"] and confidence > 0.6:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, f"{label} ({confidence:.2f})", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    # Display result
    cv2.imshow("YOLOv8 Cat/Dog Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

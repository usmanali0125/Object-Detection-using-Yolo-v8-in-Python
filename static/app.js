const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const detectionsEl = document.getElementById('detections');

let stream = null;
let detectionLoop = null;

function setStatus(message) {
  statusEl.textContent = message;
}

function drawDetections(detections) {
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  detections.forEach((det) => {
    const [x1, y1, x2, y2] = det.bbox;
    const width = x2 - x1;
    const height = y2 - y1;

    ctx.strokeStyle = '#57f287';
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, width, height);

    const label = `${det.label} ${(det.confidence * 100).toFixed(1)}%`;
    ctx.font = '16px Inter';
    const textWidth = ctx.measureText(label).width + 12;
    ctx.fillStyle = '#57f287';
    ctx.fillRect(x1, Math.max(0, y1 - 28), textWidth, 24);

    ctx.fillStyle = '#07152d';
    ctx.fillText(label, x1 + 6, Math.max(16, y1 - 10));
  });

  detectionsEl.innerHTML = '';
  if (detections.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No cat or dog detected in current frame.';
    li.style.color = '#9db0d4';
    detectionsEl.appendChild(li);
    return;
  }

  detections.forEach((det) => {
    const li = document.createElement('li');
    li.textContent = `${det.label.toUpperCase()} · confidence ${(det.confidence * 100).toFixed(1)}%`;
    detectionsEl.appendChild(li);
  });
}

async function detectFrame() {
  if (!stream || video.readyState < 2) {
    return;
  }

  const snapshot = document.createElement('canvas');
  snapshot.width = video.videoWidth;
  snapshot.height = video.videoHeight;
  snapshot.getContext('2d').drawImage(video, 0, 0, snapshot.width, snapshot.height);

  const image = snapshot.toDataURL('image/jpeg', 0.75);

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    });

    if (!response.ok) {
      throw new Error('Inference request failed.');
    }

    const data = await response.json();
    drawDetections(data.detections || []);
    setStatus('Detecting...');
  } catch (error) {
    setStatus('Detection error. Check server logs.');
  }
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
    await video.play();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    setStatus('Camera active.');

    detectionLoop = setInterval(detectFrame, 350);
  } catch (error) {
    setStatus('Camera permission denied/unavailable.');
  }
}

function stopCamera() {
  if (detectionLoop) {
    clearInterval(detectionLoop);
    detectionLoop = null;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  video.srcObject = null;
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  detectionsEl.innerHTML = '';
  startBtn.disabled = false;
  stopBtn.disabled = true;
  setStatus('Idle');
}

startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);

const scriptInput = document.getElementById('scriptInput');
const scrollContent = document.getElementById('scrollContent');
const teleprompter = document.getElementById('teleprompter');
const startScrollBtn = document.getElementById('startScroll');
const stopScrollBtn = document.getElementById('stopScroll');
const speedControl = document.getElementById('speedControl');
const fontSizeControl = document.getElementById('fontSizeControl');
const flipH = document.getElementById('flipH');
const flipV = document.getElementById('flipV');
const cameraPreview = document.getElementById('cameraPreview');
const recordButton = document.getElementById('recordButton');
const recordingsList = document.getElementById('recordings');
const recordingIndicator = document.getElementById('recordingIndicator');

let scrollInterval;
let scrollPosition = 0;
let mediaRecorder;
let recordedChunks = [];
let takeNumber = 1;

scriptInput.addEventListener('input', () => {
    scrollContent.textContent = scriptInput.value;
});

startScrollBtn.addEventListener('click', () => {
    if (scrollInterval) return;
    scrollInterval = setInterval(() => {
        scrollPosition += parseInt(speedControl.value, 10);
        teleprompter.scrollTop = scrollPosition;
    }, 50);
});

stopScrollBtn.addEventListener('click', () => {
    clearInterval(scrollInterval);
    scrollInterval = null;
});

speedControl.addEventListener('input', () => {
    // speed updated automatically via setInterval step
});

fontSizeControl.addEventListener('input', () => {
    scrollContent.style.fontSize = fontSizeControl.value + 'px';
});

flipH.addEventListener('change', () => {
    updateTransform();
});

flipV.addEventListener('change', () => {
    updateTransform();
});

function updateTransform() {
    let scaleX = flipH.checked ? -1 : 1;
    let scaleY = flipV.checked ? -1 : 1;
    teleprompter.style.transform = `scale(${scaleX}, ${scaleY})`;
}

// camera preview
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    cameraPreview.srcObject = stream;
    setupRecorder(stream);
}).catch(err => {
    console.error('Camera error:', err);
});

function setupRecorder(stream) {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });
        recordedChunks = [];
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().replace(/[:.]/g, '-');
        const type = blob.type.startsWith('audio') ? 'audio' : 'video';
        const filename = `${date}_take${takeNumber}_${type}.${type === 'audio' ? 'webm' : 'webm'}`;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.textContent = filename;
        li.appendChild(a);
        recordingsList.appendChild(li);
        takeNumber++;
    };
}

recordButton.addEventListener('click', () => {
    if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordButton.textContent = 'Start Recording';
        recordingIndicator.hidden = true;
    } else {
        mediaRecorder.start();
        recordButton.textContent = 'Stop Recording';
        recordingIndicator.hidden = false;
    }
});

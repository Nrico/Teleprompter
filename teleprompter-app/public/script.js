const scriptInput = document.getElementById("scriptInput");
const scrollContent = document.getElementById("scrollContent");
const teleprompter = document.getElementById("teleprompter");

const startBtn = document.getElementById("startScroll");
const stopBtn = document.getElementById("stopScroll");
const speedControl = document.getElementById("speedControl");
const textSizeSlider = document.getElementById("textSize");

const flipHBtn = document.getElementById("flipH");
const flipVBtn = document.getElementById("flipV");

const startAudioRecBtn = document.getElementById("startAudioRec");
const startVideoRecBtn = document.getElementById("startVideoRec");
const stopRecBtn = document.getElementById("stopRec");
const recordingsList = document.getElementById("recordings");

const recIndicator = document.getElementById("recordingIndicator");
const recTypeLabel = document.getElementById("recType");

const toggleCameraBtn = document.getElementById("toggleCamera");
const videoSelect = document.getElementById("videoSelect");
const audioSelect = document.getElementById("audioSelect");

let scrollInterval = null;
let mediaRecorder;
let recordedChunks = [];
let activeStream = null;

let currentFacing = "user";
let currentVideoDevice = null;
let currentAudioDevice = null;

let takeCounts = {
  audio: 0,
  video: 0
};

scrollContent.textContent = scriptInput.value;

scriptInput.addEventListener("input", () => {
  scrollContent.textContent = scriptInput.value;
});

textSizeSlider.addEventListener("input", () => {
  scrollContent.style.fontSize = `${textSizeSlider.value}em`;
});

startBtn.addEventListener("click", () => {
  if (scrollInterval) clearInterval(scrollInterval);
  scrollInterval = setInterval(() => {
    teleprompter.scrollBy(0, parseInt(speedControl.value));
  }, 50);
});

stopBtn.addEventListener("click", () => {
  if (scrollInterval) clearInterval(scrollInterval);
});

flipHBtn.addEventListener("click", () => {
  scrollContent.classList.toggle("flipped-h");
  flipHBtn.classList.toggle("active");
});

flipVBtn.addEventListener("click", () => {
  scrollContent.classList.toggle("flipped-v");
  flipVBtn.classList.toggle("active");
});

function getDatePrefix() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function getNextTake(type) {
  takeCounts[type]++;
  return `${getDatePrefix()}_Take-${takeCounts[type]}_${type}.webm`;
}

function addToDownloadList(blob, filename) {
  const url = URL.createObjectURL(blob);
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.textContent = `Download ${filename}`;
  li.appendChild(a);
  recordingsList.appendChild(li);
}

function buildConstraints(withVideo) {
  const constraints = {};
  if (withVideo) {
    constraints.video = currentVideoDevice
      ? { deviceId: { exact: currentVideoDevice } }
      : { facingMode: currentFacing };
  }
  constraints.audio = currentAudioDevice
    ? { deviceId: { exact: currentAudioDevice } }
    : true;
  return constraints;
}

async function startCameraPreview() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(buildConstraints(true));
    document.getElementById("cameraPreview").srcObject = stream;
    activeStream?.getTracks().forEach(t => t.stop());
    activeStream = stream;
    return stream;
  } catch (err) {
    console.error("Camera access denied:", err);
  }
}

async function populateDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  videoSelect.innerHTML = "";
  audioSelect.innerHTML = "";
  devices.forEach(device => {
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.text = device.label || device.deviceId;
    if (device.kind === "videoinput") {
      videoSelect.appendChild(option);
      if (device.deviceId === currentVideoDevice) option.selected = true;
    } else if (device.kind === "audioinput") {
      audioSelect.appendChild(option);
      if (device.deviceId === currentAudioDevice) option.selected = true;
    }
  });
}

async function startRecording(video = false) {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  activeStream?.getTracks().forEach(track => track.stop());

  activeStream = await navigator.mediaDevices.getUserMedia(buildConstraints(video));

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(activeStream);

  mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const type = video ? "video" : "audio";
    const filename = getNextTake(type);
    addToDownloadList(blob, filename);

    recIndicator.classList.add("hidden");
    startVideoRecBtn.classList.remove("recording");
    startAudioRecBtn.classList.remove("recording");
  };

  mediaRecorder.start();

  recIndicator.classList.remove("hidden");
  recTypeLabel.textContent = video ? "🎥 Recording" : "🎙️ Recording";
  if (video) {
    startVideoRecBtn.classList.add("recording");
  } else {
    startAudioRecBtn.classList.add("recording");
  }
}

startAudioRecBtn.addEventListener("click", () => startRecording(false));
startVideoRecBtn.addEventListener("click", () => startRecording(true));

stopRecBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
});

toggleCameraBtn.addEventListener("click", async () => {
  currentFacing = currentFacing === "user" ? "environment" : "user";
  currentVideoDevice = null;
  await startCameraPreview();
});

videoSelect.addEventListener("change", async () => {
  currentVideoDevice = videoSelect.value;
  await startCameraPreview();
});

audioSelect.addEventListener("change", async () => {
  currentAudioDevice = audioSelect.value;
  await startCameraPreview();
});

navigator.mediaDevices.addEventListener("devicechange", populateDevices);

startCameraPreview().then(populateDevices);

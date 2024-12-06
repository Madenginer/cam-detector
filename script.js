// Referensi elemen video dan overlay
const video = document.getElementById('videoElement');
const overlay = document.getElementById('overlay');
const ageGenderDiv = document.getElementById('ageGender');

// Load Face API models from local folder
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models')
]).then(startVideo).catch(err => console.error("Error loading models:", err));

// Start the video stream
function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error("Error accessing webcam:", err));
}

// Event listener when the video is playing
video.addEventListener("play", () => {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;

    // Set interval to continuously detect faces
    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withAgeAndGender()
            .withFaceLandmarks();

        // Draw the detections and display information
        drawDetections(detections);
    }, 100);  // 100ms interval
});

// Draw detected faces and other information (age, gender)
function drawDetections(detections) {
    const canvas = faceapi.createCanvasFromMedia(video);
    overlay.innerHTML = '';  // Clear previous canvas
    overlay.append(canvas);
    faceapi.matchDimensions(canvas, video);

    detections.forEach(detection => {
        const { age, gender, genderProbability } = detection;
        const box = detection.detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: `${Math.round(age)} years, ${gender} (${Math.round(genderProbability * 100)}%)` });

        drawBox.draw(canvas);

        // Display age and gender information
        const infoText = `${Math.round(age)} years | ${gender} (${Math.round(genderProbability * 100)}%)`;
        ageGenderDiv.innerHTML = `<p>Age: ${Math.round(age)} years</p><p>Gender: ${gender}</p><p>Confidence: ${Math.round(genderProbability * 100)}%</p>`;
    });
}

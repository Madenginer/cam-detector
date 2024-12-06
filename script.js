// DEBUG: Log untuk memantau proses pemuatan model
console.log("Starting to load models...");

// Muat semua model Face API dari folder 'models'
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'), // Model deteksi wajah
  faceapi.nets.ageGenderNet.loadFromUri('models') // Model deteksi usia & gender
])
  .then(() => {
    console.log("Models loaded successfully."); // DEBUG: Model berhasil dimuat
    startVideo(); // Mulai akses kamera setelah model dimuat
  })
  .catch(err => console.error("Error loading models: ", err)); // DEBUG: Tangkap error jika model gagal dimuat

// Fungsi untuk menginisialisasi akses kamera
function startVideo() {
  console.log("Attempting to access the camera..."); // DEBUG: Mulai akses kamera
  const video = document.getElementById('video'); // Ambil elemen <video> dari HTML
  navigator.mediaDevices.getUserMedia({ video: true }) // Minta izin akses kamera
    .then(stream => {
      console.log("Camera accessed successfully."); // DEBUG: Kamera berhasil diakses
      video.srcObject = stream; // Sambungkan stream kamera ke elemen video
    })
    .catch(err => console.error("Error accessing the camera: ", err)); // DEBUG: Tangkap error jika kamera gagal diakses
}

// Event listener untuk menjalankan deteksi saat video mulai diputar
const video = document.getElementById('video'); // Ambil elemen video
video.addEventListener('play', () => {
  console.log("Video started playing. Starting face detection..."); // DEBUG: Video mulai
  const canvas = faceapi.createCanvasFromMedia(video); // Buat canvas dari elemen video
  document.body.append(canvas); // Tambahkan canvas ke halaman
  const displaySize = { width: video.width, height: video.height }; // Ukuran elemen video
  faceapi.matchDimensions(canvas, displaySize); // Sesuaikan dimensi canvas dengan video

  setInterval(async () => {
    // Deteksi wajah & usia setiap 100ms
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender();
    console.log("Detections:", detections); // DEBUG: Log hasil deteksi
    const resizedDetections = faceapi.resizeResults(detections, displaySize); // Sesuaikan ukuran hasil deteksi
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); // Bersihkan canvas
    faceapi.draw.drawDetections(canvas, resizedDetections); // Gambar deteksi di canvas
    resizedDetections.forEach(detection => {
      const { age, gender, genderProbability } = detection;
      const box = detection.detection.box;
      const text = `${Math.round(age)} years old, ${gender} (${(genderProbability * 100).toFixed(1)}%)`;
      const drawBox = new faceapi.draw.DrawBox(box, { label: text });
      drawBox.draw(canvas); // Tambahkan label usia & gender
    });
  }, 100); // Deteksi diulang setiap 100ms
});

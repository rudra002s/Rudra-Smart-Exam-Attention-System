console.log("exam.js loaded");

const URL = "https://teachablemachine.withgoogle.com/models/TYcMqZS0N/";

let model, webcam;

const wrapper = document.querySelector(".video_wrapper");
const mainBox = document.querySelector(".main_box");
const statusText = document.querySelector("p1");
const confidenceText = document.querySelector("p2");

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);

    // ✅ FIXED RESOLUTION (perfect fit)
    webcam = new tmImage.Webcam(480, 360, true);
    await webcam.setup();
    await webcam.play();

    mainBox.appendChild(webcam.canvas);
    window.requestAnimationFrame(loop);
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const predictions = await model.predict(webcam.canvas);

    let best = predictions.reduce((a, b) =>
        a.probability > b.probability ? a : b
    );

    const label = best.className.trim();
    const cleanLabel = label.toUpperCase();
    const confidence = (best.probability * 100).toFixed(1);

    // STATUS
    statusText.innerText = "STATUS: " + label;

    // CONFIDENCE LOGIC
    let displayConfidence = confidence;

    if (cleanLabel.includes("NO FACE")) {
        displayConfidence = "--";
    } 
    else if (cleanLabel.includes("LOOKING AWAY")) {
        displayConfidence = Math.max(0, confidence - 30).toFixed(1);
    }

    confidenceText.innerText = "CONFIDENCE LEVEL: " + displayConfidence;

    // RESET BOX COLOR
    mainBox.classList.remove("attentive", "inattentive");

    if (cleanLabel.includes("LOOKING IN")) {
        mainBox.classList.add("attentive");      // 🟢
    } else {
        mainBox.classList.add("inattentive");    // 🔴
    }

    // 🚨 ALERT GLOW CONTROL (THIS IS THE KEY PART)
    const alertBox = document.querySelector(".alert_box");

    // alert ALWAYS visible → only glow changes
    alertBox.classList.remove("active");

    if (
        cleanLabel.includes("LOOKING AWAY") ||
        cleanLabel.includes("NO FACE")
    ) {
        alertBox.classList.add("active");   // 🔥 STRONG GLOW
    }
}







init().catch(err => console.error("INIT ERROR:", err));


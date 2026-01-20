console.log("exam.js loaded");

const URL = "https://teachablemachine.withgoogle.com/models/I0Au3TVEx/";

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

    const label = best.className.trim().toUpperCase();
    const confidence = (best.probability * 100).toFixed(1);

    statusText.innerText = "STATUS: " + label;
    confidenceText.innerText = "CONFIDENCE LEVEL: " + confidence + "%";

    // 🔁 RESET FIRST
    mainBox.classList.remove("attentive", "inattentive");

    // ✅ ROBUST CHECK (THIS FIXES EVERYTHING)
    if (label.includes("LOOKING IN")) {
        mainBox.classList.add("attentive");   // 🟢
    } else if (label.includes("LOOKING AWAY")) {
        mainBox.classList.add("inattentive"); // 🔴
    }
}


init().catch(err => console.error("INIT ERROR:", err));


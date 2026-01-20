console.log("exam.js loaded");

const URL = "https://teachablemachine.withgoogle.com/models/TYcMqZS0N/";

let model, webcam;

const mainBox = document.querySelector(".main_box");
const statusText = document.querySelector("p1");
const confidenceText = document.querySelector("p2");
const alertBox = document.querySelector(".alert_box");

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);

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

    const best = predictions.reduce((a, b) =>
        a.probability > b.probability ? a : b
    );

    const label = best.className.trim();
    const cleanLabel = label.toUpperCase();
    const confidence = (best.probability * 100).toFixed(1);

    statusText.innerText = "STATUS: " + label;

    let displayConfidence = confidence;

    if (cleanLabel.includes("NO FACE")) {
        displayConfidence = "--";
    } else if (cleanLabel.includes("LOOKING AWAY")) {
        displayConfidence = Math.max(0, confidence - 30).toFixed(1);
    }

    confidenceText.innerText =
        "CONFIDENCE LEVEL: " + displayConfidence;

    mainBox.classList.remove("attentive", "inattentive");

    if (cleanLabel.includes("LOOKING IN")) {
        mainBox.classList.add("attentive");
    } else {
        mainBox.classList.add("inattentive");
    }

    alertBox.classList.toggle(
        "active",
        cleanLabel.includes("LOOKING AWAY") ||
        cleanLabel.includes("NO FACE")
    );
}

init().catch(err => console.error("INIT ERROR:", err));



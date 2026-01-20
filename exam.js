const URL = "https://teachablemachine.withgoogle.com/models/[...]";

let model, webcam, maxPredictions;

const mainBox = document.querySelector(".main_box");
const statusText = document.querySelector("p1");
const confidenceText = document.querySelector("p2");

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    webcam = new tmImage.Webcam(500, 350, true);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    mainBox.appendChild(webcam.canvas);
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const predictions = await model.predict(webcam.canvas);

    let bestPrediction = predictions[0];
    for (let i = 1; i < predictions.length; i++) {
        if (predictions[i].probability > bestPrediction.probability) {
            bestPrediction = predictions[i];
        }
    }

    const label = bestPrediction.className;
    const confidence = (bestPrediction.probability * 100).toFixed(1);

    statusText.innerText = "STATUS: " + label;
    confidenceText.innerText = "CONFIDENCE LEVEL: " + confidence + "%";

    mainBox.classList.remove("attentive", "inattentive");

    if (label.toLowerCase().includes("screen")) {
        mainBox.classList.add("attentive");   // 🟢 green
    } else {
        mainBox.classList.add("inattentive"); // 🔴 red
    }
}

init();

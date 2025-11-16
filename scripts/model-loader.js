// scripts/model-loader.js

console.log("🧩 model-loader.js initialized");

// Configuration
const MODEL_PATH   = "model/BrainVision-model.onnx";
const INPUT_NAME   = "inputs";
const OUTPUT_NAME  = "output_0";
const IMAGE_SIZE   = 224;
const CLASS_NAMES  = ["glioma", "meningioma", "notumor", "pituitary"];

// Utility: Stable Softmax
function softmax(values) {
    const maxVal = Math.max(...values);
    const exps   = values.map(v => Math.exp(v - maxVal));
    const sum    = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
}

// Model Loader Class
class ModelLoader {
    constructor() {
        this.session  = null;
        this.isReady  = false;
        this._promise = this._loadModel();
    }

    // Load ONNX Model
    async _loadModel() {
        try {
            if (typeof ort === "undefined") {
                throw new Error(
                    "onnxruntime-web not found. Make sure 'ort.min.js' is loaded before this script."
                );
            }

            console.log("📥 Loading ONNX model:", MODEL_PATH);

            this.session = await ort.InferenceSession.create(MODEL_PATH, {
                executionProviders: ["wasm"],
                graphOptimizationLevel: "all",
                enableProfiling: false
            });

            this.isReady = true;
            console.log("✅ Model loaded successfully");
            document.getElementById("modelGlobalLoader")?.remove();

            return this.session;

        } catch (err) {
            console.error("❌ ONNX load error:", err);
            this.isReady = false;
            throw err;
        }
    }

    waitUntilReady() {
        return this._promise;
    }

    getStatus() {
        return this.isReady ? "READY" : "NOT_READY";
    }

    // Preprocess Image → Tensor
    preprocess(img) {
        const canvas = document.createElement("canvas");
        canvas.width  = IMAGE_SIZE;
        canvas.height = IMAGE_SIZE;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        ctx.clearRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);

        // Draw image resized
        ctx.drawImage(img, 0, 0, IMAGE_SIZE, IMAGE_SIZE);

        const { data } = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);

        // Model wants 3 channels → R,G,B
        // But model trained on grayscale → so convert and replicate
        const input = new Float32Array(IMAGE_SIZE * IMAGE_SIZE * 3);

        let o = 0;
        for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale
            const gray = (0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]) / 255;

            // Repeat grayscale into R, G, B channels
            input[o++] = gray; // R
            input[o++] = gray; // G
            input[o++] = gray; // B
        }

        // Model input shape = [1, 224, 224, 3]
        return new ort.Tensor("float32", input, [1, IMAGE_SIZE, IMAGE_SIZE, 3]);
    }

    // Predict
    async predict(imgElement) {
        if (!imgElement) {
            throw new Error("No image element provided to predict()");
        }

        // Ensure model is loaded
        await this.waitUntilReady();
        if (!this.isReady) {
            throw new Error("Model failed to load");
        }

        // Create input
        const inputTensor = this.preprocess(imgElement);
        const feeds = { [INPUT_NAME]: inputTensor };

        // Run inference
        const output = await this.session.run(feeds);
        const raw = Array.from(output[OUTPUT_NAME].data);

        const probabilities = softmax(raw);

        const results = CLASS_NAMES.map((cls, i) => ({
            className: cls,
            confidence: probabilities[i]
        }));

        results.sort((a, b) => b.confidence - a.confidence);

        return results;
    }
}

// Public API (Backward compatible)
const internalLoader = new ModelLoader();

window.modelLoader = {
    loadPromise: internalLoader.waitUntilReady(),
    predict: (img) => internalLoader.predict(img),
    getStatus: () => internalLoader.getStatus(),
    CLASS_NAMES
};

export default window.modelLoader;

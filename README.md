<p align="center">
  <img src="assets/brain-icon.svg" width="120" />
</p>

<p align="center">
    <a href="https://alij-official.github.io/BrainVision-AI/">Open BrainVision Website</a>
</p>

# BrainVision AI

BrainVision is a fully client-side brain tumor classifier that runs directly in the browser using ONNX Runtime Web.
The model is trained with MRI brain scan datasets and can classify brain images into four categories:

- Glioma
- Meningioma
- Pituitary
- No Tumor

The project focuses on speed, privacy, and accessibility — the model runs locally on the user's device, and no data is ever uploaded to a server.

# Features

### ✔ 100% Client-Side
Runs entirely in the browser using WebAssembly — no backend, no API calls.

### ✔ Dark/Light Theme
Smooth theme switching with localStorage persistence.

### ✔ Multi-Language Support
A scalable language-switching system for easy expansion.

### ✔ Fully Responsive
Optimized UI for desktop and mobile.

### ✔ Training Pipeline Included
The training directory contains:
- Keras model (.keras)
- ONNX model (.onnx)
- Conversion script
- Notebook workspace

# How It Works

BrainVision uses a trained deep-learning model exported to ONNX format, executed directly in the browser using:

- ONNX Runtime Web (ORT Web)
- WebAssembly (WASM)

Inference steps:
1. The uploaded MRI image is preprocessed in JavaScript  
2. The ONNX model runs inference inside the browser  
3. The top prediction and confidence score are displayed  
4. No network request is made

## Model Architecture
The model was trained using TensorFlow/Keras with transfer learning (EfficientNetB0).  
Input resolution: 224×224×3  
Classifier head: GAP → Dense(128) → Dropout → Dense(4, Softmax)

Keras model stored in:
```
training/models/BrainVision-model.keras
```

## ONNX Conversion
The `.keras` model is exported to ONNX using `tf2onnx` (opset 17).  
Conversion script:
```
training/onnx/keras-to-onnx.py
```

Optimized for ONNX Runtime Web compatibility.


## Training Workspace
Located in:
```
training/notebooks/
```

Includes:
- Preprocessing
- Model training & evaluation
- Logs and experiments
- Reproducible workflow

## Browser Preprocessing
Implemented in `scripts/model-loader.js`:

- Resize → 224×224
- Normalize to [0, 1]
- Convert to tensor shape [1, 224, 224, 3]

## ONNX Runtime Web Execution
InferenceSession uses:
- Execution provider: wasm
- Graph optimizations: "all"
- SIMD acceleration when supported

Runs entirely on CPU inside the browser.

# Dataset

Kaggle MRI Dataset:  
- https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset

# License
BrainVision is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

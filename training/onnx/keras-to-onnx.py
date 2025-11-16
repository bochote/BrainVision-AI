import tensorflow as tf
import tf2onnx
import onnx
import os


# Configs
KERAS_MODEL_PATH = "../models/BrainVision-model.keras"
SAVED_MODEL_DIR = "saved_model"
ONNX_MODEL_PATH = "model.onnx"
OPSET = 13

print("Loading Keras model...")
model = tf.keras.models.load_model(KERAS_MODEL_PATH)

print("Converting keras to SavedModel...")
tf.saved_model.save(model, SAVED_MODEL_DIR)

print("Converting SavedModel to ONNX...")
spec = (tf.TensorSpec(model.inputs[0].shape, tf.float32, name="input"),)

model_proto, _ = tf2onnx.convert.from_saved_model(
    SAVED_MODEL_DIR,
    input_signature=spec,
    opset=OPSET,
    output_path=ONNX_MODEL_PATH
)

print("ONNX model saved to:", ONNX_MODEL_PATH)

print("🔍 Validating ONNX model...")
onnx_model = onnx.load(ONNX_MODEL_PATH)
onnx.checker.check_model(onnx_model)
print("Conversion successful! Model is valid.")

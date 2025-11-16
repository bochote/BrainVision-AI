# BrainVision - Test Data

This directory contains a small **balanced test subset** used for
evaluating the BrainVision ONNX model with real MRI images.

The images are sourced from the following public dataset:

**Kaggle Dataset:**
- https://www.kaggle.com/datasets/sartajbhuvaji/brain-tumor-classification-mri

## Folder Structure
Each folder contains **20 randomly selected MRI images** from its
category:

    test-data/
    ├── Glioma/
    ├── Meningioma/
    ├── No Tumor/
    └── Pituitary/

This subset is designed to provide a fast and reliable way to:

-   Test the browser-based classifier
-   Validate ONNX inference
-   Debug preprocessing steps
-   Compare predictions with original labels
-   Demonstrate model performance in documentation or demos

------------------------------------------------------------------------

## Purpose

This test set is **only for evaluation**, not training.
It helps ensure model and UI behavior is correct in real-world cases.

------------------------------------------------------------------------

## Licensing

All images originate from the Kaggle dataset listed above.
Redistribution should follow the dataset's licensing terms.

------------------------------------------------------------------------

## Notes

-   Images are **unmodified** except for random selection.
-   No resizing, filtering, or preprocessing was applied.
-   Ideal for manual and automated testing in both development and
    documentation.
-   **The model may make incorrect predictions** --- this is expected in
    any real-world machine-learning system.
-   **Correctness of the image labels belongs to the dataset creators,
    not to this project.**

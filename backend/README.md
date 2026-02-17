RTF Digi Payments — Node.js backend

This folder contains a minimal Node.js/Express port of the Python backend.

Quick start (from repo root):

1. cd backend
2. npm install
3. npm start

Notes:
- The ML scorer expects an ONNX model at `backend/models/fraud_model.onnx` if available; otherwise a heuristic fallback is used.

Testing
-------

Run unit tests (Jest):

```bash
cd backend
npm install
npm test
```

Model export helper
-------------------

If you have an existing pickled LightGBM/sklearn model (`fraud_model.pkl`), use the helper to export to ONNX:

```bash
cd backend
python tools/export_model_to_onnx.py path/to/fraud_model.pkl backend/models/fraud_model.onnx
```

If `skl2onnx` is not installed, install it in your Python environment:

```bash
pip install skl2onnx onnx
```


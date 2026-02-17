"""
Helper to export a pickled LightGBM / sklearn model to ONNX.

Usage (from backend/):
  python tools/export_model_to_onnx.py path/to/fraud_model.pkl backend/models/fraud_model.onnx

This script tries to use `skl2onnx` or `onnxmltools`. If those are not installed,
it prints instructions to install them.
"""
import sys
from pathlib import Path

def main():
    if len(sys.argv) < 3:
        print("Usage: python export_model_to_onnx.py model.pkl out.onnx")
        return

    pkl = Path(sys.argv[1])
    out = Path(sys.argv[2])

    if not pkl.exists():
        print(f"Model pickle not found: {pkl}")
        return

    try:
        import joblib
        model = joblib.load(str(pkl))
    except Exception:
        import pickle
        with open(pkl, 'rb') as f:
            model = pickle.load(f)

    try:
        from skl2onnx import convert_sklearn
        from skl2onnx.common.data_types import FloatTensorType
        import numpy as np

        # Create example input based on 9 features
        initial_type = [('float_input', FloatTensorType([None, 9]))]
        onnx = convert_sklearn(model, initial_types=initial_type)
        with open(out, 'wb') as f:
            f.write(onnx.SerializeToString())
        print(f'Exported ONNX to {out}')
        return
    except Exception as e:
        print('skl2onnx export failed or not available:', e)

    print('\nAutomatic ONNX export failed. To export your model, install:')
    print('  pip install skl2onnx onnx')
    print('Then re-run:')
    print(f'  python tools/export_model_to_onnx.py {pkl} {out}')

if __name__ == '__main__':
    main()

# Backend Setup

## Python Version

**Use Python 3.11 or 3.12.** Python 3.13 is not yet supported for pyvrp 0.6.3.

### Install Python 3.12 (macOS)

```bash
brew install python@3.12
```

### Fix SSL certificates (macOS – required for pyvrp build)

pyvrp 0.6.3 builds from source and downloads pybind11. If you see `SSL: CERTIFICATE_VERIFY_FAILED`:

```bash
cd backend
source venv/bin/activate

# Install certifi and use its CA bundle
pip install certifi
export SSL_CERT_FILE=$(python -c "import certifi; print(certifi.where())")

# Install cmake and pybind11 so meson can find them (avoids HTTPS download)
brew install cmake
pip install pybind11

# Now install requirements
pip install -r requirements.txt
```

### Create venv and install (full flow)

```bash
cd backend

# Remove old venv if you have one
rm -rf venv

# Create venv with Python 3.12
python3.12 -m venv venv

# Activate
source venv/bin/activate

# Fix SSL (see above)
pip install certifi
export SSL_CERT_FILE=$(python -c "import certifi; print(certifi.where())")
brew install cmake
pip install pybind11

# Install
pip install -r requirements.txt

# Run the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

### If you only have Python 3.13

Install Python 3.12: `brew install python@3.12` then use `python3.12 -m venv venv`

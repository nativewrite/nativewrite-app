#!/bin/bash

# Create storage directories
mkdir -p storage/audio
mkdir -p storage/transcripts

# Install dependencies
pip install -r requirements.txt

# Run the Flask app
python app.py


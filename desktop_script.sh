#!/bin/bash

echo "Starting backend via Docker Compose..."
docker compose up -d

echo "Waiting 5 seconds for backend to initialize..."
sleep 5

echo "Checking for virtual environment..."
if [[ ! -d "./venv" ]]; then
    echo "No virtual environment found. Creating one..."
    python3 -m venv venv

    if [[ $? -ne 0 ]]; then
        echo "Failed to create virtual environment. Aborting."
        exit 1
    fi
fi

echo "Activating virtual environment..."
source ./venv/bin/activate

echo "Installing dependencies (if needed)..."
pip install -r requirements.txt

echo "Starting Desktop App..."
python ./desktop/main.py

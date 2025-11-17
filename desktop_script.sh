#!/bin/bash

echo "Starting backend via Docker Compose..."
docker compose up -d

echo "Waiting 5 seconds for backend to initialize..."
sleep 5
echo "Activating virtual environment..."
source ./venv/bin/activate

echo "Starting Desktop App..."
python ./desktop/main.py

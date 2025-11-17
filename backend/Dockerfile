FROM python:3.13.5-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /backend

COPY requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .
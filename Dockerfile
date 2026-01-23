FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ .

# Create static directory for uploads
RUN mkdir -p static/images

# Railway injects PORT env variable
ENV PORT=8000

# Expose port
EXPOSE $PORT

# Start command - use shell form to expand $PORT
CMD uvicorn main:app --host 0.0.0.0 --port $PORT

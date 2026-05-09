FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .
COPY src/ ./src/
ENV PORT=8000
ENV PYTHONUNBUFFERED=1
CMD uvicorn src.api:app --host 0.0.0.0 --port ${PORT:-8000}

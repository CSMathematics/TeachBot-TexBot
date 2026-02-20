# Use Python 3.10 slim image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
# We need texlive-xetex for xelatex, and recommended packages for fonts/math
# Install system dependencies
# We need texlive-full for complete LaTeX support
# WARNING: This will significantly increase image size (>4GB)
RUN apt-get update && apt-get install -y \
    texlive-full \
    default-jre \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Custom Packages ──────────────────────────────────────────────────
# Create directory for custom packages
RUN mkdir -p /usr/local/share/texmf/tex/latex/custom

# Option A: Copy local .sty files if you have them in a 'custom_packages' folder in your project
# COPY custom_packages/*.sty /usr/local/share/texmf/tex/latex/custom/

# Option B: Install specific packages via tlmgr (if not in apt)
# Note: On Debian/Ubuntu, tlmgr is often restricted to user mode or requires initialization.
# Since we use texlive-full, most packages are already included.

# Update the filename database
RUN mktexlsr

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose port (FastAPI defaults to 8000)
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]

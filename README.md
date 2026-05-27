# Libra - Academic AI Agent

Libra is a powerful web application designed to help students generate high-quality lab practicals. It uses a clean, modern UI with a "Magic" aesthetic and outputs beautifully formatted PDF documents.

## Prerequisites
- Python 3.9+ 
- Get a Gemini API key from Google AI Studio.

## Setup Instructions

1. **Set your API Key**
   Make sure to set your Gemini API key as an environment variable before running the app.
   ```powershell
   $env:GEMINI_API_KEY="your_api_key_here"
   ```

2. **Install Dependencies**
   Install the required Python packages:
   ```powershell
   python -m pip install -r requirements.txt
   ```
   *(We recommend setting up a virtual environment first)*

3. **Run the Server**
   Start the Flask application:
   ```powershell
   python app.py
   ```

4. **Open in Browser**
   Once the server is running, navigate to `http://localhost:5000` in your web browser.

## Features
- Generates "Coding" or "Non-Coding" lab practicals.
- Outputs clean, structured JSON and displays it beautifully.
- Export your results as a downloadable PDF.

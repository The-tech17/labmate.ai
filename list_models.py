import os
from google import genai
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

api_key = os.environ.get("GEMINI_API_KEY", "").strip()
client = genai.Client(api_key=api_key)

print("Available Models:")
for model in client.models.list():
    # print only models that support generateContent
    if 'generateContent' in model.supported_actions:
        print(f" - {model.name}")

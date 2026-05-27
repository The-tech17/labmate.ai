import json
from app import client, MODEL_ID
try:
    system_instructions = (
        "You are Libra, an expert academic writer. "
        "CRITICAL INSTRUCTION: Your SOLE objective is to write the narrow 'Theory' section for the topic 'Simple Pendulum' and ABSOLUTELY NOTHING ELSE. "
        "You must output a strictly valid JSON object with a single key 'content' containing your generated text formatted in clean HTML."
    )
    response = client.chat.completions.create(
        model=MODEL_ID,
        messages=[
            {"role": "system", "content": system_instructions},
            {"role": "user", "content": f"Write the detailed Theory content for a Non-Coding practical."}
        ],
        response_format={"type": "json_object"},
        temperature=0.4
    )
    text = response.choices[0].message.content
    print("RAW:", text)
    content = json.loads(text)
    print("PARSED:", content.keys())
except Exception as e:
    import traceback
    traceback.print_exc()

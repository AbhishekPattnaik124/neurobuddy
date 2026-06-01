import os
from google import genai
from google.genai import types

client = genai.Client(api_key='AQ.Ab8RN6JrvvTk2vWE1GAaZXT1IAQeiebyS_A2mdjIiT7Q-TaApA')
res = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Create flashcards for: Machine Learning',
    config=types.GenerateContentConfig(
        system_instruction='Generate exactly 8 flashcards for the given topic. Return ONLY a raw JSON array: [{"front":"question","back":"answer"}] Questions should test deep understanding. Mix conceptual and factual.',
        response_mime_type='application/json'
    )
)
print(res.text)

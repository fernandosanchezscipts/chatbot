print("STARTING app.py...")

from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import openai
import os
import base64

print("Imports complete")

# Load .env and OpenAI key
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
print("API KEY LOADED")

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    message = request.form.get("message", "").strip()
    image = request.files.get("image")

    messages = [{"role": "system", "content": "You're a helpful assistant that responds to both user text and image inputs."}]

    if message:
        messages.append({"role": "user", "content": message})

    if image:
        img_data = base64.b64encode(image.read()).decode("utf-8")
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": message or "Describe this image:"},
                {"type": "image_url", "image_url": {"url": f"data:{image.mimetype};base64,{img_data}"}}
            ]
        })

    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=1000
        )
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        print("GPT Error:", e)
        return jsonify({"reply": "GPT-4o failed. Try again later."})

if __name__ == "__main__":
    print("Flask running at http://0.0.0.0:10000")
    app.run(host="0.0.0.0", port=10000, debug=True)
    







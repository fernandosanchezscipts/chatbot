print("STARTING app.py...")

from flask import Flask, render_template, request, jsonify, session
from flask_session import Session
from dotenv import load_dotenv
import openai
import os
import base64

print("Imports complete")

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")  # Needed for session encryption
app.config["SESSION_TYPE"] = "filesystem"       # Store session on server
Session(app)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    message = request.form.get("message", "").strip()
    image = request.files.get("image")

    # Initialize conversation memory
    if "conversation" not in session:
        session["conversation"] = [
            {"role": "system", "content": "You're a helpful assistant that responds to both user text and image inputs."}
        ]

    messages = session["conversation"]

    # Handle text input
    if message:
        messages.append({"role": "user", "content": message})

    # Handle image input
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
        # Send to GPT-4o
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=1000
        )

        reply = response.choices[0].message.content
        messages.append({"role": "assistant", "content": reply})
        session["conversation"] = messages  # Save updated conversation

        return jsonify({"reply": reply})
    except Exception as e:
        print("GPT Error:", e)
        return jsonify({"reply": "GPT-4o failed. Try again later."})

if __name__ == "__main__":
    print("Flask running at http://0.0.0.0:10000")
    app.run(host="0.0.0.0", port=10000, debug=True)
    







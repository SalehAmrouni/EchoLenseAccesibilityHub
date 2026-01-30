from flask import Flask, render_template, request, Response, jsonify
import pyttsx3, threading, time
import webbrowser
import threading
from vision_engine import VisionEngine
from deep_translator import GoogleTranslator

app = Flask(__name__)

# Global variables
vision = None
current_volume = 0.7 

def run_tts(text, vol):
    """Safe TTS initialization within a thread"""
    try:
        engine = pyttsx3.init()
        engine.setProperty('volume', vol) 
        engine.setProperty('rate', 175) 
        engine.say(text)
        engine.runAndWait()
        # Clean up engine after speaking to free resources
        del engine
    except Exception as e:
        print(f"TTS Error: {e}")

@app.route('/')
def index(): 
    return render_template('index.html')

@app.route('/set_volume')
def set_vol():
    global current_volume
    try:
        level = float(request.args.get('level', 70)) / 100
        current_volume = min(max(level, 0.0), 0.8) # Keep between 0 and 0.8
        return "OK"
    except:
        return "Error", 400

@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.json
    # Pull the target directly from the frontend dropdown value
    target_lang = data.get('target', 'english') 
    text_to_translate = data.get('text', '')
    
    if not text_to_translate:
        return jsonify({"translated": ""})

    try:
        # FIX: Create a fresh translator for every request
        # 'deep-translator' supports full names like 'spanish' or 'japanese'
        translated = GoogleTranslator(source='auto', target=target_lang).translate(text_to_translate)
        return jsonify({"translated": translated})
    except Exception as e:
        print(f"Translation Error: {e}")
        return jsonify({"translated": "Translation Error"})

@app.route('/speak')
def speak():
    text = request.args.get('text')
    if text:
        threading.Thread(target=run_tts, args=(text, current_volume), daemon=True).start()
    return "OK"

@app.route('/video_feed')
def video_feed():
    def gen():
        while True:
            if vision:
                frame, _ = vision.get_processed_data()
                if frame:
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(0.03) # Cap at ~30 FPS
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/spatial_data')
def spatial_data():
    if vision:
        _, data = vision.get_processed_data()
        return jsonify(data)
    return jsonify({"msg": "Wait..."})

def open_browser():
    webbrowser.open("http://localhost:5000")

if __name__ == "__main__":
    # Initialize vision here
    vision = VisionEngine()
    # Using debug=False for the final demo is safer
    threading.Thread(target=open_browser, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)
    # webbrowser.open("http://localhost:5000")
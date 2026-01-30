let isCapturing = false;
let sessionLog = [];
let audioCtx, gainNode, pannerNode, microphone;
let spatialActive = false;

const langMap = { "arabic": "ar-SA", "spanish": "es-ES", "french": "fr-FR", "german": "de-DE", "hindi": "hi-IN", "japanese": "ja-JP", "russian": "ru-RU", "english": "en-US", "italian": "it-IT", "chinese": "zh-CN" };
const langs = Object.keys(langMap);

window.addEventListener('DOMContentLoaded', () => {
    const src = document.getElementById('lang-source');
    const trg = document.getElementById('lang-target');
    if(src && trg) {
        langs.forEach(l => {
            src.add(new Option(l.toUpperCase(), l));
            trg.add(new Option(l.toUpperCase(), l));
        });
        src.value = "english"; trg.value = "spanish";
    }
});

async function syncBT() {
    if (audioCtx) {
        toggleSpatial();
        return;
    }

    say("Initializing spatial audio.");
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        microphone = audioCtx.createMediaStreamSource(stream);
        gainNode = audioCtx.createGain();
        pannerNode = audioCtx.createPanner();
        pannerNode.panningModel = 'HRTF';
        pannerNode.positionZ.value = 1;

        microphone.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(audioCtx.destination);
        
        spatialActive = true;
        updateSpatialUI(true);
        say("Spatial boost active.");
    } catch (e) { say("Access denied."); }
}

function toggleSpatial() {
    if (!audioCtx) return;
    if (audioCtx.state === 'running') {
        audioCtx.suspend().then(() => {
            spatialActive = false;
            updateSpatialUI(false);
            say("Audio paused.");
        });
    } else {
        audioCtx.resume().then(() => {
            spatialActive = true;
            updateSpatialUI(true);
            say("Audio resumed.");
        });
    }
}

function updateSpatialUI(isActive) {
    const btn = document.getElementById('spatial-toggle-btn');
    if (!btn) return;
    if (isActive) {
        btn.innerText = "PAUSE SPATIAL";
        btn.classList.add('active-spatial');
        btn.classList.remove('paused-spatial');
    } else {
        btn.innerText = "RESUME SPATIAL";
        btn.classList.add('paused-spatial');
        btn.classList.remove('active-spatial');
    }
}

function adjustVolume(v) {
    document.getElementById('gain-display').innerText = `${Math.round(v * 6)}%`;
    if (gainNode) gainNode.gain.value = v / 16;
    fetch(`/set_volume?level=${v}`);
}

function toggleCaptions() {
    isCapturing = !isCapturing;
    const btn = document.getElementById('cap-toggle');
    btn.innerText = isCapturing ? "STOP TALKING" : "START TALKING";
    if(isCapturing) { say("Listening."); runRecog(); }
    else { say("Paused."); }
}

async function runRecog() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Recognition();
    rec.lang = langMap[document.getElementById('lang-source').value];
    rec.continuous = false;
    rec.onresult = async (e) => {
        if(!isCapturing) return;
        const text = e.results[e.results.length - 1][0].transcript.trim();
        const res = await fetch('/translate', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ text: text, target: document.getElementById('lang-target').value })
        });
        const data = await res.json();
        const stamp = new Date().toLocaleTimeString();
        sessionLog.push({ time: stamp, original: text, translation: data.translated });
        updateUI(text, data.translated, stamp);
    };
    rec.onend = () => { if(isCapturing) rec.start(); };
    rec.start();
}

function updateUI(orig, trans, stamp) {
    const wall = document.getElementById('wall');
    const div = document.createElement('div');
    div.style.cssText = "margin-bottom:15px; border-left:4px solid var(--blue); padding:15px; background:rgba(255,255,255,0.02); border-radius:0 20px 20px 0;";
    div.innerHTML = `<small style="color:var(--blue); opacity:0.8;">${stamp}</small><br><b>${orig}</b><br><i style="color:var(--blue);">${trans}</i>`;
    wall.insertBefore(div, wall.firstChild);
}

function exportMinutes() {
    if (!sessionLog.length) return;
    let report = `==============================\n      ECHOLENS REPORT\n==============================\n\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}\nEntries: ${sessionLog.length}\n\n`;
    report += sessionLog.map((e, i) =>
        `------------------------------\nEntry #${i + 1}\n------------------------------\nTime: ${e.time}\n\nOriginal:\n${e.original}\n\nTranslation:\n${e.translation}\n`
    ).join('\n');
    report += '\n==============================\nEnd of Report\n==============================';
    const blob = new Blob([report], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `EchoLens_Report_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
}

function clearCaptions() { document.getElementById('wall').innerHTML = ""; sessionLog = []; say("Cleared."); }
function say(text) { fetch(`/speak?text=${encodeURIComponent(text)}`); }
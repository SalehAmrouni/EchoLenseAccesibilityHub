let lastVisionAlert = "";

function startVisionAI() {
    if (window.visionTimer) clearInterval(window.visionTimer);

    // 700ms Polling for high-responsiveness
    window.visionTimer = setInterval(async () => {
        const visionScreen = document.getElementById('screen-vision');
        if(!visionScreen || visionScreen.style.display === 'none') {
            clearInterval(window.visionTimer);
            return;
        }

        try {
            let res = await fetch('/spatial_data');
            let data = await res.json();
            
            const textDisplay = document.getElementById('vision-text');
            if(textDisplay) textDisplay.innerText = data.msg.toUpperCase();

            // Prevent repeat spam of the same detection
            if(data.msg !== lastVisionAlert && data.msg !== "STILL" && data.msg !== "CLEAR") {
                say(data.msg); 
                lastVisionAlert = data.msg;
            }
        } catch (e) {
            console.error("Vision poll error:", e);
        }
    }, 700); 
}
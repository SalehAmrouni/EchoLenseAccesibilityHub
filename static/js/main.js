/**
 * Global Navigation Controller
 * Handles screen transitions and camera resources.
 */
function nav(id) {
    const screens = ['splash', 'hub', 'vision', 'hearing', 'captions'];
    
    // Hide all screens
    screens.forEach(s => {
        const el = document.getElementById(`screen-${s}`);
        if(el) el.style.display = 'none';
    });
    
    // Show target screen
    const target = document.getElementById(`screen-${id}`);
    if(target) target.style.display = 'block';
    
    // Vision Logic: Manage Video Stream & AI Polling
    const stream = document.getElementById('stream');
    if(id === 'vision') {
        if(stream) stream.src = '/video_feed';
        startVisionAI();
    } else {
        if(stream) stream.src = '';
        // Stop any browser-side synthesis when switching contexts
        window.speechSynthesis.cancel();
    }
}
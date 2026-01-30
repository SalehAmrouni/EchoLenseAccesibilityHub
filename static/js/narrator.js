function say(t) {
    // Sends the text to the Flask /speak route
    fetch(`/speak?text=${encodeURIComponent(t)}`)
        .catch(err => console.log("Speech Error:", err));
}

// Initial system greeting
window.addEventListener('load', () => {
    setTimeout(() => {
        say("Welcome to Echo Lens. Visual and hearing assistance Accessibility Hub. Please initialize the system to begin.");
    }, 800);
});
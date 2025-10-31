function initializeExtension() {
    console.log("[GRAFOS] Initializing extension...");
    console.log("[GRAFOS] Current URL:", location.href);
    
    loadSettings();
    createCanvas();
    loadShortcuts();
    
    console.log("[GRAFOS] Extension initialized successfully");
}

document.addEventListener("keydown", e => {
    if(!userShortcut) return;

    let pressed = [];
    if(e.ctrlKey) pressed.push("ctrl");
    if(e.altKey) pressed.push("alt");
    if(e.shiftKey) pressed.push("shift");
    let key = e.key.toLowerCase();
    if(!["control","shift","alt"].includes(key)) pressed.push(key);

    const shortcutKeys = userShortcut.toLowerCase().split("+").map(k=>k.trim());
    const matched = shortcutKeys.length === pressed.length && shortcutKeys.every(k => pressed.includes(k));
    
    if(matched) {
        e.preventDefault();
        console.log(`[GRAFOS] Shortcut activated: ${userShortcut}`);
        if (graffitiWindow) closeControlWindow();
        else createControlWindow();
    }
});

console.log(`[GRAFOS] Extension script loaded at: ${new Date().toISOString()}`);
if (document.readyState === 'loading') {
    console.log("[GRAFOS] Waiting for DOM content to load...");
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    console.log("[GRAFOS] DOM already ready, initializing...");
    initializeExtension();
}

const resizeObserver = new ResizeObserver(() => {
    if (graffitiCanvas) {
        console.log("[GRAFOS] Page content resized");
        resizeCanvas();
    }
});

if (document.body) {
    resizeObserver.observe(document.body);
    console.log("[GRAFOS] Resize observer activated");
}
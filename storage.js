function saveDrawing() {
    if (!graffitiCanvas || !ctx) {
        console.log("[GRAFOS] Canvas not ready for saving");
        return;
    }
    
    try {
        console.log("[GRAFOS] Starting save process...");
        
        const imageData = ctx.getImageData(0, 0, graffitiCanvas.width, graffitiCanvas.height);
        const hasContent = imageData.data.some(channel => channel !== 0);
        
        if (!hasContent) {
            console.log("[GRAFOS] Canvas is empty, skipping save");
            return;
        }
        
        const existingData = localStorage.getItem(storageKey);
        savedData = existingData ? JSON.parse(existingData) : {};
        console.log(`[GRAFOS] Existing saved drawings: ${Object.keys(savedData).length}`);
        
        const dataURL = graffitiCanvas.toDataURL();
        savedData[location.href] = dataURL;
        
        localStorage.setItem(storageKey, JSON.stringify(savedData));
        
        console.log(`[GRAFOS] Drawing saved successfully for: ${location.href}`);
        console.log(`[GRAFOS] Data size: ${dataURL.length} characters`);
        console.log(`[GRAFOS] Total saved URLs: ${Object.keys(savedData).length}`);
        
    } catch (error) {
        console.error("[GRAFOS] Save error:", error);
    }
}

function loadDrawing() {
    if (!graffitiCanvas || !ctx) {
        console.log("[GRAFOS] Canvas not ready for loading");
        return;
    }
    
    try {
        console.log("[GRAFOS] Starting load process...");
        console.log(`[GRAFOS] Looking for saved drawing for: ${location.href}`);
        
        const saved = localStorage.getItem(storageKey);
        if (!saved) {
            console.log("[GRAFOS] No saved data found in localStorage");
            return;
        }
        
        console.log(`[GRAFOS] Found saved data, parsing...`);
        savedData = JSON.parse(saved);
        const dataURL = savedData[location.href];
        
        if (!dataURL) {
            console.log(`[GRAFOS] No drawing found for current URL`);
            console.log(`[GRAFOS] Available URLs: ${Object.keys(savedData).join(', ')}`);
            return;
        }
        
        console.log(`[GRAFOS] Found saved drawing, loading image...`);
        console.log(`[GRAFOS] Data URL length: ${dataURL.length} characters`);
        
        const img = new Image();
        img.onload = function() {
            console.log(`[GRAFOS] Image loaded, drawing to canvas...`);
            ctx.clearRect(0, 0, graffitiCanvas.width, graffitiCanvas.height);
            ctx.drawImage(img, 0, 0);
            console.log(`[GRAFOS] Drawing loaded successfully!`);
            
            const verifyData = ctx.getImageData(0, 0, 1, 1);
            const hasContent = verifyData.data.some(channel => channel !== 0);
            console.log(`[GRAFOS] Drawing verification: ${hasContent ? 'SUCCESS' : 'FAILED - canvas appears empty'}`);
        };
        img.onerror = function() {
            console.error("[GRAFOS] Error loading saved image");
            console.error("[GRAFOS] Data URL preview:", dataURL.substring(0, 100) + "...");
        };
        img.src = dataURL;
        
    } catch (error) {
        console.error("[GRAFOS] Load error:", error);
    }
}

function saveSettings() {
    try {
        const settings = { 
            currentColor, 
            brushSize, 
            brushShape, 
            tool 
        };
        localStorage.setItem(settingsKey, JSON.stringify(settings));
        console.log("[GRAFOS] Settings saved:", settings);
    } catch (error) {
        console.error("[GRAFOS] Settings save error:", error);
    }
}

function loadSettings() {
    try {
        console.log("[GRAFOS] Loading settings...");
        const settings = JSON.parse(localStorage.getItem(settingsKey) || "{}");
        
        if (settings.currentColor) currentColor = settings.currentColor;
        if (settings.brushSize) brushSize = settings.brushSize;
        if (settings.brushShape) brushShape = settings.brushShape;
        if (settings.tool) tool = settings.tool;
        
        console.log("[GRAFOS] Settings loaded:", settings);
    } catch (error) {
        console.error("[GRAFOS] Settings load error:", error);
    }
}

function loadShortcuts() {
    console.log("[GRAFOS] Loading keyboard shortcuts...");
    storageAPI.sync.get(["shortcut", "maxSize"]).then(
        (res) => {
            if (res.shortcut) userShortcut = res.shortcut;
            if (res.maxSize) maxBrushSize = parseInt(res.maxSize);
            console.log("[GRAFOS] Shortcuts loaded:", res);
        },
        (err) => {
            console.error("[GRAFOS] Shortcuts load error:", err);
        }
    );
}
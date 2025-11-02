function createCanvas() {
    if (graffitiCanvas) {
        console.log("[GRAFOS] Canvas already exists");
        return;
    }
    
    console.log("[GRAFOS] Creating canvas element...");
    
    graffitiCanvas = document.createElement("canvas");
    graffitiCanvas.id = "graffitiCanvasOverlay";
    
    Object.assign(graffitiCanvas.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: '99998',
        background: 'transparent',
        cursor: 'crosshair',
        pointerEvents: 'none'
    });
    
    document.body.appendChild(graffitiCanvas);
    console.log("[GRAFOS] Canvas added to DOM");

    ctx = graffitiCanvas.getContext("2d", { willReadFrequently: true });
    console.log("[GRAFOS] 2D context created with willReadFrequently");

    resizeCanvas();
    setupEventListeners();
}

function resizeCanvas() {
    if (!graffitiCanvas || !ctx) {
        console.log("[GRAFOS] Canvas or context not ready for resize");
        return;
    }
    
    console.log("[GRAFOS] Resizing canvas...");
    
    const docWidth = Math.max(
        document.body.scrollWidth, 
        document.documentElement.scrollWidth,
        document.body.offsetWidth, 
        document.documentElement.offsetWidth
    );
    
    const docHeight = Math.max(
        document.body.scrollHeight, 
        document.documentElement.scrollHeight,
        document.body.offsetHeight, 
        document.documentElement.offsetHeight
    );
    
    console.log(`[GRAFOS] New dimensions: ${docWidth}x${docHeight}`);
    
    const hasContent = ctx.getImageData(0, 0, 1, 1).data.some(channel => channel !== 0);
    console.log(`[GRAFOS] Canvas has content before resize: ${hasContent}`);
    
    const oldWidth = graffitiCanvas.width;
    const oldHeight = graffitiCanvas.height;
    
    graffitiCanvas.width = docWidth;
    graffitiCanvas.height = docHeight;
    graffitiCanvas.style.width = docWidth + 'px';
    graffitiCanvas.style.height = docHeight + 'px';
    
    console.log(`[GRAFOS] Canvas resized from ${oldWidth}x${oldHeight} to ${docWidth}x${docHeight}`);
    
    loadDrawing();
}

function setupEventListeners() {
    window.addEventListener("resize", resizeCanvas);
    graffitiCanvas.addEventListener("mousedown", startDraw);
    graffitiCanvas.addEventListener("mousemove", draw);
    graffitiCanvas.addEventListener("mousemove", updateBrushPreview);
    graffitiCanvas.addEventListener("mouseenter", updateBrushPreview);
    graffitiCanvas.addEventListener("mouseleave", hideBrushPreview);
    window.addEventListener("mouseup", stopDraw);
    console.log("[GRAFOS] Event listeners configured");
}
// Fonctions spécifiques au pinceau
function updateBrushPreview(e) {
    if (!canDraw || isDrawing || tool === "text") {
        hideBrushPreview();
        return;
    }
    
    if (!brushPreview) {
        createBrushPreview();
    }
    
    const x = e.clientX;
    const y = e.clientY;
    const size = Math.max(brushSize, 5);
    
    const mainColor = tool === "pencil" ? currentColor : 'rgba(255, 255, 255, 0.8)';
    const borderColor = tool === "pencil" ? darkenColor(currentColor, 40) : 'rgba(200, 200, 200, 0.9)';
    
    brushPreview.style.width = size + 'px';
    brushPreview.style.height = size + 'px';
    brushPreview.style.borderRadius = brushShape === "round" ? '50%' : '2px';
    brushPreview.style.background = mainColor;
    brushPreview.style.border = `2px solid ${borderColor}`;
    brushPreview.style.boxShadow = '0 0 3px rgba(0, 0, 0, 0.5)';
    brushPreview.style.left = (x - size/2) + 'px';
    brushPreview.style.top = (y - size/2) + 'px';
    brushPreview.style.display = 'block';
}

function createBrushPreview() {
    brushPreview = document.createElement("div");
    brushPreview.id = "brushCursorPreview";
    brushPreview.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 100000;
        opacity: 0.8;
        display: none;
    `;
    document.body.appendChild(brushPreview);
}

function hideBrushPreview() {
    if (brushPreview) {
        brushPreview.style.display = 'none';
    }
}
let brushPreview = null;
let isSelectingTextArea = false;
let textAreaStart = { x: 0, y: 0 };
let textAreaEnd = { x: 0, y: 0 };

function startDraw(e) {
    if (!canDraw || !ctx) {
        console.log("[GRAFOS] Cannot draw - controls not active or context missing");
        return;
    }
    
    if (tool === "text" && isSelectingTextArea) {
        // La sélection ne commence qu'au premier clic réel
        textAreaStart = { x: e.pageX, y: e.pageY };
        textAreaEnd = { x: e.pageX, y: e.pageY };
        console.log(`[GRAFOS] Text area selection started at: ${e.pageX}, ${e.pageY}`);
        return;
    }
    
    if (tool !== "text") {
        isDrawing = true;
        ctx.lineWidth = brushSize;
        ctx.lineJoin = brushShape;
        ctx.lineCap = brushShape;
        ctx.strokeStyle = tool === "pencil" ? currentColor : "#ffffff";
        ctx.globalCompositeOperation = tool === "pencil" ? "source-over" : "destination-out";
        ctx.beginPath();
        
        const x = e.pageX;
        const y = e.pageY;
        ctx.moveTo(x, y);
        
        hideBrushPreview();
        console.log(`[GRAFOS] Started drawing at coordinates: ${x}, ${y} with tool: ${tool}`);
    }
}

function draw(e) {
    if (tool === "text" && isSelectingTextArea) {
        // Ne dessiner l'aperçu que si on a vraiment commencé une sélection (après le premier clic)
        if (textAreaStart.x !== 0 || textAreaStart.y !== 0) {
            textAreaEnd = { x: e.pageX, y: e.pageY };
            drawTextAreaPreview();
        }
        return;
    }
    
    if (!isDrawing || !canDraw || !ctx || tool === "text") {
        updateBrushPreview(e);
        return;
    }
    
    const x = e.pageX;
    const y = e.pageY;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDraw() {
    if (isSelectingTextArea) {
        finishTextAreaSelection();
        return;
    }
    
    if (isDrawing && ctx) {
        isDrawing = false;
        ctx.globalCompositeOperation = "source-over";
        console.log("[GRAFOS] Drawing completed, saving...");
        saveDrawing();
    }
}

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
        mix-blend-mode: difference;
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

function drawTextAreaPreview() {
    // Effacer l'ancien aperçu
    const oldPreview = document.getElementById("textAreaPreview");
    if (oldPreview) oldPreview.remove();
    
    const width = Math.abs(textAreaEnd.x - textAreaStart.x);
    const height = Math.abs(textAreaEnd.y - textAreaStart.y);
    
    if (width > 10 && height > 10) {
        const preview = document.createElement("div");
        preview.id = "textAreaPreview";
        preview.style.cssText = `
            position: absolute;
            left: ${Math.min(textAreaStart.x, textAreaEnd.x)}px;
            top: ${Math.min(textAreaStart.y, textAreaEnd.y)}px;
            width: ${width}px;
            height: ${height}px;
            border: 2px dashed ${textColor};
            background: rgba(255,255,255,0.1);
            pointer-events: none;
            z-index: 99997;
        `;
        document.body.appendChild(preview);
    }
}

function finishTextAreaSelection() {
    if (!isSelectingTextArea) return;
    
    // Vérifier si une sélection a réellement été faite
    const hasValidSelection = textAreaStart.x !== 0 && textAreaStart.y !== 0 && 
                             textAreaEnd.x !== 0 && textAreaEnd.y !== 0 &&
                             (Math.abs(textAreaEnd.x - textAreaStart.x) > 5 || 
                              Math.abs(textAreaEnd.y - textAreaStart.y) > 5);
    
    const preview = document.getElementById("textAreaPreview");
    
    if (preview && hasValidSelection) {
        const rect = preview.getBoundingClientRect();
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        
        const absoluteRect = {
            left: rect.left + scrollX,
            top: rect.top + scrollY,
            width: rect.width,
            height: rect.height,
            right: rect.right + scrollX,
            bottom: rect.bottom + scrollY
        };
        
        preview.remove();
        
        if (rect.width > 50 && rect.height > 20) {
            showTextInput(absoluteRect);
        } else {
            console.log("[GRAFOS] Text area too small");
            // Réinitialiser pour permettre une nouvelle sélection
            resetTextAreaSelection();
            startTextAreaSelection(); // Redémarrer le mode sélection
        }
    } else {
        // Aucune sélection valide, réinitialiser simplement
        resetTextAreaSelection();
    }
    
    console.log("[GRAFOS] Text area selection finished");
}

function resetTextAreaSelection() {
    isSelectingTextArea = false;
    textAreaStart = { x: 0, y: 0 };
    textAreaEnd = { x: 0, y: 0 };
    
    const preview = document.getElementById("textAreaPreview");
    if (preview) preview.remove();
    
    const message = document.getElementById("textAreaMessage");
    if (message) message.remove();
    
    graffitiCanvas.style.cursor = "crosshair";
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}






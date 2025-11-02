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
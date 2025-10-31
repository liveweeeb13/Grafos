function startDraw(e) {
    if (!canDraw || !ctx) {
        console.log("[GRAFOS] Cannot draw - controls not active or context missing");
        return;
    }
    
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
    
    console.log(`[GRAFOS] Started drawing at coordinates: ${x}, ${y} with tool: ${tool}`);
}

function draw(e) {
    if (!isDrawing || !canDraw || !ctx) return;
    
    const x = e.pageX;
    const y = e.pageY;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDraw() {
    if (isDrawing && ctx) {
        isDrawing = false;
        ctx.globalCompositeOperation = "source-over";
        console.log("[GRAFOS] Drawing completed, saving...");
        saveDrawing();
    }
}
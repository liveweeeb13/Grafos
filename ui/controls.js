function createControlWindow() {
    if (graffitiWindow) {
        console.log("[GRAFOS] Control window already exists");
        return;
    }

    console.log("[GRAFOS] Creating control window...");

    graffitiWindow = document.createElement("div");
    graffitiWindow.className = "graffiti-window";
    graffitiWindow.innerHTML = `
        <div class="graffiti-header">
            🎨 Grafos
            <button id="closeGraffiti">✖</button>
        </div>
        <div class="graffiti-controls">
            <div class="tool-buttons">
                <button id="pencilBtn" class="${tool==='pencil'?'active':''}">🖌️</button>
                <button id="eraserBtn" class="${tool==='eraser'?'active':''}">🧽</button>
                <button id="textBtn" class="${tool==='text'?'active':''}">🔠</button>
                </div>
            
            <div class="tool-options" id="drawingOptions" style="${tool==='text'?'display:none;':''}">
                <div id="colorOption">
                    <label>Color:</label>
                    <input type="color" id="colorPicker" value="${currentColor}">
                </div>
                <div>
                    <label>Size:</label>
                    <input list="sizeList" id="sizeInput" value="${brushSize}" min="1" max="${maxBrushSize}">
                    <datalist id="sizeList">
                        <option value="1"><option value="3"><option value="5">
                        <option value="10"><option value="15"><option value="20">
                    </datalist>
                </div>
                <div>
                    <label>Shape:</label>
                    <select id="brushShape">
                        <option value="round" ${brushShape==="round"?"selected":""}>Round</option>
                        <option value="square" ${brushShape==="square"?"selected":""}>Square</option>
                    </select>
                </div>
            </div>
            
            <div class="tool-options" id="textOptions" style="${tool!=='text'?'display:none;':''}">
                <button id="selectTextAreaBtn">Select Text Area</button>
            </div>
            
            <div class="action-buttons">
                <button id="clearCanvas">Clear all</button>
            </div>
        </div>
    `;
    document.body.appendChild(graffitiWindow);

    graffitiWindow.querySelector("#pencilBtn").addEventListener("click", () => selectTool("pencil"));
    graffitiWindow.querySelector("#eraserBtn").addEventListener("click", () => selectTool("eraser"));
    graffitiWindow.querySelector("#textBtn").addEventListener("click", () => selectTool("text"));
    
    graffitiWindow.querySelector("#colorPicker").addEventListener("input", e => { 
        currentColor = e.target.value; 
        saveSettings(); 
    });
    graffitiWindow.querySelector("#sizeInput").addEventListener("input", e => {
        let val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 1 && val <= maxBrushSize) brushSize = val;
        saveSettings();
    });
    graffitiWindow.querySelector("#brushShape").addEventListener("change", e => { 
        brushShape = e.target.value; 
        saveSettings(); 
    });
    
    graffitiWindow.querySelector("#selectTextAreaBtn").addEventListener("click", startTextAreaSelection);
    
    graffitiWindow.querySelector("#clearCanvas").addEventListener("click", clearCanvas);
    graffitiWindow.querySelector("#closeGraffiti").addEventListener("click", closeControlWindow);

    makeDraggable(graffitiWindow.querySelector(".graffiti-header"), graffitiWindow);

    updateToolUI();
    canDraw = true;
    updateCanvasPointer();
    
    console.log("[GRAFOS] Control window created successfully");
}

function selectTool(selected) {
    if (tool === "text" && selected !== "text") {
        resetTextAreaSelection();
    }
    
    tool = selected;
    updateToolUI();
    saveSettings();
    hideBrushPreview();
    console.log(`[GRAFOS] Tool selected: ${tool}`);
}

function updateToolUI() {
    if (!graffitiWindow) return;
    
    const pencilBtn = graffitiWindow.querySelector("#pencilBtn");
    const eraserBtn = graffitiWindow.querySelector("#eraserBtn");
    const textBtn = graffitiWindow.querySelector("#textBtn");
    const drawingOptions = graffitiWindow.querySelector("#drawingOptions");
    const textOptions = graffitiWindow.querySelector("#textOptions");
    const colorOption = graffitiWindow.querySelector("#colorOption");
    
    pencilBtn.classList.toggle("active", tool==="pencil");
    eraserBtn.classList.toggle("active", tool==="eraser");
    textBtn.classList.toggle("active", tool==="text");
    
    drawingOptions.style.display = tool==="text" ? "none" : "flex";
    textOptions.style.display = tool==="text" ? "flex" : "none";
    
    colorOption.style.display = tool==="eraser" ? "none" : "flex";
}

function closeControlWindow() {
    if (graffitiWindow) {
        graffitiWindow.remove();
        graffitiWindow = null;
    }
    canDraw = false;
    updateCanvasPointer();
    hideBrushPreview();
    
    resetTextAreaSelection();
    
    console.log("[GRAFOS] Control window closed");
}

function clearCanvas() {
    if (!ctx) {
        console.log("[GRAFOS] Cannot clear - context not available");
        return;
    }

    console.log("[GRAFOS] Initializing canvas clear...");

    const confirmOverlay = document.createElement("div");
    confirmOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; 
        width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); 
        display: flex; align-items: center; justify-content: center; 
        z-index: 99999;
    `;

    const confirmBox = document.createElement("div");
    confirmBox.style.cssText = `
        background: #1e1e1e; padding: 30px 40px; border-radius: 12px; 
        text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    confirmBox.innerHTML = `
        <p style="font-size: 1.2em; margin-bottom: 20px; color:white;">
            Are you sure you want to clear the whole canvas?
        </p>
        <button id="confirmYes" style="margin-right:10px; padding:10px 20px; border:none; border-radius:6px; background:#ff4b5c; color:white; cursor:pointer;">Yes</button>
        <button id="confirmNo" style="padding:10px 20px; border:none; border-radius:6px; background:#555; color:white; cursor:pointer;">No</button>
    `;

    confirmOverlay.appendChild(confirmBox);
    document.body.appendChild(confirmOverlay);

    confirmOverlay.querySelector("#confirmYes").addEventListener("click", () => {
        console.log("[GRAFOS] User confirmed canvas clear");
        ctx.clearRect(0, 0, graffitiCanvas.width, graffitiCanvas.height);
        saveDrawing();
        confirmOverlay.remove();
        console.log("[GRAFOS] Canvas cleared and saved");
    });

    confirmOverlay.querySelector("#confirmNo").addEventListener("click", () => {
        console.log("[GRAFOS] User cancelled canvas clear");
        confirmOverlay.remove();
    });
}
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
                <button id="pencilBtn" class="${tool==='pencil'?'active':''}">Brush</button>
                <button id="eraserBtn" class="${tool==='eraser'?'active':''}">Eraser</button>
            </div>
            <div class="tool-options">
                <div id="colorOption">
                    <label>Color :</label>
                    <input type="color" id="colorPicker" value="${currentColor}">
                </div>
                <div>
                    <label>Size :</label>
                    <input list="sizeList" id="sizeInput" value="${brushSize}" min="1" max="${maxBrushSize}">
                    <datalist id="sizeList">
                        <option value="1"><option value="3"><option value="5">
                        <option value="10"><option value="15"><option value="20">
                    </datalist>
                </div>
                <div>
                    <label>Shape :</label>
                    <select id="brushShape">
                        <option value="round" ${brushShape==="round"?"selected":""}>Round</option>
                        <option value="square" ${brushShape==="square"?"selected":""}>Square</option>
                    </select>
                </div>
                <button id="clearCanvas">Clear all</button>
            </div>
        </div>
    `;
    document.body.appendChild(graffitiWindow);

    graffitiWindow.querySelector("#pencilBtn").addEventListener("click", () => selectTool("pencil"));
    graffitiWindow.querySelector("#eraserBtn").addEventListener("click", () => selectTool("eraser"));
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
    graffitiWindow.querySelector("#clearCanvas").addEventListener("click", clearCanvas);
    graffitiWindow.querySelector("#closeGraffiti").addEventListener("click", closeControlWindow);

    makeDraggable(graffitiWindow.querySelector(".graffiti-header"), graffitiWindow);

    updateToolUI();
    canDraw = true;
    updateCanvasPointer();
    
    console.log("[GRAFOS] Control window created successfully");

    function selectTool(selected) {
        tool = selected;
        updateToolUI();
        saveSettings();
        console.log(`[GRAFOS] Tool selected: ${tool}`);
    }

    function updateToolUI() {
        const pencilBtn = graffitiWindow.querySelector("#pencilBtn");
        const eraserBtn = graffitiWindow.querySelector("#eraserBtn");
        const colorOption = graffitiWindow.querySelector("#colorOption");
        
        pencilBtn.classList.toggle("active", tool==="pencil");
        eraserBtn.classList.toggle("active", tool==="eraser");
        colorOption.style.display = tool==="pencil" ? "flex" : "none";
    }
}

function closeControlWindow() {
    if (graffitiWindow) {
        graffitiWindow.remove();
        graffitiWindow = null;
    }
    canDraw = false;
    updateCanvasPointer();
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

function makeDraggable(header, element) {
    let offsetX, offsetY, dragging = false;
    header.addEventListener("mousedown", e => {
        dragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
    });
    document.addEventListener("mousemove", e => {
        if (!dragging) return;
        element.style.left = (e.clientX - offsetX) + "px";
        element.style.top = (e.clientY - offsetY) + "px";
    });
    document.addEventListener("mouseup", () => dragging = false);
}
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

    // Tool events
    graffitiWindow.querySelector("#pencilBtn").addEventListener("click", () => selectTool("pencil"));
    graffitiWindow.querySelector("#eraserBtn").addEventListener("click", () => selectTool("eraser"));
    graffitiWindow.querySelector("#textBtn").addEventListener("click", () => selectTool("text"));
    
    // Drawing events
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
    
    // Text events
    graffitiWindow.querySelector("#selectTextAreaBtn").addEventListener("click", startTextAreaSelection);
    
    graffitiWindow.querySelector("#clearCanvas").addEventListener("click", clearCanvas);
    graffitiWindow.querySelector("#closeGraffiti").addEventListener("click", closeControlWindow);

    makeDraggable(graffitiWindow.querySelector(".graffiti-header"), graffitiWindow);

    updateToolUI();
    canDraw = true;
    updateCanvasPointer();
    
    console.log("[GRAFOS] Control window created successfully");

    function selectTool(selected) {
        // Reset text selection if switching tools
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
        const pencilBtn = graffitiWindow.querySelector("#pencilBtn");
        const eraserBtn = graffitiWindow.querySelector("#eraserBtn");
        const textBtn = graffitiWindow.querySelector("#textBtn");
        const drawingOptions = graffitiWindow.querySelector("#drawingOptions");
        const textOptions = graffitiWindow.querySelector("#textOptions");
        const colorOption = graffitiWindow.querySelector("#colorOption");
        
        pencilBtn.classList.toggle("active", tool==="pencil");
        eraserBtn.classList.toggle("active", tool==="eraser");
        textBtn.classList.toggle("active", tool==="text");
        
        // Show/hide options sections
        drawingOptions.style.display = tool==="text" ? "none" : "flex";
        textOptions.style.display = tool==="text" ? "flex" : "none";
        
        // Hide color option for eraser
        colorOption.style.display = tool==="eraser" ? "none" : "flex";
    }
}

// Other functions remain unchanged...
function startTextAreaSelection() {
    if (tool !== "text") return;
    
    isSelectingTextArea = true;
    graffitiCanvas.style.cursor = "crosshair";
    console.log("[GRAFOS] Text area selection mode activated - click and drag to select");
    
    // Temporary message
    const message = document.createElement("div");
    message.textContent = "Click and drag to select text area";
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 100001;
        pointer-events: none;
    `;
    message.id = "textAreaMessage";
    document.body.appendChild(message);
    
    setTimeout(() => {
        const msg = document.getElementById("textAreaMessage");
        if (msg) msg.remove();
    }, 2000);
    
    // Clean up any existing preview
    const oldPreview = document.getElementById("textAreaPreview");
    if (oldPreview) oldPreview.remove();
}

function showTextInput(rect) {
    const textInputOverlay = document.createElement("div");
    textInputOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100002;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    const textInputBox = document.createElement("div");
    textInputBox.style.cssText = `
        background: #2e2e2e;
        padding: 20px;
        border-radius: 12px;
        width: min(600px, 90vw);
        height: min(700px, 80vh);
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        resize: both;
        overflow: auto;
        min-width: 400px;
        min-height: 500px;
        max-width: 95vw;
        max-height: 90vh;
        border: 1px solid #444;
        position: relative;
    `;
    
    textInputBox.innerHTML = `
        <!-- Top bar with gradient -->
        <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #007acc, #0099ff, #00ccff);
            border-radius: 12px 12px 0 0;
        "></div>

        <div style="flex-shrink: 0; margin-bottom: 15px;">
            <h3 style="color: white; margin: 5px 0 15px 0; text-align: center; font-size: 1.3em; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.5); cursor: default;">Add Text</h3>
        </div>
        
        <!-- Text formatting instructions -->
        <div class="formatting-info" style="
            margin-bottom: 15px; 
            padding: 15px; 
            background: linear-gradient(135deg, #3a3a3a 0%, #2e2e2e 100%);
            border-radius: 8px; 
            border: 1px solid #444;
            border-left: 4px solid #007acc;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">
            <h4 style="color: #0099ff; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">📝</span> Formatting Guide
            </h4>
            <div style="color: #ccc; font-size: 12px; line-height: 1.5;">
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <span style="display: inline-block; width: 80px; font-weight: bold; color: #fff;">Bold:</span>
                    <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 4px; border: 1px solid #444; font-family: 'Courier New', monospace;">**text**</code>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <span style="display: inline-block; width: 80px; font-weight: bold; color: #fff;">Italic:</span>
                    <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 4px; border: 1px solid #444; font-family: 'Courier New', monospace;">*text*</code>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <span style="display: inline-block; width: 80px; font-weight: bold; color: #fff;">Underline:</span>
                    <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 4px; border: 1px solid #444; font-family: 'Courier New', monospace;">__text__</code>
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #444; font-style: italic; color: #aaa; font-size: 11px;">
                    Select text and apply formatting manually using the syntax above
                </div>
            </div>
        </div>
        
        <!-- Text area -->
        <div style="margin-bottom: 15px; flex-shrink: 0;">
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                <label style="color: #ccc; font-size: 13px; font-weight: 500;">Text Content</label>
                <span id="charCount" style="color: #888; font-size: 12px; background: #1a1a1a; padding: 2px 8px; border-radius: 10px; border: 1px solid #444;">0/500</span>
            </div>
            <textarea id="textInput" placeholder="Enter your text here... Use **bold**, *italic* or __underline__formatting" maxlength="500" style="
                width: 100%; 
                height: 120px; 
                padding: 12px; 
                border-radius: 8px; 
                border: 1px solid #555; 
                background: #1e1e1e; 
                color: white; 
                resize: vertical; 
                font-family: ${fontFamily}; 
                font-size: ${fontSize}px; 
                line-height: 1.4; 
                box-sizing: border-box;
                transition: all 0.2s ease;
                outline: none;
            "></textarea>
        </div>
        
        <!-- Preview -->
        <div style="margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); border-radius: 8px; border: 1px solid #444; flex: 1; min-height: 150px; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                <label style="color: #ccc; font-size: 13px; font-weight: 500;">Live Preview</label>
                <div style="display: flex; gap: 15px; font-size: 11px; color: #888;">
                    <span>Max width: <span id="currentMaxWidth">${Math.round(rect.width - 10)}</span>px</span>
                    <span id="lineCount">Lines: 0</span>
                </div>
            </div>
            <div id="textPreview" style="
                flex: 1; 
                overflow: auto; 
                padding: 12px; 
                background: #1a1a1a; 
                border-radius: 6px; 
                color: ${textColor}; 
                font-size: ${fontSize}px; 
                font-family: ${fontFamily}; 
                line-height: 1.4; 
                word-wrap: break-word; 
                border: 1px solid #333;
                min-height: 80px;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
            ">
                Your formatted text will appear here...
            </div>
        </div>
        
        <!-- Text styling options -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px; flex-shrink: 0;">
            <div>
                <label style="color: #ccc; font-size: 12px; display: block; margin-bottom: 6px; font-weight: 500;">Text Color</label>
                <div style="position: relative; display: inline-block; width: 100%;">
                    <input type="color" id="textColorInput" value="${textColor}" style="
                        width: 100%; 
                        height: 40px; 
                        border: 1px solid #555; 
                        border-radius: 6px; 
                        cursor: pointer; 
                        box-sizing: border-box;
                        background: #1e1e1e;
                    ">
                </div>
            </div>
            <div>
                <label style="color: #ccc; font-size: 12px; display: block; margin-bottom: 6px; font-weight: 500;">Font Size</label>
                <input type="number" id="fontSizeInput" value="${fontSize}" min="8" max="72" style="
                    width: 100%; 
                    padding: 10px; 
                    border: 1px solid #555; 
                    border-radius: 6px; 
                    background: #1e1e1e; 
                    color: white; 
                    box-sizing: border-box;
                    transition: all 0.2s ease;
                ">
            </div>
            <div style="grid-column: span 2;">
                <label style="color: #ccc; font-size: 12px; display: block; margin-bottom: 6px; font-weight: 500;">Font Family</label>
                <select id="fontFamilySelect" style="
                    width: 100%; 
                    padding: 10px; 
                    border: 1px solid #555; 
                    border-radius: 6px; 
                    background: #1e1e1e; 
                    color: white; 
                    cursor: pointer; 
                    box-sizing: border-box;
                    transition: all 0.2s ease;
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    background-size: 16px;
                    padding-right: 35px;
                ">
                    <option value="Arial" ${fontFamily==="Arial"?"selected":""}>Arial</option>
                    <option value="Verdana" ${fontFamily==="Verdana"?"selected":""}>Verdana</option>
                    <option value="Georgia" ${fontFamily==="Georgia"?"selected":""}>Georgia</option>
                    <option value="Times New Roman" ${fontFamily==="Times New Roman"?"selected":""}>Times New Roman</option>
                    <option value="Courier New" ${fontFamily==="Courier New"?"selected":""}>Courier New</option>
                    <option value="Comic Sans MS" ${fontFamily==="Comic Sans MS"?"selected":""}>Comic Sans MS</option>
                </select>
            </div>
        </div>
        
        <!-- Action buttons -->
        <div style="display: flex; gap: 12px; justify-content: flex-end; flex-shrink: 0; margin-top: 10px;">
            <button id="cancelText" style="
                padding: 12px 24px; 
                border: none; 
                border-radius: 6px; 
                background: linear-gradient(135deg, #555 0%, #444 100%);
                color: white; 
                cursor: pointer; 
                font-weight: 600;
                font-size: 13px;
                transition: all 0.2s ease;
                border: 1px solid #555;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">Cancel</button>
            <button id="confirmText" style="
                padding: 12px 24px; 
                border: none; 
                border-radius: 6px; 
                background: linear-gradient(135deg, #007acc 0%, #0099ff 100%);
                color: white; 
                cursor: pointer; 
                font-weight: 600;
                font-size: 13px;
                transition: all 0.2s ease;
                border: 1px solid #007acc;
                box-shadow: 0 2px 8px rgba(0, 122, 204, 0.3);
            ">Add Text</button>
        </div>
    `;
    
    textInputOverlay.appendChild(textInputBox);
    document.body.appendChild(textInputOverlay);

    // Add custom styles for the resize handle and interactions
    const style = document.createElement('style');
    style.textContent = `
        .graffiti-text-box {
            position: relative;
            transition: box-shadow 0.2s ease;
        }
        
        .graffiti-text-box:hover {
            box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        
        .graffiti-text-box:active {
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        
        .resize-handle:hover {
            opacity: 1;
            background: linear-gradient(135deg, transparent 40%, #0099ff 40%, #0099ff 60%, transparent 60%, transparent 70%, #0099ff 70%, #0099ff 80%, transparent 80%);
        }
        
        .resize-handle:active {
            background: linear-gradient(135deg, transparent 40%, #00ccff 40%, #00ccff 60%, transparent 60%, transparent 70%, #00ccff 70%, #00ccff 80%, transparent 80%);
        }
        
        /* Custom scrollbar for the entire dialog */
        .graffiti-text-box::-webkit-scrollbar {
            width: 12px;
            height: 12px;
        }
        
        .graffiti-text-box::-webkit-scrollbar-track {
            background: #1a1a1a;
            border-radius: 0 6px 6px 0;
        }
        
        .graffiti-text-box::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #007acc, #0099ff);
            border-radius: 6px;
            border: 2px solid #1a1a1a;
        }
        
        .graffiti-text-box::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #0099ff, #00ccff);
        }
        
        .graffiti-text-box::-webkit-scrollbar-corner {
            background: #2e2e2e;
        }
        
        /* Custom scrollbar for the preview */
        #textPreview::-webkit-scrollbar {
            width: 8px;
        }
        
        #textPreview::-webkit-scrollbar-track {
            background: #1a1a1a;
            border-radius: 4px;
        }
        
        #textPreview::-webkit-scrollbar-thumb {
            background: #007acc;
            border-radius: 4px;
        }
        
        #textPreview::-webkit-scrollbar-thumb:hover {
            background: #0099ff;
        }
        
        /* Input focus effects */
        #textInput:focus, #fontSizeInput:focus, #fontFamilySelect:focus {
            border-color: #007acc;
            box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
        }
        
        /* Button hover effects */
        #cancelText:hover {
            background: linear-gradient(135deg, #666 0%, #555 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        #confirmText:hover {
            background: linear-gradient(135deg, #0099ff 0%, #00aaff 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 122, 204, 0.4);
        }
        
        #cancelText:active, #confirmText:active {
            transform: translateY(0px);
        }
        
        /* Ensure resize works properly */
        .graffiti-text-box {
            overflow: auto !important;
        }
        
        /* Fix for Firefox resize */
        .graffiti-text-box {
            resize: both;
            overflow: auto;
        }
        
        /* Make sure content doesn't get cut off */
        .graffiti-text-box > * {
            min-width: 0;
        }
        
        /* Remove draggable cursor from header */
        h3 {
            cursor: default !important;
        }
    `;
    document.head.appendChild(style);
    textInputBox.classList.add('graffiti-text-box');

    const textInput = textInputBox.querySelector("#textInput");
    const textPreview = textInputBox.querySelector("#textPreview");
    const charCount = textInputBox.querySelector("#charCount");
    const lineCount = textInputBox.querySelector("#lineCount");
    const currentMaxWidth = textInputBox.querySelector("#currentMaxWidth");
    const textColorInput = textInputBox.querySelector("#textColorInput");
    const fontSizeInput = textInputBox.querySelector("#fontSizeInput");
    const fontFamilySelect = textInputBox.querySelector("#fontFamilySelect");
    
    textInput.focus();

    // Function to handle responsive layout
    function updateLayout() {
        const boxWidth = textInputBox.clientWidth;
        
        // Update current max width display
        const previewMaxWidth = boxWidth - 60;
        currentMaxWidth.textContent = Math.round(previewMaxWidth - 20);
        
        // Adjust grid layout based on available width
        const gridContainer = textInputBox.querySelector('div[style*="grid-template-columns"]');
        const fullWidthItem = textInputBox.querySelector('div[style*="grid-column: span 2"]');
        
        if (boxWidth < 450) {
            if (gridContainer) {
                gridContainer.style.gridTemplateColumns = '1fr';
            }
            if (fullWidthItem) {
                fullWidthItem.style.gridColumn = 'span 1';
            }
        } else {
            if (gridContainer) {
                gridContainer.style.gridTemplateColumns = '1fr 1fr';
            }
            if (fullWidthItem) {
                fullWidthItem.style.gridColumn = 'span 2';
            }
        }

        // Adjust button layout for small screens
        const buttonContainer = textInputBox.querySelector('div[style*="justify-content: flex-end"]');
        if (buttonContainer) {
            if (boxWidth < 350) {
                buttonContainer.style.flexDirection = 'column';
                buttonContainer.style.alignItems = 'stretch';
            } else {
                buttonContainer.style.flexDirection = 'row';
                buttonContainer.style.alignItems = 'center';
            }
        }

        // Update text preview to reflect new dimensions
        updateTextPreview();
    }

    // Function to update text preview
    function updateTextPreview() {
        const text = textInput.value;
        const previewMaxWidth = textInputBox.clientWidth - 60;
        
        // Update character count
        charCount.textContent = `${text.length}/500`;
        charCount.style.color = text.length > 450 ? '#ff6b6b' : text.length > 400 ? '#ffa726' : '#888';
        
        // Update preview appearance
        textPreview.style.color = textColor;
        textPreview.style.fontSize = fontSize + 'px';
        textPreview.style.fontFamily = fontFamily;
        textPreview.style.fontStyle = 'normal';
        
        if (text.trim() === '') {
            textPreview.innerHTML = 'Your formatted text will appear here...';
            textPreview.style.color = '#888';
            textPreview.style.fontStyle = 'italic';
            lineCount.textContent = 'Lines: 0';
        } else {
            textPreview.innerHTML = '';
            
            // Simulate rendering with line breaks and Markdown formatting
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.font = `${fontSize}px ${fontFamily}`;
            
            // Parse Markdown to create formatted segments
            function parseMarkdownForPreview(text) {
                const segments = [];
                let currentText = '';
                let currentStyles = {
                    bold: false,
                    italic: false,
                    underline: false,
                    strikethrough: false
                };
                
                let i = 0;
                while (i < text.length) {
                    // Check for bold **text**
                    if (text.substr(i, 2) === '**' && !currentStyles.bold) {
                        if (currentText) {
                            segments.push({ text: currentText, styles: { ...currentStyles } });
                            currentText = '';
                        }
                        currentStyles.bold = true;
                        i += 2;
                    } else if (text.substr(i, 2) === '**' && currentStyles.bold) {
                        if (currentText) {
                            segments.push({ text: currentText, styles: { ...currentStyles } });
                            currentText = '';
                        }
                        currentStyles.bold = false;
                        i += 2;
                    } 
                    // Check for italic *text*
                    else if (text.substr(i, 1) === '*' && !currentStyles.italic && 
                             (i === text.length - 1 || text[i + 1] !== '*')) {
                        if (currentText) {
                            segments.push({ text: currentText, styles: { ...currentStyles } });
                            currentText = '';
                        }
                        currentStyles.italic = true;
                        i += 1;
                    } else if (text.substr(i, 1) === '*' && currentStyles.italic &&
                               (i === text.length - 1 || text[i + 1] !== '*')) {
                        if (currentText) {
                            segments.push({ text: currentText, styles: { ...currentStyles } });
                            currentText = '';
                        }
                        currentStyles.italic = false;
                        i += 1;
                    } 
                    // Check for underline __text__
                    else if (text.substr(i, 2) === '__' && !currentStyles.underline) {
                        if (currentText) {
                            segments.push({ text: currentText, styles: { ...currentStyles } });
                            currentText = '';
                        }
                        currentStyles.underline = true;
                        i += 2;
                    } else if (text.substr(i, 2) === '__' && currentStyles.underline) {
                        if (currentText) {
                            segments.push({ text: currentText, styles: { ...currentStyles } });
                            currentText = '';
                        }
                        currentStyles.underline = false;
                        i += 2;
                    }
                    // Check for strikethrough ~~text~~
                    else if (text.substr(i, 2) === '~~' && !currentStyles.strikethrough) {
                        if (currentText) {
                            segments.push({ text: currentText, styles: { ...currentStyles } });
                            currentText = '';
                        }
                        currentStyles.strikethrough = true;
                        i += 2;
                    } else if (text.substr(i, 2) === '~~' && currentStyles.strikethrough) {
                        if (currentText) {
                            segments.push({ text: currentText, styles: { ...currentStyles } });
                            currentText = '';
                        }
                        currentStyles.strikethrough = false;
                        i += 2;
                    } else {
                        currentText += text[i];
                        i++;
                    }
                }
                
                if (currentText) {
                    segments.push({ text: currentText, styles: { ...currentStyles } });
                }
                
                return segments;
            }
            
            // Process each line
            const lines = text.split('\n');
            const wrappedLines = [];
            const previewHeight = textPreview.clientHeight;
            const maxLines = Math.floor(previewHeight / (fontSize * 1.4));
            
            // Calculate line breaks with formatted segments
            lines.forEach(line => {
                const segments = parseMarkdownForPreview(line);
                let currentLine = [];
                let currentLineWidth = 0;
                
                segments.forEach(segment => {
                    const words = segment.text.split(' ');
                    
                    words.forEach((word, wordIndex) => {
                        const wordWithSpace = wordIndex === words.length - 1 ? word : word + ' ';
                        const wordWidth = measureTextWidth(wordWithSpace, segment.styles);
                        
                        if (currentLineWidth + wordWidth > previewMaxWidth && currentLine.length > 0) {
                            // New line
                            wrappedLines.push([...currentLine]);
                            currentLine = [];
                            currentLineWidth = 0;
                        }
                        
                        currentLine.push({ 
                            text: wordWithSpace, 
                            styles: segment.styles 
                        });
                        currentLineWidth += wordWidth;
                    });
                });
                
                if (currentLine.length > 0) {
                    wrappedLines.push(currentLine);
                }
            });
            
            // Function to measure text width with styles
            function measureTextWidth(text, styles) {
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                
                let fontString = '';
                if (styles.bold) fontString += 'bold ';
                if (styles.italic) fontString += 'italic ';
                fontString += `${fontSize}px ${fontFamily}`;
                
                tempCtx.font = fontString;
                return tempCtx.measureText(text).width;
            }
            
            // Display lines with height limit
            const displayLines = wrappedLines.slice(0, maxLines);
            
            displayLines.forEach(lineSegments => {
                const lineElement = document.createElement('div');
                lineElement.style.marginBottom = '2px';
                lineElement.style.color = textColor;
                lineElement.style.fontFamily = fontFamily;
                lineElement.style.fontSize = fontSize + 'px';
                lineElement.style.lineHeight = '1.4';
                lineElement.style.fontStyle = 'normal';
                
                lineSegments.forEach(segment => {
                    const span = document.createElement('span');
                    span.textContent = segment.text;
                    span.style.fontWeight = segment.styles.bold ? 'bold' : 'normal';
                    span.style.fontStyle = segment.styles.italic ? 'italic' : 'normal';
                    span.style.textDecoration = segment.styles.underline ? 
                        (segment.styles.strikethrough ? 'underline line-through' : 'underline') : 
                        (segment.styles.strikethrough ? 'line-through' : 'none');
                    span.style.color = textColor;
                    
                    lineElement.appendChild(span);
                });
                
                textPreview.appendChild(lineElement);
            });
            
            // Update line count
            lineCount.textContent = `Lines: ${displayLines.length}${wrappedLines.length > maxLines ? '+' : ''}`;
            
            // Warning if text exceeds height
            if (wrappedLines.length > maxLines) {
                const warning = document.createElement('div');
                warning.textContent = `... (${wrappedLines.length - maxLines} more lines won't fit)`;
                warning.style.color = '#ffa726';
                warning.style.fontSize = '11px';
                warning.style.fontStyle = 'italic';
                warning.style.marginTop = '5px';
                textPreview.appendChild(warning);
            }
        }
    }

    // Events for text controls
    textColorInput.addEventListener("input", e => {
        textColor = e.target.value;
        saveSettings();
        updateTextPreview();
    });
    
    fontSizeInput.addEventListener("input", e => {
        let val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 8 && val <= 72) {
            fontSize = val;
            saveSettings();
            updateTextPreview();
        }
    });
    
    fontFamilySelect.addEventListener("change", e => {
        fontFamily = e.target.value;
        saveSettings();
        updateTextPreview();
    });
    
    // Events for text input
    textInput.addEventListener("input", updateTextPreview);
    
    // Update layout on resize
    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(textInputBox);
    
    // Initial layout update
    updateLayout();
    
    textInputBox.querySelector("#cancelText").addEventListener("click", () => {
        resizeObserver.disconnect();
        textInputOverlay.remove();
        startTextAreaSelection();
    });
    
    textInputBox.querySelector("#confirmText").addEventListener("click", () => {
        const text = textInput.value.trim();
        if (text) {
            drawTextOnCanvas(text, rect);
        }
        resizeObserver.disconnect();
        textInputOverlay.remove();
    });
    
    // Close with ESC
    textInputOverlay.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            resizeObserver.disconnect();
            textInputOverlay.remove();
            startTextAreaSelection();
        }
    });

    // Ensure the dialog is scrollable and resizable
    setTimeout(() => {
        textInputBox.style.overflow = 'auto';
        textInputBox.style.resize = 'both';
    }, 100);
}

function drawTextOnCanvas(text, rect) {
    if (!ctx) return;
    
    // Reset default styles
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";
    
    // Calculate text positioning in the area
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.4;
    const maxWidth = rect.width - 10;
    const maxHeight = rect.height - 10;
    
    // Function to parse Markdown formatting
    function parseMarkdownText(text) {
        const segments = [];
        let currentText = '';
        let currentStyles = {
            bold: false,
            italic: false,
            underline: false
        };
        
        let i = 0;
        while (i < text.length) {
            // Check for bold **text**
            if (text.substr(i, 2) === '**' && !currentStyles.bold) {
                if (currentText) {
                    segments.push({ text: currentText, styles: { ...currentStyles } });
                    currentText = '';
                }
                currentStyles.bold = true;
                i += 2;
            } else if (text.substr(i, 2) === '**' && currentStyles.bold) {
                if (currentText) {
                    segments.push({ text: currentText, styles: { ...currentStyles } });
                    currentText = '';
                }
                currentStyles.bold = false;
                i += 2;
            } 
            // Check for italic *text*
            else if (text.substr(i, 1) === '*' && !currentStyles.italic && 
                     (i === text.length - 1 || text[i + 1] !== '*')) {
                if (currentText) {
                    segments.push({ text: currentText, styles: { ...currentStyles } });
                    currentText = '';
                }
                currentStyles.italic = true;
                i += 1;
            } else if (text.substr(i, 1) === '*' && currentStyles.italic &&
                       (i === text.length - 1 || text[i + 1] !== '*')) {
                if (currentText) {
                    segments.push({ text: currentText, styles: { ...currentStyles } });
                    currentText = '';
                }
                currentStyles.italic = false;
                i += 1;
            } 
            // Check for underline __text__
            else if (text.substr(i, 2) === '__' && !currentStyles.underline) {
                if (currentText) {
                    segments.push({ text: currentText, styles: { ...currentStyles } });
                    currentText = '';
                }
                currentStyles.underline = true;
                i += 2;
            } else if (text.substr(i, 2) === '__' && currentStyles.underline) {
                if (currentText) {
                    segments.push({ text: currentText, styles: { ...currentStyles } });
                    currentText = '';
                }
                currentStyles.underline = false;
                i += 2;
            } else {
                currentText += text[i];
                i++;
            }
        }
        
        if (currentText) {
            segments.push({ text: currentText, styles: { ...currentStyles } });
        }
        
        return segments;
    }
    
    // Function to measure text width with styles
    function measureTextWidth(text, styles) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        let fontString = '';
        if (styles.bold) fontString += 'bold ';
        if (styles.italic) fontString += 'italic ';
        fontString += `${fontSize}px ${fontFamily}`;
        
        tempCtx.font = fontString;
        return tempCtx.measureText(text).width;
    }
    
    // Function to draw a text segment with its styles
    function drawTextSegment(text, x, y, styles) {
        // Apply styles
        let fontString = '';
        if (styles.bold) fontString += 'bold ';
        if (styles.italic) fontString += 'italic ';
        fontString += `${fontSize}px ${fontFamily}`;
        
        ctx.font = fontString;
        ctx.fillStyle = textColor;
        
        // Draw text
        ctx.fillText(text, x, y);
        
        // Draw underline if needed
        if (styles.underline) {
            const textWidth = measureTextWidth(text, styles);
            ctx.strokeStyle = textColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y + fontSize + 2);
            ctx.lineTo(x + textWidth, y + fontSize + 2);
            ctx.stroke();
        }
        
        return measureTextWidth(text, styles);
    }
    
    // Process each line
    const allLines = [];
    
    lines.forEach(line => {
        if (line.trim() === '') {
            allLines.push([{ text: '', styles: { bold: false, italic: false, underline: false } }]);
            return;
        }
        
        const segments = parseMarkdownText(line);
        const lineSegments = [];
        let currentLine = [];
        let currentLineWidth = 0;
        
        segments.forEach(segment => {
            const words = segment.text.split(' ');
            
            words.forEach((word, wordIndex) => {
                const wordWithSpace = wordIndex === words.length - 1 ? word : word + ' ';
                const wordWidth = measureTextWidth(wordWithSpace, segment.styles);
                
                if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
                    // New line
                    lineSegments.push([...currentLine]);
                    currentLine = [];
                    currentLineWidth = 0;
                }
                
                currentLine.push({ 
                    text: wordWithSpace, 
                    styles: segment.styles 
                });
                currentLineWidth += wordWidth;
            });
        });
        
        if (currentLine.length > 0) {
            lineSegments.push(currentLine);
        }
        
        allLines.push(...lineSegments);
    });
    
    // Limit number of lines based on available height
    const maxLines = Math.floor(maxHeight / lineHeight);
    const finalLines = allLines.slice(0, maxLines);
    
    // Draw text
    const startX = rect.left + 5;
    let startY = rect.top + 5;
    
    finalLines.forEach(lineSegments => {
        if (startY + lineHeight > rect.bottom) return;
        
        let currentX = startX;
        
        lineSegments.forEach(segment => {
            const segmentWidth = drawTextSegment(segment.text, currentX, startY, segment.styles);
            currentX += segmentWidth;
        });
        
        startY += lineHeight;
    });
    
    saveDrawing();
    console.log(`[GRAFOS] Formatted text added to canvas: ${finalLines.length} lines`);
}

function closeControlWindow() {
    if (graffitiWindow) {
        graffitiWindow.remove();
        graffitiWindow = null;
    }
    canDraw = false;
    updateCanvasPointer();
    hideBrushPreview();
    
    // Completely reset text selection
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
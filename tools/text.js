// Fonctions spécifiques au texte
function drawTextAreaPreview() {
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
            resetTextAreaSelection();
            startTextAreaSelection();
        }
    } else {
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

function startTextAreaSelection() {
    if (tool !== "text") return;
    
    isSelectingTextArea = true;
    graffitiCanvas.style.cursor = "crosshair";
    console.log("[GRAFOS] Text area selection mode activated - click and drag to select");
    
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
    
    const oldPreview = document.getElementById("textAreaPreview");
    if (oldPreview) oldPreview.remove();
}
let graffitiCanvas, ctx, isDrawing = false;
let currentColor = "#ff0000";
let brushSize = 5;
let brushShape = "round";
let tool = "pencil";
let graffitiWindow = null;
let canDraw = false;
let savedData = {};
const storageKey = "web_graffiti_data";
const settingsKey = "web_graffiti_settings";

let isBold = false;
let isItalic = false;
let isUnderline = false;

let userShortcut = "Ctrl+Alt+P";
let maxBrushSize = 2000;

let textColor = "#ff0000";
let fontSize = 16;
let fontFamily = "Arial";


const browserAPI = window.browser || window.chrome;
const storageAPI = (typeof browser !== "undefined" ? browser.storage : chrome.storage);

function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

function updateCanvasPointer() {
    if (graffitiCanvas) {
        graffitiCanvas.style.pointerEvents = canDraw ? "auto" : "none";
        console.log(`[GRAFOS] Canvas pointer events: ${graffitiCanvas.style.pointerEvents}`);
    }
}

let imageElements = [];
let currentImageElement = null;
let isDraggingImage = false;
let isResizingImage = false;
let resizeDirection = null;
let dragOffset = { x: 0, y: 0 };
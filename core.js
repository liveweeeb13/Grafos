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

// Nouvelles variables pour le texte
let textColor = "#ff0000";
let fontSize = 16;
let fontFamily = "Arial";

const browserAPI = window.browser || window.chrome;
const storageAPI = (typeof browser !== "undefined" ? browser.storage : chrome.storage);
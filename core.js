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

let userShortcut = "Ctrl+Alt+P";
let maxBrushSize = 2000;

const browserAPI = window.browser || window.chrome;
const storageAPI = (typeof browser !== "undefined" ? browser.storage : chrome.storage);
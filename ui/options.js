const shortcutInput = document.getElementById("shortcut");
const maxSizeInput = document.getElementById("maxSize");
const saveBtn = document.getElementById("saveBtn");

let currentShortcut = "";

chrome.storage.sync.get(["shortcut","maxSize"], res => {
  if(res.shortcut) {
    currentShortcut = res.shortcut;
    shortcutInput.value = res.shortcut;
  }
  if(res.maxSize) maxSizeInput.value = res.maxSize;
});

shortcutInput.addEventListener("keydown", e => {
  e.preventDefault();
  let keys = [];
  if(e.ctrlKey) keys.push("Ctrl");
  if(e.altKey) keys.push("Alt");
  if(e.shiftKey) keys.push("Shift");
  if(e.key && !["Control","Shift","Alt"].includes(e.key)) keys.push(e.key.toUpperCase());
  currentShortcut = keys.join("+");
  shortcutInput.value = currentShortcut;
});

saveBtn.addEventListener("click", () => {
  const maxSize = parseInt(maxSizeInput.value) || 2000;
  chrome.storage.sync.set({shortcut: currentShortcut, maxSize}, () => {
    alert("Paramètres enregistrés !");
  });
});

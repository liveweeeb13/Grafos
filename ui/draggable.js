// Fonctions pour rendre les éléments déplaçables
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
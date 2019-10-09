var canvas = document.querySelector("#draw");
var sig = document.getElementById("sig");

var ctx = canvas.getContext("2d");

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

ctx.strokeStyle = "white";
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.lineWidth = 3;

var isDrawing = false;

function draw(e) {
    if (!isDrawing) return;

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

canvas.addEventListener("mousemove", draw);

canvas.addEventListener("mousedown", e => {
    isDrawing = true;
    ctx.moveTo(e.offsetX, e.offsetY);
});

// canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mouseout", () => (isDrawing = false));

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    sig.value = canvas.toDataURL();
    console.log(canvas.sig);
});

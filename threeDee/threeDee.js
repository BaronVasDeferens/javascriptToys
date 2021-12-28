

function main() {

    const canvas = document.getElementById("myCanvas");
    const context = canvas.getContext("webgl");

    // Set the "clear color"
    context.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clears the color buffer with the specified clear color
    context.clear(context.COLOR_BUFFER_BIT);
}



window.onload = main;


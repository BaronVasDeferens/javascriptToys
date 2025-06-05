import { Application, Assets, Sprite } from "pixi.js";


const Inputs = Object.freeze({
  MOUSE_PRIMARY: "MOUSE_PRIMARY",
  MOUSE_SECONDARY: "MOUSE_SECONDARY"
});


var inputs = new Set();

/**
 * 
 * npm run dev
 * 
 * 
 */

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container").appendChild(app.canvas);

  // Load the bunny texture
  const texture = await Assets.load("/assets/bunny.png");

  // Create a bunny Sprite
  const bunny = new Sprite(texture);

  var bunnyTheta = 0.0;

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // Add the bunny to the stage
  app.stage.addChild(bunny);


  const centerX = app.screen.width / 2;
  const centerY = app.screen.height / 2;

  document.addEventListener("mousemove", (event) => {

    if (event != undefined) {
      let mouseX = event.clientX - centerX;
      let mouseY = event.clientY - centerY;
      bunnyTheta = Math.atan2(mouseY, mouseX) + (Math.PI / 2);
    }

  });

  // Prevent the right click from summoning the context menu. Considered "bad form" but LOL whatever
  document.addEventListener('contextmenu', event => event.preventDefault());

  document.addEventListener("mousedown", (event) => {
    switch (event.button) {
      // left click
      case 0:
        inputs.add(Inputs.MOUSE_PRIMARY);
        break;
      // Right click
      case 2:
        inputs.add(Inputs.MOUSE_SECONDARY);
        break;
      default:
        break;
    }
  });

  document.addEventListener("mouseup", (event) => {
    switch (event.button) {
      // left click
      case 0:
        inputs.delete(Inputs.MOUSE_PRIMARY);
        break;
      // Right click
      case 2:
        inputs.delete(Inputs.MOUSE_SECONDARY);
        break;
      default:
        break;
    }
  });


  app.ticker.add((time) => {
    bunny.rotation = bunnyTheta;
    console.log(inputs)
  });
})();

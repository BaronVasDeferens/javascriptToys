import { Application, Assets, Sprite } from "pixi.js";


const Inputs = Object.freeze({
  MOUSE_PRIMARY: "MOUSE_PRIMARY",
  MOUSE_SECONDARY: "MOUSE_SECONDARY",
  KEYBOARD_FORWARD: "KEYBOARD_FORWARD"
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

  const muzzleFlashes = [
    new Sprite(await Assets.load("/assets/m_1.png")),
    new Sprite(await Assets.load("/assets/m_2.png")),
    new Sprite(await Assets.load("/assets/m_3.png")),
    new Sprite(await Assets.load("/assets/m_4.png")),
    new Sprite(await Assets.load("/assets/m_5.png")),
    new Sprite(await Assets.load("/assets/m_6.png")),
    new Sprite(await Assets.load("/assets/m_7.png")),
    new Sprite(await Assets.load("/assets/m_8.png")),
    new Sprite(await Assets.load("/assets/m_9.png")),
    new Sprite(await Assets.load("/assets/m_10.png")),
    new Sprite(await Assets.load("/assets/m_11.png")),
    new Sprite(await Assets.load("/assets/m_12.png")),
    new Sprite(await Assets.load("/assets/m_13.png")),
    new Sprite(await Assets.load("/assets/m_14.png")),
    new Sprite(await Assets.load("/assets/m_15.png")),
    new Sprite(await Assets.load("/assets/m_16.png"))
  ];

  muzzleFlashes.forEach(flash => {
    flash.scale.set(0.5);
    flash.anchor.set(0.5);
    flash.position.set(app.screen.width / 2, app.screen.height / 2);
    flash.visible = false;
    app.stage.addChild(flash);
  });

  // Create a bunny Sprite
  const bunny = new Sprite(texture);

  var bunnyTheta = 0.0;
  var bunnySpeed = 0.5;

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // Add the bunny to the stage
  app.stage.addChild(bunny);


  const centerX = app.screen.width / 2;
  const centerY = app.screen.height / 2;

  // Prevent the right click from summoning the context menu. Considered "bad form" but LOL whatever
  document.addEventListener('contextmenu', event => event.preventDefault());

  document.addEventListener("mousemove", (event) => {

    if (event != undefined) {
      let mouseX = event.clientX - bunny.x;
      let mouseY = event.clientY - bunny.y;
      bunnyTheta = Math.atan2(mouseY, mouseX) + (Math.PI / 2);
    }

  });

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

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case 'w':
        inputs.add(Inputs.KEYBOARD_FORWARD);
        break;
    }
  });

  document.addEventListener("keyup", (event) => {
    switch (event.key) {
      case 'w':
        inputs.delete(Inputs.KEYBOARD_FORWARD);
        break;
    }
  });

  function processInputs() {

    var deltaX = 0.0;
    var deltaY = 0.0;

    // MOVEMENT
    if (inputs.has(Inputs.KEYBOARD_FORWARD)) {
      deltaX = Math.sin(bunnyTheta) / bunnySpeed;
      deltaY = Math.cos(bunnyTheta) / bunnySpeed;
      bunny.x += deltaX;
      bunny.y -= deltaY;
    }

    // FIRING MAIN WEAPON
    if (inputs.has(Inputs.MOUSE_PRIMARY)) {

      // Choose and draw a random muzzle flash
      var selectedIndex = randomIntInRange(0, muzzleFlashes.length - 1);
      muzzleFlashes.forEach((flash, index) => {
        if (index == selectedIndex) {
          flash.visible = true;
          flash.rotation = bunnyTheta + (3 * (Math.PI / 2));
          flash.x = bunny.x;
          flash.y = bunny.y;
        } else {
          flash.visible = false;
        }
      });
    } else {
      muzzleFlashes.forEach(flash => {
        flash.visible = false;
      })
    }


  }

  function randomIntInRange(min, max) {
    return parseInt(Math.random() * max + min);
  };


  app.ticker.add((time) => {

    // console.log(inputs);

    bunny.rotation = bunnyTheta;

    processInputs();

  });
})();



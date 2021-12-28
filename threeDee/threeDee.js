

// function main() {

//     const canvas = document.getElementById("myCanvas");
//     const context = canvas.getContext("webgl");

//     // Set the "clear color"
//     context.clearColor(0.0, 0.0, 0.0, 1.0);

//     // Clears the color buffer with the specified clear color
//     context.clear(context.COLOR_BUFFER_BIT);
// }



// window.onload = main;





// https://github.com/end3r/MDN-Games-3D/blob/gh-pages/Three.js/shapes.html

const cameraXYStep = 1;
var cameraPosX = 5;
var cameraPosY = 5;

const cameraZStep = 1;
var cameraPosZ = 25;

var mouseDown = false;
var priorMouseEvent = null;


window.onmousewheel = function (event) {
    switch (event.deltaY) {
        case 100:
            cameraPosZ -= cameraZStep;
            break;
        case -100:
            cameraPosZ += cameraZStep;
            break;
    }
}

window.onmousedown = function (event) {
    mouseDown = true;
}

window.onmouseup = function (event) {
    mouseDown = false;
}

window.onmousemove = function (event) { 
    if (mouseDown === true) {
        // console.log(event);

        if (priorMouseEvent == null) {
            priorMouseEvent = event;
        }

        if (event.x < priorMouseEvent.x) {
            cameraPosX += cameraXYStep;
        } else if (event.x > priorMouseEvent.x) {
            cameraPosX -= cameraXYStep;
        }

        if (event.y < priorMouseEvent.y) {
            cameraPosY += cameraXYStep;
        } else if (event.y > priorMouseEvent.y) {
            cameraPosY -= cameraXYStep;
        }

        priorMouseEvent = event;

    }
}



var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0xDDDDDD, 1);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 0.1, 10000);
// camera.position.x = cameraPosX;
// camera.position.y = cameraPosY;
// camera.position.z = cameraPosZ;


scene.add(camera);

var boxGeometry = new THREE.BoxGeometry(10, 10, 10);
var basicMaterial = new THREE.MeshBasicMaterial({ color: 0x0095DD });
var cube = new THREE.Mesh(boxGeometry, basicMaterial);
cube.position.x = -25;
cube.rotation.set(0.4, 0.2, 0);
scene.add(cube);

var torusGeometry = new THREE.TorusGeometry(7, 1, 6, 12);
var phongMaterial = new THREE.MeshPhongMaterial({ color: 0xFF9500 });
var torus = new THREE.Mesh(torusGeometry, phongMaterial);
scene.add(torus);

var strangeGeometry = new THREE.DodecahedronGeometry(7);
var lambertMaterial = new THREE.MeshLambertMaterial({ color: 0xEAEFF2 });
var dodecahedron = new THREE.Mesh(strangeGeometry, lambertMaterial);
dodecahedron.position.x = 25;
scene.add(dodecahedron);

var light = new THREE.PointLight(0xFFFFFF);
light.position.set(-10, 15, 50);
scene.add(light);

var t = 0;
function render() {
    t += 0.01;
    requestAnimationFrame(render);
    camera.position.z = cameraPosZ;
    camera.position.x = cameraPosX;
    camera.position.y = cameraPosY;


    cube.rotation.y += 0.01;
    torus.scale.y = Math.abs(Math.sin(t));
    dodecahedron.position.y = -7 * Math.sin(t * 2);
    renderer.render(scene, camera);
}
render();


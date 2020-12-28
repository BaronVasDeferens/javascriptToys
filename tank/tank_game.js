import { Tank } from './entities.js';
import { Robot } from './entities.js';
import { Projectile } from './projectiles.js';
import { TracerRound } from './projectiles.js';


/**
 * TANK
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 * And if THAT doesn't work (and you use BASH), try: "sudo npm install --global http-server"
 */

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const tank = new Tank(500, 500, 2);
const tankRotateSpeed = 1.25;      // 0.25 is good
const turretRotateSpeed = 0.4;      // 0.4 is good

const robots = [];

const projectiles = [];
const tracers = [];

const deadRobots = [];
const deadProjectiles = [];

const explosionSound = new Audio("sounds/explosion_1.wav");
const explosionColors = ["#FF0000", "#FC6203", "#FCA503", "#FC6F03", "#FC3503"];

const inputSet = new Set();



window.onkeydown = function (event) {
    // Single events first

    if (event.key == " ") {
        fireMain();
    } else if (event.key == "s") {
        tank.reverse();
    } else if (event.key == "r") {
        // spawn robos
        robots.unshift(new Robot(Math.random() * 1500, Math.random() * 1500, 0));
        console.log("new bot: " + robots[0].x + "," + robots[0].y);
    } else {
        inputSet.add(event.key);
    }
}

window.onkeyup = function (event) {
    inputSet.delete(event.key);
}

function processInput() {

    // Movement controls: engage treads
    if (inputSet.has("a") && inputSet.has("d")) {
        tank.moveForward();
    } else if (inputSet.has("a")) {
        tank.updateOrientationByDelta(-tankRotateSpeed);
    } else if (inputSet.has("d")) {
        tank.updateOrientationByDelta(tankRotateSpeed);
    }

    // Turret controls
    if (inputSet.has("j")) {
        tank.rotateTurretByDelta(-turretRotateSpeed);
    } else if (inputSet.has("l")) {
        tank.rotateTurretByDelta(turretRotateSpeed);
    }

    // Fire machine guns
    if (inputSet.has("k")) {
        fireSecondary();
    }
}

var setup = function () {
    robots.push(new Robot(100, 100, 0));
    robots.push(new Robot(1000, 1000, 0));
    robots.push(new Robot(100, 1000, 0));
    robots.push(new Robot(1000, 100, 0));

    beginGame();
}();

function fireMain() {
    // TODO: check for ammo capacity
    if (projectiles.length == 0) {
        tank.playMainGunSound();
        projectiles.push(
            new Projectile(tank.projectileParams())
        );
    }
}

function fireSecondary() {
    // TODO: check for ammo capacity
    tracers.push(
        new TracerRound(tank.tracerRoundParams())
    );
    tank.playMachineGunSound();
}


function beginGame() {

    updateGameState();
    drawScene();
    requestAnimationFrame(beginGame);
}


function updateGameState() {

    // Clear prior "dead" stuff, robots, projectules, tracers
    tracers.length = 0;

    // Cull the dead robots
    deadRobots.forEach(robot => {
        let idx = robots.indexOf(robot);

        explosionSound.playbackRate = 1.20 - (Math.random() * 0.5);
        explosionSound.pause();
        explosionSound.currentTime = 0;
        explosionSound.play();

        // Remove robot
        if (idx > -1) {
            robots.splice(idx, 1);
        }
    });

    deadRobots.length = 0;;

    // Cull dead projectiles
    deadProjectiles.forEach(projectile => {
        let idx = projectiles.indexOf(projectile);
        if (idx > -1) {
            projectiles.splice(idx, 1);
        }
    });

    deadProjectiles.length = 0;

    // Update tank and robot positions
    processInput();

    let tankParams = tank.projectileParams();

    robots.forEach(robot => {
        robot.updatePosition(tankParams);
    });

    // Update projectiles, tagging any that are no longer "live"
    let params = tank.tracerRoundParams();
    projectiles.forEach(projectile => {
        if (projectile.isLive) {
            projectile.updatePosition();
            if (projectile.x > canvas.width || projectile.x < 0
                || projectile.y > canvas.height || projectile.y < 0) {
                deadProjectiles.push(projectile);
            }
        } else {
            deadProjectiles.push(projectile);
        }
    });


    // Determine projectile hits
    robots.forEach(robot => {
        // 
        // if (tracers.length > 0) {
        //     if (robot.detectTracerHit(params) == true) {
        //         // TODO: apply damage to robot
        //     }
        // }

        projectiles.forEach(projectile => {
            if (projectile.isLive && robot.detectProjectileHit(projectile.x, projectile.y)) {
                deadRobots.push(robot);
                projectile.isLive = false;
            }
        });
    });
}

function drawScene() {

    // Draw background
    context.fillStyle = "#29293d";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(context);

    tank.draw(context);

    robots.forEach(robot => {
        robot.draw(context);
    });

    deadRobots.forEach(robot => {
        drawExplosion(context, robot.x, robot.y);
    });

    projectiles.forEach(projectile => {
        projectile.drawProjectile(context);
    });

    tracers.forEach(tracer => {
        tracer.drawTracerRound(context);
    });

    // requestAnimationFrame(drawScene);
}

function drawExplosion(context, x, y) {
    context.fillStyle = explosionColors[Math.floor(Math.random() * explosionColors.length)];
    let radius = (Math.random() * 30) + 40;
    context.ellipse(x, y, radius, radius, Math.PI * 2, Math.PI * 2, false);
    context.fill();
}

function drawGrid(context) {
    context.strokeStyle = "#7575a3";
    for (var i = 0; i < 50; i++) {
        for (var j = 0; j < 50; j++) {
            context.strokeRect(i * 50, j * 50, 50, 50);
        }
    }
}
import { Tank } from './entities.js';
import { Robot } from './entities.js';
import { HelplessHumanoid } from './entities.js';
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

const tank = new Tank(500, 500, .5);
const tankRotateSpeed = 0.25;      // 0.25 is good
const turretRotateSpeed = 0.4;      // 0.4 is good

const robots = [];
const humans = [];

const projectiles = [];
const tracers = [];

const deadRobots = [];
const deadProjectiles = [];
const deadHumans = [];

const explosionSound = new Audio("sounds/explosion_1.wav");
const explosionColors = ["#FF0000", "#FC6203", "#FCA503", "#FC6F03", "#FC3503"];

const inputSet = new Set();






var setup = function () {


    humans.push(new HelplessHumanoid(randomRange(0, canvas.width), 600));
    humans.push(new HelplessHumanoid(randomRange(0, canvas.width), 600));
    humans.push(new HelplessHumanoid(randomRange(0, canvas.width), 600));

    for (var i = 0; i < 7; i++) {
       createRandomRobot();
    }

    beginGame();
}();

function randomRange(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function createRandomRobot() {
    
    let robotX = randomRange(0, canvas.width);

    let robotY = 0; 
    if (randomRange(0,2) == 1) {
        robotY = canvas.height;
    } 

    let robot = new Robot(robotX, robotY, 0);

    if (randomRange(0,2) == 1) {
        robot.setTarget(tank);
    } else {
        robot.setTarget(humans[randomRange(0, humans.length)]);
    }


    robots.push(robot);
}

function beginGame() {
    updateGameState();
    drawScene();
    requestAnimationFrame(beginGame);
}


window.onkeydown = function (event) {
    if (event.key == " ") { // Space bar : main gun
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





function updateGameState() {

    if (robots.length < 5) {
        for (var r = 0; r < 5 - robots.length; r++) {
            createRandomRobot();
        }
    }

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

    // Remove any dead projectiles from the projectiles array
    deadProjectiles.forEach(projectile => {
        let idx = projectiles.indexOf(projectile);
        if (idx > -1) {
            projectiles.splice(idx, 1);
        }
    });

    deadProjectiles.length = 0;

    // Cull the dead humans
    deadHumans.forEach(human => {
        let idx = humans.indexOf(human);
        if (idx > -1) {
            humans.splice(idx, 1);
        }
    });

    // Update tank and robot positions
    processInput();

    let tankParams = tank.projectileParams();
    robots.forEach(robot => {
        robot.updatePosition();
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

    projectiles.forEach(projectile => {

        robots.forEach(robot => {
            if (projectile.isLive && robot.detectProjectileHit(projectile.x, projectile.y)) {
                deadRobots.push(robot);
                projectile.isLive = false;
            }
        });

        humans.forEach(human => {
            if (projectile.isLive && human.detectProjectileHit(projectile.x, projectile.y)) {
                deadHumans.push(human);
                projectile.isLive = false;
            }
        });

    });

    humans.forEach(human => {
        if (human.checkForTankCollision(tankParams.x, tankParams.y) == true) {
            console.log("crushed human!")
            deadHumans.push(human);
        }

        robots.forEach(robot => {
            if (human.checkForRobotCollision(robot.x, robot.y) == true) {
                console.log("robot killed human");
                deadHumans.push(human);
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

    humans.forEach(humanoid => {
        humanoid.draw(context);
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
import { TankEntity } from './entity.js';
import { Projectile } from './entity.js';
import { TracerRound } from './entity.js';
import { Robot } from './entity.js';

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

const tank = new TankEntity(500, 500);
const tankRotateSpeed = 0.25;
const turretRotateSpeed = 0.5;

const robots = [];


const projectiles = [];
const tracers = [];



const inputSet = new Set();

window.onkeydown = function (event) {
    // Single events first

    if (event.key == " ") {
        fireMain();
    } else if (event.key == "s") {
        tank.reverse();
    } else if (event.key == "p") {
        robots.push(new Robot(Math.random() * 1500, Math.random() * 1500, 0));
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

    if (inputSet.has("k")) {
        fireSecondary();
    }
}

var setup = function () {
    robots.push(new Robot(100, 100, 0));
    robots.push(new Robot(1000, 1000, 0));
    robots.push(new Robot(100, 1000, 0));
    robots.push(new Robot(1000, 100, 0));

    drawScene();
}();

function fireMain() {
    // TODO: check for ammo capacity
    projectiles.push(
        new Projectile(tank.projectileParams())
    );
}

function fireSecondary() {
    // TODO: check for ammo capacity
    tracers.push(
        new TracerRound(tank.tracerRoundParams())
    );
}

function updateGameState() {

}

function drawScene() {
    processInput();

    // Draw background
    context.fillStyle = "#29293d";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(context);

    tank.draw(context);

    robots.forEach(robot => {
        robot.draw(context);
    });

    let deadProjectiles = [];

    // Update projectiles, tagging any that are no longer "live"
    projectiles.forEach(projectile => {
        if (projectile.isLive) {
            projectile.updatePosition();
            projectile.drawProjectile(context);
            if (projectile.x > canvas.width || projectile.x < 0
                || projectile.y > canvas.height || projectile.y < 0) {
                    deadProjectiles.push(projectile);
            }
        } else {
            deadProjectiles.push(projectile);
        }
    });

    // Cull dead projectiles
    deadProjectiles.forEach(projectile => {
        let idx = projectiles.indexOf(projectile);
        if (idx > -1) {
            projectiles.splice(idx, 1);
        }
    });


    // Determine any hits
    let params = tank.tracerRoundParams();
    robots.forEach(robot => {
        
        if (tracers.length > 0){
            if (robot.detectTracerHit(params) == true) {
                // TODO: apply damage to robot
                console.log("tracer hit robot: " + robot);
            }
        }

        let deadRobots = [];
        if (projectiles.length > 0) {
        projectiles.forEach(projectile => {
            if (projectile.isLive && robot.detectProjectileHit(projectile.x, projectile.y)) {
                // TODO: remove robot
                console.log("proj hit robot: " + robot);
                deadRobots.push(robot);
                projectile.isLive = false;
            }
        });
    }
        // Cull the dead robots
        deadRobots.forEach(robot => {
            let idx = robots.indexOf(robot);
            if (idx > -1) {
                robots.splice(idx, 1);
            }
        });
    });


    tracers.forEach(tracer => {
        tracer.drawTracerRound(context);
        tracers.shift();
    });

    requestAnimationFrame(drawScene);
}

function drawGrid(context) {
    context.strokeStyle = "#7575a3";
    for (var i = 0; i < 50; i++) {
        for (var j = 0; j < 50; j++) {
            context.strokeRect(i * 50, j * 50, 50, 50);
        }
    }
}
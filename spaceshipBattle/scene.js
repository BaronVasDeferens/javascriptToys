import { ImageAsset, SoundAsset } from "./assets.js";
import { Entity, EntityEnemy, Timer, TimedLooper, EntityRoadFollower, Projectile, EntityExplosion, EntityFire, EntityText } from "./entity.js";
import { BlinkEffectTransition, Transition } from "./transition.js";


//  ------------------------------------ SCENES ------------------------------------

export const SceneType = Object.freeze({
    NO_SCENE: "NO_SCENE",
    INTRO: "INTRO",
    SELECT_ZONE: "SELECT_ZONE",
    SELECT_SQUAD: "SELECT_SQUAD",
    FIGHT_BATTLE: "FIGHT_BATTLE",
    AFTER_BATTLE: "AFTER_BATTLE",
});



export class Scene {

    backgroundImage = new Image();

    constructor(sceneType, canvas, assetManager, soundPlayer) {
        this.sceneType = sceneType;
        this.canvas = canvas;
        this.assetManager = assetManager;
        this.soundPlayer = soundPlayer;
    }

    initialize() {

    }

    onStart() {

    }

    onStop() {

    }

    onMouseDown(click) {

    }

    onMouseUp(click) {

    }

    onMouseMove(event) {

    }

    onKeyPressed(event) {

    }

    update(delta) {

    }

    render(context) {

    }

}



export class BlankScene extends Scene {

    constructor(canvas, assetManager, soundPlayer) {
        super(SceneType.NO_SCENE, canvas, assetManager, soundPlayer);
    }

    onStart() {

    }

    onStop() {

    }

    update(delta) {

    }

    render(context) {
        context.fillStyle = "#000000";
        context.globalAlpha = 1.0;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}



/**
 * INTRO SCENE
 * 
 * Re-rendered PNG over a moving starfield
 */


export class IntroScene extends Scene {

    stars = [];

    constructor(canvas, assetManager, soundPlayer) {

        super(SceneType.INTRO, canvas, assetManager, soundPlayer);

        this.backgroundImage = assetManager.getImage(ImageAsset.INTRO_LOGO);


        // Set up the starfield...
        let colorIntensity = [
            "#3e6cacff",
            "#719fdfff",
            "#e3eeffff",
            "#ffffffff"
        ]

        for (let i = 0; i < 150; i++) {

            let x = this.randomInRange(0, this.canvas.width);
            let y = this.randomInRange(0, this.canvas.height);
            let size = this.randomInRange(1, 3);
            let speed = 15 * size;
            let color = colorIntensity[size - 1];

            this.stars.push(
                {
                    x: x,
                    y: y,
                    size: size,
                    speed: speed,
                    color: color,
                }
            )
        }

    }

    randomInRange(min, max) {
        let range = Math.abs(max - min);
        return Math.floor(Math.random() * max) + min;
    }

    onStart() {

    }

    onStop() {

    }

    update(delta) {
        this.stars.forEach(star => {

            let distance = star.speed * (delta / 1000);
            star.y = (star.y + distance) ;

            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = this.randomInRange(0, this.canvas.width);
            }
        })
    }

    onMouseDown(click) {
        //this.soundPlayer.playOneShot(SoundAsset.MACHINEGUN_1);
    }

    onKeyPressed(event) {

    }

    render(context) {

        context.fillStyle = "#000000";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);


        this.stars.forEach(star => {

            context.fillStyle = star.color;

            if (star.size == 1) {
                context.fillRect (star.x, star.y, 1, 1);
            } else {
                context.beginPath();
                context.arc(
                    star.x,
                    star.y,
                    star.size / 2,
                    0,
                    2 * Math.PI
                );
                context.fill();
            }
        });

        context.drawImage(this.backgroundImage, 0, 0);
    }
}

export class ZoneSelectionScene extends Scene {


    // TEMPORARY: entities that are not permanent but will persist for long than a single update/rendering cycle
    entitiesTemporary = [];

    // TRANSIENT: entities that will cleared after a single update/rendering cycle.
    entitiesTransient = [];

    // ENEMIES: entities that can harm the player or be destoryed by projectiles. You know-- the baddies.
    entitiesEnemies = [];

    // PROJECTILES (PLAYER): bullets originating from the player which may damage or destroy enemy entities
    projectilesPlayer = [];

    // TIMERS: measures time and executes instructions once or at fixed intervals
    timers = [];

    constructor(canvas, assetManager, soundPlayer) {
        super(SceneType.SELECT_ZONE, canvas, assetManager, soundPlayer);
    }

    onStart() {

        // !!!!!! ANIMATION TEST !!!!!
        //Add some varibale speed entities
        this.entitiesTemporary = [];

        for (let i = 1; i < 10; i++) {

            this.entitiesTemporary.push(
                new EntityFire(
                    0,
                    i * 64,
                    false,
                    i * 100,
                    this.assetManager
                )
            );

            this.entitiesTemporary.push(
                new EntityExplosion(
                    64,
                    i * 64,
                    false,
                    i * 100,
                    this.assetManager
                )
            );
        }

    }

    onStop() {

    }

    update(delta) {
        this.entitiesTemporary.forEach(enemy => {
            enemy.update(delta);
        });
    }

    onMouseDown(click) {
        //this.soundPlayer.playOneShot(SoundAsset.MACHINEGUN_2);
    }

    onKeyPressed(event) {

    }

    render(context) {
        context.fillStyle = "#0000ff";
        context.globalAlpha = 1.0;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.entitiesTemporary.forEach(enemy => {
            enemy.render(context);
        });

        this.entitiesTransient.forEach(transient => {
            transient.render(context)
        });

        this.entitiesTransient = [];

        //this.backgroundImage.src = this.canvas.toDataURL();
    }

}


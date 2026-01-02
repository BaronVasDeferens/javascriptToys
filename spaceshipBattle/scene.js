import { SoundAsset } from "./assets.js";
import { Entity, EntityEnemy, Timer, TimedLooper, EntityRoadFollower, Projectile, EntityExplosion, EntityFire, EntityText } from "./entity.js";
import { ColorWipeTransition, Transition } from "./transition.js";


export const SceneType = Object.freeze({
    NO_SCENE: "NO_SCENE",
    INTRO: "INTRO",
    SELECT_ZONE: "SELECT_ZONE",
    SELECT_SQUAD: "SELECT_SQUAD",
    FIGHT_BATTLE: "FIGHT_BATTLE",
    AFTER_BATTLE: "AFTER_BATTLE",
});


export class SceneManager {

    sceneMap = new Map();
    currentSceneType = SceneType.NO_SCENE;

    transitions = [];

    constructor(canvas, assetManager, soundPlayer) {
        this.canvas = canvas;
        this.assetManager = assetManager;
        this.soundPlayer = soundPlayer;
        this.sceneMap.set(SceneType.NO_SCENE, new BlankScene(canvas, assetManager, soundPlayer));
        this.sceneMap.set(SceneType.INTRO, new IntroScene(canvas, assetManager, soundPlayer));
        this.sceneMap.set(SceneType.SELECT_ZONE, new ZoneSelectionScene(canvas, assetManager, soundPlayer));
    }

    initialize() {
        this.getCurrentScene().onStop();
        this.currentSceneType = SceneType.NO_SCENE;
    }

    setCurrentSceneType(newSceneType) {

        if (newSceneType != this.currentSceneType) {

            console.log(`scene change: ${this.currentSceneType} -> ${newSceneType}`);

            // Create a transition
            this.transitions.push(
                new ColorWipeTransition(
                    this.getCurrentScene(),
                    this.sceneMap.get(newSceneType),
                    this.canvas,
                    "#c3ff00ff",
                    500
                )
            );

            // console.log(`transitions size: ${this.transitions.length}`);

            this.getCurrentScene().onStop();
            this.currentSceneType = newSceneType;
            this.getCurrentScene().onStart();
        }
    }

    getCurrentScene() {
        return this.sceneMap.get(this.currentSceneType);
    }

    onMouseDown(click) {

        if (this.transitions.length > 0) {
            return
        }

        this.getCurrentScene().onMouseDown(click);
    }

    onMouseUp(click) {

        if (this.transitions.length > 0) {
            return
        }

        this.getCurrentScene().onMouseUp(click);
    }

    onMouseMove(event) {

        if (this.transitions.length > 0) {
            return
        }

        this.getCurrentScene().onMouseMove(event);
    }

    onKeyPressed(event) {

        if (this.transitions.length > 0) {
            return
        }

        this.getCurrentScene().onKeyPressed(event);
    }

    update(delta) {

        this.getCurrentScene().update(delta);

        this.transitions.forEach(transition => {
            transition.update(delta);
        });

        this.transitions = this.transitions.filter(transition => {
            return !(transition.isFinished)
        });
    }

    render(context) {

        // context.fillStyle = "#000000ff";
        // context.globalAlpha = 1.0;
        // context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.transitions.length > 0) {
            this.transitions.forEach(transition => {
                // console.log(`rendering transition ${transition.constructor.name}`)
                transition.render(context);
            });
        } else {
            this.getCurrentScene().render(context);
        }


    }
}

//  ------------------------------------ SCENES ------------------------------------

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
        context.fillStyle = "#ff0000ff";
        context.globalAlpha = 1.0;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export class IntroScene extends Scene {

    constructor(canvas, assetManager, soundPlayer) {
        super(SceneType.INTRO, canvas, assetManager, soundPlayer);
    }

    onStart() {

    }

    onStop() {

    }

    update(delta) {

    }

    onMouseDown(click) {
        this.soundPlayer.playOneShot(SoundAsset.MACHINEGUN_1);
    }

    onKeyPressed(event) {

    }

    render(context) {
        context.fillStyle = "#00ff00";
        context.globalAlpha = 1.0;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        //this.backgroundImage.src = this.canvas.toDataURL();
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
        this.soundPlayer.playOneShot(SoundAsset.MACHINEGUN_2);
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


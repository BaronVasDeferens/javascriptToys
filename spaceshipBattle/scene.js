import { SoundAsset } from "./assets.js";
import { Entity, EntityEnemy, Timer, TimedLooper, EntityRoadFollower, Projectile, EntityExplosion, EntityFire, EntityText } from "./entity.js";


export const SceneType = Object.freeze({
    NO_SCENE: 10,
    INTRO: 20,
    SELECT_ZONE: 30,
    SELECT_SQUAD: 40,
    FIGHT_BATTLE: 50,
    AFTER_BATTLE: 60
});


export class SceneManager {

    sceneMap = new Map();
    currentSceneType = SceneType.NO_SCENE;

    constructor(canvas, assetManager, soundPlayer) {
        this.canvas = canvas;
        this.assetManager = assetManager;
        this.soundPlayer = soundPlayer;
        this.sceneMap.set(SceneType.NO_SCENE, new BlankScene(canvas, assetManager, soundPlayer));
        this.sceneMap.set(SceneType.INTRO, new IntroScene(canvas, assetManager, soundPlayer));
        this.sceneMap.set(SceneType.SELECT_ZONE, new ZoneSelectionScene(canvas, assetManager, soundPlayer));
    }

    setCurrentSceneType(type) {
        if (type != this.currentSceneType) {
            this.getCurrentScene().onStop();
            this.currentSceneType = type;
            this.getCurrentScene().onStart();
        }
    }

    getCurrentScene() {
        return this.sceneMap.get(this.currentSceneType);
    }

    processMouseEvent(event) {
        this.getCurrentScene().processMouseEvent(event);
    }

    processKeyboardEvent(event) {
        this.getCurrentScene().processKeyboardEvent(event);
    }

    update(delta) {
        this.getCurrentScene().update(delta);
    }

    render(context) {
        context.fillStyle = "#000000ff";
        context.globalAlpha = 1.0;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.getCurrentScene().render(context);
    }
}

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

    processMouseEvent(event) {

    }

    processKeyboardEvent(event) {

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

    processMouseEvent(event) {

    }

    processKeyboardEvent(event) {

    }

    render(context) {
        context.fillStyle = "#000000";
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

    processMouseEvent(event) {
        this.soundPlayer.playOneShot(SoundAsset.MACHINEGUN_1);
    }

    processKeyboardEvent(event) {

    }

    render(context) {
        context.fillStyle = "#00ff00";
        context.globalAlpha = 1.0;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
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

    processMouseEvent(event) {
        this.soundPlayer.playOneShot(SoundAsset.MACHINEGUN_2);
    }

    processKeyboardEvent(event) {

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
    }

}

import { ImageAsset } from "./assets.js";
import { Entity, EntityExplosion, EntityFire } from "./entity.js";
import { GridMap } from "./gridmap.js";


//  ------------------------------------ SCENES ------------------------------------

export const SceneType = Object.freeze({
    NO_SCENE: "NO_SCENE",
    INTRO: "INTRO",
    GRID_TEST: "GRID_TEST",
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

    onVisibilityStateChanged(state) {

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
 * STARFIELD INTRO SCENE
 * A moving starfield and graphic logo
 */


export class StarfieldIntroScene extends Scene {

    stars = [];

    constructor(canvas, assetManager, soundPlayer) {
        super(SceneType.INTRO, canvas, assetManager, soundPlayer);
        this.backgroundImage = assetManager.getImage(ImageAsset.INTRO_LOGO);
    }

    initializeStarfield() {

        this.stars = [];

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
        this.initializeStarfield();
    }

    onStop() {
        this.stars = [];
    }

    onVisibilityStateChanged(state) {
        switch (state) {
            case 'visible':
                this.onStart();
                break;

            case 'hidden':
                this.onStop();
                break;

            default:
                break;
        }
    }

    update(delta) {
        this.stars.forEach(star => {

            let distance = star.speed * (delta / 1000);
            star.y = (star.y + distance);

            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = this.randomInRange(0, this.canvas.width);
            }
        })
    }

    onMouseDown(click) {

    }

    onKeyPressed(event) {

    }

    render(context) {

        context.fillStyle = "#000000";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);


        this.stars.forEach(star => {

            context.fillStyle = star.color;

            if (star.size == 1) {
                context.fillRect(star.x, star.y, 1, 1);
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


/**
 * GRID MAP SCENE
 * Movement and combat on a grid-based battlefield
 */
export class GridMapScene extends Scene {

    gridMap = null;
    entities = [];

    GamePhase = Object.freeze({
        IDLE: "IDLE",
        PLAYER_ENTITY_SELECTED: "PLAYER_ENTITY_SELECTED"
    });

    phase = this.GamePhase.IDLE;

    selectedEntity = null;
    selectedEntityGhost = null;

    constructor(tileSize, canvas, assetManager, soundPlayer) {

        super(SceneType.GRID_TEST, canvas, assetManager, soundPlayer);

        this.tileSize = tileSize;
        this.gridMap = new GridMap(
            tileSize,
            canvas,
            assetManager
        );

        let creaturesImages = [
            ImageAsset.DINOSAUR_1,
            ImageAsset.DINOSAUR_2,
            ImageAsset.ALIEN_1,
            ImageAsset.ALIEN_2,
            ImageAsset.ALIEN_3
        ];
        
        this.shuffleArray(creaturesImages);

        creaturesImages.forEach(imageAssetId => {
            this.entities.push(
                new Entity(
                    this.randomInRange(tileSize, this.canvas.width - tileSize),
                    this.randomInRange(tileSize, this.canvas.height - tileSize),
                    assetManager.getImage(imageAssetId)
                )
            )
        });

    }

    randomInRange(min, max) {
        let range = Math.abs(max - min);
        return Math.floor(Math.random() * range) + min
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    render(context) {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.gridMap.render(context);
        this.entities.forEach(entity => {
            entity.render(context);
        });

        if (this.selectedEntityGhost != null) {
            this.selectedEntityGhost.render(context);
        }
    }

    onMouseDown(click) {

        if (this.phase == this.GamePhase.IDLE && this.selectedEntity == null) {
            // find the entity under the mouse click
            let candidate = this.entities.filter(entity => {
                return entity.wasClicked(click)
            })[0];

            if (candidate != null) {
                this.phase = this.GamePhase.PLAYER_ENTITY_SELECTED;
                this.selectedEntity = candidate;
                let coords = this.selectedEntity.getCenteredCoordsOnMouse(click);
                this.selectedEntityGhost = new Entity(coords.x, coords.y, this.selectedEntity.image);
                this.selectedEntity.setAlpha(0.25);
            }
        }
    }

    onMouseUp(click) {

        switch (this.phase) {
            case this.GamePhase.IDLE:
                break;

            case this.GamePhase.PLAYER_ENTITY_SELECTED:
                this.selectedEntity.x = this.selectedEntityGhost.x;
                this.selectedEntity.y = this.selectedEntityGhost.y;
                this.selectedEntity.setAlpha(1.0);
                this.selectedEntity = null;
                this.selectedEntityGhost = null;
                this.phase = this.GamePhase.IDLE;
                break;
        }


    }

    onMouseMove(event) {

        switch (this.phase) {

            case this.GamePhase.IDLE:
                break;

            case this.GamePhase.PLAYER_ENTITY_SELECTED:
                let coords = this.selectedEntity.getCenteredCoordsOnMouse(event);
                this.selectedEntityGhost.x = coords.x;
                this.selectedEntityGhost.y = coords.y;
                break;

            default:
                break;
        }
    }

    onKeyPressed(event) {

    }

}

export class AnimationTestScene extends Scene {


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



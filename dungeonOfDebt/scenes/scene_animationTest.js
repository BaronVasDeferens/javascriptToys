import { Scene, SceneType } from "./scene.js";


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
import { Scene, SceneType } from "./scene.js";
import { ImageAsset } from "../assets.js";

/**
 * STARFIELD INTRO SCENE
 * A moving starfield and graphic logo
 */

export class StarfieldIntroScene extends Scene {

    // Set up the starfield...
    colorIntensity = [
        "#3e6cacff",
        "#719fdfff",
        "#e3eeffff",
        "#ffffffff"
    ];

    stars = [];

    constructor(canvas, assetManager, soundPlayer) {
        super(SceneType.INTRO, canvas, assetManager, soundPlayer);
        this.backgroundImage = assetManager.getImage(ImageAsset.INTRO_LOGO);
    }

    initializeStarfield() {

        this.stars = [];

        // "Hyperspace" stars (Star Trek viewport style)
        for (let i = 0; i < 300; i++) {
            this.stars.push(
                this.createStar()
            )
        };
    }

    createStar() {

        let screenCenterX = this.canvas.width / 2;
        let screenCenterY = this.canvas.height / 2;

        let size = this.randomInRange(1, 3);
        let speed = 5 * size;
        let color = this.colorIntensity[size - 1];

        let deltaX = this.randomInRange(-20, 20);
        let deltaY = this.randomInRange(-20, 20);

        return {
            x: screenCenterX,
            y: screenCenterY,
            size: size,
            speed: speed,
            deltaX: deltaX,
            deltaY: deltaY,
            color: color
        }
    }

    randomInRange(min, max) {
        let range = Math.abs(max - min);
        return Math.floor(Math.random() * range) + min;
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

            star.x += (star.speed * star.deltaX) * (delta / 1000);
            star.y += (star.speed * star.deltaY) * (delta / 1000);

            // Remove any star that has exited the viewport and add a new one
            if (
                star.x < 0
                || star.x > this.canvas.width
                || star.y < 0
                || star.y > this.canvas.height) {

                let index = this.stars.indexOf(star);
                if (index > -1) {
                    this.stars.splice(index, 1);
                }

                this.stars.push(this.createStar());
            }

        });
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

        context.drawImage(
            this.backgroundImage,
            (this.canvas.width / 2) - (this.backgroundImage.width / 2),
            (this.canvas.height / 2) - (this.backgroundImage.height / 2)
        );
    }
}
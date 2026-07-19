import { Hex } from "./hex.js";

export const PipType = Object.freeze({
    CIRCLE_OUTLINE: "CIRCLE_OUTLINE",
    CIRCLE_FILLED: "CIRCLE_FILLED",
    TRIANGLE_OUTLINE: "TRIANGLE_OUTLINE",
    TRIANGLE_FILLED: "TRIANGLE_FILLED"
});



export class Pip {

    points = [];
    color = "#FF00FF";
    type = PipType.CIRCLE_OUTLINE;
    radius = 10;
    facing = null;

    constructor(hex, type, facing) {

        this.hex = hex;
        this.type = type;
        this.facing = facing;

        switch (this.type) {

            case PipType.TRIANGLE_FILLED:
            case PipType.TRIANGLE_OUTLINE:

                let center = hex.center;
                let xShift = hex.hexSize / 2;
                let yShift = Math.tan((60 * Math.PI) / 180) + (hex.hexSize / 3);

                // top point
                let a = {
                    x: hex.points[0].x + xShift,
                    y: hex.points[0].y + yShift
                };

                // right point
                let b = {
                    x: center.x + xShift,
                    y: center.y + yShift
                };

                // left point
                let c = {
                    x: hex.points[5].x + xShift,
                    y: hex.points[5].y + yShift
                };

                this.points = [a, b, c];

                if (this.type == PipType.TRIANGLE_FILLED) {

                    this.render = function (context) {
                        context.fillStyle = this.color;
                        context.beginPath();
                        context.moveTo(this.points[0].x, this.points[0].y);
                        context.lineTo(this.points[1].x, this.points[1].y);
                        context.lineTo(this.points[2].x, this.points[2].y);
                        context.closePath();
                        context.fill();
                    }

                } else {

                    this.render = function (context) {
                        context.strokeStyle = this.color;
                        context.lineWidth = 2;
                        context.beginPath();
                        context.moveTo(this.points[0].x, this.points[0].y);
                        context.lineTo(this.points[1].x, this.points[1].y);
                        context.lineTo(this.points[2].x, this.points[2].y);
                        context.closePath();
                        context.stroke();
                    }
                }

                break;

            case PipType.CIRCLE_FILLED:

                this.render = function (context) {
                    context.fillStyle = "#FF00FF"
                    context.beginPath();
                    context.arc(
                        hex.center.x,
                        hex.center.y,
                        this.radius,
                        0,
                        2 * Math.PI);
                    context.fill();
                }

                break;

            case PipType.CIRCLE_OUTLINE:

                this.render = function (context) {
                    context.strokeStyle = "#FF00FF";
                    context.lineWidth = 2;
                    context.beginPath();
                    context.arc(
                        hex.center.x,
                        hex.center.y,
                        this.radius,
                        0,
                        2 * Math.PI);
                    context.stroke();
                }

                break;
        }

    }
}
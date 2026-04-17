import { Entity } from "./entity.js";
import { ImageAsset } from "../assets.js";

export class PlayerEntity extends Entity {

    image = null;
    imageAlpha = 1.0;

    offsetX = 0;
    offsetY = 0;

    constructor(room, tileSize, assetManager) {
        super(tileSize, assetManager);

        this.image = this.assetManager.getImage(ImageAsset.WIZARD_1);

        this.setRoom(room);
        room.setOccupant(this);

        // Centers the tile if it is smaller than tileSize
        if (this.image.width < this.tileSize) {
            this.offsetX = Math.floor((this.tileSize - this.image.width) / 2);
        }

        if (this.image.height < this.tileSize) {
            this.offsetY = Math.floor((this.tileSize - this.image.height) / 2);
        }

    }

    render(context) {
        context.globalAlpha = this.imageAlpha;
        context.drawImage(this.image, this.x + this.offsetX, this.y + this.offsetY);
        context.globalAlpha = 1.0;
    }
};
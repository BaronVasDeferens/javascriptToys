import { Entity } from "./entity.js";
import { ImageAsset } from "../assets.js";

const MonsterBehavior = Object.freeze({
    RANDOM: 10,                     // Moves to a random adjacent square
    CHASE_LINE_OF_SIGHT: 20,        // Moves toward the player if it can draw LOS to him    
    CHASE_OMNISCIENT: 30            // Moves toward the player regardless of LOS
})

export class EnemyEntity extends Entity {

    x = 0;
    y = 0;

    image = null;
    room = null;

    spellEffects = new Set();

    constructor(tileSize, assetManager) {
        super(0, 0, tileSize);
        this.tileSize = tileSize;
        this.image = assetManager.getImage(ImageAsset.MONSTER_EYE_SMALL);
    }

    setRoom(room) {
        this.room = room;
        this.x = this.room.col * this.tileSize;
        this.y = this.room.row * this.tileSize;
    }

    render(context, mazeWindowX, mazeWindowY) {
        context.drawImage(
            this.image,
            this.x + ((this.tileSize - this.image.width) / 2),
            this.y + ((this.tileSize - this, this.image.height) / 2)
        );
    }

}
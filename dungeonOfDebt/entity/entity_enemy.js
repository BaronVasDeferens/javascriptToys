import { Entity } from "./entity.js";

export class EnemyEntity extends Entity {

    constructor(columnIndex, rowIndex, tileSize, image) {
        super(columnIndex, rowIndex, tileSize, image);
    }

}
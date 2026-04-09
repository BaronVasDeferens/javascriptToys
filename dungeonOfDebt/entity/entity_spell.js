import { ImageAsset } from "../assets.js";


export const SpellZone = Object.freeze({
    CANCEL: 0,
    CROSS_SMALL: 2,
    COLUMN_FULL: 5,
    ROW_FULL: 7
});

export const SpellEffect = Object.freeze({
    FREEZE_ENEMIES: 0,
});


export class SpellZoneComponentCard {

    image = null;
    discharged = false;

    constructor(spellZone, canvas, x, y, tileSize, assetManager) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.tileSize = tileSize;
        this.spellZone = spellZone;

        switch (spellZone) {

            case SpellZone.CANCEL:
                this.image = assetManager.getImage(ImageAsset.SPELL_CANCEL);
                break;
            case SpellZone.CROSS_SMALL:
                this.image = assetManager.getImage(ImageAsset.SPELL_ZONE_CROSS);
                break;
            case SpellZone.COLUMN_FULL:
                this.image = assetManager.getImage(ImageAsset.SPELL_ZONE_COLUMN);
                break;
            case SpellZone.ROW_FULL:
                this.image = assetManager.getImage(ImageAsset.SPELL_ZONE_ROW);
                break;
        }
    }

    containsPoint(click) {

        if (click.offsetX >= this.x
            && click.offsetX <= this.x + this.tileSize
            && click.offsetY >= this.y
            && click.offsetY <= this.y + this.tileSize
        ) {
            return true;
        } else {
            return false;
        }
    }

    render(context) {
        context.drawImage(this.image, this.x, this.y);
    }

}





export class Spell {

    constructor(spellEffect, spellZone) {
        this.spellEffect = spellEffect;
        this.spellZone = spellZone;
    }

    render(context) {

    }

}
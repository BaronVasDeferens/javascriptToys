import { ImageAsset } from "../assets.js";


export const SpellZone = Object.freeze({
    CANCEL: 0,
    CROSS_SMALL: 2,
    // TODO: INVERTED CROSS
    COLUMN_FULL: 5,
    ROW_FULL: 7
    // TODO: LINE_OF_SIGHT
});

export const SpellEffect = Object.freeze({
    CANCEL: 0,
    FREEZE: 2,
    BLAZE : 3,
    PHASE : 4,
});


export class ComponentCard {

    image = null;
    discharged = false;

    constructor(canvas, x, y, tileSize) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.tileSize = tileSize;
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

export class SpellZoneComponentCard extends ComponentCard {

    constructor(spellZone, onClick, canvas, x, y, tileSize, assetManager) {
        super(canvas, x, y, tileSize);
        this.onClick = onClick;
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
}

export class SpellEffectComponentCard extends ComponentCard {

    spellEffect = null;

    constructor(spellEffect, onClick, canvas, x, y, tileSize, assetManager) {
        super(canvas, x, y, tileSize);
        this.onClick = onClick;
        this.spellEffect = spellEffect;

        switch (spellEffect) {

            case SpellEffect.CANCEL:
                this.image = assetManager.getImage(ImageAsset.SPELL_CANCEL);
                break;
            case SpellEffect.BLAZE:
                this.image = assetManager.getImage(ImageAsset.SPELL_CARD_BLAZE);
                break;
            case SpellEffect.FREEZE:
                this.image = assetManager.getImage(ImageAsset.SPELL_CARD_FREEZE);
                break;
            case SpellEffect.PHASE:
                this.image = assetManager.getImage(ImageAsset.SPELL_CARD_PHASE);
                break;
        }
    }
}



export class SpellEffectOverlay {

    alpha = 1.0;

    constructor(canvas, color) {
        this.canvas = canvas;
        this.color = color;
    }

    update(deltaMillis) {

    }

    render(context) {
        context.globalAlpha = this.alpha;
        context.fillStyle = this.color;
        context.fillRect(0,0, this.canvas.width, this.canvas.height)
        context.globalAlpha = 1.0;
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
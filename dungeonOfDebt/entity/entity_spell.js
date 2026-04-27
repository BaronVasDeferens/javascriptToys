import { ImageAsset } from "../assets.js";


export const SpellZone = Object.freeze({
    CANCEL: 0,
    CROSS_SMALL: 2,
    CROSS_INVERTED: 4,
    COLUMN_FULL: 5,
    ROW_FULL: 6,
    SELF_TARGET: 7
    // TODO: LINE_OF_SIGHT?
});

export const SpellEffect = Object.freeze({
    CANCEL: 0,
    FREEZE: 2,
    BLAZE: 3,
    PHASE: 4,
    INVERT: 5,
});

/*
    spell ideas
        break apart walls
        light (maze is dark otherwise, monsters harder to see)
*/

export class ComponentCard {

    image = null;
    discharged = false;
    alpha = 1.0;

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
        context.globalAlpha = this.alpha;
        context.drawImage(this.image, this.x, this.y);
    }
}

/**
 * Spell Zone Component Card
 * A clickable UI element which allows the user to specify a zone (set of squares)
 * for a spell effect
 */
export class SpellZoneComponentCard extends ComponentCard {

    isSelected = false;

    constructor(spellZone, onClick, canvas, x, y, tileSize, assetManager) {
        super(canvas, x, y, tileSize);
        this.onClick = onClick;
        this.spellZone = spellZone;
        this.assetManager = assetManager;

        switch (spellZone) {

            case SpellZone.CANCEL:
                this.image = assetManager.getImage(ImageAsset.SPELL_CANCEL);
                break;
            case SpellZone.CROSS_SMALL:
                this.image = assetManager.getImage(ImageAsset.SPELL_ZONE_CROSS);
                break;
            case SpellZone.CROSS_INVERTED:
                this.image = assetManager.getImage(ImageAsset.SPELL_ZONE_CROSS_INVERTED);
                break;
            case SpellZone.COLUMN_FULL:
                this.image = assetManager.getImage(ImageAsset.SPELL_ZONE_COLUMN);
                break;
            case SpellZone.ROW_FULL:
                this.image = assetManager.getImage(ImageAsset.SPELL_ZONE_ROW);
                break;
            case SpellZone.SELF_TARGET:
                this.image = assetManager.getImage(ImageAsset.SPELL_ZONE_WIZARD_ONLY);
                break;
        }
    }

    render(context) {

        super.render(context)

        if (this.isSelected == true) {
            context.globalAlpha = 1.0;
            context.drawImage(this.assetManager.getImage(ImageAsset.SPELL_SECTION_OVERLAY), this.x, this.y);
        }

    }
}

/**
 * Spell Effect Component Card
 * A clickable UI element which represents a spell effect (e.g. freeze) 
 */
export class SpellEffectComponentCard extends ComponentCard {

    spellEffect = null;

    constructor(spellEffect, onClick, canvas, x, y, tileSize, assetManager) {
        super(canvas, x, y, tileSize);
        this.onClick = onClick;
        this.spellEffect = spellEffect;
        this.alpha = 0.25;

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
            case SpellEffect.INVERT:
                this.image = assetManager.getImage(ImageAsset.SPELL_CARD_INVERT);
                break;
        }
    }
}


/**
 * Spell Effect Overlay
 * Draws color over the top of the specified canvas.
 * Driven by the SpellEffectOverlayDriver (see drivers.js)
 */
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
        context.fillRect(0, 0, this.canvas.width, this.canvas.height)
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
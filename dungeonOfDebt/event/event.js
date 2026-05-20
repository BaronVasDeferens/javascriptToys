import { AssetManager, ImageAsset, SoundAsset } from "../assets.js";
import { PlayerEntity } from "../entity/entity_player.js"
import { SpellEffect } from "../entity/entity_spell.js";


export class MazeEvent {

    id = crypto.randomUUID();

    x = 0;
    y = 0;

    onTrigger = null;
    color = "#FF0000"

    alpha = 1.0;

    isVisible = true;
    isOneShot = true;
    isActive = true;

    spellEffects = new Set();

    constructor(onTrigger, color) {
        this.onTrigger = onTrigger;
        this.color = color;
    }

    setAlpha(alpha) {
        this.alpha = alpha;
    }

    setIsVisible(isVisible) {
        this.isVisible = isVisible;
    }

    render(context, mazeWindowX, mazeWindowY) {
        if (this.isActive == true && this.isVisible == true) {
            context.globalAlpha = this.alpha;
            context.drawImage(
                this.image,
                this.x,
                this.y
            )
        }
    }

    applySpellEffect(effect) {

    }

    triggerEvent(entity) {

    }

}

export class TreasureCollectableEvent extends MazeEvent {

    coinTiles = [
        ImageAsset.COIN_1,
        ImageAsset.COIN_2,
        ImageAsset.COIN_3,
        ImageAsset.COIN_4
    ];

    image = null;
    alpha = 1.0;

    constructor(onTrigger, assetManager) {
        super(onTrigger);
        let tile = this.coinTiles[Math.floor(this.coinTiles.length * Math.random())];
        this.image = assetManager.getImage(tile);
    }

    triggerEvent(entity) {
        if (this.isActive == true && entity != null && entity instanceof PlayerEntity) {
            this.onTrigger();
            if (this.isOneShot == true) {
                this.isActive = false;
            }
        }
    }

    applySpellEffect(effect) {
        switch (effect) {

            case SpellEffect.INVERT:

                // Inverting a treasure makes it invisible

                if (!this.spellEffects.has(effect)) {
                    this.spellEffects.add(effect);
                    this.setIsVisible(false);
                } else {
                    this.spellEffects.delete(effect);
                    this.setIsVisible(true);
                }
                break;

            default:
                break;
        }
    }

}

export class ChestCollectableEvent extends MazeEvent {

    image = null;
    alpha = 1.0;

    constructor(onTrigger, assetManager) {
        super(onTrigger);
        this.image = assetManager.getImage(ImageAsset.TREASURE_CHEST_SMALL);
    }

    triggerEvent(entity) {
        if (this.isActive == true && entity != null && entity instanceof PlayerEntity) {
            this.onTrigger();
            if (this.isOneShot == true) {
                this.isActive = false;
            }
        }
    }

    applySpellEffect(effect) {
        switch (effect) {

            case SpellEffect.INVERT:

                // Inverting a treasure makes it invisible

                if (!this.spellEffects.has(effect)) {
                    this.spellEffects.add(effect);
                    this.setIsVisible(false);
                } else {
                    this.spellEffects.delete(effect);
                    this.setIsVisible(true);
                }
                break;

            default:
                break;
        }
    }

    // render(context, mazeWindowX, mazeWindowY) {
    //     if (this.isActive == true && this.isVisible == true) {
    //         context.globalAlpha = this.alpha;
    //         context.drawImage(
    //             this.image,
    //             (this.room.col * this.room.roomSize) + (this.room.roomSize - this.image.width) / 2,
    //             (this.room.row * this.room.roomSize) + (this.room.roomSize - this.image.height) / 2
    //         )
    //     }
    // }
}

export class KeyCollectableEvent extends MazeEvent {

    imageAssetId = ImageAsset.DUNGEON_KEY_SMALL;

    constructor(onTrigger, assetManager) {
        super(onTrigger);
        this.image = assetManager.getImage(this.imageAssetId);
    }

    triggerEvent(entity) {
        if (this.isActive == true && entity != null && entity instanceof PlayerEntity) {
            this.onTrigger();
            this.isActive = false;
        }
    }

    applySpellEffect(effect) {
        switch (effect) {
            case SpellEffect.INVERT:

                // Inverting a key makes it invisible

                if (!this.spellEffects.has(effect)) {
                    this.spellEffects.add(effect);
                    this.setIsVisible(false);
                } else {
                    this.spellEffects.delete(effect);
                    this.setIsVisible(true);
                }
                break;

            default:
                break;
        }
    }

    // render(context, mazeWindowX, mazeWindowY) {
    //     if (this.isActive == true && this.isVisible == true) {
    //         context.globalAlpha = this.alpha;
    //         context.drawImage(
    //             this.image,
    //             (this.room.col * this.room.roomSize) + (this.room.roomSize - this.image.width) / 2,
    //             (this.room.row * this.room.roomSize) + (this.room.roomSize - this.image.height) / 2
    //         )
    //     }
    // }
}

export class PortalStaircaseEvent extends MazeEvent {

    isLocked = true;

    constructor(onTrigger, assetManager) {
        super(onTrigger);
        this.assetManager = assetManager;
        this.image = this.assetManager.getImage(ImageAsset.PORTAL_DOOR_CLOSED);
    }

    setIsLocked(isLocked) {
        this.isLocked = isLocked;
        if (isLocked) {
            this.image = this.assetManager.getImage(ImageAsset.PORTAL_DOOR_CLOSED);
        } else {
            this.image = this.assetManager.getImage(ImageAsset.PORTAL_DOOR_OPEN);
        }
    }

    triggerEvent(entity) {
        if (entity != null && entity instanceof PlayerEntity) {
            if (this.isLocked == false) {
                this.onTrigger();
            }
        }
    }

    applySpellEffect(effect) {
        switch (effect) {

            case SpellEffect.INVERT:

                // Inverting a key makes it invisible

                if (!this.spellEffects.has(effect)) {
                    this.spellEffects.add(effect);
                    this.setIsVisible(false);
                } else {
                    this.spellEffects.delete(effect);
                    this.setIsVisible(true);
                }
                break;

            default:
                break;
        }
    }

    // render(context, mazeWindowX, mazeWindowY) {
    //     if (this.isVisible == true) {
    //         context.globalAlpha = this.alpha;
    //         context.drawImage(
    //             this.image,
    //             (this.room.col * this.room.roomSize) + (this.room.roomSize - this.image.width) / 2,
    //             (this.room.row * this.room.roomSize) + (this.room.roomSize - this.image.height) / 2
    //         )
    //     }
    // }
}
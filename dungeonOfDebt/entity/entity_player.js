import { Entity } from "./entity.js";
import { ImageAsset } from "../assets.js";
import { SpellEffect } from "./entity_spell.js";

export class PlayerEntity extends Entity {

    id = crypto.randomUUID();

    image = null;
    imageAlpha = 1.0;

    offsetX = 0;
    offsetY = 0;

    constructor(tileSize, assetManager) {
        super(tileSize, assetManager);

        this.imageAssetId = ImageAsset.WIZARD_1;
        this.image = this.assetManager.getImage(ImageAsset.WIZARD_1);

        // Centers the tile if it is smaller than tileSize
        if (this.image.width < this.tileSize) {
            this.offsetX = Math.floor((this.tileSize - this.image.width) / 2);
        }

        if (this.image.height < this.tileSize) {
            this.offsetY = Math.floor((this.tileSize - this.image.height) / 2);
        }

    }

    onTurnConclusion() {

        let expiredEffects = new Set();
        let keys = this.spellEffects.keys()

        keys.forEach(key => {
            let current = this.spellEffects.get(key) - 1;
            this.spellEffects.set(key, current);

            if (current <= 0) {
                expiredEffects.add(key)
            }
        });

        expiredEffects.forEach(key => {
            this.removeSpellEffect(key);
        })

    }

    render(context) {

        context.globalAlpha = this.imageAlpha;
        context.drawImage(this.image, this.x + this.offsetX, this.y + this.offsetY);

        if (this.overlayImage != null) {
            context.globalAlpha = (this.spellEffects.get(SpellEffect.FREEZE) / 6);  // TODO: fix this later
            context.drawImage(
                this.overlayImage,
                this.x + ((this.tileSize - this.overlayImage.width) / 2),
                this.y + ((this.tileSize - this.overlayImage.height) / 2)
            )
        }
    }
};
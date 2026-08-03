import { ImageAsset } from "../../resources/ResourceManager.js";

export class Entity {

    id = crypto.randomUUID();

    x = 0;
    y = 0;

    isAlive = true;
    isDebug = false;

    image = null;
    imageAssetId = null;

    constructor(imageAssetId, resourceManager) {
        this.resourceManager = resourceManager;
        this.imageAssetId = imageAssetId;
        this.setImage(this.imageAssetId);
    }

    setImage(assetId) {
        this.image = this.resourceManager.getImage(assetId);
    }

    setHex(hex) {
        this.x = hex.center.x - (this.image.width / 2);
        this.y = hex.center.y - (this.image.height / 2);
    }

    toggleDebug() {
        this.isDebug = !this.isDebug;
    }

    render(context) {

        if (this.isAlive == false) {
            return;
        }

        context.drawImage(this.image, this.x, this.y);

        if (this.isDebug) {
            context.strokeStyle = "#FFFF00";
            context.lineWidth = 0.5;
            context.strokeText(`${this.id}`, this.x, this.y - 5);
        }
    }
}


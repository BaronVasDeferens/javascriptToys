

export class Entity {

    id = crypto.randomUUID();

    x = 0;
    y = 0;

    isAlive = true;
    isDebug = false;

    image = null;
    imageAssetId = null;

    constructor(imageAssetId, assetManager) {
        this.assetManager = assetManager;
        this.setImage(imageAssetId);
    }

    setImage(imageAssetId) {
        this.imageAssetId = imageAssetId;
        this.image = this.assetManager.getImage(imageAssetId);
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


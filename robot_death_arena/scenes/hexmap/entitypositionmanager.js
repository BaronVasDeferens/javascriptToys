

export class EntityPositionManager {

    hexes = [];

    hexIdToHex = new Map();
    hexIdToEntityId = new Map();

    entities = [];
    entityIdToEntity = new Map();
    entityIdToHexId = new Map();

    constructor() {
        this.clear();
    }

    clear() {

        this.entities = [];
        this.entityIdToEntity.clear();
        this.entityIdToHexId.clear();

        this.hexes = [];
        this.hexIdToHex.clear();
        this.hexIdToEntityId.clear();
    }

    setHexes(hexes) {
        this.hexes = hexes;
        this.hexes.forEach(hex => {
            this.hexIdToHex.set(hex.id, hex);
        });
    }

    // ENTITY
    addEntity(entity) {
        this.entities.push(entity);
        this.entityIdToEntity.set(entity.id, entity);
    }

    setEntityHex(entity, hex) {

        let target = this.entityIdToEntity.get(entity.id);

        // remove prior hex association
        let oldHexId = this.entityIdToHexId.get(entity.id);
        if (oldHexId != null) {
            this.entityIdToHexId.delete(entity.id);
            this.hexIdToEntityId.delete(oldHexId);
        }

        entity.x = hex.center.x - (entity.image.width / 2);
        entity.y = hex.center.y - (entity.image.height / 2);
        this.entityIdToEntity.set(entity.id, entity);
        this.entityIdToHexId.set(entity.id, hex.id);
        this.hexIdToEntityId.set(hex.id, entity.id);
    }

    getHexById(id) {
        return this.hexIdToHex.get(id);
    }

    getIsEmptyForHex(hex) {
        return this.hexIdToEntityId.get(hex.id) == null
    }

    getActiveEntities() {
        return [...this.entityIdToEntity.values()]
            .filter(entity => {
                return entity.isAlive == true;
            });
    }

    getEntityForId(id) {
        return this.entityIdToEntity.get(id);
    }

    getEntityForHex(hex) {

        if (hex == null) {
            return null;
        }

        let hexId = hex.id;
        let entityId = this.hexIdToEntityId.get(hexId);
        return this.entityIdToEntity.get(entityId);
    }

    getHexForEntity(entity) {
        let hexId = this.entityIdToHexId.get(entity.id);
        return this.hexIdToHex.get(hexId);
    }

    debugOut() {
        [...this.entityIdToEntity.entries()].forEach((key, value) => {
            console.log(`id: ${key}: ${value.imageAssetId}`);
        });
    }
}



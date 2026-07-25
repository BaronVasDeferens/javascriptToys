

export class EntityRoomManager {

    rooms = [];

    roomIdToRoom = new Map();
    roomIdToEntityId = new Map();

    entities = [];
    entityIdToEntity = new Map();
    entityIdToRoomId = new Map();

    constructor() {
        this.clear();
    }

    clear() {
        this.player = null;
        this.playerRoomId = null;

        this.entities = [];
        this.entityIdToEntity.clear();
        this.entityIdToRoomId.clear();

        this.rooms = [];
        this.roomIdToRoom.clear();
        this.roomIdToEntityId.clear();
    }

    setRooms(rooms) {
        this.rooms = rooms;
        this.rooms.forEach(room => {
            this.roomIdToRoom.set(room.id, room);
        });
    }

    // ENTITY
    addEntity(entity) {
        this.entities.push(entity);
        this.entityIdToEntity.set(entity.id, entity);
    }

    setEntityRoom(entity, room) {

        let target = this.entityIdToEntity.get(entity.id);

        // remove prior room association
        let oldRoomId = this.entityIdToRoomId.get(entity.id);
        if (oldRoomId != null) {
            this.entityIdToRoomId.delete(entity.id);
            this.roomIdToEntityId.delete(oldRoomId);
        }

        entity.x = room.col * this.tileSize;
        entity.y = room.row * this.tileSize;
        this.entityIdToEntity.set(entity.id, entity);
        this.entityIdToRoomId.set(entity.id, room.id);
        this.roomIdToEntityId.set(room.id, entity.id);
    }

    getRoomById(id) {
        return this.roomIdToRoom.get(id);
    }

    getIsEmptyForRoom(room) {
        return this.roomIdToEntityId.get(room.id) == null
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

    getEntityForRoom(room) {

        if (room == null) {
            return null;
        }

        let roomId = room.id;
        let entityId = this.roomIdToEntityId.get(roomId);
        return this.entityIdToEntity.get(entityId);
    }

    getRoomForEntity(entity) {
        let roomId = this.entityIdToRoomId.get(entity.id);
        return this.roomIdToRoom.get(roomId);
    }

    debugOut() {
        [...this.entityIdToEntity.entries()].forEach((key, value) => {
            console.log(`id: ${key}: ${value.imageAssetId}`);
        });
    }
}



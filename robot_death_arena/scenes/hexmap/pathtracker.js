

export class PathTracker {

    pathSet = new Set();
    orderToHexMap = new Map();
    hexToOrderMap = new Map();

    size() {
        return this.pathSet.size;
    }

    clear() {
        this.pathSet.clear();
        this.orderToHexMap.clear();
        this.hexToOrderMap.clear();
    }

    has(hex) {
        return this.pathSet.has(hex)
    }

    add(hex) {

        if (hex == null) {
            console.error(`cannot ADD NULL hex!`);
            return;
        }

        let wasItemAdded = false;
        if (!this.pathSet.has(hex)) {
            this.pathSet.add(hex);
            let position = this.pathSet.size - 1;
            this.orderToHexMap.set(position, hex);
            this.hexToOrderMap.set(hex, position);
            wasItemAdded = true;
        }

        return wasItemAdded;
    }

    getAtIndex(index) {
        return this.orderToHexMap.get(index);
    }

    indexOf(hex) {
        return this.hexToOrderMap.get(hex);
    }


    deleteHex(hex) {

        if (hex == null) {
            console.error(`cannot DELETE NULL hex!`)
            return;
        }

        let position = this.hexToOrderMap.get(hex);
        let size = this.pathSet.size;
        for (let n = position; n < size; n++) {
            let currentHex = this.orderToHexMap.get(n);
            this.pathSet.delete(currentHex);
            this.hexToOrderMap.delete(currentHex);
        }

        for (let n = position; n < this.orderToHexMap.size; n++) {
            this.orderToHexMap.delete(n);
        }
    }
}
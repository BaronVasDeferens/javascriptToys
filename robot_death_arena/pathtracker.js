

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
        console.log(`add`)
        if (!this.pathSet.has(hex)) {
            this.pathSet.add(hex);
            let position = this.pathSet.size - 1;
            this.orderToHexMap.set(position, hex);
            this.hexToOrderMap.set(hex, position);
        }
    }

    getAtIndex(index) {
        return this.orderToHexMap.get(index);
    }

    indexOf(hex) {
        return this.hexToOrderMap.get(hex);
    }


    deleteHex(hex) {
        console.log(`delete`)

        let position = this.hexToOrderMap.get(hex);
        for (let n = position; n <= this.pathSet.size - 1; n++) {
            let currentHex = this.orderToHexMap.get(position);
            this.pathSet.delete(currentHex);
            this.hexToOrderMap.delete(currentHex);
        }

        for (let n = position; n < this.orderToHexMap.size; n++) {
            this.orderToHexMap.delete(n)
        }
        

    }
}
// ------------------------------------ LEVEL -----------------------------------------

export class Level {

    sectionsTraversed = 0;
    isComplete = false;

    constructor(levelNumber, speed, lengthInSections, minRoadWidth, maxRoadWidth) {
        this.levelNumber = levelNumber;
        this.speed = speed;
        this.lengthInSections = lengthInSections;
        this.minRoadWidth = minRoadWidth;
        this.maxRoadWidth = maxRoadWidth;

        // TODO: monster and obstacle density
    }

    nextSection() {
        this.sectionsTraversed++;
        if (this.sectionsTraversed > this.lengthInSections) {
            this.isComplete = true;
            console.log(`--- LEVEL ${this.levelNumber} COMPLETE ---`)
        }

        return this.isComplete;
    }

}

// --------------------------------- LEVEL MANAGER -----------------------------------------

export class LevelManager {

    levels = [];
    currentIndex = 0;

    init(baseSpeed) {

        this.levels = [];
        this.currentIndex = 0;

        for (let i = 0; i < 100; i++) {
            this.addLevel(
                new Level(
                    i,
                    baseSpeed + i,
                    50,
                    5,
                    5
                )
            )
        }

    }

    addLevel(newLevel) {
        this.levels.splice(newLevel.levelNumber, 0, newLevel);
    }

    getCurrentLevel() {
        return this.levels[this.currentIndex];
    }

    incrementSection() {
        let level = this.levels[this.currentIndex];
        let sectionComplete = level.nextSection();
        if (sectionComplete) {
            this.currentIndex++;
        }
    }
}
import { AssetManager, ImageAsset, ImageLoader, SoundAsset, SoundLoader } from "./assets.js";

export class SoundPlayer {

    isMuted = false;

    backgroundMusic = null;

    constructor(assetManager, audioContext) {
        this.assetManager = assetManager;
        this.audioContext = audioContext;
    }

    setIsMuted(shouldMute) {
        this.isMuted = shouldMute;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        }
    }

    toggleMute() {
        this.setIsMuted(!this.isMuted);
    }

    playBackgroundMusic(soundAsset) {
        this.stopBackgroundMusic();
        this.backgroundMusic = this.assetManager.getSound(soundAsset);
        this.backgroundMusic.start();
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic != null) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }

    playOneShot(soundAsset, onComplete) {
        let sound = this.assetManager.getSound(soundAsset, false);

        if (onComplete != null) {
            sound.addEventListener("ended", evt => {
                onComplete();
            }, true);
        }

        sound.start();
    }

    playOneShotWithDetuneRange(soundAsset, detuneMin, detuneMax) {
        let sound = this.assetManager.getSound(soundAsset, false);
        sound.detune.value = this.randomInRange(detuneMin, detuneMax);
        sound.start();
    }

    randomInRange(min, max) {
        let range = Math.abs(max - min);
        return Math.floor(Math.random() * range) + min
    }

}

export class SoundLooper {

    isPlaying = false;
    buffer = null;
    source = null;

    constructor(soundAsset, assetManager, audioContext) {
        this.assetManager = assetManager;
        this.audioContext = audioContext;
        this.buffer = this.assetManager.getBuffer(soundAsset);
    }

    play() {
        if (this.isPlaying == false) {
            this.isPlaying = true;
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.connect(this.audioContext.destination);

            this.source.loop = true;
            this.source.loopStart = 0;
            this.source.loopEnd = this.buffer.length;

            this.source.start();
        }
    }

    stop() {
        this.isPlaying = false;
        this.source.loop = false;
    }

}
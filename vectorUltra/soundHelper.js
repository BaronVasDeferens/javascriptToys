import { AssetManager, ImageAsset, ImageLoader, SoundAsset, SoundLoader } from "./assets.js";

export class MachineGunSoundHelper {

    isMuted = false;

    constructor(soundLoader) {

        this.machineGunPrimary = soundLoader.getSound(SoundAsset.MACHINEGUN_1);
        this.machineGunSecondary = soundLoader.getSound(SoundAsset.MACHINEGUN_2);
        this.machineGunTrail = soundLoader.getSound(SoundAsset.MACHINEGUN_TRAIL);

        this.audioPrimary = this.machineGunPrimary;
        this.audioSecondary = this.machineGunTrail;

    }

    mute() {
        this.isMuted = true;
        this.audioPrimary.pause();
        this.audioSecondary.pause();
    }

    unmute() {
        this.isMuted = false;
    }

    fireMachineGuns() {

        if (this.isMuted) {
            return
        }

        this.audioPrimary.loop = true;
        this.audioPrimary.play();
    }

    stopMachineGuns() {

        if (this.isMuted) {
            return
        }

        this.audioPrimary.pause();
        this.audioSecondary.play();
    }

}

export class SoundPlayer {

    isMuted = false;

    backgroundMusic = null;

    constructor(assetManager, audioContext) {
        this.assetManager = assetManager;
        this.audioContext = audioContext;
    }

    setIsMuted(shouldMute) {
        this.isMuted = shouldMute;
        if(this.isMuted) {
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

    playOneShot(soundAsset) {
        let sound = this.assetManager.getSound(soundAsset, false);
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
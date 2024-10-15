import { Util } from './Util';
import { BundleData } from "./BundleData";
import { PlayerData } from "./PlayerData";
import { AbManager } from './asssetsBundle/AbManager';
import { SoundPath } from './SoundPath';

const { ccclass, property } = cc._decorator;

@ccclass
export class AudioManager extends cc.Component {

    @property(cc.AudioSource)
    audioSource: cc.AudioSource = null;

    private curEffectId: number = null;

    private curAudioId: number = null;

    private curBgmArg: { path: string, clip: cc.AudioClip } = { path: null, clip: null };

    private commonAudioPath: string[] = ["res/audios/click", "res/audios/open", "res/audios/close"];

    public static ins: AudioManager = null;

    private soundIds = new Map<string, number>();

    protected onLoad(): void {
        AudioManager.ins = this;
    }

    playClickAudio() {
        this.playEffect(SoundPath.button_click);
    }

    /**
     * 播放背景音乐
     * @returns 
     */
    playBgm(audioData: BundleData, isloop: boolean = true, cb: () => void = null) {
        if (!PlayerData.ins.isPlayMusic) {
            return;
        }
        let bundleName = audioData.bundle;
        let path = audioData.url;
        if (cc.audioEngine.isMusicPlaying() && this.curBgmArg.path && this.curBgmArg.path == path) {

        } else {
            this.stopBgm();
            AbManager.loadBundleRes(bundleName, path, cc.AudioClip).then((clip) => {
                if (!Util.isValid(this.node)) return;
                if (clip) {
                    let bgmId = cc.audioEngine.playMusic(clip, isloop);
                    if (cb) {
                        cc.audioEngine.setFinishCallback(bgmId, cb);
                    }
                    this.curBgmArg.path = path;
                    this.curBgmArg.clip = clip;
                }
            })
        }
    }

    /**
     * 停止bgm
     */
    stopBgm() {
        cc.audioEngine.stopMusic();
        AbManager.isAutoReleaseAsset && this.curBgmArg.clip && this.curBgmArg.clip.decRef();
        this.curBgmArg = { path: null, clip: null };
    }

    //暂停bgm
    pauseBgm() {
        cc.audioEngine.pauseMusic();
    }

    //恢复bgm
    resumeBgm() {
        if (!PlayerData.ins.isPlayMusic) {
            return;
        }
        cc.audioEngine.resumeMusic();
    }

    /**
     * 播放音效
     */
    playEffect(audioData: BundleData, isloop: boolean = false, cb: () => void = null) {
        if (!PlayerData.ins.isPlayAudio) {
            cb && cb();
            return;
        }
        // console.warn("playEffect ", audioData);
        let bundleName = audioData.bundle;
        let path = audioData.url;
        AbManager.loadBundleRes(bundleName, path, cc.AudioClip).then((clip) => {
            if (!Util.isValid(this.node)) return;
            if (clip) {
                let audioID;
                if (this.commonAudioPath.indexOf(path) > 0) {
                    audioID = cc.audioEngine.playEffect(clip, isloop);
                } else {
                    audioID = cc.audioEngine.playEffect(clip, isloop);
                    this.curEffectId = audioID;
                }

                this.stopEffectByBundleData(audioData);
                this.addSoundId(audioData, audioID);
                cc.audioEngine.setFinishCallback(audioID, () => {
                    AbManager.isAutoReleaseAsset && clip.decRef();
                    cb && cb();
                    this.delSoundId(audioData);
                });
            } else {
                cb && cb();
            }
        })
    }

    /**
     * 停止播放音效
     */
    public stopEffect(): void {
        if (this.curEffectId == null) {
            return;
        }
        cc.audioEngine.stopEffect(this.curEffectId);
        this.curEffectId = null;

        this.delSoundIdById(this.curEffectId);
    }

    public stopEffectByBundleData(audioData: BundleData): void {

        const audioID = this.getSoundId(audioData);
        if (audioID != null) {
            cc.audioEngine.stopEffect(audioID);
            this.delSoundId(audioData);
        }
    }

    /**
     * 停止所有音效
     */
    public stopAllEffect() {
        cc.audioEngine.stopAllEffects();
        this.curEffectId = null;
        this.soundIds.clear();
    }

    /**
     * 暂停音效
     */

    public pauseEffect() {
        if (this.curEffectId == null) {
            return;
        }
        cc.audioEngine.pauseEffect(this.curEffectId);
    }

    public pauseEffectByBundleData(audioData: BundleData): void {
        const audioID = this.getSoundId(audioData);
        if (audioID != null) {
            cc.audioEngine.pauseEffect(audioID);
        }
    }

    /**恢复音效 */
    public resumeEffect() {
        if (!PlayerData.ins.isPlayAudio) {
            return;
        }
        if (this.curEffectId == null) {
            return;
        }
        cc.audioEngine.resumeEffect(this.curEffectId);
    }

    public resumeEffectByBundleData(audioData: BundleData): void {
        if (!PlayerData.ins.isPlayAudio) {
            return;
        }
        const audioID = this.getSoundId(audioData);
        if (audioID != null) {
            cc.audioEngine.resumeEffect(audioID);
        }
    }

    /**播放音频，设置开始比例 */
    playEffectPro(audioData: BundleData, isloop: boolean = false, cb: () => void = null, startPro: number = 0) {
        if (!PlayerData.ins.isPlayAudio) {
            cb && cb();
            return;
        }
        let bundleName = audioData.bundle;
        let path = audioData.url
        AbManager.loadBundleRes(bundleName, path, cc.AudioClip).then((clip) => {
            if (!Util.isValid(this.node)) return;
            const audioID = cc.audioEngine.playEffect(clip, isloop);
            let dur = cc.audioEngine.getDuration(audioID);
            cc.audioEngine.setCurrentTime(audioID, startPro * dur);
            this.curEffectId = audioID;
            this.stopEffectByBundleData(audioData);
            this.addSoundId(audioData, audioID);
            cc.audioEngine.setFinishCallback(audioID, () => {
                cb && cb();
                this.delSoundId(audioData);
            });
        }).catch((err) => {
            console.log("err");
            cb && cb();
        })
    }

    /**
     * 播放音频
     */
    playAudio(audioData: BundleData, isloop: boolean = false, cb: () => void = null) {
        if (!PlayerData.ins.isPlayAudio) {
            cb && cb();
            return;
        }
        // console.warn("playAudio ", audioData);
        let bundleName = audioData.bundle;
        let path = audioData.url;
        AbManager.loadBundleRes(bundleName, path, cc.AudioClip).then((clip) => {
            if (!Util.isValid(this.node)) return;
            if (clip) {
                const audioID = cc.audioEngine.play(clip, isloop, 1);
                this.curAudioId = audioID;
                this.stopAudioByBundleData(audioData);
                this.addSoundId(audioData, audioID);
                cc.audioEngine.setFinishCallback(audioID, () => {
                    cb && cb();
                    this.delSoundId(audioData);
                });
            } else {
                cb && cb();
            }
        })
    }

    /**
     * 停止播放音频
     */
    public stopAudio(): void {
        if (this.curAudioId == null) {
            return;
        }
        cc.audioEngine.stop(this.curAudioId);
        this.curAudioId = null;

        this.delSoundIdById(this.curAudioId)
    }

    public stopAudioByBundleData(audioData: BundleData): void {
        const audioID = this.getSoundId(audioData);
        if (audioID != null) {
            cc.audioEngine.stop(audioID);
            this.delSoundId(audioData);
        }
    }

    public pauseAudio() {
        if (this.curAudioId == null) {
            return;
        }
        cc.audioEngine.pause(this.curAudioId);
    }

    public pauseAudioByBundleData(audioData: BundleData): void {
        const audioID = this.getSoundId(audioData);
        if (audioID != null) {
            cc.audioEngine.pause(audioID);
        }
    }

    public resumeAudio() {
        if (this.curAudioId == null) {
            return;
        }
        cc.audioEngine.resume(this.curAudioId);
    }

    public resumeAudioByBundleData(audioData: BundleData): void {
        const audioID = this.getSoundId(audioData);
        if (audioID != null) {
            cc.audioEngine.resume(audioID);
        }
    }

    /**
     * 通过audioSource播放音频
     */
    public playAudioBySource(audioData: BundleData, isloop: boolean = false) {
        if (!this.audioSource) {
            console.warn("audioSource is empty");
            return;
        }
        if (!PlayerData.ins.isPlayAudio) {
            return;
        }
        let bundleName = audioData.bundle;
        let path = audioData.url;

        AbManager.loadBundleRes(bundleName, path, cc.AudioClip).then((clip) => {
            if (!Util.isValid(this.node)) return;
            if (clip) {
                this.stopAudioSource();
                this.audioSource.clip = clip;
                this.audioSource.loop = isloop;
                this.audioSource.play();
            }
        })
    }

    public stopAudioSource() {
        if (!this.audioSource) {
            return;
        }
        if (this.audioSource.isPlaying) {
            this.audioSource.stop();
        }
    }

    public pauseAudioSource() {
        if (!this.audioSource) {
            return;
        }
        if (this.audioSource.isPlaying) {
            this.audioSource.pause();
        }
    }

    public resumeAudioSource() {
        if (!this.audioSource) {
            return;
        }
        this.audioSource.resume();
    }

    public stopAllSound() {
        this.stopAllEffect();
        this.stopAudio();
        this.stopAudioSource();
        this.stopBgm();
    }

    public pauseAllSound() {
        this.pauseEffect();
        this.pauseAudio();
        this.pauseBgm();
        this.pauseAudioSource();
    }

    public resumeAllSound() {
        this.resumeEffect();
        this.resumeAudio();
        this.resumeBgm();
        this.resumeAudioSource();
    }

    private addSoundId(audioData: BundleData, audioId) {
        const key = audioData.bundle + audioData.url;
        this.soundIds.set(key, audioId);
    }
    private hasSoundId(audioData: BundleData) {
        const key = audioData.bundle + audioData.url;
        return this.soundIds.has(key);
    }
    private delSoundId(audioData: BundleData) {
        const key = audioData.bundle + audioData.url;
        this.soundIds.delete(key);
    }
    private getSoundId(audioData: BundleData) {
        const key = audioData.bundle + audioData.url;
        return this.soundIds.get(key);
    }
    private delSoundIdById(audioID) {
        this.soundIds.forEach((value, key) => {
            if (audioID == value) {
                this.soundIds.delete(key);
            }
        })
    }
}

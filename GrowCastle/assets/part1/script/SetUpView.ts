
import { AudioManager } from "../../homepage/script/common/AudioManager";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { UiBase } from "../../homepage/script/common/UiBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SetUpView extends UiBase {

    @property(cc.Node)
    moNode: cc.Node = null;

    @property(cc.Node)
    mcNode: cc.Node = null;

    @property(cc.Node)
    eoNode: cc.Node = null;

    @property(cc.Node)
    ecNode: cc.Node = null;

    @property(cc.Label)
    versionLab: cc.Label = null;

    protected onEnable(): void {
        this.refresh();
        this.versionLab.string = "版本号：" + appContext.version;
    }

    refresh() {
        this.moNode.active = PlayerData.ins.isPlayMusic;
        this.mcNode.active = !PlayerData.ins.isPlayMusic;
        this.eoNode.active = PlayerData.ins.isPlayAudio;
        this.ecNode.active = !PlayerData.ins.isPlayAudio;
    }

    musicClick() {
        PlayerData.ins.isPlayMusic = !PlayerData.ins.isPlayMusic;
        if (!PlayerData.ins.isPlayMusic) {
            AudioManager.ins.pauseBgm();
        } else {
            AudioManager.ins.resumeBgm();
        }
        this.refresh();
        PlayerData.ins.saveData();
    }

    effectClick() {
        PlayerData.ins.isPlayAudio = !PlayerData.ins.isPlayAudio;
        if (!PlayerData.ins.isPlayAudio) {
            AudioManager.ins.pauseEffect();
        } else {
            AudioManager.ins.resumeEffect();
        }
        this.refresh();
        PlayerData.ins.saveData();
    }
}

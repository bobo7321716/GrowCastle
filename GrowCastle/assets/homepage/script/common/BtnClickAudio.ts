import { AudioManager } from "./AudioManager";
import { SoundEnum, SoundPath } from "./SoundPath";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnClickAudio extends cc.Component {

    @property({ type: cc.Enum(SoundEnum) })
    soundPath: SoundEnum = SoundEnum.button_click;

    protected onEnable(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart() {
        let key = Object.keys(SoundEnum)[this.soundPath];
        AudioManager.ins.playEffect(SoundPath[key]);
    }
}

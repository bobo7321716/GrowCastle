// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { AudioManager } from "../../../homepage/script/common/AudioManager";
import { Global } from "../../../homepage/script/common/Global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArmamentTab extends cc.Component {

    @property({ type: cc.Enum(Global.ArmamentGroup), })
    group: Global.ArmamentGroup = Global.ArmamentGroup.train

    @property(cc.Node)
    on: cc.Node = null;
    @property(cc.Node)
    off: cc.Node = null;

    selectCallback: (_p: Global.ArmamentGroup) => void = null

    init(_cb: (_p: Global.ArmamentGroup) => void) {
        this.selectCallback = _cb;
    }

    /**点击切换页签 */
    onSelectClick() {
        this.selectCallback && this.selectCallback(this.group);
        AudioManager.ins.playClickAudio();
    }

    /**设置选择状态 */
    setSelect(_ison: boolean) {
        this.on.active = _ison;
        this.off.active = !_ison;
    }
}

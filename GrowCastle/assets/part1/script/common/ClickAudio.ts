/*
 * @Author: XWL 2558913804@qq.com
 * @Date: 2024-06-17 10:28:52
 * @LastEditors: XWL 2558913804@qq.com
 * @LastEditTime: 2024-06-17 10:31:21
 * @FilePath: \GrowCastle\assets\part1\script\common\ClickAudio.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { PlayerData } from "../../../homepage/script/common/PlayerData";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("UIComponent/ClickAudio")
export default class ClickAudio extends cc.Component {
    @property({ type: cc.AudioClip, tooltip: "点击音效" })
    audio: cc.AudioClip = null;

    protected onEnable(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart() {
        if (!this.audio || !PlayerData.ins.isPlayAudio) return;
        cc.audioEngine.play(this.audio, false, 1);
    }
}

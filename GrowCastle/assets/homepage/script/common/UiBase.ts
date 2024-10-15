import { AudioManager } from "./AudioManager";
import { SoundPath } from "./SoundPath";
import { StackData, UIManager } from "./UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class UiBase extends cc.Component {

    @property(cc.Node)
    openAnimNode: cc.Node = null;

    @property(cc.Node)
    bgMaskNode: cc.Node = null;

    public stackData: StackData = null;

    /**界面开始打开时调用 */
    public onOpen(): void { }

    /**界面开始关闭时调用 */
    public onClose() { }

    /**界面被次级界面遮挡时调用 */
    public onCover() { }

    /**次级界面关闭时调用 */
    public onUncover() { }

    /**界面打开动画播放完毕时调用*/
    public onOpenFinish(): void { }

    /**界面关闭动画播放完毕时调用 */
    public onCloseFinish() { }

    /**界面打开前的准备方法 */
    public openPrepare(): Promise<void> { return Promise.resolve(); };

    /**界面关闭回调，子类可直接重写 */
    public closeCb() { }

    public playBtnClickAudio() {
        AudioManager.ins.playClickAudio();
    }

    public playCloseSceneAudio() {
        // AudioManager.ins.playEffect(SoundPath.CLOSE_SCENE);
    }

    public btnCloseViewClick() {
        this.playBtnClickAudio();
        UIManager.ins.closeView();
    }

}

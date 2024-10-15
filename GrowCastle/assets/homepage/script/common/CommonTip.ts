import { BundleName } from "./BundleName";
import MyPool from "./MyPool";
import { Util } from "./Util";
import { AbManager } from "./asssetsBundle/AbManager";

const { ccclass, property } = cc._decorator;

@ccclass
export class CommonTip extends cc.Component {

    @property({
        type: cc.Label
    })
    protected tipText: cc.Label = null;

    private isOnAnim: boolean = false;

    init() {
        return AbManager.loadBundleRes(BundleName.Font, "/WenQuanYi-Medium", cc.Font).then((font) => {
            if (!Util.isValid(this.node)) return;
            this.tipText.font = font;
        })
    }

    /**
     * 显示提示框
     * @param tipInfo 需要显示的文字信息 
     */
    show(tipInfo: string): void {
        if (tipInfo == null) {
            return;
        }
        this.init().then(() => {
            this.node.opacity = 255;
            this.tipText.string = tipInfo;
            this.isOnAnim = false;

            (this.tipText as any)._forceUpdateRenderData();
            if (this.tipText.node.width >= 500) {
                this.tipText.node.width = 500;
                this.tipText.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
                (this.tipText as any)._forceUpdateRenderData();
            }

            let width = this.tipText.node.width + 100;
            let height = this.tipText.node.height + 30;
            this.node.setContentSize(width, height);
            this.scheduleOnce(() => {
                this.destroySelf();
            }, 3)
        })
    }

    animEndCall() {
        this.isOnAnim = false;
    }

    hide() {
        let hideAnim = () => {
            cc.tween(this.node)
                .by(0.5, { y: 200, opacity: -255 })
                .removeSelf()
                .start()
        }
        if (this.isOnAnim) {
            this.animEndCall = () => {
                hideAnim();
            }
        } else {
            this.isOnAnim = true;
            hideAnim();
        }
    }

    topMove() {
        if (this.isOnAnim) {
            return;
        }
        this.isOnAnim = true;
        cc.tween(this.node)
            .by(0.1, { y: this.node.height + 10 })
            .call(this.animEndCall.bind(this))
            .start()
    }

    destroySelf() {
        this.unscheduleAllCallbacks();
        this.tipText.string = "";
        this.node.stopAllActions();
        this.isOnAnim = false;
        MyPool.putObj(this.node);
    }
}

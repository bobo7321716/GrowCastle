import { BundleName } from "../../homepage/script/common/BundleName";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UnlockFuncView extends UiBase {

    @property(cc.Sprite)
    iconSpr: cc.Sprite = null;

    @property(cc.Sprite)
    nameSpr: cc.Sprite = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    private id: number = 0;
    private cb: () => void = null;

    init(id: number, cb: () => void) {
        this.id = id;
        this.cb = cb;
        this.bgNode.active = true;
        this.iconSpr.node.stopAllActions();
        this.iconSpr.node.setPosition(0, 248);
        this.unscheduleAllCallbacks();
        AbManager.loadBundleRes(BundleName.Part1, "res/unlockFunc/func/" + id, cc.SpriteFrame).then(spf => {
            this.iconSpr.spriteFrame = spf;
        })
        AbManager.loadBundleRes(BundleName.Part1, "res/unlockFunc/func/" + id + "_1", cc.SpriteFrame).then(spf => {
            this.nameSpr.spriteFrame = spf;
        })
        this.scheduleOnce(() => {
            this.closeClick();
        }, 2)
    }

    closeClick() {
        this.unscheduleAllCallbacks();
        this.bgNode.active = false;
        this.iconSpr.node.stopAllActions();
        let tarNode = this.content.getChildByName(this.id + "");
        if (tarNode) {
            let wPos = tarNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
            let lPos = this.node.convertToNodeSpaceAR(wPos);
            cc.tween(this.iconSpr.node)
                .to(0.8, { x: lPos.x, y: lPos.y })
                .call(() => {
                    UIManager.ins.closeView(true);
                    this.cb && this.cb();
                })
                .start()
        }
    }
}

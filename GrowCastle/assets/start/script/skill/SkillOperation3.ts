import { Util } from "../../../homepage/script/common/Util";
import SkillConfig from "../../../homepage/script/config/SkillConfig";
import { RoleBase } from "../role/RoleBase";
import SkillOperationBase from "./SkillOperationBase";

const { ccclass, property } = cc._decorator;

//柱状选区
@ccclass
export default class SkillOperation3 extends SkillOperationBase {

    @property(cc.Node)
    arrow: cc.Node = null;

    @property(cc.Node)
    touchNode: cc.Node = null;

    private resolve: (value: unknown) => void = null;
    private sPos: cc.Vec2 = cc.Vec2.ZERO;

    protected onEnable(): void {
        this.touchNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    protected onDisable(): void {
        this.touchNode.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchNode.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchNode.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touchNode.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    operation(releaser: RoleBase, skillConfig: SkillConfig, releaseCb: () => void = null) {
        this.releaser = releaser;
        this.skillConfig = skillConfig;
        this.releaseCb = releaseCb;

        let wPos = releaser.node.convertToWorldSpaceAR(cc.v2(-cc.winSize.width / 2, -cc.winSize.height / 2));
        let lPos = this.node.convertToNodeSpaceAR(wPos);
        this.sPos = lPos;
        this.arrow.setPosition(lPos);
        this.arrow.angle = 0;
        this.arrow.active = true;
        this.effectBase.node.active = false;
        this.effectBase.node.angle = 0;
        this.effectBase.node.setPosition(lPos);
        this.touchNode.active = true;
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
        })
    }

    protected onTouchStart(event: cc.Event.EventTouch) {
        let pos = event.getLocation();
        this.rotation(pos);
    }

    protected onTouchMove(event: cc.Event.EventTouch) {
        let pos = event.getLocation();
        this.rotation(pos);
    }

    protected onTouchEnd(event: cc.Event.EventTouch) {
        this.releaseFinish();
        let pos = event.getLocation();
        this.touchNode.active = false;
        this.arrow.active = false;
        this.effectBase.node.active = true;
        let lPos = this.arrow.parent.convertToNodeSpaceAR(pos);
        let dir = lPos.sub(this.sPos).normalize();
        this.effectBase.init(this.releaser, this.skillConfig, dir).then(() => {
            this.resolve(this);
        })
    }

    rotation(ePos: cc.Vec2) {
        let lPos = this.arrow.parent.convertToNodeSpaceAR(ePos);
        let dir = lPos.sub(this.sPos).normalize();
        this.arrow.angle = -Util.vectorsToDegress(dir);
    }
}

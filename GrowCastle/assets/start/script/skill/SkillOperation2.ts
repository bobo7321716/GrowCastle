import GamingData from "../../../homepage/script/common/GamingData";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { Util } from "../../../homepage/script/common/Util";
import SkillConfig from "../../../homepage/script/config/SkillConfig";
import GuideManager from "../../../homepage/script/manager/GuideManager";
import { RoleBase } from "../role/RoleBase";
import SkillOperationBase from "./SkillOperationBase";

const { ccclass, property } = cc._decorator;

//圆形选区
@ccclass
export default class SkillOperation2 extends SkillOperationBase {

    @property(cc.Node)
    touchNode: cc.Node = null;

    @property(cc.Node)
    touchRangeNode: cc.Node = null;

    protected touchOffset: cc.Vec2 = cc.Vec2.ZERO;
    private xRangeVec: cc.Vec2 = null;
    private yRangeVec: cc.Vec2 = null;
    private resolve: (value: unknown) => void = null;
    private

    protected onEnable(): void {
        this.touchNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

        let widget = this.touchRangeNode.getComponent(cc.Widget);
        if (widget) widget.updateAlignment();
        this.touchNode.setPosition(this.touchRangeNode.getPosition());
        this.xRangeVec = cc.v2(-this.touchRangeNode.width / 2 + this.touchNode.width / 2, this.touchRangeNode.width / 2 - this.touchNode.width / 2);
        this.yRangeVec = cc.v2(this.touchRangeNode.y - this.touchRangeNode.height / 2 + this.touchNode.height / 2, this.touchRangeNode.y + this.touchRangeNode.height / 2 - this.touchNode.height / 2);

        if (GamingData.isOnGuide && PlayerData.ins.guideGroup == 0) {
            this.scheduleOnce(() => {
                GuideManager.ins.showCurGuide();
            })
        }
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
        this.effectBase.node.active = false;
        this.touchNode.active = true;

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
        })
    }

    protected onTouchStart(event: cc.Event.EventTouch) {
        let pos = event.getLocation();
        let worldPos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        // this.node.parent = appContext.uiManager.node;
        let touchPos = this.node.convertToNodeSpaceAR(pos);
        let nodePos = this.node.convertToNodeSpaceAR(worldPos);
        this.touchOffset = touchPos.sub(nodePos);
        this.touchNode.setPosition(touchPos.sub(this.touchOffset));
    }

    protected onTouchMove(event: cc.Event.EventTouch) {
        let pos = event.getLocation();
        let nodePos = this.node.convertToNodeSpaceAR(pos);
        nodePos = nodePos.sub(this.touchOffset);
        nodePos.x = Util.clampValue(nodePos.x, this.xRangeVec.x, this.xRangeVec.y);
        nodePos.y = Util.clampValue(nodePos.y, this.yRangeVec.x, this.yRangeVec.y);
        this.touchNode.setPosition(nodePos);
    }

    protected onTouchEnd(event: cc.Event.EventTouch) {
        this.releaseFinish();
        let pos = event.getLocation();
        this.touchNode.active = false;
        this.effectBase.node.active = true;
        this.effectBase.node.setPosition(this.touchNode.getPosition());
        this.effectBase.init(this.releaser, this.skillConfig).then(() => {
            this.resolve(this);
        })
    }
}

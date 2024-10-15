import { Global } from "../../homepage/script/common/Global";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import AnimCol from "./skill/AnimCol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideTag extends cc.Component {

    @property(cc.Node)
    handNode: cc.Node = null;

    @property
    guideId: number = 0;

    private animCol: AnimCol = null;

    protected onLoad(): void {
        WorldEventManager.addListener(Global.EventEnum.ShowGuideHand, this.showGuideHand, this);
        this.animCol = this.handNode.getComponent(AnimCol);
    }

    protected onEnable(): void {
        this.handNode.active = false;
    }

    showGuideHand(id: number): void {
        if (id != this.guideId) return;
        this.handNode.active = true;
        this.animCol.play(null, 1, 2).then(() => {
            this.handNode.active = false;
        });
    }

    guideClick() {
        this.handNode.active = false;
    }
}

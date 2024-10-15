import AnimCol from "./skill/AnimCol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PosHand extends cc.Component {

    @property(AnimCol)
    handAnim: AnimCol = null;

    protected onEnable(): void {
        this.handAnim.node.active = false;
    }

    showGuideHand(): void {
        this.handAnim.node.active = true;
        this.handAnim.play(null, 1, 2).then(() => {
            this.handAnim.node.active = false;
        });
    }
}


const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnCol extends cc.Component {

    @property({ displayName: "连点间隔", type: cc.Integer })
    clickInterval: number = 500;

    @property(cc.Material)
    maters: cc.Material[] = [];

    @property(cc.Node)
    labNode: cc.Node = null;

    @property(cc.Node)
    redPointNode: cc.Node = null;

    btn: cc.Button = null;
    spr: cc.Sprite = null;

    setIsGray(isGray) {
        if (!this.btn) {
            this.btn = this.node.getComponent(cc.Button);
        }
        if (!this.spr) {
            this.spr = this.node.getComponent(cc.Sprite);
        }
        this.spr.setMaterial(0, isGray ? this.maters[1] : this.maters[0]);
        this.labNode && (this.labNode.color = isGray ? cc.color(237, 126, 126) : cc.Color.WHITE);
        this.redPointNode && (this.redPointNode.active = !isGray);
    }

    protected onLoad(): void {
        this.setIsGray(false);
    }

    btnClick() {
        this.btn.interactable = false;
        setTimeout(() => {
            this.btn.interactable = true;
        }, this.clickInterval);
    }
}

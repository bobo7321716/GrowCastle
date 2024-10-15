import { UIManager } from "../../homepage/script/common/UIManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import { UiPath } from "../../homepage/script/common/UiPath";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OptionView extends UiBase {

    @property(cc.Node)
    optionNode: cc.Node = null;

    @property(cc.Button)
    closeBtn: cc.Button = null;

    protected onEnable(): void {
        this.optionNode.stopAllActions();
        this.optionNode.x = 0;
        this.closeBtn.interactable = false;
        cc.tween(this.optionNode)
            .to(0.3, { x: -this.optionNode.width })
            .call(() => {
                this.closeBtn.interactable = true;
            })
            .start()
    }

    closeClick() {
        this.closeBtn.interactable = false;
        cc.tween(this.optionNode)
            .to(0.3, { x: this.optionNode.width })
            .call(() => {
                UIManager.ins.closeView();
            })
            .start()
    }

    setupClick() {
        UIManager.ins.openView(UiPath.SetupView);
    }

    signClick() {
        UIManager.ins.openView(UiPath.SignUI);
    }

    onlineClick() {
        UIManager.ins.openView(UiPath.OnlineView);
    }
}

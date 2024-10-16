import SkillIcon from "./SkillIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillIconCol extends cc.Component {

    public static ins: SkillIconCol = null;

    private iconArr: SkillIcon[] = [];

    protected onLoad(): void {
        SkillIconCol.ins = this;
        this.node.children.forEach(v => {
            let icon = v.getComponent(SkillIcon);
            if (icon) {
                this.iconArr.push(icon);
            }
        })
    }

    initIcon() {
        this.iconArr.forEach(v => {
            v.init();
        })
    }

    refreshIcon(mp: number) {
        this.iconArr.forEach(v => {
            v.refresh(mp);
        })
    }
}

import { AudioManager } from "../../homepage/script/common/AudioManager";
import { Global } from "../../homepage/script/common/Global";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiPath } from "../../homepage/script/common/UiPath";
import ChooseBuildUI from "../../part1/script/ChooseBuildUI";
import FightManager from "./FightManager";
import PosHand from "./PosHand";
import { BuildBase } from "./role/BuildBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuildPos extends cc.Component {

    @property(BuildBase)
    buildBase: BuildBase = null;

    @property(PosHand)
    posHand: PosHand = null;

    private buildId: number = null;
    private index: number = null;

    init(buildId: number, index: number) {
        return new Promise((resolve, reject) => {
            this.buildId = buildId;
            this.index = index;
            if (buildId > 0) {
                this.buildBase.init({ roleType: Global.RoleType.Build, roleId: buildId }).then(resolve);
            } else {
                this.buildBase.reset();
                resolve(null);
            }
        })
    }

    buildClick(btn, data: string) {
        AudioManager.ins.playClickAudio();
        if (FightManager.ins.isOnFight) {

        } else {
            UIManager.ins.openView(UiPath.ChooseBuildUI).then((view: ChooseBuildUI) => {
                view.init(Number(data));
            });
        }
    }

    showPosHand() {
        if (!this.buildBase.baseRole && this.posHand) {
            this.posHand.showGuideHand();
        }
    }
}

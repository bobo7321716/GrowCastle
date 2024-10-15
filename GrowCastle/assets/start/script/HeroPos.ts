import { AudioManager } from "../../homepage/script/common/AudioManager";
import { Global } from "../../homepage/script/common/Global";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiPath } from "../../homepage/script/common/UiPath";
import ChooseHeroUI from "../../part1/script/ChooseHeroUI";
import FightManager from "./FightManager";
import PosHand from "./PosHand";
import { HeroBase } from "./role/HeroBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroPos extends cc.Component {

    @property(HeroBase)
    heroBase: HeroBase = null;

    @property(PosHand)
    posHand: PosHand = null;

    private heroId: number = null;
    private index: number = null;

    init(heroId: number, index: number) {
        return new Promise((resolve, reject) => {
            this.heroId = heroId;
            this.index = index;
            if (heroId > 0) {
                this.heroBase.init({ roleType: Global.RoleType.Hero, roleId: heroId }).then(resolve);
            } else {
                this.heroBase.reset();
                resolve(null);
            }
        })
    }

    heroClick() {
        AudioManager.ins.playClickAudio();
        if (FightManager.ins.isOnFight) {
            this.heroBase.skill();
        } else {
            UIManager.ins.openView(UiPath.ChooseHeroUI).then((view: ChooseHeroUI) => {
                view.init();
            });
        }
    }

    showPosHand() {
        if (!this.heroBase.baseRole && this.posHand) {
            this.posHand.showGuideHand();
        }
    }
}

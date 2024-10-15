import { Global } from "../../../homepage/script/common/Global";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiBase } from "../../../homepage/script/common/UiBase";
import TerritoryConfig from "../../../homepage/script/config/TerritoryConfig";
import FightManager from "../../../start/script/FightManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TerritoryTipUI extends UiBase {

    @property(cc.Label)
    atkLab: cc.Label = null;

    @property(cc.Label)
    rewardLab: cc.Label = null;

    private config: TerritoryConfig = null;

    init(config: TerritoryConfig) {
        this.config = config;
        this.atkLab.string = "战力:" + config.power;
        this.rewardLab.string = "X" + config.coinget;
    }

    territoryClick() {
        UIManager.ins.closeView(true);
        UIManager.ins.closeView(true);
        FightManager.ins.startFight(Global.FightType.Territory, this.config.id);
    }
}

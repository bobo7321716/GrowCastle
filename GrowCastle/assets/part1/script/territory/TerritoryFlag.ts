import { BundleName } from "../../../homepage/script/common/BundleName";
import GamingData from "../../../homepage/script/common/GamingData";
import { Global } from "../../../homepage/script/common/Global";
import TipManager from "../../../homepage/script/common/TipManager";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiPath } from "../../../homepage/script/common/UiPath";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import TerritoryConfig, { TerritoryConfigMgr } from "../../../homepage/script/config/TerritoryConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import TerritoryTipUI from "./TerritoryTipUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TerritoryFlag extends cc.Component {

    @property(cc.Label)
    profitLab: cc.Label = null;

    @property(cc.Label)
    atkLab: cc.Label = null;

    @property(cc.Label)
    lvLab: cc.Label = null;

    @property(cc.Label)
    profitLab2: cc.Label = null;

    @property(cc.Label)
    atkLab2: cc.Label = null;

    @property(cc.Label)
    lvLab2: cc.Label = null;

    @property(cc.Node)
    flagNode: cc.Node = null;

    @property(cc.Node)
    fightNode: cc.Node = null;

    @property(cc.Node)
    lockNode: cc.Node = null;

    @property(cc.Node)
    unlockNode: cc.Node = null;

    private config: TerritoryConfig = null;
    public state: Global.State = Global.State.LOCK;

    init(id: number, state: Global.State) {
        this.config = DataManager.ins.get(TerritoryConfigMgr).getDataById(id);
        if (!this.config) return;
        this.state = state;
        this.profitLab.string = this.config.coinget + "/分钟";
        this.atkLab.string = "战力: " + this.config.power;
        this.lvLab.string = "第" + this.config.id + "关";
        this.profitLab2.string = this.config.coinget + "/分钟";
        this.atkLab2.string = "战力: " + this.config.power;
        this.lvLab2.string = "第" + this.config.id + "关";


        this.lockNode.active = state == Global.State.LOCK;
        this.unlockNode.active = state != Global.State.LOCK;

        this.flagNode.stopAllActions();
        this.fightNode.stopAllActions();
        return new Promise((resolve, reject) => {
            if (GamingData.newUnlockTerritoryId != null) {
                if (id == GamingData.newUnlockTerritoryId) {
                    this.flagNode.y = 200;
                    this.flagNode.opacity = 0;
                    this.fightNode.scale = 1;
                    this.fightNode.active = true;
                    this.flagNode.active = true;
                    cc.tween(this.fightNode)
                        .delay(0.5)
                        .to(0.3, { scale: 0 }, { easing: "backIn" })
                        .delay(0.5)
                        .call(() => {
                            cc.tween(this.flagNode)
                                .to(0.3, { opacity: 255 })
                                .delay(0.3)
                                .to(0.1, { y: 3 }, { easing: "inexpo" })
                                .delay(0.5)
                                .call(resolve)
                                .start()
                        })
                        .start()
                } else if (id == GamingData.newUnlockTerritoryId + 1) {
                    this.flagNode.y = 3;
                    this.fightNode.active = true;
                    this.flagNode.active = false;
                    this.flagNode.opacity = 255;
                    this.fightNode.scale = 0;
                    resolve(null);
                } else {
                    this.flagNode.y = 3;
                    this.flagNode.opacity = 255;
                    this.flagNode.active = state == Global.State.GETED;
                    this.fightNode.active = state == Global.State.UNLOCK;
                    resolve(null);
                }
            } else {
                this.flagNode.y = 3;
                this.flagNode.active = state == Global.State.GETED;
                this.fightNode.active = state == Global.State.UNLOCK;
                resolve(null);
            }
        })
    }

    territoryClick() {
        if (this.state == Global.State.LOCK) {
            TipManager.ins.showTip("请先占领上一关");
            return;
        }
        if (this.state == Global.State.GETED) {
            TipManager.ins.showTip("已占领该区域");
            return;
        }
        UIManager.ins.openView(UiPath.TerritoryTipUI).then((view: TerritoryTipUI) => {
            view.init(this.config);
        });
    }

    showBobble() {
        this.flagNode.y = 3;
        this.fightNode.active = true;
        cc.tween(this.fightNode)
            .to(0.3, { scale: 1 }, { easing: "backOut" })
            .delay(0.5)
            .start()
    }
}

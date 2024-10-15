import { Global } from "../../homepage/script/common/Global";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import TipManager from "../../homepage/script/common/TipManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import { ConstConfigMgr } from "../../homepage/script/config/ConstConfig";
import DataManager from "../../homepage/script/manager/DataManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CoinUpgradeView extends UiBase {

    @property(cc.Node)
    rightNode: cc.Node = null;

    @property(cc.Label)
    curLab: cc.Label = null;

    @property(cc.Label)
    upgradeLab: cc.Label = null;

    private maxLv: number = 0;

    protected onEnable(): void {
        this.maxLv = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.铜币提升最高等级).value;
        this.refresh();
    }

    refresh() {
        let lv = PlayerData.ins.coinUpgradeLv;
        this.rightNode.active = lv < this.maxLv;
        if (lv > this.maxLv) lv = this.maxLv;
        let add = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.铜币提升每级加成).value;
        this.curLab.string = lv * add + "%";
        this.upgradeLab.string = (lv + 1) * add + "%";
    }

    getClick(btn, data: string) {
        if (PlayerData.ins.coinUpgradeLv >= this.maxLv) {
            TipManager.ins.showTip("已满级");
            return;
        }
        let isFree = data == "1";
        let call = () => {
            PlayerData.ins.coinUpgradeLv++;
            PlayerData.ins.saveData();
            WorldEventManager.triggerEvent(Global.EventEnum.RefreshPlayerInfo);
            this.refresh();
        }
        if (!isFree) {
            call();
        } else {
            call();
        }
    }
}

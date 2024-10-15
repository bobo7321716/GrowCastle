import BtnCol from "../../../homepage/script/common/BtnCol";
import GamingData from "../../../homepage/script/common/GamingData";
import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import TipManager from "../../../homepage/script/common/TipManager";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiPath } from "../../../homepage/script/common/UiPath";
import { WorldEventManager } from "../../../homepage/script/common/WorldEventManager";
import { ConstConfigMgr } from "../../../homepage/script/config/ConstConfig";
import { TerritoryConfigMgr } from "../../../homepage/script/config/TerritoryConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import HomeManager from "../../../homepage/script/manager/HomeManager";
import RedPointManager from "../../../homepage/script/manager/RedPointManager";
import RecycleScrollV from "../../../homepage/script/scrollview/RecycleScrollV";
import RewardView from "../RewardView";
import TerritoryItem from "./TerritoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TerritoryPage extends cc.Component {

    @property(RecycleScrollV)
    recycleScrollV: RecycleScrollV = null;

    @property(cc.Label)
    profitLab: cc.Label = null;

    @property(cc.Label)
    profitSpeedLab: cc.Label = null;

    @property(BtnCol)
    btnCol: BtnCol = null;

    private curProfit: number = 0;
    private offsetArr: number[] = [-500, -161, 60, 514];
    private openResolve: (unknown) => void = null;
    private openFinishPromise: Promise<any[]> = null;
    private tarIndex: number = 0;

    protected onDisable(): void {
        this.unscheduleAllCallbacks();
    }

    init() {
        this.recycleScrollV.numItems = Math.ceil(DataManager.ins.get(TerritoryConfigMgr).datas.length / GamingData.pageFlagNum);
        this.recycleScrollV.onItemRender = this.onItemRender.bind(this);
        this.refreshProfit();
        this.unscheduleAllCallbacks();
        this.schedule(this.refreshProfit.bind(this), 1);

        let id = GamingData.newUnlockTerritoryId != null ? GamingData.newUnlockTerritoryId - 1 : PlayerData.ins.territoryLv;
        let index = Math.floor(id / GamingData.pageFlagNum);
        this.tarIndex = this.recycleScrollV.numItems - index - 1;
        this.rollMap(id);

        this.openFinishPromise = new Promise((resolve, reject) => {
            this.openResolve = resolve;
        })
    }

    openAnim() {
        this.openResolve(null);
    }

    onItemRender(index: number, node: cc.Node) {
        let item = node.getComponent(TerritoryItem);
        if (!item) return;
        let promise = item.init(this.recycleScrollV.numItems - index - 1);
        if (index == this.tarIndex && GamingData.newUnlockTerritoryId != null) {
            this.openFinishPromise.then(() => {
                promise.then(() => {
                    this.rollMap(PlayerData.ins.territoryLv, 0.5).then(() => {
                        WorldEventManager.triggerEvent(Global.EventEnum.ShowBobble);
                        GamingData.newUnlockTerritoryId = null;
                    });
                })
            })
        }
    }

    rollMap(id: number, dur: number = 0.3) {
        let index = Math.floor(id / GamingData.pageFlagNum);
        let tarIndex = this.recycleScrollV.numItems - index - 1;
        let posIndex = id - index * 4;
        if (id >= DataManager.ins.get(TerritoryConfigMgr).datas.length) {
            posIndex = GamingData.pageFlagNum - 1;
        }
        let yOffset = this.offsetArr[posIndex];
        return this.recycleScrollV.rollItemByIndex(tarIndex, dur, -yOffset);
    }

    refreshProfit() {
        let profit = GamingData.getTerritoryTotalProfit();
        this.profitSpeedLab.string = profit + "/分钟";
        let duration = Math.floor((Date.now() - PlayerData.ins.lastGetTerritoryRewardTime) / 1000 / 60);
        let configLimit = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.远征时长上限).value;
        configLimit = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.领地时长上限, configLimit);
        this.curProfit = Math.min(duration, configLimit / 60) * profit;
        this.profitLab.string = this.curProfit + "(" + (profit > 0 ? duration : 0) + "分钟/" + configLimit / 60 + "分钟)";
        this.btnCol.setIsGray(this.curProfit <= 0);
    }

    getProfitClick() {
        if (this.curProfit <= 0) {
            TipManager.ins.showTip("暂无可领取奖励");
            return;
        }
        let reward = [{ id: Global.ItemId.Coin, num: this.curProfit }];
        UIManager.ins.openView(UiPath.RewardView).then((view: RewardView) => {
            view.init(reward);
        })
        PlayerData.ins.lastGetTerritoryRewardTime = Date.now();
        this.refreshProfit();
        RedPointManager.ins.checkRedPoint();
    }
}

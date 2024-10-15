import GamingData from "../common/GamingData";
import { Global } from "../common/Global";
import { PlayerData } from "../common/PlayerData";
import { WorldEventManager } from "../common/WorldEventManager";
import { ArmamentConfigMgr } from "../config/ArmamentConfig";
import { ConstConfigMgr } from "../config/ConstConfig";
import { OnlinerewardConfigMgr } from "../config/OnlinerewardConfig";
import { RedPointConfigMgr } from "../config/RedPointConfig";
import DataManager from "./DataManager";
import HomeManager from "./HomeManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RedPointManager extends cc.Component {

    public static ins: RedPointManager = null;

    protected onLoad(): void {
        RedPointManager.ins = this;
        this.allShowRedPoints = [];
        WorldEventManager.triggerEvent(Global.EventEnum.RedPointRefresh);
    }

    /**所有需要显示的红点 */
    public allShowRedPoints: number[] = [];

    showRedPoint(key: number) {
        if (this.allShowRedPoints.includes(key)) return;
        this.allShowRedPoints.push(key);
        WorldEventManager.triggerEvent(Global.EventEnum.RedPointRefresh);
    }

    checkRedPoint() {
        this.allShowRedPoints = [];
        let datas = DataManager.ins.get(RedPointConfigMgr).datas;
        datas.forEach(v => {
            switch (v.id) {
                case Global.RedPointType.Sigh:
                    if (PlayerData.ins.checkSignReward().length > 0) {
                        v.keys.forEach(v1 => {
                            this.showRedPoint(v1);
                        })
                    }
                    break;
                case Global.RedPointType.Online:
                    let curTime = Math.floor(PlayerData.ins.todayOnlineDuration / 60000);
                    let datas = DataManager.ins.get(OnlinerewardConfigMgr).datas;
                    for (let i = 0; i < datas.length; i++) {
                        let data = datas[i];
                        if (curTime >= data.time && !PlayerData.ins.todayGetedOnlineRewardIds.includes(data.id)) {
                            v.keys.forEach(v1 => {
                                this.showRedPoint(v1);
                            })
                            break;
                        }
                    }
                    break;
                case Global.RedPointType.Battle:
                    let profit = GamingData.getTerritoryTotalProfit();
                    let duration = Math.floor((Date.now() - PlayerData.ins.lastGetTerritoryRewardTime) / 1000 / 60);
                    let configLimit = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.远征时长上限).value;
                    configLimit = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.领地时长上限, configLimit);
                    let curProfit = Math.min(duration, configLimit / 60) * profit;
                    if (curProfit > 0) {
                        v.keys.forEach(v1 => {
                            this.showRedPoint(v1);
                        })
                    }
                    break;
                case Global.RedPointType.Arm1:
                case Global.RedPointType.Arm2:
                case Global.RedPointType.Arm3:
                case Global.RedPointType.Arm4:
                    let configs = DataManager.ins.get(ArmamentConfigMgr).getGroupConfig(v.id - 3);
                    for (let i = 0; i < configs.length; i++) {
                        let config = configs[i];
                        let cost = config.cost_base + config.cost_add * PlayerData.ins.armamentInfo.find(val => val.id == config.id).lv;
                        let isEnough = PlayerData.ins.checkCostIsEnough(config.cost_type, cost, false);
                        if (isEnough && PlayerData.ins.wave >= config.wave) {
                            v.keys.forEach(v1 => {
                                this.showRedPoint(v1);
                            })
                        }
                    }
                    break;
            }
        })
        WorldEventManager.triggerEvent(Global.EventEnum.RedPointRefresh);
    }
}

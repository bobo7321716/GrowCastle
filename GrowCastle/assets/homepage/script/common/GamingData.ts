import { TerritoryConfigMgr } from "../config/TerritoryConfig";
import DataManager from "../manager/DataManager";
import HomeManager from "../manager/HomeManager";
import { Global } from "./Global";
import { PlayerData } from "./PlayerData";
import { WorldEventManager } from "./WorldEventManager";

//存放游戏运行中的临时数据
export default class GamingData {

    /**战斗速度倍率 */
    public static get fightSpeedMul(): number {
        return PlayerData.ins.fightSpeedMul;
    }
    public static set fightSpeedMul(value: number) {
        console.warn("fightSpeedMul ", value);
        PlayerData.ins.fightSpeedMul = value;
        PlayerData.ins.saveData();
        WorldEventManager.triggerEvent(Global.EventEnum.FightMulChange);
    }

    /**临时 */
    static temp: number = 0;

    /**释放技能时战斗暂停 */
    static pauseaFightMul() {
        this.temp = this.fightSpeedMul;
        this.fightSpeedMul = 0;
    }

    /**恢复速度 */
    static resumeFightMul() {
        if (this.temp != 0) {
            this.fightSpeedMul = this.temp;
            this.temp = 0;
        }
    }

    /**获取远征每分的总收益 */
    static getTerritoryTotalProfit() {
        let total = 0;
        let datas = DataManager.ins.get(TerritoryConfigMgr).datas;
        datas.forEach(v => {
            if (v.id <= PlayerData.ins.territoryLv) {
                total += v.coinget;
            }
        })
        total = Math.floor(HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.领地铜币产出, total));
        return total;
    }

    /**获取技能数值 */
    static getSkillAdd(effectParam: number[], baseNum: number) {
        return effectParam[1] == 1 ? effectParam[4] : baseNum * (effectParam[4] / 100);
    }

    /**是否在引导中 */
    static isOnGuide: boolean = false;

    /**跳过的引导关 */
    static jumpGuideGroup: number = null;

    /**新通关的领地id */
    static newUnlockTerritoryId: number = null;

    //每页旗子数
    static pageFlagNum: number = 4;
}

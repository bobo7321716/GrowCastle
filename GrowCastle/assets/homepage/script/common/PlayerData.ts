import AddCoinUI from "../../../part1/script/AddCoinUI";
import RewardView from "../../../part1/script/RewardView";
import { ArcherUpgradeConfigMgr } from "../config/ArcherUpgradeConfig";
import { ArmamentConfigMgr } from "../config/ArmamentConfig";
import BuildConfig, { BuildConfigMgr } from "../config/BuildConfig";
import { BuildattributeConfigMgr } from "../config/BuildattributeConfig";
import { CastleConfigMgr } from "../config/CastleConfig";
import { FunctionlockConfigMgr } from "../config/FunctionlockConfig";
import HeroConfig, { HeroConfigMgr } from "../config/HeroConfig";
import { HeroattributeConfigMgr } from "../config/HeroattributeConfig";
import { ItemConfigMgr } from "../config/ItemConfig";
import OnlinerewardConfig from "../config/OnlinerewardConfig";
import { PlayerLevelConfigMgr } from "../config/PlayerLevelConfig";
import { SignConfigMgr } from "../config/SignConfig";
import { SkillConfigMgr } from "../config/SkillConfig";
import TaskConfig from "../config/TaskConfig";
import WaveConfig, { WaveConfigMgr } from "../config/WaveConfig";
import DataManager from "../manager/DataManager";
import HomeManager from "../manager/HomeManager";
import SceneEventManager from "../manager/SceneEventManager";
import TaskManager from "../manager/TaskManager";
import GamingData from "./GamingData";
import { Global } from "./Global";
import TipManager from "./TipManager";
import { UIManager } from "./UIManager";
import { UiPath } from "./UiPath";
import { Util } from "./Util";
import { WorldEventManager } from "./WorldEventManager";

//玩家数据类
export class PlayerData {

    private static _ins: PlayerData = null;
    public static gameName: string = "GrowCastle";

    public static get ins(): PlayerData {
        if (!this._ins) {
            this._ins = new PlayerData();
        }
        return this._ins;
    }

    public static data = {};

    /**
     * 获取指定键名的值。
     * @param key 键名。
     */
    setLoaclStorageItem(key: string, value: any) {
        PlayerData.data[key] = value;
        this.saveData();
    }

    saveData() {
        for (let key in PlayerData.ins) {
            if (PlayerData.ins[key] instanceof Function) {
            } else {
                PlayerData.data[key] = PlayerData.ins[key];
            }
        }
        cc.sys.localStorage.setItem(PlayerData.gameName, JSON.stringify(PlayerData.data));
    }

    /**是否是新玩家 */
    public isNewUser: boolean = true;
    /**上次登录时间 */
    public lastLoginTime: number = 0;
    /**上次离线时间 */
    public lastLogOutTime: number = 0;
    /**本次离线时长 */
    public logOutDuration: number = 0;
    /**今日累计在线时长 */
    public todayOnlineDuration: number = 0;

    /**是否播放音效 */
    public isPlayAudio: boolean = true;
    /**是否播放bgm */
    public isPlayMusic: boolean = true;

    /**累计登录天数 */
    public totalLoginDays: number = 0;
    /**签到天数 */
    public signDay: number = 0;
    /**今日已领取的在线时长奖励 */
    public todayGetedOnlineRewardIds: number[] = [];

    /**波次 */
    public wave: number = 0;
    /**领土等级 */
    public territoryLv: number = 0;
    /**boss等级 */
    public bossLv: number = 0;
    /**玩家等级 */
    public playerLv: number = 1;
    /**玩家当前等级富余经验 */
    public playerCurLvExp: number = 0;
    /**城堡等级 */
    public carstelLv: number = 1;
    /**弓箭手等级 */
    public archerLv: number = 1;
    /**军备的信息 */
    public armamentInfo: { id: number, lv: number }[] = []
    /**金矿的等级 */
    public goldmineLevel: number = 0;
    /**上次领取远征累计奖励的时间 */
    public lastGetTerritoryRewardTime: number = 0;
    /**今日boss战波次id */
    public todayBossWaveConfig: WaveConfig = null;
    /**今日成功挑战boss次数 */
    public todayChallengeBossTimes: number = 0;
    /**任务信息 */
    public taskInfo: { id: number, progress: number } = { id: 1, progress: 0 };
    /**玩家背包数据 */
    public packageInfo: { id: number, num: number }[] = [];

    /**所有已解锁英雄 */
    public unlockHeroInfos: { id: number, lv: number, atkPos: number, isBuy: boolean }[] = [];
    /**所有已解锁建筑 */
    public unlockBuildInfos: { id: number, lv: number, atkPos: number, isBuy: boolean }[] = [];
    /**家园建筑物的信息 */
    public homeBuildPos: { id: number, lv: number, pos: number }[] = [];
    /**已解锁的功能 */
    public unlockFunc: number[] = [];

    /**战斗速率 */
    public fightSpeedMul: number = 1;
    /**是否自动战斗 */
    public isAutoFight: boolean = false;

    /**引导阶段 */
    public guideGroup: number = 0;
    public guideStep: number = 0;

    /**铜币提升等级 */
    public coinUpgradeLv: number = 0;
    /**今天军备视频升级次数 */
    public armAdUpgradeTimes: number = 0;

    /**是否展示敌人战斗数据 */
    public isShowTip: boolean = false;

    public initData() {
        let localStorage = cc.sys.localStorage.getItem(PlayerData.gameName);
        let data = {};
        if (localStorage != null && localStorage != "") {
            data = JSON.parse(localStorage);
        }
        PlayerData.data = data;
        for (let key in PlayerData.ins) {
            if (PlayerData.ins[key] instanceof Function) {
            } else {
                PlayerData.ins[key] = PlayerData.data[key] == undefined ? PlayerData.ins[key] : PlayerData.data[key];
            }
        }
        this.initNewUserData();
        this.checkIsNextDay();
        this.lastLoginTime = Date.now();
        this.logOutDuration = Date.now() - this.lastLogOutTime;
        GamingData.isOnGuide = this.guideGroup < 4;
        this.saveData();
    }

    private initNewUserData() {
        if (!this.isNewUser) return;
        this.isNewUser = false;
        this.lastGetTerritoryRewardTime = Date.now();
        this.refreshRandomBossWave();
        this.todayChallengeBossTimes = 0;
        //默认解锁英雄设置出战
        let heroDatas = DataManager.ins.get(HeroConfigMgr).datas;
        heroDatas.forEach(v => {
            if (v.locktype == Global.HeroUnlockType.Wave && v.lockparameter == this.wave) {
                if (v && !this.unlockHeroInfos.find(el => el.id == v.id)) {
                    this.unlockHeroInfos.push({ id: v.id, lv: 1, atkPos: -1, isBuy: true });
                    this.updateFightHeroOrBuild(Global.PartnerType.Hero, v.id, true);
                }
            }
        })
    }

    checkIsNextDay() {
        if (Util.isNextDay(this.lastLoginTime, Date.now())) {
            this.todayGetedOnlineRewardIds = [];
            this.refreshRandomBossWave();
            this.todayChallengeBossTimes = 0;
            this.totalLoginDays++;
            if (this.signDay > 7) {
                this.signDay = 0;
                this.totalLoginDays = 0;
            }
            this.todayOnlineDuration = 0;
            this.armAdUpgradeTimes = 0;
            // if (Util.isNextWeek(this.lastLoginTime, TimeManager.ins.curTime)) {
            // }
        }
    }

    /**获得一个随机的boss波次 */
    refreshRandomBossWave() {
        let datas = DataManager.ins.get(WaveConfigMgr).getConfigArrByWaveType(Global.FightType.Boss);
        this.todayBossWaveConfig = Util.getRandomValue(datas).value;
    }

    getOnlineReward(config: OnlinerewardConfig) {
        this.todayGetedOnlineRewardIds.push(config.id);
        UIManager.ins.openView(UiPath.RewardView).then((view: RewardView) => {
            view.init(config.reward);
        })
    }

    ShiftEffectShow(isShow: boolean) {
        this.isPlayAudio = isShow;
        this.saveData();
    }
    /**升级军备 */
    upgradeArmament(_id: number, isFree: boolean, sucCb?: () => void, failCb?: () => void) {
        let info = this.armamentInfo.find(v => v.id == _id);
        if (!info) return failCb && failCb();
        let config = DataManager.ins.get(ArmamentConfigMgr).getDataById(info.id);
        if (!config) return failCb && failCb();
        if (info.lv >= config.max) {
            TipManager.ins.showTip("已达最大等级");
            return failCb && failCb();
        }
        if (!isFree) {
            let isEnough = this.checkCostIsEnough(config.cost_type, config.cost_base + config.cost_add * info.lv, true, true, true);
            if (!isEnough) return failCb && failCb();
        }
        info.lv++
        this.saveData();
        TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.UpgradeArms);
        sucCb && sucCb();
        WorldEventManager.triggerEvent(Global.EventEnum.RefreshPlayerInfo);
    }

    /**计算战斗结束后的收益 */
    checkFightEndReward(wave: number, fightType: Global.FightType) {
        switch (fightType) {
            case Global.FightType.Normal:
                if (wave >= this.wave) {
                    this.wave = wave;
                    //检查解锁英雄
                    let heroDatas = DataManager.ins.get(HeroConfigMgr).datas;
                    heroDatas.forEach(v => {
                        if (v.locktype == Global.HeroUnlockType.Wave && v.lockparameter <= wave) {
                            if (!this.unlockHeroInfos.find(el => el.id == v.id)) {
                                this.unlockHeroInfos.push({ id: v.id, lv: 1, atkPos: -1, isBuy: false });
                            }
                        }
                    })
                    //检查解锁建筑
                    let buildDatas = DataManager.ins.get(BuildConfigMgr).datas;
                    buildDatas.forEach(v => {
                        if (v.locktype == Global.HeroUnlockType.Wave && v.lockparameter <= wave) {
                            if (!this.unlockBuildInfos.find(el => el.id == v.id)) {
                                this.unlockBuildInfos.push({ id: v.id, lv: 1, atkPos: -1, isBuy: false });
                            }
                        }
                    })

                    SceneEventManager.ins.addSceneEvent(UiPath.MainView, "checkUnlockNewFunc");
                }
                break;
            case Global.FightType.Territory:
                if (this.territoryLv < wave) {
                    this.territoryLv = wave;
                    GamingData.newUnlockTerritoryId = wave;
                } else {
                    GamingData.newUnlockTerritoryId = null;
                }
                if (wave == 1) {
                    this.lastGetTerritoryRewardTime = Date.now();
                }
                TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.UnlockTerritory);
                break;
            case Global.FightType.Boss:
                this.todayChallengeBossTimes++;
                break;
        }
        this.saveData();
        TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.PassLv);
    }

    /**购买英雄或建筑 */
    buyHeroOrBuild(type: Global.PartnerType, config: HeroConfig | BuildConfig, sucCb?: () => void, failCb?: () => void) {
        let infos = this.unlockHeroInfos;
        let cost = config.price;
        let currencyType = config.currency;
        switch (type) {
            case Global.PartnerType.Hero:
                infos = this.unlockHeroInfos;
                break;
            case Global.PartnerType.Build:
                infos = this.unlockBuildInfos;
                break;
        }
        let info = infos.find(v => v.id == config.id);
        if (!info) {
            failCb && failCb();
            return TipManager.ins.showTip("未解锁");
        }
        if (info.isBuy) {
            failCb && failCb();
            return TipManager.ins.showTip("已购买");
        }
        let isEnough = this.checkCostIsEnough(currencyType, cost, true, true, true);
        if (!isEnough) {
            failCb && failCb();
            return;
        }
        info.isBuy = true;
        this.saveData();
        this.updateFightHeroOrBuild(type, config.id, true, false);
        switch (type) {
            case Global.PartnerType.Hero:
                TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.UnlockHero);
                UIManager.ins.showUpgradeEffect(2);
                break;
            case Global.PartnerType.Build:
                TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.UnlockBuild);
                UIManager.ins.showUpgradeEffect(3);
                break;
        }
        sucCb && sucCb();
    }

    /**升级英雄或建筑 */
    upgradeHeroOrBuild(type: Global.PartnerType, id: number, isFree: boolean, sucCb?: () => void, failCb?: () => void) {
        let infos = this.unlockHeroInfos;
        let info: { id: number, lv: number, atkPos: number, isBuy: boolean } = null;
        let cost: number[] = [];
        switch (type) {
            case Global.PartnerType.Hero:
                infos = this.unlockHeroInfos;
                info = infos.find(v => v.id == id);
                let config1 = DataManager.ins.get(HeroattributeConfigMgr).getHeroattributeConfig(id, info.lv);
                if (config1) {
                    cost = config1.coin;
                } else {
                    TipManager.ins.showTip("已满级")
                    failCb && failCb();
                    return;
                }
                break;
            case Global.PartnerType.Build:
                infos = this.unlockBuildInfos;
                info = infos.find(v => v.id == id);
                let config2 = DataManager.ins.get(BuildattributeConfigMgr).getBuildattributeConfig(id, info.lv);
                if (config2) {
                    cost = config2.coin;
                }
                else {
                    TipManager.ins.showTip("已满级")
                    failCb && failCb();
                    return;
                }
                break;
        }

        if (!info) {
            failCb && failCb();
            return TipManager.ins.showTip("未解锁");
        }
        if (!info.isBuy) {
            failCb && failCb();
            return TipManager.ins.showTip("未购买");
        }
        if (!isFree) {
            let isEnough = this.checkCostIsEnough(cost[0], cost[1], true, true, true);
            if (!isEnough) {
                failCb && failCb();
                return;
            }
        }
        info.lv++;
        this.saveData();
        switch (type) {
            case Global.PartnerType.Hero:
                TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.UpgradeHeroTimes);
                break;
            case Global.PartnerType.Build:
                TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.UpgradeCastleTimes);
                break;
        }
        sucCb && sucCb();
        UIManager.ins.showUpgradeEffect(1);
    }

    /**更新出战英雄或建筑 */
    updateFightHeroOrBuild(type: Global.PartnerType, id: number, isOnFight: boolean, isTip: boolean = true) {
        let atkNum = 0;
        let unlockNum = 0;
        let datas = DataManager.ins.get(FunctionlockConfigMgr).datas;
        let infos = this.unlockHeroInfos;
        switch (type) {
            case Global.PartnerType.Hero:
                infos = this.unlockHeroInfos;
                unlockNum = 3;
                datas.forEach(v => {
                    if (v.wave <= this.wave && v.type == 1) {
                        unlockNum++;
                    }
                })
                break;
            case Global.PartnerType.Build:
                infos = this.unlockBuildInfos;
                datas.forEach(v => {
                    if (v.wave <= this.wave && v.type == 2) {
                        unlockNum++;
                    }
                })
                break;
        }
        let info = infos.find(v => v.id == id);
        if (!info || !info.isBuy) return isTip && TipManager.ins.showTip("未解锁");
        if (isOnFight) {
            infos.forEach(v => {
                if (v.atkPos >= 0) {
                    atkNum++;
                }
            })
            if (atkNum >= unlockNum) {
                isTip && TipManager.ins.showTip("出战位已满");
                return;
            }
            let atkPos = null;
            if (type == Global.PartnerType.Build) {
                let config = DataManager.ins.get(BuildConfigMgr).getDataById(id);
                if (config.position == 1) {
                    for (let i = 0; i < 4; i++) {
                        let info = infos.find(v => v.atkPos == i);
                        if (!info) {
                            atkPos = i;
                            break;
                        }
                    }
                } else if (config.position == 2) {
                    for (let i = 4; i < 6; i++) {
                        let info = infos.find(v => v.atkPos == i);
                        if (!info) {
                            atkPos = i;
                            break;
                        }
                    }
                }
            } else {
                for (let i = 0; i < 6; i++) {
                    let info = infos.find(v => v.atkPos == i);
                    if (!info) {
                        atkPos = i;
                        break;
                    }
                }
            }
            if (atkPos == null) {
                TipManager.ins.showTip("未找到出战位");
                return;
            }
            let curInfo = infos.find(v => v.atkPos == atkPos);
            if (curInfo) {
                curInfo.atkPos = -1;
            }
            info.atkPos = atkPos;
        } else {
            info.atkPos = -1;
        }
        this.saveData();
    }

    /**升级城堡 */
    upgradeCastle(sucCb: () => void, failCb: () => void = null) {
        let configs = DataManager.ins.get(CastleConfigMgr);
        if (this.carstelLv >= configs.datas.length) return TipManager.ins.showTip("已满级");
        let config = configs.getDataById(this.carstelLv);
        let isEnought = this.checkCostIsEnough(config.upgradeCost[0], config.upgradeCost[1], true, true, true);
        if (!isEnought) {
            failCb && failCb();
            return;
        }
        this.carstelLv++;
        sucCb && sucCb();

        this.saveData();
        TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.UpgradeCastle);
    }

    /**升级弓箭手 */
    upgradeArcher(cb: () => void, failCb: () => void = null) {
        let configs = DataManager.ins.get(ArcherUpgradeConfigMgr);
        if (this.archerLv >= configs.datas.length) return TipManager.ins.showTip("已满级");
        let config = configs.getDataById(this.archerLv);
        if (!config.upgradeCost) return;
        let actualCost = Math.floor(HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.弓箭手强化费用, config.upgradeCost[1]));
        let isEnought = this.checkCostIsEnough(config.upgradeCost[0], actualCost, true, true, true);
        if (!isEnought) {
            failCb && failCb();
            return;
        }
        this.archerLv++;
        cb && cb();
        this.saveData();
        TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.UpgradeArcher);
    }

    /**升级金矿 */
    upgradeGoldmine() {
        this.goldmineLevel++;
        this.saveData();
        TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.UpgradeMine);
        UIManager.ins.showUpgradeEffect(2);
    }

    /**升级家园建筑 */
    upgradeHomeBuild(_id: number) {
        this.homeBuildPos.find(val => val.id == _id).lv++;
        this.saveData();
        UIManager.ins.showUpgradeEffect(1);
    }

    /**获得经验 */
    getExp(exp: number) {
        exp = Math.floor(exp);
        let configMgr = DataManager.ins.get(PlayerLevelConfigMgr);
        let levelConfig = configMgr.getDataById(this.playerLv);
        if (this.playerCurLvExp + exp >= levelConfig.exp) {
            this.playerCurLvExp = this.playerCurLvExp + exp - levelConfig.exp;
            let maxConfig = configMgr.datas[configMgr.datas.length - 1];
            this.playerLv++;
            this.playerLv = Math.min(this.playerLv, maxConfig.id);
            this.changeItemNum(levelConfig.prize[0], levelConfig.prize[1], false);
            WorldEventManager.triggerEvent(Global.EventEnum.PlayerUpgrade, [{ id: levelConfig.prize[0], num: levelConfig.prize[1] }]);
        } else {
            this.playerCurLvExp += exp;
            WorldEventManager.triggerEvent(Global.EventEnum.RefreshPlayerInfo);
        }
    }

    /**更新道具数量 */
    changeItemNum(id: Global.ItemId, num: number, isRefresh: boolean = true, isSave: boolean = true) {
        if (num == 0) return;
        num = Math.floor(num);
        let info = this.packageInfo.find(v => v.id == id);
        if (!info) {
            let itemConfig = DataManager.ins.get(ItemConfigMgr).getDataById(id);
            switch (itemConfig.type) {
                case Global.ItemType.Currency:
                    info = { id: id, num: num };
                    this.packageInfo.push(info);
                    break;
                case Global.ItemType.Hero:
                    if (!this.unlockHeroInfos.find(el => el.id == itemConfig.value)) {
                        this.unlockHeroInfos.push({ id: itemConfig.value, lv: 1, atkPos: -1, isBuy: true });
                    }
                    break;
            }
        } else {
            info.num = Math.max(0, info.num + num);
        }
        isSave && this.saveData();
        isRefresh && WorldEventManager.triggerEvent(Global.EventEnum.RefreshPlayerInfo, id);
    }

    /**获得道具数量 */
    getItemNum(id: Global.ItemId) {
        let info = this.packageInfo.find(v => v.id == id);
        if (!info) return 0;
        return info.num;
    }

    /**更新任务信息 */
    refreshTaskInfo(info: { id: number, progress: number }) {
        this.taskInfo = info;
        this.saveData();
    }

    /**完成任务 */
    finishTask(config: TaskConfig) {
        if (!config) return;
        config.reward.forEach(v => {
            this.changeItemNum(v.id, v.num);
        })
    }

    /**签到 */
    sign(isDouble: boolean = false) {
        let rewards = this.checkSignReward();
        if (rewards.length > 0) {
            if (isDouble) {
                rewards = Array.from(rewards, v => {
                    return { id: v.id, num: v.num * 2 };
                })
            }
            this.signDay = this.totalLoginDays;
            UIManager.ins.openView(UiPath.RewardView).then((view: RewardView) => {
                view.init(rewards);
            })
        }
    }

    checkSignReward() {
        let rewards: { id: number, num: number }[] = [];
        let datas = DataManager.ins.get(SignConfigMgr).datas;
        datas.forEach((v, k) => {
            if (k >= this.signDay && k <= this.totalLoginDays - 1) {
                v.reward.forEach(el => {
                    let obj = rewards.find(v2 => v2.id == el.id);
                    if (obj) {
                        obj.num += el.num;
                    } else {
                        rewards.push(el);
                    }
                })
            }
        })
        return rewards;
    }

    /**检查已上阵的建筑是否有某类型技能 */
    getBuildSkillParam(type: Global.SkillType) {
        let param: [number, number, number, number, number][] = [];
        for (let i = 0; i < this.unlockBuildInfos.length; i++) {
            let info = this.unlockBuildInfos[i];
            if (info.atkPos >= 0) {
                let buildattributeConfig = DataManager.ins.get(BuildattributeConfigMgr).getBuildattributeConfig(info.id, info.lv);
                if (buildattributeConfig) {
                    let skillConfig = DataManager.ins.get(SkillConfigMgr).getDataById(buildattributeConfig.skill);
                    if (skillConfig && skillConfig.type == type) {
                        param = param.concat(skillConfig.parameter);
                    }
                }
            }
        }
        return param;
    }

    /**切换自动战斗 */
    changeIsAutoFight() {
        this.isAutoFight = !this.isAutoFight;
        this.saveData();
    }

    /**检查消耗是否充足 */
    checkCostIsEnough(id: Global.ItemId, num: number, isLog: boolean = true, isCost: boolean = false, isPop: boolean = false) {
        let config = DataManager.ins.get(ItemConfigMgr).getDataById(id);
        if (!config) return false;
        let isEnought = this.getItemNum(id) >= num;
        if (!isEnought && isLog) {
            TipManager.ins.showTip(config.name + "不足");
        }
        if (isCost && isEnought) this.changeItemNum(id, -num);
        if (isPop && !isEnought) {
            UIManager.ins.openView(UiPath.AddCoin).then((_ui: AddCoinUI) => {
                _ui.init(id == Global.ItemId.Coin);
            })
        }
        return isEnought;
    }
}
window["PlayerData"] = PlayerData;
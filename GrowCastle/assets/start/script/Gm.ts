import GamingData from "../../homepage/script/common/GamingData";
import { Global } from "../../homepage/script/common/Global";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiPath } from "../../homepage/script/common/UiPath";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import { BuildConfigMgr } from "../../homepage/script/config/BuildConfig";
import { HeroConfigMgr } from "../../homepage/script/config/HeroConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import TaskManager from "../../homepage/script/manager/TaskManager";
import RewardView from "../../part1/script/RewardView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Gm extends cc.Component {

    @property(cc.EditBox)
    editBox1: cc.EditBox = null;

    @property(cc.EditBox)
    editBox2: cc.EditBox = null;

    @property(cc.EditBox)
    editBox3: cc.EditBox = null;

    @property(cc.EditBox)
    editBox4: cc.EditBox = null;

    @property(cc.EditBox)
    editBox5: cc.EditBox = null;

    @property(cc.Node)
    openTipNode: cc.Node = null;

    @property(cc.Node)
    closeTipNode: cc.Node = null;

    protected onEnable(): void {
        this.refreshTipBtn();
    }

    refreshTipBtn() {
        this.openTipNode.active = !PlayerData.ins.isShowTip;
        this.closeTipNode.active = PlayerData.ins.isShowTip;
    }

    openTipClick() {
        PlayerData.ins.isShowTip = true;
        this.refreshTipBtn();
    }

    closeTipClick() {
        PlayerData.ins.isShowTip = false;
        this.refreshTipBtn();
    }

    waveClick() {
        let wave = Number(this.editBox1.string);
        PlayerData.ins.wave = wave;
        PlayerData.ins.checkFightEndReward(wave, Global.FightType.Normal);
    }

    addCoinClick() {
        let num = Number(this.editBox2.string);
        PlayerData.ins.changeItemNum(Global.ItemId.Coin, num);
    }

    addCrystalClick() {
        let num = Number(this.editBox3.string);
        PlayerData.ins.changeItemNum(Global.ItemId.Crystal, num);
    }

    addRecruitTickClick() {
        let num = Number(this.editBox4.string);
        PlayerData.ins.changeItemNum(Global.ItemId.RecruitTick, num);
    }

    unlockAllHero() {
        let heroDatas = DataManager.ins.get(HeroConfigMgr).datas;
        heroDatas.forEach(v => {
            if (v.locktype == Global.HeroUnlockType.Wave) {
                if (!PlayerData.ins.unlockHeroInfos.find(el => el.id == v.id)) {
                    PlayerData.ins.unlockHeroInfos.push({ id: v.id, lv: 1, atkPos: -1, isBuy: false });
                }
            }
        })
    }

    unlockAllBuild() {
        let heroDatas = DataManager.ins.get(BuildConfigMgr).datas;
        heroDatas.forEach(v => {
            if (v.locktype == Global.HeroUnlockType.Wave) {
                if (!PlayerData.ins.unlockBuildInfos.find(el => el.id == v.id)) {
                    PlayerData.ins.unlockBuildInfos.push({ id: v.id, lv: 1, atkPos: -1, isBuy: false });
                }
            }
        })
    }

    testClick() {
        this.node.active = false;
        UIManager.ins.openView(UiPath.RewardView).then((view: RewardView) => {
            view.init([{ id: 1001, num: 10 }, { id: 1002, num: 10 }]);
        })
        // GamingData.newUnlockTerritoryId = 12;
        // PlayerData.ins.territoryLv = 12;
        // PlayerData.ins.saveData();
    }

    signClick() {
        PlayerData.ins.totalLoginDays++;
        if (PlayerData.ins.totalLoginDays > 7) {
            PlayerData.ins.totalLoginDays = 0;
        }
        PlayerData.ins.saveData();
    }

    resetSign() {
        PlayerData.ins.signDay = 0;
        PlayerData.ins.totalLoginDays = 0;
        PlayerData.ins.saveData();
    }

    taskClick() {
        let id = Number(this.editBox5.string);
        TaskManager.ins.refreshTask({ id: id, progress: 0 });
        PlayerData.ins.saveData();
    }
}

import { AudioManager } from "../../homepage/script/common/AudioManager";
import GamingData from "../../homepage/script/common/GamingData";
import { Global } from "../../homepage/script/common/Global";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { SoundPath } from "../../homepage/script/common/SoundPath";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import { UiPath } from "../../homepage/script/common/UiPath";
import { ConstConfigMgr } from "../../homepage/script/config/ConstConfig";
import { EnemyConfigMgr } from "../../homepage/script/config/EnemyConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import GuideManager from "../../homepage/script/manager/GuideManager";
import FightManager from "../../start/script/FightManager";
import FightMap from "../../start/script/FightMap";
import RewardView from "./RewardView";
import TerritoryLvUI from "./territory/TerritoryLvUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResultView extends UiBase {

    @property(cc.Node)
    sucNode: cc.Node = null;

    @property(cc.Node)
    failNode: cc.Node = null;

    @property(cc.Node)
    reviveBtnNode: cc.Node = null;

    @property(cc.Node)
    sucAnim1: cc.Node = null;

    @property(cc.Node)
    sucAnim2: cc.Node = null;

    @property(cc.Node)
    failAnim: cc.Node = null;

    @property(cc.Button)
    closeBtn: cc.Button = null;

    @property(cc.Label)
    numLab: cc.Label = null;

    @property(cc.Node)
    closeNode: cc.Node = null;

    private isSuc: boolean = false;
    private fightType: Global.FightType = Global.FightType.Normal;
    private cb: (isRevive: boolean) => void = null;
    private isRevive: boolean = false;
    private coinNum: number = 0;

    init(isSuc: boolean, coinNum: number, fightType: Global.FightType, cb: (isRevive: boolean) => void, isGiveUp: boolean = false) {
        isSuc = true;
        this.isSuc = isSuc;
        this.fightType = fightType;
        this.cb = cb;
        this.isRevive = false;
        this.sucNode.active = isSuc;
        this.failNode.active = !isSuc;
        this.numLab.string = coinNum + "";
        this.closeNode.active = false;
        this.coinNum = coinNum;

        this.sucAnim1.stopAllActions();
        this.sucAnim1.scale = 0.1;
        this.sucAnim2.stopAllActions();
        this.sucAnim2.y = this.sucAnim2.height;
        this.reviveBtnNode.active = false;
        this.reviveBtnNode.opacity = 0;
        this.reviveBtnNode.stopAllActions();
        this.failNode.stopAllActions();
        this.failAnim.y = 1050;

        let soundPath = isSuc ? SoundPath.success : SoundPath.fail;
        AudioManager.ins.playEffect(soundPath, false, () => {
            // if (!FightManager.ins.isOnFight) {
            //     AudioManager.ins.playBgm(SoundPath.main_BGM);
            // }
        });

        this.closeBtn.interactable = false;
        if (isSuc) {
            cc.tween(this.sucAnim1)
                .to(0.5, { scale: 1 }, { easing: "backOut" })
                .delay(0.1)
                .call(() => {
                    cc.tween(this.sucAnim2)
                        .to(0.5, { y: 0 }, { easing: "backOut" })
                        .call(() => {
                            this.closeBtn.interactable = true;
                            this.closeNode.active = true;
                        })
                        .start()
                })
                .start()
        } else {
            let isShowRevive = !isGiveUp && !GamingData.isOnGuide;
            cc.tween(this.failAnim)
                .to(0.5, { y: 0 }, { easing: "backOut" })
                .call(() => {
                    if (isShowRevive) {
                        this.reviveBtnNode.active = true;
                        cc.tween(this.reviveBtnNode)
                            .delay(0.3)
                            .to(0.5, { opacity: 255 })
                            .call(() => {
                                this.closeBtn.interactable = true;
                            })
                            .start()
                    } else {
                        this.closeBtn.interactable = true;
                    }
                })
                .start()
        }
    }

    protected onDisable(): void {
        if (this.isRevive) {
            this.cb && this.cb(true);
            return;
        }
        if (this.isSuc) {
            if (GamingData.jumpGuideGroup == PlayerData.ins.guideGroup) {
                PlayerData.ins.guideStep = 0;
                PlayerData.ins.guideGroup++;
            }
            GuideManager.ins.showCurGuide();
        } else {
            GuideManager.ins.lastGuide();
        }
        FightMap.ins.showPosHand();
        switch (this.fightType) {
            case Global.FightType.Boss:
                UIManager.ins.openView(UiPath.TerritoryLvUI).then((view: TerritoryLvUI) => {
                    view.init(1);
                    if (this.isSuc) {
                        let times = PlayerData.ins.todayChallengeBossTimes;
                        let limitTimes = DataManager.ins.get(ConstConfigMgr).getDataById(Global.GameConst.每日可挑战boss次数).value;
                        if (times <= limitTimes) {
                            let waveConfig = PlayerData.ins.todayBossWaveConfig;
                            let bossId = waveConfig.enemy[0][0];
                            let bossConfig = DataManager.ins.get(EnemyConfigMgr).getDataById(bossId);
                            if (!bossConfig) return;
                            if (bossConfig.reward) {
                                UIManager.ins.openView(UiPath.RewardView).then((view: RewardView) => {
                                    view.init(bossConfig.reward);
                                })
                            }
                        }
                    }
                })
                break;
            case Global.FightType.Territory:
                UIManager.ins.openView(UiPath.TerritoryLvUI).then((view: TerritoryLvUI) => {
                    view.init(0);
                })
                break;
        }
    }

    reviveClick() {
        this.isRevive = true;
        UIManager.ins.closeView();
    }

    closeClick() {
        AudioManager.ins.playBgm(SoundPath.main_BGM);
        this.isRevive = false;
        UIManager.ins.closeView();
        this.cb && this.cb(false);
    }

    doubleClick() {
        PlayerData.ins.changeItemNum(Global.ItemId.Coin, this.coinNum);
        this.closeClick();
    }
}

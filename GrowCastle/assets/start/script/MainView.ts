import { AudioManager } from "../../homepage/script/common/AudioManager";
import BtnCol from "../../homepage/script/common/BtnCol";
import { BundleName } from "../../homepage/script/common/BundleName";
import GamingData from "../../homepage/script/common/GamingData";
import { Global } from "../../homepage/script/common/Global";
import MyPool from "../../homepage/script/common/MyPool";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { SoundPath } from "../../homepage/script/common/SoundPath";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import { UiPath } from "../../homepage/script/common/UiPath";
import { Util } from "../../homepage/script/common/Util";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import { ArcherUpgradeConfigMgr } from "../../homepage/script/config/ArcherUpgradeConfig";
import { CastleConfigMgr } from "../../homepage/script/config/CastleConfig";
import { FunctionlockConfigMgr } from "../../homepage/script/config/FunctionlockConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import HomeManager from "../../homepage/script/manager/HomeManager";
import RedPointManager from "../../homepage/script/manager/RedPointManager";
import SceneEventManager from "../../homepage/script/manager/SceneEventManager";
import UnlockFuncView from "../../part1/script/UnlockFuncView";
import Homestead from "../../part1/script/homestead/Homestead";
import TerritoryLvUI from "../../part1/script/territory/TerritoryLvUI";
import FightManager from "./FightManager";
import FightMap from "./FightMap";
import InfoCol from "./InfoCol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainView extends UiBase {

    @property(InfoCol)
    infoCol: InfoCol = null;

    @property(cc.Node)
    mapContent: cc.Node = null;

    @property(cc.Node)
    btns: cc.Node[] = [];

    @property(cc.Label)
    buildUpgradeLab: cc.Label = null;

    @property(cc.Label)
    archerUpgradeLab: cc.Label = null;

    @property(cc.Node)
    normalNode: cc.Node = null;

    @property(cc.Node)
    fightNode: cc.Node = null;

    @property(cc.Node)
    fightBtnNode: cc.Node = null;

    @property(cc.Node)
    btnNode: cc.Node = null;

    @property(cc.Node)
    gmNode: cc.Node = null;

    @property(cc.Node)
    mulBtns: cc.Node[] = [];

    @property(cc.Node)
    autoBtns: cc.Node[] = [];

    @property(cc.Label)
    castleLvLab: cc.Label = null;

    @property(cc.Label)
    archerLvLab: cc.Label = null;

    @property(cc.Sprite)
    castleCoinSpr: cc.Sprite = null;

    @property(cc.Sprite)
    archerCoinSpr: cc.Sprite = null;

    @property(BtnCol)
    buildBtnCol: BtnCol = null;

    @property(BtnCol)
    archerBtnCol: BtnCol = null;

    @property(cc.Node)
    opacityBtnNode: cc.Node = null;

    @property(cc.Label)
    coinUpgradeLv: cc.Label = null;

    private fightMap: FightMap = null;
    private homeMap: Homestead = null;
    private isOnMoveAnim: boolean = false;

    protected start(): void {
        WorldEventManager.addListener(Global.EventEnum.FightState, this.refreshFightState, this);
        WorldEventManager.addListener(Global.EventEnum.RefreshPlayerInfo, this.refreshUpgrade, this);
    }

    init(): Promise<any> {
        this.gmNode.active = false;
        AudioManager.ins.playBgm(SoundPath.main_BGM);

        this.normalNode.stopAllActions();
        this.fightNode.stopAllActions();
        this.fightBtnNode.stopAllActions();
        this.normalNode.y = 0;
        this.fightNode.y = -72;
        this.fightBtnNode.x = -70;
        this.btnNode.stopAllActions();
        this.btnNode.y = 208;

        this.isOnMoveAnim = false;
        this.refreshUpgrade();

        let winSize = cc.winSize;
        this.mapContent.y = -winSize.height / 2;
        this.mapContent.height = winSize.height * 2;
        this.mapContent.stopAllActions();

        this.opacityBtnNode.stopAllActions();
        this.opacityBtnNode.x = 310;

        this.refreshBtns();

        //初始化战斗地图
        let promise1 = new Promise((resolve, reject) => {
            AbManager.loadBundleRes(BundleName.Start, "prefab/FightMap", cc.Prefab).then((pre: cc.Prefab) => {
                let node = MyPool.getObj(pre);
                node.parent = this.mapContent;
                node.setPosition(0, winSize.height / 2);
                let map = node.getComponent(FightMap);
                this.fightMap = map;
                map.init().then(resolve);
            })
        })
        //初始化家园地图
        let promise2 = new Promise((resolve, reject) => {
            AbManager.loadBundleRes(BundleName.Part1, "prefab/homestead/Homestead", cc.Prefab).then((pre: cc.Prefab) => {
                let node = MyPool.getObj(pre);
                node.parent = this.mapContent;
                node.setContentSize(winSize);
                node.setPosition(0, -winSize.height / 2);
                let map = node.getComponent("Homestead");
                HomeManager.ins.homestead = map;
                this.homeMap = map;
                map.init().then(resolve);
                node.active = false;
            })
        })
        this.btns.forEach((v, k) => {
            v.active = k == 0;
        })
        return Promise.all([promise1, promise2]);
    }

    /**刷新升级显示 */
    refreshUpgrade() {
        let config1 = DataManager.ins.get(CastleConfigMgr).getDataById(PlayerData.ins.carstelLv);
        if (config1) {
            this.castleLvLab.string = "城墙Lv." + PlayerData.ins.carstelLv;
            if (config1.upgradeCost == null) {
                this.buildUpgradeLab.string = "已满级";
                this.castleCoinSpr.node.active = false;
                this.buildUpgradeLab.node.color = cc.color(237, 126, 126);
            } else {
                this.buildUpgradeLab.string = Util.getFormatValueStr(config1.upgradeCost[1]);
                let isEnought1 = PlayerData.ins.checkCostIsEnough(config1.upgradeCost[0], config1.upgradeCost[1], false);
                this.buildBtnCol.setIsGray(!isEnought1);
                this.buildUpgradeLab.node.color = isEnought1 ? cc.Color.WHITE : cc.color(237, 126, 126);
                this.castleCoinSpr.node.active = true;
                AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + config1.upgradeCost[0], cc.SpriteFrame).then(spf => {
                    this.castleCoinSpr.spriteFrame = spf;
                })
            }
        }
        let config = DataManager.ins.get(ArcherUpgradeConfigMgr).getDataById(PlayerData.ins.archerLv);
        if (config) {
            this.archerLvLab.string = "弓箭手Lv." + PlayerData.ins.archerLv;
            if (config.upgradeCost == null) {
                this.archerUpgradeLab.string = "已满级";
                this.archerCoinSpr.node.active = false;
                this.archerUpgradeLab.node.color = cc.color(237, 126, 126);
            } else {
                let actualCost = Math.floor(HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.弓箭手强化费用, config.upgradeCost[1]));
                this.archerUpgradeLab.string = Util.getFormatValueStr(actualCost);
                let isEnought = PlayerData.ins.checkCostIsEnough(config.upgradeCost[0], config.upgradeCost[1], false);
                this.archerBtnCol.setIsGray(!isEnought);
                this.archerUpgradeLab.node.color = isEnought ? cc.Color.WHITE : cc.color(237, 126, 126);
                this.archerCoinSpr.node.active = true;
                AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + config.upgradeCost[0], cc.SpriteFrame).then(spf => {
                    this.archerCoinSpr.spriteFrame = spf;
                })
            }
        }
        this.coinUpgradeLv.string = PlayerData.ins.coinUpgradeLv + "";
    }

    refreshFightState(isStart: boolean) {
        if (this.isOnMoveAnim) return;
        this.isOnMoveAnim = true;
        UIManager.ins.isSceneBlockInput = true;
        this.normalNode.stopAllActions();
        this.fightNode.stopAllActions();
        this.fightBtnNode.stopAllActions();
        this.refreshBtns();
        if (isStart) {
            cc.tween(this.fightBtnNode)
                .to(0.5, { x: 70 })
                .start()
            cc.tween(this.opacityBtnNode)
                .to(0.5, { x: 410 })
                .start();
            cc.tween(this.normalNode)
                .to(0.5, { y: -300 })
                .start()
            cc.tween(this.fightNode)
                .to(0.5, { y: 66 })
                .call(() => {
                    UIManager.ins.isSceneBlockInput = false;
                    this.isOnMoveAnim = false;
                })
                .start()
            this.mainClick();
        } else {
            cc.tween(this.fightBtnNode)
                .to(0.5, { x: -70 })
                .start()
            cc.tween(this.opacityBtnNode)
                .to(0.5, { x: 310 })
                .start();
            cc.tween(this.normalNode)
                .to(0.5, { y: 0 })
                .start()
            cc.tween(this.fightNode)
                .to(0.5, { y: -72 })
                .call(() => {
                    UIManager.ins.isSceneBlockInput = false;
                    this.isOnMoveAnim = false;
                })
                .start()
        }
    }

    refreshBtns() {
        this.mulBtns.forEach((v, k) => {
            v.active = k == PlayerData.ins.fightSpeedMul - 1;
        })
        this.autoBtns.forEach((v, k) => {
            v.active = PlayerData.ins.isAutoFight;
        })
    }

    //点击升级城堡
    castelUpgradeClick() {
        PlayerData.ins.upgradeCastle(() => {
            AudioManager.ins.playEffect(SoundPath.level_up);
            FightMap.ins.playerBase.refreshPlayerInfo();
            FightMap.ins.playerBase.playEffectAnim(0, true);
        }, () => {
            AudioManager.ins.playClickAudio();
        });
        this.refreshUpgrade();
    }

    //升级弓箭手
    archerUpgradeClick() {
        PlayerData.ins.upgradeArcher(() => {
            AudioManager.ins.playEffect(SoundPath.level_up);
            FightMap.ins.archerCol.refreshLv();
            FightMap.ins.archerCol.upgradeEffect();
        }, () => {
            AudioManager.ins.playClickAudio();
        });
        this.refreshUpgrade();
    }

    //战斗
    fightClick() {
        FightManager.ins.startFight(Global.FightType.Normal, PlayerData.ins.wave + 1);
    }

    /**出征 */
    battleClick() {
        UIManager.ins.openView(UiPath.TerritoryLvUI).then((view: TerritoryLvUI) => {
            view.init(0);
        });
    }

    //撤退
    exitClick() {
        AudioManager.ins.stopAllEffect();
        FightManager.ins.endFight(false, true);
    }

    //科技
    armsClick() {
        UIManager.ins.openView(UiPath.ArmamentDialog);
    }

    //家园
    homeClick() {
        UIManager.ins.isSceneBlockInput = true;
        this.homeMap.node.active = true;
        this.btns.forEach((v, k) => {
            v.active = k == 1;
        })
        cc.tween(this.mapContent)
            .to(0.5, { y: cc.winSize.height / 2 })
            .call(() => {
                this.fightMap.node.active = false;
                UIManager.ins.isSceneBlockInput = false;
            })
            .start();
        cc.tween(this.btnNode)
            .to(0.5, { y: -80 })
            .start()
    }

    mainClick() {
        UIManager.ins.isSceneBlockInput = true;
        this.fightMap.node.active = true;
        this.btns.forEach((v, k) => {
            v.active = k == 0;
        })
        cc.tween(this.mapContent)
            .to(0.5, { y: -cc.winSize.height / 2 })
            .call(() => {
                this.homeMap.node.active = false;
                UIManager.ins.isSceneBlockInput = false;
                FightMap.ins.refreshBaseArr();
            })
            .start();
        cc.tween(this.btnNode)
            .to(0.5, { y: 208 })
            .start()
    }
    //测试
    tetsClick() {
        // UIManager.ins.openView(UiPath.SignUI)
        PlayerData.ins.changeItemNum(Global.ItemId.Coin, 1000)
        // UIManager.ins.openView(UiPath.ChooseHeroUI).then((view: ChooseHeroUI) => {
        //     view.init(0);
        // });
    }

    optionClick() {
        UIManager.ins.openView(UiPath.OptionView);
    }

    gmClick() {
        this.gmNode.active = !this.gmNode.active;
    }

    mulClick() {
        GamingData.fightSpeedMul++;
        if (GamingData.fightSpeedMul > 2) {
            GamingData.fightSpeedMul = 1;
        }
        this.mulBtns.forEach((v, k) => {
            v.active = k == PlayerData.ins.fightSpeedMul - 1;
        })
    }

    autoChangeClick() {
        PlayerData.ins.changeIsAutoFight();
        this.autoBtns.forEach((v, k) => {
            v.active = PlayerData.ins.isAutoFight;
        })
    }

    coinUpgradeClick() {
        UIManager.ins.openView(UiPath.CoinUpgradeView);
    }

    checkSign() {
        if (PlayerData.ins.checkSignReward().length > 0) {
            UIManager.ins.openView(UiPath.SignUI);
        }
        SceneEventManager.ins.finishCurEvent();
    }

    checkUnlockNewFunc() {
        //检查是否有新解锁的功能
        let datas = DataManager.ins.get(FunctionlockConfigMgr).datas;
        datas.forEach(v => {
            if (v.type == 3) {
                if (PlayerData.ins.wave >= v.wave && !PlayerData.ins.unlockFunc.includes(v.id)) {
                    PlayerData.ins.unlockFunc.push(v.id);
                    UIManager.ins.openView(UiPath.UnlockFuncView).then((view: UnlockFuncView) => {
                        view.init(v.id, () => {
                            WorldEventManager.triggerEvent(Global.EventEnum.RefreshWave);
                            SceneEventManager.ins.finishCurEvent();
                            RedPointManager.ins.checkRedPoint();
                        });
                    })
                }
            }
        })
    }
}

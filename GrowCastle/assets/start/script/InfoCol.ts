import GamingData from "../../homepage/script/common/GamingData";
import { Global } from "../../homepage/script/common/Global";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiPath } from "../../homepage/script/common/UiPath";
import { Util } from "../../homepage/script/common/Util";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import { PlayerLevelConfigMgr } from "../../homepage/script/config/PlayerLevelConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import RedPointManager from "../../homepage/script/manager/RedPointManager";
import AddCoinUI from "../../part1/script/AddCoinUI";
import EffectManager from "./EffectManager";
import ProgressCol from "./ProgressCol";
import AnimCol from "./skill/AnimCol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InfoCol extends cc.Component {

    @property(cc.Label)
    coinLab: cc.Label = null;

    @property(cc.Label)
    crystalLab: cc.Label = null;

    @property(cc.Label)
    levelLab: cc.Label = null;

    @property(cc.Label)
    recrultLab: cc.Label = null;

    @property(ProgressCol)
    lvCol: ProgressCol = null;

    @property(cc.Node)
    coinNode: cc.Node = null;

    @property(cc.Node)
    crystalNode: cc.Node = null;

    @property(AnimCol)
    upgradeAnimCol: AnimCol = null;

    static ins: InfoCol = null;
    private curCoin: Promise<void> = Promise.resolve();
    private curCry: Promise<void> = Promise.resolve();
    private curCoinNum: number = 0;
    private curCryNum: number = 0;
    private flyPromise: Promise<void> = null;

    protected onLoad(): void {
        InfoCol.ins = this;
        WorldEventManager.addListener(Global.EventEnum.RefreshPlayerInfo, this.refreshLab, this);
        WorldEventManager.addListener(Global.EventEnum.PlayerUpgrade, this.playerUpgrade, this);
    }

    protected onEnable(): void {
        this.refreshLab();
        this.coinNode.stopAllActions();
        this.coinNode.setScale(0.6);
        this.crystalNode.stopAllActions();
        this.crystalNode.setScale(0.6);
        this.upgradeAnimCol && (this.upgradeAnimCol.node.active = false);
    }

    refreshLab() {
        if (this.flyPromise) return;
        this.curCoinNum = PlayerData.ins.getItemNum(Global.ItemId.Coin);
        this.curCryNum = PlayerData.ins.getItemNum(Global.ItemId.Crystal);
        this.coinLab.string = Util.getFormatValueStr(PlayerData.ins.getItemNum(Global.ItemId.Coin));
        this.crystalLab.string = Util.getFormatValueStr(PlayerData.ins.getItemNum(Global.ItemId.Crystal));
        this.recrultLab && (this.recrultLab.string = PlayerData.ins.getItemNum(Global.ItemId.RecruitTick) + "");
        this.levelLab && (this.levelLab.string = PlayerData.ins.playerLv + "");
        let levelConfig = DataManager.ins.get(PlayerLevelConfigMgr).getDataById(PlayerData.ins.playerLv);
        if (this.lvCol) {
            this.lvCol.init(levelConfig.exp);
            this.lvCol.setCurNum(PlayerData.ins.playerCurLvExp);
        }
        RedPointManager.ins.checkRedPoint();
    }

    playerUpgrade(reward: { id: number, num: number }[]) {
        this.flyPromise = EffectManager.ins.createFlyNode(reward, true).then(() => {
            this.flyPromise = null;
        });
        if (this.upgradeAnimCol) {
            this.upgradeAnimCol.node.active = true;
            this.upgradeAnimCol.play(null, 1, 1).then(() => {
                this.upgradeAnimCol.node.active = false;
            })
        }
    }

    addCoinClick() {
        UIManager.ins.openView(UiPath.AddCoin).then((_ui: AddCoinUI) => {
            _ui.init(true);
        })
    }

    addCryClick() {
        UIManager.ins.openView(UiPath.AddCoin).then((_ui: AddCoinUI) => {
            _ui.init(false);
        })
    }

    playGetAnim(arg: { id: number, num: number, resolve: (value: unknown) => void }) {
        switch (arg.id) {
            case Global.ItemId.Coin:
                this.curCoin = this.curCoin.then(this.coinAnim.bind(this, arg.num)).then(arg.resolve);
                break;
            case Global.ItemId.Crystal:
                this.curCry = this.curCry.then(this.crystalAnim.bind(this, arg.num)).then(arg.resolve);
                break;
        }
    }

    private coinAnim(num: number) {
        return new Promise((resolve, reject) => {
            this.coinNode.stopAllActions();
            this.coinNode.setScale(0.6);
            cc.tween(this.coinNode)
                .to(0.03, { scale: 0.75 })
                .call(() => {
                    this.curCoinNum += num;
                    this.coinLab.string = Util.getFormatValueStr(this.curCoinNum);
                })
                .to(0.03, { scale: 0.6 })
                .call(resolve)
                .start()
        })
    }

    private crystalAnim(num: number) {
        return new Promise((resolve, reject) => {
            this.crystalNode.stopAllActions();
            this.crystalNode.setScale(0.6);
            cc.tween(this.crystalNode)
                .to(0.03, { scale: 0.75 })
                .call(() => {
                    this.curCryNum += num;
                    this.crystalLab.string = Util.getFormatValueStr(this.curCryNum);
                })
                .to(0.03, { scale: 0.6 })
                .call(resolve)
                .start()
        })
    }
}

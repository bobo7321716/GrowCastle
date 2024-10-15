// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { AudioManager } from "../../../homepage/script/common/AudioManager";
import BtnCol from "../../../homepage/script/common/BtnCol";
import { BundleName } from "../../../homepage/script/common/BundleName";
import { Global } from "../../../homepage/script/common/Global";
import MyPool from "../../../homepage/script/common/MyPool";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { SoundPath } from "../../../homepage/script/common/SoundPath";
import TipManager from "../../../homepage/script/common/TipManager";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiBase } from "../../../homepage/script/common/UiBase";
import { UiPath } from "../../../homepage/script/common/UiPath";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import ConstConfig, { ConstConfigMgr } from "../../../homepage/script/config/ConstConfig";
import { GoldmineConfigMgr } from "../../../homepage/script/config/GoldmineConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import HomeManager from "../../../homepage/script/manager/HomeManager";
import AddCoinUI from "../AddCoinUI";
import WorkerstateItem from "./WorkerstateItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GoldmineDialog extends UiBase {


    @property(cc.Node)
    itemParent: cc.Node = null;
    @property({ type: cc.Label, tooltip: "矿工人数" })
    numLabel: cc.Label = null
    @property({ type: cc.Label, tooltip: "每分钟金币" })
    coinLabel: cc.Label = null

    @property(cc.Label)
    costLabel: cc.Label = null
    @property(cc.Label)
    tickLabel: cc.Label = null

    @property(BtnCol)
    btnCol: BtnCol = null;

    @property(cc.Label)
    titleLab: cc.Label = null;

    items: WorkerstateItem[] = []
    nextlevelCost: number = 0;
    /**升级的回调 */
    upgradeCallback: () => void = null

    get level() {
        return PlayerData.ins.goldmineLevel;
    }
    protected onDestroy(): void {
        this.items.forEach(val => MyPool.putObj(val.node));
        this.items = []
    }
    init(_cb: () => void) {
        this.upgradeCallback = _cb;
        if (this.items.length == 0) {
            AbManager.loadBundleRes(BundleName.Part1, "prefab/homestead/WorkerstateItem", cc.Prefab).then((_prefab) => {
                let _count = 0;
                for (let i = 0; i < 9; i++) {
                    let _node = MyPool.getObj(_prefab)
                    let _item = _node.getComponent(WorkerstateItem);
                    this.items.push(_item);
                    _node.parent = this.itemParent;
                    _count++;
                    if (_count >= 9) {
                        this.setLevel(this.level);
                    }
                }
            })
        }
        else {
            this.setLevel(this.level)
        }

        this.titleLab.string = "铜矿lv." + this.level;
    }


    /**设置金矿等级 */
    setLevel(_level) {
        let goldmineData = DataManager.ins.get(GoldmineConfigMgr).datas[_level];
        for (let i = 0; i < 9; i++) {
            this.items[i].init(goldmineData.gold[i])
        }

        let _nextLevelData = DataManager.ins.get(GoldmineConfigMgr).datas[_level + 1]
        if (_nextLevelData != null) {
            this.costLabel.string = _nextLevelData.cost.toString();
            this.nextlevelCost = _nextLevelData.cost;
        }

        //上方显示内容
        let num = this.level
        if (this.level > 9) {
            num = 9
        }
        this.numLabel.string = `矿工 :  ${num}人`
        /**挖一轮获得的矿 */
        let roundGold = 0;

        let _add = 1 + HomeManager.ins.getPrecentValue(Global.ArmamentAttribute.矿工挖矿铜币数量)
        goldmineData.gold.forEach(_g => {
            roundGold += (HomeManager.ins.goldLevel[_g] * _add);
        });


        let _goldTimes = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.矿工基础速度).value

        let _speedBuff = 1 + HomeManager.ins.getPrecentValue(Global.ArmamentAttribute.矿工挖矿速度)

        this.coinLabel.string = ((roundGold * _goldTimes) * _speedBuff).toFixed(1) + "/分";
        let coinIsEnough = PlayerData.ins.getItemNum(Global.ItemId.Coin) >= this.nextlevelCost;
        this.costLabel.node.color = !coinIsEnough ? cc.color(237, 126, 126) : cc.Color.WHITE;
        let tickIsEnough = PlayerData.ins.getItemNum(Global.ItemId.RecruitTick) >= 1;
        this.tickLabel.node.color = !tickIsEnough ? cc.color(237, 126, 126) : cc.Color.WHITE;
        this.btnCol.setIsGray(!coinIsEnough || !tickIsEnough);

        this.titleLab.string = "铜矿lv." + this.level;
    }

    /**雇佣 */
    btnRecuitClick() {
        if (this.level < DataManager.ins.get(GoldmineConfigMgr).datas.length) {

            if (PlayerData.ins.getItemNum(Global.ItemId.Coin) < this.nextlevelCost) {
                // TipManager.ins.showTip("铜币不足")
                this.costLabel.node.color = cc.color(237, 126, 126);
                AudioManager.ins.playClickAudio();
                UIManager.ins.openView(UiPath.AddCoin).then((_ui: AddCoinUI) => {
                    _ui.init(true);
                })
                return;
            }
            if (PlayerData.ins.getItemNum(Global.ItemId.RecruitTick) < 1) {
                TipManager.ins.showTip("招募券不足")
                AudioManager.ins.playClickAudio();
                return;
            }
            //扣钱,扣招募券
            PlayerData.ins.changeItemNum(Global.ItemId.Coin, -this.nextlevelCost);
            PlayerData.ins.changeItemNum(Global.ItemId.RecruitTick, -1);

            PlayerData.ins.upgradeGoldmine();

            this.setLevel(this.level);
            this.upgradeCallback && this.upgradeCallback();
            AudioManager.ins.playEffect(SoundPath.level_up);
        }
    }




}

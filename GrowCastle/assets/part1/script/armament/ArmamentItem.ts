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
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { SoundPath } from "../../../homepage/script/common/SoundPath";
import TipManager from "../../../homepage/script/common/TipManager";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { Util } from "../../../homepage/script/common/Util";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import AbRef from "../../../homepage/script/common/asssetsBundle/AbRef";
import ArmamentConfig from "../../../homepage/script/config/ArmamentConfig";
import { ConstConfigMgr } from "../../../homepage/script/config/ConstConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import HomeManager from "../../../homepage/script/manager/HomeManager";
import RedPointManager from "../../../homepage/script/manager/RedPointManager";
import FightMap from "../../../start/script/FightMap";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArmamentItem extends cc.Component {
    /**技能标识 */
    id: number = 0;
    group: Global.ArmamentGroup = 1;

    currentLevel: number = 0;

    config: ArmamentConfig = null;

    @property({ type: cc.Label, tooltip: "科技名称" })
    nameLabel: cc.Label = null;
    @property({ type: cc.Label, tooltip: "详情" })
    descLabel: cc.Label = null;
    @property({ type: cc.RichText, tooltip: "升级的数值变化" })
    infoLabel: cc.RichText = null;
    @property({ type: cc.Label, tooltip: "升级的资源消耗" })
    costLabel: cc.Label = null;
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property({ type: AbRef, tooltip: "升级的资源消耗的图标" })
    costIcon: AbRef = null;

    @property(BtnCol)
    btnCol: BtnCol = null;

    @property(cc.Node)
    lockNode: cc.Node = null;

    @property(cc.Label)
    lockLab: cc.Label = null;

    @property(cc.Node)
    adUpgradeBtnNode: cc.Node = null;

    @property(cc.Node)
    upgradeBtnNode: cc.Node = null;

    @property(cc.Node)
    redPointNode: cc.Node = null;

    @property(AbRef)
    adCostIcon: AbRef = null;
    @property(cc.Label)
    adCostLabel: cc.Label = null;

    /**当前等级的货币消耗 */
    get cost() {
        return this.config.cost_base + this.config.cost_add * this.currentLevel
    }

    private cb: () => void = null;
    private isLock: boolean = false;
    private lockTip: string = "";

    init(_config: ArmamentConfig, cb: () => void = null) {
        this.cb = cb;
        this.config = _config
        this.id = _config.id;
        this.descLabel.string = _config.desc;
        this.group = _config.group;
        this.currentLevel = PlayerData.ins.armamentInfo.find(val => val.id == this.id).lv
        this.refreshInfo();
    }


    /**刷新可变信息 */
    refreshInfo() {
        this.isLock = PlayerData.ins.wave < this.config.wave;
        this.lockTip = "通关第" + this.config.wave + "波解锁";
        this.lockNode.active = this.isLock;
        this.lockLab.string = this.lockTip;
        AbManager.loadBundleRes(BundleName.Part1, "res/armament/" + this.config.icon, cc.SpriteFrame).then((spf) => {
            this.icon.spriteFrame = spf;
        })

        this.nameLabel.string = `${this.config.name} lv.${this.currentLevel}`;
        let _symbol = this.config.value_type == 1 ? "" : "%";
        let currentVal = (this.currentLevel * this.config.value);
        let nextVal = ((this.currentLevel + 1) * this.config.value);
        if (this.config.value_type == Global.dataType.precent) {
            currentVal = currentVal * 100
            nextVal = nextVal * 100
        }
        if (this.currentLevel < this.config.max) {
            this.infoLabel.string = `<color=#000000>${currentVal.toFixed(2)}${_symbol}→</c><color=#1b8c0d>${nextVal.toFixed(2)}${_symbol}</c>`
        }
        else {
            this.infoLabel.string = `<color=#000000>${currentVal.toFixed(2)}${_symbol}</c>`
        }

        this.adUpgradeBtnNode.active = false;
        this.upgradeBtnNode.active = this.currentLevel < this.config.max;
        let _enough = false
        switch (this.config.cost_type) {
            case Global.ItemId.Coin:
                {
                    //金币
                    _enough = PlayerData.ins.getItemNum(Global.ItemId.Coin) >= this.cost;
                    let adLimit = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.军备每日视频升级次数).value;
                    if (PlayerData.ins.armAdUpgradeTimes < adLimit && !_enough) {
                        this.adUpgradeBtnNode.active = true;
                        this.upgradeBtnNode.active = false;
                    }
                }
                break;
            case Global.ItemId.Crystal:
                {
                    //水晶
                    _enough = PlayerData.ins.getItemNum(Global.ItemId.Crystal) >= this.cost
                }
                break;
        }
        AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + this.config.cost_type, cc.SpriteFrame).then((spf) => {
            this.costIcon.spriteFrame = spf;
        })
        // this.upgradeButton.interactable = _enough;
        this.costLabel.node.color = _enough ? cc.Color.WHITE : cc.color(237, 126, 126);
        this.costLabel.string = Util.getFormatValueStr(this.cost);

        AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + this.config.cost_type, cc.SpriteFrame).then((spf) => {
            this.adCostIcon.spriteFrame = spf;
        })
        this.adCostLabel.string = Util.getFormatValueStr(this.cost);
        this.btnCol.setIsGray(!_enough);
        this.redPointNode.active = _enough && !this.isLock;
    }

    /**点击升级 */
    btnUpgradeClick(btn, data: string) {

        if (this.isLock) {
            TipManager.ins.showTip(this.lockTip);
            return;
        }
        let isFree = data == "1";
        let call = () => {
            PlayerData.ins.upgradeArmament(this.id, isFree, () => {
                if (isFree) {
                    PlayerData.ins.armAdUpgradeTimes++;
                    PlayerData.ins.saveData();
                }
                UIManager.ins.showUpgradeEffect(1);
                AudioManager.ins.playEffect(SoundPath.level_up);
                this.currentLevel++;
                this.refreshInfo()
                HomeManager.ins.refreshData(Global.dataSource.armament, this.id, this.config.attribute, this.currentLevel * this.config.value, true)
                FightMap.ins.refreshBaseArr();
                this.cb && this.cb();
                RedPointManager.ins.checkRedPoint();
            }, () => {
                AudioManager.ins.playClickAudio();
            })
        }
        if (!isFree) {
            call();
        } else {
            call();
        }
    }


}

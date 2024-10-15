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
import { UiPath } from "../../../homepage/script/common/UiPath";
import { Util } from "../../../homepage/script/common/Util";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import HomeAttributeConfig, { HomeAttributeConfigMgr } from "../../../homepage/script/config/HomeAttributeConfig";
import HomebuildConfig, { HomebuildConfigMgr } from "../../../homepage/script/config/HomebuildConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import HomeManager from "../../../homepage/script/manager/HomeManager";
import TaskManager from "../../../homepage/script/manager/TaskManager";
import FightMap from "../../../start/script/FightMap";
import { PlayerBase } from "../../../start/script/role/PlayerBase";
import HomeBuildDetailsPopup from "./HomeBuildDetailsPopup";

const { ccclass, property } = cc._decorator;

/**建筑商店界面的建筑项目 */
@ccclass
export default class HomeBuildShopItem extends cc.Component {


    @property(cc.Sprite)
    icon: cc.Sprite = null

    @property(cc.Label)
    nameLabel: cc.Label = null

    @property({ type: cc.Label, tooltip: "建筑物描述" })
    descLabel: cc.Label = null
    @property({ type: cc.RichText, tooltip: "数值" })
    infoLabel: cc.RichText = null


    @property({ type: cc.Node, tooltip: "点击装备按钮" })
    equip: cc.Node = null
    @property({ type: cc.Node, tooltip: "已装备的提示" })
    equipTip: cc.Node = null
    @property({ type: cc.Node, tooltip: "点击卸下按钮" })
    unEquip: cc.Node = null;
    @property({ type: cc.Node, tooltip: "升级按钮" })
    upgradeButton: cc.Node = null;

    @property({ type: cc.Node, tooltip: "建造按钮组" })
    buildGroup: cc.Node = null
    @property({ type: cc.Node, tooltip: "升级按钮组" })
    upgradeGroup: cc.Node = null
    @property({ type: cc.Node, tooltip: "已经满级的提示" })
    maxLevelTip: cc.Node = null

    @property(cc.Label)
    buildPriceLabel: cc.Label = null
    @property(cc.Label)
    upgradePriceLabel: cc.Label = null

    @property(BtnCol)
    buildBtnCol: BtnCol = null;
    @property(BtnCol)
    upgradeBtnCol: BtnCol = null;

    /**建筑的id */
    id: number = 0;
    /**当前等级 */
    currentLevel: number = 0;

    /**选中的这块地的位置 */
    groundPos: number = 0;



    buildData: HomebuildConfig = null;
    /**下一级的家园建筑属性 */
    nextattributeData: HomeAttributeConfig = null;
    /**此建筑的持久化数据 */
    playdata: { id: number, lv: number, pos: number } = null;
    buildAttribute: HomeAttributeConfig = null;
    // nextLevelAttribute: HomeAttributeConfig = null;

    refreshCallback: () => void = null;


    init(_data: { id: number, lv: number, pos: number }, _groundPos: number, _refreshCb: () => void) {

        this.playdata = _data;
        this.id = _data.id;
        this.currentLevel = _data.lv;
        this.groundPos = _groundPos;
        this.refreshCallback = _refreshCb;
        this.buildData = DataManager.ins.get(HomebuildConfigMgr).datas.find(val => val.id == this.id)
        this.refresh()
    }

    /**刷新 */
    refresh() {
        //显示建筑物描述
        this.nameLabel.string = this.buildData.name + "Lv." + this.playdata.lv.toString();
        this.descLabel.string = this.buildData.desc;
        let _symbol = this.buildData.value_type == Global.dataType.constant ? "" : "%";
        this.buildAttribute = HomeManager.ins.homeAttributeConfigMap.get(this.id).find(val => val.level == this.playdata.lv);
        this.nextattributeData = HomeManager.ins.homeAttributeConfigMap.get(this.id).find(val => val.level == this.playdata.lv + 1);
        //百分比显示要乘100
        let _currentVal = (this.buildData.value_type == Global.dataType.constant ? this.buildAttribute.value : this.buildAttribute.value * 100);
        if (this.nextattributeData != null && this.playdata.lv > 0) {
            let _nextVal = this.buildData.value_type == Global.dataType.constant ? this.nextattributeData.value : this.nextattributeData.value * 100;
            this.infoLabel.string = `<color=#000000>${_currentVal.toFixed(2)}${_symbol}→</c><color=#1b8c0d>${_nextVal.toFixed(2)}${_symbol}</c>`
            // this.upgradePriceLabel.string = this.nextattributeData.cost.toString();//升级的花费
        } else {
            let _nextVal = this.buildData.value_type == Global.dataType.constant ? this.nextattributeData.value : this.nextattributeData.value * 100;
            this.infoLabel.string = `<color=#000000>${_nextVal.toFixed(2)}${_symbol}</c>`
        }

        this.upgradePriceLabel.string = Util.getFormatValueStr(this.buildAttribute.cost);
        this.buildPriceLabel.string = Util.getFormatValueStr(this.buildData.cost);

        let isEnoughUpgrade = PlayerData.ins.checkCostIsEnough(this.buildAttribute.cost_type, this.buildAttribute.cost, false, false);
        this.upgradeBtnCol.setIsGray(!isEnoughUpgrade);

        let isEnoughBuild = PlayerData.ins.checkCostIsEnough(this.buildData.cost_type, this.buildData.cost, false, false);
        this.buildBtnCol.setIsGray(!isEnoughBuild);

        this.equipTip.active = this.playdata.pos > 0;
        //按钮的开关
        if (this.playdata.lv == 0) {
            this.buildGroup.active = true;
            this.upgradeGroup.active = false;
            // this.buildPriceLabel.string = this.buildData.cost.toString()
            // this.infoLabel.node.active = false;

            this.maxLevelTip.active = false;
        } else {
            //已购买的情况,判定是否关闭
            this.buildGroup.active = false;
            this.upgradeGroup.active = true;
            this.equip.active = this.playdata.pos <= 0
            this.unEquip.active = this.playdata.pos > 0

            this.infoLabel.node.active = true;
            this.maxLevelTip.active = false;

            this.maxLevelTip.active = (this.playdata.lv >= this.buildData.max);
            this.upgradeButton.active = (this.playdata.lv < this.buildData.max)
        }
        //刷新数据
        HomeManager.ins.refreshData(Global.dataSource.homebuild, this.id, this.buildAttribute.attribute, this.buildAttribute.value, this.playdata.pos > 0)
        AbManager.loadBundleRes(BundleName.Assets, "texture/homeBuild/" + this.buildData.icon, cc.SpriteFrame).then(spf => {
            this.icon.spriteFrame = spf;
        })
    }



    /**点击建造 */
    btnBuildClick() {
        //扣钱
        let isEnough = PlayerData.ins.checkCostIsEnough(this.buildData.cost_type, this.buildData.cost, true, true);
        if (!isEnough) {
            return;
        }
        let _target = PlayerData.ins.homeBuildPos.find(val => val.pos == this.groundPos);
        this.playdata.pos = _target ? -1 : this.groundPos;
        this.playdata.lv = 1;
        PlayerData.ins.saveData();
        this.refreshCallback && this.refreshCallback()
        AudioManager.ins.playClickAudio();
        TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.UnlockHomeBuild);
    }

    /**点击装备 */
    btnEquipClick() {
        let _target = PlayerData.ins.homeBuildPos.find(val => val.pos == this.groundPos);
        if (_target != null) {
            _target.pos = -1;
        }
        this.playdata.pos = this.groundPos;
        PlayerData.ins.saveData();
        this.refreshCallback && this.refreshCallback()
        AudioManager.ins.playClickAudio();
    }

    /**点击卸下 */
    btnUnEquipClick() {
        this.playdata.pos = -1;
        PlayerData.ins.saveData();
        this.refreshCallback && this.refreshCallback();
        AudioManager.ins.playClickAudio();
    }

    /**点击升级 */
    btnUpgradeClick() {
        //扣钱
        if (this.playdata.lv >= this.buildData.max) {
            TipManager.ins.showTip("已满级")
            AudioManager.ins.playClickAudio();
            return;
        }
        let isEnough = PlayerData.ins.checkCostIsEnough(this.buildAttribute.cost_type, this.buildAttribute.cost, true, true);
        if (!isEnough) {
            AudioManager.ins.playClickAudio();
            return;
        }
        AudioManager.ins.playEffect(SoundPath.level_up);
        PlayerData.ins.upgradeHomeBuild(this.id);
        this.refresh();
        // this.scheduleOnce(() => {
        //     FightMap.ins.refreshBaseArr();
        // })
    }



    /**点击显示建筑物详情 */
    btnShowDetailClick() {
        AudioManager.ins.playClickAudio();
        UIManager.ins.openView(UiPath.HomeBuildDetailsPopup).then((_pop: HomeBuildDetailsPopup) => {
            _pop.init(this.buildData, this.id, this.groundPos)
        });
    }
}

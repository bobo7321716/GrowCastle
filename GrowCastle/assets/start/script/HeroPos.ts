import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import { AudioManager } from "../../homepage/script/common/AudioManager";
import BtnCol from "../../homepage/script/common/BtnCol";
import { BundleName } from "../../homepage/script/common/BundleName";
import { Global } from "../../homepage/script/common/Global";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiPath } from "../../homepage/script/common/UiPath";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import HeroattributeConfig, { HeroattributeConfigMgr } from "../../homepage/script/config/HeroattributeConfig";
import HeroConfig, { HeroConfigMgr } from "../../homepage/script/config/HeroConfig";
import { ItemConfigMgr } from "../../homepage/script/config/ItemConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import ChooseHeroUI from "../../part1/script/ChooseHeroUI";
import FightManager from "./FightManager";
import PosHand from "./PosHand";
import { HeroBase } from "./role/HeroBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroPos extends cc.Component {

    @property(HeroBase)
    heroBase: HeroBase = null;

    @property(PosHand)
    posHand: PosHand = null;

    @property(BtnCol)
    btnCol: BtnCol = null;

    @property(cc.Node)
    upgradeNode: cc.Node = null;

    @property(cc.Label)
    titleLab: cc.Label = null;

    @property(cc.Label)
    costLab: cc.Label = null;

    @property(cc.Sprite)
    costSpr: cc.Sprite = null;

    private heroId: number = null;
    private index: number = null;
    private attributeConfig: HeroattributeConfig = null;

    protected onLoad(): void {
        WorldEventManager.addListener(Global.EventEnum.RefreshPlayerInfo, this.refreshCost, this);
    }

    init(heroId: number, index: number) {
        return new Promise((resolve, reject) => {
            this.heroId = heroId;
            this.index = index;
            if (heroId > 0) {
                this.heroBase.init({ roleType: Global.RoleType.Hero, roleId: heroId }).then(resolve);
            } else {
                this.heroBase.reset();
                resolve(null);
            }
            this.refreshCost();
        })
    }

    refreshCost() {
        let info = PlayerData.ins.unlockHeroInfos.find(v => v.id == this.heroId);
        if (!info) {
            info = { id: this.heroId, lv: 1, atkPos: -1, isBuy: false };
        }
        let datas = DataManager.ins.get(HeroattributeConfigMgr).datas;
        this.attributeConfig = datas.find(v => v.heroid == this.heroId && v.level == info.lv);
        if (!this.attributeConfig) return;
        let costItme = DataManager.ins.get(ItemConfigMgr).getDataById(this.attributeConfig.coin[0]);
        if (!costItme) return;
        let isEnough = PlayerData.ins.getItemNum(this.attributeConfig.coin[0]) >= this.attributeConfig.coin[1];
        this.btnCol.setIsGray(!isEnough);
        AbManager.loadBundleRes(BundleName.Assets, `texture/item/` + costItme.id, cc.SpriteFrame).then((res) => {
            this.costSpr.spriteFrame = res;
        })
        this.costLab.string = this.attributeConfig.coin[1].toString();
        let allConfig = DataManager.ins.get(HeroattributeConfigMgr).getAllConfig(this.heroId);
        let isMax = info.lv >= allConfig[allConfig.length - 1].level;
        this.titleLab.string = isMax ? "已满级" : "升级";
        this.upgradeNode.active = !isMax;
    }

    heroClick() {
        AudioManager.ins.playClickAudio();
        if (FightManager.ins.isOnFight) {
            // this.heroBase.skill();
        } else {
            UIManager.ins.openView(UiPath.ChooseHeroUI).then((view: ChooseHeroUI) => {
                view.init();
            });
        }
    }

    showPosHand() {
        if (!this.heroBase.baseRole && this.posHand) {
            this.posHand.showGuideHand();
        }
    }

    releaseSkill() {
        this.heroBase.skill();
    }
}

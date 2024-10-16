import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import { BundleName } from "../../homepage/script/common/BundleName";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { HeroattributeConfigMgr } from "../../homepage/script/config/HeroattributeConfig";
import SkillConfig, { SkillConfigMgr } from "../../homepage/script/config/SkillConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import FightManager from "./FightManager";
import FightMap from "./FightMap";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillIcon extends cc.Component {

    @property(cc.Label)
    mpLab: cc.Label = null;

    @property(cc.Sprite)
    iconSpr: cc.Sprite = null;

    @property(cc.Material)
    iconMater: cc.Material[] = [];

    @property
    index: number = 0;

    private heroInfo: { id: number, lv: number, atkPos: number, isBuy: boolean } = null;
    private skillConfig: SkillConfig = null;
    private isReady: boolean = false;

    init() {
        this.heroInfo = PlayerData.ins.unlockHeroInfos.find(el => el.atkPos == this.index);
        if (!this.heroInfo) return this.node.active = false;
        this.node.active = true;
        let heroattributeConfig = DataManager.ins.get(HeroattributeConfigMgr).getHeroattributeConfig(this.heroInfo.id, this.heroInfo.lv);
        if (!heroattributeConfig) return this.node.active = false;
        this.skillConfig = DataManager.ins.get(SkillConfigMgr).getDataById(heroattributeConfig.skill);
        if (!this.skillConfig) return this.node.active = false;
        AbManager.loadBundleRes(BundleName.Assets, "texture/skill/" + this.skillConfig.icon, cc.SpriteFrame).then(spf => {
            this.iconSpr.spriteFrame = spf;
        })
        this.mpLab.string = "MP:" + this.skillConfig.mp;
    }

    refresh(mp: number) {
        if (!this.skillConfig) return;
        this.isReady = mp <= this.skillConfig.mp;
        this.iconSpr.setMaterial(0, this.iconMater[this.isReady ? 0 : 1]);
    }

    releaseSkill() {
        if (!FightManager.ins.isOnFight) return;
        FightMap.ins.releaseHeroSkill(this.index);
    }
}

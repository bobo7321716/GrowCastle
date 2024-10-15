/*
 * @Author: XWL 2558913804@qq.com
 * @Date: 2024-06-19 13:33:14
 * @LastEditors: XWL 2558913804@qq.com
 * @LastEditTime: 2024-06-19 17:45:44
 * @FilePath: \GrowCastle\assets\part1\script\InfoUI.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { AudioManager } from "../../homepage/script/common/AudioManager";
import BtnCol from "../../homepage/script/common/BtnCol";
import { BundleName } from "../../homepage/script/common/BundleName";
import GamingData from "../../homepage/script/common/GamingData";
import { Global } from "../../homepage/script/common/Global";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { SoundPath } from "../../homepage/script/common/SoundPath";
import TipManager from "../../homepage/script/common/TipManager";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import AbRef from "../../homepage/script/common/asssetsBundle/AbRef";
import BuildConfig from "../../homepage/script/config/BuildConfig";
import BuildattributeConfig, { BuildattributeConfigMgr } from "../../homepage/script/config/BuildattributeConfig";
import HeroConfig from "../../homepage/script/config/HeroConfig";
import HeroattributeConfig, { HeroattributeConfigMgr } from "../../homepage/script/config/HeroattributeConfig";
import { ItemConfigMgr } from "../../homepage/script/config/ItemConfig";
import { SkillConfigMgr } from "../../homepage/script/config/SkillConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import GuideManager from "../../homepage/script/manager/GuideManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InfoUI extends UiBase {

    @property(AbRef)
    Icon: AbRef = null;

    @property(AbRef)
    atkIcon: AbRef = null;

    @property(cc.Label)
    atkNum: cc.Label = null;

    @property(cc.Label)
    speedNum: cc.Label = null;

    @property(cc.Label)
    infoName: cc.Label = null;

    @property(cc.Label)
    infoLevel: cc.Label = null;

    @property(AbRef)
    heroIcon: AbRef = null;

    @property(AbRef)
    quality: AbRef = null;

    @property(AbRef)
    skillIcon: AbRef = null;

    @property(cc.Label)
    skillName: cc.Label = null;

    @property(cc.RichText)
    skillDesc: cc.RichText = null;

    @property(cc.Label)
    ExpendCoin: cc.Label = null;

    @property(AbRef)
    coinSpr: AbRef = null;

    @property(cc.Label)
    mpLab: cc.Label = null;

    @property(cc.Label)
    cdLab: cc.Label = null;

    @property(BtnCol)
    btnCol: BtnCol = null;

    @property(cc.Label)
    nextAtkLab: cc.Label = null;

    @property(cc.Label)
    nextSpeedLab: cc.Label = null;

    @property(cc.Node)
    nextAtkNode: cc.Node = null;

    @property(cc.Node)
    nextSpeedNode: cc.Node = null;

    @property(cc.Node)
    adUpgradeBtnNode: cc.Node = null;

    @property(cc.Node)
    upgradeBtnNode: cc.Node = null;

    @property(cc.Label)
    adCostLab: cc.Label = null;

    @property(AbRef)
    adCostSpr: AbRef = null;

    private config: HeroConfig = null;
    private attributeConfig: HeroattributeConfig = null;
    private isUnlock: boolean = false;

    protected start(): void {
        WorldEventManager.addListener(Global.EventEnum.RefreshPlayerInfo, this.refreshInfo, this);
    }

    public onOpenFinish(): void {
        super.onOpenFinish();
        if (GamingData.isOnGuide && PlayerData.ins.guideGroup == 3) {
            GuideManager.ins.showCurGuide();
        }
    }

    init(config: HeroConfig, isUnlock: boolean = true) {
        this.config = config;
        this.attributeConfig = null;
        this.infoName.string = this.config.name;
        this.isUnlock = isUnlock;
        AbManager.loadBundleRes(BundleName.Assets, `texture/hero/` + config.id, cc.SpriteFrame).then((res) => {
            this.Icon.spriteFrame = res;
        });
        this.refreshInfo();
    }

    refreshInfo() {
        let info: { id: number, lv: number, atkPos: number, isBuy: boolean } = null;
        info = PlayerData.ins.unlockHeroInfos.find(v => v.id == this.config.id);
        if (!this.isUnlock) {
            info = { id: this.config.id, lv: 1, atkPos: -1, isBuy: false };
        }
        let datas1 = DataManager.ins.get(HeroattributeConfigMgr).datas;
        this.attributeConfig = datas1.find(v => v.heroid == this.config.id && v.level == info.lv);
        if (!this.attributeConfig) return;
        let nextConfig = datas1.find(v => v.heroid == this.config.id && v.level == info.lv + 1);
        this.nextAtkNode.active = !!nextConfig;
        this.nextSpeedNode.active = !!nextConfig;
        if (nextConfig) {
            this.nextAtkLab.string = nextConfig.atk.toString();
            this.nextSpeedLab.string = (nextConfig.atkSpeed / 1000).toString();
        }
        let skillConfig = DataManager.ins.get(SkillConfigMgr).getDataById(this.attributeConfig.skill);
        let costItme = DataManager.ins.get(ItemConfigMgr).getDataById(this.attributeConfig.coin[0]);
        if (!costItme) return;
        let isEnough = PlayerData.ins.getItemNum(this.attributeConfig.coin[0]) >= this.attributeConfig.coin[1];
        this.btnCol.setIsGray(!isEnough);
        let isCanAd = !isEnough && this.attributeConfig.coin[0] == Global.ItemId.Coin;
        this.adUpgradeBtnNode.active = isCanAd;
        this.upgradeBtnNode.active = !isCanAd;

        if (!this.isUnlock) this.btnCol.setIsGray(true);
        this.ExpendCoin.node.color = isEnough ? cc.Color.WHITE : cc.color(237, 126, 126);
        this.infoLevel.string = "Lv." + info.lv;
        this.atkNum.string = this.attributeConfig.atk.toString();
        this.speedNum.string = (this.attributeConfig.atkSpeed / 1000).toString();
        this.ExpendCoin.string = this.attributeConfig.coin[1].toString();
        this.adCostLab.string = this.attributeConfig.coin[1].toString();
        this.skillName.string = skillConfig.name;
        this.skillDesc.string = skillConfig.text;
        this.mpLab.string = skillConfig.mp + "";
        this.cdLab.string = skillConfig.cd / 1000 + "s";

        AbManager.loadBundleRes(BundleName.Assets, `texture/quality/` + this.config.rarity, cc.SpriteFrame).then((res) => {
            this.quality.spriteFrame = res;
        })
        AbManager.loadBundleRes(BundleName.Assets, `texture/skill/` + skillConfig.icon, cc.SpriteFrame).then((res) => {
            this.skillIcon.spriteFrame = res;
        })
        AbManager.loadBundleRes(BundleName.Assets, `texture/item/` + costItme.id, cc.SpriteFrame).then((res) => {
            this.coinSpr.spriteFrame = res;
        })
        AbManager.loadBundleRes(BundleName.Assets, `texture/item/` + costItme.id, cc.SpriteFrame).then((res) => {
            this.adCostSpr.spriteFrame = res;
        })
    }

    upGrade(btn, data: string) {
        if (!this.isUnlock) {
            TipManager.ins.showTip("该英雄未解锁");
            return;
        }
        //消耗金币升级
        let isFree = data == "1";
        let call = () => {
            PlayerData.ins.upgradeHeroOrBuild(Global.PartnerType.Hero, this.config.id, isFree, () => {
                this.refreshInfo();
                AudioManager.ins.playEffect(SoundPath.level_up);
            }, () => {
                AudioManager.ins.playClickAudio();
            });
        }
        if (!isFree) {
            call();
        } else {
            call();
        }
    }
}

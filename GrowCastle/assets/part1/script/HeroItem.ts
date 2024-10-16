/*
 * @Author: XWL 2558913804@qq.com
 * @Date: 2024-06-19 11:06:55
 * @LastEditors: XWL 2558913804@qq.com
 * @LastEditTime: 2024-06-19 17:51:17
 * @FilePath: \GrowCastle\assets\part1\script\HreoItemprefab.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import { BundleName } from "../../homepage/script/common/BundleName";
import AbRef from "../../homepage/script/common/asssetsBundle/AbRef";
import HeroConfig, { HeroConfigMgr } from "../../homepage/script/config/HeroConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiPath } from "../../homepage/script/common/UiPath";
import InfoUI from "./InfoUI";
import MyPool from "../../homepage/script/common/MyPool";
import { Global } from "../../homepage/script/common/Global";
import BuildConfig, { BuildConfigMgr } from "../../homepage/script/config/BuildConfig";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { HeroattributeConfigMgr } from "../../homepage/script/config/HeroattributeConfig";
import { BuildattributeConfigMgr } from "../../homepage/script/config/BuildattributeConfig";
import { SkillConfigMgr } from "../../homepage/script/config/SkillConfig";
import { AudioManager } from "../../homepage/script/common/AudioManager";
import { SoundPath } from "../../homepage/script/common/SoundPath";
import BtnCol from "../../homepage/script/common/BtnCol";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import { Util } from "../../homepage/script/common/Util";
import SkillIconCol from "../../start/script/SkillIconCol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroItem extends cc.Component {

    @property(AbRef)
    roleIcon: AbRef = null

    @property(AbRef)
    skillIcon: AbRef = null;

    @property(AbRef)
    qualityIcon: AbRef = null;

    @property(cc.Label)
    mpLab: cc.Label = null;

    @property(cc.Label)
    cdLab: cc.Label = null;

    @property(cc.Label)
    skillNameLab: cc.Label = null;

    @property(cc.Label)
    Level: cc.Label = null;

    @property(cc.Label)
    Name: cc.Label = null;

    @property(cc.Node)
    Battle: cc.Node = null;

    @property(cc.Node)
    End: cc.Node = null;

    @property(cc.Node)
    upgrade: cc.Node = null;

    @property(cc.Node)
    maxLv: cc.Node = null;

    @property(cc.Node)
    szNode: cc.Node = null;

    @property(cc.Node)
    stateNodes: cc.Node[] = [];

    @property(cc.Label)
    lockLab: cc.Label = null;

    @property(cc.Label)
    costLab: cc.Label = null;

    @property(cc.Sprite)
    costSpr: cc.Sprite = null;

    @property(cc.Sprite)
    upCostSpr: cc.Sprite = null;

    @property(cc.Label)
    upCostLab: cc.Label = null;

    @property(BtnCol)
    btnCol1: BtnCol = null;

    @property(BtnCol)
    btnCol2: BtnCol = null;

    private id: number = 0;
    private config: HeroConfig = null;
    private state: Global.HeroUnlockState = Global.HeroUnlockState.Lock;

    protected onLoad(): void {
        WorldEventManager.addListener(Global.EventEnum.RefreshPlayerInfo, this.refresh, this);
    }

    init(id: number) {
        this.id = id;
        this.config = null;
        AbManager.loadBundleRes(BundleName.Assets, `texture/hero/` + this.id, cc.SpriteFrame).then((res) => {
            this.roleIcon.spriteFrame = res;
        });
        this.refresh();

    }
    refresh() {
        this.config = DataManager.ins.get(HeroConfigMgr).getDataById(this.id);
        if (!this.config) return;
        AbManager.loadBundleRes(BundleName.Assets, `texture/quality/` + this.config.rarity, cc.SpriteFrame).then((res) => {
            this.qualityIcon.spriteFrame = res;
        })
        AbManager.loadBundleRes(BundleName.Assets, `texture/item/` + this.config.currency, cc.SpriteFrame).then((res) => {
            this.costSpr.spriteFrame = res;
        })
        let unlockInfos = PlayerData.ins.unlockHeroInfos;
        let info = unlockInfos.find(v => v.id == this.id);
        let lv = !info ? 1 : info.lv;
        let allConfig = DataManager.ins.get(HeroattributeConfigMgr).getAllConfig(this.id);
        let isMax = lv >= allConfig[allConfig.length - 1].level;
        let heroattributeConfig = DataManager.ins.get(HeroattributeConfigMgr).getHeroattributeConfig(this.id, lv);
        AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + heroattributeConfig.coin[0], cc.SpriteFrame).then(spf => {
            this.upCostSpr.spriteFrame = spf;
        })
        this.upCostLab.string = Util.getFormatValueStr(heroattributeConfig.coin[1]);
        let isEnoughUpgrade = PlayerData.ins.checkCostIsEnough(heroattributeConfig.coin[0], heroattributeConfig.coin[1], false, false);
        this.btnCol2.setIsGray(!isEnoughUpgrade);
        let isEnoughRecrult = PlayerData.ins.checkCostIsEnough(this.config.currency, this.config.price, false, false);
        this.btnCol1.setIsGray(!isEnoughRecrult);

        this.costLab.string = Util.getFormatValueStr(this.config.price);
        if (heroattributeConfig.skill != null) {
            let skillConfig = DataManager.ins.get(SkillConfigMgr).getDataById(heroattributeConfig.skill);
            if (skillConfig) {
                skillConfig.icon && AbManager.loadBundleRes(BundleName.Assets, `texture/skill/` + skillConfig.icon, cc.SpriteFrame).then((res) => {
                    this.skillIcon.spriteFrame = res;
                })
                this.mpLab.string = skillConfig.mp + "";
                this.cdLab.string = skillConfig.cd / 1000 + "s";
                this.skillNameLab.string = skillConfig.name;
            }
        }

        this.Name.string = this.config.name;
        this.lockLab.string = this.config.locktype == 2 ? "签到第" + this.config.lockparameter + "天解锁" : "通关第" + this.config.lockparameter + "波解锁";
        let isOnFight = false;
        if (!info) {
            this.state = Global.HeroUnlockState.Lock;
        } else {
            this.state = info.isBuy ? Global.HeroUnlockState.Unlock : Global.HeroUnlockState.Not_buy;
            isOnFight = info.atkPos >= 0;
        }
        let atkNum = 0;
        unlockInfos.forEach(v => {
            if (v.atkPos >= 0) {
                atkNum++;
            }
        })
        this.Level.string = !info ? "lv.1" : "lv." + info.lv;
        this.Battle.active = !isOnFight && atkNum < 6;
        this.End.active = isOnFight;
        this.upgrade.active = info && !isMax;
        this.maxLv.active = info && isMax;
        this.szNode.active = isOnFight;
        this.stateNodes.forEach((v, k) => {
            v.active = k == this.state;
        })
        SkillIconCol.ins.initIcon();
    }
    //升级
    upGradeClick() {
        AudioManager.ins.playClickAudio();
        UIManager.ins.openView(UiPath.InfoUI).then((view: InfoUI) => {
            view.init(this.config);
            view.closeCb = () => {
                this.refresh();
            }
        })
    }
    //上阵
    fightOnClick() {
        PlayerData.ins.updateFightHeroOrBuild(Global.PartnerType.Hero, this.id, true);
        this.refresh();
        AudioManager.ins.playClickAudio();
    }

    fightOffClick() {
        PlayerData.ins.updateFightHeroOrBuild(Global.PartnerType.Hero, this.id, false);
        this.refresh();
        AudioManager.ins.playClickAudio();
    }

    /**招募 */
    recrultClick() {
        PlayerData.ins.buyHeroOrBuild(Global.PartnerType.Hero, this.config, () => {
            AudioManager.ins.playEffect(SoundPath.level_up);
            this.refresh();
        }, () => {
            AudioManager.ins.playClickAudio();
        });
    }

    destroySelf() {
        MyPool.putObj(this.node);
    }

    descClick() {
        UIManager.ins.openView(UiPath.InfoUI).then((view: InfoUI) => {
            view.init(this.config, false);
        })
    }
}


import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import { BundleName } from "../../homepage/script/common/BundleName";
import AbRef from "../../homepage/script/common/asssetsBundle/AbRef";
import DataManager from "../../homepage/script/manager/DataManager";
import MyPool from "../../homepage/script/common/MyPool";
import { Global } from "../../homepage/script/common/Global";
import BuildConfig, { BuildConfigMgr } from "../../homepage/script/config/BuildConfig";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { BuildattributeConfigMgr } from "../../homepage/script/config/BuildattributeConfig";
import { SkillConfigMgr } from "../../homepage/script/config/SkillConfig";
import { AudioManager } from "../../homepage/script/common/AudioManager";
import { SoundPath } from "../../homepage/script/common/SoundPath";
import BtnCol from "../../homepage/script/common/BtnCol";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import { Util } from "../../homepage/script/common/Util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuildItem extends cc.Component {

    @property(AbRef)
    roleIcon: AbRef = null

    @property(AbRef)
    qualityIcon: AbRef = null;

    @property(cc.Label)
    atkLab: cc.Label = null;

    @property(cc.Label)
    speedLab: cc.Label = null;

    @property(cc.RichText)
    descLab: cc.RichText = null;

    @property(cc.Label)
    Level: cc.Label = null;

    @property(cc.Label)
    Name: cc.Label = null;

    @property(cc.Node)
    Battle: cc.Node = null;

    @property(cc.Node)
    End: cc.Node = null;

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

    @property(cc.Node)
    atkNextNode: cc.Node = null;

    @property(cc.Label)
    atkNextLab: cc.Label = null;

    @property(cc.Node)
    speedNextNode: cc.Node = null;

    @property(cc.Label)
    speedNextLab: cc.Label = null;

    @property(cc.Node)
    adUpgradeBtnNode: cc.Node = null;

    @property(cc.Node)
    upgradeBtnNode: cc.Node = null;

    @property(cc.Sprite)
    adUpCostSpr: cc.Sprite = null;

    @property(cc.Label)
    adUpCostLab: cc.Label = null;

    private id: number = 0;
    private config: BuildConfig = null;
    private state: Global.HeroUnlockState = Global.HeroUnlockState.Lock;

    protected onLoad(): void {
        WorldEventManager.addListener(Global.EventEnum.RefreshPlayerInfo, this.refresh, this);
    }

    init(id: number) {
        this.id = id;
        this.config = null;
        AbManager.loadBundleRes(BundleName.Assets, `texture/buildIcon/` + this.id, cc.SpriteFrame).then((res) => {
            this.roleIcon.spriteFrame = res;
        });
        this.refresh();

    }
    refresh() {
        let unlockInfos = [];
        this.config = DataManager.ins.get(BuildConfigMgr).getDataById(this.id);
        if (!this.config) return;
        AbManager.loadBundleRes(BundleName.Assets, `texture/quality/` + this.config.rarity, cc.SpriteFrame).then((res) => {
            this.qualityIcon.spriteFrame = res;
        })
        AbManager.loadBundleRes(BundleName.Assets, `texture/item/` + this.config.currency, cc.SpriteFrame).then((res) => {
            this.costSpr.spriteFrame = res;
        })
        unlockInfos = PlayerData.ins.unlockBuildInfos;
        let info = unlockInfos.find(v => v.id == this.id);
        let lv = !info ? 1 : info.lv;
        let allConfig = DataManager.ins.get(BuildattributeConfigMgr).getAllConfig(this.id);
        let isMax = lv >= allConfig[allConfig.length - 1].level;
        if (!isMax) {
            let nextConfig = DataManager.ins.get(BuildattributeConfigMgr).getBuildattributeConfig(this.id, lv + 1);
            this.atkNextLab.string = nextConfig.atk + "";
            this.speedNextLab.string = (nextConfig.atkSpeed / 1000) + "";
        }
        let buildattributeConfig = DataManager.ins.get(BuildattributeConfigMgr).getBuildattributeConfig(this.id, lv);
        this.atkLab.string = buildattributeConfig.atk + "";
        this.speedLab.string = (buildattributeConfig.atkSpeed / 1000) + "";
        AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + buildattributeConfig.coin[0], cc.SpriteFrame).then(spf => {
            this.upCostSpr.spriteFrame = spf;
        })
        this.upCostLab.string = Util.getFormatValueStr(buildattributeConfig.coin[1]);
        AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + buildattributeConfig.coin[0], cc.SpriteFrame).then(spf => {
            this.adUpCostSpr.spriteFrame = spf;
        })
        this.adUpCostLab.string = Util.getFormatValueStr(buildattributeConfig.coin[1]);

        let isEnough2 = PlayerData.ins.checkCostIsEnough(buildattributeConfig.coin[0], buildattributeConfig.coin[1], false, false);
        this.btnCol2.setIsGray(!isEnough2);
        let isCanAd = !isEnough2 && buildattributeConfig.coin[0] == Global.ItemId.Coin;
        this.adUpgradeBtnNode.active = isCanAd && !isMax;
        this.upgradeBtnNode.active = !isCanAd && !isMax;

        let isEnough = PlayerData.ins.checkCostIsEnough(this.config.currency, this.config.price, false, false);
        this.btnCol1.setIsGray(!isEnough);

        this.costLab.string = Util.getFormatValueStr(this.config.price);
        if (buildattributeConfig.skill != null) {
            let skillConfig = DataManager.ins.get(SkillConfigMgr).getDataById(buildattributeConfig.skill);
            if (skillConfig) {
                this.descLab.string = skillConfig.text;
            }
        }

        this.Name.string = this.config.name;
        this.lockLab.string = "通关第" + this.config.lockparameter + "波解锁";
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
        this.Level.string = "lv." + lv;
        this.Battle.active = !isOnFight && atkNum < 6;
        this.End.active = isOnFight;
        this.maxLv.active = info && isMax;
        this.szNode.active = isOnFight;
        this.stateNodes.forEach((v, k) => {
            v.active = k == this.state;
        })
        this.atkNextNode.active = this.state == Global.HeroUnlockState.Unlock && !isMax;
        this.speedNextNode.active = this.state == Global.HeroUnlockState.Unlock && !isMax;

    }
    //升级
    upGradeClick(btn, data: string) {
        let isFree = data == "1";
        let call = () => {
            PlayerData.ins.upgradeHeroOrBuild(Global.PartnerType.Build, this.config.id, isFree, () => {
                AudioManager.ins.playEffect(SoundPath.level_up);
            }, () => {
                AudioManager.ins.playClickAudio()
            });
            this.refresh();
        }
        if (!isFree) {
            call();
        } else {
            call();
        }
    }
    //上阵
    fightOnClick() {
        PlayerData.ins.updateFightHeroOrBuild(Global.PartnerType.Build, this.id, true);
        this.refresh();
        AudioManager.ins.playClickAudio();
    }

    fightOffClick() {
        PlayerData.ins.updateFightHeroOrBuild(Global.PartnerType.Build, this.id, false);
        this.refresh();
        AudioManager.ins.playClickAudio();
    }

    /**招募 */
    recrultClick() {
        PlayerData.ins.buyHeroOrBuild(Global.PartnerType.Build, this.config, () => {
            AudioManager.ins.playEffect(SoundPath.level_up);
            this.refresh();
        }, () => {
            AudioManager.ins.playClickAudio()
        });
    }

    destroySelf() {
        MyPool.putObj(this.node);
    }
}

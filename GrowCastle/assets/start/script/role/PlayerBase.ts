import { BundleName } from "../../../homepage/script/common/BundleName";
import GamingData from "../../../homepage/script/common/GamingData";
import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import TipManager from "../../../homepage/script/common/TipManager";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import CastleConfig, { CastleConfigMgr } from "../../../homepage/script/config/CastleConfig";
import { MpRecoverConfigMgr } from "../../../homepage/script/config/MpRecoverConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import HomeManager from "../../../homepage/script/manager/HomeManager";
import ProgressCol from "../ProgressCol";
import SkillIconCol from "../SkillIconCol";
import { RoleBase } from "./RoleBase";
import RoleBaseData from "./RoleBaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class PlayerBase extends RoleBase {

    @property(ProgressCol)
    mpProgress: ProgressCol = null;

    @property(cc.Node)
    hpEffect: cc.Node = null;

    @property(cc.Node)
    mpEffect: cc.Node = null;

    @property(cc.Node)
    sprNode: cc.Node = null;

    public castleConfig: CastleConfig = null;
    private mpRecoverTimer: number = 0;
    private hpRecoverTimer: number = 0;
    private hpRecover: number = 0;
    private maxMp: number = 0;
    private curHp: number = 0;

    init(roleInfo: { roleType: Global.RoleType, roleId: number }, deathCb: (roleBase: RoleBase, atker: RoleBase) => void, isStart: boolean = false) {
        this.roleInfo = roleInfo;
        this.deathCb = deathCb;
        this.refreshPlayerInfo(isStart);
        this.isDeath = false;
        this.mpRecoverTimer = 0;
        this.hpEffect.opacity = 0;
        this.mpEffect.opacity = 0;
        this.hpEffect.stopAllActions();
        this.mpEffect.stopAllActions();
        this.effectArr = [];
        this.closeAllEffectAnim();
        return Promise.resolve();
    }

    reset() {
        this.castleConfig = null;
        this.roleInfo = null;
        this.roleDataInfo = null;
        this.effectArr = [];
        this.closeAllEffectAnim();
    }

    refreshPlayerInfo(isStart: boolean = false) {
        this.castleConfig = DataManager.ins.get(CastleConfigMgr).getDataById(PlayerData.ins.carstelLv);

        this.baseRole = this.initBaseRole(this.castleConfig);
        this.curHp = isStart && this.roleDataInfo ? this.roleDataInfo.hp : this.baseRole.hp;
        this.roleDataInfo = RoleBaseData.initBaseData(this.castleConfig);
        // this.roleDataInfo.hp = isStart ? this.roleDataInfo.hp : curHp;
        this.baseRole.hp = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.城墙耐久度, this.baseRole.hp);
        //检查是否上阵玄武石像
        let param1 = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill21);
        if (param1.length > 0) {
            this.baseRole.hp += GamingData.getSkillAdd(param1[0], this.baseRole.hp);
        }
        this.baseRole.mp = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.法力上限, this.baseRole.mp);
        //检查是否上阵烽火台
        let param2 = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill22);
        if (param2.length > 0) {
            this.baseRole.mp += GamingData.getSkillAdd(param2[0], this.baseRole.mp);
        }
        this.roleDataInfo.hp = this.baseRole.hp;
        this.maxMp = this.baseRole.mp;
        // this.roleDataInfo.mp = this.maxMp;
        // this.roleDataInfo.mp_recover = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.法力恢复每5秒, this.castleConfig.mprecover);
        this.roleDataInfo.mp_recover = DataManager.ins.get(MpRecoverConfigMgr).getDataById(PlayerData.ins.mpRecoverLv).recover;
        this.roleDataInfo.hp_recover = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.城墙耐久度每5秒, 0);

        this.progress.init(this.baseRole.hp);
        // this.progress.setCurNum(this.roleDataInfo.hp);
        this.mpProgress.init(this.maxMp);
        // isStart && this.mpProgress.setCurNum(0);

        this.sprNode.children.forEach(v => {
            let spr = v.getComponent(cc.Sprite);
            if (spr.spriteFrame == null || this.castleConfig[v.name] != spr.spriteFrame.name) {
                v.stopAllActions();
                AbManager.loadBundleRes(BundleName.Assets, "texture/castlePos/" + this.castleConfig[v.name], cc.SpriteFrame).then(spf => {
                    spr.spriteFrame = spf;
                    cc.tween(v)
                        .by(0.1, { scale: 0.1 })
                        .by(0.1, { scale: -0.1 })
                        .start()
                })
            }
        })
    }

    fightStart() {
        this.mpProgress.init(this.maxMp);
        this.roleDataInfo.mp = 0;
        this.mpProgress.setCurNum(this.roleDataInfo.mp);
    }

    fightEnd() {
        this.progress.init(this.baseRole.hp);
        this.progress.setCurNum(this.curHp);
        this.mpProgress.init(this.maxMp);
    }

    death(atker: RoleBase) {
        this.isDeath = true;
        this.deathCb && this.deathCb(this, atker);
    }

    consumeMp(mp: number) {
        if (this.roleDataInfo.mp < mp) {
            TipManager.ins.showTip("MP不足");
            return false;
        }
        this.changeMp(-mp);
        return true;
    }

    changeMp(changeNum: number) {
        if (changeNum > 0) {
            this.mpEffect.opacity = 255;
            this.mpEffect.stopAllActions();
            cc.tween(this.mpEffect)
                .delay(2)
                .to(0.5, { opacity: 0 })
                .start()
            changeNum = Math.min(changeNum, this.baseRole.mp - this.roleDataInfo.mp);
        } else {
            changeNum = -Math.min(-changeNum, this.roleDataInfo.mp);
        }
        this.roleDataInfo.mp += changeNum;
        this.mpProgress.change(changeNum);
        SkillIconCol.ins.refreshIcon(this.roleDataInfo.mp);
    }

    changeHp(changeNum: number): void {
        super.changeHp(changeNum);
        if (changeNum > 0) {
            this.hpEffect.opacity = 255;
            this.hpEffect.stopAllActions();
            cc.tween(this.hpEffect)
                .delay(2)
                .to(0.5, { opacity: 0 })
                .start()
        }
    }

    fightUpdate(dt: number): void {
        super.fightUpdate(dt);
        if (this.roleDataInfo.mp < this.maxMp) {
            this.mpRecoverTimer += dt;
            if (this.mpRecoverTimer >= 1) {
                this.mpRecoverTimer = 0;
                this.changeMp(this.roleDataInfo.mp_recover);
            }
        }
        if (this.roleDataInfo.hp < this.baseRole.hp) {
            this.hpRecoverTimer += dt;
            if (this.hpRecoverTimer >= 1) {
                this.hpRecoverTimer = 0;
                this.changeHp(this.roleDataInfo.hp_recover);
            }
        }
    }
} 

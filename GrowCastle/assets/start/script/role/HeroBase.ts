import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import TipManager from "../../../homepage/script/common/TipManager";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { Util } from "../../../homepage/script/common/Util";
import { WorldEventManager } from "../../../homepage/script/common/WorldEventManager";
import { BulletConfigMgr } from "../../../homepage/script/config/BulletConfig";
import HeroattributeConfig, { HeroattributeConfigMgr } from "../../../homepage/script/config/HeroattributeConfig";
import { SkillConfigMgr } from "../../../homepage/script/config/SkillConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import EffectBase from "../EffectBase";
import EffectManager from "../EffectManager";
import FightManager from "../FightManager";
import FightMap from "../FightMap";
import ProgressCol from "../ProgressCol";
import { RoleBase } from "./RoleBase";
import RoleBaseData from "./RoleBaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class HeroBase extends RoleBase {

    @property(cc.Label)
    nameLab: cc.Label = null;

    private heroattributeConfig: HeroattributeConfig = null;
    hasAnimArr: Global.RoleAnimEnum[] = [Global.RoleAnimEnum.Atk, Global.RoleAnimEnum.Skill, Global.RoleAnimEnum.Idel];

    init(roleInfo: { roleType: Global.RoleType, roleId: number }) {
        this.roleInfo = roleInfo;
        let info = PlayerData.ins.unlockHeroInfos.find(v => v.id == roleInfo.roleId);
        if (!info) {
            console.warn("英雄未解锁");
            return;
        }
        this.heroattributeConfig = DataManager.ins.get(HeroattributeConfigMgr).getHeroattributeConfig(roleInfo.roleId, info.lv);
        this.animId = this.heroattributeConfig.heroid;
        this.baseRole = this.initBaseRole(this.heroattributeConfig);
        this.roleDataInfo = RoleBaseData.initBaseData(this.heroattributeConfig);
        this.skillConfig = DataManager.ins.get(SkillConfigMgr).getDataById(this.roleDataInfo.skill);
        this.nameLab.string = this.heroattributeConfig.name;
        this.skillProgressCol.node.active = FightManager.ins.isOnFight;
        this.skillProgressCol.init(this.skillConfig.cd / 1000);
        this.skillTimer = this.skillConfig.cd;
        this.isOnSkillCd = true;
        this.isOnReleaseSkill = false;
        this.atkTimer = 0;
        this.effectArr = [];
        this.isDeath = false;
        this.closeAllEffectAnim();
        return this.playAnim(Global.RoleAnimEnum.Idel, true);
    }

    reset() {
        this.animCol.reset();
        this.roleInfo = null;
        this.baseRole = null;
        this.roleDataInfo = null;
        this.heroattributeConfig = null;
        this.nameLab.string = "";
        this.skillProgressCol.node.active = false;
        this.isOnSkillCd = false;
        this.isOnReleaseSkill = false;
        this.skillTimer = 0;
        this.effectArr = [];
        this.closeAllEffectAnim();
    }

    atk(...arg) {
        let tarObj = FightManager.ins.getAtkTarget(this);
        if (tarObj) {
            this.playAnim(Global.RoleAnimEnum.Atk, false, () => {
                let size = tarObj.target.node.getContentSize();
                let randomPos = cc.v2(Util.getRandomFloat(-size.width / 2, size.width / 2), Util.getRandomFloat(-size.height / 2, size.height / 2));
                let eWorldPos = tarObj.target.node.convertToWorldSpaceAR(randomPos);
                let sWorldPos = this.shotPoint.convertToWorldSpaceAR(cc.Vec2.ZERO);
                let collider = tarObj.target.node.getComponent(cc.BoxCollider);
                if (collider) {
                    let aabb = collider.world.aabb;
                    eWorldPos = Util.getRandomPosInRect(aabb);
                }
                if (tarObj.target.roleInfo.roleType == Global.RoleType.Boss || tarObj.target.roleInfo.roleType == Global.RoleType.Enemy) {
                    let bulletConfig = DataManager.ins.get(BulletConfigMgr).getDataById(this.baseRole.bullet);
                    let dis = sWorldPos.sub(eWorldPos).mag();
                    let dur = dis / bulletConfig.speed;
                    eWorldPos.y -= dur * tarObj.target.roleDataInfo.moveSpeed;
                }
                EffectManager.ins.createBullet(sWorldPos, eWorldPos, this.baseRole.bullet).then((bullet: EffectBase) => {
                    if (tarObj.target.isDeath) {
                        // bullet.delayDestorySelf();
                        return;
                    }
                    if (!FightManager.ins.isOnFight) {
                        return;
                    }
                    tarObj.target.hit({ atk: tarObj.hitNum, atker: this });
                })
            }, () => {
                this.playAnim(Global.RoleAnimEnum.Idel, true);
            })
        }
    }

    skill(...arg: any[]) {
        if (this.isOnReleaseSkill) return;
        if (this.isOnSkillCd) {
            TipManager.ins.showTip("技能冷却中");
            return;
        }
        if (!this.skillConfig) return;
        if (!FightMap.ins.playerBase.consumeMp(this.skillConfig.mp)) {
            return;
        }
        this.isOnReleaseSkill = true;
        WorldEventManager.triggerEvent(Global.EventEnum.ReleaseSkill, this.roleInfo.roleId);
        let wPos = UIManager.ins.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        this.playAnim(Global.RoleAnimEnum.Skill, false, () => {
            this.skillTimer = 0;
            this.skillProgressCol.setCurNum(0);
            EffectManager.ins.createSkill(this.skillConfig, this, () => {
                console.log("释放完毕")
                this.isOnReleaseSkill = false;
            }, wPos).then(() => {
                console.log("技能结束")
            })
        }, () => {
            // this.isOnSkillCd = true;
            this.playAnim(Global.RoleAnimEnum.Idel, true);
        })
    }

    addEffect(effectParam: number[], skillType: Global.SkillType, releaser: RoleBase): void {
        if (!this.roleInfo) return;
        super.addEffect(effectParam, skillType, releaser);
        this.playEffectAnim(effectParam[0]);
    }
}

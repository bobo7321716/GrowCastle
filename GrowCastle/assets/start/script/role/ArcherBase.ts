import { AudioManager } from "../../../homepage/script/common/AudioManager";
import GamingData from "../../../homepage/script/common/GamingData";
import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { SoundPath } from "../../../homepage/script/common/SoundPath";
import { Util } from "../../../homepage/script/common/Util";
import ArcherConfig, { ArcherConfigMgr } from "../../../homepage/script/config/ArcherConfigMgr";
import DataManager from "../../../homepage/script/manager/DataManager";
import EffectBase from "../EffectBase";
import EffectManager from "../EffectManager";
import FightManager from "../FightManager";
import { RoleBase } from "./RoleBase";
import RoleBaseData from "./RoleBaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class ArcherBase extends RoleBase {

    private archerConfig: ArcherConfig = null;
    hasAnimArr: Global.RoleAnimEnum[] = [Global.RoleAnimEnum.Atk];

    init(roleInfo: { roleType: Global.RoleType, roleId: number }, deathCb: (roleBase: RoleBase, atker: RoleBase) => void) {
        this.roleInfo = roleInfo;
        this.archerConfig = DataManager.ins.get(ArcherConfigMgr).getDataById(roleInfo.roleId);
        this.animId = this.archerConfig.id;
        this.baseRole = this.initBaseRole(this.archerConfig);
        this.roleDataInfo = RoleBaseData.initBaseData(this.archerConfig);
        //检查是否上阵瞭望楼
        let param = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill13);
        if (param.length > 0) {
            this.baseRole.atk += GamingData.getSkillAdd(param[0], this.baseRole.atk);
            this.roleDataInfo.atk += GamingData.getSkillAdd(param[0], this.roleDataInfo.atk);
        }
        let maxNum = this.roleDataInfo.atkSpeed / 1000;
        this.atkTimer = Util.getRandomFloat(-maxNum, maxNum);
        this.effectArr = [];
        this.isDeath = false;
        this.closeAllEffectAnim();
        return this.playAnim(Global.RoleAnimEnum.Atk, false, null, () => {
            this.playAnim(Global.RoleAnimEnum.Idel, true);
        });
    }

    reset() {
        this.animCol.reset();
        this.archerConfig = null;
        this.roleInfo = null;
        this.roleDataInfo = null;
        this.effectArr = [];
        this.closeAllEffectAnim();
    }

    atk(...arg) {
        let tarObj = FightManager.ins.getAtkTarget(this);
        if (tarObj) {
            AudioManager.ins.playEffect(SoundPath.archer_ATK);
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
                EffectManager.ins.createBullet(sWorldPos, eWorldPos, this.baseRole.bullet, Global.BulletMoveType.Bezier).then((bullet: EffectBase) => {
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

    addEffect(effectParam: number[], skillType: Global.SkillType, releaser: RoleBase): void {
        if (!this.roleInfo) return;
        super.addEffect(effectParam, skillType, releaser);
        this.playEffectAnim(effectParam[0]);
    }
}

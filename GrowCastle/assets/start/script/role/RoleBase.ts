import { AudioManager } from "../../../homepage/script/common/AudioManager";
import GamingData from "../../../homepage/script/common/GamingData";
import { Global } from "../../../homepage/script/common/Global";
import MyPool from "../../../homepage/script/common/MyPool";
import { SoundPath } from "../../../homepage/script/common/SoundPath";
import SpineAnimCol from "../../../homepage/script/common/SpineAnimCol";
import { ConstConfigMgr } from "../../../homepage/script/config/ConstConfig";
import SkillConfig from "../../../homepage/script/config/SkillConfig";
import { BaseRole } from "../../../homepage/script/manager/BaseData";
import DataManager from "../../../homepage/script/manager/DataManager";
import HomeManager from "../../../homepage/script/manager/HomeManager";
import EnemyManager from "../EnemyManager";
import FightManager from "../FightManager";
import ProgressCol from "../ProgressCol";
import AnimCol from "../skill/AnimCol";
import IRole from "./IRole";
import RoleBaseData, { RoleDataInfo } from "./RoleBaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class RoleBase extends cc.Component implements IRole {

    @property(ProgressCol)
    progress: ProgressCol = null;

    @property(SpineAnimCol)
    animCol: SpineAnimCol = null;

    @property(ProgressCol)
    skillProgressCol: ProgressCol = null;

    @property(cc.Node)
    shotPoint: cc.Node = null;

    @property(cc.Label)
    hpLab: cc.Label = null;

    @property(cc.Label)
    hitLab: cc.Label = null;

    @property(cc.Node)
    effectAnimContent: cc.Node = null;

    @property(cc.Node)
    buffContent: cc.Node = null;

    /**技能是否在冷却中 */
    public isOnSkillCd: boolean = false;
    /**是否正在释放技能 */
    protected isOnReleaseSkill: boolean = false;
    /**是否死亡 */
    isDeath: boolean = false;
    /**角色数据 */
    roleInfo: { roleType: Global.RoleType, roleId: number } = null;
    /**动画id */
    animId: number = 0;
    /**所有拥有的效果 Global.FightEffectType id , 结束时间 */
    effectArr: { effectParam: number[], skillType: Global.SkillType, releaser: RoleBase, endTime: number }[] = [];
    /**当前动画 */
    protected curAnimEnum: Global.RoleAnimEnum = Global.RoleAnimEnum.Idel;
    /**普攻计时器 */
    protected atkTimer: number = 0;
    /**角色基础配置 */
    baseRole: BaseRole = null;
    /**角色当前的数据 */
    roleDataInfo: RoleDataInfo = null;
    /**效果刷新计时器 */
    protected effectTimer: number = 0;
    /**角色的效果刷新间隔 */
    protected readonly roleEffectRefreshInterval = 0.1;
    /**技能配置 */
    skillConfig: SkillConfig = null;
    /**技能cd计时器 */
    skillTimer: number = 0;
    /**是否可以开始攻击 */
    isCanAtk: boolean = false;
    /**拥有的动画 */
    hasAnimArr: Global.RoleAnimEnum[] = [];
    /**召唤的小兵和敌人的状态 */
    roleState: Global.RoleState = Global.RoleState.Idle;
    /**是否可以被选中 */
    public isCanSelect: boolean = false;
    /**角色尺寸 */
    public roleSize: cc.Size = null;

    /**死亡回调 */
    deathCb: (roleBase: RoleBase, atker: RoleBase) => void = null;

    abstract init(roleInfo: { roleType: Global.RoleType, roleId: number }, deathCb: (roleBase: RoleBase, atker: RoleBase) => void, ...arg): Promise<void>;

    abstract reset();

    changeHp(changeNum: number) {
        if (changeNum > 0) {
            changeNum = Math.min(changeNum, this.baseRole.hp - this.roleDataInfo.hp);
        } else {
            changeNum = -Math.min(-changeNum, this.roleDataInfo.hp);
        }
        this.roleDataInfo.hp += changeNum;
        this.progress && this.progress.change(changeNum);
        if (this.hpLab) {
            this.hpLab.string = this.roleDataInfo.hp + "";
        }
    }

    changeMp(changeNum: number) {
        if (changeNum > 0) {
            changeNum = Math.min(changeNum, this.baseRole.mp - this.roleDataInfo.mp);
        } else {
            changeNum = -Math.min(-changeNum, this.roleDataInfo.mp);
        }
        this.roleDataInfo.mp += changeNum;
    }

    hit(arg: { atk: number, atker: RoleBase }) {
        if (this.isDeath) return;
        this.hitAnim();
        this.hitAudio();
        this.changeHp(-arg.atk);
        if (this.roleDataInfo.hp <= 0) {
            this.death(arg.atker);
        }
        if (this.hitLab) {
            this.hitLab.string = arg.atk + "";
        }
    }

    abstract atk(...arg);
    abstract skill(...arg: any[]);

    playAnim(animEnum: Global.RoleAnimEnum, isLoop: boolean = false, atkEventCb: () => void = null, completeCb: () => void = null, scale: number = 1): Promise<any> {
        this.curAnimEnum = animEnum;
        if (!this.hasAnimArr.includes(animEnum)) {
            completeCb && completeCb();
            return Promise.resolve();
        }
        if (this.isDeath && animEnum != Global.RoleAnimEnum.Dead) return;
        let timeScale = 1;
        if (animEnum == Global.RoleAnimEnum.Atk) {
            let atkSpeed = this.roleDataInfo.atkSpeed;
            switch (this.roleInfo.roleType) {
                case Global.RoleType.Archer:
                    atkSpeed = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.弓箭手攻速, atkSpeed);
                    break;
                case Global.RoleType.Hero:
                    atkSpeed = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.英雄攻速, atkSpeed);
                    break;
            }
            timeScale = DataManager.ins.get(ConstConfigMgr).getDataById(3).value / this.roleDataInfo.atkSpeed * scale;
        }
        return this.animCol.playAnim(animEnum, this.roleInfo.roleType, this.animId, timeScale, isLoop, atkEventCb, completeCb);
    }

    startFight(type: Global.FightType) {
        this.skillProgressCol && (this.skillProgressCol.node.active = true);
        this.effectAnimContent && this.effectAnimContent.children.forEach((v, k) => {
            v.active = false;
        })
        this.playAnim(Global.RoleAnimEnum.Idel, true);
        if (this.roleInfo.roleType == Global.RoleType.Hero || this.roleInfo.roleType == Global.RoleType.Archer || this.roleInfo.roleType == Global.RoleType.Build) {
            this.isCanAtk = false;
        }
    }

    fightUpdate(dt: number) {
        if (this.isDeath) return;
        if (!this.roleDataInfo) return;
        if (this.roleDataInfo.bullet > 0) {
            if (this.curAnimEnum == Global.RoleAnimEnum.Idel) {
                if ((this.roleInfo.roleType == Global.RoleType.Hero || this.roleInfo.roleType == Global.RoleType.Archer
                    || this.roleInfo.roleType == Global.RoleType.Build) && !this.isCanAtk) {
                    if (EnemyManager.ins.getEnemy()) {
                        this.isCanAtk = true;
                        this.atkTimer += dt;
                        if (this.atkTimer >= this.roleDataInfo.atkInterval / 1000) {
                            this.atkTimer = 0;
                            if (this.isDeath) return;
                            this.atk();
                        }
                    }
                } else {
                    this.atkTimer += dt;
                    if (this.atkTimer >= this.roleDataInfo.atkInterval / 1000) {
                        this.atkTimer = 0;
                        if (this.isDeath) return;
                        this.atk();
                    }
                }
            }
        }
        if (this.effectArr.length > 0) {
            this.effectTimer += dt;
            if (this.effectTimer >= this.roleEffectRefreshInterval) {
                this.effectTimer = 0;
                this.checkEffect();
            }
        }
        if (this.isOnSkillCd) {
            this.skillTimer += dt;
            if (this.skillTimer >= this.skillConfig.cd / 1000) {
                this.isOnSkillCd = false;
                this.skillTimer = 0;
                this.skillProgressCol && this.skillProgressCol.setCurNum(this.skillConfig.cd / 1000);
            } else {
                this.skillProgressCol && this.skillProgressCol.setCurNum(this.skillTimer);
            }
        }
    }

    endFight() {
        this.skillProgressCol && (this.skillProgressCol.node.active = false);
    }

    addEffect(effectParam: number[], skillType: Global.SkillType, releaser: RoleBase) {
        if (!this.roleInfo) return;
        let index = this.effectArr.findIndex(v => v.skillType == skillType && v.effectParam[0] == effectParam[0]);
        if (index >= 0) {
            this.effectArr.splice(index, 1);
        } else {
            RoleBaseData.emitEffect(this, effectParam, releaser);
        }
        if (effectParam[2] != 1 && effectParam[2] != 4) {
            this.effectArr.push({ effectParam: effectParam, skillType: skillType, releaser: releaser, endTime: effectParam[2] == 3 ? -1 : FightManager.ins.fightTime + effectParam[3] });
        }

    }

    removeEffect(effectParam: number[], releaser: RoleBase) {
        RoleBaseData.emitEffect(this, effectParam, releaser, false);
        this.closeEffectAnim(effectParam[0]);
    }

    removeAllEffect() {
        for (let i = 0; i < this.effectArr.length; i++) {
            let obj = this.effectArr[i];
            this.removeEffect(obj.effectParam, obj.releaser);
        }
        this.effectArr = [];
    }

    hitAnim() {
        if (!cc.isValid(this.animCol)) return;
        this.animCol.node.stopAllActions();
        this.animCol.node.color = cc.Color.RED;
        cc.tween(this.animCol.node)
            .delay(0.1)
            .call(() => {
                this.animCol.node.color = cc.Color.WHITE;
            })
            .start()
    }

    hitAudio() {
        let soundPath = null;
        switch (this.roleInfo.roleType) {
            case Global.RoleType.Enemy:
                soundPath = SoundPath.enemy_hit;
                break;
        }
        soundPath && AudioManager.ins.playEffect(soundPath);
    }

    death(atker: RoleBase) {
        if (this.isDeath) return;
        this.isDeath = true;
        this.removeAllEffect();
        this.animCol.node.stopAllActions();
        this.animCol.node.color = cc.Color.WHITE;
        this.animCol.node.opacity = 255;
        cc.tween(this.animCol.node)
            .repeat(2,
                cc.tween()
                    .to(0.1, { opacity: 120 })
                    .to(0.1, { opacity: 255 })
            )
            .call(() => {
                this.deathCb && this.deathCb(this, atker);
                this.destroySelf();
            })
            .start()
    }

    destroySelf() {
        MyPool.putObj(this.node);
    }

    initBaseRole(config: any) {
        let data = new BaseRole();
        for (const key in data) {
            data[key] = config[key] != undefined ? config[key] : data[key];
        }
        return data;
    }

    checkEffect() {
        for (let i = 0; i < this.effectArr.length; i++) {
            let obj = this.effectArr[i];
            if (obj.endTime != -1 && FightManager.ins.fightTime >= obj.endTime) {
                this.removeEffect(obj.effectParam, obj.releaser);
                this.effectArr.splice(i--, 1);
            }
        }
        this.buffContent && this.buffContent.children.forEach(v => {
            v.active = this.effectArr.findIndex(el => el.effectParam[0].toString() == v.name) >= 0;
        })
    }

    /**击退 */
    defeat(effectParam: number[]) { };

    /**切换状态 召唤小兵，敌人使用 */
    changeState(state: Global.RoleState) { };

    /**播放特效 */
    playEffectAnim(anim: number, isOnceClose: boolean = true) {
        if (!this.effectAnimContent || this.effectAnimContent.childrenCount <= 0) return;
        if (!this.roleInfo) return;
        this.effectAnimContent.children.forEach((v, k) => {
            v.active = v.name == anim.toString();
        })
        let child = this.effectAnimContent.children.find(v => v.name == anim.toString());
        if (child) {
            let animCol = child.getComponent(AnimCol);
            animCol && animCol.play(null, GamingData.fightSpeedMul, 2).then(() => {
                if (isOnceClose) {
                    this.closeEffectAnim(anim);
                }
            });
        }
    };

    /**关闭特效 */
    closeEffectAnim(anim: number) {
        if (!this.effectAnimContent || this.effectAnimContent.childrenCount <= 0) return;
        let child = this.effectAnimContent.children.find(v => v.name == anim.toString());
        if (child) child.active = false;
    };

    /**关闭所有特效 */
    closeAllEffectAnim() {
        if (!this.effectAnimContent || this.effectAnimContent.childrenCount <= 0) return;
        this.effectAnimContent.children.forEach((v, k) => {
            v.active = false;
        })
    };
}

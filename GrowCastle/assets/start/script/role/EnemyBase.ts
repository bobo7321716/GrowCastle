import { AudioManager } from "../../../homepage/script/common/AudioManager";
import GamingData from "../../../homepage/script/common/GamingData";
import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { SoundPath } from "../../../homepage/script/common/SoundPath";
import TipManager from "../../../homepage/script/common/TipManager";
import { Util } from "../../../homepage/script/common/Util";
import EnemyConfig, { EnemyConfigMgr } from "../../../homepage/script/config/EnemyConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import EffectBase from "../EffectBase";
import EffectManager from "../EffectManager";
import EnemyManager from "../EnemyManager";
import FightManager from "../FightManager";
import FightMap from "../FightMap";
import ProgressCol from "../ProgressCol";
import { RoleBase } from "./RoleBase";
import RoleBaseData from "./RoleBaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class EnemyBase extends RoleBase {

    @property(cc.Label)
    nameLab: cc.Label = null;

    @property(ProgressCol)
    wHpPro: ProgressCol = null;

    @property(cc.Node)
    tipNode: cc.Node = null;

    public enemyConfig: EnemyConfig = null;

    private targetY: number = 0;

    private canSelectCb: () => void = null;
    private deathAnimEndCb: (roleBase: RoleBase) => void = null;

    /**是否在击退过程中 */
    private isOnDefeat: boolean = false;
    /**击退时长 */
    private defeatDur: number = 0.5;
    /**击退计时器 */
    private defeatTimer: number = 0;
    /**击退速度 */
    private defeatSpeed: number = 400;

    private atkTarget: RoleBase = null;
    //检查攻击目标间隔
    private checkTarInterval: number = 1;
    private checkTimer: number = 0;

    hasAnimArr: Global.RoleAnimEnum[] = [Global.RoleAnimEnum.Atk, Global.RoleAnimEnum.Dead, Global.RoleAnimEnum.Run, Global.RoleAnimEnum.Walk];

    init(roleInfo: { roleType: Global.RoleType, roleId: number }, deathCb: (roleBase: RoleBase, atker: RoleBase) => void, canSelectCb: () => void, deathAnimEndCb: (roleBase: RoleBase) => void, wave: number) {
        this.roleInfo = roleInfo;
        this.deathCb = deathCb;
        this.canSelectCb = canSelectCb;
        this.deathAnimEndCb = deathAnimEndCb;
        let boxCollider = this.node.getComponent(cc.BoxCollider);
        if (boxCollider) this.roleSize = boxCollider.size;
        this.enemyConfig = DataManager.ins.get(EnemyConfigMgr).getDataById(roleInfo.roleId);
        if (this.nameLab) this.nameLab.string = this.enemyConfig.name;
        this.animId = this.enemyConfig.animation;
        this.baseRole = this.initBaseRole(this.enemyConfig);
        this.roleDataInfo = RoleBaseData.initBaseData(this.enemyConfig);
        //检查是否上阵巨石阵
        let param = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill17);
        if (param.length > 0) {
            this.baseRole.moveSpeed += GamingData.getSkillAdd(param[0], this.baseRole.moveSpeed);
            this.roleDataInfo.moveSpeed += GamingData.getSkillAdd(param[0], this.roleDataInfo.moveSpeed);
        }

        this.baseRole.hp = this.enemyConfig.hp + this.enemyConfig.HPcoefficient * wave;
        this.roleDataInfo.hp = this.baseRole.hp;
        this.baseRole.atk = this.enemyConfig.atk + this.enemyConfig.ATKcoefficient * wave;
        this.roleDataInfo.atk = this.baseRole.atk;
        if (this.hpLab) {
            this.hpLab.string = this.roleDataInfo.hp + "";
        }
        if (this.hitLab) {
            this.hitLab.string = "0";
        }
        this.progress.node.active = true;
        this.progress.init(this.baseRole.hp);
        this.wHpPro && this.wHpPro.init(this.baseRole.hp);
        this.targetY = EnemyManager.ins.maxMoveY + this.enemyConfig.atkdistance;
        this.isDeath = false;
        this.isCanAtk = false;
        this.isCanSelect = false;
        this.atkTimer = this.roleDataInfo.atkSpeed / 1000;
        this.effectArr = [];
        this.buffContent && this.buffContent.children.forEach(v => {
            v.active = false;
        })
        this.tipNode && (this.tipNode.active = PlayerData.ins.isShowTip);
        let moveAnim = roleInfo.roleType == Global.RoleType.Boss ? Global.RoleAnimEnum.Walk : Global.RoleAnimEnum.Run;
        this.changeState(Global.RoleState.Move);
        return this.playAnim(moveAnim, true);
    }

    reset() {
        this.animCol.reset();
        this.progress.node.active = false;
        this.buffContent && this.buffContent.children.forEach(v => {
            v.active = false;
        })
        this.enemyConfig = null;
        this.effectArr = [];
        this.roleInfo = null;
        this.roleDataInfo = null;
        this.baseRole = null;
        this.isDeath = false;
        this.isCanAtk = false;
        this.isCanSelect = false;
    }

    fightUpdate(dt: number) {
        if (this.isDeath) return;
        if (!this.roleDataInfo) return;
        if (this.effectArr.length > 0) {
            this.effectTimer += dt;
            if (this.effectTimer >= this.roleEffectRefreshInterval) {
                this.effectTimer = 0;
                this.checkEffect();
            }
        }
        if (this.isOnDefeat) {
            this.node.y -= this.defeatSpeed * dt;
            this.defeatTimer += dt;
            if (this.defeatTimer >= this.defeatDur) {
                this.isOnDefeat = false;
                this.changeState(Global.RoleState.Move);
            }
            return;
        }
        if (this.roleDataInfo.bullet > 0) {
            if (this.roleState == Global.RoleState.Move) {
                if (this.node.y > this.targetY) {
                    this.node.y -= this.roleDataInfo.moveSpeed * dt;
                    if (this.node.y < EnemyManager.ins.atkRangeY) {
                        if (!this.isCanSelect) {
                            this.isCanSelect = true;
                            this.canSelectCb && this.canSelectCb();
                        }
                    }
                    //接近小兵时将小兵拉入战斗
                    EnemyManager.ins.checkCanAtkSoldier(this);
                } else {
                    if (!this.isCanAtk) {
                        this.isCanAtk = true;
                        this.atkTimer = this.roleDataInfo.atkInterval / 1000;
                        this.curAnimEnum = Global.RoleAnimEnum.Idel;
                        this.changeState(Global.RoleState.Atk);
                    }
                }
            } else if (this.roleState == Global.RoleState.Atk) {
                if (this.curAnimEnum == Global.RoleAnimEnum.Idel) {
                    this.atkTimer += dt;
                    if (this.atkTimer >= this.roleDataInfo.atkInterval / 1000) {
                        this.atkTimer = 0;
                        if (this.isDeath) return;
                        this.atk();
                    }
                }
            } else if (this.roleState == Global.RoleState.Idle) {
                this.curAnimEnum = Global.RoleAnimEnum.Idel;
                this.changeState(Global.RoleState.Atk);
            }
        }
    }

    death(atker: RoleBase): void {
        if (this.isDeath) return;
        this.isDeath = true;
        this.progress.node.active = false;
        this.buffContent && this.buffContent.children.forEach(v => {
            v.active = false;
        })
        this.removeAllEffect();
        this.animCol.node.stopAllActions();
        this.animCol.node.color = cc.Color.WHITE;
        this.animCol.node.opacity = 255;
        this.deathCb && this.deathCb(this, atker);
        let promise1 = new Promise((resolve, reject) => {
            setTimeout(resolve, 4000);
        })
        let promise2 = new Promise((resolve, reject) => {
            this.playAnim(Global.RoleAnimEnum.Dead, false, null, () => {
                cc.tween(this.animCol.node)
                    .repeat(2,
                        cc.tween()
                            .to(0.15, { opacity: 120 })
                            .to(0.15, { opacity: 255 })
                    )
                    .call(() => {
                        resolve(null);
                    })
                    .start()
            });
        })
        Promise.race([promise1, promise2]).then(() => {
            this.deathAnimEndCb && this.deathAnimEndCb(this);
            this.destroySelf();
        });
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
                if (this.roleInfo.roleType == Global.RoleType.Boss) {
                    let wPos = this.node.convertToWorldSpaceAR(cc.v2(-50, 0));
                    EffectManager.ins.createYan(1, wPos);
                    Util.shakeAnim(appContext.mainCameraNode);
                    AudioManager.ins.playEffect(SoundPath.boss_atk);
                }
            }, () => {
                this.playAnim(Global.RoleAnimEnum.Idel, true);
            })
        }
    }

    skill(...arg: any[]) {
        if (this.isOnSkillCd) {
            TipManager.ins.showTip("技能冷却中");
            return;
        }
        if (!this.skillConfig) return;
        if (!FightMap.ins.playerBase.consumeMp(this.skillConfig.mp)) {
            return;
        }
        let tarObj = FightManager.ins.getAtkTarget(this);
        if (tarObj) {
            // TipManager.ins.showTip("释放技能 " + this.skillConfig.name);
            this.playAnim(Global.RoleAnimEnum.Skill, false, () => {
                this.skillTimer = 0;
                this.isOnSkillCd = true;
                this.skillProgressCol.setCurNum(0);
                EffectManager.ins.createSkill(this.skillConfig, this, () => {
                    console.log("释放完毕")
                }).then(() => {
                    console.log("技能结束")
                })
            }, () => {
                this.playAnim(Global.RoleAnimEnum.Idel, true);
            })
        }
    }

    defeat(effectParam: number[]) {
        if (this.isOnDefeat) return;
        this.playAnim(Global.RoleAnimEnum.Run, true);
        this.isCanAtk = false;
        this.isOnDefeat = true;
        this.defeatTimer = 0;
        this.defeatSpeed = effectParam[4] / this.defeatDur;
    }

    changeState(state: Global.RoleState) {
        if (state == Global.RoleState.Move) {
            let moveAnim = this.roleInfo.roleType == Global.RoleType.Boss ? Global.RoleAnimEnum.Walk : Global.RoleAnimEnum.Run;
            this.playAnim(moveAnim, true);
        }
        this.roleState = state;
    }

    changeHp(changeNum: number) {
        if (changeNum > 0) {
            changeNum = Math.min(changeNum, this.baseRole.hp - this.roleDataInfo.hp);
        } else {
            changeNum = -Math.min(-changeNum, this.roleDataInfo.hp);
        }
        this.roleDataInfo.hp += changeNum;
        this.progress && this.progress.change(changeNum);
        if (this.wHpPro) {
            setTimeout(() => {
                this.wHpPro.change(changeNum);
            }, 100)
        }
        if (this.hpLab) {
            this.hpLab.string = this.roleDataInfo.hp + "";
        }
    }
}

import GamingData from "../../../homepage/script/common/GamingData";
import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { Util } from "../../../homepage/script/common/Util";
import SoldierConfig, { SoldierConfigMgr } from "../../../homepage/script/config/SoldierConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import EffectBase from "../EffectBase";
import EffectManager from "../EffectManager";
import EnemyManager from "../EnemyManager";
import FightManager from "../FightManager";
import { RoleBase } from "./RoleBase";
import RoleBaseData from "./RoleBaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class SoldierBase extends RoleBase {

    @property(cc.Node)
    tipNode: cc.Node = null;

    private soldierConfig: SoldierConfig = null;

    private atkTarget: RoleBase = null;
    //检查攻击目标间隔
    private checkTarInterval: number = 0.01;
    private checkTimer: number = 0;
    private moveTarY: number = 0;
    private deathAnimEndCb: (roleBase: RoleBase) => void = null;

    hasAnimArr: Global.RoleAnimEnum[] = [Global.RoleAnimEnum.Atk, Global.RoleAnimEnum.Dead, Global.RoleAnimEnum.Walk];

    init(roleInfo: { roleType: Global.RoleType, roleId: number }, deathCb: (roleBase: RoleBase, atker: RoleBase) => void, deathAnimEndCb: (roleBase: RoleBase) => void) {
        this.roleInfo = roleInfo;
        this.deathCb = deathCb;
        this.deathAnimEndCb = deathAnimEndCb;
        this.soldierConfig = DataManager.ins.get(SoldierConfigMgr).getDataById(roleInfo.roleId);
        this.animId = this.soldierConfig.animation;
        this.baseRole = this.initBaseRole(this.soldierConfig);
        this.roleDataInfo = RoleBaseData.initBaseData(this.soldierConfig);
        this.baseRole.hp = this.soldierConfig.hp;
        //检查是否上阵军旗
        let param = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill15);
        if (param.length > 0) {
            this.baseRole.hp += GamingData.getSkillAdd(param[0], this.baseRole.hp);
        }
        //检查是否上阵武器架
        let param2 = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill16);
        if (param2.length > 0) {
            this.baseRole.atk += GamingData.getSkillAdd(param2[0], this.baseRole.atk);
        }

        this.roleDataInfo.hp = this.baseRole.hp;
        this.roleDataInfo.atk = this.baseRole.atk;
        if (this.hpLab) {
            this.hpLab.string = this.roleDataInfo.hp + "";
        }
        if (this.hitLab) {
            this.hitLab.string = "0";
        }
        this.progress.init(this.baseRole.hp);
        this.isDeath = false;
        this.atkTimer = this.roleDataInfo.atkSpeed / 1000;
        this.effectArr = [];
        this.animCol.node.scaleX = Math.abs(this.animCol.node.scaleX);

        this.moveTarY = cc.winSize.height / 2 + 120;
        if (FightManager.ins.fightType == Global.FightType.Territory) {
            let castleWPos = EnemyManager.ins.castle.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
            let lPos = this.node.parent.convertToNodeSpaceAR(castleWPos);
            this.moveTarY = lPos.y - EnemyManager.ins.castle.node.height / 2;
        }
        // this.moveTarY += 120;
        this.checkTimer = this.checkTarInterval;
        this.tipNode && (this.tipNode.active = PlayerData.ins.isShowTip);
        this.changeState(Global.RoleState.Move);
        return this.playAnim(Global.RoleAnimEnum.Walk, true);
    }

    reset() {
        this.animCol.reset();
        this.progress.node.active = false;
        this.soldierConfig = null;
        this.effectArr = [];
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
        if (this.roleDataInfo.bullet > 0) {
            if (this.roleState == Global.RoleState.Move) {
                if (this.node.y < this.moveTarY) {
                    this.node.y += this.roleDataInfo.moveSpeed * dt;
                    this.checkTimer += dt;
                    if (this.checkTimer >= this.checkTarInterval) {
                        this.checkTimer = 0;
                        this.atkTarget = EnemyManager.ins.getSoldierAtkEnermy(this);
                        if (this.atkTarget) {
                            // this.atkTarget.node.children[5].active = true;
                            this.animCol.node.scaleX *= this.node.x < this.atkTarget.node.x ? 1 : -1;
                            this.playAnim(Global.RoleAnimEnum.Walk, true);
                            this.changeState(Global.RoleState.Move_to_target);
                        }
                    }
                } else {
                    if (FightManager.ins.fightType == Global.FightType.Territory) {
                        this.playAnim(Global.RoleAnimEnum.Idel, true);
                        this.changeState(Global.RoleState.Idle);
                    } else {
                        this.death(this);
                    }
                }
            } else if (this.roleState == Global.RoleState.Idle) {
                this.checkTimer += dt;
                if (this.checkTimer >= this.checkTarInterval) {
                    this.checkTimer = 0;
                    this.atkTarget = EnemyManager.ins.getSoldierAtkEnermy(this);
                    if (this.atkTarget) {
                        // this.atkTarget.node.children[5].active = true;
                        this.animCol.node.scaleX *= this.node.x < this.atkTarget.node.x ? 1 : -1;
                        this.playAnim(Global.RoleAnimEnum.Walk, true);
                        this.changeState(Global.RoleState.Move_to_target);
                    }
                }
            } else if (this.roleState == Global.RoleState.Move_to_target) {
                let yOffset = 0;
                if (this.atkTarget.roleInfo.roleType == Global.RoleType.Castle) {
                    yOffset = -this.atkTarget.roleSize.height / 2;

                    this.checkTimer += dt;
                    if (this.checkTimer >= this.checkTarInterval) {
                        this.checkTimer = 0;
                        let newAtkTarget = EnemyManager.ins.getSoldierAtkEnermy(this);
                        if (this.atkTarget.node != newAtkTarget.node) {
                            this.atkTarget = newAtkTarget;
                            this.animCol.node.scaleX *= this.node.x < this.atkTarget.node.x ? 1 : -1;
                            this.playAnim(Global.RoleAnimEnum.Walk, true);
                            this.changeState(Global.RoleState.Move_to_target);
                        }
                    }
                }
                let wPos = this.atkTarget.node.convertToWorldSpaceAR(cc.v2(0, yOffset));
                let ePos = this.node.parent.convertToNodeSpaceAR(wPos);
                let sPos = this.node.getPosition();
                let dis = sPos.sub(ePos).mag();
                if (dis <= 50) {
                    this.atkTarget.changeState(Global.RoleState.Idle);
                    this.playAnim(Global.RoleAnimEnum.Idel, true);
                    this.changeState(Global.RoleState.Atk);
                } else if (ePos.y + this.atkTarget.roleSize.height / 2 < sPos.y) {
                    console.log("dis = ", dis)
                    EnemyManager.ins.removeFightGroup(this);
                } else {
                    let dir = ePos.sub(sPos).normalize();
                    this.node.x += dir.x * this.soldierConfig.moveSpeed * dt;
                    let tarY = dir.y * this.soldierConfig.moveSpeed * dt;
                    if (tarY < 0) {
                        EnemyManager.ins.removeFightGroup(this);
                    } else {
                        this.node.y += tarY;
                    }
                }
            } else if (this.roleState == Global.RoleState.Atk) {
                this.atkTimer += dt;
                if (this.atkTimer >= this.roleDataInfo.atkInterval / 1000) {
                    this.atkTimer = 0;
                    if (this.isDeath) return;
                    this.atk();
                }
                let yOffset = 0;
                if (this.atkTarget.roleInfo.roleType == Global.RoleType.Castle) {
                    yOffset = -this.atkTarget.roleSize.height / 2;
                    this.checkTimer += dt;
                    if (this.checkTimer >= this.checkTarInterval) {
                        this.checkTimer = 0;
                        let newAtkTarget = EnemyManager.ins.getSoldierAtkEnermy(this);
                        if (this.atkTarget.node != newAtkTarget.node) {
                            this.atkTarget = newAtkTarget;
                            this.animCol.node.scaleX *= this.node.x < this.atkTarget.node.x ? 1 : -1;
                            this.playAnim(Global.RoleAnimEnum.Walk, true);
                            this.changeState(Global.RoleState.Move_to_target);
                        }
                    }
                }
                let wPos = this.atkTarget.node.convertToWorldSpaceAR(cc.v2(0, yOffset));
                let ePos = this.node.parent.convertToNodeSpaceAR(wPos);
                let sPos = this.node.getPosition();
                let dis = sPos.sub(ePos).mag();
                if (dis > 70) {
                    if (ePos.y + this.atkTarget.roleSize.height / 2 < sPos.y) {
                        EnemyManager.ins.removeFightGroup(this);
                    } else {
                        this.playAnim(Global.RoleAnimEnum.Walk, true);
                        this.changeState(Global.RoleState.Move_to_target);
                    }
                }
            }
        }
    }

    changeState(state: Global.RoleState) {
        if (state == Global.RoleState.Move) {
            this.playAnim(Global.RoleAnimEnum.Walk, true);
        }
        if (this.isDeath) return;
        this.roleState = state;
    }

    death(atker: RoleBase): void {
        if (this.isDeath) return;
        this.isDeath = true;
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
                let sWorldPos = this.shotPoint.convertToWorldSpaceAR(cc.Vec2.ZERO);
                let size = tarObj.target.node.getContentSize();
                let randomPos = cc.v2(Util.getRandomFloat(-size.width / 2, size.width / 2), Util.getRandomFloat(-size.height / 2, size.height / 2));
                let eWorldPos = tarObj.target.node.convertToWorldSpaceAR(randomPos);
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

}

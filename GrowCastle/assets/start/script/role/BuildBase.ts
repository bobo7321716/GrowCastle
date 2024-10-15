import { BundleName } from "../../../homepage/script/common/BundleName";
import GamingData from "../../../homepage/script/common/GamingData";
import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import TipManager from "../../../homepage/script/common/TipManager";
import { Util } from "../../../homepage/script/common/Util";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import BuildattributeConfig, { BuildattributeConfigMgr } from "../../../homepage/script/config/BuildattributeConfig";
import { SkillConfigMgr } from "../../../homepage/script/config/SkillConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import EffectBase from "../EffectBase";
import EffectManager from "../EffectManager";
import EnemyManager from "../EnemyManager";
import FightManager from "../FightManager";
import FightMap from "../FightMap";
import { RoleBase } from "./RoleBase";
import RoleBaseData from "./RoleBaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class BuildBase extends RoleBase {

    @property(cc.Sprite)
    spr: cc.Sprite = null;

    @property(cc.Sprite)
    baseSpr: cc.Sprite = null;

    @property(cc.Sprite)
    rotateSpr: cc.Sprite = null;

    private buildattributeConfig: BuildattributeConfig = null;
    private isCanRotate: boolean = false;
    private rotateIds: number[] = [1014, 1015];
    private rotateSpeed: number = 100;
    private isOnRotate: boolean = false;
    private targetAngle: number = 0;
    private initAngle: number = 0;
    private rotateTimer: number = 0;
    private costDur: number = 0;
    private resolve: (value: unknown) => void = null;

    init(roleInfo: { roleType: Global.RoleType, roleId: number }) {
        this.roleInfo = roleInfo;
        let info = PlayerData.ins.unlockBuildInfos.find(v => v.id == roleInfo.roleId);
        if (!info) {
            console.warn("建筑未解锁");
            return;
        }
        this.buildattributeConfig = DataManager.ins.get(BuildattributeConfigMgr).getBuildattributeConfig(roleInfo.roleId, info.lv);
        this.baseRole = this.initBaseRole(this.buildattributeConfig);
        this.roleDataInfo = RoleBaseData.initBaseData(this.buildattributeConfig);
        this.skillConfig = DataManager.ins.get(SkillConfigMgr).getDataById(this.roleDataInfo.skill);
        this.atkTimer = this.roleDataInfo.atkSpeed / 1000;
        this.isDeath = false;
        this.isOnRotate = false;
        this.isCanRotate = this.rotateIds.includes(roleInfo.roleId);
        this.baseSpr && (this.baseSpr.node.active = this.isCanRotate);
        this.rotateSpr && (this.rotateSpr.node.active = this.isCanRotate);
        this.spr.node.active = !this.isCanRotate;
        if (this.isCanRotate) {
            this.rotateSpr.node.angle = 0;
            AbManager.loadBundleRes(BundleName.Assets, "texture/build/base_" + roleInfo.roleId, cc.SpriteFrame).then((spf) => {
                this.baseSpr.spriteFrame = spf;
            });
        }
        return AbManager.loadBundleRes(BundleName.Assets, "texture/build/" + roleInfo.roleId, cc.SpriteFrame).then((spf) => {
            this.spr.spriteFrame = spf;
            this.rotateSpr && (this.rotateSpr.spriteFrame = spf);
        });
    }

    reset() {
        this.roleInfo = null;
        this.baseRole = null;
        this.roleDataInfo = null;
        this.spr.spriteFrame = null;
        this.buildattributeConfig = null;
        this.effectArr = [];
    }

    atk(...arg) {
        if (this.buildattributeConfig.atk <= 0) return;
        let tarObj = FightManager.ins.getAtkTarget(this);
        if (tarObj) {
            let atkCall = () => {
                this.playAnim(Global.RoleAnimEnum.Atk, false, null, () => {
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
                        switch (this.skillConfig.type) {
                            //攻击可使目标降低5%的移动速度,持续3s
                            case Global.SkillType.Skill11:
                            //攻击可使目标收到的伤害增加5%，持续3s
                            case Global.SkillType.Skill12:
                            //攻击可将目标击退一段距离
                            case Global.SkillType.Skill24:
                            //攻击可使目标降低10%的攻击速度,持续3s
                            case Global.SkillType.Skill25:
                                this.skillConfig.parameter.forEach(v => {
                                    tarObj.target.addEffect(v, this.skillConfig.type, this);
                                })
                                break;
                        }
                    })
                    this.playAnim(Global.RoleAnimEnum.Idel, true);
                })
            }
            if (!this.isCanRotate) {
                atkCall();
            } else {
                let wPos = tarObj.target.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
                let lPos = this.rotateSpr.node.parent.convertToNodeSpaceAR(wPos);
                let dir = lPos.sub(this.rotateSpr.node.getPosition()).normalize();
                this.targetAngle = -Util.vectorsToDegress(dir);
                this.initAngle = this.rotateSpr.node.angle;
                this.rotateTimer = 0;
                this.costDur = Math.abs(this.targetAngle - this.initAngle) / this.rotateSpeed;
                this.isOnRotate = true;
                new Promise((resolve, reject) => {
                    this.resolve = resolve;
                }).then(atkCall);
            }
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
            this.playAnim(Global.RoleAnimEnum.Skill, false, null, () => {
                this.skillTimer = 0;
                this.isOnSkillCd = true;
                this.skillProgressCol.setCurNum(0);
                EffectManager.ins.createSkill(this.skillConfig, this, () => {
                    console.log("释放完毕")
                }).then(() => {
                    console.log("技能结束")
                })
                this.playAnim(Global.RoleAnimEnum.Idel, true);
            })
        }
    }

    fightUpdate(dt: number): void {
        super.fightUpdate(dt);
        if (!this.isOnRotate) return;
        this.rotateTimer += dt;
        if (this.rotateTimer / this.costDur >= 1) {
            this.isOnRotate = false;
            this.resolve && this.resolve(null);
        } else {
            this.rotateSpr.node.angle = Util.lerp(this.rotateTimer / this.costDur, this.initAngle, this.targetAngle) as number;
        }
    }
} 

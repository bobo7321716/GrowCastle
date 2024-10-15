import GamingData from "../../../homepage/script/common/GamingData";
import { Global } from "../../../homepage/script/common/Global";
import { AttributeConfigMgr } from "../../../homepage/script/config/AttributeConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import { PlayerBase } from "./PlayerBase";
import { RoleBase } from "./RoleBase";

export class RoleDataInfo {
    hp: number = 0;
    mp: number = 0;
    atk: number = 0;
    atkSpeed: number = 0;
    atkInterval: number = 0;
    moveSpeed: number = 0;
    bullet: number = 0;
    skill: number = 0;
    /**英雄攻击力加成 */
    hero_atk_addition: number = 0;
    /**英雄攻速加成 */
    hero_atkSpeed_addition: number = 0;
    /**弓箭手攻击力加成 */
    archer_atk_addition: number = 0;
    /**弓箭手攻速加成 */
    archer_atkSpeed_addition: number = 0;
    /**移速加成 */
    moveSpeed_addition: number = 0;
    /**受伤增加 */
    hit_addition: number = 0;
    /**hp回复 */
    hp_recover: number = 0;
    /**mp回复 */
    mp_recover: number = 0;
    /**技能冷却加成 */
    hero_skillCd_addition: number = 0;
    /**造成伤害 */
    hit: number = 0;
    /**击退 */
    defeat: number = 0;
    /**召唤 */
    summon: number = 0;
}

/**角色基础属性 */
export default class RoleBaseData {

    static initBaseData(config: any) {
        let data = new RoleDataInfo();
        for (const key in data) {
            data[key] = config[key] != undefined ? config[key] : data[key];
        }
        return data;
    }

    /**触发主动技能效果 */
    static emitEffect(roleBase: RoleBase, effectParam: number[], releaser: RoleBase, isAdd: boolean = true) {
        let getAdd = (baseNum: number) => {
            let addNum = (isAdd ? 1 : -1) * GamingData.getSkillAdd(effectParam, baseNum);
            // if (isAdd) {
            //     console.log(roleBase, " 触发效果 ", effectParam[0], " 数值：", addNum);
            // } else {
            //     console.log(roleBase, " 移除效果 ", effectParam[0], " 数值：", addNum);
            // }
            return addNum;
        }
        switch (effectParam[0]) {
            case Global.FightEffectType.hero_atk_addition:
                let add = getAdd(roleBase.baseRole.atk);
                roleBase.roleDataInfo.atk += add;
                break;
            case Global.FightEffectType.hero_atkSpeed_addition:
                add = getAdd(roleBase.baseRole.atkSpeed);
                roleBase.roleDataInfo.atkSpeed += add;
                break;
            case Global.FightEffectType.archer_atk_addition:
                if (roleBase.roleInfo.roleType == Global.RoleType.Archer) {
                    let add = getAdd(roleBase.baseRole.atk);
                    roleBase.roleDataInfo.atk += add;
                }
                break;
            case Global.FightEffectType.archer_atkSpeed_addition:
                if (roleBase.roleInfo.roleType == Global.RoleType.Archer) {
                    let add = getAdd(roleBase.baseRole.atkSpeed);
                    roleBase.roleDataInfo.atkSpeed += add;
                    roleBase.roleDataInfo.atkInterval += add;
                }
                break;
            case Global.FightEffectType.moveSpeed_addition:
                add = getAdd(roleBase.baseRole.moveSpeed);
                roleBase.roleDataInfo.moveSpeed += add;
                break;
            case Global.FightEffectType.hit_addition:

                break;
            case Global.FightEffectType.hp_recover:
                if (roleBase.roleInfo.roleType == Global.RoleType.Player) {
                    let add = getAdd(roleBase.baseRole.hp);
                    // roleBase.hit({ atk: -add, atker: releaser });
                    roleBase.changeHp(add);
                }
                break;
            case Global.FightEffectType.mp_recover:
                if (roleBase.roleInfo.roleType == Global.RoleType.Player) {
                    let add = getAdd(roleBase.baseRole.mp);
                    roleBase.changeMp(add);
                }
                break;
            case Global.FightEffectType.hero_skillCd_addition:
                add = getAdd(roleBase.skillTimer);
                roleBase.skillTimer += add;
                break;
            case Global.FightEffectType.hit:
                add = getAdd(releaser.roleDataInfo.atk);
                roleBase.hit({ atk: -add, atker: releaser });
                break;
            case Global.FightEffectType.defeat:
                roleBase.defeat(effectParam);
                break;
            case Global.FightEffectType.summon:

                break;
            case Global.FightEffectType.charm:
                add = getAdd(roleBase.baseRole.moveSpeed);
                roleBase.roleDataInfo.moveSpeed += add;
                break;
        }
    }


    /**获取主动效果目标 */
    static getEmitTarget(effectType: Global.FightEffectType) {
        let targetArr: Global.ColliderGroup[] = [];
        switch (effectType) {
            case Global.FightEffectType.hero_atk_addition:
            case Global.FightEffectType.hero_atkSpeed_addition:
            case Global.FightEffectType.hero_skillCd_addition:
                targetArr = [Global.ColliderGroup.Hero];
                break;
            case Global.FightEffectType.hp_recover:
            case Global.FightEffectType.mp_recover:
                targetArr = [Global.ColliderGroup.Player];
                break;
            case Global.FightEffectType.archer_atk_addition:
            case Global.FightEffectType.archer_atkSpeed_addition:
                targetArr = [Global.ColliderGroup.Archer];
                break;
            case Global.FightEffectType.moveSpeed_addition:
            case Global.FightEffectType.hit_addition:
            case Global.FightEffectType.hit:
            case Global.FightEffectType.defeat:
            case Global.FightEffectType.charm:
                targetArr = [Global.ColliderGroup.Enemy, Global.ColliderGroup.Build];
                break;
            case Global.FightEffectType.summon:
                targetArr = [Global.ColliderGroup.Build];
                break;
            case Global.FightEffectType.thunder:
                targetArr = [Global.ColliderGroup.Enemy];
                break;
        }
        return targetArr;
    }

    /**获取目标身上主动技能buff数值 */
    static getEffefctParam(tarRole: RoleBase, effectType: Global.FightEffectType) {
        let param = tarRole.effectArr.find(v => v.effectParam[0] == effectType);
        return param ? param.effectParam : null;
    }

}

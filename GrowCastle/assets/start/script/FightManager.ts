import { AudioManager } from "../../homepage/script/common/AudioManager";
import GamingData from "../../homepage/script/common/GamingData";
import { Global } from "../../homepage/script/common/Global";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiPath } from "../../homepage/script/common/UiPath";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import WaveConfig, { WaveConfigMgr } from "../../homepage/script/config/WaveConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import HomeManager from "../../homepage/script/manager/HomeManager";
import ResultView from "../../part1/script/ResultView";
import EffectManager from "./EffectManager";
import EnemyManager from "./EnemyManager";
import FightMap from "./FightMap";
import { RoleBase } from "./role/RoleBase";
import RoleBaseData from "./role/RoleBaseData";

const { ccclass, property } = cc._decorator;

//控制战斗的进程
@ccclass
export default class FightManager extends cc.Component {

    public static ins: FightManager = null;

    private _isOnFight: boolean = false;
    public get isOnFight(): boolean {
        return this._isOnFight;
    }

    private _isPause: boolean = false;
    public get isPause(): boolean {
        return this._isPause;
    }

    private waveConfig: WaveConfig = null;
    private _fightType: Global.FightType = Global.FightType.Normal;
    public get fightType(): Global.FightType {
        return this._fightType;
    }

    public fightTime: number = 0;

    private curWave: number = 1;

    private curType: Global.FightType = Global.FightType.Normal;

    protected onLoad(): void {
        FightManager.ins = this;
    }

    protected update(dt: number): void {
        if (!this.isOnFight) return;
        if (this.isPause) return;
        if (dt > 0.02) {
            dt = 0.016;
        }
        let mulDt = dt * GamingData.fightSpeedMul;
        this.fightTime += mulDt;
        FightMap.ins.fightRoleBaseArr.forEach(v => {
            v.fightUpdate(mulDt);
        })
        FightMap.ins.fightUpdate(mulDt);
        EnemyManager.ins.enemyBaseMap.forEach(v => {
            v.fightUpdate(mulDt);
        })
        EnemyManager.ins.fightUpdate(mulDt);
        EffectManager.ins.effectBaseMap.forEach(v => {
            v.fightUpdate(mulDt);
        })
        EffectManager.ins.fightUpdate(mulDt);
    }

    /**开始战斗 */
    startFight(type: Global.FightType, wave: number) {
        if (this._isOnFight) return;
        this.curType = type;
        wave = 0;
        this.curWave = wave;
        this.startWave();
        FightMap.ins.startFight(this.waveConfig);
    }

    startWave() {
        this.curWave++;
        appContext.topCameraNode.active = false;
        WorldEventManager.triggerEvent(Global.EventEnum.FightState, true);
        this._fightType = this.curType;
        let mgr = DataManager.ins.get(WaveConfigMgr)
        let arr = [];
        mgr.datas.forEach(v => {
            if (v.wavetype == this.curType) {
                arr.push(v);
            }
        })
        let maxWave = arr[arr.length - 1].wave;
        this.curWave = Math.min(maxWave, this.curWave);
        this.waveConfig = mgr.datas.find(v => v.wavetype == this.curType && v.wave == this.curWave);
        if (!this.waveConfig) {
            console.warn("未找到关卡数据");
            return;
        }

        EnemyManager.ins.fightStart(this.waveConfig);
        this._isOnFight = true;
        appContext.isOnFight = true;
        this._isPause = false;
        this.fightTime = 0;
    }

    /**战斗结束 */
    endFight(isSuc: boolean, isGiveUp: boolean = false) {
        if (!this._isOnFight) return;
        this._isOnFight = false;
        appContext.isOnFight = false;
        console.log("战斗结果 ", isSuc);
        this._isPause = true;
        EffectManager.ins.fightEnd();
        let wave = this.waveConfig.wave;
        let fightType = this.fightType;
        UIManager.ins.openView(UiPath.ResultView, true, true).then((view: ResultView) => {
            view.init(isSuc, fightType, (isRevive: boolean) => {
                this._isPause = false;
                if (isRevive) {
                    //复活
                    this._isOnFight = true;
                    appContext.isOnFight = true;
                    FightMap.ins.revive();
                    EnemyManager.ins.revive();
                } else {
                    GamingData.resumeFightMul();
                    AudioManager.ins.stopBgm();
                    if (isSuc) PlayerData.ins.checkFightEndReward(wave, fightType);
                    this._isOnFight = false;
                    appContext.isOnFight = false;
                    this.fightTime = 0;
                    FightMap.ins.endFight();
                    EnemyManager.ins.fightEnd();
                    this.waveConfig = null;
                    this._fightType = Global.FightType.Normal;
                    WorldEventManager.triggerEvent(Global.EventEnum.FightState, false);
                }
            }, isGiveUp);
        })
    }

    /**获取攻击目标 */
    getAtkTarget(atker: RoleBase) {
        if (!this._isOnFight) return;
        if (!cc.isValid(atker)) return;
        if (atker.isDeath) return;
        let hiter = null;
        if (atker.roleInfo.roleType == Global.RoleType.Hero || atker.roleInfo.roleType == Global.RoleType.Archer || atker.roleInfo.roleType == Global.RoleType.Build) {
            hiter = EnemyManager.ins.getEnemy();
        } else if (atker.roleInfo.roleType == Global.RoleType.Enemy || atker.roleInfo.roleType == Global.RoleType.Boss) {
            hiter = EnemyManager.ins.getEnemyTarget(atker);
        } else if (atker.roleInfo.roleType == Global.RoleType.Soldier) {
            hiter = EnemyManager.ins.getSoldierAtkEnermy(atker);
        }
        if (!hiter) return;
        if (!cc.isValid(hiter)) return;
        let hitNum = this.getAtkNum(atker, hiter);
        return { target: hiter, hitNum: hitNum };
    }

    /**计算造成的伤害 */
    private getAtkNum(atker: RoleBase, hiter: RoleBase): number {
        let atkNum = atker.roleDataInfo.atk;
        //检查箭角
        if (atker.roleInfo.roleType == Global.RoleType.Build) {
            if (atker.baseRole.id == 1001 || atker.baseRole.id == 1002) {
                let param = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill20);
                if (param) {
                    atkNum += GamingData.getSkillAdd(param[0], atkNum);
                }
            }
        }
        switch (atker.roleInfo.roleType) {
            case Global.RoleType.Archer:
                atkNum = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.弓箭手攻击力, atkNum);
                if (hiter.roleInfo.roleType == Global.RoleType.Enemy) {
                    atkNum = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.弓箭手对小兵伤害, atkNum);
                } else if (hiter.roleInfo.roleType == Global.RoleType.Boss) {
                    atkNum = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.弓箭手对将领伤害, atkNum);
                }
                break;
            case Global.RoleType.Hero:
                atkNum = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.英雄攻击力, atkNum);
                break;
            case Global.RoleType.Build:

                break;
        }
        //受伤增加
        let effectParam = RoleBaseData.getEffefctParam(hiter, Global.FightEffectType.hit_addition);
        if (effectParam) {
            atkNum += GamingData.getSkillAdd(effectParam, atkNum);
        }
        return atkNum;
    }

}

import { AudioManager } from "../../homepage/script/common/AudioManager";
import GamingData from "../../homepage/script/common/GamingData";
import { Global } from "../../homepage/script/common/Global";
import MyPool from "../../homepage/script/common/MyPool";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { SoundPath } from "../../homepage/script/common/SoundPath";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiPath } from "../../homepage/script/common/UiPath";
import { Util } from "../../homepage/script/common/Util";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import { ConstConfigMgr } from "../../homepage/script/config/ConstConfig";
import { EnemyConfigMgr } from "../../homepage/script/config/EnemyConfig";
import SkillConfig from "../../homepage/script/config/SkillConfig";
import { StoryConfigMgr } from "../../homepage/script/config/StoryConfig";
import WaveConfig from "../../homepage/script/config/WaveConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import GuideManager from "../../homepage/script/manager/GuideManager";
import HomeManager from "../../homepage/script/manager/HomeManager";
import TaskManager from "../../homepage/script/manager/TaskManager";
import StoryView from "../../part1/script/story/StoryView";
import EffectManager from "./EffectManager";
import FightManager from "./FightManager";
import FightMap from "./FightMap";
import ProgressCol from "./ProgressCol";
import { CastleBase } from "./role/CastleBase";
import { EnemyBase } from "./role/EnemyBase";
import { RoleBase } from "./role/RoleBase";
import { SoldierBase } from "./role/SoldierBase";

const { ccclass, property } = cc._decorator;

//管理战斗过程中敌人管理
@ccclass
export default class EnemyManager extends cc.Component {

    @property(CastleBase)
    castle: CastleBase = null;

    @property(cc.Prefab)
    enemyPre: cc.Prefab = null;

    @property(cc.Prefab)
    soldierPre: cc.Prefab = null;

    @property(cc.Prefab)
    bossPre: cc.Prefab = null;

    @property(cc.Node)
    enemyContent: cc.Node = null;

    @property(cc.Node)
    soldierContent: cc.Node = null;

    @property(ProgressCol)
    wavePro: ProgressCol = null;

    @property(cc.Label)
    waveLab: cc.Label = null;

    @property(cc.Node)
    atkRangeNode: cc.Node = null;

    @property(cc.Node)
    commonHpNode: cc.Node = null;

    @property(cc.Node)
    enemyPosRect: cc.Node = null;

    @property(cc.Node)
    tarPosNode: cc.Node = null;

    private _enemyBaseMap: Map<string, EnemyBase> = new Map();
    public get enemyBaseMap(): Map<string, EnemyBase> {
        return this._enemyBaseMap;
    }

    /**敌人移动的y轴 */
    private _maxMoveY: number = 0;
    public get maxMoveY(): number {
        return this._maxMoveY;
    }
    /**敌人进入攻击范围的y轴 */
    private _atkRangeY: number = 0;
    public get atkRangeY(): number {
        return this._atkRangeY;
    }
    private waveConfig: WaveConfig = null;
    /**波次计时器 */
    private waveTimer: number = 0;
    /**每波各种敌人数 */
    private waveEnemyNumArr: { id: number, waveArr: number[] }[] = [];
    /**当前波次 */
    private curWave: number = 0;
    /**总波次数 */
    private totalWave: number = 0;
    /**敌人总数 */
    private enemyTotalNum: number = 0;
    /**已生成的敌人数 */
    private createdEnemyNum: number = 0;
    /**可选敌人池 */
    private canSelectPool: Map<string, RoleBase> = new Map();
    /**池子容量 */
    private poolSize: number = 5;
    /**boss出现 */
    private bossCome: boolean = false;
    /**是否在生成间隔计时中 */
    private isOnCreateTimer: boolean = false;
    /**和小兵对战中的敌人 */
    private onFightEnemyArr: { atker: RoleBase, hiter: EnemyBase }[] = [];
    /**所有召唤的小兵 */
    private _allSoldierMap: Map<string, RoleBase> = new Map();
    public get allSoldierMap(): Map<string, RoleBase> {
        return this._allSoldierMap;
    }
    private wavePromiseMap: Map<number, any[]> = new Map();
    /**是否弹出引导 */
    private isShowGuide: boolean = false;
    /**当前波次掉落铜币总数 */
    private totalDropCoin: number = 0;

    public static ins: EnemyManager = null;
    protected onLoad(): void {
        EnemyManager.ins = this;
        this.wavePro.node.active = true;
        this.commonHpNode.active = false;
        this.waveLab.string = "第" + (PlayerData.ins.wave + 1) + "波";
        this.wavePro.init(1);
        this.wavePro.setCurNum(0);
        this.poolSize = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.最大索敌数量).value;
        this.scheduleOnce(() => {
            this._maxMoveY = this.tarPosNode.y;
            let wPos = this.atkRangeNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
            this._atkRangeY = this.enemyContent.convertToNodeSpaceAR(wPos).y + 120;
        }, 0)
    }

    private async createWave() {
        // console.log("createWave ", this.curWave)
        if (this.curWave >= this.totalWave) return;
        this.isOnCreateTimer = false;
        let isBossFight = this.waveConfig.wavetype == Global.FightType.Boss;
        if (isBossFight) {
            if (!this.bossCome) {
                this.bossCome = true;
                await FightMap.ins.bossComingAnim();
            }
        }
        if (this.bossCome) {
            await FightMap.ins.bossComingAnim();
        }

        let promiseArr = [];
        this.waveEnemyNumArr.forEach((v, k) => {
            for (let i = 0; i < v.waveArr[this.curWave]; i++) {
                let enemyConfig = DataManager.ins.get(EnemyConfigMgr).getDataById(v.id);
                let roleType = Global.RoleType.Enemy;
                let pre = this.enemyPre;
                if (enemyConfig.type == Global.EnemyType.Elite_Monster || enemyConfig.type == Global.EnemyType.Boss) {
                    roleType = Global.RoleType.Boss;
                    pre = this.bossPre;
                }

                let enemy = MyPool.getObj(pre);
                enemy.parent = this.enemyContent;
                let enemyBase = enemy.getComponent(EnemyBase);

                let wPos = Util.getRandomPosInRect(this.enemyPosRect.getBoundingBoxToWorld());
                let lPos = this.enemyContent.convertToNodeSpaceAR(wPos);
                lPos.x = roleType == Global.RoleType.Boss ? 0 : lPos.x;
                enemy.setPosition(lPos);
                let wave = this.waveConfig.wavetype == Global.FightType.Territory ? this.waveConfig.usewave : PlayerData.ins.wave + 1;
                promiseArr.push(
                    Promise.race(
                        [
                            new Promise((resolve, reject) => {
                                enemyBase.init({ roleType: roleType, roleId: v.id }, this.enemyDeathCb.bind(this), () => {
                                    resolve(null);
                                    this.refreshPool();
                                    if (this.curWave >= this.totalWave - 1 && !this.bossCome && this.waveConfig.lastWave.length > 0) {
                                        this.bossCome = true;
                                    }
                                    this.createdEnemyNum++;
                                    this.wavePro.setCurNum(this.createdEnemyNum, true);

                                    if (GamingData.isOnGuide && !this.isShowGuide) {
                                        if (PlayerData.ins.guideGroup == 0 && GamingData.jumpGuideGroup != PlayerData.ins.guideGroup) {
                                            GuideManager.ins.showCurGuide();
                                            GamingData.fightSpeedMul = 0;
                                            this.isShowGuide = true;
                                        }
                                    }

                                }, (enemyBase: RoleBase) => {
                                    if (this._enemyBaseMap.has(enemyBase.node.uuid)) {
                                        this._enemyBaseMap.delete(enemyBase.node.uuid);
                                    }
                                    if (this._enemyBaseMap.size <= 0) {
                                        if (this.curWave >= this.totalWave) {
                                            if (this.waveConfig.wavetype != Global.FightType.Territory) {
                                                // FightManager.ins.endFight(true, this.totalDropCoin);
                                                FightManager.ins.startWave();
                                            }
                                        }
                                    }
                                }, wave);
                            }),
                            new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    resolve(null);
                                }, 3000)
                            })
                        ]
                    )
                )
                this._enemyBaseMap.set(enemy.uuid, enemyBase);
            }
        })
        this.wavePromiseMap.set(this.curWave, promiseArr);
        Promise.all(promiseArr).then(() => {
            if (this.waveConfig.wavetype == Global.FightType.Territory) {
                if (this.curWave >= this.totalWave) {
                    this.curWave = 0;
                    console.log("22222222222222222")
                }
                this.isOnCreateTimer = true;
            } else {
                this.isOnCreateTimer = true;
                console.log("111111111111111111")
            }
        })
        this.refreshPool();
        this.curWave++;

        // if (this.curWave >= this.waveInterval.length) {
        //     if (this.waveConfig.wavetype == Global.FightType.Normal) {
        //         console.log("波次完毕");
        //     } else if (this.waveConfig.wavetype == Global.FightType.Territory) {
        //         this.curWave = 0;
        //     }
        // }
    }

    private enemyDeathCb(enemyBase: RoleBase, atker: RoleBase) {
        if (this._enemyBaseMap.has(enemyBase.node.uuid)) {
            this.canSelectPool.delete(enemyBase.node.uuid);
            this.removeFightGroup(null, enemyBase);
            this.refreshPool();
            if (this.waveConfig.lastWave.length > 0 && this.waveConfig.lastWave[0] == enemyBase.baseRole.id) {
                this.getEnemyReward(this.waveConfig.lastWave, enemyBase);
            } else {
                this.waveConfig.enemy.forEach(v => {
                    if (v[0] == enemyBase.baseRole.id) {
                        this.getEnemyReward(v, enemyBase);
                    }
                })
            }
            TaskManager.ins.checkRefreshTaskProgress(Global.TaskType.KillEnemy);
        }
    }

    private getEnemyReward(arg: number[], enemyBase: RoleBase) {
        //掉落金币
        let actualCoin = Math.floor(HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.敌人金币掉落, arg[2]));
        if (Math.random() < HomeManager.ins.getPrecentValue(Global.ArmamentAttribute.敌人金币掉落双倍概率)) {
            actualCoin *= 2;
        }
        //敌人掉落金币数量增加10%
        let addCoin = 0;
        let effect1 = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill19);
        if (effect1) {
            effect1.forEach(v => {
                addCoin += GamingData.getSkillAdd(v, actualCoin);
            })
        }
        actualCoin += addCoin;
        //铜币提升
        let add = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.铜币提升每级加成).value;
        actualCoin *= (1 + add / 100);

        actualCoin = Math.floor(actualCoin);
        PlayerData.ins.changeItemNum(Global.ItemId.Coin, actualCoin, false);
        let worldPos = enemyBase.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        EffectManager.ins.createDrop(Global.ItemId.Coin, actualCoin, worldPos);
        this.totalDropCoin += actualCoin;

        //获得经验
        let exp = arg[3];
        //击败敌人获得的经验增加5%%
        let addExp = 0;
        let effect2 = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill18);
        if (effect2) {
            effect2.forEach(v => {
                addExp += GamingData.getSkillAdd(v, exp);
            })
        }
        exp += addExp;
        exp = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.敌人经验掉落, exp);
        // console.warn("获得经验 ", exp);
        PlayerData.ins.getExp(exp);

        //击杀奖励
        if (this.waveConfig.wavetype != Global.FightType.Boss) {
            let enemy = enemyBase as EnemyBase;
            let enemyConfig = enemy.enemyConfig;
            if (enemyConfig.reward) {
                enemyConfig.reward.forEach(v => {
                    if (v.pro) {
                        if (Math.random() < v.pro) {
                            PlayerData.ins.changeItemNum(v.id, v.num, false);
                        }
                    } else {
                        PlayerData.ins.changeItemNum(v.id, v.num, false);
                    }
                })
            }
        }
    }

    /**更新敌人池 */
    private refreshPool() {
        let offset = this.poolSize - this.canSelectPool.size;
        if (offset > 0) {
            let enemyArr = [];
            this._enemyBaseMap.forEach(v => {
                if (!v.isDeath && v.isCanSelect && !this.canSelectPool.has(v.node.uuid)) {
                    enemyArr.push(v);
                }
            })
            if (enemyArr.length > 0) {
                enemyArr.sort((a, b) => {
                    return a.node.y - b.node.y
                })
                for (let i = 0; i < offset; i++) {
                    let enemy = enemyArr.shift();
                    if (enemy) {
                        this.canSelectPool.set(enemy.node.uuid, enemy);
                    }
                }
            }
        }
    }

    /**获取英雄，弓箭手，建筑攻击目标 */
    public getEnemy() {
        let enemyArr = [];
        this.canSelectPool.forEach(v => {
            if (!v.isDeath && v.isCanSelect) {
                enemyArr.push(v);
            }
        })
        if (enemyArr.length <= 0) return this.waveConfig.wavetype == Global.FightType.Territory ? this.castle : null;
        let enemy = Util.getRandomValue(enemyArr);
        // console.log("enemy ", enemy.key, " ,enemyArr.length ", enemyArr.length, " this.canSelectPool ", this.canSelectPool.size)
        return enemy.value;
    }

    /**获取敌人攻击目标 */
    public getEnemyTarget(enemy: RoleBase) {
        let target = this.onFightEnemyArr.find(v => v.hiter.node == enemy.node);
        if (target) return target.atker;
        return FightMap.ins.playerBase;
    }

    /**检查小兵是否进入敌人的攻击范围 */
    public checkCanAtkSoldier(enemy: EnemyBase) {
        if (this._allSoldierMap.size <= 0) return null;
        if (this.onFightEnemyArr.find(v1 => v1.hiter.node == enemy.node)) return;
        let soldierArr = Array.from(this._allSoldierMap, v => {
            return v[1];
        })
        for (let i = 0; i < soldierArr.length; i++) {
            let soldier = soldierArr[i];
            if (!soldier.isDeath) {
                let wPos = enemy.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
                let ePos = this.enemyContent.convertToNodeSpaceAR(wPos);
                let sPos = soldier.node.getPosition();
                let dis = sPos.sub(ePos).mag();
                if (dis <= 50) {
                    this.enemyJoinFight(enemy, soldier);
                    break;
                }
            }
        }
    }

    /**敌人将小兵拉入战斗 */
    public enemyJoinFight(enemy: EnemyBase, soldier: RoleBase) {
        if (soldier.roleState == Global.RoleState.Move || soldier.roleState == Global.RoleState.Move_to_target ||
            soldier.roleState == Global.RoleState.Idle) {
            this.onFightEnemyArr.unshift({ atker: soldier, hiter: enemy });
            soldier.changeState(Global.RoleState.Idle);
            enemy.changeState(Global.RoleState.Idle);
            console.log("拉入战斗")
        } else if (soldier.roleState == Global.RoleState.Atk) {
            this.onFightEnemyArr.push({ atker: soldier, hiter: enemy });
            enemy.changeState(Global.RoleState.Idle);
            console.log("加入战斗")
        }
    }

    /**移除攻击配对 */
    removeFightGroup(atker?: RoleBase, hiter?: RoleBase) {
        if (atker) {
            atker.changeState(Global.RoleState.Move);
            for (let i = 0; i < this.onFightEnemyArr.length; i++) {
                let obj = this.onFightEnemyArr[i];
                if (obj.atker.node == atker.node) {
                    this.onFightEnemyArr.splice(i--, 1);
                    if (!this.onFightEnemyArr.find(v1 => v1.hiter.node == obj.hiter.node)) {
                        obj.hiter.changeState(Global.RoleState.Move);
                    }
                }
            }
        } else if (hiter) {
            hiter.changeState(Global.RoleState.Move);
            for (let i = 0; i < this.onFightEnemyArr.length; i++) {
                let obj = this.onFightEnemyArr[i];
                if (obj.hiter.node == hiter.node) {
                    obj.atker.changeState(Global.RoleState.Move);
                    this.onFightEnemyArr.splice(i--, 1);
                }
            }
        }
    }

    private soliderDeathCb(soldierBase: RoleBase, atker: RoleBase) {
        this.removeFightGroup(soldierBase);
    }

    private soliderDeathAnimEndCb(soldierBase: RoleBase, atker: RoleBase) {
        if (this._allSoldierMap.get(soldierBase.node.uuid)) {
            this._allSoldierMap.delete(soldierBase.node.uuid);
        }
    }

    /**获取小兵攻击目标 */
    public getSoldierAtkEnermy(atker: RoleBase) {
        let target = this.onFightEnemyArr.find(v => v.atker.node == atker.node);
        if (target) return target.hiter;
        let enemyArr = [];
        this._enemyBaseMap.forEach(v => {
            if (!v.isDeath && v.isCanSelect && v.node.y > atker.node.y) {
                if (this.waveConfig.wavetype == Global.FightType.Boss) {
                    enemyArr.push(v);
                } else if (!this.onFightEnemyArr.find(el => el.hiter.node == v.node)) {
                    enemyArr.push(v);
                }
            }
        })
        enemyArr.sort((a, b) => {
            let disA = atker.node.getPosition().sub(a.node.getPosition()).mag();
            let disB = atker.node.getPosition().sub(b.node.getPosition()).mag();
            return b.node.y - a.node.y && disA - disB;
        })
        if (enemyArr.length <= 0) return this.waveConfig.wavetype == Global.FightType.Territory ? this.castle : null;
        this.onFightEnemyArr.push({ atker: atker, hiter: enemyArr[0] });
        return enemyArr[0];
    }

    /**生成召唤小兵 */
    public createSoldier(parameter: number[]) {
        let promiseArr = [];
        let interX = 400 / (parameter[3] - 1);
        let x = 0;
        for (let i = 0; i < parameter[3]; i++) {
            let soldier = MyPool.getObj(this.soldierPre);
            soldier.parent = this.soldierContent;
            soldier.y = this._maxMoveY;
            if (i % 2 != 0) x += interX;
            soldier.x = x * (i % 2 == 0 ? 1 : -1);
            let soldierBase = soldier.getComponent(SoldierBase);
            this._allSoldierMap.set(soldier.uuid, soldierBase);
            promiseArr.push(soldierBase.init({ roleType: Global.RoleType.Soldier, roleId: parameter[4] }, this.soliderDeathCb.bind(this), this.soliderDeathAnimEndCb.bind(this)));
        }
        return Promise.all(promiseArr);
    }

    async fightStart(waveConfig: WaveConfig) {
        this.waveConfig = waveConfig;
        this.castle.node.active = this.waveConfig.wavetype == Global.FightType.Normal || this.waveConfig.wavetype == Global.FightType.Territory;
        switch (this.waveConfig.wavetype) {
            // case Global.FightType.Normal:
            case Global.FightType.Territory:
                this.castle.init({ roleType: Global.RoleType.Castle, roleId: this.waveConfig.wave }, () => {
                    FightManager.ins.endFight(true);
                }, this.waveConfig.wavetype);
                break;
        }
        this.curWave = 0;
        this.bossCome = false;
        this.totalDropCoin = 0;
        this.totalWave = this.waveConfig.lastWave.length > 0 ? this.waveConfig.wavenum + 1 : this.waveConfig.wavenum;
        this.waveTimer = this.waveConfig.wavetime;
        this.waveEnemyNumArr = [];
        this.enemyTotalNum = 0;
        this.waveConfig.enemy.forEach(v => {
            this.enemyTotalNum += v[1];
            let waveArr = Util.splitIntoRandomShares(v[1], this.waveConfig.wavenum, 0.2);
            if (this.waveConfig.lastWave.length > 0) {
                waveArr.push(0);
            }
            this.waveEnemyNumArr.push({ id: v[0], waveArr: waveArr });
        })
        if (this.waveConfig.lastWave.length > 0) {
            this.enemyTotalNum += this.waveConfig.lastWave[1];
            let waveArr = [];
            for (let i = 0; i < this.waveConfig.wavenum; i++) {
                waveArr.push(0);
            }
            waveArr.push(this.waveConfig.lastWave[1])
            this.waveEnemyNumArr.push({ id: this.waveConfig.lastWave[0], waveArr: waveArr });
        }
        this.wavePro.node.active = this.waveConfig.wavetype == Global.FightType.Normal;
        this.waveLab.string = "第" + this.waveConfig.wave + "波";
        this.createdEnemyNum = 0;
        this.wavePro.init(this.enemyTotalNum);
        this.wavePro.setCurNum(0);
        this.canSelectPool.clear();
        if (this.waveConfig.wavetype == Global.FightType.Territory) {
            this.canSelectPool.set(this.castle.node.uuid, this.castle);
        }
        this._enemyBaseMap.clear();
        this.playBgm();
        if (GamingData.isOnGuide && PlayerData.ins.guideGroup == 0) {
            this.isShowGuide = false;
        }

        this.isOnCreateTimer = false;
        let storyArr = DataManager.ins.get(StoryConfigMgr).getStoryConfigArrByGroupAndType(this.waveConfig.wave, 2);
        let isHasStory = storyArr.length > 0;
        if (isHasStory) {
            await new Promise((resolve, reject) => {
                UIManager.ins.openView(UiPath.StoryView).then((view: StoryView) => {
                    view.init(this.waveConfig.wave).then(resolve);
                })
            })
        }
        this.isOnCreateTimer = true;
    }

    fightUpdate(dt: number) {
        if (!FightManager.ins.isOnFight) return;
        if (this.curWave < this.totalWave && this.isOnCreateTimer) {
            this.waveTimer += dt;
            if (this.waveTimer >= this.waveConfig.wavetime / 1000) {
                this.waveTimer = 0;
                this.createWave();
            }
        }
        let arr = Array.from(this._enemyBaseMap, (v => {
            return v[1] as RoleBase;
        }))
        let arr2 = Array.from(this._allSoldierMap, (v => {
            return v[1];
        }))
        arr = arr.concat(arr2);
        arr.sort((a, b) => {
            return b.node.y - a.node.y;
        })
        arr.forEach((v, k) => {
            v.node.setSiblingIndex(k);
        })
    }

    fightEnd() {
        this._enemyBaseMap.forEach(v => {
            v.destroySelf();
        })
        this._enemyBaseMap.clear();
        this._allSoldierMap.forEach(v => {
            v.destroySelf();
        })
        this._allSoldierMap.clear();
        this.canSelectPool.clear();
        this.curWave = 0;
        this.waveTimer = 0;
        this.waveEnemyNumArr = [];
        // this.wavePro.node.active = false;
        this.wavePro.setCurNum(0);
        this.waveLab.string = "第" + (PlayerData.ins.wave + 1) + "波";
        this.commonHpNode.active = false;
        this.castle.reset();
    }

    revive() {
        if (this._enemyBaseMap.size <= 0 && this.curWave >= this.totalWave) {
            if (this.waveConfig.wavetype != Global.FightType.Territory) {
                FightManager.ins.endFight(true);
            } else {
                if (this.castle.isDeath) {
                    FightManager.ins.endFight(true);
                }
            }
            return;
        }
        this._enemyBaseMap.forEach(v => {
            v.addEffect([112, 1, 1, 0, -100], Global.SkillType.Skill24, FightMap.ins.playerBase);
        })
    }

    playBgm() {
        let loopCall = () => {
            if (this.bossCome) {
                AudioManager.ins.playBgm(SoundPath.battle_BGM02);
            } else {
                AudioManager.ins.playBgm(SoundPath.battle_BGM01, false, loopCall);
            }
        }
        AudioManager.ins.playBgm(SoundPath.battle_begin, false, loopCall);
    }
}

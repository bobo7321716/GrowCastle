import { AudioManager } from "../../homepage/script/common/AudioManager";
import { BundleName } from "../../homepage/script/common/BundleName";
import GamingData from "../../homepage/script/common/GamingData";
import { Global } from "../../homepage/script/common/Global";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { SoundPath } from "../../homepage/script/common/SoundPath";
import { UIManager } from "../../homepage/script/common/UIManager";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import WaveConfig, { WaveConfigMgr } from "../../homepage/script/config/WaveConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import GuideManager from "../../homepage/script/manager/GuideManager";
import ArcherContent from "./ArcherContent";
import BuildPos from "./BuildPos";
import EnemyManager from "./EnemyManager";
import FightManager from "./FightManager";
import HeroPos from "./HeroPos";
import { PlayerBase } from "./role/PlayerBase";
import { RoleBase } from "./role/RoleBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FightMap extends cc.Component {

    @property(PlayerBase)
    playerBase: PlayerBase = null;

    @property(HeroPos)
    heroPosArr: HeroPos[] = [];

    @property(BuildPos)
    buildPosArr: BuildPos[] = [];

    @property(cc.Node)
    archerNode: cc.Node = null;

    @property(cc.Node)
    moveNode: cc.Node = null;

    @property(cc.Node)
    bossComing: cc.Node = null;

    @property(cc.Sprite)
    roadSpr: cc.Sprite = null;

    public archerCol: ArcherContent = null;
    private isOnMoveAnim: boolean = false;
    private waveConfig: WaveConfig = null;

    private _fightRoleBaseArr: RoleBase[] = [];
    public get fightRoleBaseArr(): RoleBase[] {
        return this._fightRoleBaseArr;
    }

    public static ins: FightMap = null;
    protected onLoad(): void {
        FightMap.ins = this;
    }

    // protected start(): void {
    //     WorldEventManager.addListener(Global.EventEnum.FightState, this.refreshFightState, this);
    // }

    init(): Promise<any> {
        this.waveConfig = DataManager.ins.get(WaveConfigMgr).getDataById(PlayerData.ins.wave + 1);
        let id = this.waveConfig ? this.waveConfig.background : 1;
        AbManager.loadBundleRes(BundleName.Assets, "texture/road/road" + id, cc.SpriteFrame).then((spf) => {
            this.roadSpr.spriteFrame = spf;
        })
        this.moveNode.stopAllActions();
        this.moveNode.y = 0;
        let winSize = cc.winSize;
        this.node.height = winSize.height;
        this.bossComing.stopAllActions();
        this.bossComing.opacity = 0;
        return this.refreshBaseArr();
    }

    refreshBaseArr() {
        this.playerBase.init({ roleType: Global.RoleType.Player, roleId: 0 }, this.playerDeath.bind(this));
        this.archerCol = this.archerNode.getComponent(ArcherContent);
        this.archerCol.init();

        this._fightRoleBaseArr = [this.playerBase];
        let promiseArr = [];
        this.heroPosArr.forEach((v, k) => {
            let info = PlayerData.ins.unlockHeroInfos.find(el => el.atkPos == k);
            let heroId = info ? info.id : -1;
            promiseArr.push(v.init(heroId, k).then(() => {
                if (!this._fightRoleBaseArr.find(el => el.node == v.heroBase.node)) {
                    this._fightRoleBaseArr.push(v.heroBase);
                }
            }))
        })
        this.buildPosArr.forEach((v, k) => {
            let info = PlayerData.ins.unlockBuildInfos.find(el => el.atkPos == k);
            let buildId = info ? info.id : -1;
            promiseArr.push(v.init(buildId, k).then(() => {
                if (!this._fightRoleBaseArr.find(el => el.node == v.buildBase.node)) {
                    this._fightRoleBaseArr.push(v.buildBase);
                }
            }))
        })
        this._fightRoleBaseArr = this._fightRoleBaseArr.concat(this.archerCol.archerBaseArr);
        return Promise.all(promiseArr);
    }

    startFight(waveConfig: WaveConfig) {
        this.waveConfig = waveConfig;
        this.refreshFightState(true)
    }

    private playerDeath() {
        FightManager.ins.endFight(false);
    }

    fightUpdate(dt: number) {

    }

    endFight() {
        // this.refreshBaseArr();
        this.refreshFightState(false);
    }

    revive() {
        this.playerBase.init({ roleType: Global.RoleType.Player, roleId: 0 }, this.playerDeath.bind(this));
    }

    refreshFightState(isStart: boolean) {
        if (this.isOnMoveAnim) return;
        this.isOnMoveAnim = true;
        UIManager.ins.isSceneBlockInput = true;
        this.moveNode.stopAllActions();
        AbManager.loadBundleRes(BundleName.Assets, "texture/road/road" + this.waveConfig.background, cc.SpriteFrame).then((spf) => {
            this.roadSpr.spriteFrame = spf;
        })
        if (isStart) {
            cc.tween(this.moveNode)
                .by(0.5, { y: -120 })
                .call(() => {
                    UIManager.ins.isSceneBlockInput = false;
                    this.isOnMoveAnim = false;
                    //检查是否上阵兵营
                    let param = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill14);
                    if (param.length > 0) {
                        EnemyManager.ins.createSoldier(param[0]).then(() => {
                            EnemyManager.ins.allSoldierMap.forEach(v => {
                                this._fightRoleBaseArr.push(v);
                            })
                            this._fightRoleBaseArr.forEach(v => {
                                v.roleDataInfo && v.startFight(this.waveConfig.wavetype);
                            })
                        })
                    } else {
                        this.refreshBaseArr();
                        this._fightRoleBaseArr.forEach(v => {
                            v.roleDataInfo && v.startFight(this.waveConfig.wavetype);
                        })
                    }
                })
                .start()
        } else {
            this._fightRoleBaseArr.forEach(v => {
                v.roleDataInfo && v.endFight();
            })
            this.refreshBaseArr();
            cc.tween(this.moveNode)
                .by(0.5, { y: 120 })
                .call(() => {
                    UIManager.ins.isSceneBlockInput = false;
                    this.isOnMoveAnim = false;

                })
                .start()
        }
    }

    playClickAudio() {
        AudioManager.ins.playClickAudio();
    }

    bossComingAnim() {
        return new Promise((resolve, reject) => {
            AudioManager.ins.playEffect(SoundPath.boss_come);
            this.bossComing.stopAllActions();
            this.bossComing.opacity = 150;
            cc.tween(this.bossComing)
                .repeat(3,
                    cc.tween()
                        .to(0.3, { opacity: 255 })
                        .to(0.3, { opacity: 150 })
                )
                .call(() => {
                    this.bossComing.opacity = 0;
                    resolve && resolve(null);
                })
                .start()
        })
    }

    showPosHand() {
        let pos1 = this.heroPosArr.find(v => v.heroBase.baseRole == null);
        if (pos1) pos1.showPosHand();
        let pos2 = this.buildPosArr.find(v => v.buildBase.baseRole == null);
        if (pos2) pos2.showPosHand();
    }
}

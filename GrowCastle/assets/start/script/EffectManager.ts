import { AudioManager } from "../../homepage/script/common/AudioManager";
import { BundleName } from "../../homepage/script/common/BundleName";
import GamingData from "../../homepage/script/common/GamingData";
import { Global } from "../../homepage/script/common/Global";
import MyPool from "../../homepage/script/common/MyPool";
import { SoundPath } from "../../homepage/script/common/SoundPath";
import { Util } from "../../homepage/script/common/Util";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import { ItemConfigMgr } from "../../homepage/script/config/ItemConfig";
import SkillConfig from "../../homepage/script/config/SkillConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import DropBase from "./DropBase";
import EffectBase from "./EffectBase";
import FightManager from "./FightManager";
import FlyNode from "./FlyNode";
import YanEffect from "./YanEffect";
import { RoleBase } from "./role/RoleBase";
import AnimCol from "./skill/AnimCol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EffectManager extends cc.Component {

    @property(cc.Node)
    bulletLayer: cc.Node = null;

    @property(cc.Node)
    skillLayer: cc.Node = null;

    @property(cc.Node)
    dropLayer: cc.Node = null;

    @property(cc.Node)
    flyLayer: cc.Node = null;

    @property(cc.Node)
    rewardFlyArea: cc.Node = null;

    @property(cc.Node)
    upgradeFlyArea: cc.Node = null;

    @property(cc.Prefab)
    dropPre: cc.Prefab = null;

    @property(cc.Prefab)
    flyPre: cc.Prefab = null;

    @property(cc.Prefab)
    yanPre: cc.Prefab = null;

    @property(cc.Prefab)
    yan2Pre: cc.Prefab = null;

    @property(cc.Node)
    coinTarNode: cc.Node = null;

    @property(cc.Node)
    cryTarNode: cc.Node = null;

    public static ins: EffectManager = null;

    private _effectBaseMap: Map<cc.Node, EffectBase> = new Map();
    public get effectBaseMap(): Map<cc.Node, EffectBase> {
        return this._effectBaseMap;
    }

    private coinPos: cc.Vec2 = cc.Vec2.ZERO;
    private cryPos: cc.Vec2 = cc.Vec2.ZERO;
    /**有爆炸效果的子弹id */
    private bulletEIds: number[] = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];

    protected onLoad(): void {
        EffectManager.ins = this;
        this.scheduleOnce(() => {
            this.coinPos = this.coinTarNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
            this.cryPos = this.cryTarNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        })
    }

    /**
     * 生成子弹
     * @param sPos 开始世界坐标
     * @param ePos 结束世界坐标
     * @param bulletId 子弹id
     * @returns 子弹移动到结束位置后
     */
    createBullet(sPos: cc.Vec2, ePos: cc.Vec2, bulletId: number, moveType: Global.BulletMoveType = Global.BulletMoveType.StraightLine) {
        let sLocalPos = this.bulletLayer.convertToNodeSpaceAR(sPos);
        let eLocalPos = this.bulletLayer.convertToNodeSpaceAR(ePos);
        return new Promise((resolve, reject) => {
            AbManager.loadBundleRes(BundleName.Assets, "prefab/bullet/" + bulletId, cc.Prefab).then((pre) => {
                let bullet = MyPool.getObj(pre);
                bullet.parent = this.bulletLayer;
                let bulletSrc = bullet.getComponent(EffectBase);
                this.setEffectMap(bulletSrc);
                bulletSrc.init(bulletId, sLocalPos, eLocalPos, moveType).then((bullet: EffectBase) => {
                    if (this._effectBaseMap.has(bullet.node)) {
                        this._effectBaseMap.delete(bullet.node);
                    }
                    if (this.bulletEIds.includes(bulletId)) {
                        let pos = bullet.node.getPosition();
                        AbManager.loadBundleRes(BundleName.Assets, "prefab/bulletE/" + bulletId, cc.Prefab).then(pre => {
                            let effect = MyPool.getObj(pre);
                            effect.parent = this.bulletLayer;
                            effect.setPosition(pos);
                            let src = effect.getComponent(YanEffect);
                            this.setEffectMap(src);
                            if (src) {
                                src.init().then((yan: YanEffect) => {
                                    if (this._effectBaseMap.has(yan.node)) {
                                        this._effectBaseMap.delete(yan.node);
                                    }
                                    yan.destroySelf();
                                })
                            }
                        })
                    }
                    resolve(bullet);
                    bullet.destroySelf();
                });
            })
        })
    }

    /**
     * 技能特效
     * @param skillConfig 配置
     * @param releaseRole 释放者
     * @param releaseCb 脱手回调
     * @param worldPos 坐标
     * @returns 特效消失
     */
    createSkill(skillConfig: SkillConfig, releaseRole: RoleBase, releaseCb: (effect: EffectBase) => void = null, worldPos: cc.Vec2 = cc.Vec2.ZERO) {
        GamingData.pauseaFightMul();
        let localPos = this.skillLayer.convertToNodeSpaceAR(worldPos);
        return new Promise((resolve, reject) => {
            AbManager.loadBundleRes(BundleName.Assets, "prefab/skill/skill" + skillConfig.type, cc.Prefab).then((pre) => {
                let skill = MyPool.getObj(pre);
                skill.parent = this.skillLayer;
                skill.setPosition(localPos);
                let skillSrc = skill.getComponent(EffectBase);
                this.setEffectMap(skillSrc);
                skillSrc.init(skillConfig.id, releaseRole).then((skill: EffectBase) => {
                    if (this._effectBaseMap.has(skill.node)) {
                        this._effectBaseMap.delete(skill.node);
                    }
                    resolve(null);
                });
                releaseCb && releaseCb(skillSrc);
            })
        })
    }

    /**击败敌人后获得铜币特效 */
    createDrop(itemid: Global.ItemId, num: number, worldPos: cc.Vec2) {
        let localPos = this.dropLayer.convertToNodeSpaceAR(worldPos);
        return new Promise((resolve, reject) => {
            let dropNode = MyPool.getObj(this.dropPre);
            dropNode.parent = this.dropLayer;
            dropNode.setPosition(localPos);
            let dropSrc = dropNode.getComponent(DropBase);
            this.setEffectMap(dropSrc);
            if (dropSrc) {
                dropSrc.init(itemid, num).then((drop: EffectBase) => {
                    if (this._effectBaseMap.has(drop.node)) {
                        this._effectBaseMap.delete(drop.node);
                    }
                    drop.destroySelf();
                    resolve(null);
                })
            }
        })
    }

    /**领取奖励特效 */
    createFlyNode(arg: { id: number, num: number }[], isUpgrade: boolean = false) {
        appContext.flyCameraNode.active = true;
        AudioManager.ins.playEffect(SoundPath.get);
        let promiseArr = [];
        arg.forEach(v => {
            let itemConfig = DataManager.ins.get(ItemConfigMgr).getDataById(v.id);
            if (itemConfig) {
                let ePos = null;
                switch (itemConfig.id) {
                    case Global.ItemId.Coin:
                        ePos = this.coinPos;
                        break;
                    case Global.ItemId.Crystal:
                        ePos = this.cryPos;
                        break;
                }
                if (ePos != null) {
                    let createNum = Math.min(v.num, isUpgrade ? 5 : 8);
                    let numArr = Util.splitIntoRandomShares(v.num, createNum);
                    for (let i = 0; i < createNum; i++) {
                        let flyNode = MyPool.getObj(this.flyPre);
                        let partnerNode = isUpgrade ? this.upgradeFlyArea : this.rewardFlyArea;
                        flyNode.parent = partnerNode;
                        let tarPos = partnerNode.convertToNodeSpaceAR(ePos);
                        // let pos = Util.getRandomPosInRect(area.getBoundingBox());
                        flyNode.setPosition(0, 0);
                        let flySrc = flyNode.getComponent(FlyNode);
                        this.setEffectMap(flySrc, false);
                        if (flySrc) {
                            promiseArr.push(flySrc.init(itemConfig, tarPos, numArr[i], isUpgrade).then((fly: EffectBase) => {
                                if (this._effectBaseMap.has(fly.node)) {
                                    this._effectBaseMap.delete(fly.node);
                                }
                                fly.destroySelf();
                            }));
                        }
                    }
                }
            }
        })
        return Promise.all(promiseArr).then(() => {
            appContext.flyCameraNode.active = false;
            WorldEventManager.triggerEvent(Global.EventEnum.RefreshPlayerInfo);
        });
    }

    /**烟雾特效 */
    createYan(type: number, worldPos: cc.Vec2) {
        let localPos = this.dropLayer.convertToNodeSpaceAR(worldPos);
        return new Promise((resolve, reject) => {
            let yanNode = MyPool.getObj(type == 1 ? this.yanPre : this.yan2Pre);
            yanNode.parent = this.dropLayer;
            yanNode.setPosition(localPos);
            let yanSrc = yanNode.getComponent(YanEffect);
            this.setEffectMap(yanSrc);
            if (yanSrc) {
                yanSrc.init().then((yan: YanEffect) => {
                    if (this._effectBaseMap.has(yan.node)) {
                        this._effectBaseMap.delete(yan.node);
                    }
                    yan.destroySelf();
                    resolve(null);
                })
            }
        })
    }

    setEffectMap(effectBase: EffectBase, isMastOnFight: boolean = true) {
        if (!FightManager.ins.isOnFight && isMastOnFight) {
            effectBase.destroySelf();
        } else {
            this._effectBaseMap.set(effectBase.node, effectBase);
        }
    }

    fightUpdate(dt: number) {

    }

    fightEnd() {
        this._effectBaseMap.forEach(v => {
            v.destroySelf();
        })
        this._effectBaseMap.clear();
    }
}

import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import { BundleName } from "../../../homepage/script/common/BundleName";
import { Global } from "../../../homepage/script/common/Global";
import { Util } from "../../../homepage/script/common/Util";
import { BulletConfigMgr } from "../../../homepage/script/config/BulletConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import Bezier, { BezierData } from "../../../homepage/script/tool/Bezier";
import BulletBase from "../BulletBase";
import EffectBase from "../EffectBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class BoomerangBullet extends BulletBase {

    // @property(cc.Node)
    // animNode: cc.Node = null;

    private moveDir: number = 1;
    private tar1: cc.Vec2 = null;
    private tar2: cc.Vec2 = null;

    init(id: number, sPos: cc.Vec2, ePos: cc.Vec2, moveType: Global.BulletMoveType = Global.BulletMoveType.StraightLine) {
        this.isEnd = true;
        this.unscheduleAllCallbacks();
        this.node.setScale(1);
        this.moveDir = 1;
        return new Promise<EffectBase>((resolve, reject) => {
            this.resolve = resolve;
            this.sPos = sPos;
            this.ePos = ePos;
            this.tar1 = sPos;
            this.tar2 = ePos;
            let config = DataManager.ins.get(BulletConfigMgr).getDataById(id);
            this.speed = config.speed;

            // this.animNode.setScale(config.scale);
            this.node.setPosition(sPos);
            this.node.angle = 0;
            this.dir = ePos.sub(sPos).normalize();
            this.dis = sPos.sub(ePos).mag();
            this.costTime = this.dis / this.speed;
            switch (moveType) {
                case Global.BulletMoveType.StraightLine:
                    let angle = -Util.vectorsToDegress(this.dir);
                    this.node.angle = angle;
                    this.timer = 0;
                    // console.log("this.costTime = ", this.costTime)
                    this.isEnd = false;
                    break;
                case Global.BulletMoveType.Bezier:
                    let c2Pos = Util.lerp(0.9, this.sPos, this.ePos) as cc.Vec2;
                    let dir = sPos.x < ePos.x ? -1 : 1;
                    let dis = sPos.sub(ePos).mag();
                    let mul = dis / 760 * 100;
                    let data = new BezierData();
                    data.c1 = sPos.add(cc.v2(0, 0));
                    data.c2 = c2Pos.add(cc.v2(mul * dir, 20));
                    data.startPos = sPos;
                    data.endPos = ePos;
                    if (this.costTime > 0) {
                        let bezier = this.node.getComponent(Bezier);
                        bezier.runUniformBezierAct(this.costTime, [data], () => {
                            resolve(this);
                        }, 0.6);
                    }
                    break;
            }
        })
    }

    fightUpdate(dt: number) {
        if (this.isEnd) return;
        this.costTime = this.dis / this.speed;
        this.timer += dt;
        if (this.timer / this.costTime >= 1) {
            if (this.moveDir == 1) {
                this.timer = 0;
                this.moveDir = -1;
                this.tar1 = this.ePos;
                this.tar2 = this.sPos;
            } else {
                this.isEnd = true;
                this.resolve(this);
            }
        } else {
            let pos = Util.lerp(this.timer / this.costTime, this.tar1, this.tar2) as cc.Vec2;
            this.node.setPosition(pos);
        }
    }
}

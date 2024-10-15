import GamingData from "../common/GamingData";
import { Global } from "../common/Global";
import { Util } from "../common/Util";
import { WorldEventManager } from "../common/WorldEventManager";


export class BezierData {
    startPos: cc.Vec2;
    c1: cc.Vec2;  // 起点的控制点
    c2: cc.Vec2;  //终点的控制点
    endPos: cc.Vec2;
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bezier extends cc.Component {

    private index: number = 0;
    private costTime: number = 0;
    private allBezierPos: cc.Vec2[] = [];
    private endCb: () => void = null;
    private speed: number = 0;
    private sPos: cc.Vec2 = null;
    private ePos: cc.Vec2 = null;
    private sAngle: number = 0;
    private eAngle: number = 0;
    private totalLineLen: number = 0;
    private duration: number = 0;
    private endScale: number = 0;

    protected onEnable(): void {
        WorldEventManager.addListener(Global.EventEnum.FightMulChange, this.refreshTarget, this);
    }

    protected onDisable(): void {
        WorldEventManager.removeListener(Global.EventEnum.FightMulChange, this.refreshTarget, this);
    }

    // 匀速贝塞尔曲线运动
    runUniformBezierAct(duration: number, bezierDatas: BezierData[], cb: () => void, endScale: number) {
        if (bezierDatas.length <= 0) return
        this.duration = duration;
        this.index = 0;
        this.endCb = cb;
        this.endScale = endScale;
        this.node.stopAllActions();
        this.allBezierPos = [];
        for (let i = 0; i < bezierDatas.length; ++i) {
            let posArr = [bezierDatas[i].startPos, bezierDatas[i].c1, bezierDatas[i].c2, bezierDatas[i].endPos]
            this.allBezierPos = this.allBezierPos.concat(this._caculateBezierPoint(posArr))
        }
        this.totalLineLen = this._caculateBezierLength(this.allBezierPos);
        this.speed = this.totalLineLen / this.duration;
        this.node.setPosition(this.allBezierPos[0]);
        this.refreshTarget();
    }

    private refreshTarget() {
        if (this.index >= this.allBezierPos.length) {
            this.node.stopAllActions();
            this.endCb && this.endCb();
        } else {
            if (GamingData.fightSpeedMul > 0) {
                this.sPos = this.node.getPosition();
                this.ePos = this.allBezierPos[this.index];
                let dis = this.ePos.sub(this.sPos).mag();
                if (dis > 0) {
                    let dir = this.ePos.sub(this.sPos).normalize();
                    this.eAngle = -Util.vectorsToDegress(dir);
                    this.costTime = dis / (this.speed * GamingData.fightSpeedMul);
                    cc.tween(this.node)
                        .to(this.costTime, { x: this.ePos.x, y: this.ePos.y, angle: this.eAngle })
                        .call(() => {
                            this.node.setPosition(this.ePos);
                            this.node.angle = this.eAngle;
                            this.node.scale = 1 - this.index / this.allBezierPos.length * (1 - this.endScale);
                            this.index++;
                            this.refreshTarget();
                        })
                        .start()
                } else {
                    this.index++;
                    this.refreshTarget();
                }
            }
        }
    }

    // 计算所有贝塞尔曲线的点
    private _caculateBezierPoint(posArr: cc.Vec2[]) {
        let allBezierPos = []
        let gap = 1 / 30 // 每次迭代步长,这个值越小越精细,但是效率越低,这里迭代300次已经够了
        for (let i = 0; i <= 1; i += gap) {
            let pos = this._caculateBezierP(posArr, i)
            allBezierPos.push(pos)
        }

        return allBezierPos
    }

    // 计算贝塞尔曲线的长度
    private _caculateBezierLength(allBezierPos: cc.Vec2[]) {
        let totalLineLen = 0
        for (let i = 1; i < allBezierPos.length; ++i) {
            let dis = cc.v2(allBezierPos[i].x - allBezierPos[i - 1].x, allBezierPos[i].y - allBezierPos[i - 1].y).len()
            totalLineLen += dis
        }

        return totalLineLen
    }

    /**
     * 计算三阶贝塞尔在 t时刻 的位置
     * @param p 三阶贝塞尔的四个点,数组对应为 0起点,1起点控制点,2终点控制点,3终点
     * @param t 传入0-1的值,一个时间的迭代过程
     * @returns 
     */
    private _caculateBezierP(p: cc.Vec2[], t: number): cc.Vec2 {
        // 三阶贝塞尔运算
        let bezierP: cc.Vec2 = cc.v2()
        bezierP.x = Math.floor(Math.pow(1 - t, 3) * p[0].x + 3 * t * Math.pow(1 - t, 2) * p[1].x + 3 * Math.pow(t, 2) * (1 - t) * p[2].x + Math.pow(t, 3) * p[3].x);
        bezierP.y = Math.floor(Math.pow(1 - t, 3) * p[0].y + 3 * t * Math.pow(1 - t, 2) * p[1].y + 3 * Math.pow(t, 2) * (1 - t) * p[2].y + Math.pow(t, 3) * p[3].y);
        return bezierP;
    }
}

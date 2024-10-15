import MyPool from "./MyPool";
import { Util } from "./Util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SeqFrameCol extends cc.Component {

    @property(cc.Sprite)
    spr: cc.Sprite = null;

    @property(cc.SpriteFrame)
    spfs: cc.SpriteFrame[] = [];

    @property
    playOnEnable: boolean = false;

    @property
    replayTimes: number = 1;

    @property
    interval: number = 0.1;

    @property
    delayTimeRange: cc.Vec2 = cc.Vec2.ZERO;

    @property
    finishDestroySelf: boolean = false;

    private spfIndex: number = 0;
    private timer: number = 0;
    private isOnAnim: boolean = false;
    private cb: () => void = null;
    private replayTimer: number = 0;
    private isOnDelay: boolean = false;
    private delayTimer: number = 0;
    private delayLength: number = 0;

    protected onEnable(): void {
        if (this.playOnEnable) {
            this.playAnim();
        }
    }

    playAnim() {
        this.spfIndex = 0;
        this.replayTimer = 0;
        this.isOnAnim = false;
        this.timer = 0;
        if (!this.spr) {
            this.spr = this.node.getComponent(cc.Sprite);
        }
        this.spr.spriteFrame = this.spfs[0];
        this.play();
    }

    play(replayTimes: number = null, cb: () => void = null) {
        if (replayTimes != null) {
            this.replayTimes = replayTimes;
        }
        this.isOnAnim = true;
        this.isOnDelay = false;
        this.spfIndex = 0;
        this.replayTimer = 0;
        this.delayTimer = 0;
        this.timer = 0;
        this.delayLength = Util.getRandomFloat(this.delayTimeRange.x, this.delayTimeRange.y);
        this.cb = cb;
        this.refreshSpr();
    }

    private refreshSpr() {
        this.spr.spriteFrame = this.spfs[this.spfIndex];
        this.spfIndex++;
        if (this.spfIndex > this.spfs.length - 1) {
            this.spfIndex = 0;
            this.replayTimer++;
            if (this.replayTimes > 0 && this.replayTimer >= this.replayTimes) {
                this.isOnAnim = false;
                this.cb && this.cb();
                if (this.finishDestroySelf) {
                    MyPool.putObj(this.node);
                }
            } else {
                this.isOnDelay = this.delayLength > 0;
            }
        }
    }

    protected update(dt: number): void {
        if (!this.isOnAnim) {
            return;
        }
        if (this.isOnDelay) {
            this.delayTimer += dt;
            if (this.delayTimer >= this.delayLength) {
                this.isOnDelay = false;
                this.delayTimer = 0;
            }
            return;
        }
        this.timer += dt;
        if (this.timer >= this.interval) {
            this.timer = 0;
            this.refreshSpr();
        }
    }

    reset(): void {
        this.isOnAnim = false;
        this.isOnDelay = false;
        this.spfIndex = 0;
        this.replayTimer = 0;
        this.delayTimer = 0;
        this.timer = 0;
        this.spr.spriteFrame = this.spfs[0];
    }
}

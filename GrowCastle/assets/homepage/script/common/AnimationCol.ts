import MyPool from "./MyPool";

const { ccclass, property } = cc._decorator;

export enum AnimEventEnum {
    PLAY = "play",
    STOP = "stop",
    LASTGFRAME = "lastframe",
    FINISHED = "finished",
    PAUSE = "pause",
    RESUME = "resume"
}

@ccclass
export default class AnimationCol extends cc.Component {

    @property(cc.Animation)
    anim: cc.Animation = null;

    @property
    finishDestroy: boolean = true;

    @property
    repeatTimes: number = 1;

    @property
    speed: number = 1;

    @property
    playOnEnable: boolean = true;

    protected onEnable(): void {
        if (this.playOnEnable) {
            this.play(this.repeatTimes, this.speed);
        }
    }

    play(repeatTimes?: number, speed: number = 1, cb: () => void = null) {
        if (!repeatTimes || !Number.isInteger(repeatTimes)) {
            repeatTimes = this.repeatTimes;
        }
        let animState = this.anim.play();
        let endCb = () => {
            cb && cb();
        }
        if (this.finishDestroy) {
            endCb = () => {
                cb && cb();
                this.destroySelf();
            }
        }
        this.anim.once(AnimEventEnum.FINISHED, endCb, this);
        animState.speed = speed;
        if (repeatTimes >= 999) {
            animState.wrapMode = cc.WrapMode.Loop;
        } else if (this.repeatTimes > 1) {
            animState.repeatCount = repeatTimes;
        }
    }

    destroySelf() {
        // this.node.destroy();
        MyPool.putObj(this.node);
    }
}

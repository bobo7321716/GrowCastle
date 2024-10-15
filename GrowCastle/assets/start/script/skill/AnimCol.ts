const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimCol extends cc.Component {

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property(dragonBones.ArmatureDisplay)
    dragon: dragonBones.ArmatureDisplay = null;

    protected onLoad(): void {
        if (this.dragon) {
            this.dragon.premultipliedAlpha = false;
            this.dragon.enableBatch = true;
        }
        if (!this.spine) {
            this.spine = this.node.getComponent(sp.Skeleton);
        }
        if (!this.dragon) {
            this.dragon = this.node.getComponent(dragonBones.ArmatureDisplay);
        }
    }

    public get isPlaying() {
        return (this.spine && this.spine.animation != null) || (this.dragon && this.dragon.animationName != null)
    }

    public play(animName: string = null, timeScale = 1, loopTimes: number = 0, endCb: () => void = null): Promise<void> {
        return new Promise((resolve, reject) => {
            let loopTimer: number = 0;
            let completeCall = () => {
                loopTimer++;
                if (loopTimer >= loopTimes || loopTimes == 0) {
                    this.dragon && this.dragon.removeEventListener(dragonBones.EventObject.COMPLETE, completeCall, this);
                    resolve(null);
                } else {
                    this.spine.timeScale = timeScale;
                    let name = animName ? animName : this.spine.defaultAnimation;
                    this.spine.setAnimation(0, name, loopTimes == 0);
                }
            }
            if (this.spine) {
                endCb && this.spine.setEndListener(endCb);
                this.spine.setCompleteListener(completeCall);
                this.spine.timeScale = timeScale;
                let name = animName ? animName : this.spine.defaultAnimation;
                this.spine.setAnimation(0, name, loopTimes == 0);
            } else if (this.dragon) {
                this.dragon.timeScale = timeScale;
                this.dragon.addEventListener(dragonBones.EventObject.COMPLETE, completeCall, this);
                let name = animName ? animName : this.dragon.animationName;
                this.dragon.playAnimation(name, loopTimes);
            } else {
                resolve(null);
            }
        })
    }
}

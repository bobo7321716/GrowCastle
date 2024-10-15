
const { ccclass, property } = cc._decorator;

@ccclass
export default class ScaleAnim extends cc.Component {

    @property({ displayName: "动画时长" })
    animTime: number = 1;

    @property({ displayName: "等待时长" })
    delayTime: number = 1;

    @property({ displayName: "缩放值" })
    scaleNum: number = 1;

    @property({ displayName: "初始缩放值" })
    initScaleNum: number = 1;

    @property
    playOnEnable: boolean = false;

    protected onEnable(): void {
        if (this.playOnEnable) {
            this.init();
        }
    }

    public init(): void {
        this.node.stopAllActions();
        this.node.scale = this.initScaleNum;
        cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .to(this.animTime, { scale: this.scaleNum * this.initScaleNum })
                    .delay(this.delayTime)
                    .to(this.animTime, { scale: this.initScaleNum })
            )
            .start()
    }
}

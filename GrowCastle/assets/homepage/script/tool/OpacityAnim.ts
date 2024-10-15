
const { ccclass, property } = cc._decorator;

@ccclass
export default class OpacityAnim extends cc.Component {

    @property({ displayName: "动画时长" })
    animTime: number = 1;

    @property({ displayName: "等待时长" })
    delayTime: number = 1;

    @property({ displayName: "目标值" })
    tarNum: number = 120;

    @property({ displayName: "初始值" })
    initNum: number = 255;

    @property
    playOnEnable: boolean = false;

    protected onEnable(): void {
        if (this.playOnEnable) {
            this.init();
        }
    }

    public init(): void {
        this.node.stopAllActions();
        this.node.opacity = this.initNum;
        cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .to(this.animTime, { opacity: this.tarNum })
                    .delay(this.delayTime)
                    .to(this.animTime, { opacity: this.initNum })
            )
            .start()
    }
}

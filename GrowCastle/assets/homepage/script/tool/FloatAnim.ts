
const { ccclass, property } = cc._decorator;

@ccclass
export default class FloatAnim extends cc.Component {

    @property
    time: number = 2;

    @property
    dis: number = 10;

    private oriPos: cc.Vec2 = null;

    onLoad() {
        this.oriPos = this.node.getPosition();
    }

    protected onEnable(): void {
        this.node.stopAllActions();
        cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .by(this.time / 4, { y: -this.dis / 2 }, { easing: "sineOut" })
                    .by(this.time / 4, { y: this.dis / 2 }, { easing: "sineIn" })
                    .by(this.time / 4, { y: this.dis / 2 }, { easing: "sineOut" })
                    .by(this.time / 4, { y: -this.dis / 2 }, { easing: "sineIn" })
            )
            .start()
    }

    protected onDisable(): void {
        this.node.setPosition(this.oriPos);
    }
}

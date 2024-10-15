
const { ccclass, property } = cc._decorator;

@ccclass
export default class AwayAnim extends cc.Component {

    protected start(): void {
        this.node.stopAllActions();
        cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .repeat(2,
                        cc.tween()
                            .to(0.2, { angle: 10 })
                            .to(0.2, { angle: -10 })
                            .to(0.1, { angle: 0 })
                    )
                    .delay(1)
            )
            .start();
    }
}


const { ccclass, property } = cc._decorator;

@ccclass
export default class Tail extends cc.Component {

    private motion: cc.MotionStreak = null;

    onEnable(): void {
        this.motion = this.node.getComponent(cc.MotionStreak);
        this.scheduleOnce(() => {
            this.motion.reset();

            let mat4 = cc.mat4();

            let matrix = this.node.getWorldMatrix(mat4);

            let tx = matrix.m[12],

                ty = matrix.m[13];

            //@ts-ignore
            this.motion._lastWPos.x = tx;

            //@ts-ignore
            this.motion._lastWPos.y = ty;
        });
    }

    protected onDisable(): void {
        this.motion.reset();
    }

}

import AnimCol from "../AnimCol";
import EffectAnim from "./EffectAnim";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Skill10Anim extends EffectAnim {

    @property(AnimCol)
    animCol: AnimCol = null;

    play(): Promise<any> {
        this.node.opacity = 255;
        return new Promise((resolve, reject) => {
            cc.tween(this.node)
                .call(() => {
                    this.animCol.play().then(() => {
                        this.node.opacity = 0;
                        resolve(null);
                    })
                })
                .start()
        })
    }
}

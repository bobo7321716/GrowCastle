import GamingData from "../../../../homepage/script/common/GamingData";
import AnimCol from "../AnimCol";
import EffectAnim from "./EffectAnim";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Skill4Anim extends EffectAnim {

    @property(AnimCol)
    animCol: AnimCol = null;

    play(): Promise<any> {
        this.node.y = 500
        this.node.stopAllActions();
        this.animCol.play(null, 0.7 * GamingData.fightSpeedMul, 1);
        return new Promise((resolve, reject) => {
            cc.tween(this.node)
                .to(0.7 / GamingData.fightSpeedMul, { y: -100 })
                .call(resolve)
                .start()
        })
    }
}

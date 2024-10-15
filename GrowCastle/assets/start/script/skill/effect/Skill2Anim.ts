import GamingData from "../../../../homepage/script/common/GamingData";
import AnimCol from "../AnimCol";
import EffectAnim from "./EffectAnim";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Skill2Anim extends EffectAnim {

    @property(AnimCol)
    animCol: AnimCol = null;

    play(): Promise<any> {
        this.animCol.play("feidao", GamingData.fightSpeedMul);
        this.node.setScale(0);
        this.node.stopAllActions();
        let dur = 0.5 / GamingData.fightSpeedMul;
        return new Promise((resolve, reject) => {
            cc.tween(this.node)
                .to(dur, { scale: 1 })
                .call(resolve)
                .start()
        })
    }
}

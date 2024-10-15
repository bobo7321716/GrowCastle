import MyPool from "../../homepage/script/common/MyPool";
import EffectBase from "./EffectBase";
import AnimCol from "./skill/AnimCol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class YanEffect extends EffectBase {

    @property(AnimCol)
    animCol: AnimCol[] = [];

    @property
    playTimes: number = 1;

    init(...arg: any[]): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.animCol.forEach(v => {
                v.play(null, 1, this.playTimes).then(() => {
                    resolve(this);
                });
            })
        })
    }

    destroySelf() {
        MyPool.putObj(this.node);
    }
}

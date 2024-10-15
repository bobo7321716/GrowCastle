import MyPool from "../../homepage/script/common/MyPool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EffectBase extends cc.Component {

    init(...arg) {
        return new Promise((resolve, reject) => { })
    }

    fightUpdate(dt: number) {

    }

    destroySelf() {
        MyPool.putObj(this.node);
    }

    delayDestorySelf() {
        this.scheduleOnce(() => {
            this.destroySelf();
        }, 0.3)
    }
}

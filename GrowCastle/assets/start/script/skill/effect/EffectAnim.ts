
const { ccclass, property } = cc._decorator;

@ccclass
export default class EffectAnim extends cc.Component {

    play() {
        return Promise.resolve(null);
    }
}

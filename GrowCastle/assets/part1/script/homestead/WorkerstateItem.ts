// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class WorkerstateItem extends cc.Component {


    @property(cc.Node)
    lock: cc.Node = null;

    @property(cc.Label)
    levelLabel: cc.Label = null;

    /**控制解锁效果 */
    init(_level: number) {
        this.lock.active = _level == 0;
        this.levelLabel.node.active = _level != 0;
        this.levelLabel.string = `Lv.${_level}`;
    }

}

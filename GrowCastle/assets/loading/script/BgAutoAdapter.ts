/**使当前节点始终填满屏幕 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class BgAutoAdapter extends cc.Component {

    protected onEnable(): void {
        this.adapter();
    }

    adapter() {
        let visSize = cc.view.getVisibleSize();
        if (visSize.height > this.node.height) {
            let scale = visSize.height / this.node.height;
            this.node.setScale(scale);
        }
    }
}

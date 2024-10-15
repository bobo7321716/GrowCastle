
const { ccclass, property } = cc._decorator;

@ccclass
export default class BoundingBox extends cc.Component {

    private boundingBox: cc.Rect = null;

    protected onDisable(): void {
        this.boundingBox = null;
    }

    getBoundingBoxToWorld() {
        if (!this.boundingBox) {
            this.boundingBox = this.node.getBoundingBoxToWorld();
        }
        return this.boundingBox;
    }
}

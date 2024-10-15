import { AbManager } from "./AbManager";

//记录需要释放的资源
const { ccclass, property } = cc._decorator;

@ccclass
export default class AbRef extends cc.Component {

    assetArr: { uuid: string, refCount: number }[] = [];

    private _spriteFrame: cc.SpriteFrame = null;
    public get spriteFrame(): cc.SpriteFrame {
        return this._spriteFrame;
    }
    public set spriteFrame(value: cc.SpriteFrame) {
        this._spriteFrame = value;
        let spr = this.node.getComponent(cc.Sprite);
        if (!spr) return;
        spr.spriteFrame = value;
        if (value) {
            let obj = this.assetArr.find(v => v.uuid == value._uuid);
            if (!obj) {
                obj = { uuid: value._uuid, refCount: 0 };
                this.assetArr.push(obj);
            }
            obj.refCount++;
        }
    }

    decRef() {
        this.assetArr.forEach(v => {
            AbManager.decRef(v.uuid, v.refCount);
        })
        this.assetArr = [];
    }
}

import { BundleName } from "../../homepage/script/common/BundleName";
import { Global } from "../../homepage/script/common/Global";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import EffectBase from "./EffectBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DropBase extends EffectBase {

    @property(cc.Sprite)
    spr: cc.Sprite = null;

    @property(cc.Label)
    numLab: cc.Label = null;

    init(id: Global.ItemId, num: number) {
        this.node.stopAllActions();
        this.node.opacity = 255;
        this.numLab.string = Math.floor(num) + "";
        return new Promise((resolve, reject) => {
            AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + id, cc.SpriteFrame).then((spf) => {
                this.spr.spriteFrame = spf;
                cc.tween(this.node)
                    .delay(0.3)
                    .by(0.5, { y: 30, opacity: -255 })
                    .call(() => {
                        resolve(this);
                    })
                    .start()
            })
        })
    }


}

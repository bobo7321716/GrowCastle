import { BundleName } from "../../homepage/script/common/BundleName";
import { UiBase } from "../../homepage/script/common/UiBase";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import AbRef from "../../homepage/script/common/asssetsBundle/AbRef";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Test extends UiBase {

    @property(AbRef)
    abRef: AbRef = null;

    init() {
        console.log("StartBoard")
        AbManager.loadBundleRes(BundleName.Part1, "res/package/bb_bt", cc.SpriteFrame).then((spf) => {
            this.abRef.spriteFrame = spf;
        })
    }
}

import { BundleName } from "../../homepage/script/common/BundleName";
import { Util } from "../../homepage/script/common/Util";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import ItemConfig from "../../homepage/script/config/ItemConfig";
import EffectBase from "../../start/script/EffectBase";
import InfoCol from "./InfoCol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FlyNode extends EffectBase {

    @property(cc.Sprite)
    iconSpr: cc.Sprite = null;

    init(itemConfig: ItemConfig, ePos: cc.Vec2, num: number, isUpgrade: boolean) {
        this.node.stopAllActions();
        this.node.opacity = 255;
        return new Promise((resolve, reject) => {
            if (!itemConfig) return resolve(this);
            AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + itemConfig.id, cc.SpriteFrame).then(spf => {
                this.iconSpr.spriteFrame = spf;
                let time = Util.getRandomFloat(0.3, 0.5);
                let sPos = this.node.getPosition();
                let tarY = sPos.y - Util.getRandomFloat(isUpgrade ? -100 : -200, 0);
                let tarX = sPos.x + Util.getRandomFloat(10, isUpgrade ? 100 : 250);
                let dir = this.node.x > 0 ? 1 : this.node.x < 0 ? -1 : Math.random() < 0.5 ? -1 : 1;
                let c2 = cc.v2(dir * tarX / 2, isUpgrade ? 100 : 200);
                let bTarPos = cc.v2(dir * tarX, tarY);
                cc.tween(this.node)
                    .bezierTo(0.4, sPos, c2, bTarPos)
                    .delay(0.5)
                    .to(time, { x: ePos.x, y: ePos.y })
                    .call(() => {
                        this.node.opacity = 0;
                        InfoCol.ins.playGetAnim({ id: itemConfig.id, num: num, resolve: () => { resolve(this); } });
                    })
                    .start()
            })
        })
    }
}

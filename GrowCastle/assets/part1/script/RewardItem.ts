import { BundleName } from "../../homepage/script/common/BundleName";
import { Global } from "../../homepage/script/common/Global";
import MyPool from "../../homepage/script/common/MyPool";
import { Util } from "../../homepage/script/common/Util";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import { ItemConfigMgr } from "../../homepage/script/config/ItemConfig";
import DataManager from "../../homepage/script/manager/DataManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RewardItem extends cc.Component {

    @property(cc.Label)
    numLab: cc.Label = null;

    @property(cc.Sprite)
    iconSpr: cc.Sprite = null;

    init(arg: { id: number, num: number }) {
        if (!arg) return;
        AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + arg.id, cc.SpriteFrame).then(spf => {
            this.iconSpr.spriteFrame = spf;
        })
        this.numLab.string = Util.getFormatValueStr(arg.num);
        let itemData = DataManager.ins.get(ItemConfigMgr).getDataById(arg.id);
        this.numLab.node.active = itemData.type != Global.ItemType.Hero;
    }

    destroySelf() {
        MyPool.putObj(this.node);
    }
}

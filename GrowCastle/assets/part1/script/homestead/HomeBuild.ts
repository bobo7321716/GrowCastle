// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { AudioManager } from "../../../homepage/script/common/AudioManager";
import { BundleName } from "../../../homepage/script/common/BundleName";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiPath } from "../../../homepage/script/common/UiPath";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import HomeAttributeConfig from "../../../homepage/script/config/HomeAttributeConfig";
import HomeBuildShopDialog from "./HomeBuildShopDialog";

const { ccclass, property } = cc._decorator;
/**地基 */
@ccclass
export default class HomeBuild extends cc.Component {


    /**需要在面板上手动输入 */
    @property()
    pos: number = 0;
    @property(cc.Sprite)
    buildIcon: cc.Sprite = null;

    @property(cc.Node)
    block: cc.Node = null;
    init(_config: HomeAttributeConfig) {
        this.buildIcon.node.active = true;
        this.block.active = false;
        AbManager.loadBundleRes(BundleName.Part1, "res/homestead/" + _config.icon, cc.SpriteFrame).then(_res => {
            this.buildIcon.spriteFrame = _res;
        }
        )
    }

    /**设为空地 */
    setBlock() {
        this.buildIcon.spriteFrame = null;
        this.buildIcon.node.active = false;
        this.block.active = true;
    }



    /**点击建筑物 */
    btnBuildClick() {
        //没有锁才能打开
        UIManager.ins.openView(UiPath.HomeBuildShopDialog).then((_dialog: HomeBuildShopDialog) => {
            _dialog.init(this.pos);
        })
        AudioManager.ins.playClickAudio();
    }
}

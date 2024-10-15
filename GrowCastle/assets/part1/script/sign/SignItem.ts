import { BundleName } from "../../../homepage/script/common/BundleName";
import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { Util } from "../../../homepage/script/common/Util";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import SignConfig, { SignConfigMgr } from "../../../homepage/script/config/SignConfig";
import DataManager from "../../../homepage/script/manager/DataManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SignItem extends cc.Component {

    @property(cc.Node)
    openNode: cc.Node = null;

    @property(cc.Node)
    getedNodes: cc.Node[] = [];

    @property(cc.Sprite)
    iconSprs: cc.Sprite[] = [];

    @property(cc.Label)
    dayLab: cc.Label = null;

    @property(cc.Label)
    numLabd: cc.Label[] = [];

    private clickCb: () => void = null;
    private config: SignConfig = null;

    init(config: SignConfig, clickCb: () => void) {
        if (!config) return;
        this.config = config;
        this.clickCb = clickCb;
        config.reward.forEach((v, k) => {
            AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + v.id, cc.SpriteFrame).then((spf) => {
                this.iconSprs[k].spriteFrame = spf;
            })
            this.numLabd[k].string = "+" + Util.getFormatValueStr(v.num);
        })
        this.dayLab.string = "第" + this.config.id + "天";
        this.refreshState();
    }

    refreshState() {
        let state = Global.State.LOCK;
        if (this.config.id > PlayerData.ins.signDay && this.config.id <= PlayerData.ins.totalLoginDays) {
            state = Global.State.UNLOCK;
        } else if (this.config.id <= PlayerData.ins.signDay) {
            state = Global.State.GETED;
        }
        this.openNode.active = state == Global.State.UNLOCK;
        this.getedNodes.forEach(v => {
            v.active = state == Global.State.GETED;
        })
    }

    signClick() {
        this.clickCb && this.clickCb();
    }
}

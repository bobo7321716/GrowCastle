
import { AudioManager } from "../../homepage/script/common/AudioManager";
import { Global } from "../../homepage/script/common/Global";
import MyPool from "../../homepage/script/common/MyPool";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { SoundPath } from "../../homepage/script/common/SoundPath";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import EffectManager from "../../start/script/EffectManager";
import RewardItem from "./RewardItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RewardView extends UiBase {

    @property(cc.Node)
    itemContent: cc.Node = null;

    @property(cc.Prefab)
    itemPre: cc.Prefab = null;

    private itemSrcs: RewardItem[] = [];
    private reward: { id: number, num: number }[] = [];
    private resolve: (arg: { id: number, num: number }[]) => void = null;

    init(arg: { id: number, num: number }[], isGet: boolean = true) {
        isGet && arg.forEach(v => {
            PlayerData.ins.changeItemNum(v.id, v.num, false);
        })
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reward = arg;
            arg.forEach(v => {
                let item = MyPool.getObj(this.itemPre);
                item.parent = this.itemContent;
                let itemSrc = item.getComponent(RewardItem);
                if (itemSrc) {
                    itemSrc.init(v);
                    this.itemSrcs.push(itemSrc);
                }
            })
            for (let i = 0; i < this.reward.length; i++) {
                let obj = this.reward[i];
                if (obj.id == Global.ItemId.Coin || obj.id == Global.ItemId.Crystal) {
                    AudioManager.ins.playEffect(SoundPath.reward_get);
                }
            }
        })
    }

    protected onDisable(): void {
        this.itemSrcs.forEach(v => {
            v.destroySelf();
        })
        this.itemSrcs = [];
        EffectManager.ins.createFlyNode(this.reward).then(() => {
            this.resolve && this.resolve(this.reward);
        });
    }

    closeClick() {
        UIManager.ins.closeView(true);
    }
}

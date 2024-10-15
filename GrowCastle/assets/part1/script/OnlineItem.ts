
import { AudioManager } from "../../homepage/script/common/AudioManager";
import { BundleName } from "../../homepage/script/common/BundleName";
import { Global } from "../../homepage/script/common/Global";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import TipManager from "../../homepage/script/common/TipManager";
import { Util } from "../../homepage/script/common/Util";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import OnlinerewardConfig from "../../homepage/script/config/OnlinerewardConfig";
import RedPointManager from "../../homepage/script/manager/RedPointManager";
import ProgressCol from "../../start/script/ProgressCol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OnlineItem extends cc.Component {

    @property(cc.Sprite)
    iconSpr: cc.Sprite = null;

    @property(cc.Label)
    descLab: cc.Label = null;

    @property(cc.Label)
    numLab: cc.Label = null;

    @property(ProgressCol)
    progressCol: ProgressCol = null;

    @property(cc.Node)
    stateNodes: cc.Node[] = [];

    private config: OnlinerewardConfig = null;
    private interval: number = 0;

    protected onDisable(): void {
        clearInterval(this.interval);
    }

    init(config: OnlinerewardConfig) {
        if (!config) return;
        this.config = config;
        AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + this.config.reward[0].id, cc.SpriteFrame).then(spf => {
            this.iconSpr.spriteFrame = spf;
        })
        this.descLab.string = "在线" + this.config.time + "分钟";
        this.numLab.string = "x" + Util.getFormatValueStr(this.config.reward[0].num);
        this.progressCol.init(this.config.time);
        this.refreshState();
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.refreshState();
        }, 1000)
    }

    refreshState() {
        let curTime = Math.floor(PlayerData.ins.todayOnlineDuration / 60000);
        this.progressCol.setCurNum(curTime);
        let state = Global.State.LOCK;
        if (PlayerData.ins.todayGetedOnlineRewardIds.includes(this.config.id)) {
            state = Global.State.GETED;
        } else {
            state = curTime >= this.config.time ? Global.State.UNLOCK : Global.State.LOCK;
        }
        this.stateNodes.forEach((v, k) => {
            v.active = k == state;
        })
        if (state == Global.State.UNLOCK) {
            RedPointManager.ins.checkRedPoint();
        }
    }

    getRewardClick() {
        PlayerData.ins.getOnlineReward(this.config);
        this.refreshState();
        RedPointManager.ins.checkRedPoint();
        AudioManager.ins.playClickAudio();
    }

    lockClick() {
        TipManager.ins.showTip("奖励未解锁");
        AudioManager.ins.playClickAudio();
    }
}

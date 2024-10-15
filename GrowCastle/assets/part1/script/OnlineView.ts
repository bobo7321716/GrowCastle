import { PlayerData } from "../../homepage/script/common/PlayerData";
import { UiBase } from "../../homepage/script/common/UiBase";
import OnlinerewardConfig, { OnlinerewardConfigMgr } from "../../homepage/script/config/OnlinerewardConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import RecycleScrollV from "../../homepage/script/scrollview/RecycleScrollV";
import OnlineItem from "./OnlineItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OnlineView extends UiBase {

    @property(RecycleScrollV)
    rsScroll: RecycleScrollV = null;

    private datas: OnlinerewardConfig[] = [];

    protected onEnable(): void {
        this.init();
    }

    init() {
        this.datas = DataManager.ins.get(OnlinerewardConfigMgr).datas;
        this.rsScroll.numItems = this.datas.length;
        this.rsScroll.onItemRender = this.onItemRender.bind(this);
        let curTime = Math.floor(PlayerData.ins.todayOnlineDuration / 60000);
        let index = this.datas.findIndex(v => v.time <= curTime && !PlayerData.ins.todayGetedOnlineRewardIds.includes(v.id));
        if (index >= 0) this.rsScroll.rollItemByIndex(index);
    }

    onItemRender(index: number, node: cc.Node) {
        let item = node.getComponent(OnlineItem);
        if (!item) return;
        item.init(this.datas[index]);
    }
}

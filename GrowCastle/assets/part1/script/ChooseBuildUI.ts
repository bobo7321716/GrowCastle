
import GamingData from "../../homepage/script/common/GamingData";
import MyPool from "../../homepage/script/common/MyPool";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import BuildConfig, { BuildConfigMgr } from "../../homepage/script/config/BuildConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import GuideManager from "../../homepage/script/manager/GuideManager";
import RecycleScrollV from "../../homepage/script/scrollview/RecycleScrollV";
import FightMap from "../../start/script/FightMap";
import BuildItem from "./BuildItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseBuildUI extends UiBase {

    @property(RecycleScrollV)
    rsScroll: RecycleScrollV = null;

    private datas: BuildConfig[] = [];
    private pos: number = 0;

    init(pos: number) {
        let data = DataManager.ins.get(BuildConfigMgr);
        if (!data) return;
        this.refresh(pos);
    }

    refresh(pos: number) {
        this.pos = pos;
        let configData = DataManager.ins.get(BuildConfigMgr)
        let unlockInfos = PlayerData.ins.unlockBuildInfos;
        if (unlockInfos.length <= 0) {
            this.datas = configData.datas;
        } else {
            this.datas = [];
            unlockInfos.forEach(v => {
                if (v.atkPos >= 0) {
                    let data = configData.getDataById(v.id);
                    if (data.position == pos) {
                        this.datas.push(data);
                    }
                }
            })
            configData.datas.forEach(v => {
                if (!this.datas.includes(v) && v.position == pos) {
                    this.datas.push(v);
                }
            });
        }
        this.rsScroll.numItems = this.datas.length;
        this.rsScroll.onItemRender = this.onItemRender.bind(this);
    }

    onItemRender(index: number, node: cc.Node) {
        let item = node.getComponent(BuildItem);
        if (!item) return;
        item.init(this.datas[index].id);
    }

    public onOpenFinish(): void {
        super.onOpenFinish();
        if (GamingData.isOnGuide) {
            GuideManager.ins.showCurGuide();
        }
    }

    public onOpen(): void {
        this.refresh(this.pos);
    }

    public onClose(): void {
        FightMap.ins.refreshBaseArr();
    }
}

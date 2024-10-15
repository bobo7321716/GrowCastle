
import GamingData from "../../homepage/script/common/GamingData";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import HeroConfig, { HeroConfigMgr } from "../../homepage/script/config/HeroConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import GuideManager from "../../homepage/script/manager/GuideManager";
import RecycleScrollV from "../../homepage/script/scrollview/RecycleScrollV";
import FightMap from "../../start/script/FightMap";
import HeroItem from "./HeroItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseHeroUI extends UiBase {

    @property(RecycleScrollV)
    rsScroll: RecycleScrollV = null;

    private datas: HeroConfig[] = [];

    init() {
        let data = DataManager.ins.get(HeroConfigMgr);
        if (!data) return;
        this.refresh();
    }

    refresh() {
        let configData = DataManager.ins.get(HeroConfigMgr)
        let unlockInfos = PlayerData.ins.unlockHeroInfos;
        if (unlockInfos.length <= 0) {
            this.datas = configData.datas;
        } else {
            this.datas = [];
            unlockInfos.forEach(v => {
                if (v.atkPos >= 0) {
                    let data = configData.getDataById(v.id);
                    this.datas.push(data);
                }
            })
            configData.datas.forEach(v => {
                if (!this.datas.includes(v)) {
                    this.datas.push(v);
                }
            });
        }
        this.rsScroll.numItems = this.datas.length;
        this.rsScroll.onItemRender = this.onItemRender.bind(this);
    }

    onItemRender(index: number, node: cc.Node) {
        let item = node.getComponent(HeroItem);
        if (!item) return;
        item.init(this.datas[index].id);
    }

    public onOpenFinish(): void {
        super.onOpenFinish();
        if (GamingData.isOnGuide && PlayerData.ins.guideGroup == 3 && PlayerData.ins.guideStep == 1) {
            GuideManager.ins.showCurGuide();
        }
    }

    public onOpen(): void {
        this.refresh();
    }

    public onClose(): void {
        FightMap.ins.refreshBaseArr();
    }

}

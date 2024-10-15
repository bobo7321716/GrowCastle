import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiPath } from "../../../homepage/script/common/UiPath";
import GuideConfig, { GuideConfigMgr } from "../../../homepage/script/config/GuideConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import StoryView from "../../../part1/script/story/StoryView";
import GuideView from "../../../start/script/guide/GuideView";
import GamingData from "../common/GamingData";
import SceneEventManager from "./SceneEventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideManager extends cc.Component {

    public static ins: GuideManager = null;

    private curConfig: GuideConfig = null;

    protected onLoad(): void {
        GuideManager.ins = this;
    }

    init() {
        if (!GamingData.isOnGuide) {
            if (PlayerData.ins.checkSignReward().length > 0) {
                UIManager.ins.openView(UiPath.SignUI);
            }
            return;
        }
        if (PlayerData.ins.guideGroup == 0 || PlayerData.ins.guideGroup == 3) {
            PlayerData.ins.guideStep = 0;
        }

        PlayerData.ins.saveData();
        this.showCurGuide();
    }

    private refreshGuide() {
        if (!GamingData.isOnGuide) return;
        if (!this.curConfig) {
            if (PlayerData.ins.checkSignReward().length > 0) {
                UIManager.ins.openView(UiPath.SignUI);
            }
            return;
        }
        if (GamingData.jumpGuideGroup != PlayerData.ins.guideGroup) {
            UIManager.ins.openView(UiPath.GuideView).then((view: GuideView) => {
                view.showGuide(this.curConfig);
            })
        }
    }

    showCurGuide() {
        if (!GamingData.isOnGuide) return;
        if (PlayerData.ins.guideStep == 0 && GamingData.jumpGuideGroup != PlayerData.ins.guideGroup) {
            UIManager.ins.openView(UiPath.StoryView).then((view: StoryView) => {
                view.init(PlayerData.ins.guideGroup).then(() => {
                    this.curConfig = DataManager.ins.get(GuideConfigMgr).getGuideConfig(PlayerData.ins.guideGroup, PlayerData.ins.guideStep);
                    this.refreshGuide();
                })
            })
            return;
        }
        this.refreshGuide();
    }

    /**完成当前步骤 */
    nextStep(isAddStep: boolean = true) {
        // console.warn("nextStep")
        isAddStep && PlayerData.ins.guideStep++;
        // let guideArr = DataManager.ins.get(GuideConfigMgr).getGroupArr(PlayerData.ins.guideGroup);
        // if (guideArr.length > 0 && PlayerData.ins.guideStep >= guideArr.length) {
        //     PlayerData.ins.guideStep = 0;
        // }
        PlayerData.ins.saveData();
        // let isAutoNext = this.curConfig.isAutoNext == 1;
        UIManager.ins.closeViewByBundleData(UiPath.GuideView);
        this.curConfig = DataManager.ins.get(GuideConfigMgr).getGuideConfig(PlayerData.ins.guideGroup, PlayerData.ins.guideStep);
        if (!this.curConfig) {
            let isEnd = this.nextGroup();
            if (!isEnd) {
                this.curConfig = DataManager.ins.get(GuideConfigMgr).getGuideConfig(PlayerData.ins.guideGroup, PlayerData.ins.guideStep);
            }
        } else {
            if (this.curConfig && this.curConfig.isAutoNext == 1) {
                this.showCurGuide();
            }
        }
    }

    private nextGroup() {
        GamingData.jumpGuideGroup = null;
        PlayerData.ins.guideStep = 0;
        PlayerData.ins.guideGroup++;
        PlayerData.ins.saveData();
        if (PlayerData.ins.guideGroup >= 4) {
            console.log("引导结束")
            GamingData.isOnGuide = false;
            SceneEventManager.ins.addSceneEvent(UiPath.MainView, "checkSign");
        }
        return PlayerData.ins.guideGroup >= 4;
    }

    lastGuide() {
        if (GamingData.jumpGuideGroup != null) return;
        switch (PlayerData.ins.guideGroup) {
            case 0:
                // PlayerData.ins.guideStep = 0;
                break;
            case 1:
                PlayerData.ins.guideGroup = 0;
                PlayerData.ins.guideStep = 0;
                break;
            case 2:
                PlayerData.ins.guideGroup = 1;
                PlayerData.ins.guideStep = 1;
                break;
            case 3:
                PlayerData.ins.guideGroup = 2;
                PlayerData.ins.guideStep = 1;
                break;
        }
        PlayerData.ins.saveData();
        this.curConfig = DataManager.ins.get(GuideConfigMgr).getGuideConfig(PlayerData.ins.guideGroup, PlayerData.ins.guideStep);
        this.refreshGuide();
    }

    jumpGuide() {
        GamingData.jumpGuideGroup = PlayerData.ins.guideGroup;
        // PlayerData.ins.guideStep = 0;
        // PlayerData.ins.guideGroup++;
        GamingData.isOnGuide = PlayerData.ins.guideGroup < 4;
        if (GamingData.isOnGuide) {
            this.curConfig = DataManager.ins.get(GuideConfigMgr).getGuideConfig(PlayerData.ins.guideGroup, PlayerData.ins.guideStep);
        }
        PlayerData.ins.saveData();
        UIManager.ins.closeViewByBundleData(UiPath.GuideView);
    }
}

import RewardView from "../../../part1/script/RewardView";
import { BundleName } from "../common/BundleName";
import { Global } from "../common/Global";
import { PlayerData } from "../common/PlayerData";
import { UIManager } from "../common/UIManager";
import { UiPath } from "../common/UiPath";
import { WorldEventManager } from "../common/WorldEventManager";
import { AbManager } from "../common/asssetsBundle/AbManager";
import TaskConfig, { TaskConfigMgr } from "../config/TaskConfig";
import { TasktypeConfigMgr } from "../config/TasktypeConfig";
import DataManager from "./DataManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskManager extends cc.Component {

    @property(cc.Label)
    descLab: cc.Label = null;

    @property(cc.Label)
    rewardLab: cc.Label = null;

    @property(cc.Sprite)
    rewardIconSpr: cc.Sprite = null;

    @property(cc.Node)
    redPointNode: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    endNode: cc.Node = null;

    public static ins: TaskManager = null;

    private taskConfig: TaskConfig = null;
    private isFinish: boolean = false;

    protected onLoad(): void {
        TaskManager.ins = this;
    }

    protected onEnable(): void {
        this.refreshTask(PlayerData.ins.taskInfo);
    }

    /**检查更新任务进度 */
    checkRefreshTaskProgress(taskType: Global.TaskType, addPro: number = 1) {
        let info = PlayerData.ins.taskInfo;
        let taskConfig = DataManager.ins.get(TaskConfigMgr).getDataById(info.id);
        if (!taskConfig) return;
        if (taskConfig.type != taskType) return;
        let progress = 0;
        switch (taskType) {
            case Global.TaskType.PassLv:
                progress = PlayerData.ins.wave;
                break;
            case Global.TaskType.UpgradeArcher:
                progress = PlayerData.ins.archerLv;
                break;
            case Global.TaskType.UpgradeCastle:
                progress = PlayerData.ins.carstelLv;
                break;
            case Global.TaskType.UnlockHero:
                PlayerData.ins.unlockHeroInfos.forEach(v => {
                    if (v.isBuy) progress++;
                })
                break;
            case Global.TaskType.UnlockBuild:
                PlayerData.ins.unlockBuildInfos.forEach(v => {
                    if (v.isBuy) progress++;
                })
                break;
            case Global.TaskType.UpgradeMine:
                progress = PlayerData.ins.goldmineLevel;
                break;
            case Global.TaskType.UnlockTerritory:
                progress = PlayerData.ins.territoryLv;
                break;
            case Global.TaskType.UnlockHomeBuild:
                let num = 0;
                PlayerData.ins.homeBuildPos.forEach(v => {
                    if (v.lv >= 1) num++;
                })
                progress = num;
                break;
            case Global.TaskType.UpgradeHeroTimes:
            case Global.TaskType.UpgradeCastleTimes:
            case Global.TaskType.UpgradeArms:
            case Global.TaskType.KillEnemy:
                progress = Math.min(info.progress += addPro, taskConfig.parameter);
                break;
        }
        this.refreshTask({ id: info.id, progress: progress });
    }

    private getTaskProgress(taskType: Global.TaskType) {
        let progress = 0;
        switch (taskType) {
            case Global.TaskType.PassLv:
                progress = PlayerData.ins.wave;
                break;
            case Global.TaskType.UpgradeArcher:
                progress = PlayerData.ins.archerLv;
                break;
            case Global.TaskType.UpgradeCastle:
                progress = PlayerData.ins.carstelLv;
                break;
            case Global.TaskType.UnlockHero:
                PlayerData.ins.unlockHeroInfos.forEach(v => {
                    if (v.isBuy) progress++;
                })
                break;
            case Global.TaskType.UnlockBuild:
                PlayerData.ins.unlockBuildInfos.forEach(v => {
                    if (v.isBuy) progress++;
                })
                break;
            case Global.TaskType.UpgradeMine:
                progress = PlayerData.ins.goldmineLevel;
                break;
            case Global.TaskType.UnlockTerritory:
                progress = PlayerData.ins.territoryLv;
                break;
            case Global.TaskType.UnlockHomeBuild:
                let num = 0;
                PlayerData.ins.homeBuildPos.forEach(v => {
                    if (v.lv >= 1) num++;
                })
                progress = num;
                break;
            case Global.TaskType.UpgradeHeroTimes:
            case Global.TaskType.UpgradeCastleTimes:
            case Global.TaskType.UpgradeArms:
            case Global.TaskType.KillEnemy:
                progress = 0;
                break;
        }
        return progress;
    }

    /**完成任务 */
    finishTask() {
        UIManager.ins.openView(UiPath.RewardView).then((view: RewardView) => {
            view.init(this.taskConfig.reward);
            let nextId = this.taskConfig.id + 1;
            let nextConfig = DataManager.ins.get(TaskConfigMgr).getDataById(nextId);
            this.content.active = nextConfig != null;
            this.endNode.active = !nextConfig;
            if (nextConfig) {
                let progress = this.getTaskProgress(nextConfig.type);
                this.refreshTask({ id: nextId, progress: progress });
            } else {
                PlayerData.ins.refreshTaskInfo({ id: -1, progress: 0 });
            }
        })
    }

    refreshTask(info: { id: number, progress: number }) {
        let taskConfig = DataManager.ins.get(TaskConfigMgr).getDataById(info.id);
        this.content.active = taskConfig != null;
        this.endNode.active = !taskConfig;
        if (!taskConfig) {
            return;
        }
        this.taskConfig = taskConfig;
        PlayerData.ins.refreshTaskInfo(info);
        this.isFinish = info.progress >= this.taskConfig.parameter;
        let taskTpe = DataManager.ins.get(TasktypeConfigMgr).getDataById(this.taskConfig.type);
        if (!taskTpe) return;
        this.descLab.string = taskTpe.text.replace("x", this.taskConfig.parameter + "") + "(" + info.progress + "/" + this.taskConfig.parameter + ")";
        let reward = this.taskConfig.reward[0];
        AbManager.loadBundleRes(BundleName.Assets, "texture/item/" + reward.id, cc.SpriteFrame).then(spf => {
            this.rewardIconSpr.spriteFrame = spf;
        })
        this.rewardLab.string = "X" + reward.num;
        this.redPointNode.active = this.isFinish;
        this.content.active = true;
        this.endNode.active = false;
    }

    taskClick() {
        console.log("taskClick this.isFinish ", this.isFinish)
        if (!this.isFinish) {
            WorldEventManager.triggerEvent(Global.EventEnum.ShowGuideHand, this.taskConfig.type);
        } else {
            this.finishTask();
        }
    }
}

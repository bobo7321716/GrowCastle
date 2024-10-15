import FunctionlockConfig, { FunctionlockConfigMgr } from "../config/FunctionlockConfig";
import DataManager from "../manager/DataManager";
import { Global } from "./Global";
import { PlayerData } from "./PlayerData";
import TipManager from "./TipManager";
import { WorldEventManager } from "./WorldEventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UnlockFunc extends cc.Component {

    @property({ displayName: "功能id" })
    id: number = 0;

    @property(cc.Node)
    unlockNode: cc.Node = null;

    @property(cc.Node)
    lockNode: cc.Node = null;

    private datas: FunctionlockConfig[] = [];
    private config: FunctionlockConfig = null;

    protected onEnable(): void {
        WorldEventManager.addListener(Global.EventEnum.FightState, this.fightState, this);
        WorldEventManager.addListener(Global.EventEnum.RefreshWave, this.checkUnlock, this);
        this.datas = DataManager.ins.get(FunctionlockConfigMgr).datas;
        this.checkUnlock();
    }

    protected onDisable(): void {
        WorldEventManager.removeListener(Global.EventEnum.RefreshWave, this.checkUnlock, this);
        WorldEventManager.removeListener(Global.EventEnum.FightState, this.fightState, this);
    }

    checkUnlock() {
        this.config = this.datas.find(v => v.id == this.id);
        if (!this.config) {
            this.unlockNode.active = false;
            return;
        }
        let state = Global.State.LOCK;
        if (PlayerData.ins.wave >= this.config.wave) {
            state = Global.State.GETED;
        }
        let lastConfig = this.datas.find(v => v.wave > PlayerData.ins.wave && v.type == this.config.type);
        if (lastConfig && this.config.id == lastConfig.id) {
            state = Global.State.UNLOCK;
        }
        this.unlockNode.active = state == Global.State.GETED;
        this.lockNode.active = this.config.type == 3 ? state != Global.State.GETED : state == Global.State.UNLOCK;
    }

    lockClick() {
        TipManager.ins.showTip("通关第" + this.config.wave + "波解锁");
    }

    fightState(isStart: boolean) {
        if (isStart) {
            this.lockNode.active = false;
        } else {
            this.checkUnlock();
        }
    }
}

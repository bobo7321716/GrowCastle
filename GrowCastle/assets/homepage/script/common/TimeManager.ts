import { PlayerData } from "./PlayerData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TimeManager extends cc.Component {

    public static ins: TimeManager = null;

    /**游戏运行的时长 */
    private _curTime: number = 0;
    public get curTime(): number {
        return this._curTime;
    }

    private interval: number = 1;
    private timer: number = 0;
    private timeCalls: { callFunc: ((time: number) => void), targetTime: number, caller: any, isTriggerOnce: boolean }[] = [];
    public getHeartbeatInterval: number = 1;

    protected onLoad(): void {
        TimeManager.ins = this;
        this.timer = 0;
        this._curTime = 0;
        this.timeCalls = [];
    }

    protected update(dt: number): void {
        this.timer += dt;
        if (this.timer >= this.interval) {
            this.timer = 0;
            this.checkTimeCall();
        }
        this._curTime += dt * 1000;
        PlayerData.ins.todayOnlineDuration += dt * 1000;
    }

    public checkTimeCall() {
        this.timeCalls.forEach((call) => {
            if (call && call.callFunc) {
                if (this.curTime >= call.targetTime) {
                    this.offCdCall(call);
                    if (call.isTriggerOnce) {
                        call.callFunc(0);
                    }
                }
                !call.isTriggerOnce && call.callFunc((call.targetTime - this.curTime) / 1000);
            }
        });
    }

    /**
     * 添加一个倒计时回调，每秒触发,返回剩余时间
     * @param call 回调
     * @param targetTime 回调移除时间,毫秒
     * @param caller 
     * @param isTriggerOnce 是否只触发一次
     * @returns 
     */
    public onCdCall(call: (time: number) => void, targetTime: number, caller: any, isCheckSame: boolean = true, isTriggerOnce: boolean = false) {
        if (isCheckSame && this.timeCalls.find(data => data.caller == caller) != undefined) {
            console.warn("TimeManager 重复注册");
            return;
        }
        this.timeCalls.push({ callFunc: call, targetTime: targetTime, caller: caller, isTriggerOnce: isTriggerOnce });
    }

    /**移除倒计时回调 */
    public offCdCall(call: { callFunc: ((time: number) => void), targetTime: number, caller: any }) {
        let index = this.timeCalls.findIndex(v => v.callFunc.name == call.callFunc.name && v.targetTime == call.targetTime && v.caller == call.caller);
        if (index >= 0) {
            this.timeCalls.splice(index, 1);
        }
    }

    public offAll(caller: any) {
        this.timeCalls = this.timeCalls.filter(v => v.caller != caller);
    }
}

import { BundleData } from "../common/BundleData";
import { UIManager } from "../common/UIManager";
import { UiBase } from "../common/UiBase";

const { ccclass, property } = cc._decorator;
//界面事件管理
@ccclass
export default class SceneEventManager extends cc.Component {

    public static ins: SceneEventManager = null;
    private arg: { data: BundleData, uiBase: UiBase } = null;
    public sceneEvent: { url: string, events: string[], args: any[] }[] = [];

    protected onLoad(): void {
        SceneEventManager.ins = this;
    }

    /**检查是否触发界面事件 按照加入顺序依次触发，通过checkNextEvent触发后续事件 */
    public checkSceneEvent(arg: { data: BundleData, uiBase: UiBase }) {
        if (!arg || !arg.data) return;
        this.arg = arg;
        this.checkNextEvent();
    }

    public checkNextEvent() {
        if (!this.arg) return;
        if (!this.sceneEvent) return;
        if (this.sceneEvent.length <= 0) return;
        // console.warn("checkNextEvent = ", this.sceneEvent)
        let info = this.sceneEvent.find(info => info.url == this.arg.data.url);
        if (!info || info.events.length <= 0) return;
        let event = info.events.shift();
        let arg = info.args.shift();
        this.arg.uiBase[event] && this.arg.uiBase[event](arg);
        console.log("sceneEvent ", event);
        if (info.events.length <= 0) {
            let index = this.sceneEvent.findIndex(info => info.url == this.arg.data.url);
            if (index != undefined) {
                this.sceneEvent.splice(index, 1);
            }
        }
    }

    public finishCurEvent() {
        UIManager.ins.refreshCurTopBundleData();
    }

    /**
     * 添加界面事件(在对应界面下次打开或者不被遮挡时检测，成功触发后移除)
     * @param uiBundle 界面的bundleData
     * @param funcName 界面脚本中的方法名
     * @param immediatelyCheck 是否立即检测
     */
    public addSceneEvent(uiBundle: BundleData, funcName: string, arg: any = null, immediatelyCheck: boolean = true, mergeSameFunc: boolean = true) {
        let info = this.sceneEvent.find(info => info.url == uiBundle.url);
        if (info) {
            if (mergeSameFunc) {
                let index = info.events.findIndex(v => v == funcName);
                if (index < 0) {
                    info.events.push(funcName);
                    info.args.push([arg]);
                } else {
                    info.args[index].push(arg);
                }
            } else {
                info.events.push(funcName);
                info.args.push([arg]);
            }
        } else {
            this.sceneEvent.push({ url: uiBundle.url, events: [funcName], args: [[arg]] });
        }
        if (immediatelyCheck) {
            UIManager.ins.refreshCurTopBundleData();
        }
    }
}

import { AudioManager } from "./AudioManager";
import MyPool from "./MyPool";
import MyToggleBtn from "./MyToggleBtn";
import { SoundPath } from "./SoundPath";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MyToggle extends cc.Component {

    @property(cc.Node)
    btnNodes: cc.Node[] = [];

    @property({ displayName: "点击事件", type: cc.Component.EventHandler })
    events: cc.Component.EventHandler[] = [];

    @property({ displayName: "是否手动初始化" })
    isHandInit: boolean = false;

    @property({ type: cc.Prefab, visible() { return this.isHandInit } })
    toggleBtnPre: cc.Prefab = null;

    public isLock: boolean = false;

    protected onLoad(): void {
        if (!this.isHandInit) {
            this.btnInit();
        }
    }

    btnInit() {
        for (let i = 0; i < this.btnNodes.length; i++) {
            let btnNode = this.btnNodes[i];
            let handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = "MyToggle";
            handler.handler = "btnClick";
            handler.customEventData = i + "";
            let btn = btnNode.getComponent(cc.Button);
            btn.clickEvents.push(handler);
        }
    }

    handInit(tagArr: string[]) {
        if (tagArr.length <= 0 || !this.toggleBtnPre) return;
        this.btnNodes.forEach(v => {
            MyPool.putObj(v);
        })
        this.btnNodes = [];
        tagArr.forEach((v, k) => {
            let btn = MyPool.getObj(this.toggleBtnPre);
            btn.parent = this.node;
            let btnSrc = btn.getComponent(MyToggleBtn);
            if (btnSrc) {
                btnSrc.init(v);
            }
            this.btnNodes.push(btn);
        })
        this.btnInit();
    }

    btnClick(event, data: string) {
        if (this.isLock) return;
        this.emit(Number(data));
    }

    selectEmpty() {
        for (let i = 0; i < this.btnNodes.length; i++) {
            let btn = this.btnNodes[i];
            btn.children[1].active = false;
        }
    }

    emit(btnIndex: number) {
        for (let i = 0; i < this.btnNodes.length; i++) {
            let btn = this.btnNodes[i];
            btn.children[1].active = i == btnIndex;
        }
        this.events.forEach((value: cc.Component.EventHandler, index: number, array: cc.Component.EventHandler[]) => {
            value.emit([value, btnIndex]);
        });
    }
}

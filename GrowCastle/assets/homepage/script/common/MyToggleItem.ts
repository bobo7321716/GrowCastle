const { ccclass, property } = cc._decorator;

@ccclass
export default class MyToggleItem extends cc.Component {
    @property(cc.Node)
    checkedNode: cc.Node = null;

    @property(cc.Sprite)
    unCheckNode: cc.Sprite = null;

    @property(cc.Component.EventHandler)
    checkEvent: cc.Component.EventHandler = null;

    private _checked = false;
    get checked() {
        return this._checked;
    }
    @property(cc.Boolean)
    set checked(v: boolean) {
        this._checked = v;
        if (this.checkedNode) this.checkedNode.active = v;
        if (this.unCheckNode) this.unCheckNode.enabled = !v;
    }

    onChecked: (toggle: MyToggleItem) => boolean = null;

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart(event: cc.Touch) {
        if (this.onChecked && !this.onChecked(this)) return;
        this.checked = !this.checked;
        this.checkEvent?.emit([this.checkEvent.customEventData])
    }
}

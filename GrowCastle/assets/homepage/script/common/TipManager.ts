import { CommonTip } from "./CommonTip";
import MyPool from "./MyPool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TipManager extends cc.Component {

    @property(cc.Node)
    protected tipNode: cc.Node = null;

    @property(cc.Prefab)
    protected tipPrefab: cc.Prefab = null;

    public static ins: TipManager = null;
    private tipNodeMap: Map<CommonTip, number> = new Map();
    private tipArr: CommonTip[] = [];

    onLoad(): void {
        TipManager.ins = this;
    }

    public showTip(tipStr: string) {
        var tip = MyPool.getObj(this.tipPrefab);
        tip.setParent(this.tipNode);
        tip.y = 0;
        var commonTip = tip.getComponent(CommonTip);
        commonTip.show(tipStr);
        this.refreshTip(commonTip);
    }

    refreshTip(commonTip: CommonTip) {
        if (this.tipNodeMap.size > 0) {
            this.tipNodeMap.forEach((v, k) => {
                k.topMove();
            })
        }
        let gap = this.tipArr.length - 2;
        if (gap > 0) {
            for (let i = 0; i < gap; i++) {
                let tip = this.tipArr.shift();
                this.tipNodeMap.delete(tip);
                tip.destroySelf();
            }
        }
        this.tipNodeMap.set(commonTip, Date.now() + 2000);
        this.tipArr.push(commonTip);
    }

    protected update(dt: number): void {
        if (this.tipNodeMap.size <= 0) return;
        this.tipNodeMap.forEach((v, k) => {
            if (Date.now() >= v) {
                this.tipNodeMap.delete(k);
                let index = this.tipArr.indexOf(k);
                this.tipArr.splice(index, 1);
                k.hide();
            }
        })
    }
} 

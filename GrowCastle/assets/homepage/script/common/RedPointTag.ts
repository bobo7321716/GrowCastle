import RedPointManager from "../manager/RedPointManager";
import { Global } from "./Global";
import { WorldEventManager } from "./WorldEventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RedPointTag extends cc.Component {

    @property()
    key: number = 0;

    @property(cc.Node)
    point: cc.Node = null;

    protected onLoad(): void {
        WorldEventManager.addListener(Global.EventEnum.RedPointRefresh, this.refreshRedPoint, this);
        this.point.stopAllActions();
        cc.tween(this.point)
            .repeatForever(
                cc.tween()
                    .repeat(2,
                        cc.tween()
                            .to(0.2, { angle: 10 })
                            .to(0.2, { angle: -10 })
                            .to(0.1, { angle: 0 })
                    )
                    .delay(1)
            )
            .start();
    }

    protected onEnable(): void {
        this.refreshRedPoint();
    }

    refreshRedPoint() {
        this.point.active = RedPointManager.ins.allShowRedPoints.includes(this.key);
    }
}

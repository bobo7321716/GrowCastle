import GamingData from "../../../homepage/script/common/GamingData";
import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { WorldEventManager } from "../../../homepage/script/common/WorldEventManager";
import TerritoryFlag from "./TerritoryFlag";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TerritoryItem extends cc.Component {

    @property(TerritoryFlag)
    flagArr: TerritoryFlag[] = [];

    protected start(): void {
        WorldEventManager.addListener(Global.EventEnum.ShowBobble, this.showBobble, this);
    }

    init(index: number) {
        let promiseArr = [];
        this.flagArr.forEach((v, k) => {
            let lv = index * GamingData.pageFlagNum + k + 1;
            let state = Global.State.LOCK;
            if (lv <= PlayerData.ins.territoryLv) {
                state = Global.State.GETED;
            } else if (lv == PlayerData.ins.territoryLv + 1) {
                state = Global.State.UNLOCK;
            }
            promiseArr.push(v.init(lv, state));
        })
        return Promise.all(promiseArr);
    }

    showBobble() {
        let flag = this.flagArr.find(v => v.state == Global.State.UNLOCK);
        if (flag) flag.showBobble();
    }

    getFlayY(index: number) {
        return this.flagArr[index].node.y;
    }
}

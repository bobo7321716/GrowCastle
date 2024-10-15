
import { PlayerData } from "../../homepage/script/common/PlayerData";
import ArcherPos from "./ArcherPos";
import { ArcherBase } from "./role/ArcherBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArcherContent extends cc.Component {

    private archerPosArr: ArcherPos[] = [];
    public archerBaseArr: ArcherBase[] = [];
    private upgradeIndex: number = 0;

    init() {
        this.archerPosArr = [];
        this.archerBaseArr = [];
        this.node.children.forEach(v => {
            let archerSrc = v.getComponent(ArcherPos);
            if (archerSrc) {
                this.archerPosArr.push(archerSrc);
                this.archerBaseArr.push(archerSrc.archerBase);
            }
        })
        return this.refreshLv();
    }

    refreshLv() {
        let lastOrder: number = 0;
        let promiseArr = [];
        let minLv = Math.floor(PlayerData.ins.archerLv / 20);
        let extract = PlayerData.ins.archerLv % 20;
        if (extract == 0 && minLv > 0) this.upgradeIndex = 19;
        this.archerPosArr.forEach((v, k) => {
            if (v.order < extract) {
                if (v.order >= lastOrder) {
                    this.upgradeIndex = k;
                    lastOrder = v.order;
                }
                promiseArr.push(v.init(minLv + 1, k));
            } else {
                promiseArr.push(v.init(minLv, k));
            }
        })
        return Promise.all(promiseArr);
    }

    upgradeEffect() {
        this.archerBaseArr[this.upgradeIndex].playEffectAnim(0, true);
        this.upgradeIndex++;
        if (this.upgradeIndex >= this.archerBaseArr.length) this.upgradeIndex = 0;
    }
} 

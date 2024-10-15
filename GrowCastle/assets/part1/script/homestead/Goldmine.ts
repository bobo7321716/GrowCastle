// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { BundleName } from "../../../homepage/script/common/BundleName";
import { Global } from "../../../homepage/script/common/Global";
import MyPool from "../../../homepage/script/common/MyPool";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiPath } from "../../../homepage/script/common/UiPath";
import { Util } from "../../../homepage/script/common/Util";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import { ConstConfigMgr } from "../../../homepage/script/config/ConstConfig";
import { GoldmineConfigMgr } from "../../../homepage/script/config/GoldmineConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import HomeManager from "../../../homepage/script/manager/HomeManager";
import GoldWorker from "./GoldWorker";
import GoldmineDialog from "./GoldmineDialog";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Goldmine extends cc.Component {

    goldworkers: GoldWorker[] = []
    @property(cc.Node)
    build: cc.Node = null;
    @property(cc.Node)
    mine: cc.Node = null;

    @property({ type: cc.Node, tooltip: "矿的左边" })
    left: cc.Node = null
    @property({ type: cc.Node, tooltip: "矿的右边" })
    right: cc.Node = null

    @property(cc.Node)
    workContent: cc.Node = null;

    moveTime = 15;

    goldData: number[] = []

    private sortNodes: cc.Node[] = [];

    init() {
        this.build.zIndex = -1;
        // this.mine.zIndex = 800;

        this.moveTime = 60 / DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.矿工基础速度).value
        this.onRefresh()
    }

    protected update(dt: number): void {
        if (this.goldworkers.length <= 0) return;
        this.goldworkers.forEach(val => val.action(dt));
        let arr = this.workContent.children;
        arr.sort((a, b) => {
            return b.y - a.y;
        })
        arr.forEach((v, k) => {
            v.setSiblingIndex(k);
        })
    }


    /**清除 */
    clearWorker() {
        this.goldworkers.forEach(val => {
            MyPool.putObj(val.node)
        }
        )
        this.goldworkers = []
    }

    createWorker() {
        AbManager.loadBundleRes(BundleName.Part1, "prefab/homestead/GoldWorker", cc.Prefab).then((_prefab) => {
            for (let i = 0; i < this.goldData.length; i++) {
                let _node = MyPool.getObj(_prefab);
                let _worker = _node.getComponent(GoldWorker);
                this.goldworkers.push(_worker);
                _node.parent = this.workContent;
                // _node.zIndex = 0;
                let _gold = HomeManager.ins.goldLevel[this.goldData[i]]


                let _startPos = cc.v2(20 * (i % this.goldData.length - 1) - 20 * this.goldData.length / 2 + this.build.position.x, this.build.position.y - 100)
                let _left = i < 5
                let _endPos = _left ? Util.getRandomPosInRect(this.left.getBoundingBox()) : Util.getRandomPosInRect(this.right.getBoundingBox());
                _worker.init(this.moveTime, _gold, _startPos, _endPos, Math.random(), _left);//给一个偏移值
            }
        })
    }


    /**弹窗 */
    btnShowGoldmineDialogClick() {
        UIManager.ins.openView(UiPath.GoldmineDialog).then((_dialog: GoldmineDialog) => {
            _dialog.init(this.onRefresh.bind(this))
        })
    }


    /**刷新矿工的能力 */
    onRefresh() {
        this.goldData = DataManager.ins.get(GoldmineConfigMgr).datas[PlayerData.ins.goldmineLevel].gold
        this.goldData = this.goldData.filter(val => val != 0)
        if (this.goldworkers.length != this.goldData.length) {
            this.clearWorker();
            this.createWorker()
        }
        else {
            for (let i = 0; i < this.goldData.length; i++) {
                let _worker = this.goldworkers[i];
                let _gold = HomeManager.ins.goldLevel[this.goldData[i]]

                _worker.refreshData(this.moveTime, _gold)
            }
        }


    }
}

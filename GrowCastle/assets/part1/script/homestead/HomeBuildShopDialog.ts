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
import { UiBase } from "../../../homepage/script/common/UiBase";
import { WorldEventManager } from "../../../homepage/script/common/WorldEventManager";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import { BuildConfigMgr } from "../../../homepage/script/config/BuildConfig";
import BuildattributeConfig, { BuildattributeConfigMgr } from "../../../homepage/script/config/BuildattributeConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import HomeManager from "../../../homepage/script/manager/HomeManager";
import HomeBuildShopItem from "./HomeBuildShopItem";

const { ccclass, property } = cc._decorator;

/**购买家园建筑物的界面 */
@ccclass
export default class HomeBuildShopDialog extends UiBase {

    @property({ type: cc.Node, tooltip: "建筑对象的父物体" })
    itemParent: cc.Node = null
    currentPos: number = 0;
    items: HomeBuildShopItem[] = []


    protected onEnable(): void {
        // WorldEventManager.addListener(Global.EventEnum.RefreshHomeBuild,this.refresh,this);
    }

    protected onDisable(): void {
        // WorldEventManager.removeListener(Global.EventEnum.RefreshHomeBuild,this.refresh,this);
    }


    init(_pos: number) {
        this.currentPos = _pos;
        this.clearItems();
        this.createItems()
    }

    clearItems() {


    }

    createItems() {
        // let buildDatas = DataManager.ins.get(BuildConfigMgr).datas;
        // let attributes = DataManager.ins.get(BuildattributeConfigMgr).datas;
        // let tmpDatas: BuildattributeConfig[] = [];

        AbManager.loadBundleRes(BundleName.Part1, "prefab/homestead/HomesteadShopItem", cc.Prefab).then((_prefab) => {
            PlayerData.ins.homeBuildPos.forEach(val => {
                let _node = MyPool.getObj(_prefab);
                _node.parent = this.itemParent;
                let _item = _node.getComponent(HomeBuildShopItem);
                _item.init(val, this.currentPos, this.refresh.bind(this))
                this.items.push(_item);

            }
            )
        })

    }

    /**刷新数据 */
    refresh() {
        this.items.forEach(val => {
            val.refresh()
        }
        )
        HomeManager.ins.homestead.refreshBuild()
    }
}

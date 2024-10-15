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
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import { ArmamentConfigMgr } from "../../../homepage/script/config/ArmamentConfig";
import { ConstConfigMgr } from "../../../homepage/script/config/ConstConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import ArmamentItem from "./ArmamentItem";
import ArmamentTab from "./ArmamentTab";

const { ccclass, property } = cc._decorator;

/**军备 */
@ccclass
export default class ArmamentDialog extends UiBase {

    @property([ArmamentTab])
    tabItems: ArmamentTab[] = [];

    @property(cc.Node)
    itemparent: cc.Node = null;

    @property(cc.Label)
    adUpgradeLab: cc.Label = null;

    items: ArmamentItem[] = []
    private adLimit: number = 10;

    public onEnable(): void {

        for (const i of this.tabItems) {
            i.init(this.selectPage.bind(this));
        }
        this.clearItems();

        let _count = DataManager.ins.get(ArmamentConfigMgr).datas.length;

        AbManager.loadBundleRes(BundleName.Part1, "prefab/armaments/ArmamentItem", cc.Prefab).then((_res) => {


            DataManager.ins.get(ArmamentConfigMgr).datas.forEach(_config => {
                let _node = MyPool.getObj(_res);
                let _item = _node.getComponent(ArmamentItem);
                this.items.push(_item);
                _node.parent = this.itemparent;

                _item.init(_config, this.refreshItem.bind(this));
                _count--;
                if (_count <= 0) {
                    this.completeCreateItem();
                }
            }
            )
        })
        this.adLimit = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.军备每日视频升级次数).value;
        this.refreshItem();
    }

    refreshItem() {
        this.adUpgradeLab.string = "今日看视频升级次数：" + PlayerData.ins.armAdUpgradeTimes + " / " + this.adLimit;
        this.items.forEach(v => {
            v.refreshInfo();
        })
    }

    protected onDestroy(): void {
        this.clearItems()
    }

    /**完成项目创建 */
    completeCreateItem() {
        this.selectPage(Global.ArmamentGroup.train);
    }


    clearItems() {

        this.items.forEach(val => {
            MyPool.putObj(val.node)
        }
        )

        this.items = [];
    }


    /**切页面 */
    selectPage(_page: Global.ArmamentGroup) {
        this.tabItems.forEach(val => {
            val.setSelect(val.group == _page);
        })

        this.items.forEach(val => {
            val.node.active = val.group == _page;
            val.refreshInfo();
        }
        )



    }





}

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiPath } from "../../../homepage/script/common/UiPath";
import HomeManager from "../../../homepage/script/manager/HomeManager";
import AddCoinUI from "../AddCoinUI";
import Goldmine from "./Goldmine";
import HomeBuild from "./HomeBuild";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Homestead extends cc.Component {

    goldmine: Goldmine = null;

    /**家园建筑物 */
    builds: HomeBuild[] = []

    protected onEnable(): void {
        HomeManager.ins.pauseAutoGetGold();
        this.refreshBuild()
    }

    protected onDisable(): void {
        HomeManager.ins.startAutoGetGold();

    }

    init(): Promise<void> {

        return new Promise<void>(resolve => {
            this.builds = this.getComponentsInChildren(HomeBuild);
            this.goldmine = this.getComponentInChildren(Goldmine);
            this.goldmine.init();
            //设置测试数据



            // PlayerData.ins.unlockHomePos = 2;
            //  PlayerData.ins.homeBuildPos[1].lv =1

            this.refreshBuild();

            resolve()
        }
        )
    }


    /**刷新建筑物 */
    refreshBuild() {
        //解锁的建筑物
        this.builds.forEach((_build, k) => {
            let _data = PlayerData.ins.homeBuildPos.find(_data => _data.pos == _build.pos);
            if (_data != null && _data.pos >= 0) {
                let _config = HomeManager.ins.homeAttributeConfigMap.get(_data.id).find(_c => _c.level == _data.lv)
                _build.init(_config)
            } else {
                //没建筑,空地
                _build.setBlock();
            }
        }
        )
    }

    /**加钱 */
    btnAddCoinTestClick() {
        PlayerData.ins.changeItemNum(Global.ItemId.Coin, 1000000000000);
        PlayerData.ins.changeItemNum(Global.ItemId.RecruitTick, 100)
    }

    btnAddCoinUIClick() {

        UIManager.ins.openView(UiPath.AddCoin).then((_ui: AddCoinUI) => {
            _ui.init(false);
        })
    }
}

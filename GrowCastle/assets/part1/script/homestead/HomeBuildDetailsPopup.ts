// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiBase } from "../../../homepage/script/common/UiBase";
import { WorldEventManager } from "../../../homepage/script/common/WorldEventManager";
import HomeAttributeConfig from "../../../homepage/script/config/HomeAttributeConfig";
import HomebuildConfig from "../../../homepage/script/config/HomebuildConfig";
import HomeManager from "../../../homepage/script/manager/HomeManager";

const { ccclass, property } = cc._decorator;
/**建筑详情弹窗 */
@ccclass
export default class HomeBuildDetailsPopup extends UiBase {


    @property(cc.Node)
    buildGroup: cc.Node = null;
    @property(cc.Node)
    upgrateGroup: cc.Node = null;

    @property(cc.Label)
    nameLabel: cc.Label = null
    @property(cc.Label)
    equipStateLabel: cc.Label = null;
    @property(cc.Label)
    buildPriceLabel: cc.Label = null;
    @property({ type: cc.Label, tooltip: "升级价格" })
    upgradePriceLabel: cc.Label = null;




    id: number;
    /**选中的位置 */
    groundPos: number;
    playdata: { id: number, lv: number, pos: number } = null


    init(_buildData: HomebuildConfig, _id: number, _groundPos: number) {

        this.id = _id
        this.groundPos = _groundPos;

        this.playdata = PlayerData.ins.homeBuildPos.find(val => val.id == _id)
        console.log("id", _id, HomeManager.ins.homeAttributeConfigMap, HomeManager.ins.homeAttributeConfigMap.get(this.id))
      
        this.nameLabel.string = _buildData.name;


        if (this.playdata.lv == 0) {
            this.buildGroup.active = true;
            this.upgrateGroup.active = false;
        }
        else {
            this.buildGroup.active = false;
            this.upgrateGroup.active = true;
        }

        //此建筑是否装备在目标建筑物上
        console.log(this.playdata.pos, this.groundPos)
        this.equipStateLabel.string = this.playdata.pos == this.groundPos ? "卸下" : "装备";
        this.refresh()
    }


    refresh()
    {
        let _attribute = HomeManager.ins.homeAttributeConfigMap.get(this.id).find(val => val.level == this.playdata.lv);
        let _nextAttribute = HomeManager.ins.homeAttributeConfigMap.get(this.id).find(val => val.level == this.playdata.lv + 1);

        console.log(_nextAttribute)
        if(_nextAttribute!=null)
            {
                this.upgradePriceLabel.string  =_nextAttribute.cost.toString();
            }

    }

    /**点击装备卸下 */
    btnEquipClick() {

        let _isEquip = this.playdata.pos == this.groundPos;
        if (_isEquip) {
            this.playdata.pos = -1;
            //正在装备,所以卸下后,字变成装备
            this.equipStateLabel.string = "装备"
        }
        else {

            //把groundpos的建筑移除,当前建筑装上去
            let _target = PlayerData.ins.homeBuildPos.find(val => val.pos == this.groundPos);
            if (_target != null) {
                _target.pos = -1;
            }
            this.playdata.pos = this.groundPos;

            this.equipStateLabel.string = "卸下"
        }


        //刷新建筑物
        HomeManager.ins.homestead.refreshBuild()
        PlayerData.ins.saveData()
    }

    /**点击建造 */
    btnBuildClick() {
        //扣钱
        let _target = PlayerData.ins.homeBuildPos.find(val => val.pos == this.groundPos);
        if (_target != null) {
            _target.pos = -1;
        }
        this.playdata.pos = this.groundPos;
        this.playdata.lv = 1;

        this.buildGroup.active = false;
        this.upgrateGroup.active = true;
        this.equipStateLabel.string = "卸下"
        HomeManager.ins.homestead.refreshBuild()
        PlayerData.ins.saveData()
    }

    /**点击升级 */
    btnUpgrade() {
      
        PlayerData.ins.upgradeHomeBuild(this.id);
        this.refresh()
    }

    /**点击关闭 */
    btnCloseClick() {
        this.playCloseSceneAudio();
        UIManager.ins.closeView();
        WorldEventManager.triggerEvent(Global.EventEnum.RefreshHomeBuild);
    }

}

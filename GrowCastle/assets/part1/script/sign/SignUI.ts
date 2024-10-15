import { Global } from "../../../homepage/script/common/Global";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiBase } from "../../../homepage/script/common/UiBase";
import { UiPath } from "../../../homepage/script/common/UiPath";
import { ItemConfigMgr } from "../../../homepage/script/config/ItemConfig";
import { SignConfigMgr } from "../../../homepage/script/config/SignConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import RedPointManager from "../../../homepage/script/manager/RedPointManager";
import RewardView from "../RewardView";
import SignItem from "./SignItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SignUI extends UiBase {

    @property(SignItem)
    item: SignItem[] = [];

    @property(cc.Node)
    signBtnNode: cc.Node = null;

    @property(cc.Label)
    nameLab: cc.Label = null;

    protected onEnable(): void {
        let datas = DataManager.ins.get(SignConfigMgr).datas;
        datas.forEach((v, k) => {
            this.item[k].init(v, this.signClick.bind(this));
            if (k == 6) {
                v.reward.forEach((v2) => {
                    let data = DataManager.ins.get(ItemConfigMgr).getDataById(v2.id);
                    if (data && data.type == 2) {
                        this.nameLab.string = "· " + data.name;
                    }
                })
            }
        })
        this.signBtnNode.active = PlayerData.ins.signDay < PlayerData.ins.totalLoginDays;
    }

    signClick(btn, data: string) {
        let isDouble = data == "2";
        UIManager.ins.closeView();
        PlayerData.ins.sign(isDouble);
        this.item.forEach(v => {
            v.refreshState();
        })
        this.signBtnNode.active = PlayerData.ins.signDay < PlayerData.ins.totalLoginDays;
        RedPointManager.ins.checkRedPoint();
    }
}

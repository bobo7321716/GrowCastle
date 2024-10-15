/*
 * @Author: XWL 2558913804@qq.com
 * @Date: 2024-06-14 14:29:05
 * @LastEditors: XWL 2558913804@qq.com
 * @LastEditTime: 2024-06-15 13:32:51
 * @FilePath: \GrowCastle\assets\part1\script\AddCoinUI.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { BundleName } from "../../homepage/script/common/BundleName";
import { Global } from "../../homepage/script/common/Global";
import { PlayerData } from "../../homepage/script/common/PlayerData";
import { UIManager } from "../../homepage/script/common/UIManager";
import { UiBase } from "../../homepage/script/common/UiBase";
import { UiPath } from "../../homepage/script/common/UiPath";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";
import AbRef from "../../homepage/script/common/asssetsBundle/AbRef";
import { ConstConfigMgr } from "../../homepage/script/config/ConstConfig";
import { WaveConfigMgr } from "../../homepage/script/config/WaveConfig";
import DataManager from "../../homepage/script/manager/DataManager";
import RewardView from "./RewardView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddCoinUI extends UiBase {

    @property(cc.Label)
    titleLabel: cc.Label = null
    @property(cc.Label)
    currencylabel: cc.Label = null;

    @property({ type: cc.Node, tooltip: "铜币图" })
    coinBg: cc.Node = null

    @property({ type: cc.Node, tooltip: "铜币图" })
    coinTip: cc.Node = null

    @property({ type: cc.Node, tooltip: "令牌图" })
    crystalBg: cc.Node = null

    @property({ type: cc.Node, tooltip: "令牌标" })
    crystalTip: cc.Node = null

    /**是否是铜币模式 */
    isCoin: boolean = true;

    /** 获得货币数量*/
    currencyNum: number = 0;

    /**是否是铜币,true为铜币,false为令牌 */
    init(_isCoin: boolean) {
        this.isCoin = _isCoin;


        if (this.isCoin) {
            this.titleLabel.string = "获得铜币"
            this.coinBg.active = true;
            this.coinTip.active = true;
            this.crystalBg.active = false;
            this.crystalTip.active = false;

            let _rate = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.广告获得铜币乘波次收益).value;
            let _wave = DataManager.ins.get(WaveConfigMgr).datas.find(val => val.wave == PlayerData.ins.wave);

            let _num = 100;
            if (_wave != null) {
                _num = 0;
                _wave.enemy.forEach(val => {
                    _num += val[1] * val[2] * _rate;
                })
            }
            this.currencyNum = _num;
            this.currencylabel.string = this.currencyNum.toString()

        }
        else {
            this.titleLabel.string = "获得令牌"
            this.coinBg.active = false;
            this.coinTip.active = false;
            this.crystalBg.active = true;
            this.crystalTip.active = true;

            let _num = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.广告获得铜币乘波次收益).value;
            this.currencyNum = _num;
            this.currencylabel.string = this.currencyNum.toString()
        }

    }

    btnGetCurrencyClick(btn, data: string) {
        let isFree = data == "1";
        let call = () => {
            let reward = null;
            if (this.isCoin) {
                reward = { id: Global.ItemId.Coin, num: this.currencyNum };
            }
            else {
                reward = { id: Global.ItemId.Crystal, num: this.currencyNum };
            }
            UIManager.ins.closeView();
            UIManager.ins.openView(UiPath.RewardView).then((view: RewardView) => {
                view.init([reward]);
            })
        }
        if (!isFree) {
            call();
        } else {
            call();
        }
    }

}

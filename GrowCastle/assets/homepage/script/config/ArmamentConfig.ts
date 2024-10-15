// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Global } from "../common/Global";
import BaseDataManager, { BaseData } from "../manager/BaseData";

const { ccclass, property } = cc._decorator;

export default class ArmamentConfig implements BaseData {
    id: number
    group: number
    icon: string
    name: string
    desc: string
    attribute: number
    /**1-基础数值 2-百分比 */
    value_type: Global.dataType
    value: number
    max: number
    cost_type: number
    cost_base: number
    cost_add: number
    wave: number
}

export class ArmamentConfigMgr extends BaseDataManager<ArmamentConfig> {

    getGroupConfig(group: number) {
        let arr = [];
        this._datas.forEach(v => {
            if (v.group == group) {
                arr.push(v)
            }
        })
        return arr;
    }
}
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import { Global } from "../common/Global";
import BaseDataManager, { BaseData, BaseRole } from "../manager/BaseData";

/**金矿数据 */
export default class ConstConfig implements BaseData {
    id: number
    name: string
    value: number
    array: number[]

}

export class ConstConfigMgr extends BaseDataManager<ConstConfig> {

    findConfig( _const:Global.GameConst)
    {
        return this.datas.find(val=>val.id==_const)
    }
}
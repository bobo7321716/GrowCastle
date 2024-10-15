import { Global } from "../common/Global";
import BaseDataManager, { BaseData, BaseRole } from "../manager/BaseData";

/**家园建筑物 */
export default class HomebuildConfig implements BaseData {
    id:number
    icon:string
    name:string
    desc:string
    attribute:Global.ArmamentAttribute
    value_type:Global.dataType
    max:number
    cost_type:number
    cost:number

}

export class HomebuildConfigMgr extends BaseDataManager<HomebuildConfig> {

}
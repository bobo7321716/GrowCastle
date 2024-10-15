import { Global } from "../common/Global";
import BaseDataManager, { BaseData, BaseRole } from "../manager/BaseData";

/**家园建筑物的属性 */
export default class HomeAttributeConfig implements BaseData {
    id:number
    icon:string
    build_id
    name:string
    desc:string
    attribute:Global.ArmamentAttribute
    value_type:Global.dataType
    level
    value:number
    cost_type:number
    cost:number

}

export class HomeAttributeConfigMgr extends BaseDataManager<HomeAttributeConfig> {

}
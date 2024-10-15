import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class ItemConfig implements BaseData {
    id?: number;
    /**名字 */
    name: string;
    /**类型 */
    type: number;
    /**参数 */
    value: number;
}

export class ItemConfigMgr extends BaseDataManager<ItemConfig> {

}
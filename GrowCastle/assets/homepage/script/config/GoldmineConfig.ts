import BaseDataManager, { BaseData, BaseRole } from "../manager/BaseData";

/**金矿数据 */
export default class GoldmineConfig implements BaseData {
    id: number
    level: number
    cost: number
    /**矿工的等级 */
    gold: number[]
}

export class GoldmineConfigMgr extends BaseDataManager<GoldmineConfig> {

}
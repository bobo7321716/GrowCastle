
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class HeroConfig implements BaseData {
    /**ID */
    id: number;
    /**名字 */
    name: string;
    rarity: number;
    /**解锁系数 */
    locktype: number;
    /**解锁系数 */
    lockparameter: number;
    /**图片 */
    picture: string;
    currency: number;
    /**解锁价格 */
    price: number;
}

export class HeroConfigMgr extends BaseDataManager<HeroConfig> {

}
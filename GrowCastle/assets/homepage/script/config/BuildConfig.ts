
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class BuildConfig implements BaseData {
    id: number;
    name: string;
    rarity: number;
    position: number;
    locktype: number;
    lockparameter: number;
    picture: number;
    currency: number;
    price: number;

}

export class BuildConfigMgr extends BaseDataManager<BuildConfig> {

}
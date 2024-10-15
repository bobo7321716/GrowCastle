
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class TerritoryConfig implements BaseData {
    id: number;
    Ecastlpicture: string;
    hp: number;
    coinget: number;
    power: number;
    icon: number;
}

export class TerritoryConfigMgr extends BaseDataManager<TerritoryConfig> {

}

import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class RedPointConfig implements BaseData {
    id: number;
    keys: number[]
}

export class RedPointConfigMgr extends BaseDataManager<RedPointConfig> {


}
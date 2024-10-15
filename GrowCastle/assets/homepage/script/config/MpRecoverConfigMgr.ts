
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class MpRecoverConfig implements BaseData {
    id: number;
    recover: number;
    cost: number[]
}

export class MpRecoverConfigMgr extends BaseDataManager<MpRecoverConfig> {

}
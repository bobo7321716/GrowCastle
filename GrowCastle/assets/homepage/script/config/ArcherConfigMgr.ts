
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class ArcherConfig implements BaseData {
    id: number;
    atk: number;
    atkSpeed: number;
    atkInterval: number;
    bullet: number;
}

export class ArcherConfigMgr extends BaseDataManager<ArcherConfig> {

}
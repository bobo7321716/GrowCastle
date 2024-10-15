
import { Util } from "../common/Util";
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class TasktypeConfig implements BaseData {
    id: number;
    text: string;
    type: number;
}

export class TasktypeConfigMgr extends BaseDataManager<TasktypeConfig> {

}

import { Util } from "../common/Util";
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class TaskConfig implements BaseData {
    id: number;
    type: number;
    parameter: number;
    reward: { id: number, num: number }[];
}

export class TaskConfigMgr extends BaseDataManager<TaskConfig> {

    parse(datas: TaskConfig[]): void {
        super.parse(datas);
        this._datas.forEach(data => {
            data.reward = Array.from(Util.convertStrToArr<string>(data.reward.toString(), ";"), el => {
                let arr = el.split(",");
                return {
                    id: Number.parseInt(arr[0]),
                    num: Number.parseInt(arr[1]),
                }
            });
        })
    }
}
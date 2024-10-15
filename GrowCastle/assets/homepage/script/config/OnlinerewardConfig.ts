
import { Util } from "../common/Util";
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class OnlinerewardConfig implements BaseData {
    id?: number;
    /**时长 */
    time: number;
    /**奖励 */
    reward: { id: number, num: number }[];
}

export class OnlinerewardConfigMgr extends BaseDataManager<OnlinerewardConfig> {
    parse(datas: OnlinerewardConfig[]): void {
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

import BaseDataManager, { BaseData, BaseRole } from "../manager/BaseData";


export default class EnemyConfig implements BaseRole {
    id: number;
    type: number;
    hp: number;
    mp: number;
    atkInterval: number;
    HPcoefficient: number;
    atkdistance: number;
    atktype: number;
    bullet: number;
    moveSpeed: number;
    atkSpeed: number;
    atk: number;
    ATKcoefficient: number;
    getcoin: number;
    animation: number;
    name: string;
    text: string;
    reward: { id: number, num: number, pro: number }[];
}

export class EnemyConfigMgr extends BaseDataManager<EnemyConfig> {

    parse(datas: EnemyConfig[]): void {
        super.parse(datas);
        this._datas.forEach(data => {
            if (data.reward) {
                let arr = [];
                data.reward.forEach(v => {
                    arr.push({
                        id: v[0],
                        num: v[1],
                        pro: v[2]
                    })
                })
                data.reward = arr;
            }
        })
    }
}
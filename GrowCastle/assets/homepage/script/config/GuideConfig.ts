
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class GuideConfig implements BaseData {
    id: number;
    group: number;
    step: number;
    tips: string;
    yOffset: number;
    isAutoNext: number;
}

export class GuideConfigMgr extends BaseDataManager<GuideConfig> {

    getGuideConfig(group: number, step: number) {
        return this._datas.find(v => v.group == group && v.step == step);
    }

    getGroupArr(group: number) {
        let arr = [];
        this._datas.forEach(v => {
            if (v.group == group) {
                arr.push(v);
            }
        })
        return arr;
    }
}
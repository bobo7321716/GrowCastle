
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class StoryConfig implements BaseData {
    id: number;
    type: number;
    group: number;
    step: number;
    name: string;
    roleId: number;
    desc: string;
}

export class StoryConfigMgr extends BaseDataManager<StoryConfig> {

    getStoryConfigArr(group: number) {
        let arr = [];
        this._datas.forEach(v => {
            if (v.group == group) {
                arr.push(v);
            }
        })
        return arr;
    }

    getStoryConfig(group: number, step: number) {
        return this._datas.find(v => v.group == group && v.step == step);
    }

    getStoryConfigArrByGroupAndType(group: number, type) {
        let arr = [];
        this._datas.forEach(v => {
            if (v.group == group && v.type == type) {
                arr.push(v);
            }
        })
        return arr;
    }
}
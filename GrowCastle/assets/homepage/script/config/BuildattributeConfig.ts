
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class BuildattributeConfig implements BaseData {
    id: number;
    buildid: number;
    name: string;
    level: number;
    atk: number;
    atkSpeed: number;
    atkInterval: number;
    coin: number[];
    skill: number;
    bullet: number;
}

export class BuildattributeConfigMgr extends BaseDataManager<BuildattributeConfig> {

    getBuildattributeConfig(buildId: number, lv: number) {
        return this.datas.find(v => v.buildid == buildId && v.level == lv);
    }

    getAllConfig(buildId: number) {
        let arr: BuildattributeConfig[] = [];
        this.datas.forEach(v => {
            if (v.buildid == buildId) {
                arr.push(v);
            }
        })
        return arr;
    }
}
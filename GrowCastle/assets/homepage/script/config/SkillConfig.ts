
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class SkillConfig implements BaseData {
    id: number;
    icon: string;
    type: number;
    name: string;
    text: string;
    /**id, 1基础2百分比,1单次2持续3常态,持续时间或0,参数*/
    parameter: [number, number, number, number, number][];
    cd: number;
    mp: number;
    area: number;
}

export class SkillConfigMgr extends BaseDataManager<SkillConfig> {

}
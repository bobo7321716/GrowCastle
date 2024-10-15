
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class AttributeConfig implements BaseData {
    id: number;
    attribute_explain: string;
    value_type: number;
    value: number;
}

export class AttributeConfigMgr extends BaseDataManager<AttributeConfig> {

}

import BaseDataManager, { BaseData } from "../manager/BaseData";

const { ccclass, property } = cc._decorator;

export default class FunctionlockConfig implements BaseData {
    id: number;
    wave: number;
    function: number;
    type: number;
}

export class FunctionlockConfigMgr extends BaseDataManager<FunctionlockConfig> {

}
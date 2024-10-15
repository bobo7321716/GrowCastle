
import BaseDataManager, { BaseData } from "../manager/BaseData";

const { ccclass, property } = cc._decorator;

export default class ArcherUpgradeConfig implements BaseData {
    id: number;
    upgradeCost: number;
}

export class ArcherUpgradeConfigMgr extends BaseDataManager<ArcherUpgradeConfig> {

}
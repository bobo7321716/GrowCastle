
import BaseDataManager, { BaseData } from "../manager/BaseData";

const { ccclass, property } = cc._decorator;

export default class PlayerLevelConfig implements BaseData {
    id: number;
    exp: number;
    prize: number[];
}

export class PlayerLevelConfigMgr extends BaseDataManager<PlayerLevelConfig> {

}

import BaseDataManager, { BaseData } from "../manager/BaseData";

const { ccclass, property } = cc._decorator;

export default class CastleConfig implements BaseData {
    id: number;
    hp: number;
    mp: number;
    mprecover: number;
    upgradeCost: number[];
    castle_01: string;
    castle_02: string;
    castle_03: string;
    castle_04: string;
    castle_05: string;
}

export class CastleConfigMgr extends BaseDataManager<CastleConfig> {

}
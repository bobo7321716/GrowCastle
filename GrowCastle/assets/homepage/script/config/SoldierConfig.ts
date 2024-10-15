
import BaseDataManager, { BaseData } from "../manager/BaseData";

const { ccclass, property } = cc._decorator;

export default class SoldierConfig implements BaseData {
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
}

export class SoldierConfigMgr extends BaseDataManager<SoldierConfig> {

}
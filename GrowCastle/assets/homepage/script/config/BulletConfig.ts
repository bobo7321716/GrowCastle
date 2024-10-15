
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class BulletConfig implements BaseData {
    id: number;
    picture: number;
    speed: number;
    scale: number;
    animId: number;
}

export class BulletConfigMgr extends BaseDataManager<BulletConfig> {

}

import { Global } from "../common/Global";
import BaseDataManager, { BaseData } from "../manager/BaseData";


export default class WaveConfig implements BaseData {
    id: number;
    wave: number;
    usewave: number;
    enemy: [number, number, number, number][];
    lastWave: number[];
    Ecastlpicture: string;
    EcastleHP: number;
    wavetype: number;
    wavetime: number;
    wavenum: number;
    background: number;
}

export class WaveConfigMgr extends BaseDataManager<WaveConfig> {

    getConfigArrByWaveType(type: Global.FightType) {
        let arr = [];
        this._datas.forEach(v => {
            if (v.wavetype == type) {
                arr.push(v)
            }
        })
        return arr;
    }
}
export type BaseData = {
    id?: number;
}

export class BaseRole {
    id: number = 0;
    hp: number = 0;
    mp: number = 0;
    atk: number = 0;
    atkSpeed: number = 0;
    atkInterval: number = 0;
    moveSpeed?: number = 0;
    bullet: number = 0;
    skill?: number = 0;
}

export default class BaseDataManager<T extends BaseData> {
    constructor(datas: T[]) { this.parse(datas) };
    protected _datas: T[] = [];

    public get datas() {
        return this._datas;
    }

    parse(datas: T[]) {
        this._datas = datas;
    }

    getDataById(id: number) {
        return this._datas.find(data => data.id == id);
    }
}
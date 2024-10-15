import { BundleName } from "../common/BundleName";
import { AbManager } from "../common/asssetsBundle/AbManager";
import { Config } from "../config/Config";
import BaseDataManager, { BaseData } from "./BaseData";


export default class DataManager {
    private constructor() { };
    private static _ins: DataManager = null;
    static get ins() {
        if (this._ins == null) {
            this._ins = new DataManager();
        }
        return this._ins;
    }

    private _dataMaps: Map<new (datas: BaseData[]) => BaseDataManager<BaseData>, BaseDataManager<BaseData>> = new Map();

    /**当前版本后缀 */
    private readonly remotePath = `https://cdn.hongshunet.com/zyh/GrowCastle/${(cc.sys.platform == cc.sys.WECHAT_GAME ? "wx/" : "web/") + appContext.version}/config/`;

    /**是否使用远程配置 */
    private isRemote: boolean = false;

    /**初始化数据管理类*/
    init() {
        // return Promise.resolve();
        this.isRemote = !CC_DEV;
        console.warn("this.isRemote ", this.isRemote)
        let promiseArr = [];
        for (const k in Config) {
            // console.log("k ", k)
            promiseArr.push(this.registerData(k, Config[k]));
        }
        return Promise.all(promiseArr).then(() => {
            console.log("this._dataMaps ", this._dataMaps)
        });
    }

    /**
     * 获取数据管理类
     * @param type 类型
     * @returns 数据管理类实例
     */
    get<T extends BaseDataManager<BaseData>>(type: new (datas: BaseData[]) => T) {
        return this._dataMaps.get(type) as T;
    }

    /**
     * 注册数据类
     * @param url 数据资源地址（json格式）
     * @param type 数据资源管理类
     */
    private registerData<T extends BaseDataManager<BaseData>>(url: string, type: new (datas: BaseData[]) => T) {
        return new Promise((resolve, reject) => {
            if (this.isRemote) {
                AbManager.loadRemote(this.remotePath + url + ".json?t=" + Date.now()).then((res: cc.JsonAsset) => {
                    this._dataMaps.set(type, new type(res.json));
                    resolve(null);
                })
            } else {
                AbManager.loadBundleRes(BundleName.Config, url, cc.JsonAsset).then((res: cc.JsonAsset) => {
                    this._dataMaps.set(type, new type(res.json));
                    resolve(null);
                })
            }
        })
    }
}
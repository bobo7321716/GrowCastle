import { BundleData } from "../BundleData";
import TipManager from "../TipManager";

export class AbManager {

    /**是否自动释放资源 */
    static isAutoReleaseAsset: boolean = false;

    //记录加载过的资源
    private static resUuidMap: Map<string, cc.Asset> = new Map();

    private static bundleMap: Map<string, Promise<cc.AssetManager.Bundle>> = new Map();

    public static getBundle(bundleName: string): Promise<cc.AssetManager.Bundle> {
        if (!bundleName) {
            return Promise.resolve(null);
        }

        let targetBundle = cc.assetManager.getBundle(bundleName);
        if (targetBundle) {
            return Promise.resolve(targetBundle);
        }

        if (this.bundleMap.has(bundleName)) {
            return this.bundleMap.get(bundleName);
        }

        let self = this;
        this.bundleMap.set(bundleName, new Promise<cc.AssetManager.Bundle>(
            (resolve, reject) => {
                cc.assetManager.loadBundle(bundleName, (error, bundle) => {
                    if (error) {
                        resolve(null);
                    } else {
                        resolve(bundle);
                    }
                    self.bundleMap.delete(bundleName);
                });
            }
        ));

        return this.bundleMap.get(bundleName);
    }

    private static loadSubIndex: number = 0;

    /**
     * 加载子包
     * @param bundleList 子包名称列表
     * ## 请确保子包列表已按照优先级排序
     */
    public static loadSubPackage(bundleList: Array<string>): Promise<boolean> {
        if (!bundleList || bundleList.length <= 0) {
            console.error("bundle list not exist or length less zero");
            return Promise.resolve(null);
        }
        this.loadSubIndex = 0;
        let self = this;
        return new Promise<boolean>(
            (resolve, reject) => {
                self.circleLoadBundle(bundleList, resolve);
            }
        );
    }

    private static circleLoadBundle(bundleList: Array<string>, resolve): void {
        let self = this;
        let bundleName = bundleList[self.loadSubIndex];
        this.getBundle(bundleName).then((bundle: cc.AssetManager.Bundle) => {
            if (!bundle) {
                self.circleLoadBundle(bundleList, resolve);
            } else {
                console.log("分包 " + bundleName + " 加载完成")
                self.loadSubIndex++;
                if (self.loadSubIndex < bundleList.length) {
                    self.circleLoadBundle(bundleList, resolve);
                    return;
                }
                resolve(true);
            }
        })
    }

    /**
     * 添加重试和超时的资源加载方法
     * @param retryTimes 重试次数
     * @param loadOutTime 超时时长（毫秒）
     * @param tipOutTime 提示超时时长（毫秒）
     * @returns 加载成功进resolve，返回资源，失败进reject，返回null
     */
    public static async loadBundleResWitchTimeout(bundleName: string, url: string, assetsType: typeof cc.Asset, isAddRef: boolean = true, retryTimes: number = 3, loadOutTime: number = 10000, tipOutTime: number = 2000): Promise<any> {
        let result: cc.AssetManager.Bundle = await this.getBundle(bundleName);
        if (!result) {
            console.error("can not get target bundle");
            return Promise.reject(null);
        }
        return new Promise((resolve, reject) => {
            let tipTimeOut = null;
            if (tipOutTime > 0) {
                tipTimeOut = setTimeout(() => {
                    TipManager.ins.showTip("资源加载中，请稍后");
                }, tipOutTime);
            }
            let isTimeOut: boolean = false;
            let loadTimeOut = setTimeout(() => {
                isTimeOut = true;
                console.warn("loadTimeOut", url)
                clearTimeout(tipTimeOut);
                reject(null);
            }, loadOutTime);

            let retry = 0;
            let retryCall = (asset: cc.Asset) => {
                if (asset) {
                    // console.warn("加载成功", url)
                    clearTimeout(loadTimeOut);
                    clearTimeout(tipTimeOut);
                    resolve(asset);
                } else {
                    if (!isTimeOut) {
                        retry++;
                        if (retry >= retryTimes) {
                            clearTimeout(loadTimeOut);
                            clearTimeout(tipTimeOut);
                            console.warn("加载失败", url)
                            reject(null);
                        } else {
                            setTimeout(() => {
                                this.loadBundleRes(bundleName, url, assetsType, isAddRef).then(retryCall);
                            }, 200);
                        }
                    }
                }
            }
            this.loadBundleRes(bundleName, url, assetsType, isAddRef).then(retryCall);
        })
    }

    /**
     * 加载某一bundle路径下的单一资源 
     * @param bundleName bundle名称
     * @param url bundle下的资源路径
     * @param assetType 资源类型
     * @param isAddRef 是否增加引用计数
     */
    public static async loadBundleRes(bundleName: string, url: string, assetType: typeof cc.Asset, isAddRef: boolean = true): Promise<any> {
        let bundle: cc.AssetManager.Bundle = await this.getBundle(bundleName);
        if (!bundle) {
            console.error("can not get target bundle");
            return Promise.resolve(null);
        }
        return new Promise<any>(
            (resolve, reject) => {
                bundle.load(url, assetType, (error, asset) => {
                    if (error) {
                        console.error("loadBundleRes 失败! bundleName : ", bundleName, " url : ", url, error);
                        resolve(null)
                    } else {
                        if (isAddRef && this.isAutoReleaseAsset) {
                            asset.addRef();
                            this.resUuidMap.set(asset._uuid, asset);
                        }
                        resolve(asset);
                    }
                });
            }
        );
    }

    /**加载资源,增加单个资源最小加载间隔
     * interval:最小加载间隔 毫秒 
     */
    public static loadAssetsAddInterval(bundleName: string, url: string, assetsType: typeof cc.Asset, interval: number = 500): Promise<any> {
        return new Promise((resolve, reject) => {
            let timer = Date.now();
            let loadPromise = this.loadBundleRes(bundleName, url, assetsType);
            let delayPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(null);
                }, interval);
            })
            Promise.all([loadPromise, delayPromise]).then(() => {
                console.log("loadPreAddInterval 加载耗时 ", url, Date.now() - timer);
                resolve(null);
            })
        })
    }

    /**
     * 加载某一bundle路径下某一文件夹下的所有资源
     * @param bundleName bundle名称
     * @param url bundle下的资源路径
     * @param type 指定需要加载的资源类型
     */
    public static async loadBundleDir(bundleName: string, url: string, type?: typeof cc.Asset): Promise<any> {
        let result: cc.AssetManager.Bundle = await this.getBundle(bundleName);
        if (!result) {
            console.error("can not get target bundle in loadBundleDir");
            return;
        }

        return new Promise<any>(
            (resolve, reject) => {
                if (type) {
                    result.loadDir(url, type, (error, assets: cc.Asset[]) => {
                        if (error) {
                            console.error("loadBundleDir 失败! bundleName : ", bundleName, " url : ", url);
                            resolve(null)
                        } else {
                            resolve(assets);
                        }
                    });
                } else {
                    result.loadDir(url, (error, assets: cc.Asset[]) => {
                        if (error) {
                            console.error("loadBundleDir 失败! bundleName : ", bundleName, " url : ", url);
                            resolve(null)
                        } else {
                            resolve(assets);
                        }
                    });
                }
            }
        );
    }


    /**
     * 预加载某一bundle路径下的单一资源 
     * @param bundleName bundle名称
     * @param url bundle下的资源路径
     * @param type 指定需要加载的资源类型
     */
    public static async preloadBundleRes(bundleName: string, url: string, type: typeof cc.Asset): Promise<any> {
        let result: cc.AssetManager.Bundle = await this.getBundle(bundleName);
        if (!result) {
            console.error("can not get target bundle");
            return Promise.resolve(null);
        }

        return new Promise<any>(
            (resolve, reject) => {
                result.preload(url, type, (error, items) => {
                    if (error) {
                        console.error("preloadBundleRes 失败! bundleName : ", bundleName, " url : ", url, error);
                        resolve(null)
                    } else {
                        resolve(items);
                    }
                });
            }
        );
    }


    /**
     * 预加载某一bundle路径下某一文件夹下的所有资源
     * @param bundleName bundle名称
     * @param url bundle下的资源路径
     * @param type 指定需要加载的资源类型
     */
    public static async preloadBundleDir(bundleName: string, url: string, type?: typeof cc.Asset): Promise<any> {
        let result: cc.AssetManager.Bundle = await this.getBundle(bundleName);
        if (!result) {
            console.error("can not get target bundle in loadBundleDir");
            return;
        }

        return new Promise<any>(
            (resolve, reject) => {
                if (type) {
                    result.preloadDir(url, type, (error, items) => {
                        if (error) {
                            console.error("preloadBundleDir 失败! bundleName : ", bundleName, " url : ", url);
                            resolve(null)
                        } else {
                            resolve(items);
                        }
                    });
                } else {
                    result.preloadDir(url, (error, items) => {
                        if (error) {
                            console.error("preloadBundleDir 失败! bundleName : ", bundleName, " url : ", url);
                            resolve(null)
                        } else {
                            resolve(items);
                        }
                    });
                }
            }
        );
    }

    /**预加载资源数组 */
    public static preloadAssets(preBundleDatas: BundleData[], assetsType: typeof cc.Asset): Promise<any> {
        let promiseArr = [];
        for (let i = 0; i < preBundleDatas.length; i++) {
            let bundleData = preBundleDatas[i];
            let preLoadPromise = this.preloadBundleRes(bundleData.bundle, bundleData.url, assetsType);
            promiseArr.push(preLoadPromise);
        }
        return Promise.all(promiseArr);
    }

    /**预加载资源,增加单个资源最小加载间隔
     * interval:最小加载间隔 毫秒
     */
    public static preloadAssetsAddInterval(preloadRes: { bundleName: string, url: string }[], assetsType: typeof cc.Asset, interval: number = 500): Promise<any> {
        return new Promise((resolve, reject) => {
            let index = 0;
            let timer = 0;
            let call = () => {
                timer = Date.now();
                let bundleData = preloadRes[index];
                let preLoadPromise = this.preloadBundleRes(bundleData.bundleName, bundleData.url, assetsType);
                let delayPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(null);
                    }, interval);
                })
                Promise.all([preLoadPromise, delayPromise]).then(() => {
                    console.log("preloadPreAddInterval 加载耗时 ", bundleData.url, Date.now() - timer);
                    index++;
                    if (index < preloadRes.length) {
                        call();
                    } else {
                        resolve(null);
                    }
                })
            }
            call();
        })
    }

    /**加载远程资源 */
    public static loadRemote(remoteUrl: string, assetsType?: typeof cc.Asset): Promise<any> {
        return new Promise<any>(
            (resolve, reject) => {
                cc.assetManager.loadRemote(remoteUrl, assetsType, (error, assets: cc.Asset) => {
                    if (error) {
                        console.error("loadRemote 失败! remoteUrl : ", remoteUrl, error);
                        resolve(null)
                    } else {
                        resolve(assets);
                    }
                });
            }
        );
    }

    public static loadBundleResArray(resInfo: { bundleName: string, url: string, assetsType: typeof cc.Asset, isAddRef: boolean }[]): Promise<any> {
        let loadArr = [];
        for (let data of resInfo) {
            loadArr.push(this.loadBundleRes(data.bundleName, data.url, data.assetsType, data.isAddRef));
        }
        return Promise.all(loadArr);
    }

    /**释放bundle内所有资源，移除bundle */
    public static async releaseBundle(bundleName: string) {
        let bundle: cc.AssetManager.Bundle = await this.getBundle(bundleName);
        if (!bundle) {
            console.error("can not get target bundle in loadBundleDir");
            return;
        }
        bundle.releaseAll();
        cc.assetManager.removeBundle(bundle);
    }

    /**回收资源时减少引用计数 */
    public static decRef(uuid: string, decCount: number = 1) {
        if (!this.isAutoReleaseAsset) return;
        let asset = this.resUuidMap.get(uuid);
        if (!asset) return;
        for (let i = 0; i < decCount; i++) {
            asset.decRef();
        }
        if (asset.refCount <= 0) {
            this.resUuidMap.delete(uuid);
        }
    }

}

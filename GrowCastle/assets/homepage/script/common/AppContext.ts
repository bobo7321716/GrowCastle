import WX from "../../../loading/script/WX";
import MainView from "../../../start/script/MainView";
import { ConstConfigMgr } from "../config/ConstConfig";
import DataManager from "../manager/DataManager";
import GuideManager from "../manager/GuideManager";
import HomeManager from "../manager/HomeManager";
import RedPointManager from "../manager/RedPointManager";
import { AudioManager } from "./AudioManager";
import { BundleName } from "./BundleName";
import GamingData from "./GamingData";
import { Global } from "./Global";
import LoadingProgressCol from "./LoadingProgressCol";
import { PlayerData } from "./PlayerData";
import { UIManager } from "./UIManager";
import { UiPath } from "./UiPath";
import { AbManager } from "./asssetsBundle/AbManager";

const { ccclass, property } = cc._decorator;

declare global {
    interface Window {
        appContext: AppContext;
    }
    export let appContext: AppContext;
}

@ccclass
export default class AppContext extends cc.Component {

    @property({ displayName: "版本号" })
    version: string = "0.0.1";

    @property(LoadingProgressCol)
    loadingCol: LoadingProgressCol = null;

    @property(cc.Node)
    mainNode: cc.Node = null;

    @property(cc.Node)
    mainCameraNode: cc.Node = null;

    @property(cc.Node)
    topCameraNode: cc.Node = null;

    @property(cc.Node)
    flyCameraNode: cc.Node = null;

    private loadList1: string[] = [BundleName.Font, BundleName.Config, BundleName.Assets, BundleName.Start, BundleName.Part1];

    private loadTimer: number = 0;

    public mainView: any = null;

    public isOnFight: boolean = false;

    /**当前远征收益 */
    private _curProfit: number = 0;
    public get curProfit(): number {
        return this._curProfit;
    }

    private _configSwitch = { "gm": true };
    public get configSwitch() {
        return this._configSwitch;
    }

    protected onLoad(): void {
        window.appContext = this;
        cc.game.addPersistRootNode(this.node);

        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;

        this.initShiftEvent();

        console.log("操作系统:", cc.sys.os);
        console.log("DEBUG:", CC_DEBUG);
        if (!CC_DEBUG) {//不是Debug包不用输出log
            // console.log = () => { };
        }

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            WX.init();
            wx.onMemoryWarning(function () {
                // console.error('内存告警! onMemoryWarningReceive');
                wx.triggerGC();
            })
        }
        this.gameInit();
        this.loadingCol.node.active = true;
    }

    triggerGc() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.triggerGC();
        }
    }

    public gameInit() {
        setInterval(() => {
            this.triggerGc();
            PlayerData.ins.saveData();
        }, 60000)
        this.loadingCol.startProgressAnim();
        this.topCameraNode.active = false;
        this.flyCameraNode.active = false;
        this.onLoadRes();
        //获取后台配置开关
        // HttpManager.send(`https://static.bgl.soletower.com/cdn/config/wx/${this.version}/ConfigSwitch.json?time=${Date.now()}`).then((json) => {
        //     if (json) {
        //         console.log("configSwitch ", json);
        //         this._configSwitch = json;
        //     }
        //     call();
        // }).catch(call);
    }

    initShiftEvent() {
        if (cc.sys.isBrowser) {
            cc.game.off(cc.game.EVENT_SHOW);
            cc.game.on(cc.game.EVENT_SHOW, () => {
                cc.game.canvas.focus();
                this.gameShowEvent();
            });
            cc.game.off(cc.game.EVENT_HIDE);
            cc.game.on(cc.game.EVENT_HIDE, this.gameHideEvent.bind(this));
        } else if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.offShow(this.gameShowEvent.bind(this));
            wx.offHide(this.gameHideEvent.bind(this));
            wx.onShow(this.gameShowEvent.bind(this));
            wx.onHide(this.gameHideEvent.bind(this));
        }
    }

    private gameHideEvent() {
        console.log('cc.game.EVENT_HIDE');
        AudioManager.ins.pauseAllSound();
        // PlayerData.ins.saveData();
        PlayerData.ins.lastLogOutTime = Date.now();
    }

    private gameShowEvent() {
        console.log('cc.game.EVENT_SHOW')
        AudioManager.ins.resumeAllSound();
    }

    /**
     * 加载资源
     */
    async onLoadRes(): Promise<any> {
        this.loadTimer = Date.now();
        await AbManager.loadSubPackage(this.loadList1);
        await DataManager.ins.init();
        PlayerData.ins.initData();
        console.log("第一步耗时 ： ", Date.now() - this.loadTimer);
        this.loadTimer = Date.now();
        await this.preloadAssets();
        HomeManager.ins.init()
        await UIManager.ins.openView(UiPath.MainView, true, false, this.mainNode).then((main: MainView) => {
            this.topCameraNode.active = false;
            main.init().then(() => {
                this.toStartBoard();
            });
            this.mainView = main;
            RedPointManager.ins.checkRedPoint();
            this.checkBattleProfit();

        })
    }

    toStartBoard() {
        this.loadingCol.finishProgress().then(() => {
            console.log('start --- load finish ----------------- 11');
            this.loadingCol.node.active = false;
            this.topCameraNode.active = true;
            // GamingData.isOnGuide = false;
            GuideManager.ins.init();
        })
    }

    preloadAssets() {
        return Promise.all([
            AbManager.preloadBundleDir(BundleName.Assets, "audios"),
            AbManager.preloadBundleDir(BundleName.Assets, "prefab/skill/skill2"),
            AbManager.preloadBundleRes(BundleName.Font, "WenQuanYi-Medium", cc.Font),
            AbManager.preloadAssets([UiPath.GuideView, UiPath.InfoUI, UiPath.ChooseHeroUI], cc.Prefab)
        ])
    }

    /**计算出征收益 */
    private interval: number = 0;
    private checkBattleProfit() {
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            let profit = GamingData.getTerritoryTotalProfit();
            let duration = Math.floor((Date.now() - PlayerData.ins.lastGetTerritoryRewardTime) / 1000 / 60);
            let configLimit = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.远征时长上限).value;
            configLimit = HomeManager.ins.getHomeTotalValue(Global.ArmamentAttribute.领地时长上限, configLimit);
            this._curProfit = Math.min(duration, configLimit / 60) * profit;
            if (this._curProfit > 0) RedPointManager.ins.checkRedPoint();
        }, 1000)
    }

    /**
     * 退出游戏
     */
    public exitGame() {
        PlayerData.ins.saveData();
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.exitMiniProgram({});
        } else {
            cc.game.end();
        }
    }

    clearDataClick() {
        cc.sys.localStorage.clear();
    }

    private lastObj = {};
    contrastAssetsMap() {
        console.warn("cc.assetManager.assets = ", cc.assetManager.assets)
        if (Object.keys(this.lastObj).length <= 0) {
            let obj = cc.assetManager.assets._map;
            for (const key in obj) {
                this.lastObj[key] = obj[key];
            }
            console.warn("this.lastObj = ", this.lastObj)
        } else {
            let arr = [];
            let newObj = cc.assetManager.assets._map;
            for (const key in newObj) {
                let has = key in this.lastObj;
                if (!has) {
                    // console.log(newObj[key]);
                    arr.push(newObj[key])
                }
            }
            this.lastObj = {};
            console.warn("newObj[key] = ", arr)
        }
    }
}

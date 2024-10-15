import SceneEventManager from "../manager/SceneEventManager";
import AnimationCol from "./AnimationCol";
import { BundleData } from "./BundleData";
import { BundleName } from "./BundleName";
import { Global } from "./Global";
import MyPool from "./MyPool";
import { UiBase } from "./UiBase";
import { UiPath } from "./UiPath";
import { Util } from "./Util";
import { WorldEventManager } from "./WorldEventManager";
import { AbManager } from "./asssetsBundle/AbManager";
import AbRef from "./asssetsBundle/AbRef";

const { ccclass, property } = cc._decorator;

@ccclass
export class UIManager extends cc.Component {

    @property(cc.Node)
    private viewPaNode: cc.Node = null;

    @property(cc.Node)
    private uiBlockNode: cc.Node = null;

    @property(cc.Node)
    private sceneBlockNode: cc.Node = null;

    @property(cc.Prefab)
    private touchPre: cc.Prefab = null;

    @property(cc.Node)
    maskNode: cc.Node = null;

    @property(cc.Sprite)
    upgradeSpr: cc.Sprite = null;

    private _isUiBlockInput: boolean = true;
    public get isUiBlockInput(): boolean {
        return this._isUiBlockInput;
    }
    private set isUiBlockInput(value: boolean) {
        this._isUiBlockInput = value;
        this.uiBlockNode.active = value;
    }

    /**全屏遮罩 */
    private _isSceneBlockInput: boolean = false;
    public get isSceneBlockInput(): boolean {
        return this._isSceneBlockInput;
    }
    public set isSceneBlockInput(value: boolean) {
        this._isSceneBlockInput = value;
        this.sceneBlockNode.active = value;
    }

    public static ins: UIManager = null;

    /**ui缩放 适配ipad等超宽屏幕时使用 */
    public adapScale: number = 1;

    /**等待操作的界面队列 */
    private operationViewQueue: { promise: any, bundleData: BundleData, operationType: UiOperationType, isNewLayer: boolean, paNode: cc.Node, pos: cc.Vec2, isImmediately: boolean }[] = [];
    /**当前打开的界面栈 */
    private viewStack: StackData[] = [];
    /**当前正在执行的任务 */
    private curTask: Promise<void> = Promise.resolve();

    public isOnMaskAnim: boolean = false;
    private _curTopBundleData: { data: BundleData; uiBase: UiBase } = null;
    public get curTopBundleData(): { data: BundleData; uiBase: UiBase } {
        return this._curTopBundleData;
    }
    private set curTopBundleData(value: { data: BundleData; uiBase: UiBase }) {
        this._curTopBundleData = value;
        // console.log("this._curTopBundleData = ", this._curTopBundleData)
        appContext.topCameraNode.active = appContext.isOnFight ? false : value.data.url == UiPath.MainView.url;
        SceneEventManager.ins.checkSceneEvent(value);
        WorldEventManager.triggerEvent(Global.EventEnum.TopUIChange, value);
    }

    protected onLoad(): void {
        UIManager.ins = this;
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this, true);
        this.isUiBlockInput = false;
        this.isSceneBlockInput = false;
        this.isOnMaskAnim = false;
        this.adapScale = Util.sceneAdaptation();
        this.viewStack = [];
    }

    private limmitTime = 0;
    private touchStart(event: cc.Event.EventTouch) {
        if (!this.touchPre || cc.sys.now() - this.limmitTime < 150) {
            return;
        }
        this.limmitTime = cc.sys.now();
        let touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        let touchEffect = MyPool.getObj(this.touchPre);
        touchEffect.setParent(this.node);
        touchEffect.setPosition(touchPos.x, touchPos.y);
        let animScr = touchEffect.getComponent(AnimationCol);
        if (animScr) {
            animScr.play();
        }
    }

    /**更新当前栈顶界面 */
    public refreshCurTopBundleData() {
        if (this.viewStack.length <= 0) {
            this.curTopBundleData = null;
        } else {
            let lastStack = this.viewStack[this.viewStack.length - 1];
            this.curTopBundleData = { data: lastStack.bundleData, uiBase: lastStack.uiBase };
        }
    }

    /**
     * 打开ui界面
     * @param uiData ui数据
     * @param isNewLayer 是否在新的层级打开，如果传false会隐藏栈顶界面再打开该界面，该界面关闭时会重新显示之前被隐藏的界面
     * @param paNode 指定ui界面的父节点，可能会导致curTopBundleData出错
     * * @param isImmediately 是否立刻打开（不播放动画）
     * @returns 
     */
    public openView(uiData: BundleData, isNewLayer: boolean = true, isImmediately: boolean = false, paNode: cc.Node = this.viewPaNode, pos: cc.Vec2 = cc.Vec2.ZERO): Promise<UiBase> {
        return new Promise((resolve, reject) => {
            let task = () => this.refreshOperationQueue({ promise: resolve, bundleData: uiData, operationType: UiOperationType.Open, isNewLayer: isNewLayer, paNode: paNode, pos: pos, isImmediately: isImmediately });
            this.curTask = this.curTask.then(task);
        })
    }

    /**关闭栈顶界面
     * @param isImmediately 是否立刻关闭（不播放动画）
     */
    public closeView(isImmediately: boolean = false) {
        return new Promise((resolve, reject) => {
            if (this.viewStack.length <= 0) {
                resolve && resolve(null);
                return;
            }
            let task = () => this.refreshOperationQueue({ promise: resolve, bundleData: this.viewStack[this.viewStack.length - 1].bundleData, operationType: UiOperationType.Close, isNewLayer: null, paNode: null, pos: null, isImmediately: isImmediately });
            this.curTask = this.curTask.then(task);
        })
    }

    /**关闭指定界面 如果界面存在，会先将界面移动到栈顶，然后移除 */
    public closeViewByBundleData(bundleData: BundleData, isImmediately: boolean = true) {
        return new Promise((resolve, reject) => {
            if (this.viewStack.length <= 0) {
                resolve && resolve(null);
                return;
            }
            let index = this.viewStack.findIndex(v => v.bundleData.url == bundleData.url);
            if (index < 0) {
                console.warn("未找到界面 ", bundleData);
                resolve && resolve(null);
                return;
            }
            let stackData = this.viewStack.splice(index, 1);
            this.viewStack.push(stackData[0]);
            let task = () => this.refreshOperationQueue({ promise: resolve, bundleData: this.viewStack[this.viewStack.length - 1].bundleData, operationType: UiOperationType.Close, isNewLayer: null, paNode: null, pos: null, isImmediately: isImmediately });
            this.curTask = this.curTask.then(task);
        })
    }

    refreshOperationQueue(info: { promise: any, bundleData: BundleData, operationType: UiOperationType, isNewLayer: boolean, paNode: cc.Node, pos: cc.Vec2, isImmediately: boolean }) {
        return new Promise<void>((resolve, reject) => {
            if (this.viewStack.length > 0) {
                if (info.operationType == UiOperationType.Open) {
                    let view = this.viewStack.find(v => v.bundleData.url == info.bundleData.url);
                    if (view) {
                        //当前要打开的界面已经打开
                        info.promise && info.promise(view.uiBase);
                        console.warn("界面已经打开 ", info.bundleData);
                        resolve();
                        return;
                    }
                } else if (info.operationType == UiOperationType.Close) {
                    let stackData = this.viewStack[this.viewStack.length - 1];
                    if (stackData.bundleData.url != info.bundleData.url) {
                        //无法关闭
                        info.promise && info.promise(null);
                        console.warn("当前要关闭的界面不是最上层无法关闭 ", info.bundleData);
                        resolve();
                        return;
                    }
                }
            }
            this.operationViewQueue.push(info);
            this.checkSceneStack().then(resolve);
        })
    }

    private checkSceneStack() {
        return new Promise((resolve, reject) => {
            let obj = this.operationViewQueue.shift();
            if (!obj) {
                return;
            }
            this.isUiBlockInput = true;
            let uiData = obj.bundleData;
            let uiResolve = obj.promise;
            if (obj.operationType == UiOperationType.Open) {
                this.getUi(uiData).then((node: cc.Node) => {
                    let uiBase = node.getComponent(UiBase);
                    if (!uiBase) {
                        console.warn("没有获取到baseUi--- ", uiData);
                        uiResolve && uiResolve(null);
                        resolve && resolve(null);
                        this.isUiBlockInput = false;
                        return;
                    }
                    node.setParent(obj.paNode);
                    node.setPosition(obj.pos);
                    node.setScale(1);
                    if (this.viewStack.length > 0) {
                        if (!obj.isNewLayer) {
                            this.viewStack[this.viewStack.length - 1].uiNode.active = false;
                            this.viewStack[this.viewStack.length - 1].uiBase.onClose();
                        } else {
                            this.viewStack[this.viewStack.length - 1].uiBase.onCover();
                        }
                    }
                    uiBase.onOpen();
                    this.curTopBundleData = { data: uiData, uiBase: uiBase };
                    this.viewStack.forEach(v => {
                        if (v.uiBase.bgMaskNode) v.uiBase.bgMaskNode.active = false;
                    })
                    if (uiBase.bgMaskNode) uiBase.bgMaskNode.active = true;
                    let stackData = new StackData(uiData, uiBase, node, obj.isNewLayer);
                    this.viewStack.push(stackData);
                    obj.promise && obj.promise(uiBase);
                    uiBase.openAnimNode && uiBase.openAnimNode.setScale(0);
                    uiBase.openPrepare().then(() => {
                        this.uiOpenAnim(stackData, obj.isImmediately).then(() => {
                            uiBase.onOpenFinish();
                            resolve && resolve(null);
                            this.isUiBlockInput = false;
                        });
                    });
                }).catch(() => {
                    console.warn("界面加载失败 ", uiData);
                    obj.promise && obj.promise(null);
                    resolve && resolve(null);
                    this.isUiBlockInput = false;
                })
            } else if (obj.operationType == UiOperationType.Close) {
                if (this.viewStack.length <= 0) {
                    obj.promise && obj.promise();
                    resolve && resolve(null);
                    this.isUiBlockInput = false;
                    return;
                }
                let view = this.viewStack.pop();
                view.uiBase.onClose();
                view.uiBase.closeCb();
                let stackData = new StackData(view.bundleData, view.uiBase, view.uiNode, view.isNewLayer);
                this.uiCloseAnim(stackData, obj.isImmediately).then(() => {
                    view.uiBase.onCloseFinish();
                    this.decUi(view.uiNode);
                    if (this.viewStack.length > 0) {
                        let lastStack = this.viewStack[this.viewStack.length - 1];
                        this.curTopBundleData = { data: lastStack.bundleData, uiBase: lastStack.uiBase };
                        if (!view.isNewLayer) {
                            lastStack.uiNode.active = true;
                            lastStack.uiBase.onOpen();
                        } else {
                            lastStack.uiBase.onUncover();
                        }
                        if (lastStack.uiBase.bgMaskNode) {
                            lastStack.uiBase.bgMaskNode.active = true;
                        }
                    } else {
                        this.curTopBundleData = null;
                    }
                    obj.promise && obj.promise(view.uiBase);
                    resolve && resolve(null);
                    this.isUiBlockInput = false;
                })
            }
        })
    }

    private uiOpenAnim(stackData: StackData, isImmediately: boolean): Promise<StackData> {
        if (!stackData || !stackData.uiBase) {
            return Promise.resolve(null);
        }
        if (isImmediately) {
            if (stackData.uiBase.openAnimNode) {
                stackData.uiBase.openAnimNode.stopAllActions();
                stackData.uiBase.openAnimNode.setScale(1);
            }
            return Promise.resolve(null);
        }
        if (!stackData.uiBase.openAnimNode) {
            return Promise.resolve(stackData);
        } else {
            return new Promise((resolve, reject) => {
                stackData.uiBase.openAnimNode.stopAllActions();
                stackData.uiBase.openAnimNode.setScale(0);
                this.isUiBlockInput = true;
                cc.tween(stackData.uiBase.openAnimNode)
                    .to(0.5, { scale: 1 }, { easing: "backOut" })
                    .call(() => {
                        this.isUiBlockInput = false;
                        resolve(stackData);
                    })
                    .start()
            })
        }
    }

    public uiCloseAnim(stackData: StackData, isImmediately: boolean): Promise<StackData> {
        if (!stackData || !stackData.uiBase) {
            return Promise.resolve(null);
        }
        if (isImmediately) {
            return Promise.resolve(null);
        }
        if (!stackData.uiBase.openAnimNode) {
            return Promise.resolve(stackData);
        } else {
            stackData.uiBase.openAnimNode.stopAllActions();
            return new Promise((resolve, reject) => {
                stackData.uiBase.openAnimNode.setScale(1);
                this.isUiBlockInput = true;
                cc.tween(stackData.uiBase.openAnimNode)
                    .to(0.5, { scale: 0 }, { easing: "backIn" })
                    .call(() => {
                        this.isUiBlockInput = false;
                        resolve(stackData);
                    })
                    .start()
            })
        }
    }

    /**加载ui界面 */
    private getUi(bundleData: BundleData) {
        return new Promise((resolve, reject) => {
            AbManager.loadBundleResWitchTimeout(bundleData.bundle, bundleData.url, cc.Prefab).then((pre) => {
                // console.warn("pre ", pre)
                resolve(cc.instantiate(pre));
            }).catch(() => {
                console.warn("reject")
                reject();
            });
        })
    }

    /**回收ui界面 */
    private decUi(uiNode: cc.Node) {
        uiNode.walk((cNode: cc.Node) => {
            let abRef = cNode.getComponent(AbRef);
            if (abRef) abRef.decRef();
        }, null)
        AbManager.decRef(uiNode._prefab.asset._uuid);
        uiNode.removeFromParent(false);
        uiNode.destroy();
    }

    /**
     * 全屏黑色遮罩动画 渐显->渐隐
     * @param time 动画时间
     * @param midCb 屏幕完全变黑时的回调
     * @param endCb 动画结束的回调
     * @returns 
     */
    public showMaskAnim(time: number, midCb: () => void = null, endCb: () => void = null) {
        if (this.isOnMaskAnim) return;
        this.isOnMaskAnim = true;
        this.isUiBlockInput = true;
        cc.tween(this.maskNode)
            .to(time, { opacity: 255 })
            .call(() => {
                midCb && midCb();
            })
            .to(time, { opacity: 0 })
            .call(() => {
                endCb && endCb()
                this.isUiBlockInput = false;
                this.isOnMaskAnim = false;
            })
            .start()
    }

    /**
     * 全屏渐显动画
     * @param cb 动画完成回调
     * @param duration 动画时长
     * @returns 
     */
    public showMask(cb?: () => void, duration = 0.5) {
        if (this.isOnMaskAnim) return;
        this.isOnMaskAnim = true;
        this.isUiBlockInput = true;
        this.maskNode.stopAllActions();
        cc.tween(this.maskNode)
            .to(duration, { opacity: 255 })
            .call(() => {
                this.isOnMaskAnim = false;
                cb && cb();
            })
            .start();
    }

    /**
     * 全屏渐隐动画
     * @param cb 动画完成回调
     * @param duration 动画时长
     * @returns 
     */
    public hideMask(cb?: () => void, duration = 0.5) {
        if (this.isOnMaskAnim) return;
        this.isOnMaskAnim = true;
        this.maskNode.stopAllActions();
        cc.tween(this.maskNode)
            .to(duration, { opacity: 0 })
            .call(() => {
                this.isUiBlockInput = false;
                this.isOnMaskAnim = false;
                cb && cb();
            })
            .start();
    }

    /**升级特效 */
    public showUpgradeEffect(type: number) {
        this.upgradeSpr.node.stopAllActions();
        this.upgradeSpr.node.opacity = 0;
        this.upgradeSpr.node.setScale(3);
        AbManager.loadBundleRes(BundleName.Assets, "texture/effect/shengji_0" + type, cc.SpriteFrame).then(spf => {
            this.upgradeSpr.spriteFrame = spf;
            cc.tween(this.upgradeSpr.node)
                .parallel(
                    cc.tween().to(0.2, { scale: 1 }),
                    cc.tween().to(0.2, { opacity: 255 })
                )
                .delay(1)
                .to(0.3, { opacity: 0 })
                .start()
        })
    }
}

export class StackData {

    public bundleData: BundleData = null;
    public uiBase: UiBase = null;
    public uiNode: cc.Node = null;
    public isNewLayer: boolean = true;

    constructor(bundleData: BundleData, uiBase: UiBase, uiNode: cc.Node, isNewLayer: boolean) {
        this.bundleData = bundleData;
        this.uiBase = uiBase;
        this.uiNode = uiNode;
        this.isNewLayer = isNewLayer;
    }
}

export enum UiType {
    BOARD,
    DIALOG,
    POPUP,
    SCENE
}

export enum UiOperationType {
    Open,
    Close
}

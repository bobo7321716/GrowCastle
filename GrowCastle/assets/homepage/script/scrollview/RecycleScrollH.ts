const { ccclass, property } = cc._decorator;

/** 
 * 循环+分帧 滑动面板 横向 
 */
@ccclass
export default class RecycleScrollH extends cc.Component {
    /** item预制 */
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    /** item间隔 */
    @property(cc.Vec2)
    spacing: cc.Vec2 = null;

    /** item数量 */
    private _numItems: number = 0;
    public get numItems() {
        return this._numItems;
    }
    public set numItems(value: number) {
        this._numItems = value;
        this._hideAllItems();
        this.scheduleOnce(() => {
            this._initialize();
            this._updateContentHeight();
        });
        this.updateAllItems();
    }

    /** 视图内显示列数 */
    private _viewCol: number = 0;
    /** 视图内显示行数 */
    private _viewRow: number = 0;
    /** 视图窗宽 */
    private _viewW: number = 0;
    /** 视图窗高 */
    private _viewH: number = 0;
    /** item格子宽 */
    private _itemW: number = 0;
    /** item格子高 */
    private _itemH: number = 0;
    /** content上一次x坐标 */
    private _lastPosX: number = 0;
    /** 是否已初始化 */
    private _isInit: boolean = false;
    /** item的index */
    private _itemsUUIDToIndex: { [uuid: string]: number } = {};

    /** item列表 */
    public itemList: cc.Node[] = [];
    /** item父节点 */
    public content: cc.Node = null;

    /** item刷新回调 */
    public onItemRender(index: number, node: cc.Node) { }
    /** item点击回调 */
    public onItemClicked(index: number, node: cc.Node) { }

    /** 刷新所有item */
    public updateAllItems() {
        this.itemList.forEach((item: cc.Node, index: number) => {
            this._updateItem(this._itemsUUIDToIndex[item.uuid], item);
        });
    }

    private _hideAllItems() {
        this.itemList.forEach((item: cc.Node, index: number) => {
            item.active = false;
        });
    }

    /** 获取content */
    private _getContent() {
        return this.node.getComponent(cc.ScrollView).content;
    }

    /** 初始化 */
    private _initialize() {
        if (this._isInit) return;
        const scroll = this.node.getComponent(cc.ScrollView);
        scroll.enabled = false;
        this._isInit = true;
        const content = this._getContent();
        this.content = content;
        this._viewW = content.parent.width;
        this._viewH = content.parent.height;

        const itemData = this.itemPrefab.data;
        this._itemW = itemData.width + this.spacing.x;
        this._itemH = itemData.height + this.spacing.y;

        this._lastPosX = content.y;
        this._viewRow = Math.floor(this._viewH / this._itemH);
        this._viewCol = Math.ceil(this._viewW / this._itemW) + 1;
        const surplusH = this._viewH - (this._viewRow * this._itemH);
        const startPos = cc.v2(this._itemW >> 1, (this._viewH >> 1) - (this._itemH >> 1) - (surplusH >> 1));

        const cNum = this._viewRow * this._viewCol;
        cc.log(`实例化数量:${cNum}`);

        let createNum = 0;
        const createFunc = (index: number) => {
            if (!cc.isValid(content)) return; //异步创建，创建完回来父节点有可能已经被销毁 
            const item = cc.instantiate(this.itemPrefab);
            item.parent = content;
            const x = Math.floor(index / this._viewRow) * this._itemW + (this.spacing.x >> 1);
            const y = (index % this._viewRow) * this._itemH;
            const pos = startPos.add(cc.v2(x, y));
            item.setPosition(pos);
            item.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
                this.onItemClicked(this._itemsUUIDToIndex[item.uuid], item);
            }, this);
            this.itemList.push(item);

            this._updateItem(index, item);

            this._itemsUUIDToIndex[item.uuid] = index;

            createNum++;
            if (createNum == cNum) {
                scroll.enabled = true;
            }
        }
        /** 分帧创建item */
        frameLoad(cNum, createFunc, 8);
    }

    /** 更新centent高度 */
    private _updateContentHeight() {
        const content = this._getContent();
        const row = Math.floor(this._viewH / this._itemH);
        const col = Math.ceil(this.numItems / row);
        content.width = col * (this.itemPrefab.data.width + this.spacing.x) - (this.spacing.x);
    }

    /** 获取item在view坐标系的对标 */
    private _getPosInView(item: cc.Node) {
        const content = this._getContent();
        const view = content.parent;
        const wpos = content.convertToWorldSpaceAR(item.position);
        const lpos = view.convertToNodeSpaceAR(wpos);
        return lpos;
    }

    /** 更新item */
    private _updateItem(index: number, item: cc.Node) {
        const isShow = index >= 0 && index < this.numItems;
        item.active = isShow;
        if (isShow) {
            this.onItemRender(index, item);
        }
    }

    public update(dt: number) {
        const content = this._getContent();
        const currX = content.x;
        const dtX = currX - this._lastPosX;
        this._lastPosX = currX;
        if (dtX == 0) return;
        const isRight = dtX > 0;
        const itemsLen = this.itemList.length;
        for (let i = 0; i < itemsLen; ++i) {
            const item = this.itemList[i];
            const posInView = this._getPosInView(item);
            const viewHalfW = this._viewW >> 1;
            const itemHalfW = this._itemW >> 1;
            const lastIndex = this._itemsUUIDToIndex[item.uuid];
            let currIndex = lastIndex;
            if (!isRight) {
                if (posInView.x <= -viewHalfW - itemHalfW) {
                    item.x += (this._viewCol * this._itemW);
                    currIndex = lastIndex + itemsLen;
                }
            } else {
                if (posInView.x >= viewHalfW + itemHalfW) {
                    item.x -= (this._viewCol * this._itemW);
                    currIndex = lastIndex - itemsLen;
                }
            }
            if (currIndex != lastIndex) {
                this._updateItem(currIndex, item);
            }
            this._itemsUUIDToIndex[item.uuid] = currIndex;
        }
    }
}

/** 分帧执行 */
function frameLoad(loopTimes: number, func: Function, frameTime: number = 16, __index: number = 0) {
    let loop = loopTimes;
    let start = new Date().getTime();
    let end = 0;
    let dt = 0;
    for (let i = 0; i < loop; ++i) {
        if (__index >= loop) {
            break;
        }
        try {
            func && func(__index);
        } catch (e) {
            cc.error(e);
        }
        __index++;
        end = new Date().getTime();
        dt = end - start;
        if (dt > frameTime) {
            setTimeout(() => {
                frameLoad(loop, func, frameTime, __index);
            }, 10);
            break;
        }
    }
}


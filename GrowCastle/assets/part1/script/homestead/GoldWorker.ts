// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { BundleName } from "../../../homepage/script/common/BundleName";
import { Global } from "../../../homepage/script/common/Global";
import MyPool from "../../../homepage/script/common/MyPool";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import { Util } from "../../../homepage/script/common/Util";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import HomeManager from "../../../homepage/script/manager/HomeManager";
import AnimCol from "../../../start/script/skill/AnimCol";

const { ccclass, property } = cc._decorator;
/**矿工 */
@ccclass
export default class GoldWorker extends cc.Component {

    @property(AnimCol)
    ssAnimCol: AnimCol = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null

    startPos: cc.Vec2;
    endPos: cc.Vec2;


    gold: number = 1;

    movetime = 1

    current: number = 0;

    //0是建筑到矿,1是挖矿,2是矿到建筑
    state = 0;
    pos: cc.Vec2 = cc.v2(0, 0)

    delay = 0;


    /**初始化 */
    init(_time: number, _gold: number, _startPos: cc.Vec2, _endpos: cc.Vec2, _delay: number, _isleft: boolean) {

        this.gold = _gold;
        this.movetime = _time / 3;
        this.startPos = _startPos;
        this.endPos = _endpos;
        this.spine.node.scaleX = _isleft ? 1 : -1
        this.unscheduleAllCallbacks();
        this.delay = _delay;
        this.spine.setAnimation(0, "run_front", true)
        this.state = 0;
        this.current = 0;
        this.node.setPosition(_startPos)

    }

    /**刷新数据 */
    refreshData(_time: number, _gold: number) {
        this.gold = _gold;
        this.movetime = _time / 3;
    }



    action(dt: number) {

        if (this.delay > 0) {
            this.delay -= dt;
            return;
        }
        dt = (dt / this.movetime) * (1 + HomeManager.ins.getPrecentValue(Global.ArmamentAttribute.矿工挖矿速度));



        if (this.current >= 1) {

            this.current = 0;
            switch (this.state) {
                case 0:
                    this.state = 1;
                    this.spine.setEventListener((event) => {
                        if (event.animation.name == "work") {
                            this.ssAnimCol.node.active = true;
                            this.ssAnimCol.play().then(() => {
                                this.ssAnimCol.node.active = false;
                            });
                        }
                    })
                    this.spine.setAnimation(0, "work", true)
                    break;
                case 1:
                    this.spine.setAnimation(0, "run_back", true)
                    this.state = 2;
                    break;
                case 2:
                    this.state = 0;
                    this.spine.setAnimation(0, "run_front", true)
                    this.getCoin(this.gold);
                    break;
            }

        }

        switch (this.state) {
            case 0:
                this.pos = Util.lerp(this.current, this.startPos, this.endPos) as cc.Vec2;
                break;
            case 2:
                this.pos = Util.lerp(this.current, this.endPos, this.startPos) as cc.Vec2;
                break;
        }

        this.current += dt;
        // this.node.zIndex = - this.pos.y
        this.node.setPosition(this.pos);

    }




    /**创建金币获得提示 */
    getCoin(_num: number) {
        console.log("buff", HomeManager.ins.getPrecentValue(Global.ArmamentAttribute.矿工挖矿铜币数量))
        _num = _num * (1 + HomeManager.ins.getPrecentValue(Global.ArmamentAttribute.矿工挖矿铜币数量));
        PlayerData.ins.changeItemNum(Global.ItemId.Coin, _num);
        AbManager.loadBundleRes(BundleName.Part1, "prefab/homestead/GoldTip", cc.Prefab).then((_prefab) => {
            let _tip = MyPool.getObj(_prefab);
            cc.Tween.stopAllByTarget(_tip);
            _tip.parent = this.node.parent;
            let _pos = this.node.position;
            _tip.position = _pos;
            _tip.opacity = 255;
            _tip.getComponentInChildren(cc.Label).string = "+" + _num.toFixed(2);



            let _t = cc.tween;

            _t(_tip).parallel(
                _t().to(1, { opacity: 0 }),
                _t().to(1, { position: _pos.add(cc.v3(0, 100, 0)) }).call(() => MyPool.putObj(_tip))
            ).start()


        })
    }
}

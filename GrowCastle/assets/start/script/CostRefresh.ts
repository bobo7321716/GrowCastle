
const { ccclass, property } = cc._decorator;

@ccclass
export default class CostRefresh extends cc.Component {

    @property(cc.Label)
    costLab: cc.Label = null;

    @property(cc.Sprite)
    coinSpr: cc.Sprite = null;
}

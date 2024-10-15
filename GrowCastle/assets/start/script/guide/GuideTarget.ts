
const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideTarget extends cc.Component {

    @property
    flag: string = "";
}


const { ccclass, property } = cc._decorator;

@ccclass
export default class MyToggleBtn extends cc.Component {

    @property(cc.Label)
    nameLabs: cc.Label[] = [];

    init(name: string) {
        if (this.nameLabs.length > 0) {
            this.nameLabs.forEach(v => {
                v.string = name;
            })
        }
    }
}

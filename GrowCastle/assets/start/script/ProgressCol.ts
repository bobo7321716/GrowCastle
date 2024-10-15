
const { ccclass, property } = cc._decorator;

@ccclass
export default class ProgressCol extends cc.Component {

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;

    @property(cc.Sprite)
    bar: cc.Sprite = null;

    @property(cc.Label)
    proLab: cc.Label = null;

    @property(cc.Label)
    numLab: cc.Label = null;

    @property({ displayName: "是否向上取整" })
    isCeil: boolean = false;

    private total: number = 0;
    private curNum: number = 0;
    private isOnAnim: boolean = false;
    private speed: number = 10;
    private tarNum: number = 0;
    private cb: () => void = null;
    private dir: number = 1;

    init(total: number) {
        this.curNum = this.total = total;
        this.refreshBar();
    }

    change(changeNum: number, isAnim: boolean = false, cb: () => void = null) {
        if (isAnim) {
            this.dir = changeNum > 0 ? 1 : -1;
            this.cb = cb;
            this.tarNum = cc.misc.clampf(this.curNum += changeNum, 0, this.total);
            this.isOnAnim = true;
        } else {
            this.curNum = cc.misc.clampf(this.curNum += changeNum, 0, this.total);
            this.refreshBar();
        }
    }

    setCurNum(num: number, isAnim: boolean = false, cb: () => void = null) {
        if (isAnim) {
            this.dir = num > this.curNum ? 1 : -1;
            this.cb = cb;
            this.tarNum = cc.misc.clampf(num, 0, this.total);
            this.isOnAnim = true;
        } else {
            this.curNum = cc.misc.clampf(num, 0, this.total);
            this.refreshBar();
        }
    }

    private refreshBar() {
        this.bar.fillRange = this.curNum / this.total;
        if (this.proLab) this.proLab.string = (this.isCeil ? Math.ceil(this.curNum / this.total * 100) : Math.floor(this.curNum / this.total * 100)) + "%";
        if (this.numLab) this.numLab.string = (this.isCeil ? Math.ceil(this.curNum) : Math.floor(this.curNum)) + "";
    }

    protected update(dt: number): void {
        if (!this.isOnAnim) return;
        this.curNum += dt * this.speed * this.dir;
        if (this.dir == 1 && this.curNum >= this.tarNum || this.dir == -1 && this.curNum <= this.tarNum) {
            this.curNum = this.tarNum;
            this.isOnAnim = false;
            this.cb && this.cb();
        }
        this.refreshBar();
    }
}

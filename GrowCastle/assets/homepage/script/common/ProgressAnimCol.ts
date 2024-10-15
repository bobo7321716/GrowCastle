
const { ccclass, property } = cc._decorator;

@ccclass
export default class ProgressAnimCol extends cc.Component {

    @property(cc.Label)
    proLab: cc.Label = null;

    @property(cc.ProgressBar)
    proBar: cc.ProgressBar = null;

    @property(cc.Sprite)
    barSpr: cc.Sprite = null;

    @property(cc.Node)
    pendant: cc.Node = null;

    @property
    initPro: number = 0;

    @property
    speed: number = 0.01;

    private isOnAnim: boolean = false;
    private target: number = 0;
    private upgradeNum: number = 0;
    private timer: number = 0;
    private upgrageCb: () => void = null;
    private endCb: () => void = null;
    private progressCb: (value: number) => void = null;

    private _curProgress: number = 0;
    public get curProgress(): number {
        return this._curProgress;
    }
    public set curProgress(value: number) {
        this._curProgress = value;
        this.proBar.progress = value;
        this.barSpr.fillRange = value;
        if (this.proLab) {
            // this.proLab.string = (value * 100).toFixed(0) + "%";
            this.proLab.string = Math.floor(value * 100) + "%";
        }
        if (this.pendant) {
            let fixWidth = this.barSpr.node.width - 40;
            this.pendant.x = -fixWidth / 2 + value * fixWidth;
        }
        this.progressCb && this.progressCb(value);
    }

    public init(): void {
        this.curProgress = this.initPro;
        this.isOnAnim = false;
        this.target = null;
    }

    public setProgress(value: number) {
        this.isOnAnim = false;
        this.curProgress = value;
    }

    public progressAnim(targetPro: number, upgradeNum: number = 0, upgrageCb: () => void = null, endCb: () => void = null, progressCb: (value: number) => void = null) {
        this.upgradeNum = upgradeNum;
        this.upgrageCb = upgrageCb;
        this.endCb = endCb;
        this.progressCb = progressCb;

        if (this.curProgress >= targetPro && upgradeNum == 0) {
            this.endCb && this.endCb();
            this.endCb = null;
            return;
        }
        this.timer = 0;
        this.isOnAnim = true;
        this.target = targetPro;
    }

    protected update(dt: number): void {
        if (!this.isOnAnim) return;
        this.curProgress += dt * this.speed;
        if (this.upgradeNum > 0 && this.timer < this.upgradeNum) {
            if (this.curProgress >= 1) {
                this.timer++;
                this.curProgress = 0;
                this.upgrageCb && this.upgrageCb();
            }
        } else {
            if (this.curProgress >= this.target) {
                this.isOnAnim = false;
                this.curProgress = this.target;
                this.target = null;
                this.endCb && this.endCb();
                this.endCb = null;
                this.upgrageCb = null;
                this.progressCb = null;
            }
        }
    }
}

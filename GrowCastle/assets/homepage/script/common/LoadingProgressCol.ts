
/**加载进度条 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingProgressCol extends cc.Component {

    @property(cc.Label)
    private progressLabel: cc.Label = null;

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    @property(cc.Sprite)
    barSpr: cc.Sprite = null;

    @property
    private initProgress: number = 0;

    private isStart: boolean = false;
    private isFinish: boolean = false;
    private resolve: any = null;
    private curProgress: number = 0;

    public startProgressAnim() {
        this.node.active = true;
        this.isStart = true;
        this.curProgress = this.initProgress;
        this.progressBar.progress = this.curProgress;
        this.barSpr.fillRange = this.curProgress;
    }

    public finishProgress() {
        this.isFinish = true;
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
        })
    }

    public update(dt: number): void {
        if (!this.isStart) {
            return;
        }

        if (this.isFinish) {
            this.curProgress += 0.1;
        } else {
            if (this.curProgress <= 0.99) {
                this.curProgress += ((1 - this.curProgress) / 500);
            }
        }
        if (this.curProgress > 1) {
            console.log("LoadingCol.ts=>update:进度条已满");
            this.curProgress = 1;
        }

        let proLabel = this.curProgress * 100;
        let pre = Number(proLabel.toFixed(0));
        this.progressLabel.string = Math.min(99, pre) + "%";
        this.progressBar.progress = this.curProgress;
        this.barSpr.fillRange = this.curProgress;

        if (this.curProgress >= 1 && this.isStart) {
            console.log("进度条结束")
            this.isStart = false;
            this.isFinish = false;
            this.resolve();
        }
    }

    public hideLoadNode() {
        this.node.active = false;
    }

}

import WX from "../../../loading/script/WX";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GaBtnCol extends cc.Component {

    @property(cc.Node)
    videoNode: cc.Node = null;

    @property(cc.Node)
    shareNode: cc.Node = null;

    @property({ displayName: "tag" })
    tag: string = "";

    @property({ displayName: "page" })
    page: string = "";

    @property({ displayName: "成功回调", type: cc.Component.EventHandler })
    sucCb: cc.Component.EventHandler[] = [];

    private isVideo: boolean = true;

    protected onEnable(): void {
        let hasVideo = WX.showIsVideo();
        let isNextVideo = WX.showNextVideo(this.tag);
        this.isVideo = hasVideo && isNextVideo;
        this.videoNode.active = this.isVideo;
        this.shareNode.active = !this.isVideo;
    }

    adClick() {
        WX.showVideo(this.tag, this.page, this.isVideo, () => {
            this.sucCb.forEach((value: cc.Component.EventHandler, index: number, array: cc.Component.EventHandler[]) => {
                value.emit([this.node, value.customEventData]);
            });
        })
    }
}

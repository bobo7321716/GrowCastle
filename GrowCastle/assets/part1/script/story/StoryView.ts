import { BundleName } from "../../../homepage/script/common/BundleName";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { UiBase } from "../../../homepage/script/common/UiBase";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import StoryConfig, { StoryConfigMgr } from "../../../homepage/script/config/StoryConfig";
import DataManager from "../../../homepage/script/manager/DataManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StoryView extends UiBase {

    @property(cc.Sprite)
    roleSpr: cc.Sprite = null;

    @property(cc.Label)
    nameLab: cc.Label = null;

    @property(cc.Label)
    descLab: cc.Label = null;

    @property(cc.Node)
    tagNode: cc.Node = null;

    @property(cc.Button)
    sceneBtn: cc.Button = null;

    private configArr: StoryConfig[] = [];
    private interval: number = 0;
    private index = 0;
    private resolve: (value: unknown) => void = null;
    protected readonly byteInterval: number = 100;
    private isOnByteAnim: boolean = false;

    init(group: number) {
        return new Promise((resolve, reject) => {
            this.reset();
            this.configArr = DataManager.ins.get(StoryConfigMgr).getStoryConfigArr(group);
            if (!this.configArr) return resolve(null);
            this.index = 0;
            this.playStory();
            this.tagNode.stopAllActions();
            this.tagNode.opacity = 0;
            cc.tween(this.tagNode)
                .repeatForever(
                    cc.tween()
                        .by(0.3, { y: 10 })
                        .by(0.3, { y: -10 })
                )
                .start()
            this.resolve = resolve;
        });
    }

    playStory() {
        if (this.index >= this.configArr.length) {
            this.resolve && this.resolve(null);
            UIManager.ins.closeView();
            return;
        }
        if (this.isOnByteAnim) return;
        this.isOnByteAnim = true;
        this.tagNode.opacity = 0;
        let config = this.configArr[this.index];
        this.sceneBtn.interactable = false;
        AbManager.loadBundleRes(BundleName.Assets, "texture/storyDraw/" + config.roleId, cc.SpriteFrame).then(spf => {
            this.nameLab.string = config.name;
            this.roleSpr.spriteFrame = spf;
            let byteIndex = 0;
            this.interval = setInterval(() => {
                if (byteIndex >= config.desc.length) {
                    this.index++;
                    this.tagNode.opacity = 255;
                    clearInterval(this.interval);
                    this.isOnByteAnim = false;
                } else {
                    byteIndex++;
                    this.descLab.string = config.desc.slice(0, byteIndex);
                }
            }, this.byteInterval);
            this.sceneBtn.interactable = true;
        })
    }

    sceneClick() {
        clearInterval(this.interval);
        this.interval = null;
        if (this.index >= this.configArr.length) {
            this.resolve && this.resolve(null);
            UIManager.ins.closeView();
            return;
        }
        if (this.isOnByteAnim) {
            this.isOnByteAnim = false;
            this.descLab.string = this.configArr[this.index].desc;
            this.index++;
            this.tagNode.opacity = 255;
        } else {
            this.playStory();
        }
    }

    reset() {
        this.roleSpr.spriteFrame = null;
        this.nameLab.string = "";
        this.descLab.string = "";
        this.tagNode.stopAllActions();
        this.configArr = [];
        clearInterval(this.interval);
        this.interval = null;
    }
}

import { AudioManager } from "../../homepage/script/common/AudioManager";
import { BundleName } from "../../homepage/script/common/BundleName";
import { Global } from "../../homepage/script/common/Global";
import { SoundPath } from "../../homepage/script/common/SoundPath";
import { WorldEventManager } from "../../homepage/script/common/WorldEventManager";
import { AbManager } from "../../homepage/script/common/asssetsBundle/AbManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillDisplay extends cc.Component {

    @property(cc.Sprite)
    roleSprs: cc.Sprite[] = [];

    private heroId: number = 0;
    private onAnimIndex: number[] = [];

    protected onEnable(): void {
        WorldEventManager.addListener(Global.EventEnum.ReleaseSkill, this.display, this);
    }

    protected onDisable(): void {
        WorldEventManager.removeListener(Global.EventEnum.ReleaseSkill, this.display, this);
    }

    display(heroId: number) {
        this.heroId = heroId;
        let index = null;
        for (let i = 0; i < this.roleSprs.length; i++) {
            if (!this.onAnimIndex.includes(i)) {
                index = i;
                break;
            }
        }
        if (index != null) {
            this.anim(index);
        }
    }

    anim(index: number) {
        this.onAnimIndex.push(index);
        let spr = this.roleSprs[index];
        spr.node.stopAllActions();
        spr.node.x = 0;
        AbManager.loadBundleRes(BundleName.Assets, "texture/skillDisplay/" + this.heroId, cc.SpriteFrame).then(spf => {
            spr.spriteFrame = spf;
            AudioManager.ins.playEffect(SoundPath["skill_" + this.heroId]);
            cc.tween(spr.node)
                .to(0.5, { x: -360 + spr.node.width }, { easing: "circOut" })
                .delay(1.5)
                .to(0.5, { x: -360 }, { easing: "circIn" })
                .call(() => {
                    let idx = this.onAnimIndex.findIndex(v => v == index);
                    if (idx >= 0) this.onAnimIndex.splice(idx, 1);
                    spr.spriteFrame = null;
                })
                .start()
        })
    }
}

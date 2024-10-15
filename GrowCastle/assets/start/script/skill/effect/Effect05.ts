import GamingData from "../../../../homepage/script/common/GamingData";
import { Util } from "../../../../homepage/script/common/Util";
import SkillConfig from "../../../../homepage/script/config/SkillConfig";
import { RoleBase } from "../../role/RoleBase";
import SkillEffectBase from "./SkillEffectBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Effect05 extends SkillEffectBase {

    private readonly moveSpeed: number = 1000;
    private isEnd: boolean = false;
    private dis: number = 0;
    private moveTimer: number = 0;
    private resolve: (value: unknown) => void = null;
    private ePos: cc.Vec2 = null;
    private sPos: cc.Vec2 = null;

    init(releaser: RoleBase, skillConfig: SkillConfig, dir: cc.Vec2) {
        this.releaser = releaser;
        this.skillConfig = skillConfig;
        this.node.stopAllActions();
        let sPos = this.node.getPosition();
        this.sPos = cc.v2(sPos.x, sPos.y);
        this.node.angle = -Util.vectorsToDegress(dir);
        this.ePos = dir.mul(3000);
        this.dis = this.ePos.sub(cc.v2(0, 0)).mag();
        this.isEnd = false;
        this.moveTimer = 0;

        this.colliderBaseArr.forEach((v, k) => {
            v.init(releaser, this.skillConfig, k);
            v.setEnable(true);
        })
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.isInit = true;
        })

    }

    fightUpdate(dt: number) {
        if (this.isEnd || !this.isInit) return;
        let time = this.dis / this.moveSpeed;
        this.moveTimer += dt;
        if (this.moveTimer / time >= 1) {
            this.isEnd = true;
            this.resolve(this);
        } else {
            let pos = Util.lerp(this.moveTimer / time, this.sPos, this.ePos) as cc.Vec2;
            this.node.setPosition(pos);
        }
    }
}

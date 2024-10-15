import SkillConfig from "../../../../homepage/script/config/SkillConfig";
import { RoleBase } from "../../role/RoleBase";
import SkillEffectBase from "./SkillEffectBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Effect02 extends SkillEffectBase {

    private isEnd: boolean = false;
    private timer: number = 0;
    private resolve: (value: unknown) => void = null;
    private triggerTimes: number[] = [];

    init(releaser: RoleBase, skillConfig: SkillConfig) {
        this.releaser = releaser;
        this.skillConfig = skillConfig;
        this.isEnd = false;
        this.triggerTimes = [];
        this.skillConfig.parameter.forEach(v => {
            this.triggerTimes.push(0);
        })

        this.colliderBaseArr.forEach((v, k) => {
            v.init(releaser, this.skillConfig, k);
            v.setEnable(false);
        })

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            if (!this.effectAnim) {
                this.isInit = true;
                this.timer = 1;
            } else {
                this.effectAnim.play().then(() => {
                    this.isInit = true;
                    this.timer = 1;
                })
            }
        })
    }

    fightUpdate(dt: number) {
        if (this.isEnd || !this.isInit) return;
        this.timer += dt;
        if (this.timer >= 1) {
            this.timer = 0;
            this.colliderBaseArr.forEach((v, k) => {
                if (this.skillConfig.parameter[k][2] == 1) {
                    this.triggerTimes[k]++;
                    v.setEnable(true, 50);
                } else {
                    if (this.triggerTimes[k] < this.skillConfig.parameter[k][3]) {
                        this.triggerTimes[k]++;
                        v.setEnable(true, 50);
                    }
                }
            })

            let isFinish: boolean = true;
            for (let i = 0; i < this.triggerTimes.length; i++) {
                let num = this.triggerTimes[i];
                if (num < this.skillConfig.parameter[i][3]) {
                    isFinish = false;
                    break;
                }
            }
            if (isFinish) {
                this.isEnd = true;
                this.resolve(this);
            }
        }
    }
}

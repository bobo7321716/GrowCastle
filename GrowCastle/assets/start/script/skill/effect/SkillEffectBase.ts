import SkillConfig from "../../../../homepage/script/config/SkillConfig";
import { RoleBase } from "../../role/RoleBase";
import SkillColliderBase from "../SkillColliderBase";
import EffectAnim from "./EffectAnim";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillEffectBase extends cc.Component {

    @property(SkillColliderBase)
    colliderBaseArr: SkillColliderBase[] = [];

    @property(EffectAnim)
    effectAnim: EffectAnim = null;

    public releaser: RoleBase = null;
    public skillConfig: SkillConfig = null;
    public isInit: boolean = false;

    init(releaser: RoleBase, skillConfig: SkillConfig, ...arg) {
        this.releaser = releaser;
        this.skillConfig = skillConfig;
        return Promise.resolve<any>(null);
    }

    fightUpdate(dt: number) {

    }
}

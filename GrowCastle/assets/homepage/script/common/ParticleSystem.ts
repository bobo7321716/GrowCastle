
const { ccclass, property } = cc._decorator;

@ccclass
export default class ParticleSystem extends cc.Component {

    @property(cc.ParticleSystem)
    particleSystem: cc.ParticleSystem = null;

    protected onEnable(): void {
        this.particleSystem.resetSystem();
    }
}

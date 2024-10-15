import { Global } from "../../../homepage/script/common/Global";
import MyPool from "../../../homepage/script/common/MyPool";
import { PlayerData } from "../../../homepage/script/common/PlayerData";
import SpineAnimCol from "../../../homepage/script/common/SpineAnimCol";
import TipManager from "../../../homepage/script/common/TipManager";
import { UIManager } from "../../../homepage/script/common/UIManager";
import { ConstConfigMgr } from "../../../homepage/script/config/ConstConfig";
import { EnemyConfigMgr } from "../../../homepage/script/config/EnemyConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import FightManager from "../../../start/script/FightManager";
import RewardItem from "../RewardItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BossPage extends cc.Component {

    @property(SpineAnimCol)
    animCol: SpineAnimCol = null;

    @property(cc.Label)
    hpLab: cc.Label = null;

    @property(cc.Label)
    atkLab: cc.Label = null;

    @property(cc.Label)
    nameLab: cc.Label = null;

    @property(cc.RichText)
    descLab: cc.RichText = null;

    @property(cc.Label)
    timesLab: cc.Label = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    @property(cc.Prefab)
    rewardItemPre: cc.Prefab = null;

    @property(cc.Node)
    adUpgradeBtnNode: cc.Node = null;

    @property(cc.Node)
    upgradeBtnNode: cc.Node = null;

    private isCanChallenge: boolean = false;
    private itemArr: RewardItem[] = [];

    init() {
        let waveConfig = PlayerData.ins.todayBossWaveConfig;
        let bossId = waveConfig.enemy[0][0];
        let bossConfig = DataManager.ins.get(EnemyConfigMgr).getDataById(bossId);
        if (!bossConfig) return;
        this.hpLab.string = "生命力: " + (bossConfig.hp + bossConfig.HPcoefficient * (PlayerData.ins.wave + 1));
        this.atkLab.string = "攻击力: " + (bossConfig.atk + bossConfig.ATKcoefficient * (PlayerData.ins.wave + 1));
        this.nameLab.string = bossConfig.name;
        this.descLab.string = bossConfig.text;
        let times = PlayerData.ins.todayChallengeBossTimes;
        let limitTimes = DataManager.ins.get(ConstConfigMgr).getDataById(Global.GameConst.每日可挑战boss次数).value;
        let isCanAd = times == limitTimes;
        this.isCanChallenge = isCanAd || times < limitTimes;
        this.timesLab.string = "挑战(" + times + "/" + limitTimes + ")";
        this.animCol.playAnim(Global.RoleAnimEnum.Walk, Global.RoleType.Boss, bossConfig.animation, 1, true);
        this.adUpgradeBtnNode.active = isCanAd;
        this.upgradeBtnNode.active = !isCanAd;

        if (bossConfig.reward) {
            bossConfig.reward.forEach(v => {
                let item = MyPool.getObj(this.rewardItemPre);
                item.parent = this.contentNode;
                let itemSrc = item.getComponent(RewardItem);
                if (itemSrc) {
                    itemSrc.init(v);
                    this.itemArr.push(itemSrc);
                }
            });
        }
    }

    protected onDestroy(): void {
        this.itemArr.forEach(v => {
            v.destroySelf();
        })
        this.itemArr = [];
    }

    refreshItem() {

    }

    challengeClick(btn, data: string) {
        if (!this.isCanChallenge) {
            TipManager.ins.showTip("可挑战次数不足");
            return;
        }
        let isFree = data == "1";
        let call = () => {
            UIManager.ins.closeView(true);
            FightManager.ins.startFight(Global.FightType.Boss, PlayerData.ins.todayBossWaveConfig.wave);
        }
        if (!isFree) {
            call();
        } else {
            call();
        }
    }
}

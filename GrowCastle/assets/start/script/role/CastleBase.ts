import { BundleName } from "../../../homepage/script/common/BundleName";
import { Global } from "../../../homepage/script/common/Global";
import { AbManager } from "../../../homepage/script/common/asssetsBundle/AbManager";
import TerritoryConfig, { TerritoryConfigMgr } from "../../../homepage/script/config/TerritoryConfig";
import DataManager from "../../../homepage/script/manager/DataManager";
import { RoleBase } from "./RoleBase";
import RoleBaseData from "./RoleBaseData";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class CastleBase extends RoleBase {

    @property(cc.Sprite)
    spr: cc.Sprite = null;

    private territoryConfig: TerritoryConfig = null;

    init(roleInfo: { roleType: Global.RoleType, roleId: number }, deathCb: (roleBase: RoleBase, atker: RoleBase) => void, type: Global.FightType) {
        this.roleInfo = roleInfo;
        this.deathCb = deathCb;
        let boxCollider = this.node.getComponent(cc.BoxCollider);
        if (boxCollider) this.roleSize = boxCollider.size;
        this.isDeath = false;
        this.territoryConfig = DataManager.ins.get(TerritoryConfigMgr).getDataById(roleInfo.roleId);
        this.baseRole = this.initBaseRole(this.territoryConfig);
        this.roleDataInfo = RoleBaseData.initBaseData(this.territoryConfig);
        this.progress.node.active = type == Global.FightType.Territory;
        if (type == Global.FightType.Normal) return Promise.resolve();
        this.progress.init(this.territoryConfig.hp);
        this.isCanSelect = true;
        return AbManager.loadBundleRes(BundleName.Assets, "texture/castle/" + this.territoryConfig.Ecastlpicture, cc.SpriteFrame).then((spf) => {
            this.spr.spriteFrame = spf;
        });
    }

    reset() {
        this.spr.spriteFrame = null;
        this.territoryConfig = null;
        this.baseRole = null;
        this.roleDataInfo = null;
        this.progress.node.active = false;
    }

    death(atker: RoleBase) {
        this.isDeath = true;
        this.deathCb && this.deathCb(this, atker);
    }
} 

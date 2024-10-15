// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UiPath } from "../common/UiPath";
import ArmamentConfig, { ArmamentConfigMgr } from "../config/ArmamentConfig";
import DataManager from "../manager/DataManager";
import { Global } from "../common/Global";
import { PlayerData } from "../common/PlayerData";
import { UIManager } from "../common/UIManager";
import { ConstConfigMgr } from "../config/ConstConfig";
import BuildattributeConfig, { BuildattributeConfigMgr } from "../config/BuildattributeConfig";
import HomeAttributeConfig, { HomeAttributeConfigMgr } from "../config/HomeAttributeConfig";
import Homestead from "../../../part1/script/homestead/Homestead";
import { HomebuildConfigMgr } from "../config/HomebuildConfig";
import { GoldmineConfigMgr } from "../config/GoldmineConfig";
import TimeManager from "../common/TimeManager";
import GamingData from "../common/GamingData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeManager extends cc.Component {

    public static ins: HomeManager = null;

    homestead: Homestead = null;


    /**按id存储的武备数据 */
    armamentConfigMap: Map<number, ArmamentConfig> = new Map();

    /**每个等级能获得的金矿 */
    goldLevel: number[] = []
    /**按id存储的家园建筑属性 */
    homeAttributeConfigMap: Map<number, HomeAttributeConfig[]> = new Map()



    /**百分比的值,source 0是武备1是家园 */
    precentDataMap: Map<Global.ArmamentAttribute, { source: Global.dataSource, id: number, value: number, equip: boolean }[]> = new Map();
    /**固定的值 ,还要判定是否装备*/
    constantDataMap: Map<Global.ArmamentAttribute, { source: Global.dataSource, id: number, value: number, equip: boolean }[]> = new Map();

    /**每秒钟获得铜币数量 */
    private secondCoin: number = 0
    protected onLoad(): void {
        HomeManager.ins = this
    }

    init() {

        //把表格的数据塞进字典
        let _armamentdatas = DataManager.ins.get(ArmamentConfigMgr).datas;
        _armamentdatas.forEach(val => {
            this.armamentConfigMap.set(val.id, val);
        }
        )

        this.goldLevel = DataManager.ins.get(ConstConfigMgr).datas.find(val => val.id == Global.GameConst.矿工等级对应的金矿量).array;

        //把家园建筑属性塞进字典
        DataManager.ins.get(HomeAttributeConfigMgr).datas.forEach(val => {
            if (!this.homeAttributeConfigMap.has(val.build_id)) {
                this.homeAttributeConfigMap.set(val.build_id, []);
            }
            this.homeAttributeConfigMap.get(val.build_id).push(val);
        }
        )

        //初始化武备
        _armamentdatas.forEach(_config => {
            let _info = PlayerData.ins.armamentInfo.find(val => val.id == _config.id);
            if (_info == null) {
                PlayerData.ins.armamentInfo.push({ id: _config.id, lv: 0 })
            }
        }
        )
        //初始化家园建筑playdata

        let _homebuilds = DataManager.ins.get(HomebuildConfigMgr).datas
        _homebuilds.forEach(val => {
            if (PlayerData.ins.homeBuildPos.find(p => p.id == val.id) == null)
                PlayerData.ins.homeBuildPos.push({ id: val.id, lv: 0, pos: -1 })
        }
        )



        //初始化对外的属性

        PlayerData.ins.armamentInfo.forEach(_info => {
            let _config = this.armamentConfigMap.get(_info.id);

            switch (_config.value_type) {
                case Global.dataType.constant:
                    {
                        if (!this.constantDataMap.has(_config.attribute)) {
                            this.constantDataMap.set(_config.attribute, []);
                        }
                        let _datas = this.constantDataMap.get(_config.attribute);
                        _datas.push({ source: Global.dataSource.armament, id: _config.id, value: _config.value * _info.lv, equip: true });


                    }
                    break;
                case Global.dataType.precent:
                    {
                        if (!this.precentDataMap.has(_config.attribute)) {
                            this.precentDataMap.set(_config.attribute, []);
                        }
                        let _datas = this.precentDataMap.get(_config.attribute);
                        _datas.push({ source: Global.dataSource.armament, id: _config.id, value: _config.value * _info.lv, equip: true });


                    }
                    break;
            }
        })


        PlayerData.ins.homeBuildPos.forEach(_info => {
            let _config = this.homeAttributeConfigMap.get(_info.id).find(v => v.level == _info.lv);
            switch (_config.value_type) {
                case Global.dataType.precent:
                    {
                        if (!this.precentDataMap.has(_config.attribute)) {
                            this.precentDataMap.set(_config.attribute, []);
                        }
                        let _datas = this.precentDataMap.get(_config.attribute);
                        _datas.push({ source: Global.dataSource.homebuild, id: _config.id, value: _config.value, equip: _info.pos > 0 });
                    }
                    break;
            }
        })
    }


    /**刷新对外数据 */
    refreshData(_source: Global.dataSource, _id: number, _attribute: Global.ArmamentAttribute, _val: number, _equip: boolean) {

        let _precentDatas = this.precentDataMap.get(_attribute)

        if (_precentDatas != null) {
            let _precentData = _precentDatas.find(val => val.source == _source && val.id == _id)
            if (_precentData != null)
                _precentData.value = _val;
        }


        let _constantDatas = this.constantDataMap.get(_attribute)
        if (_constantDatas != null) {
            let _constantData = _constantDatas.find(val => val.source == _source && val.id == _id)
            if (_constantData != null)
                _constantData.value = _val;
        }


    }

    /**开始自动获得黄金 */
    startAutoGetGold() {

        // 计算每秒的黄金获得
        let goldmineData = DataManager.ins.get(GoldmineConfigMgr).datas[PlayerData.ins.goldmineLevel];

        let roundGold = 0;

        let _add = 1 + HomeManager.ins.getPrecentValue(Global.ArmamentAttribute.矿工挖矿铜币数量)
        goldmineData.gold.forEach(_g => {
            roundGold += (HomeManager.ins.goldLevel[_g] * _add);
        });


        let _goldTimes = DataManager.ins.get(ConstConfigMgr).findConfig(Global.GameConst.矿工基础速度).value

        let _speedBuff = 1 + HomeManager.ins.getPrecentValue(Global.ArmamentAttribute.矿工挖矿速度)

        this.secondCoin = ((roundGold * _goldTimes) * _speedBuff) * (1 / 60);
        //检查是否上阵金蝉石像
        let param2 = PlayerData.ins.getBuildSkillParam(Global.SkillType.Skill23);
        if (param2.length > 0) {
            this.secondCoin += GamingData.getSkillAdd(param2[0], this.secondCoin);
        }
        TimeManager.ins.onCdCall(this.autoGetCoin.bind(this), Number.MAX_VALUE, this, true)

    }

    autoGetCoin() {
        PlayerData.ins.changeItemNum(Global.ItemId.Coin, this.secondCoin, false, false);
    }

    /**暂停自动获得黄金 */
    pauseAutoGetGold() {
        TimeManager.ins.offCdCall({ callFunc: this.autoGetCoin.bind(this), targetTime: Number.MAX_VALUE, caller: this });
    }

    /**获得百分比buff */
    getPrecentValue(_attribute: Global.ArmamentAttribute) {

        let _sum = 0;
        this.precentDataMap.get(_attribute).forEach(val => {
            if (val.equip)
                _sum += val.value
        })
        return _sum
    }

    /**获得固定值 */
    getConstantValue(_attribute: Global.ArmamentAttribute) {
        let _sum = 0;
        this.constantDataMap.get(_attribute).forEach(val => {
            if (val.equip)
                _sum += val.value
        })
        return _sum
    }

    /**获取已装备家园建筑属性 */
    getHomeEquipValue(_attribute: Global.ArmamentAttribute) {
        let arg: number[] = [0, 0];
        for (let i = 0; i < PlayerData.ins.homeBuildPos.length; i++) {
            let info = PlayerData.ins.homeBuildPos[i];
            if (info.pos >= 0) {
                let config = this.homeAttributeConfigMap.get(info.id).find(v => v.level == info.lv && v.attribute == _attribute);
                if (config) {
                    switch (config.value_type) {
                        case Global.dataType.constant:
                            arg[0] += config.value;
                            break;
                        case Global.dataType.precent:
                            arg[1] += config.value;
                            break;
                    }
                }
            }
        }
        return arg;
    }

    /**获取军备属性 [固定值，百分比]*/
    getArmValue(_attribute: Global.ArmamentAttribute) {
        let arg: number[] = [0, 0];
        PlayerData.ins.armamentInfo.forEach(_info => {
            let config = DataManager.ins.get(ArmamentConfigMgr).getDataById(_info.id);
            if (config.attribute == _attribute) {
                switch (config.value_type) {
                    case Global.dataType.constant:
                        arg[0] += config.value * _info.lv;
                        break;
                    case Global.dataType.precent:
                        arg[1] += config.value * _info.lv;
                        break;
                }
            }
        })
        return arg;
    }

    /**获取家园总属性 */
    getHomeTotalValue(_attribute: Global.ArmamentAttribute, baseNum: number) {
        let homeArg = this.getHomeEquipValue(_attribute);
        let armArg = this.getArmValue(_attribute);
        return (baseNum + (homeArg[0] + armArg[0])) * (1 + homeArg[1] + armArg[1]);
    }
}

/**同一个属性的不同来源 */
export class AttributeInfoGroup {
    //按id存的武备信息
    armamentDic: Map<number, ArmamentInfo> = new Map();
    /**数据类型 1 2 */
    dataType: number

    /**获得属性值 */
    get value() {
        let _sum = 0;
        this.armamentDic.forEach(_info => _sum += _info.value);
        return _sum;
    }
}

/**一条武备的信息 */
export class ArmamentInfo {
    id: number
    attribute: Global.ArmamentAttribute;
    dataType: number;
    value: number;

    constructor(_id: number, _a: Global.ArmamentAttribute, _datatype: number, _val: number) {
        this.id = _id;
        this.attribute = _a;
        this.dataType = _datatype;
        this.value = _val;
    }
}

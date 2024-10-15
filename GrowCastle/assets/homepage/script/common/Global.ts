export namespace Global {

    export enum EventEnum {
        TopUIChange = "TopUIChange",
        RedPointRefresh = "RedPointRefresh",
        AddArrowTipTarget = "AddArrowTipTarget",
        RefreshPlayerInfo = "RefreshPlayerInfo",
        FightState = "FightState",
        RefreshHomeBuild = "RefreshHomeBuild",
        RefreshWave = "RefreshWave",
        FightMulChange = "FightMulChange",
        ReleaseSkill = "ReleaseSkill",
        PlayerUpgrade = "PlayerUpgrade",
        BossComing = "BossComing",
        ShowGuideHand = "ShowGuideHand",
        ShowBobble = "ShowBobble",
    }

    /**状态 */
    export enum State {
        /**解锁已完成 */
        GETED = 0,
        /**解锁未完成 */
        UNLOCK,
        /**未解锁 */
        LOCK,
    }

    /**伙伴类型 */
    export enum PartnerType {
        Hero,
        Build
    }

    /**货币类型 */
    export enum CurrencyType {
        /**金币 */
        Coin = 1,
        /**水晶 */
        Crystal
    }

    /**红点类型 */
    export enum RedPointType {
        /**伙伴礼物 */
        PartnerGift = 1,
    }

    /**角色动画 */
    export enum RoleAnimEnum {
        Idel = "idle",
        Run = "run",
        Walk = "walk",
        Atk = "atk",
        Skill = "skill",
        Dead = "dead"
    }

    /**角色状态 */
    export enum RoleState {
        /**等待目标*/
        Idle,
        /**移向目标 */
        Move_to_target,
        /**无目标，前进 */
        Move,
        /**战斗中 */
        Atk,
        /**死亡 */
        Dead
    }

    export enum RoleType {
        Hero = "hero",
        /**弓箭手 */
        Archer = "archer",
        Enemy = "enemy",
        /**玩家 */
        Player = "player",
        /**我方建筑 */
        Build = "build",
        /**敌方建筑 */
        Castle = "castle",
        Boss = "boss",
        /**召唤小兵 */
        Soldier = "soldier"
    }

    export enum EnemyType {
        /**小兵 */
        Monster = 1,
        /**精英怪 */
        Elite_Monster = 2,
        Boss = 3
    }

    /**阵营 */
    export enum Camp {
        Player,
        Enemy
    }

    /**战斗类型 */
    export enum FightType {
        /**普通 */
        Normal = 1,
        /**领土 */
        Territory,
        /**Boss */
        Boss
    }

    /**英雄，建筑的解锁状态 */
    export enum HeroUnlockState {
        /**未解锁 */
        Lock,
        /**已解锁未购买 */
        Not_buy,
        /**已解锁并购买 */
        Unlock
    }

    /**英雄，建筑的解锁方式 */
    export enum HeroUnlockType {
        /**波次解锁 */
        Wave = 1,
        /**签到 */
        Sign,
    }

    /**触发器分组 */
    export enum ColliderGroup {
        None = "none",
        /**玩家 */
        Player = "player",
        /**英雄 */
        Hero = "hero",
        /**弓箭手 */
        Archer = "archer",
        /**建筑 */
        Build = "build",
        /**敌方小兵 */
        Enemy = "enemy",
        /**敌方建筑 */
        Castle = "castle",
        /**技能 */
        Skill = "skill"
    }

    /**技能类型 */
    export enum SkillType {
        /**大赦天下 */
        Skill1 = 1,
        /**青龙降世 */
        Skill2 = 2,
        /**虎吼狮啸 */
        Skill3 = 3,
        /**烈火燎原 */
        Skill4 = 4,
        /**银龙穿云 */
        Skill5 = 5,
        /**叔叔救我 */
        Skill6 = 6,
        /**拉弓！放箭！ */
        Skill7 = 7,
        /**大小姐驾到 */
        Skill8 = 8,
        /**神威 */
        Skill9 = 9,
        /**美人心计 */
        Skill10 = 10,
        /**低级箭塔 */
        Skill11 = 11,
        /**瞭望楼 */
        Skill12 = 12,
        /**瞭望楼 */
        Skill13 = 13,
        /**兵营 */
        Skill14 = 14,
        /**军旗 */
        Skill15 = 15,
        /**武器架 */
        Skill16 = 16,
        /**巨石阵 */
        Skill17 = 17,
        /**绿化树 */
        Skill18 = 18,
        /**莲台 */
        Skill19 = 19,
        /**箭角 */
        Skill20 = 20,
        /**玄武石像 */
        Skill21 = 21,
        /**烽火台 */
        Skill22 = 22,
        /**金蝉石像 */
        Skill23 = 23,
        /**重弩 */
        Skill24 = 24,
        /**诸葛连弩 */
        Skill25 = 25,
    }

    export enum dataType {
        /**固定值 */
        constant = 1,
        /**百分比 */
        precent = 2,
    }

    export enum ArmamentGroup {
        train = 1,
        relic,
        build,
        strategy

    }

    export enum FightEffectType {
        /**英雄攻击力加成 */
        hero_atk_addition = 101,
        /**英雄攻速加成 */
        hero_atkSpeed_addition = 102,
        /**弓箭手攻击力加成 */
        archer_atk_addition = 103,
        /**弓箭手攻速加成 */
        archer_atkSpeed_addition = 104,
        /**移速加成 */
        moveSpeed_addition = 105,
        /**攻速加成 */
        atkSpeed_addition = 106,
        /**受伤增加 */
        hit_addition = 107,
        /**hp回复 */
        hp_recover = 108,
        /**mp回复 */
        mp_recover = 109,
        /**技能冷却加成 */
        hero_skillCd_addition = 110,
        /**造成伤害 */
        hit = 111,
        /**击退 */
        defeat = 112,
        /**召唤 */
        summon = 113,
        /**增加召唤小兵的持续时间 */
        solider_dur = 114,
        /**增加召唤小兵的攻击力 */
        solider_atk = 115,
        /**获得经验增加 */
        exp_addition = 116,
        /**敌人掉落金币增加 */
        coin_addition = 117,
        /**增加城墙最大生命值 */
        player_maxHp_addition = 118,
        /**增加城墙最大法力值 */
        player_maxMp_addition = 119,
        /**矿洞产生铜币数量增加 */
        produce_coin_addition = 120,
        /**每次诸葛连弩的伤害增加 */
        crossbow_atk_addition = 121,
        /**低级箭塔伤害增加 */
        lower_bartizan_atk_addition = 122,
        /**高级箭塔伤害增加 */
        height_bartizan_atk_addition = 123,
        /**魅惑 */
        charm = 124,
        /**落雷 */
        thunder = 125,
    }

    /**武备的属性 */
    export enum ArmamentAttribute {
        弓箭手攻击力 = 101,
        弓箭手攻速 = 102,
        弓箭手暴击率 = 103,
        弓箭手暴击伤害 = 104,
        弓箭手对小兵伤害 = 105,
        弓箭手强化费用 = 107,
        敌人金币掉落 = 108,

        弓箭手对将领伤害 = 109,
        法力上限 = 110,
        法力恢复每5秒 = 111,
        敌人金币掉落双倍概率 = 112,
        英雄攻速 = 113,
        敌人经验掉落 = 114,
        招募券掉落概率 = 115,
        矿工挖矿速度 = 116,
        矿工挖矿铜币数量 = 117,

        英雄攻击力 = 120,
        城墙耐久度 = 121,
        城墙耐久度每5秒 = 122,
        领地时长上限 = 123,
        领地铜币产出 = 124,

        英雄技能冷却时间 = 126
    }

    /**外部配置的常量 */
    export enum GameConst {
        矿工等级对应的金矿量 = 1,
        家园建筑位置解锁 = 2,
        动画标准速度 = 3,
        广告获得铜币乘波次收益 = 4,
        广告获得令牌数量 = 5,
        矿工基础速度 = 6,
        远征时长上限 = 7,
        普攻间隔 = 8,
        每日可挑战boss次数 = 9,
        弓箭手基础暴击概率 = 10,
        弓箭手基础暴击伤害 = 11,
        铜币提升每级加成 = 12,
        铜币提升最高等级 = 13,
        军备每日视频升级次数 = 14,
        最大索敌数量 = 15
    }

    /**数据来源 */
    export enum dataSource {

        armament = 0,
        homebuild = 1
    }

    /**任务类型 */
    export enum TaskType {
        /**通关第x波 */
        PassLv = 1,
        /**提升弩兵至Lv.x */
        UpgradeArcher = 2,
        /**提升城墙至Lv.x */
        UpgradeCastle = 3,
        /**提升x次英雄等级 */
        UpgradeHeroTimes = 4,
        /**提升x次城墙建筑等级 */
        UpgradeCastleTimes = 5,
        /**累计解锁x个英雄 */
        UnlockHero = 6,
        /**累计解锁x个城墙建筑 */
        UnlockBuild = 7,
        /**提升铜矿至Lv.x */
        UpgradeMine = 8,
        /**累计占领x个领地 */
        UnlockTerritory = 9,
        /**升级x次军备 */
        UpgradeArms = 10,
        /**解锁x个家园建筑 */
        UnlockHomeBuild = 11,
        /**击败x个敌军 */
        KillEnemy = 12
    }

    /**道具id */
    export enum ItemId {
        /**铜币 */
        Coin = 1001,
        /**令牌 */
        Crystal = 1002,
        /**招募券 */
        RecruitTick = 1003
    }

    /**道具类型 */
    export enum ItemType {
        /**货币 */
        Currency = 1,
        /**英雄 */
        Hero,
    }

    /**子弹的移动方式 */
    export enum BulletMoveType {
        /**直线 */
        StraightLine,
        /**贝塞尔曲线 */
        Bezier
    }

    /**技能操作类型 */
    export enum SkillOperationType {
        /**无 */
        None,
        /**圆形选区 */
        Round,
        /**柱状选区 */
        Col
    }

    /**红点类型 */
    export enum RedPointType {
        /**签到 */
        Sigh = 1,
        /**在线奖励 */
        Online,
        /**出征 */
        Battle,
        /**军备_训练 */
        Arm1,
        /**军备_圣物 */
        Arm2,
        /**军备_建筑 */
        Arm3,
        /**军备_策略 */
        Arm4,
    }
}

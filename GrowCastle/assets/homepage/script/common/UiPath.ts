/*
 * @Author: XWL 2558913804@qq.com
 * @Date: 2024-06-14 13:35:57
 * @LastEditors: XWL 2558913804@qq.com
 * @LastEditTime: 2024-06-19 14:21:05
 * @FilePath: \GrowCastle\assets\homepage\script\common\UiPath.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { BundleData } from "./BundleData";
import { BundleName } from "./BundleName";

export const UiPath = {

    START_BOARD: new BundleData(BundleName.Part1, "prefab/StartBoard"),
    AddCoin: new BundleData(BundleName.Part1, "prefab/AddCoinUI"), //添加水晶
    AutoBattle: new BundleData(BundleName.Part1, "prefab/AutoBattleUI"),//自动战斗
    OnlineView: new BundleData(BundleName.Part1, "prefab/OnlineView"),//在线时长
    SignUI: new BundleData(BundleName.Part1, "prefab/SignUI"),//签到奖励
    TrialUI: new BundleData(BundleName.Part1, "prefab/TrialUI"),//Boss界面
    SetupView: new BundleData(BundleName.Part1, "prefab/SetUpView"),//设置界面
    ChooseHeroUI: new BundleData(BundleName.Part1, "prefab/ChooseHeroUI"),//英雄或者建筑界面
    ChooseBuildUI: new BundleData(BundleName.Part1, "prefab/ChooseBuildUI"),//英雄或者建筑界面
    InfoUI: new BundleData(BundleName.Part1, "prefab/InfoUI"),//英雄或者建筑详情界面
    ResultView: new BundleData(BundleName.Part1, "prefab/ResultView"),
    OptionView: new BundleData(BundleName.Part1, "prefab/OptionView"),
    RewardView: new BundleData(BundleName.Part1, "prefab/RewardView"),
    GuideView: new BundleData(BundleName.Start, "prefab/GuideView"),
    StoryView: new BundleData(BundleName.Part1, "prefab/StoryView"),
    UnlockFuncView: new BundleData(BundleName.Part1, "prefab/UnlockFuncView"),
    CoinUpgradeView: new BundleData(BundleName.Part1, "prefab/CoinUpgradeView"),

    ArmamentDialog: new BundleData(BundleName.Part1, "prefab/armaments/ArmamentDialog"),//军备科技
    HomeBuildShopDialog: new BundleData(BundleName.Part1, "prefab/homestead/HomeBuildShopDialog"),//家园的建筑商店
    HomeBuildDetailsPopup: new BundleData(BundleName.Part1, "prefab/homestead/HomeBuildDetailsPopup"),//家园的建筑详情
    GoldmineDialog: new BundleData(BundleName.Part1, "prefab/homestead/GoldmineDialog"),//家园金矿

    MainView: new BundleData(BundleName.Start, "prefab/MainView"),

    /**出征 */
    TerritoryLvUI: new BundleData(BundleName.Part1, "prefab/territory/TerritoryLvUI"),
    TerritoryTipUI: new BundleData(BundleName.Part1, "prefab/territory/TerritoryTipUI"),
}
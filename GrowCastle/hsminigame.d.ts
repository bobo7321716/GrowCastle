declare namespace wx {
    export const uma;
    export const aldStage;
    export const BaseConfig;
    export function vibrateShort(obj?: {});
    export function vibrateLong(obj?: {});
    export function showShareMenu(object?);
    export function onShareAppMessage(succ: () => void);
    export function getSystemInfoSync(): WXSystemInfo;
    export function shareAppMessage(obj);
    export function showModal(object?);
    export function login(object?);
    export function offShow(callback?);
    export function offHide(callback?);
    export function onShow(callback?);
    export function onHide(callback?);
    export function getLaunchOptionsSync();
    export function request(object?);
    export function createBannerAd(object?);
    export function createRewardedVideoAd(object: any);
    export function createInterstitialAd(object: any);
    export function exitMiniProgram(object);
    export function restartMiniProgram(object);
    export function getNetworkType(object);

    export function createCustomAd(object?: any);
    export function loadSubpackage(obj?);
    export function setClipboardData(obj);
    export function createFeedbackButton(obj);
    export function openCustomerServiceChat(obj);
    export function onMemoryWarning(obj);

    export function triggerGC();
    export function onNeedPrivacyAuthorization(listener: (resolve: ({ event: string }) => void, eventInfo: { referrer: string }) => void)
    export function setPreferredFramesPerSecond(obj);
    export function getMenuButtonBoundingClientRect(): {
        /**宽度，单位：px */
        width: number;
        /**高度，单位：px */
        height: number;
        /**上边界坐标，单位：px */
        top: number;
        /**右边界坐标，单位：px */
        right: number;
        /**下边界坐标，单位：px */
        bottom: number;
        /**左边界坐标，单位：px */
        left: number;
    };
}

declare namespace swan {
    export function createBannerAd(obj?);
    export function createRewardedVideoAd(obj?);
    export function vibrateLong(object?);
    export function vibrateShort(object?);
    export function loadSubpackage(object?);
    export function getSystemInfoSync(): any;
    export function login(obj?);
    export function getVideoRecorderManager();
    export function shareVideo(obj?);
    export function getMenuButtonBoundingClientRect(): {
        /**宽度，单位：px */
        width: number;
        /**高度，单位：px */
        height: number;
        /**上边界坐标，单位：px */
        top: number;
        /**右边界坐标，单位：px */
        right: number;
        /**下边界坐标，单位：px */
        bottom: number;
        /**左边界坐标，单位：px */
        left: number;
    };
}

declare namespace qg {
    export const uma;
    export function createBannerAd(obj?);
    export function createRewardVideoAd(obj?);
    export function createInterstitialAd(obj?);
    export function shareAppMessage(obj?);
    export function showToast(obj?);
    export function showModal(obj?);
    export function getSystemInfoSync(): any;
    export function createRewardedVideoAd(obj?);
    export function vibrateShort(obj?);
    export function vibrateLong(obj?);
    export function createGamePortalAd(obj?);
    export function createGameBannerAd(obj?);
    export function hasShortcutInstalled(obj?);
    export function installShortcut(obj?);
    export function getProvider();
    export function createNativeAd(object: any): _NativeAd;
    export function login(obj?);
    export function loadSubpackage(obj?);
    export function createCustomAd(obj);
    export function createNewNativeAd(obj?);
    interface _NativeAd {
        load: any;
        destroy: () => void;
        reportAdShow: (callback: Function) => void;
        reportAdClick: (callback: Function) => void;
        onLoad: (callback: Function) => void;
        offLoad: (callback: Function) => void;
        onError: (callback: Function) => void;
        offError: (callback: Function) => void;
    }

    export function createBoxPortalAd(obj?);
}

declare namespace tt {
    export const uma;
    export function login(obj?);
    export function showShareMenu(obj?);
    export function onShareAppMessage(obj?);
    export function getSystemInfoSync(): any;
    export function shareAppMessage(obj?);
    export function vibrateShort(obj?);
    export function vibrateLong(obj?);
    export function createBannerAd(obj?);
    export function createRewardedVideoAd(obj?);
    export function createInterstitialAd(obj?);
    export function showModal(obj?);
    export function showToast(obj?);
    export function showMoreGamesModal(obj);
    export function getGameRecorderManager();
    export function loadSubpackage(obj);
}

declare namespace ks {
    export function showShareMenu(obj?);
    export function onShareAppMessage(obj?);
    export function getSystemInfoSync(): any;
    export function shareAppMessage(obj?);
    export function vibrateShort(obj?);
    export function vibrateLong(obj?);
    export function createRewardedVideoAd(obj?);
    export function loadSubpackage(obj);
    export function showModal(obj?);
    export function getGameRecorder();
    export function getAPKShortcutInstallStatus(obj?);
    export function saveAPKShortcut(obj?);
}

declare namespace uc {
    export function createBannerAd(obj?);
    export function createRewardVideoAd();
    export function createInterstitialAd();
    export function shareAppMessage(obj?): void;
    export function showToast(obj?);
    export function showModal(obj?);
    export function getSystemInfoSync();
    export function login(obj);
}

declare namespace qq {
    export function showShareMenu(obj?);
    export function onShareAppMessage(obj?);
    export function getSystemInfoSync();
    export function shareAppMessage(obj?);
    export function vibrateShort(obj?);
    export function vibrateLong(obj?);
    export function createRewardedVideoAd(obj?);
    export function createInterstitialAd(obj?);
    export function createFeedbackButton(obj);
}

interface WXSystemInfo {
    // 设备品牌ccc
    brand: string;
    // 设备型号。
    model: string;
    // 设备像素比
    pixelRatio: number;
    // 试玩宽度
    screenWidth: number;
    // 试玩高度
    screenHeight: number;
    // 试玩宽度
    windowWidth: number;
    // 试玩高度
    windowHeight: number;
    // 微信设置的语言
    language: string;
    // 微信版本号
    version: string;
    // 操作系统及版本
    system: string;
    // 客户端平台。
    platform: string;
    // 用户字体大小（单位px）
    fontSizeSetting: number;
    // 设备性能等级（仅 Android）。统一返回-1
    benchmarkLevel: number;
    // 设备方向
    deviceOrientation: string;
}
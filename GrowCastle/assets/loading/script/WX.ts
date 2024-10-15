
const { ccclass, property } = cc._decorator;

import "gameassistant3"
import { ShushuEventTracker } from "kariqu_shushu"
import "gravity_engine_cocos"
import GravityEngineEventTracker from "gravity_engine_adapter";

@ccclass
export default class WX {

    static isInit: boolean = false;

    public static init() {
        if (this.isInit) return;
        this.isInit = true;
        // this.shushu();
        this.openID();
        this.set();
        this.initVideo();

    }

    public static shushu() {
        let shushuTracker = new ShushuEventTracker()
        shushuTracker.setConfig({
            appId: "eb867bb40e64432fb9d73db76a76b217",
            serverUrl: "https://tadata.17tcw.com",
            enableEncrypt: true,
            secretKey: {
                publicKey: "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGc0Y5xU93xGp5qg4V1lCHK17RfnXTnyPbV20EKr9BHNl1HUaDw+b5uDA6TlYqUk6AyIWWEKO0AIOf4b61yEnbB/HcMxuFef7Um18OX0sTwURZg7lAxIbe3WhV/lnA+IMbTf5iLmwfQ0cmSnhC7gR5TpBXAxkrCJm48ZDH8rDwKQIDAQAB",
                version: 0//秘钥版本，一般为0，可联系卡日曲服务端对接人员确认
            },
            enableLog: false,//是否开启日志
            debugMode: "none",//测试模式，正式版需为none
            autoTrack: {
                appHide: true,
                appShow: true
            }
        })
        // GA.Analytics.addTracker(shushuTracker);

        //引力引擎
        GA.Analytics.addTracker(new GravityEngineEventTracker("aegYimgVzdsJxrk6xl3LQf1AyFoc8ZsP", false/*Debug*/));

        //预注册
        GA.preregist("wx6d99da422b03da8a", "rxzc").then(() => {
            //预注册结束，执行后续逻辑
        })
    }
    public static openID() {
        //获取openID
        GA.getOpenId((openid, sessionkey) => {
            console.log("获取ID1")
            //注册、登录，获得用户ID和存档等数据
            GA.request({
                url: GA.getUrl("/default/login/reqLogin" as GA.Urls),
                data: {
                    openid: GA.Info.openId,
                    channel: GA.Info.channelId,
                    scence: GA.Info.scene,
                    nickname: GA.Info.nickname,
                    headicon: GA.Info.avatar
                },
                method: "POST",
                success: (res) => {
                    console.log("获取ID成功");
                    console.log(res)
                    //设置userId
                    GA.setUserId(res.data.data.userId)
                    //执行登录成功后续操作
                }
            })
        })

    }
    public static set() {
        GA.Analytics.setDefaultEventParameters({
            channel: GA.Info.channelId,
            scene: GA.Info.scene
        })

        GA.Analytics.setDynamicEventProperties(() => {

            return {
                ID: GA.Info.openId,
                version: "2.0.8"
            }
        })

        GA.Analytics.setUserProperties({
            channel: GA.Info.channelId,
            scene: GA.Info.scene,
            last_login: Date.now()
        })

        GA.Analytics.setUserFirstProperties({
            register_channel: GA.Info.channelId,//有效
            register_scene: GA.Info.scene,//有效
            register_time: Date.now()//有效
        })

        GA.Analytics.setUserFirstProperties({
            register_channel: GA.Info.channelId,//无效
            register_scene: GA.Info.scene,//无效
            register_time: Date.now(),//无效
            first_login: Date.now()//有效
        })

    }

    public static initVideo() {
        console.log("初始化激励视频");
        GA.initRewardVideoAd(["adunit-b36b870b7e58c03e"])
    }
    public static showVideo(Tag: string, Page: string, ByVideo: boolean, cb: () => void) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return cb && cb();
        this.wxShare(cb);
        return;
        console.log("复活调用视频广告");
        GA.rewardOperation({
            tag: Tag,
            page: Page,
            byVideo: ByVideo,//true:使用激励视频，false:使用分享
            result: rst => {
                if (rst.reward) {
                    cb && cb();
                }
                if (ByVideo) {
                    if (rst.shown == false) {
                        this.showVideo("分享", "分享", false, () => {
                            cb && cb();
                        })
                    } else {

                    }
                }
                console.log(rst, "rst");
                console.log(rst.reward, "rst.reward");
            }
        })



        //设置未看完关闭的提示内容，为空时则不显示提示,SDK默认提示内容：看完视频才能获得奖励哦
        GA.setInterruptPlayTip("")

        //视频播放回调
        //支持平台：微信、OPPO、VIVO、QQ、抖音、快手，不支持Android App、iOS App、4399
        GA.addVideoPlayCallback(() => {
            //视频开始播放
            console.log("视频开始播放");
        })

        //视频播放完毕回调 支持全平台
        GA.addVideoEndCallback(() => {
            console.log("视频播放完毕回调");
            //视频播放完毕
        })

        //视频关闭回调 支持全平台
        GA.addVideoCloseCallback(isEnd => {
            console.log("视频播放完毕");
            //isEnd 是否播放完毕
        })
    }
    public static showIsVideo() {
        //判断激励视频是否已缓存好
        //由于广告加载需要时间，该接口只代表当前时间点未加载完成，不代表没有广告填充,非裂变型游戏慎用
        return GA.haveRewardVideo();

    }

    public static showNextVideo(loacl: string) {
        //裂变型游戏
        //判断当前位置使用激励视频还是分享
        return GA.isNextRewardVideo(loacl);

    }

    static wxShare(cb?: (res: boolean) => void) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return cb && cb(false);
        wx.shareAppMessage(
            {
                title: "热血战场",
                imageUrl: ""
            });
        let share_time = (new Date()).getTime();

        let func = res => {
            if ((new Date()).getTime() - share_time >= 3000) {
                cb && cb(true);
                // wx.showToast({title: '分享成功',duration: 2000});
            } else {
                wx.showModal({
                    title: "提示",
                    content: "该群已分享过,请换个群",
                    showCancel: true,
                    cancelText: "取消",
                    cancelColor: "#000",
                    confirmText: "去分享",
                    confirmColor: "#08f",
                    success: res => {
                        if (res.confirm) {
                            this.wxShare(cb);
                        } else if (res.cancel) {
                            cb && cb(false);
                        }
                    }
                });
            }
            wx.offShow(func);
        }
        wx.onShow(func);
    }
}

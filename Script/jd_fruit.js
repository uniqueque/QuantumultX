//jd免费水果 搬的https://github.com/liuxiaoyucc/jd-helper/blob/a6f275d9785748014fc6cca821e58427162e9336/fruit/fruit.js
//只能quanx用，request里面的请求跟获取cookie的地方改改，别的app应该也能用


// [task_local]

// #jd免费水果
// 1 0 7,12,18 * * * jd_fruit.js, tag=jd免费水果, enabled=true

//京东接口地址
const JD_API_HOST = 'https://api.m.jd.com/client.action';

//直接用NobyDa的jd cookie
const cookie = $prefs.valueForKey('CookieJD')
const name = '京东水果'

var shareCodes = [ // 这个列表填入你要助力的好友的shareCode，每个人能给别人助力3次，能被人助力5次，每个被助力的人能获得15g，最多5次，满5人，额外领50g
    'a6f686a9f6aa4c80977370b03681c553',
    'f92cb56c6a1349f5a35f0372aa041ea0',
    '93fab8abcba440e892b1547ff3822853',
]
var Task = step();
Task.next();

let farmTask = null;
// let farmInfo = null;

function* step() {
    //
    let message = ''
    let subTitle = ''
    if (cookie) {
        let farmInfo = yield initForFarm();
        if (farmInfo.farmUserPro) {
            subTitle = farmInfo.farmUserPro.name
            console.log('shareCode为: ' + farmInfo.farmUserPro.shareCode);
            farmTask = yield taskInitForFarm();
            // console.log(`当前任务详情: ${JSON.stringify(farmTask)}`);
            console.log(`开始签到`);
            if (!farmTask.signInit.todaySigned) {
                let signResult = yield signForFarm(); //签到
                if (signResult.code == "0") {
                    message += `【签到成功】获得${signResult.amount}g\n`//连续签到${signResult.signDay}天
                } else {
                    message += `签到失败,详询日志\n`
                    console.log(`签到结果:  ${JSON.stringify(signResult)}`);
                }
            } else {
                console.log(`今天已签到,连续签到${farmTask.signInit.totalSigned},下次签到可得${farmTask.signInit.signEnergyEachAmount}g`);
                // message += `今天已签到,连续签到${farmTask.signInit.totalSigned},下次签到可得${farmTask.signInit.signEnergyEachAmount}g\n`
            }
            console.log(`签到结束,开始广告浏览任务`);
            // let goalResult = yield gotWaterGoalTaskForFarm();
            // console.log('被水滴砸中奖励: ', goalResult);
            if (!farmTask.gotBrowseTaskAdInit.f) {
                let adverts = farmTask.gotBrowseTaskAdInit.userBrowseTaskAds
                let browseReward = 0
                let browseSuccess = 0
                let browseFail = 0
                for (let advert of adverts) { //开始浏览广告
                    if (advert.limit <= advert.hadFinishedTimes) {
                        // browseReward+=advert.reward
                        console.log(`${advert.mainTitle}+ ' 已完成`);//,获得${advert.reward}g
                        continue;
                    }
                    console.log('正在进行广告浏览任务: ' + advert.mainTitle);
                    let browseResult = yield browseAdTaskForFarm(advert.advertId, 0);
                    if (browseResult.code == 0) {
                        console.log(`${advert.mainTitle}浏览任务完成`);
                        //领取奖励
                        let browseRwardResult = yield browseAdTaskForFarm(advert.advertId, 1);
                        if (browseRwardResult.code == '0') {
                            console.log(`领取浏览${advert.mainTitle}广告奖励成功,获得${browseRwardResult.amount}g`)
                            browseReward += browseRwardResult.amount
                            browseSuccess++
                        } else {
                            browseFail++
                            console.log(`领取浏览广告奖励结果:  ${JSON.stringify(browseRwardResult)}`)
                        }
                    } else {
                        browseFail++
                        console.log(`广告浏览任务结果:   ${JSON.stringify(browseResult)}`);
                    }
                }
                if (browseFail > 0) {
                    message += `【广告浏览】完成${browseSuccess}个,失败${browseFail},获得${browseReward}g\n`
                } else {
                    message += `【广告浏览】完成${browseSuccess}个,获得${browseReward}g\n`
                }
            } else {
                console.log(`今天已经做过浏览任务`);
                // message += '今天已经做过浏览任务\n'
            }
            //定时领水
            if (!farmTask.gotThreeMealInit.f) {
                //
                let threeMeal = yield gotThreeMealForFarm();
                if (threeMeal.code == "0") {
                    message += `【定时领水】获得${threeMeal.amount}g\n`
                } else {
                    message += `【定时领水】失败,详询日志\n`
                    console.log(`定时领水成功结果:  ${JSON.stringify(threeMeal)}`);
                }
            } else {
                // message += '当前不在定时领水时间断或者已经领过\n'
                console.log('当前不在定时领水时间断或者已经领过')
            }
            //助力好友
            console.log('开始助力好友')
            let salveHelpAddWater = 0;
            for (let code of shareCodes) {
                if (code == farmInfo.farmUserPro.shareCode) {
                    console.log('跳过自己的shareCode')
                    continue
                }
                console.log(`开始助力好友: ${code}`);
                let helpResult = yield masterHelp(code)
                if (helpResult.code == 0 && helpResult.helpResult.code == 0) {
                    salveHelpAddWater += helpResult.helpResult.salveHelpAddWater
                } else {
                    console.log(`助力好友结果: ${JSON.stringify(helpResult)}`);
                }
            }
            if (salveHelpAddWater > 0) {
                message += `【助力好友】获得${salveHelpAddWater}g\n`
            }

            //好友助力
            let masterHelpTask = yield masterHelpTaskInitForFarm()
            if (masterHelpTask.code == 0) {
                if (!masterHelpTask.f) {
                    if (masterHelpTask.masterHelpPeoples.length < 5) {
                        message += `【好友助力】已有${masterHelpTask.masterHelpPeoples.length}助力，获得${masterHelpTask.masterHelpPeoples.length * masterHelpTask.masterHelpOneTimeEnergy}g\n`
                    } else {
                        let masterGotFinished = yield masterGotFinishedTaskForFarm()
                        if (masterGotFinished.code == 0) {
                            message += `【好友助力】满5人，共获得${masterHelpTask.masterHelpPeoples.length * masterHelpTask.masterHelpOneTimeEnergy + masterGotFinished.amount}g\n`
                        } else {
                            message += `【好友助力】满5人，获得${masterHelpTask.masterHelpPeoples.length * masterHelpTask.masterHelpOneTimeEnergy}g，领取额外奖励失败\n`
                            console.log(`领取好友助力奖励结果: ${JSON.stringify(masterGotFinished)}`)
                        }
                    }
                } else {
                    console.log(`已领取好友助力奖励`);
                }
            } else {
                console.log(`获取好友助力结果: ${JSON.stringify(helpResult)}`);
            }

            console.log('助力好友结束，即将开始每日浇水任务');
            // console.log('当前水滴剩余: ' + farmInfo.farmUserPro.totalEnergy);
            // farmTask = yield taskInitForFarm();
            //当前水滴，可能不准，不影响结果
            let totalEnergy = farmInfo.farmUserPro.totalEnergy
            //浇水10次,剩余水滴超过50g的时候 继续浇
            if (farmTask.totalWaterTaskInit.totalWaterTaskTimes < farmTask.totalWaterTaskInit.totalWaterTaskLimit || totalEnergy > 50) {
                let waterCount = 0
                for (; waterCount < farmTask.totalWaterTaskInit.totalWaterTaskLimit - farmTask.totalWaterTaskInit.totalWaterTaskTimes || totalEnergy > 50; waterCount++) {
                    console.log(`第${waterCount + 1}次浇水`);
                    let waterResult = yield waterGoodForFarm();
                    console.log(`本次浇水结果:   ${JSON.stringify(waterResult)}`);
                    if (waterResult.code != 0) {//异常中断
                        break
                    }
                    if (waterResult.finished) {
                        //猜测 还没到那阶段 不知道对不对
                        message += `【猜测】应该可以领取水果了，请去农场查看\n`
                        break
                    }
                    if (waterResult.totalEnergy < 10) {
                        console.log(`水滴不够，结束浇水`)
                        break
                    }
                    totalEnergy = waterResult.totalEnergy
                }
                farmTask = yield taskInitForFarm();
                message += `【自动浇水】浇水${waterCount}次，今日浇水${farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`
            } else {
                console.log('今日已完成10次浇水任务，不继续自动浇水');
            }
            //领取首次浇水奖励
            if (!farmTask.firstWaterInit.f && farmTask.firstWaterInit.totalWaterTimes > 0) {
                let firstWaterReward = yield firstWaterTaskForFarm();
                if (firstWaterReward.code == '0') {
                    message += `【首次浇水奖励】获得${firstWaterReward.amount}g\n`
                } else {
                    message += '【首次浇水奖励】领取奖励失败,详询日志\n'
                    console.log(`领取首次浇水奖励结果:  ${JSON.stringify(firstWaterReward)}`);
                }
            }
            //领取10次浇水奖励
            if (!farmTask.totalWaterTaskInit.f && farmTask.totalWaterTaskInit.totalWaterTaskTimes >= farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
                let totalWaterReward = yield totalWaterTaskForFarm();
                if (totalWaterReward.code == '0') {
                    // console.log(`领取10次浇水奖励结果:  ${JSON.stringify(totalWaterReward)}`);
                    message += `【十次浇水奖励】获得${totalWaterReward.totalWaterTaskEnergy}g\n`//，
                } else {
                    message += '【十次浇水奖励】领取奖励失败,详询日志\n'
                    console.log(`领取10次浇水奖励结果:  ${JSON.stringify(totalWaterReward)}`);
                }
            } else if (farmTask.totalWaterTaskInit.totalWaterTaskTimes < farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
                message += `【十次浇水奖励】任务未完成，今日浇水${farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`
            }
            console.log('finished 水果任务完成!');

            farmInfo = yield initForFarm();
            message += `【水果进度】已浇水${farmInfo.farmUserPro.treeEnergy / 10}次,还需${(farmInfo.farmUserPro.treeTotalEnergy - farmInfo.farmUserPro.treeEnergy) / 10}次\n`
            if (farmInfo.toFlowTimes > (farmInfo.farmUserPro.treeEnergy / 10)) {
                message += `【开花进度】再浇水${farmInfo.toFlowTimes - farmInfo.farmUserPro.treeEnergy / 10}次开花\n`
            } else if (farmInfo.toFruitTimes > (farmInfo.farmUserPro.treeEnergy / 10)) {
                message += `【结果进度】再浇水${farmInfo.toFruitTimes - farmInfo.farmUserPro.treeEnergy / 10}次结果\n`
            } else {
            }
            message += `【剩余水滴】${farmInfo.farmUserPro.totalEnergy}g\n`
            //集卡抽奖活动
            console.log('开始集卡活动')

            //活动结束了 //初始化集卡抽奖活动数据
            // let turntableFarm = yield initForTurntableFarm()
            // if (turntableFarm.code == 0) {
            //     //浏览爆品任务
            //     if (!turntableFarm.turntableBrowserAdsStatus) {
            //         let browserResult1 = yield browserForTurntableFarm(1);
            //         console.log(`浏览爆品任务结果${JSON.stringify(browserResult1)}`)
            //         if (browserResult1.code == 0) {
            //             let browserResult2 = yield browserForTurntableFarm(2);
            //             console.log(`领取爆品任务奖励结果${JSON.stringify(browserResult2)}`)
            //         }
            //     }
            //     //领取定时奖励 //4小时一次 没判断时间
            //     if (!turntableFarm.timingGotStatus) {
            //         let timingAward = yield timingAwardForTurntableFarm();
            //         console.log(`领取定时奖励结果${JSON.stringify(timingAward)}`)
            //     }
            //     turntableFarm = yield initForTurntableFarm()
            //     console.log('开始抽奖')
            //     //抽奖
            //     if (turntableFarm.remainLotteryTimes > 0) {
            //         let lotteryResult = "【集卡抽奖】获得"
            //         for (let i = 0; i < turntableFarm.remainLotteryTimes; i++) {
            //             let lottery = yield lotteryForTurntableFarm()
            //             console.log(`第${i + 1}次抽奖结果${JSON.stringify(lottery)}`)
            //             if (lottery.code == 0) {
            //                 if (lottery.type == "water") {
            //                     lotteryResult += `水滴${lottery.addWater}g `
            //                 } else if (lottery.type == "pingguo") {
            //                     lotteryResult += "苹果卡 "
            //                 } else if (lottery.type == "baixiangguo") {
            //                     lotteryResult += "百香果卡 "
            //                 } else if (lottery.type == "mangguo") {
            //                     lotteryResult += "芒果卡 "
            //                 } else if (lottery.type == "taozi") {
            //                     lotteryResult += "桃子卡 "
            //                 } else if (lottery.type == "mihoutao") {
            //                     lotteryResult += "猕猴桃卡 "
            //                 } else if (lottery.type == "pingguo") {
            //                     lotteryResult += "苹果卡 "
            //                 } else if (lottery.type == "coupon") {
            //                     lotteryResult += "优惠券 "
            //                 } else if (lottery.type == "coupon3") {
            //                     lotteryResult += "8斤金枕榴莲 "
            //                 } else if (lottery.type == "bean") {
            //                     lotteryResult += `京豆${lottery.beanCount}个 `
            //                 } else if (lottery.type == "hongbao1") {
            //                     lotteryResult += `${lottery.hongBao.balance}元无门槛红包 `
            //                 } else {
            //                     lotteryResult += `未知奖品${lottery.type} `
            //                 }
            //                 //没有次数了
            //                 if (lottery.remainLotteryTimes == 0) {
            //                     break
            //                 }
            //             }

            //         }
            //         message += lotteryResult
            //     }
            //     console.log('抽奖结束')

            // } else {
            //     console.log(`初始化集卡抽奖活动数据异常, 数据: ${JSON.stringify(farmInfo)}`);
            //     message += '【集卡抽奖】初始化集卡抽奖数据异常'
            // }
            // console.log('集卡活动抽奖结束')

            console.log('全部任务结束');
        } else {
            console.log(`初始化农场数据异常, 请登录京东 app查看农场0元水果功能是否正常,农场初始化数据: ${JSON.stringify(farmInfo)}`);
            message = '初始化农场数据异常, 请登录京东 app查看农场0元水果功能是否正常'
        }
    } else {
        message = '请先获取cookie\n直接使用NobyDa的京东签到获取'

    }
    $notify(name, subTitle, message)
}
/**
 * 集卡抽奖
 */
function lotteryForTurntableFarm() {
    request(arguments.callee.name.toString(), { type: 1, version: 4, channel: 1 });
}

function timingAwardForTurntableFarm() {
    request(arguments.callee.name.toString(), { version: 4, channel: 1 });
}

// 初始化集卡抽奖活动数据
function initForTurntableFarm() {
    request(arguments.callee.name.toString(), { version: 4, channel: 1 });
}

function browserForTurntableFarm(type) {
    if (type === 1) {
        console.log('浏览爆品会场');
    }
    if (type === 2) {
        console.log('领取浏览爆品会场奖励');
    }

    request(arguments.callee.name.toString(), { type: type });
    // 浏览爆品会场8秒
}


/**
 * 被水滴砸中
 * 要弹出来窗口后调用才有效, 暂时不知道如何控制
 */
function gotWaterGoalTaskForFarm() {
    request(arguments.callee.name.toString(), { type: 3 });
}

//好友助力信息
function masterHelpTaskInitForFarm() {
    let functionId = arguments.callee.name.toString();
    request(functionId);
}
//领取好友助力奖励
function masterGotFinishedTaskForFarm() {
    let functionId = arguments.callee.name.toString();
    request(functionId);
}


function masterHelp() {
    request(`initForFarm`, { imageUrl: "", nickName: "", shareCode: arguments[0], babelChannel: "3", version: 2, channel: 1 });
}

/**
 * 10次浇水
 */
function totalWaterTaskForFarm() {
    let functionId = arguments.callee.name.toString();
    request(functionId);
}

function firstWaterTaskForFarm() {
    let functionId = arguments.callee.name.toString();
    request(functionId);
}

// 浇水动作
function waterGoodForFarm() {
    let functionId = arguments.callee.name.toString();
    request(functionId);
}

/**
 * 浏览广告任务
 * type为0时, 完成浏览任务
 * type为1时, 领取浏览任务奖励
 */
function browseAdTaskForFarm(advertId, type) {
    let functionId = arguments.callee.name.toString();
    request(functionId, { advertId, type });
}
//签到
function signForFarm() {
    let functionId = arguments.callee.name.toString();
    request(functionId);
}
//定时领水
function gotThreeMealForFarm() {
    let functionId = arguments.callee.name.toString();
    request(functionId);
}

// 初始化任务列表
function taskInitForFarm() {
    let functionId = arguments.callee.name.toString();
    request(functionId);
}

/**
 * 初始化农场, 可获取果树及用户信息
 */
function initForFarm() {
    let functionId = arguments.callee.name.toString();
    request(functionId);
}


function request(function_id, body = {}) {
    $task.fetch(taskurl(function_id, body)).then(
        (response) => {
            // $.log(response.body)
            return JSON.parse(response.body)
        },
        (reason) => console.log(reason.error, reason)//callback(reason.error, reason, reason)
    ).then((response) => sleep(response))
}
function sleep(response) {
    console.log('休息一下');
    setTimeout(() => {
        console.log('休息结束');
        Task.next(response)
    }, 2000);
}

function taskurl(function_id, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${function_id}&appid=wh5&body=${escape(JSON.stringify(body))}`,
        headers: {
            Cookie: cookie,
       },
        method: "GET",
    }
}

function taskposturl(function_id, body = {}) {
    return {
        url: JD_API_HOST,
        body: `functionId=${function_id}&body=${JSON.stringify(body)}&appid=wh5`,
        headers: {
            Cookie: cookie,
        },
        method: "POST",
    }
}
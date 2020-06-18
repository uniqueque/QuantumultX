/*
种豆得豆
*/


//直接用NobyDa的jd cookie
const cookie = $prefs.valueForKey('CookieJD')
const name = '京东种豆得豆'

//京东接口地址
const JD_API_HOST = 'https://api.m.jd.com/client.action';

let plantBeanIndexBody = `area=15_1213_1214_52672&body=%7B%22monitor_source%22%3A%22plant_app_plant_index%22%2C%22monitor_refer%22%3A%22%22%2C%22version%22%3A%229.0.0.1%22%7D&build=167237&client=apple&clientVersion=9.0.0&d_brand=apple&d_model=iPhone11%2C8&eid=eidIcdb3812239s5N%2BVRbF/5QXeCGZ7gQO7YajflUtaiv%2B/GpOWxQGhitJgPi2VuH6u5lXpzn73NOXwro3Mt0KhGdFNaPqBJ1tg7EbtOggTqjKPNAWZF&isBackground=N&joycious=189&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=dd98775f26e5132fd2e047deb8cf12c5bac33d4b&osVersion=13.4.1&partner=apple&rfs=0000&scope=10&screen=828%2A1792&sign=7cde80353b504880d3d443e72b55d78e&st=1592374870515&sv=120&uts=0f31TVRjBSsmeszE4IIEY04Z5/lKr3NYnR%2BuYMkcz5eWul7H2Z/0lsRtddoAqMTFjFLFhKMLFph2Mtocy3T3aAQCFzA3KadyLwqDl6O9hy7ONYRn9vDdpeMfSqAEvfzlz2F5igCxrWpLCSC6PwBTqAiG/iDYeFxW53/xT2nhbDnL71ZWWUCzV8tqFWWpf1VFiBZSdDcc%2BVhzm3hT3aN19A%3D%3D&uuid=coW0lj7vbXVin6h7ON%2BtMNFQqYBqMahr&wifiBssid=1c704de873683a566c75bcba677b724a`

var Task = step();
Task.next();

function* step() {
    //
    let message = ''
    if (cookie) {
        let plantBeanIndexResult = yield plantBeanIndex()
        console.log(`plantBeanIndexResult:${JSON.stringify(plantBeanIndexResult)}`)
        if (plantBeanIndexResult.code != "0") {
            //todo
            return
        }

        for (let task of plantBeanIndexResult.data.taskList) {
            if (task.taskType == 7 || task.taskType == 18 || task.taskType == 18) {
                //7金融双签,18疯抢爆品,17叠蛋糕
                if (task.isFinished != 1) {
                    //好像还不行
                    console.log(task.taskName)
                    let receiveNutrientsTaskResult = yield receiveNutrientsTask(task.taskType)
                    console.log(`receiveNutrientsTaskResult:${JSON.stringify(receiveNutrientsTaskResult)}`)
                }
                //逛逛会场
            } else if (task.awardType == 3) {
                //浏览店铺
                if (task.isFinished != 1) {
                    let shopTaskListResult = yield shopTaskList()
                    console.log(`shopTaskListResult:${JSON.stringify(shopTaskListResult)}`)
                    if (shopTaskListResult.code == '0') {
                        for (let shop of shopTaskListResult.data.goodShopList) {
                            console.log(shop.shopName)
                            if (shop.taskState == '2') {
                                let shopNutrientsTaskResult = yield shopNutrientsTask(shop.shopTaskId, shop.shopId)
                                console.log(`shopNutrientsTaskResult:${JSON.stringify(shopNutrientsTaskResult)}`)
                            }
                        }
                    }
                }
            } else if (task.awardType == 10) {
                //浏览频道
                if (task.isFinished != 1) {
                    let plantChannelTaskListResult = yield plantChannelTaskList()
                    console.log(`plantChannelTaskListResult:${JSON.stringify(plantChannelTaskListResult)}`)
                    if (plantChannelTaskListResult.code == '0') {
                        for (let channel of plantChannelTaskListResult.data.goodChannelList) {
                            console.log(channel.channelName)
                            if (channel.taskState == '2') {
                                let plantChannelNutrientsTaskResult = yield plantChannelNutrientsTask(channel.channelTaskId, channel.channelId)
                                console.log(`plantChannelNutrientsTaskResult:${JSON.stringify(plantChannelNutrientsTaskResult)}`)
                            }
                        }
                    }
                }
            } else if (task.awardType == 5) {
                //关注商品
                if (task.isFinished != 1) {

                    let productTaskListResult = yield productTaskList()
                    console.log(`productTaskListResult:${JSON.stringify(productTaskListResult)}`)

                    if (productTaskListResult.code == '0') {
                        let productInfoList = productTaskListResult.data.productInfoList.map(([item]) => item)
                        for (let productInfo of productInfoList) {
                            console.log(productInfo.productName)
                            if (productInfo.taskState == '2') {
                                let productNutrientsTaskResult = yield productNutrientsTask(productInfo.productTaskId, productInfo.skuId)
                                console.log(`productNutrientsTaskResult:${JSON.stringify(productNutrientsTaskResult)}`)
                            }
                        }
                    }
                }
            }

        }

        plantBeanIndexResult = yield plantBeanIndex()
        console.log(`plantBeanIndexResult:${JSON.stringify(plantBeanIndexResult)}`)
        if (plantBeanIndexResult.code == '0') {

            let plantBeanRound = plantBeanIndexResult.data.roundList[1]
            if (plantBeanRound.roundState == 2) {
                //收取营养液
                for (let bubbleInfo of plantBeanRound.bubbleInfos) {
                    console.log(`收取营养液${bubbleInfo.name}`)

                    let cultureBeanResult = yield cultureBean(plantBeanRound.roundId, bubbleInfo.nutrientsType)
                    console.log(`cultureBeanResult:${JSON.stringify(cultureBeanResult)}`)
                }

                //定时领取
                if (plantBeanIndexResult.data.timeNutrientsRes.state == 1 && plantBeanIndexResult.data.timeNutrientsRes.nutrCount > 0) {

                    let receiveNutrientsResult = yield receiveNutrients(plantBeanRound.roundId)
                    console.log(`receiveNutrientsResult:${JSON.stringify(receiveNutrientsResult)}`)
                }
            }
        }
    } else {
        message = '请先获取cookie\n直接使用NobyDa的京东签到获取'

    }
    $notify(name, '', message)
}

// https://api.m.jd.com/client.action?functionId=receiveNutrientsTask


function receiveNutrientsTask(awardType) {
    let functionId = arguments.callee.name.toString();
    let body = {
        "monitor_refer": "plant_receiveNutrientsTask",
        "monitor_source": "plant_app_plant_index",
        "awardType": awardType,
        "version": "9.0.0.1"
    }

    request(functionId, `body=${escape(JSON.stringify(body))}&uuid=&appid=ld`);
}

//https://api.m.jd.com/client.action?functionId=receiveNutrients
//area=15_1213_1214_52672&body=%7B%22monitor_refer%22%3A%22plant_receiveNutrients%22%2C%22monitor_source%22%3A%22plant_app_plant_index%22%2C%22roundId%22%3A%22rdywryjqg3f4coqbns6eertieu%22%2C%22version%22%3A%229.0.0.1%22%7D&build=167237&client=apple&clientVersion=9.0.0&d_brand=apple&d_model=iPhone11%2C8&eid=eidIcdb3812239s5N%2BVRbF/5QXeCGZ7gQO7YajflUtaiv%2B/GpOWxQGhitJgPi2VuH6u5lXpzn73NOXwro3Mt0KhGdFNaPqBJ1tg7EbtOggTqjKPNAWZF&isBackground=N&joycious=189&lang=zh_CN&networkType=4g&networklibtype=JDNetworkBaseAF&openudid=dd98775f26e5132fd2e047deb8cf12c5bac33d4b&osVersion=13.4.1&partner=apple&rfs=0000&scope=10&screen=828%2A1792&sign=3790d97ec6b327e5204c452ef770ea8c&st=1592389376075&sv=120&uts=0f31TVRjBSt1erjBp8D%2BeYyq4Q4Kt5cVCUCilgnJ505rpLP4rSKJxtGUA6BlyrgLvxdjKmR9X0M6oSoBPyZ6gYWn755Yfeotft18PGJTJ7tetZHznpsyFVyiyuAAn3Y5Hc%2Byr%2BzQbb8JCEXCwyu41KQZiUDc90jOD9O9S2V6KgxYwM4ssP9DunwJHLDpf9L%2B0xfiT0iTBwb0J85mFKZiiw%3D%3D&uuid=coW0lj7vbXVin6h7ON%2BtMNFQqYBqMahr&wifiBssid=unknown
function receiveNutrients(roundId) {

    let functionId = arguments.callee.name.toString();
    let body = {
        "monitor_refer": "plant_receiveNutrients",
        "monitor_source": "plant_app_plant_index",
        "roundId": roundId,
        "version": "9.0.0.1"
    }

    request(functionId, `body=${escape(JSON.stringify(body))}&uuid=&appid=ld`);
}
// https://api.m.jd.com/client.action?functionId=cultureBean
//收取营养液
function cultureBean(roundId, nutrientsType) {
    let functionId = arguments.callee.name.toString();
    let body = {
        "monitor_refer": "plant_index",
        "monitor_source": "plant_app_plant_index",
        "roundId": roundId,
        "nutrientsType": nutrientsType,
        "version": "9.0.0.1"
    }
    request(functionId, `body=${escape(JSON.stringify(body))}&uuid=&appid=ld`);
}

function productNutrientsTask(productTaskId, skuId) {
    let functionId = arguments.callee.name.toString();
    let body = {
        "monitor_refer": "plant_productNutrientsTask",
        "monitor_source": "plant_app_plant_index",
        "productTaskId": productTaskId,
        "skuId": skuId,
        "version": "9.0.0.1"
    }
    request(functionId, `body=${escape(JSON.stringify(body))}&uuid=&appid=ld`);
}

function productTaskList() {
    //https://api.m.jd.com/client.action?functionId=productTaskList&body=%7B%7D&uuid=&appid=ld
    let functionId = arguments.callee.name.toString();
    request(functionId, `body=%7B%7D&uuid=&appid=ld`);
}

function plantChannelNutrientsTask(channelTaskId, channelId) {
    let functionId = arguments.callee.name.toString();
    let body = { "channelTaskId": channelTaskId, "channelId": channelId }
    request(functionId, `body=${escape(JSON.stringify(body))}&uuid=&appid=ld`);
}

function plantChannelTaskList() {
    let functionId = arguments.callee.name.toString();
    request(functionId, `body=%7B%7D&uuid=&appid=ld`);
}

function shopNutrientsTask(shopTaskId, shopId) {
    let functionId = arguments.callee.name.toString();
    let body = { "version": "9.0.0.1", "monitor_refer": "plant_shopNutrientsTask", "monitor_source": "plant_app_plant_index", "shopId": shopId, "shopTaskId": shopTaskId }

    request(functionId, `body=${escape(JSON.stringify(body))}&uuid=&appid=ld`);
}

function shopTaskList() {
    let functionId = arguments.callee.name.toString();
    request(functionId, `body=%7B%7D&uuid=&appid=ld`);
}

function plantBeanIndex() {
    // https://api.m.jd.com/client.action?functionId=plantBeanIndex
    let functionId = arguments.callee.name.toString();
    request(functionId, plantBeanIndexBody);
}

function request(function_id, body = '') {
    $task.fetch(taskurl(function_id, body)).then(
        (response) => {
            // $.log(response.body)
            return JSON.parse(response.body)
        },
        (reason) => console.log(reason.error, reason)
    ).then((response) => sleep(response))
}

function taskurl(function_id, body) {
    return {
        url: `${JD_API_HOST}?functionId=${function_id}`,
        body: body, //escape`functionId=${function_id}&body=${JSON.stringify(body)}&appid=wh5`
        headers: {
            Cookie: cookie,
        },
        method: "POST",
    }
}

function sleep(response) {
    console.log('休息一下');
    setTimeout(() => {
        console.log('休息结束');
        Task.next(response)
    }, 2000);
}
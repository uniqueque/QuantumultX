/*
jd取消关注店铺、商品

*/


//直接用NobyDa的jd cookie
const cookie = $prefs.valueForKey('CookieJD')
const name = '京东取消关注'

let $ = init();

async function start() {
    try {
        //取消店铺关注
        console.log('开始取消店铺关注')
        while (true) {
            let shops = await getFollowShop();
            // console.log(shops)
            if (shops.iRet == 0) {
                if (shops.totalNum > 0) {
                    let shopids = shops.data.map(s => s.shopId).join(',')
                    let shopnames = shops.data.map(s => s.shopName).join(',')
                    // console.log(shopids)
                    console.log(`取消${shopnames}关注`)
                    await $.sleep(2000)
                    let res = await unfollowdShops(shopids)
                    if (res.iRet == 0) {
                        await $.sleep(500)
                    } else {
                        console.log(res.errMsg)
                        break
                    }
                } else {
                    break
                }
            } else {
                console.log(shops)
                break
            }
        }
        //取消商品关注
        console.log('开始取消商品关注')
        while (true) {
            let goods = await getFollowGood();
            // console.log(goods)
            if (goods.iRet == 0) {
                if (goods.totalNum > 0) {
                    let goodids = goods.data.map(s => s.commId).join(',')
                    let goodnames= goods.data.map(s => s.commTitle).join(',') 
                    // console.log(goodids)
                    console.log(`取消${goodnames}关注`)
                    await $.sleep(2000)
                    let res = await unfollowdGoods(goodids)
                    if (res.iRet == 0) {
                        await $.sleep(500)
                    } else {
                        console.log(res.errMsg)
                        break
                    }
                } else {
                    break
                }
            } else {
                console.log(goods)
                break
            }
        }
        console.log(name + '任务完成')
    } catch (e) {
        console.log(e);
    }
}

start()
function getFollowShop() {
    let url = {
        url: 'https://wq.jd.com/fav/shop/QueryShopFavList?cp=1&pageSize=10&sceneval=2&g_login_type=1&callback=jsonpCBKA&g_ty=ls',
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'Referer': 'https://wqs.jd.com/my/fav/shop_fav.shtml?sceneval=2&jxsid=15960121319555534107&ptag=7155.1.9',
            Cookie: cookie,
        },
    }
    // return $.get(url)
    return new Promise((resolve, reject) => $.get(url).then(body => resolve(JSON.parse(body.slice(14, -13))), err => reject(err)))
}

function unfollowdShops(shopids) {
    let url = {
        url: `https://wq.jd.com/fav/shop/batchunfollow?shopId=${shopids}&sceneval=2&g_login_type=1&callback=jsonpCBKG&g_ty=ls`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'Referer': 'https://wqs.jd.com/my/fav/shop_fav.shtml?sceneval=2&jxsid=15960121319555534107&ptag=7155.1.9',
            Cookie: cookie,
        },
    }
    // return $.get(url)
    return new Promise((resolve, reject) => $.get(url).then(body => resolve(JSON.parse(body.slice(14, -13))), err => reject(err)))
}

function getFollowGood() {
    let url = {
        url: 'https://wq.jd.com/fav/comm/FavCommQueryFilter?cp=1&pageSize=10&category=0&promote=0&cutPrice=0&coupon=0&stock=0&areaNo=1_72_4139_0&sceneval=2&g_login_type=1&callback=jsonpCBKB&g_ty=ls',
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'Referer': 'https://wqs.jd.com/my/fav/goods_fav.shtml?ptag=37146.4.1&sceneval=2&jxsid=15960121319555534107',
            Cookie: cookie,
        },
    }
    // return $.get(url)
    return new Promise((resolve, reject) => $.get(url).then(body => resolve(JSON.parse(body.slice(14, -13))), err => reject(err)))
}

function unfollowdGoods(goodids) {
    let url = {
        url: `https://wq.jd.com/fav/comm/FavCommBatchDel?commId=${goodids}&sceneval=2&g_login_type=1&callback=jsonpCBKM&g_ty=ls`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'Referer': 'https://wqs.jd.com/my/fav/goods_fav.shtml?ptag=37146.4.1&sceneval=2&jxsid=15960121319555534107',
            Cookie: cookie,
        },
    }
    // return $.get(url)
    return new Promise((resolve, reject) => $.get(url).then(body => resolve(JSON.parse(body.slice(14, -13).replace(',}', '}'))), err => reject(err)))
}

function init() {
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const sleep = (ms) => {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, ms);
        })
    }
    const notify = (title, subtitle, message) => {
        if (isQuanX) $notify(title, subtitle, message)
        if (isSurge) $notification.post(title, subtitle, message)
    }
    const write = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key)
        if (isSurge) return $persistentStore.write(value, key)
    }
    const read = (key) => {
        if (isQuanX) return $prefs.valueForKey(key)
        if (isSurge) return $persistentStore.read(key)
    }
    const get = (url) => {
        if (isQuanX) {
            return new Promise((resolve, reject) => {
                if (typeof url == "string") url = { url: url };
                url.method = 'GET';
                $task.fetch(url).then(response => resolve(response.body), reason => reject(reason.error))
            })
        } else if (isSurge) {
            return new Promise((resolve, reject) => {
                $httpClient.get(url, (error, response, body) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(body)
                    }
                })
            })
        }
    }
    const post = (url) => {
        if (isQuanX) {
            return new Promise((resolve, reject) => {
                if (typeof url == "string") url = { url: url };
                url.method = 'POST';
                $task.fetch(url).then(response => resolve(response.body), reason => reject(reason.error))
            })
        } else if (isSurge) {
            return new Promise((resolve, reject) => {
                $httpClient.post(url, (error, response, body) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(body)
                    }
                })
            })
        }
    }
    return { notify, write, read, get, post, sleep }
}
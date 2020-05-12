//v3

var $nobyda = nobyda()
var dnotify = $nobyda.done()
var notify = {}
if ($nobyda.isRequest) {
  GetCookie()
} else {
  all()
}
async function all() {
  await Checkin();
  await login();
  await Lottery();
}

function Checkin() {
  return new Promise(resolve => {
    var URL = {
      url: 'https://tc.vip.iqiyi.com/taskCenter/task/queryUserTask?autoSign=yes&P00001=' + $nobyda.read("CookieQY")
    }
    $nobyda.get(URL, function(error, response, data) {
      if (error) {
        notify = "签到失败: 接口请求出错 ‼️"
        console.log("爱奇艺会员签到失败:\n" + error)
      } else {
        var obj = JSON.parse(data)
        if (obj.msg == "成功") {
          if (obj.data.signInfo.code == "A00000") {
            var AwardName = obj.data.signInfo.data.rewards[0].name;
            var quantity = obj.data.signInfo.data.rewards[0].value;
            var continued = obj.data.signInfo.data.continueSignDaysSum;
            notify = "签到成功: " + AwardName + quantity + ", 已连签" + continued + "天 🎉"
          } else {
            notify = "签到失败: " + obj.data.signInfo.msg + " ⚠️"
          }
        } else {
          notify = "签到失败: Cookie无效 ⚠️"
        }
      }
      resolve()
    })
  });
}

function login() {
  return new Promise(resolve => {
    var URL = {
      url: 'https://cards.iqiyi.com/views_category/3.0/vip_home?secure_p=iPhone&scrn_scale=0&dev_os=0&ouid=0&layout_v=6&psp_cki=' + $nobyda.read("CookieQY") + '&page_st=suggest&app_k=8e48946f144759d86a50075555fd5862&dev_ua=iPhone8%2C2&net_sts=1&cupid_uid=0&xas=1&init_type=6&app_v=11.4.5&idfa=0&app_t=0&platform_id=0&layout_name=0&req_sn=0&api_v=0&psp_status=0&psp_uid=451953037415627&qyid=0&secure_v=0&req_times=0',
      headers: {
        sign: '7fd8aadd90f4cfc99a858a4b087bcc3a',
        t: '479112291'
      }
    }
    $nobyda.get(URL, function(error, response, data) {
      if (error) {
        notify += "\n登录失败: 接口请求出错 ‼️"
        console.log("爱奇艺会员登录失败:\n" + error)
      } else if (data.match(/\"text\":\"\d.+?\u5230\u671f\"/)) {
        notify += "\n登录成功: " + data.match(/\"text\":\"(\d.+?\u5230\u671f)\"/)[1]
      } else if (data.match(/\"text\":\"\u7acb\u5373\u5f00\u901a\u4f1a\u5458\"/)) {
        notify += "\n登录失败: 用户不是会员 ⚠️"
      } else {
        notify += "\n登录失败: 未知错误 ⚠️"
        console.log("爱奇艺会员登录失败:\n" + data)
      }
      resolve()
    })
  });
}

function Lottery() {
  return new Promise(resolve => {
    var URL = {
      url: 'https://iface2.iqiyi.com/aggregate/3.0/lottery_activity?app_k=0&app_v=0&platform_id=0&dev_os=0&dev_ua=0&net_sts=0&qyid=0&psp_uid=0&psp_cki=' + $nobyda.read("CookieQY") + '&psp_status=0&secure_p=0&secure_v=0&req_sn=0'
    }
    $nobyda.get(URL, function(error, response, data) {
      if (error) {
        notify += "\n抽奖失败: 接口请求出错 ‼️"
        console.log("爱奇艺会员抽奖失败:\n" + error)
        $nobyda.notify("爱奇艺", "", notify)
      } else {
        var obj = JSON.parse(data);
        if (obj.awardName && obj.code == 0) {
          notify += "\n抽奖成功: " + obj.awardName.replace(/《.+》/, "未中奖") + " 🎉"
        } else if (data.match(/\"errorReason\"/)) {
          msg = data.match(/msg=(.+?)\)/) ? data.match(/msg=(.+?)\)/)[1] : ""
          notify += "\n抽奖失败: " + msg + " ⚠️"
        } else {
          notify += "\n抽奖错误: 已输出日志 ⚠️"
          console.log("爱奇艺会员抽奖失败:\n" + data)
        }
        if (data.match(/\"daysurpluschance\":\"(1|2)\"/)) {
          Lottery(notify)
        } else {
          $nobyda.notify("爱奇艺", "", notify)
        }
      }
      resolve()
    })
  });
}

function GetCookie() {
  var regex = /authcookie=([A-Za-z0-9]+)/;
  var iQIYI = regex.exec($request.url)[1];
  if ($nobyda.read("CookieQY")) {
    if ($nobyda.read("CookieQY") != iQIYI) {
      var cookie = $nobyda.write(iQIYI, "CookieQY");
      if (!cookie) {
        $nobyda.notify("更新爱奇艺签到Cookie失败‼️", "", "")
      } else {
        $nobyda.notify("更新爱奇艺签到Cookie成功 🎉", "", "")
      }
    }
  } else {
    var cookie = $nobyda.write(iQIYI, "CookieQY");
    if (!cookie) {
      $nobyda.notify("首次写入爱奇艺Cookie失败‼️", "", "")
    } else {
      $nobyda.notify("首次写入爱奇艺Cookie成功 🎉", "", "")
    }
  }
}

function nobyda() {
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
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
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status
      } else if (response.statusCode) {
        response["status"] = response.statusCode
      }
    }
    return response
  }
  const get = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) $httpClient.get(options, (error, response, body) => {
      callback(error, adapterStatus(response), body)
    })
  }
  const done = (value = {}) => {
    if (isQuanX) isRequest ? $done(value) : null
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    isRequest,
    notify,
    write,
    read,
    get,
    done
  }
};
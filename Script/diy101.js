
var obj = JSON.parse($response.body);

if ($request.url.indexOf("/geo") != -1){
    obj.geo="CN";
    obj.ip="220.181.38.148";
}

if ($request.url.indexOf("/m1/sso/reg") != -1){
    obj.is_vip=true;
}
$done({body: JSON.stringify(obj)});
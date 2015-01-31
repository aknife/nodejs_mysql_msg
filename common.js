// 创建websocket连接
var socket = io.connect('http://localhost:8080');

// 把信息显示到div上
socket.on('notification', function (data) {
    var articlesList = "<div id='main'><div class='bar'><span class='title'>标题</span><span class='send_user'>发件人</span><span class='time'>时间</span></div>";

    // 未读消息数量
    var noRead = 0;

    $.each(data.articles,function(index,article){
        var colorClass = (article.state == 0) ? 'red' : 'gray';
        articlesList += "<div class='content "+colorClass+"' onclick=\"lookContent(this,'"+article.id+"','"+article.title+"','"+article.sid+"','"+article.rid+"','"+article.time+"','"+article.content+"')\"><span class='title'>" + article.title + "</span><span class='send_user'>" + article.sid + "</span><span class='time'>" + formatDate(article.time) + "</span></div>"; 
        if(article.state == 0){noRead++;}
    });
    articlesList += "</div>";
    $('#container').html(articlesList);

    // 闪动标题栏
    if ( noRead > 0 ) {
        titleFlicker(noRead,data.ifShow);
    } else {
        document.title = document.title.replace(/【.*】/, '');
    }
    
});

// 时间计算
function laseDate(time) {
    // 当前时间
    var nowTime = new Date();
    // 消息发送时间
    var sendTime = new Date(time*1000);

    // 比较时间差
    if( nowTime.getFullYear() == sendTime.getFullYear() && nowTime.getMonth() == sendTime.getMonth() && nowTime.getDate() == sendTime.getDate() && nowTime.getHours() - sendTime.getHours() < 3 ) {
        if( nowTime.getHours() - sendTime.getHours() > 2 ) {
            return '2小时前';
        } else if ( nowTime.getHours() - sendTime.getHours() >= 1 ) {
            return '1小时前';
        } else if ( nowTime.getHours() - sendTime.getHours() == 0 ) {
            if ( nowTime.getMinutes() - sendTime.getMinutes() < 0 ) {
                return ( nowTime.getMinutes() - sendTime.getMinutes() + 60 )+'分钟前';
            } else if ( nowTime.getMinutes() - sendTime.getMinutes() > 1 ) {
                return ( nowTime.getMinutes() - sendTime.getMinutes() )+'分钟前';
            } else {
                return '刚刚';
            }
        }
    }else {
        return formatDate(time);
    }
}

// 时间戳转换为时间
function formatDate(time) {
    // 消息发送时间
    var sendTime = new Date(time*1000);
    
    // 格式化时间
    var year=sendTime.getFullYear();
    var month=(sendTime.getMonth()+1<10)?('0'+(sendTime.getMonth()+1)):(sendTime.getMonth()+1);
    var day=(sendTime.getDate()<10)?('0'+sendTime.getDate()):(sendTime.getDate());
    var hour=(sendTime.getHours()<10)?('0'+sendTime.getHours()):(sendTime.getHours());
    var minute=(sendTime.getMinutes()<10)?('0'+sendTime.getMinutes()):(sendTime.getMinutes());
    var second=(sendTime.getSeconds()<10)?('0'+sendTime.getSeconds()):(sendTime.getSeconds());
    //return year+"-"+month+"-"+day+"   "+hour+":"+minute+":"+second;
    return year+'-'+month+'-'+day+' '+hour+':'+minute;
}

// 查看消息内容 并返回已读
function lookContent(obj,id,title,sendUser,receiveUser,time,content){
    var box = 450;
    var th= $(window).scrollTop()+$(window).height()/2-box/2;
    var h =document.body.clientHeight;
    var rw =$(window).width()/2-box/2;
    $(".showbox").animate({top:th,opacity:'show',width:450,height:280,right:rw},0);
    $("#zhezhao").css({
        display:"block",height:$(document).height()
    });

    $("#msg_title").html(title);
    $("#msg_sendUser").html(sendUser);
    $("#msg_receiveUser").html(receiveUser);
    $("#msg_time").html(formatDate(time));
    $("#msg_content").html(content);

    // 手动更改css为已读状态，等待nodejs刷新
    obj.className = 'content gray';

    // 设置消息已读
    socket.emit('changeState', { id: id });

    return false;
}

// 关闭弹出层
$(".showbox .close").click(function(){
    $(this).parents(".showbox").animate({top:0,opacity: 'hide',width:0,height:0,right:0},0);
    $("#zhezhao").css("display","none");
});


// 标题栏闪动 收集与互联网
function titleFlicker(nums,ifShow){
    var title = document.title;
    var title_default = title.replace(/【.*】/, '');
    show = '【' + nums + '条新消息】' + title_default ;
    none = '【 　 　 　　】' + title_default;
     if(ifShow == 0) {
        document.title = show;
    } else {
        document.title = none;
    }
}

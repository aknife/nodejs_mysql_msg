<?php
    header("content-type:text/html;charset=utf-8");

    // 数据库链接参数
    $host = '127.0.0.1';
    $dbname = 'php_nodejs_socket_test';
    $dbuser = 'root';
    $dbpwd = 'aknife';

    // 链接数据库
    mysql_connect($host, $dbuser, $dbpwd) or die('数据库连接失败！');

    // 选择数据库
    $select_db = mysql_select_db($dbname);
    if (!$select_db) {
        // 创建数据库
        $sql ="CREATE DATABASE IF NOT EXISTS php_nodejs_socket_test DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci";
        mysql_query($sql);

        // 选择数据库
        mysql_select_db($dbname);

        // 创建消息表
        $sql = "
CREATE TABLE IF NOT EXISTS `message` (
    `id` MEDIUMINT(8) unsigned NOT NULL auto_increment COMMENT 'id编号',
    `send_user` CHAR(16) NOT NULL COMMENT '发件人',
    `receive_user` CHAR(32) NOT NULL COMMENT '收件人',
    `title` CHAR(80) NOT NULL COMMENT '标题',
    `content` CHAR(32) NOT NULL COMMENT '内容',
    `time` INT(10) NOT NULL COMMENT '发送时间',
    `state` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态 1已读 0未读',
    PRIMARY KEY (`id`),
    KEY (`sid`),
    KEY (`rid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;";
        mysql_query($sql);
    }

    // 连接数据库
    mysql_select_db($dbname);

    if ( isset($_POST['submit']) ) {
        $time = time();
        // 写入数据库
        $sql = "INSERT INTO message(sid, rid, title, content, time, state) VALUES('admin', '{$_POST['fuser']}', '{$_POST['title']}', '{$_POST['content']}', {$time}, 0)";
        if( mysql_query($sql) ) {
            $error = '消息发送成功！';
        } else {
            $error = '消息发送失败！';
        }

    }
?>
    <div style='text-align:center;'>
        <form action='' method='post'>
            <h3>发送消息 <span style='color:red;'><?php if( !empty($error) ) { echo $error; }?></span></h3>
            <p><input type='text' name='title' value='这是默认标题'></p>
                接收人：
                <select name='fuser'>
                    <option value='user' > 前端用户 </option>
                </select>
            </p>
            <p>
                <input type='text' name='content' value='这是一个消息内容'>
            </p>
            <input type='submit' name='submit' value=' 登 录 '>
        </form>
    </div>

    



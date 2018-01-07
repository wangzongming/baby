
var wxx = {
    winWidth : $(window).width(),
    indexPageEl:'#indexPage',//首页
    gamePageEl:'#game',//游戏页面
    musicEl: '#musicMP3',
    protagonistEl:'.per',//主角元素
    sweetEl:'.sweet',//糖果元素
    sweetSpeed:4,//多长时间走完 s
    timeEl:'.timer-num',//倒计时容器
    scoreEl:'.score-num',//得分容器
    goodTextEl:'#good',
    gameTime:60,//游戏时间 s  写数字
    randomSweetInt:2000,//出糖果的间隔
    randomStInt:1000,//两边石头动画间隔
    score:0,//得分
    upIng:false,//是否正在跳跃
    goodText:true,//是否开点赞
    musicBtn: true,//是否开启音乐按钮
    musicIsAutoPlay: true,//音乐是否自动播放 
    musicUrl: 'http://sc1.111ttt.com/2017/1/11/11/304112002347.mp3',//音乐地址
    sweetData:[{//糖果类型 随机出
        type:'good',
        result:10, //碰到后的得分
        width:'2rem',
        background:'./img/naiping.png',
        img:'10分的好糖果'//元素
        },{
            type:'bad',
            result:-10,
            width:'2rem',
            background:'./img/zadan.png',
            img:'-10分的坏糖果'
        },{
            type:'good',
            result:1,
            width:'2rem',
            background:'./img/tang1.png',
            img:'1分的好糖果'
        },{
            type:'bad',
            result:-1,
            width:'4rem',
             background:"./img/zhentou.png",
            img:'-1分的坏糖果'
        }],
    lPos:["15%", "40%", "70%"],//糖果位置
    upAin:function(dom, cb){//跳跃函数  回调
        $(dom).css({
            width:"3rem",
            bottom:'55%'
        })
        cb(dom);
    },
    music: function (musicDom, $this) {//音乐按钮
        var audio = $(musicDom)[0];
        $this.addClass('musicBtn');
        if (wxx.musicIsAutoPlay === true) {
          $this.css({
            "animation-play-state": "paused",
            "box-shadow": '0 0 10px pink',
          })
          wxx.musicIsAutoPlay = false;
          audio.pause();
        } else {
          $this.css({
            "animation-play-state": "running",
            "box-shadow": '0 0 0px pink'
          })
          audio.play();
          wxx.musicIsAutoPlay = true;
        }
    },
    crash:function(domOne, domTwo, cb){//碰撞检测  回调
        if(!domTwo){
            return;
        }
        var $domOne = $(domOne);
        var $domTwo = $(domTwo);

        var domOneX = $domOne.offset().left;//角色的X
        var domOneY = $domOne.offset().top;//角色的Y
    
        if(!$domTwo.offset()){
            return;
        }

        var domTwoX = $domTwo.offset().left;//糖果的X
        var domTwoY = $domTwo.offset().top;//糖果的Y

        var domOneWidth =  $domOne.width(); //角色的宽
        var domOneHeight =  $domOne.height(); //角色的宽
        var domTwoWidth =  $domTwo.width(); //糖果的宽

        var perY = parseInt(domOneY + domOneHeight );//人物脚的Y点
        var sweY = parseInt(domTwoY)

        if( (domTwoX > domOneX - domTwoWidth / 3)  && (domTwoX <    domOneX +  domOneWidth) && !wxx.upIng  ){//碰撞到糖果  左右距离检测         
            if( (sweY <= perY)  && ( sweY >= perY - 5) ){//上下距离检测 
                cb($domTwo);//执行回调
            }else{  
                cb(false);
            }
        }else{
            cb(false);
        }
    },
    playGame:function(cb){//开始游戏 点击后触发  回调
        $(wxx.indexPageEl).fadeOut('slow',function(){
            $(wxx.gamePageEl).fadeIn('slow', function(){
                cb();
            });
        });
    },
    ajax: function (apiName, params, cb) {
        $.ajax({
          type: 'get',
          data: JSON.stringify(params),
          url: wxx.url + apiName,
          success: function (res) {
            cb(res)
          },
          error: function (err) {
            console.log("请求错误")
          }
        })
    },
    gameOver:function(gameTimer, cb){ //定时器必传  默认不管即可
        $(wxx.timeEl).html( '0' );
        if(wxx.requestAnimationFrameFn){
            window.cancelAnimationFrame(wxx.requestAnimationFrameFn);
            wxx.requestAnimationFrameFn = null;
        }else{
            clearInterval(gameTimer);
        }
        cb();
    },
    getUrlParam: function (k) {//获取地址栏参数，k键名
        var m = new RegExp("(^|&)" + k + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(m);
        if (r != null) return decodeURI(r[2]); return null;
    },
    gameOverHtml:function(score){
        var html = '';
              html  += '得分：' + score;//游戏结束时的html内容
                //some code ....
        return html;
    },
    createSweet:function(opt,cb){//创建糖果  回调
        var className = opt.className,
                type = opt.type,
                result = opt.result,
                html = opt.html,
                dom = opt.insertDom,
                background = opt.style.background,
                width = opt.style.width,
                left = opt.style.left;
                right = opt.style.right

        var $div = $('<div>',{
            'class':className,
            'type':type,
            'result':result,
        }).appendTo(dom);

        $div.css({
            left:left,
            right:right,
            width:width,
            background:'url('+background+')no-repeat left top / 100% 100%',
        })
        cb($div);
    },
    timeSetinterval:function(t,cb){//定时器
        var tt = setInterval(cb,t);
        return tt;
    },
    
    className:'',//---------------------这些都是必备的临时变量
    keyframes:40,//刷新频率
    sweetElArr:[],//页面糖果的class集合
    sweetRanVar:0,//临时变量
    testIndex:'',//定时器
    sweetTimer:'',//每个精灵的计时器 随机变量名
    touchStartY:'',//用于y位置
    touchStartX:'',//触摸x位置
    activeL:true,
    createSweetInterval:null,//糖果定时器
    stInterval:null,
    activeFn:function(){
        if(wxx.upIng){
            return;
        }else if(wxx.activeL){
            $(".per img").attr("src","./img/right.png");
            wxx.activeL = !(wxx.activeL);
        }else{
            $(".per img").attr("src","./img/left.png");
            wxx.activeL = !(wxx.activeL);
        }
    },
    perInterval:null,
    randomClass: function(){
        return parseInt( Math.random() * 10000 + new Date().getTime()  )
    },
    gameTimer:null,
    timeout_geme:0,
    st:true,//用于石头动画 固定
    stTimeOut:0,
    crashObj:{},
    requestAnimationFrameFn:null,
    createSweetFn:function(){//创建糖果的方法
        var sweetRandom = parseInt( Math.random() * (wxx.sweetData.length) );//随机糖果类型
        var sweetLeftRandom = wxx.lPos[ parseInt( Math.random() * 3 )] 
        wxx.className = wxx.randomClass().toString();

        wxx.createSweet({//创建糖果
            className:'sweet ' +  wxx.className + ' ',
            type:wxx.sweetData[sweetRandom].type,
            result:wxx.sweetData[sweetRandom].result.toString(),
            style:{
                background:wxx.sweetData[sweetRandom].background,
                left:sweetLeftRandom,
                width:wxx.sweetData[sweetRandom].width,
            },
            html:wxx.sweetData[sweetRandom].img,
            insertDom:wxx.gamePageEl
        },function($this){
            var thisX = $this.offset().left;
            if(thisX < 80 ){
                $this.addClass("sweetL")
            }else if(thisX > (wxx.winWidth/2 + 40)){
                $this.addClass("sweetR");
            }else{
                $this.addClass("sweetC");
            }
        
            wxx.sweetElArr.push(wxx.className);
            setTimeout(function(){
                var aaa = wxx.sweetElArr.shift();
                $('.'+aaa).remove();
            },5000)
        })
        wxx.sweetRanVar  = 0;        

    },
    stAniFn:function(){//两边的石头动画
         wxx.st = !(wxx.st);
            wxx.createSweet({//创建石头
                className:'sweet shitouL ' ,
                type:'st',
                result:'0',
                style:{
                    background: wxx.st ? "./img/st1.png" : "./img/st2.png", 
                    left:'-3rem',
                    width:'2.5rem',
                },
                html:'',
                insertDom:wxx.gamePageEl
            },function($this){
                setTimeout(function(){
                    $this.remove();
                },5000)
            })

            wxx.createSweet({//创建石头
                className:'sweet shitouR' ,
                type:'st',
                result:'0',
                style:{
                    background: wxx.st ? "./img/st2.png" : "./img/st1.png", 
                    left:'110%',
                    width:'2.5rem',
                },
                html:'',
                insertDom:wxx.gamePageEl
            },function($this){
                setTimeout(function(){
                    $this.remove();
                },5000)
            })
    },
    playGameFn:function(cb){     //碰撞检测   
        if(wxx.className){
            $.each(wxx.sweetElArr, function(i, v){
                wxx.crash(wxx.protagonistEl, '.' +v, function(sweet){//碰撞检测
                    if(sweet){
                        var result = Number( $(sweet).attr('result') );
                        $(sweet).addClass('remove');
                        $(sweet).attr('result',0);
                        // if(result > 0){//如果得分
                        //     if(wxx.goodText){
                        //         $(wxx.goodTextEl).fadeIn('10',function(){//点赞按钮
                        //             $(wxx.goodTextEl).fadeOut('slow');
                        //         })
                        //     }
                        // }
                        wxx.score = wxx.score + result ;
                        $(wxx.scoreEl).html( wxx.score );
                    }else{
                        // console.log("未得分")
                    }
                })
            })
            
        }

        //游戏完成一组动作  继续刷新屏幕
       if(wxx.requestAnimationFrameFn){
            requestAnimationFrame(wxx.playGameFn);
       }
        
    },
    playGameInterval:function(){//游戏逻辑
        //执行生成糖果的定时器
        wxx.createSweetInterval = setInterval(wxx.createSweetFn, wxx.randomSweetInt);
        wxx.stInterval = setInterval(wxx.stAniFn, wxx.randomStInt )

        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        if(window.requestAnimationFrame){
            wxx.requestAnimationFrameFn = requestAnimationFrame(wxx.playGameFn);
        }else{
            alert('您当前设备无法使用 requestAnimationFrame，可能会造成游戏小卡顿！')
            wxx.gameTimer = setInterval( wxx.playGameFn, 1000 / wxx.keyframes);
        }
    },
    createRankingDom: function (data, cb) {
        var html = '<ul class="ranking-ul scroll" style="max-height:400px;overflow-y:scroll;padding-top:.8rem;">';
        html += '<li>';
        html += '<div>';
        html += '<span class="ranking-ranking"><b>名次</b></span>';
        html += '<span class="ranking-name"><b>姓名</b></span>';
        html += '<span class="ranking-result"><b>得分</b></span>';
        html += '</div>';
        html += '</li>';
        $.each(data, function (i, v) {
          html += '<li>';
          html += '<div>';
          html += '<span class="ranking-ranking">';
          html += v.ranking
          html += '</span>';
          html += '<span class="ranking-name">';
          html += v.name
          html += '</span>';
          html += '<span class="ranking-result">';
          html += v.result
          html += '</span>';
          html += '</div>';
          html += '</li>';
        })
        html += '<ul>';
        cb(html);
      },
      overscroll : function(els){
        for (var i = 0; i < els.length; ++i) {
            var el = els[i];
            el.addEventListener('touchstart', function () {
                var top = this.scrollTop
                    , totalScroll = this.scrollHeight
                    , currentScroll = top + this.offsetHeight;
                if (top === 0) {
                    this.scrollTop = 1;
                } else if (currentScroll === totalScroll) {
                    this.scrollTop = top - 1;
                }
            });
            el.addEventListener('touchmove', function (evt) {
                if (this.offsetHeight < this.scrollHeight)
                    evt._isScroller = true;
            });
        }
      },
      globalTimeS:function(){//页面每秒钟都会执行这个函数
        wxx.gameTime -- ;
        if( wxx.gameTime <= 0 ){//结束游戏
            wxx.gameOver(wxx.gameTimer,  function(){
                var gameOverHtml =  wxx.gameOverHtml(wxx.score);
                var ranking = JSON.parse( localStorage.getItem("ranking")) || [];//将分数储存到本地
                ranking.push({score : wxx.score })
                localStorage.setItem("ranking", JSON.stringify(ranking) );

                clearInterval(wxx.perInterval);//小人停止跑动
                clearInterval(wxx.createSweetInterval);//停止生成糖果
                clearInterval(wxx.stInterval);//石头动画停止

                wxx.timeout = null;//清除定时器
                if(layer){
                    layer.open({
                        title: [
                            "游戏结束",
                             'background-color: green; color:#fff;'
                        ]
                        ,content: gameOverHtml
                        ,end:function(){
                            window.location.reload();
                        }
                    });   
                }else{
                    alert("游戏结束!  \n 得分：" + wxx.score );
                    window.location.reload()
                }
            })
        }else{
            $(wxx.timeEl).text( wxx.gameTime );
        }
      },
      timeout:function(){
          setTimeout(function(){
            wxx.globalTimeS()
            wxx.timeout2();
        },1000)
      },
      timeout2:function(){
        wxx.timeout()
    }
}

!function(){//自动配置页面
    var isautoplay = "autoplay";
    wxx.musicIsAutoPlay ? isautoplay = "autoplay" : isautoplay = '';
    if (wxx.musicBtn === true) {
        var $music = $('<div id="music" class="' + (wxx.musicIsAutoPlay ? 'musicBtn' : '') + '" >  <audio preload="load" id="musicMP3"  ' + isautoplay + '  src=" ' + wxx.musicUrl + ' "></audio></div>');
            $music.click(function () {//音乐"#musicMP3"
            wxx.music(wxx.musicEl, $(this));
        })
        $("body").append($music)
    }
}()

//样式问题
$(window).resize(function(){
    wxx.winWidth =  $(window).width();
    $('body').css({
        height:$(window).height()
    })
})
$('body').css({
    height:$(window).height()
})

// --------------一些点击事件

$(".startBtn").click(function(){//开始按钮
    wxx.playGame(function(){
        var t = setInterval( function(){
            var num = Number( $('.shadow .t').text() ) - 1;
            if(  num < 1 ){
                $('.shadow .t').html("GO");
            }else{  
                $('.shadow .t').html( num  );
            }
        }, 1000);
        setTimeout(function(){
            $('.shadow').fadeOut('slow', function(){    

                wxx.timeout();
                wxx.perInterval = setInterval(wxx.activeFn, 150);
                wxx.playGameInterval();
                
            }); 
        },3000);
    })
})

$(".shuoming").click(function(){//首页说明按钮
    var smHtml = '<p>'
    +'1、开始游戏点击即可开始游戏'
    +'</p>'
    +'<p>'
    +'2、开始游戏后不可中途退出'
    +'</p>'
    +'<p>'
    +'3、玩一次三万'
    +'</p>'


    var aHtml = '<div class="smCon">'
    +'<div class="tab">'
    +'<div><span class="shuomingCon clicked">说明</span>   <span class="paihangCon">排行</span></div>'
    +'</div>'
    +'<div class="context">'
    +'<div class="contextL" style="text-align:left;">'
    + smHtml
    +'</div>'
    +'</div>'
    +'<div>';
    layer.open({
        title: [
            '游戏说明',
            'background-color: #e64418; color:#fff;padding:0;margin:0;height:1.5rem;padding:0rem;line-height:1.5rem;'
        ],
        style:"padding:0;",
        content: aHtml
    });

    $(".paihangCon ").click(function(){
        $(this).addClass('clicked');
        $(".shuomingCon ").removeClass('clicked')

        $(".smCon .contextL").fadeOut('10', function(){
            var score = JSON.parse(localStorage.getItem("ranking"));
            var rankingData = [];
            var sortArr = [];
            $.each(score, function(i, v){
                sortArr.push(v.score)
            }) 
            sortArr.sort(function(a, b){
                return b - a;
            })  
            $.each(sortArr, function(i, v){
                rankingData.push({
                    name:"me",
                    result: v +"分",
                    ranking:i+1
                })
            })
            wxx.createRankingDom(rankingData, function (html) {
                $(".smCon .contextL").html(html)
                $(".smCon .contextL").fadeIn()
            })
        })
    })

    $(".shuomingCon ").click(function(){
        $(this).addClass('clicked');
        $(".paihangCon ").removeClass('clicked')
        $(".smCon .contextL").fadeOut('10', function(){
            $(".smCon .contextL").html(smHtml);
            $(".smCon .contextL").fadeIn();
        })
    })

})

//角色动作
$('#game').on('touchstart touchmove touchend', function(event){
    var evType = event.type;
    switch(evType){
        case 'touchstart':
            var touch = event.originalEvent.targetTouches[0]; 
            wxx.touchStartY = touch.pageY;
            wxx.touchStartX = touch.pageX;
            break;
        case 'touchmove':
            var touch = event.originalEvent.targetTouches[0]; 
            var x = touch.pageX -  wxx.touchStartX;//移动的x轴距离
            var perLeft = $(wxx.protagonistEl).offset().left; //任务X轴位置
            var upLen =  wxx.touchStartY - touch.pageY;
            var touchX = perLeft + x
            var targetX = wxx.winWidth / 1.65;
            if(touchX    > targetX){//往右移动
                $(wxx.protagonistEl).css({
                    'transform':'translateX(1rem) rotateX(5deg)'
                })
            }else if(touchX > ( wxx.winWidth / 2)  - 80 && touchX < ( wxx.winWidth  / 2) + 80){//往中间
                $(wxx.protagonistEl).css({
                    'transform':'translateX(-50%) rotateX(5deg)' 
                })
            }else if(touchX < targetX ){//往左走
                $(wxx.protagonistEl).css({
                    'transform':'translateX(-3rem) rotateX(5deg)'
                })
            }

            if(upLen > 40){//向上
                wxx.upIng = true;
                wxx.touchStartY = 0;
                $(".per img").attr("src","./img/jump.png");
                wxx.upAin(wxx.protagonistEl, function(dom){
                    setTimeout(function(){
                        $(".per img").attr("src","./img/left.png");
                        $(dom).css({
                            width:'2rem',
                            bottom:'50%'
                        })
                        wxx.upIng = false;
                    },500);
                }) 
            }else{}
            break;
    }
})

//禁止body的滚动事件
document.body.addEventListener('touchmove', function (evt) {
    if (!evt._isScroller) {
        evt.preventDefault();
    }
});
//给class为.scroll的元素加上自定义的滚动事件
wxx.overscroll(document.querySelectorAll('.scroll'));

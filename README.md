# 效果图
<img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo1.gif" width="177"  /><img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo2.gif" width="177"  /><img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo3.gif" width="177"  /><img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo4.gif" width="177"  /><img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo5.gif" width="177"  /><img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo6.gif" width="177"  />

# 更新日志

>1、构造方法第一个参数支持传入canvas dom对象的id，既可以传canvas dom对象也可以传此dom对象的id。  
>2、增加setOptions方法，方便动态更新模拟时钟的属性。  
>3、修复传入options没有验证属性值的BUG，若传入的options的某些属性是undefined，那么就过滤掉该属性。  
>4、options新增handType指针类型，有line(线条)或triangle(三角形)两个可选值，默认triangle

# 1.安装
* &lt;script&gt;标签引入"dist/clock.js"或"dist/clock.min.js"
+ 使用npm，运行命令：npm install -D concise-clock
# 2.例子
## 2.1 最简单使用
* 代码
```javascript
//方法1，传入canvas dom对象
new Clock(document.getElementById("canvas")).run();

//方法2，传入canvas dom对象的id
new Clock("canvas").run();

```
* 效果  
<br/>
<img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo1.gif" width="300"  />

## 2.2 显示罗马数字
* 代码
```javascript
new Clock(document.getElementById("canvas"), {scaleType: "roman"}).run();
```
* 效果  
<br/>
<img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo2.gif" width="300"  />

## 2.3 自定义边框颜色、背景色、刻度线颜色以及小时数字颜色
* 代码
```javascript
new Clock(
    document.getElementById("canvas"),
    {
        borderColor: "brown",//边框颜色
        backgroundColor:"black",//表盘背景色
        hourColor:"white",//小时数字颜色
        scaleColor:"yellow"//刻度线颜色
    }
).run();
```
* 效果
<br/>
<img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo3.gif" width="300"  />

## 2.4 自定义边框图片、背景图片
* 代码1
```javascript
new Clock(
    document.getElementById("canvas"),
    {
        borderImage: "./img/border.png",
        backgroundImage: "./img/bg.jpg"
    }
).run();
```
* 代码2 使用远程图片
```javascript
new Clock(
    document.getElementById("canvas"),
    {
        borderImage: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1545553805386&di=ec656215a2958d617ef30631e96304e0&imgtype=0&src=http%3A%2F%2Fimg1.ali213.net%2Fshouyou%2Fupload%2Fimage%2F2018%2F07%2F09%2F584_2018070952816881.png",
        backgroundImage: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1545553773235&di=1c768f80fc088c2edc20fa75af77c515&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201607%2F03%2F20160703164252_2WySB.jpeg"
    }
).run();
```
* 效果
<br/>
<div>
    <img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo4.gif" width="300" />
    <img src="https://raw.githubusercontent.com/destiny-wenlun/concise-clock/master/img/demo5.gif" width="300" />
</div>

# 3.参数
## 3.1 Clock(canvas, options)
* canvas：用来显示模拟时钟的容器。可以是一个HTMLCanvasElement对象，也可以是一个HTMLCanvasElement对象的id。
+ options：options有默认值，可不传，但如果你想自定义一些漂亮的样式，就可以使用options参数。
## 3.2 options默认值
|属性|说明|类型|默认值|
|:-|:-|:-|:-|
|size|模拟时钟大小|Number|300|
|padding|内边距|Number|5|
|borderWidth|边框宽度|Number|15|
|borderColor|边框颜色|String|black|
|borderImage|边框背景图片，优先级高于borderColor|String|-|
|backgroundColor|背景色|String|white|
|backgroundImage|背景图片，优先级高于backgroundColor|String|-|
|backgroundMode|背景图显示模式,可选值part或full|String|full|
|backgroundAlpha|背景图片的透明度|Number|0.5|
|scaleType|显示的刻度类型，roman：罗马数字，arabic：阿拉伯数字，none：不显示|String|arabic|
|scaleColor|刻度线颜色|String|#666|
|hourColor|刻度值颜色|String|#666|
|handType|指针类型|line \| triangle|triangle|
|secondHandColor|秒针颜色|String|red|
|minuteHandColor|分针颜色|String|#666|
|hourHandColor|时针颜色|String|black|
|showShadow|时针颜色|Boolean|true|
|onload|图片加载完成回调，回调参数当前Clock对象|Function|-|

# 4.对象方法
* show(time): 用来显示一个时间，可以是Date对象，也可以是形如"hh:mm:ss"的字符串，此的方法返回值是当前对象。例如:
```javascript
//1.如果没有用到背景图或边框图，那么可以直接使用show方法
new Clock(document.getElementById("canvas")).show("15:25:40");

//2.若使用了背景图或边框图，那么需要在onload回调方法中使用show方法
new Clock(
    document.getElementById("canvas"),
    {
        borderImage: "./img/border.png",
        backgroundImage: "./img/bg.jpg",
        onload(clock) {
            clock.show("15:25:40")
        }
    }
);
```

* run(): 执行此方法，模拟时钟就会每隔1秒，渲染一次界面，此方法返回值是当前对象。例如：
```javascript
new Clock(document.getElementById("canvas")).run();
```

* stop(): 执行此方法，可停止每隔1秒渲染界面。例如：
```javascript
//运行一个模拟时钟，4秒后停止
var clock = new Clock(document.getElementById("canvas")).run();
setTimeout(function(){
    clock.stop();
}, 4000);
```

* setOptions(options): 执行此方法，动态改变模拟时钟的一些属性。例如：
```javascript
//运行一个模拟时钟，4秒后修改模拟时钟的尺寸为500，可参考demo/demo2.html
var clock = new Clock(document.getElementById("canvas")).run();
setTimeout(function(){
    clock.setOptions({size: 500});
}, 4000);
```
export default class Clock {
    constructor(canvas, options = {}) {
        /**默认选项 */
        this.options = {
            size: 300,
            padding: 5,
            borderWidth: 15,
            borderColor: "black",
            scaleType: "arabic",
            scaleColor: "#666",
            hourColor: "#666",
            backgroundColor: "white",
            secondHandColor: "red",
            minuteHandColor: "#666",
            hourHandColor: "black",
            backgroundMode: "full",
            showShadow: true,
            handType: "triangle",
            backgroundAlpha: 0.5,
        };
        this.interval = null;
        this.hours = []; //小时数字
        this.largeScale = 0; //大刻度长度
        this.smallScale = 0; //小刻度长度
        this.hourFontSize = 0; //小时数字字体大小
        this.headLen = 0; //针头长度
        this.secondHandLen = 0; //秒针长度
        this.minuteHandLen = 0; //分针长度
        this.hourHandLen = 0; //时针长度
        this.borderPattern = null;
        /**画布大小的一半 */
        this.halfSize = 0;
        /**外面传过来的要显示的canvas */
        this.container = null;
        this.ctx = null;
        /**表盘 */
        this.dialCanvas = document.createElement("canvas");
        this.dialCtx = this.dialCanvas.getContext("2d");
        if (!canvas) {
            throw new Error("请传入canvas参数！");
        }
        let container = canvas;
        if ("string" == typeof canvas) {
            container = document.getElementById(canvas);
        }
        if (!(container instanceof HTMLCanvasElement)) {
            throw new Error("传入的canvas参数不是一个HTMLCanvasElement对象！");
        }
        this.container = container;
        this.ctx = container.getContext("2d");
        this.setOptions(options);
    }
    async init() {
        const { size, borderWidth, borderImage, padding, scaleType = "arabic", backgroundImage, onload } = this.options;
        this.halfSize = size * 0.5;
        this.dialCanvas.width = this.container.width = size;
        this.dialCanvas.height = this.container.height = size;
        //大刻度线的长度为内圈半径的十二分之一
        this.largeScale = (this.halfSize - padding - borderWidth) / 12;
        //小刻度线的长度为大刻度线的一半
        this.smallScale = this.largeScale * 0.5;
        this.hourFontSize = this.largeScale * 1.2;
        this.headLen = this.smallScale * 1.5;
        this.secondHandLen = this.headLen * 12;
        this.minuteHandLen = this.headLen * 10;
        this.hourHandLen = this.headLen * 7;
        //平移坐标轴，将左上角的(0,0)点平移到画布中心。
        this.ctx.translate(this.halfSize, this.halfSize);
        this.dialCtx.translate(this.halfSize, this.halfSize);
        if ("roman" == scaleType) {
            this.hours = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
        }
        else if ("arabic" == scaleType) {
            this.hours = ["12", "1", "2", "3", "4", "5", "6", "7", '8', "9", "10", "11"];
        }
        else {
            this.hours = [];
        }
        if (borderImage) {
            this.borderPattern = await this.createPattern(this.dialCtx, borderImage, "repeat");
        }
        if (backgroundImage) {
            this.backgroundImage = await this.createImage(backgroundImage);
        }
        this.drawDial(this.dialCtx);
        if (onload instanceof Function) {
            onload(this);
        }
    }
    /**
     * 极坐标转平移后画布坐标
     * ps:极坐标极轴水平向上，角度正方向顺时针
     * ps:画布坐标是平移后的画布坐标，坐标原点画布中心，x轴水平向右，y轴竖直向下
     * @param r 当前点到原点的长度
     * @param radian 弧度
     */
    polarCoordinates2canvasCoordinates(r, radian) {
        //极轴竖直向上极坐标 转 极轴水平向右极坐标
        radian -= Math.PI * 0.5; //角度向右旋转90度即可
        //极轴水平向右极坐标转平移后画布坐标（x轴水平向右，y轴竖直向下）
        let x = r * Math.cos(radian);
        let y = r * Math.sin(radian);
        return { x, y };
    }
    /**绘制小时的文字 */
    drawHours(ctx, i, hour, end) {
        ctx.save();
        ctx.fillStyle = this.options.hourColor;
        ctx.font = `${this.hourFontSize}px 微软雅黑`;
        var w = ctx.measureText(hour).width;
        var h = this.hourFontSize;
        var { x, y } = end;
        //i为 0-11 对应1-12个小时数字（12开始，11结束）
        var padding = 5;
        switch (i) {
            case 0: //12
                x -= w * 0.5;
                y += h;
                break;
            case 1:
                x -= w;
                y += h;
                break;
            case 2:
                x -= w + padding;
                y += h - padding;
                break;
            case 3:
                x -= w + padding;
                y += h * 0.5;
                break;
            case 4:
                x -= w + padding;
                break;
            case 5:
                x -= w;
                break;
            case 6:
                x -= w * 0.5;
                y -= padding;
                break;
            case 8:
                x += padding;
                break;
            case 9:
                x += padding;
                y += h * 0.5;
                break;
            case 10:
                x += padding;
                y += h - padding;
                break;
            case 11:
                y += h;
                break;
        }
        ctx.fillText(hour, x, y);
        ctx.restore();
    }
    createImage(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.onerror = () => {
                reject(new Error("图片加载出错!"));
                this.stop(); //停止
            };
            img.src = src;
        });
    }
    createPattern(ctx, src, repetition) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                resolve(ctx.createPattern(img, repetition));
            };
            img.onerror = () => {
                reject(new Error("图片加载出错!"));
                this.stop(); //停止
            };
            img.src = src;
        });
    }
    /**绘制表盘 */
    drawDial(ctx) {
        const { padding, borderWidth, borderColor, borderImage, scaleColor, backgroundColor, backgroundImage, backgroundMode, backgroundAlpha, showShadow } = this.options;
        const hours = this.hours;
        const halfSize = this.halfSize;
        const shadowBlur = 10;
        const shadowOffset = 5;
        //--------外圈
        ctx.save();
        const x = 0;
        const y = 0;
        const outsideR = halfSize - padding - (showShadow ? shadowBlur + shadowOffset : 0);
        ctx.arc(x, y, outsideR, 0, 2 * Math.PI, true);
        if (borderImage && this.borderPattern) { //边框背景图
            ctx.fillStyle = this.borderPattern;
        }
        else { //边框颜色
            ctx.fillStyle = borderColor;
        }
        //--------内圈 利用相反缠绕可形成内阴影
        const insideR = outsideR - borderWidth;
        ctx.arc(x, y, insideR, 0, 2 * Math.PI, false);
        if (showShadow) {
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = "#666";
            ctx.shadowOffsetX = shadowOffset;
            ctx.shadowOffsetY = shadowOffset;
        }
        ctx.fill();
        ctx.restore();
        //--------内圈的背景图或背景色
        ctx.beginPath();
        ctx.save();
        if (backgroundImage && this.backgroundImage) { //背景图
            const { width, height } = this.backgroundImage;
            const r = "full" == backgroundMode ? insideR : insideR - this.largeScale - this.hourFontSize - 15;
            ctx.globalAlpha = backgroundAlpha;
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.clip(); //按内圈区域裁剪图片
            //最小的一边要刚好能显示完全 ,r * 2直径
            const scale = r * 2 / Math.min(width, height);
            ctx.drawImage(this.backgroundImage, -r, -r, width * scale, height * scale);
        }
        else if ("white" != backgroundColor) { //背景色，若背景色是白色，就不必填充，因为原本就是白色，并且不填充可以渲染出内阴影效果
            ctx.arc(x, y, insideR, 0, 2 * Math.PI);
            ctx.fillStyle = backgroundColor;
            ctx.fill();
        }
        ctx.restore();
        //--------刻度线和刻度值
        //一圈被分成60份，每一份的度数是360/60=6度，转换为弧度(Math.PI/180)*6=Math.PI/30
        const unit = Math.PI / 30;
        for (let scale = 0; scale < 60; scale++) { //从12点到11点59秒顺时针            
            const radian = unit * scale;
            const start = this.polarCoordinates2canvasCoordinates(insideR, radian);
            const len = 0 == scale % 5 ? this.largeScale : this.smallScale;
            const end = this.polarCoordinates2canvasCoordinates(insideR - len, radian);
            ctx.beginPath();
            ctx.save();
            if (0 == scale % 5) {
                ctx.lineWidth = 3;
                if (hours && hours.length == 12) {
                    const hourIndex = scale / 5;
                    this.drawHours(ctx, hourIndex, hours[hourIndex], end);
                }
            }
            else {
                ctx.lineWidth = 1;
            }
            ctx.strokeStyle = scaleColor;
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            ctx.restore();
        }
    }
    /**绘制时针 */
    drawHand(ctx, time = new Date()) {
        let { secondHandColor, minuteHandColor, hourHandColor } = this.options;
        /*
        * 一圈被分、秒成分了60份，每一份的度数为:6度 转换成弧度:Math.PI/30
        * 一圈被时成了12份，每一份的度数为:30度 转换成弧度:Math.PI/6
        * 分针每走完一圈，时针就会慢慢过度到一个大刻度，
        * 那么分针每走一个小刻度，时针在每个大刻度(大刻度之间的度数为30度)之间过度的角度为：30/60 = 0.5度 转换成弧度：Math.PI/360
        */
        this.drawNeedle(ctx, time.getHours() * Math.PI / 6 + time.getMinutes() * Math.PI / 360, hourHandColor, this.hourHandLen);
        this.drawNeedle(ctx, time.getMinutes() * Math.PI / 30, minuteHandColor, this.minuteHandLen);
        this.drawNeedle(ctx, time.getSeconds() * Math.PI / 30, secondHandColor, this.secondHandLen);
    }
    /**绘制指针 */
    drawNeedle(ctx, radian, color, len) {
        let { handType } = this.options;
        if ("triangle" == handType) { //三角形类型指针
            const end = this.polarCoordinates2canvasCoordinates(len, radian);
            const needleWidth = 6;
            const left = this.polarCoordinates2canvasCoordinates(needleWidth, radian - 0.5 * Math.PI);
            const right = this.polarCoordinates2canvasCoordinates(needleWidth, radian + 0.5 * Math.PI);
            ctx.beginPath();
            ctx.save();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(left.x, left.y);
            ctx.lineTo(right.x, right.y);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = "#666";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fill();
            if (len == this.secondHandLen) {
                ctx.beginPath();
                //表盘中心圆点
                ctx.beginPath();
                ctx.fillStyle = "yellow";
                ctx.arc(0, 0, needleWidth + 2, 0, 2 * Math.PI);
                ctx.fill();
            }
            ctx.restore();
        }
        else { //线条类型指针
            const start = this.polarCoordinates2canvasCoordinates(this.headLen, radian - Math.PI);
            const end = this.polarCoordinates2canvasCoordinates(len, radian);
            ctx.beginPath();
            ctx.save();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = color;
            if (len == this.hourHandLen) {
                ctx.lineWidth = 3;
            }
            else if (len == this.minuteHandLen) {
                ctx.lineWidth = 2;
            }
            ctx.stroke();
            if (len == this.secondHandLen) {
                ctx.beginPath();
                ctx.fillStyle = color;
                //表盘中心圆点
                ctx.arc(0, 0, 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                //秒针针尾圆点
                const { x, y } = this.polarCoordinates2canvasCoordinates(len - 10, radian);
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fill();
            }
            ctx.restore();
        }
    }
    /**
     * 更新options，调用此方法可更新模拟时钟的一些属性
     * @param options
     */
    setOptions(options = {}) {
        let opts = {};
        Object.keys(options).forEach(key => {
            const val = options[key];
            if (val !== undefined) { //过滤掉值为undefined的
                opts[key] = val;
            }
        });
        this.options = Object.assign({}, this.options, opts);
        this.init();
    }
    /**
     * 显示一个时间
     * @param time 默认值当前时间
     */
    show(time) {
        const { size, borderImage, backgroundImage } = this.options;
        const { ctx, hourFontSize } = this;
        this.ctx.clearRect(-this.halfSize, -this.halfSize, size, size);
        if ((borderImage && !this.borderPattern) || (backgroundImage && !this.backgroundImage)) {
            ctx.save();
            ctx.font = `${hourFontSize}px 微软雅黑`;
            ctx.fillText("loading...", this.halfSize, this.halfSize);
            ctx.stroke();
            return;
        }
        //表盘
        ctx.drawImage(this.dialCanvas, -this.halfSize, -this.halfSize);
        if ("string" == typeof time) {
            if (!/^\d{1,2}(:\d{1,2}){2}$/.test(time)) {
                throw new Error("参数格式：HH:mm:ss");
            }
            let [h, m, s] = time.split(":").map(o => parseInt(o));
            time = new Date();
            time.setHours(h);
            time.setMinutes(m);
            time.setSeconds(s);
        }
        //时针
        this.drawHand(ctx, time);
        return this;
    }
    /**运行模拟时钟 */
    run() {
        this.show();
        if (!this.interval) {
            this.interval = setInterval(() => {
                this.show();
            }, 1000);
        }
        return this;
    }
    /**停止模拟时钟 */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
window.Clock = Clock;

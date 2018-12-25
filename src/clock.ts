interface Point {
    x: number
    y: number
}

interface Option {
    /**模拟时钟大小 */
    size?: number
    /**canvas画布内边距 */
    padding?: number
    /**边框宽度 */
    borderWidth?: number
    /**边框颜色 */
    borderColor?: string
    /**边框背景图片，优先级高于borderColor */
    borderImage?: string
    /**背景色，默认white */
    backgroundColor?: string
    /**背景图片，优先级高于backgroundColor */
    backgroundImage?: string
    /**背景图片的显示模式 */
    backgroundMode?: "part" | "full"
    /**背景图片的透明度，默认0.5 */
    backgroundAlpha?: number
    /**显示的刻度类型,默认值arabic, roman：罗马数字，arabic：阿拉伯数字，none：不显示 */
    scaleType?: "arabic" | "roman" | "none"
    /**刻度线颜色 */
    scaleColor?: string
    /**显示的小时文字颜色 */
    hourColor?: string
    /**秒针颜色 */
    secondHandColor?: string
    /**分针颜色 */
    minuteHandColor?: string
    /**时针颜色 */
    hourHandColor?: string
    /**是否显示阴影 */
    showShadow?: boolean
    /**图片加载完成回调 */
    onload?(clock: Clock): any
}

export default class Clock {

    /**默认选项 */
    private options: Option = {
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
        backgroundAlpha: 0.5,
    }
    private interval: any = null;

    private hours: Array<string> = [];//小时数字
    private largeScale = 0;//大刻度长度
    private smallScale = 0;//小刻度长度
    private hourFontSize = 0;//小时数字字体大小
    private headLen = 0;//针头长度
    private secondHandLen = 0;//秒针长度
    private minuteHandLen = 0;//分针长度
    private hourHandLen = 0;//时针长度
    private borderPattern: CanvasPattern | null = null;
    private backgroundImage?: HTMLImageElement;

    /**画布大小的一半 */
    private halfSize: number = 0;
    /**外面传过来的要显示的canvas */
    private container?: HTMLCanvasElement = null!;
    private ctx: CanvasRenderingContext2D = null!;
    /**表盘 */
    private dialCanvas: HTMLCanvasElement = document.createElement("canvas");
    private dialCtx = this.dialCanvas.getContext("2d")!;

    constructor(canvas: HTMLCanvasElement, options: Option = {}) {
        this.options = { ...this.options, ...options };
        if (!canvas) {
            throw new Error("请传入canvas参数！");
        }
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("传入的canvas参数不是一个HTMLCanvasElement对象！");
        }
        this.init(canvas);
    }

    private async init(container: HTMLCanvasElement) {
        const { size, borderWidth, borderImage, padding, scaleType = "arabic", backgroundImage, onload } = this.options;
        this.halfSize = size! * 0.5;
        this.container = container!;
        this.ctx = container!.getContext("2d")!;
        this.dialCanvas.width = this.container.width = size!;
        this.dialCanvas.height = this.container.height = size!;
        //大刻度线的长度为内圈半径的十二分之一
        this.largeScale = (this.halfSize - padding! - borderWidth!) / 12;
        //小刻度线的长度为大刻度线的一半
        this.smallScale = this.largeScale * 0.5;
        this.hourFontSize = this.largeScale * 1.2;
        this.headLen = this.smallScale * 1.5;
        this.secondHandLen = this.headLen * 12;
        this.minuteHandLen = this.headLen * 10;
        this.hourHandLen = this.headLen * 7;

        if ("roman" == scaleType) {
            this.hours = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
        } else if ("arabic" == scaleType) {
            this.hours = ["12", "1", "2", "3", "4", "5", "6", "7", '8', "9", "10", "11"];
        }

        if (borderImage) {
            this.borderPattern = await this.createPattern(this.dialCtx, borderImage, "repeat");
        }

        if (backgroundImage) {
            this.backgroundImage = await this.createImage(backgroundImage);
        }
        this.drawDial(this.dialCtx);
        if (onload instanceof Function) {
            onload(this as any);
        }
    }

    /**角度转弧度 */
    private angle2radian(angle: number) {
        return (Math.PI / 180) * angle;
    }

    /**
     * 极坐标转画布坐标（ps:此极坐标极轴水平向上，角度正方向顺时针）
     * @param r 当前点到中心点的长度
     * @param radian 弧度
     */
    private polarCoordinates2canvasCoordinates(r: number, radian: number): Point {
        //极轴水平向上极坐标转极轴水平向右极坐标
        radian -= Math.PI * 0.5;//角度向右旋转90度即可
        //极轴水平向右极坐标转直角坐标（x轴水平向右，y轴竖直向下）
        let x = r * Math.cos(radian);
        let y = r * Math.sin(radian);
        //直角坐标转画布坐标
        let { halfSize } = this;
        x = x + halfSize;
        y = y + halfSize;
        return { x, y }
    }

    /**绘制小时的文字 */
    private drawHours(ctx: CanvasRenderingContext2D, i: number, hour: string, end: Point) {
        ctx.save();
        ctx.fillStyle = this.options.hourColor!;
        ctx.font = `${this.hourFontSize}px 微软雅黑`;
        var w = ctx.measureText(hour).width;
        var h = this.hourFontSize;
        var { x, y } = end;
        //i为 0-11 对应1-12个小时数字（12开始，11结束）
        var padding = 5;
        switch (i) {
            case 0://12
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

    private createImage(src: string) {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                resolve(img)
            }
            img.onerror = () => {
                reject(new Error("图片加载出错!"));
                this.stop();//停止
            };
            img.src = src;
        })
    }

    private createPattern(ctx: CanvasRenderingContext2D, src: string, repetition: string) {
        return new Promise<CanvasPattern | null>((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                resolve(ctx.createPattern(img, repetition))
            }
            img.onerror = () => {
                reject(new Error("图片加载出错!"));
                this.stop();//停止
            };
            img.src = src;
        })
    }

    /**绘制表盘 */
    private drawDial(ctx: CanvasRenderingContext2D) {
        const { padding, borderWidth, borderColor, borderImage, scaleColor, backgroundColor, backgroundImage, backgroundMode, backgroundAlpha, showShadow } = this.options;
        const hours = this.hours;
        const halfSize = this.halfSize;
        const shadowBlur = 10;
        const shadowOffset = 5;
        //--------外圈
        ctx.save();
        const x = halfSize;
        const y = halfSize;
        const outsideR = halfSize - padding! - (showShadow ? shadowBlur + shadowOffset : 0);
        ctx.arc(x, y, outsideR, 0, 2 * Math.PI, true);
        if (borderImage && this.borderPattern) {//边框背景图
            ctx.fillStyle = this.borderPattern;
        } else {//边框颜色
            ctx.fillStyle = borderColor!;
        }

        //--------内圈 利用相反缠绕可形成内阴影
        const insideR = outsideR - borderWidth!;
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
        if (backgroundImage && this.backgroundImage) {//背景图
            const { width, height } = this.backgroundImage;
            const r = "full" == backgroundMode ? insideR : insideR - this.largeScale - this.hourFontSize - 15;
            ctx.globalAlpha = backgroundAlpha!;
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.clip();//按内圈区域裁剪图片
            //最小的一边要刚好能显示完全 ,r * 2直径
            const scale = r * 2 / Math.min(width, height);
            ctx.drawImage(this.backgroundImage, halfSize - r, halfSize - r, width * scale, height * scale);
        } else if ("white" != backgroundColor) {//背景色，若背景色是白色，就不必填充，因为原本就是白色，并且不填充可以渲染出内阴影效果
            ctx.arc(x, y, insideR, 0, 2 * Math.PI);
            ctx.fillStyle = backgroundColor!;
            ctx.fill();
        }
        ctx.restore();


        //--------刻度
        let step = 360 / 60;//中心点转动的角度
        //顺时针，0度(12点)递增到 360度(也是12点)
        let hourStep = 0;
        for (let angle = 0; angle < 360; angle += step) {
            const radian = this.angle2radian(angle);
            const start = this.polarCoordinates2canvasCoordinates(insideR, radian);
            const len = 0 == angle % 5 ? this.largeScale : this.smallScale;
            const end = this.polarCoordinates2canvasCoordinates(insideR - len, radian);

            ctx.beginPath();
            ctx.save();
            if (0 == angle % 5) {
                ctx.lineWidth = 3;
                if (hours && hours.length == 12) {
                    this.drawHours(ctx, hourStep, hours[hourStep++], end);
                }
            } else {
                ctx.lineWidth = 1;
            }
            ctx.strokeStyle = scaleColor!;
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    /**绘制时针 */
    private drawHand(ctx: CanvasRenderingContext2D, time: Date = new Date()) {
        let { secondHandColor, minuteHandColor, hourHandColor } = this.options;
        /*
        * 一圈被分、秒成分了60份，每一份的度数为:360/60=6度 
		* 一圈被时成了12份，每一份的度数为:360/12=30度
		* 分针每走完一圈，时针就会慢慢过度到一个大刻度，
        * 那么分针每走一个小刻度，时针在每个大刻度(大刻度之间的度数为30度)之间过度的角度为：30/60 = 0.5度
        */
        this.drawNeedle(ctx, time.getHours() * 30 + time.getMinutes() * 0.5, hourHandColor!, this.hourHandLen);
        this.drawNeedle(ctx, time.getMinutes() * 6, minuteHandColor!, this.minuteHandLen);
        this.drawNeedle(ctx, time.getSeconds() * 6, secondHandColor!, this.secondHandLen);

    }

    private drawNeedle(ctx: CanvasRenderingContext2D, angle: number, color: string, len: number) {
        const radian = this.angle2radian(angle);
        const start = this.polarCoordinates2canvasCoordinates(-this.headLen, radian);
        const end = this.polarCoordinates2canvasCoordinates(len, radian);
        ctx.beginPath();
        ctx.save();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = color;
        if (len == this.hourHandLen) {
            ctx.lineWidth = 3;
        } else if (len == this.minuteHandLen) {
            ctx.lineWidth = 2;
        }
        ctx.stroke();
        if (len == this.secondHandLen) {
            ctx.beginPath();
            ctx.fillStyle = color;
            //表盘中心圆点
            ctx.arc(this.halfSize, this.halfSize, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            //时针针尾圆点
            const { x, y } = this.polarCoordinates2canvasCoordinates(len - 10, radian);
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.restore();
    }

    /**
     * 显示一个时间
     * @param time 默认值当前时间
     */
    public show(time?: Date | string) {
        const { size, borderImage, backgroundImage } = this.options;
        const { ctx, hourFontSize } = this;
        this.ctx.clearRect(0, 0, size!, size!);
        if ((borderImage && !this.borderPattern) || (backgroundImage && !this.backgroundImage)) {
            ctx.save();
            ctx.font = `${hourFontSize}px 微软雅黑`;
            ctx.fillText("loading...", this.halfSize, this.halfSize);
            ctx.stroke();
            return;
        }
        //表盘
        ctx.drawImage(this.dialCanvas, 0, 0);

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
        this.drawHand(ctx, time as Date);
        return this;
    }

    /**运行模拟时钟 */
    public run() {
        this.show();
        if (!this.interval) {
            this.interval = setInterval(() => {
                this.show();
            }, 1000);
        }
        return this;
    }

    /**停止模拟时钟 */
    public stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

(window as any).Clock = Clock;
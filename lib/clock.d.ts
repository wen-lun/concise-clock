interface Option {
    /**模拟时钟大小 */
    size?: number;
    /**canvas画布内边距 */
    padding?: number;
    /**边框宽度 */
    borderWidth?: number;
    /**边框颜色 */
    borderColor?: string;
    /**边框背景图片，优先级高于borderColor */
    borderImage?: string;
    /**背景色，默认white */
    backgroundColor?: string;
    /**背景图片，优先级高于backgroundColor */
    backgroundImage?: string;
    /**背景图片的显示模式 */
    backgroundMode?: "part" | "full";
    /**背景图片的透明度，默认0.5 */
    backgroundAlpha?: number;
    /**显示的刻度类型,默认值arabic, roman：罗马数字，arabic：阿拉伯数字，none：不显示 */
    scaleType?: "arabic" | "roman" | "none";
    /**刻度线颜色 */
    scaleColor?: string;
    /**显示的小时文字颜色 */
    hourColor?: string;
    /**秒针颜色 */
    secondHandColor?: string;
    /**分针颜色 */
    minuteHandColor?: string;
    /**时针颜色 */
    hourHandColor?: string;
    /**是否显示阴影 */
    showShadow?: boolean;
    /**图片加载完成回调 */
    onload?(clock: Clock): any;
}
export default class Clock {
    /**默认选项 */
    private options;
    private interval;
    private hours;
    private largeScale;
    private smallScale;
    private hourFontSize;
    private headLen;
    private secondHandLen;
    private minuteHandLen;
    private hourHandLen;
    private borderPattern;
    private backgroundImage?;
    /**画布大小的一半 */
    private halfSize;
    /**外面传过来的要显示的canvas */
    private container?;
    private ctx;
    /**表盘 */
    private dialCanvas;
    private dialCtx;
    constructor(canvas: HTMLCanvasElement | string, options?: Option);
    private init;
    /**角度转弧度 */
    private angle2radian;
    /**
     * 极坐标转画布坐标（ps:此极坐标极轴水平向上，角度正方向顺时针）
     * @param r 当前点到中心点的长度
     * @param radian 弧度
     */
    private polarCoordinates2canvasCoordinates;
    /**绘制小时的文字 */
    private drawHours;
    private createImage;
    private createPattern;
    /**绘制表盘 */
    private drawDial;
    /**绘制时针 */
    private drawHand;
    private drawNeedle;
    /**
     * 更新options，调用此方法可更新模拟时钟的一些属性
     * @param options
     */
    setOptions(options?: Option): void;
    /**
     * 显示一个时间
     * @param time 默认值当前时间
     */
    show(time?: Date | string): this;
    /**运行模拟时钟 */
    run(): this;
    /**停止模拟时钟 */
    stop(): void;
}
export {};

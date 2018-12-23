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

interface Clock {
    constructor(canvas: HTMLCanvasElement, options?: Option): any
    /**
     * 显示一个时间
     * @param time 默认值当前时间，也可以是形如hh:mm:ss得字符串
     */
    show(time: Date | string): this
    /**运行模拟时钟 */
    run(): this
    /**停止模拟时钟 */
    stop(): void
}
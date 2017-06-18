/**
 * 总数54张，资源名 1-54
 * 扑克牌序号排序是从3点到大小王
 * 举例：四张3点1，2，3，4
 * 同点数排序规则 红黑梅方（斗地主可能用不上）
 * 需要提供一个将序号转为点数的方法，用来对比是否是同点数
*/
class Card extends eui.Image
{
    private isSelect:boolean;
    /**真实点数，注意这是斗地主，最小的是3*/
    public point:number;
    /**扑克序号,1-54*/
    private _index : number;

    public get index() : number {
        return this._index;
    }
    public set index(v : number) {
        this._index = v;
        this.source = v + "_jpg";
        if(v % 4 == 0)
        {
            this.point = v/4;
        }else
        {
            this.point = Math.floor(v/4) + 1;
        }
    }

    //是否被点击
    private _onTouch : boolean;
    public get onTouch() : boolean {
        return this._onTouch;
    }
    public set onTouch(v : boolean) {
        this._onTouch = v;
        if(v)
        {
            this.y -= 20;
        }else
        {
            this.y += 20;
        }
    }
    
}
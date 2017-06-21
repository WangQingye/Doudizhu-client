/**
 *  关于牌型的计算
*/

class CardUtils
{
    private static _instance:CardUtils
    public static getInstance(){
    if(!this._instance){
        this._instance = new CardUtils();
    }
    return this._instance;
	}

    public canPlay(curCards:CUR_CARDS, choosenCard:Array<number>):boolean
    {
        /**待写*/
        return true;
    }

    /**将牌组转换出index*/
    public transCardsToIndex(choosenCard:Array<Card>):Array<number>
    {
        let arr = [];
        for(let i = 0; i < choosenCard.length; i++)
        {
            arr.push(choosenCard[i].index);
        }
        return arr;
    }

    /**讲牌组转换出point*/
    public transCardsToPoint(choosenCard:Array<Card>):Array<number>
    {
        let arr = [];
        for(let i = 0; i < choosenCard.length; i++)
        {
            arr.push(choosenCard[i].point);
        }
        return arr;
    }

    /**
     * 判断牌型的函数
     * 这个函数可能会非常的长
    */
    public calcCardType(choosenCard:Array<Card>):number
    {
        let points = this.transCardsToPoint(choosenCard);
        let len = points.length;
        if(len == 1) //单牌
        {
            return 1;
        }else if(len == 2 && points[0] == points[1]) //对子
        {
            if(points[0] == 16 && points[1] == 16) //对子中排除王炸
            {
                return 13
            }
            return 2;
        }else if(len == 3 && points[0] == points[1] && points[1] == points[2]) //三不带
        {
            return 3
        }
        else if(len == 4) 
        {
            if(points[0] == points[1] && points[1] == points[2] && points[2] == points[3]) //炸弹
            {
                return 12;
            }else if(this.calcSameNum(points) == 3) //最多有三张相等的，说明是三带一
            {
                return 4
            }
        }else if(len >= 5 && this.isNumContinuous(points)) //这里直接判断所有顺子，免得后面大于5的时候都去判断是否是顺子
        {
            return 8;
        }else if(len == 5)
        {
            if( this.calcSameNum(points) == 3 && this.calcDiffNum(points) == 2) //最大相同数为3，有两种点数，说明是三带二
            {
                return 5;
            }
        }else if( len >= 6) //大于6的情况比较多，比如连对（n对），飞机（n飞，带或不带，3张飞还是4张飞）
        {   
            if(this.calcSameNum(points) == 3 && len%3 == 0 && this.calcDiffNum(points) == len/3)//三张牌飞机不带
            {
                return 10;
            }else if( this.calcSameNum(points) == 2 && len%2 == 0 && this.calcDiffNum(points) == len/2)//连对
            {
                return 9;
            }else if ( len%4 == 0 && this.calcHowManySameNum(points,3) == len/4 )//三带一飞
            
        }else if(len == 6)
        {
            if( this.calcSameNum(points) == 4 )
            {
                return 6;
            }
        }else if(len)
        return 0;
    }

    /**
     * 判断一个数组中最多有几个元素相等
    */
    public calcSameNum(arr:Array<number>):number
    {
        let bigSame = 0;
        for(let i = 0; i < arr.length; i++)
        {
            let temp = 0;
            for(let j = 0; j < arr.length; j++)
            {
                if(j == i) continue;
                if(arr[i] == arr[j])
                {
                    temp++;
                }
            }
            if(temp > bigSame)
            {
                bigSame = temp;
            }
        }
        return bigSame;
    }

    /**
     * 判断一个数组有多少不相同的元素
    */
    private calcDiffNum(arr:Array<number>):number
    {
        let ele = 0;
        let temp = [];
        for(let i = 0; i < arr.length; i++)
        {
            if(temp.indexOf(arr[i]) == -1)
            {
                temp.push(arr[i]);
            }
        }
        return temp.length;
    }

    /**
     * 判断一个数组是否是连续的
    */
    private isNumContinuous(arr:Array<number>):boolean
    {
        arr.sort();
        for(let i = 0 ; i < arr.length ; i++)
        {
            if(i == arr.length - 1) return true //都进行到最后一个了，说明肯定是连续的啦;
            if(arr[i] != arr[i+1]-1)
            {
                console.log(arr[i], arr[i+1]);
                return false;
            }
        }
        return true;
    }

    /**
     * 计算一个数组中相同数为n的点数有几种
    */
    private calcHowManySameNum(arr:Array<number>, num:number):number
    {
        var temp = 0;
        let calced = [];
        for(let i = 0; i < arr.length; i++)
        {
            //[3,3,3]
            if(calced.indexOf(arr[i]) != -1) continue;
            let temp1 = 1;
            for(let j = 0; j < arr.length; j++)
            {
                if(j == i) continue;
                if(arr[i] == arr[j])
                {
                    temp1++;
                }
            }
            if(temp1 == num)
            {                
                calced.push(arr[i]);
                temp++;
            }
        }
        return temp;
    }
};

/**
 * 牌型
*/
class CARD_TYPE
{    //各种牌型的对应数字
    public static NO_CARDS = 0; //错误牌型
    public static SINGLE_CARD = 1; //单牌
    public static DOUBLE_CARD = 2; //对子
    public static THREE_CARD = 3;//3不带
    public static THREE_ONE_CARD = 4;//3带1
    public static THREE_TWO_CARD = 5; //3带2
    public static BOMB_TWO_CARD = 6; //四个带2张
    public static BOMB_FOUR_CARD = 7; //四个带2对
    public static CONNECT_CARD = 8; //连牌
    public static COMPANY_CARD = 9; //连队
    public static AIRCRAFT_CARD = 10; //飞机不带
    public static AIRCRAFT_WING = 11; //飞机带单牌或对子
    public static BOMB_CARD = 12; //炸弹
    public static KINGBOMB_CARD = 13;//王炸
}




/**
 * 当前桌面上的牌（上家的牌）
*/
//{type: CARD_TYPE.NO_CARDS, small:0, cards:[]};
class CUR_CARDS
{
    /**牌型*/
    public type:CARD_TYPE;
    /**头子（头子中最小的那张）*/
    public small:number;
    /**具体是哪些牌,用于展示在桌面上*/
    public cards:Array<number>;
}
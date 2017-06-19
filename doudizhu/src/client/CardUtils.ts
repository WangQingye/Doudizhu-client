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
    public static BOMB_TWO_CARD = 6; //四个带2张单牌
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
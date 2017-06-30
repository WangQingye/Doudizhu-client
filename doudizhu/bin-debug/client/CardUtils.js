/**
 *  关于牌型的计算
*/
var CardUtils = (function () {
    function CardUtils() {
    }
    var d = __define,c=CardUtils,p=c.prototype;
    CardUtils.getInstance = function () {
        if (!this._instance) {
            this._instance = new CardUtils();
        }
        return this._instance;
    };
    p.canPlay = function (curCards, choosenCard) {
        var curHeadPoker = curCards.header;
        var curType = curCards.type;
        var choosenType = this.calcCardType(choosenCard);
        var choosenHeadPoker = this.calcHeadPoker(choosenType, choosenCard);
        //console.log('当前牌型', choosenType);
        /**如果牌型等于-1，说明是第一个出牌的，只要不是错误牌型就可以出牌*/
        if (curType == -1 && choosenType !== 0)
            return true;
        /**老子王炸什么牌不能出？*/
        if (choosenType == 13)
            return true;
        if (curType == 13)
            return false;
        /**就算是炸弹，也得看看前面是不是炸弹啊*/
        if (choosenType == 12) {
            if (curType == 12) {
                if (choosenHeadPoker > curHeadPoker) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
        /**其余牌型需要牌型一致，头子更大，张数一致*/
        if (curType == choosenType && choosenHeadPoker > curHeadPoker && curCards.cards.length == choosenCard.length) {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * 判断牌型的函数
     * 这个函数可能会非常的长
    */
    p.calcCardType = function (choosenCard) {
        var points = this.transCardsToPoint(choosenCard);
        //console.log('计算牌型', points);
        //console.warn('是否连续',this.isNumContinuous(points))
        var len = points.length;
        if (len == 1) {
            return 1;
        }
        else if (len == 2 && points[0] == points[1]) {
            if (points[0] == 16 && points[1] == 16) {
                return 13;
            }
            return 2;
        }
        else if (len == 3 && points[0] == points[1] && points[1] == points[2]) {
            return 3;
        }
        else if (len == 4) {
            if (points[0] == points[1] && points[1] == points[2] && points[2] == points[3]) {
                return 12;
            }
            else if (this.calcSameNum(points) == 3) {
                return 4;
            }
            return 0;
        }
        else if (len >= 5 && this.isNumContinuous(points)) {
            return 7;
        }
        else if (len == 5 && this.calcSameNum(points) == 3 && this.calcDiffNum(points) == 2) {
            return 5;
        }
        else if (len >= 6) {
            if (this.calcSameNum(points) == 3 && len % 3 == 0 && this.calcDiffNum(points) == len / 3) {
                return 9;
            }
            else if (this.calcSameNum(points) == 2 && len % 2 == 0 && this.calcDiffNum(points) == len / 2) {
                return 8;
            }
            else if (len % 4 == 0 && this.calcHowManySameNum(points, 3) == len / 4) {
                return 10;
            }
            else if (len % 5 == 0 && this.calcSameNum(points) == 3 && this.calcHowManySameNum(points, 3) == len / 5 && this.calcDiffNum(points) == len / 5 * 2) {
                return 11;
            }
            else if (len == 6 && this.calcSameNum(points) == 4) {
                return 6;
            }
            return 0;
        }
        else {
            return 0; //什么牌型都不是，说明是错误牌型
        }
    };
    /**
     * 判断头子
    */
    p.calcHeadPoker = function (type, choosenCard) {
        var cards = this.transCardsToPoint(choosenCard);
        cards.sort();
        //console.log('计算头子', type, cards);
        switch (type) {
            case 1:
            case 2:
            case 3:
            case 7:
            case 8:
            case 9:
            case 12:
                return cards[0];
            case 4:
            case 5:
            case 6:
            case 10:
                return cards[2]; //机智的我，3带1或者3带2中第三张肯定是三同之一
            case 11:
                return this.calcFlightDouble(cards);
        }
        return 0;
    };
    /**
     * 判断一个数组中最多有几个元素相等
    */
    p.calcSameNum = function (arr) {
        var bigSame = 0;
        for (var i = 0; i < arr.length; i++) {
            var temp = 1;
            for (var j = 0; j < arr.length; j++) {
                if (j == i)
                    continue;
                if (arr[i] == arr[j]) {
                    temp++;
                }
            }
            if (temp > bigSame) {
                bigSame = temp;
            }
        }
        return bigSame;
    };
    /**
     * 判断一个数组有多少不相同的元素
    */
    p.calcDiffNum = function (arr) {
        var ele = 0;
        var temp = [];
        for (var i = 0; i < arr.length; i++) {
            if (temp.indexOf(arr[i]) == -1) {
                temp.push(arr[i]);
            }
        }
        return temp.length;
    };
    /**
     * 判断一个数组是否是连续的
    */
    p.isNumContinuous = function (arr) {
        arr.sort(function (a, b) { return a - b; });
        for (var i = 0; i < arr.length; i++) {
            if (i == arr.length - 1)
                return true; //都进行到最后一个了，说明肯定是连续的啦;
            if (arr[i] != arr[i + 1] - 1) {
                return false;
            }
        }
        return true;
    };
    /**
     * 计算一个数组中相同数为n的点数有几种
    */
    p.calcHowManySameNum = function (arr, num) {
        var temp = 0;
        var calced = [];
        for (var i = 0; i < arr.length; i++) {
            //[3,3,3]
            if (calced.indexOf(arr[i]) != -1)
                continue;
            var temp1 = 1;
            for (var j = 0; j < arr.length; j++) {
                if (j == i)
                    continue;
                if (arr[i] == arr[j]) {
                    temp1++;
                }
            }
            if (temp1 == num) {
                calced.push(arr[i]);
                temp++;
            }
        }
        return temp;
    };
    /**
     * 专门用来计算飞机带对子的头子
    */
    p.calcFlightDouble = function (arr) {
        //先找到有三张的
        var temp = [];
        for (var i = 0; i < arr.length; i++) {
            var num = 0;
            for (var j = 0; j < arr.length; j++) {
                if (arr[i] == arr[j]) {
                    num++;
                }
            }
            if (num == 3) {
                if (temp.indexOf(arr[i]) == -1) {
                    temp.push(arr[i]);
                }
            }
        }
        var max = 0;
        for (var j = 0; j < temp.length; j++) {
            if (temp[j] > max) {
                max = temp[j];
            }
        }
        return max;
    };
    /**将牌组转换出index*/
    p.transCardsToIndex = function (choosenCard) {
        var arr = [];
        for (var i = 0; i < choosenCard.length; i++) {
            arr.push(choosenCard[i].index);
        }
        return arr;
    };
    /**讲牌组转换出point*/
    p.transCardsToPoint = function (choosenCard) {
        var arr = [];
        for (var i = 0; i < choosenCard.length; i++) {
            arr.push(choosenCard[i].point);
        }
        return arr;
    };
    return CardUtils;
}());
egret.registerClass(CardUtils,'CardUtils');
;
/**
 * 牌型
*/
var CARD_TYPE = (function () {
    function CARD_TYPE() {
    }
    var d = __define,c=CARD_TYPE,p=c.prototype;
    CARD_TYPE.PASS_CARDS = -2; //过
    CARD_TYPE.NO_CARDS = -1; //前面还没有牌（首家）
    CARD_TYPE.ERROR_CARDS = 0; //错误牌型
    CARD_TYPE.SINGLE_CARD = 1; //单牌
    CARD_TYPE.DOUBLE_CARD = 2; //对子
    CARD_TYPE.THREE_CARD = 3; //3不带
    CARD_TYPE.THREE_ONE_CARD = 4; //3带1
    CARD_TYPE.THREE_TWO_CARD = 5; //3带2
    CARD_TYPE.BOMB_TWO_CARD = 6; //4带2
    CARD_TYPE.BOMB_FOUR_CARD = 7; //连牌
    CARD_TYPE.CONNECT_CARD = 8; //连对
    CARD_TYPE.COMPANY_CARD = 9; //飞机不带
    CARD_TYPE.AIRCRAFT_CARD = 10; //飞机带单牌
    CARD_TYPE.AIRCRAFT_WING = 11; //飞机带对子
    CARD_TYPE.BOMB_CARD = 12; //炸弹
    CARD_TYPE.KINGBOMB_CARD = 13; //王炸
    return CARD_TYPE;
}());
egret.registerClass(CARD_TYPE,'CARD_TYPE');
/**
 * 当前桌面上的牌（上家的牌）
*/
//{type: CARD_TYPE.NO_CARDS, header:0, cards:[]};
var CUR_CARDS = (function () {
    function CUR_CARDS() {
    }
    var d = __define,c=CUR_CARDS,p=c.prototype;
    return CUR_CARDS;
}());
egret.registerClass(CUR_CARDS,'CUR_CARDS');
//# sourceMappingURL=CardUtils.js.map
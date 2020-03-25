/* 棋局类 */
class Gobang {
    constructor(optObj) {
        /* 配置项 */
        this.el = document.querySelector(optObj.el || '#gobang');/* 棋盘挂载元素 */
        this.sizeNum = optObj.sizeNum || 20;/* 棋子大小 */
        this.countNum = optObj.countNum || 15;/* 棋盘格子行列数量 */
        this.curRole = optObj.curRole || 1;/* 先下玩家角色 1-白 2-黑 默认白*/
        
        this.cellSizeNum = this.sizeNum + 7;/* 棋盘格子大小 */
        
        this.initFn();
        /* 监听新棋局动作 */
        this.el.addEventListener('click',this.debounceFn(this.playFn.bind(this),100),true);
        this.cellTipEl = document.getElementById('cell--tip');
        this.cellTipEl.className = this.curRole === 1 ? 'cell-tip--white' : 'cell-tip--black';
    }
    /* 初始化当前棋局 */
    initFn(){
        this.historyArr = []; /* 快照历史 */
        this.curHisIndex = 0; /* 当前快照索引 */
        this.isEndBool = false; /* 当前棋局是否结束 */
        
        /* 初始化棋盘数据为空 */
        this.curCheckerArr = [];
        for(let x=0;x<=this.countNum;x++ ){
            this.curCheckerArr[x] = [];/* 创建行 */
            for(let y=0;y<=this.countNum;y++ ){
                this.curCheckerArr[x][y] = 0;/* 创建列并将棋盘坐标的棋子清空 0-空 1-白子 2-黑子 */
            }
        }
        /* 判断是重来还是第一次进入 */
        if(!this.checkerboardObj){
            this.checkerboardObj = this.createCheckerboardFn();
        }
    }
    /* 创建棋盘 */
    createCheckerboardFn(){
        let cellArr = Array.from({
            length:Math.pow(this.countNum,2)
        },()=>{
            return `<span class="cell" style="width:` + this.cellSizeNum + `px;height:` + this.cellSizeNum + `px;"></span>`;
        });
        let cellElStr = `<div class="cell-box">` + cellArr.join('') + `</div>`;
        this.el.style.width = this.cellSizeNum * this.countNum + 'px';
        this.el.style.height = this.cellSizeNum * this.countNum + 'px';
        this.el.innerHTML = cellElStr;
        this.el.className = 'gobang';
    }
    /* 下棋 */
    playFn(e){
        if(e.target.className !== 'cell' || e.target.tagName !== 'SPAN'){
            return;
        }
        /* 计算点击的坐标 */
        let x = Math.round(e.layerX / this.cellSizeNum);
        let y = Math.round(e.layerY / this.cellSizeNum);
        /* 判断点击位置是否存在棋子且当前局是否结束 */
        if(this.curCheckerArr[x][y] === 0 && !this.isEndBool){
            this.curCheckerArr[x][y] = this.curRole;
            this.createPieceFn(x,y);
            /* 下棋推到快照历史中 */
            this.historyArr.push({
                x,
                y,
                role:this.curRole
            })
            this.curHisIndex++;/* 快照版本索引 + 1 */

            /* 判断输赢 */
            if(this.judgeFn(x,y)){
                return;
            }
            /* 改变当前回合玩家 */
            this.curRole = this.curRole === 1 ? 2 : 1;/* 换角色 */
            this.cellTipEl.className = this.curRole === 1 ? 'cell-tip--white' : 'cell-tip--black';
        }
    }
    /* 创建棋子 */
    createPieceFn(x,y){
        const pieceEl = document.createElement('div');
        pieceEl.className = this.curRole === 1 ? 'cell--white' : 'cell--black';
        pieceEl.setAttribute('id',`piece-${x}-${y}`);/* 设置棋子唯一id，用来悔棋时清除 */
        pieceEl.style.width = this.sizeNum + 'px';
        pieceEl.style.height = this.sizeNum + 'px';
        pieceEl.style.left = (x * this.cellSizeNum - 0.5 * this.sizeNum) + 'px';
        pieceEl.style.top = (y * this.cellSizeNum - 0.5 * this.sizeNum)  + 'px';
        this.el.children[0].appendChild(pieceEl);
    }
    /* 判断输赢 */
    judgeFn(x,y){        
        /* 当前棋子所在 x 轴数据 */
        const xArr = this.curCheckerArr.map(x=>{
            return x[y];
        });
        const yArr = this.curCheckerArr[x];/* y 轴数据 */
        const bSlashArr = [];/* 左斜线数据 */
        const slashArr = [];/* 右斜线数据 */
        this.curCheckerArr.forEach((item, index) => {
            const bItem = item[y - (x - index)];
            if(bItem !== undefined) {
                bSlashArr.push(bItem);
            }
            const sItem = item[y + (x - index)];
            if(sItem !== undefined) {
                slashArr.push(sItem);
            }
        });
        /* 判断数组是否有 5 个连续相等的棋子 */
        function judgeWin(arr) {
            let bool = arr.some((item,index) => {
                return (arr[index] !== 0 &&
                arr[index - 2] === arr[index - 1] &&
                arr[index - 1] === arr[index] &&
                arr[index] === arr[index + 1] &&
                arr[index + 1] === arr[index + 2])
            });
            return bool;
        }
        if(judgeWin(xArr) || judgeWin(yArr) || judgeWin(bSlashArr) || judgeWin(slashArr)) {
            this.isEndBool = true;
            setTimeout(()=>{
                alert((this.curRole === 1 ? '白' : '黑') + '方胜');
            });
            return true;
        }
    }
    /* 悔棋 */
    regretFn(){
        if(this.curHisIndex && !this.isEndBool){/* 结束了就不能悔棋了 */
            let curHisObj = this.historyArr[this.curHisIndex - 1];/* 需要悔棋的棋子坐标 */
            const curHisEl = document.getElementById(`piece-${curHisObj.x}-${curHisObj.y}`);
            this.el.children[0].removeChild(curHisEl);
            this.curCheckerArr[curHisObj.x][curHisObj.y] = 0;/* 清除悔棋坐标数据 */
            this.curHisIndex--;
            this.curRole = this.curRole === 1 ? 2 : 1;
            this.cellTipEl.className = this.curRole === 1 ? 'cell-tip--white' : 'cell-tip--black';
        }
    }
    /* 撤销悔棋 */
    withDrawFn(){
        if(this.curHisIndex < this.historyArr.length){
            let curHisObj = this.historyArr[this.curHisIndex];/* 需要撤销悔棋的棋子坐标 */
            this.createPieceFn(curHisObj.x,curHisObj.y);
            this.curCheckerArr[curHisObj.x][curHisObj.y] = curHisObj.role;/* 恢复悔棋坐标数据 */
            this.curHisIndex++;
            this.curRole = this.curRole === 1 ? 2 : 1;
            this.cellTipEl.className = this.curRole === 1 ? 'cell-tip--white' : 'cell-tip--black';
        }
    }
    /* 防抖 */
    debounceFn(callback, wait) {
        let bool = true;
        return function() {
            let args = arguments;
            if(typeof callback === 'function' && bool){
                callback.apply(this, args);
                bool = false;
                setTimeout(()=>{
                    bool = true;
                },wait);
            }
        }
    }
}

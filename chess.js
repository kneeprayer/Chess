
var pawn = 1;
var king = 2;
var queen = 3;
var bishop = 4;
var knight = 5;
var rook = 6;

var check = -1;

var white = 8;
var black = 16;

var turn = white;

enpassantMoves = []
castlingMoves = []
castlingRights = [[true, true], [true, true]]
function arrayContains(arr, subarr){
    for(var i = 0; i<arr.length; i++){
        let checker = false
        for(var j = 0; j<arr[i].length; j++){
            if(arr[i][j] === subarr[j]){
                checker = true
            } else {
                checker = false
                break;
            }
        }
        if (checker){
            return true
        }
    }
    return false
}
function indexOf2dArray(array2d, itemtofind) {
    index = [].concat.apply([], ([].concat.apply([], array2d))).indexOf(itemtofind);
                
    // return "false" if the item is not found
    if (index === -1) { return false; }
    
    // Use any row to get the rows' array length
    // Note, this assumes the rows are arrays of the same length
    numColumns = array2d[0].length;
    
    // row = the index in the 1d array divided by the row length (number of columns)
    row = parseInt(index / numColumns);
    
    // col = index modulus the number of columns
    col = index % numColumns;
    
    return [row, col]; 
}

function deepCopy(obj) {
    
    var clone = [];
    obj.forEach(el => {
        var obj2 = [];
        el.forEach(el2 => {
            obj2.push(el2);
        })
        clone.push(obj2);
    })
    
    return clone;
}

var Chess = {
    board: [
        [rook|black, knight|black, bishop|black, queen|black, king|black, bishop|black, knight|black, rook|black],
        [pawn|black, pawn|black, pawn|black, pawn|black, pawn|black, pawn|black, pawn|black, pawn|black],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [pawn|white, pawn|white, pawn|white, pawn|white, pawn|white, pawn|white, pawn|white, pawn|white],
        [rook|white, knight|white, bishop|white, queen|white, king|white, bishop|white, knight|white, rook|white]
    ],
    pieceOn: function(rank, file){
        var state = this.board[rank][file];
        if (state == 0){
            return false;
        }
        var color = state >> 3 << 3;
        var piece = state - color;
        return {piece: piece, color: color, raw: state};
    },
   
    render: function(){
        var pieces = document.querySelectorAll(".piece");
        pieces.forEach(piece => piece.remove());

        for (let file = 0; file < 8; file++){
            for (let rank = 0; rank < 8; rank++){
                var img = document.createElement("img");
                
                var state = this.pieceOn(rank, file);
                var pieceClass;
                switch (state.raw){
                    case pawn | black: 
                        img.src = "assets/P.png";
                        pieceClass = "pawn";
                        break;
                    case bishop | black: 
                        img.src = "assets/B.png";
                        pieceClass = "bishop";
                        break;
                    case knight | black: 
                        img.src = "assets/Kn.png";
                        pieceClass = "knight";
                        break;
                    case rook | black: 
                        img.src = "assets/R.png";
                        pieceClass = "rook";
                        break;
                    case king | black: 
                        img.src = "assets/K.png";
                        pieceClass = "king";
                        break;
                    case queen | black: 
                        img.src = "assets/Q.png";
                        pieceClass = "queen";
                        break;
                    case pawn | white: 
                        img.src = "assets/p.png";
                        pieceClass = "pawn";
                        break;
                    case bishop | white: 
                        img.src = "assets/b.png";
                        pieceClass = "bishop";
                        break;
                    case knight | white: 
                        img.src = "assets/kn.png";
                        pieceClass = "knight";
                        break;
                    case king | white: 
                        img.src = "assets/k.png"
                        pieceClass = "king";
                        break;
                    case queen | white: 
                        img.src = "assets/q.png";
                        pieceClass = "queen";
                        break;
                    case rook | white: 
                        img.src = "assets/r.png";
                        pieceClass = "rook";
                        break;
                }
                img.classList.add(state.color==white? "white":"black");
                img.classList.add(pieceClass);
                img.classList.add("piece");
                var board = document.getElementById("chessboard"),
                    tr = board.getElementsByTagName('tr')[rank],
                    square = tr.getElementsByTagName('td')[file];
                    square.appendChild(img);
            }
        }

        
    },
    moveTo: function(move){
        
        var piece = this.board[move[0]][move[1]];
        
        this.board[move[2]][move[3]] = piece;
        this.board[move[0]][move[1]] = 0;
    },
    
    
    specialMovesCheck : function (moves){
        if (arrayContains(enpassantMoves, moves) && this.pieceOn(moves[2], moves[3]).piece == pawn){
            var towardsOpponent = turn == white ? 1 : -1;
            this.board[moves[2] + towardsOpponent][moves[3]] = 0;
        }
        if (arrayContains(castlingMoves, moves) && this.pieceOn(moves[2], moves[3]).piece == king){
            var backrank = turn == white ? 7 : 0
            if (moves[3] == 6){
                this.moveTo([backrank, 7, backrank, 5]);
            }
            if (moves[3] == 2){
                this.moveTo([backrank, 0, backrank, 3]);
            }
        }

        

        
        castlingMoves = [];
        enpassantMoves = [];
        return;
    }, 

    lateralMovementCheck : function (rank, file){
        var checkedPosition = [];
        for (newFile = file+1; newFile < 8; newFile++) {
            if (this.pieceOn(rank, newFile).color == turn){
                break;
            }
            checkedPosition.push([rank, file, rank, newFile]);
            if (this.pieceOn(rank, newFile)){
                break;
            }
        }
        for (newFile = file-1; newFile >= 0; newFile--) {
            if (this.pieceOn(rank, newFile).color == turn){
                break;
            }
            checkedPosition.push([rank, file, rank, newFile]);
            if (this.pieceOn(rank, newFile)){
                break;
            }
        }
        for (newRank = rank+1; newRank < 8; newRank++) {
            if (this.pieceOn(newRank, file).color == turn){
                break;
            }
            checkedPosition.push([rank, file, newRank, file]);
            if (this.pieceOn(newRank, file)){
                break;
            }
        }
        for (newRank = rank-1; newRank >= 0; newRank--) {
            if (this.pieceOn(newRank, file).color == turn){
                break;
            }
            checkedPosition.push([rank, file, newRank, file]);
            if (this.pieceOn(newRank, file)){
                break;
            }
        }
        
        
        return checkedPosition;

    },

    diagonalMovementCheck : function (rank, file){
        var checkedPosition = [];
        for (let newRank = rank + 1, newFile = file + 1; newFile < 8 && newRank < 8; newFile++, newRank++){
            if (this.pieceOn(newRank, newFile).color == turn){
                break;
            }
            checkedPosition.push([rank, file, newRank, newFile]);
            if (this.pieceOn(newRank, newFile)){
                    break;
                }
        }
        for (let newRank = rank - 1, newFile = file + 1; newFile < 8 && newRank >= 0; newFile++, newRank--){
            if (this.pieceOn(newRank, newFile).color == turn){
                break;
            }
            checkedPosition.push([rank, file, newRank, newFile]);
            if (this.pieceOn(newRank, newFile)){
                    break;
                }
        }
        for (let newRank = rank + 1, newFile = file - 1; newFile >= 0 && newRank < 8; newFile--, newRank++){
            if (this.pieceOn(newRank, newFile).color == turn){
                break;
            }
            checkedPosition.push([rank, file, newRank, newFile]);
            if (this.pieceOn(newRank, newFile)){
                    break;
                }
        }
        for (let newRank = rank - 1, newFile = file - 1; newFile >= 0 && newRank >= 0; newFile--, newRank--){
            if (this.pieceOn(newRank, newFile).color == turn){
                break;
            }
            checkedPosition.push([rank, file, newRank, newFile]);
            if (this.pieceOn(newRank, newFile)){
                    break;
                }
        }
        
        return checkedPosition;
    },

    knightJumpCheck : function (rank, file){
        var checkedPosition = [];
        var knightJump = [[1, 2], [2, 1], [-1, 2], [2, -1], [-2, 1], [1, -2], [-1, -2], [-2, -1]];
        knightJump.forEach(jump => {
            if (rank + jump[0] < 8 && rank + jump[0] >= 0 && file + jump[1] < 8 && file + jump[1] >= 0){
                if (this.pieceOn(rank + jump[0], file + jump[1]).color == turn){
                    return;
                }
                checkedPosition.push([rank, file, rank + jump[0], file + jump[1]]);
            
            }
        }, this)

        return checkedPosition;
    },

    kingWalkCheck : function (rank, file){
        var checkedPosition = [];
        var kingWalk = [[1, 0], [0, 1], [1, 1], [-1, -1], [-1, 0], [0, -1], [1, -1], [-1, 1]];
        kingWalk.forEach(walk => {
            
            
            if (rank + walk[0] < 8 && rank + walk[0] >= 0 && file + walk[1] < 8 && file + walk[1] >= 0){
                
                if (this.pieceOn(rank + walk[0], file + walk[1]).color == turn){
                    return;
                }
                
                checkedPosition.push([rank, file, rank + walk[0], file + walk[1]]);
            }
        }, this)
        
        return checkedPosition;
    
    },

    castlingCheck : function (rank, file){
        var checkedPosition = [];
        
        if ( turn == white){
            
            if (!this.pieceOn(7, 5) && !this.pieceOn(7, 6) && this.pieceOn(7, 7).piece == rook && castlingRights[0][0]){
                checkedPosition.push([rank, file, 7, 6]);
                castlingMoves.push([rank, file, 7, 6]);
            }
            if (!this.pieceOn(7, 3) && !this.pieceOn(7, 2) && !this.pieceOn(7, 1) && this.pieceOn(7, 0).piece == rook && castlingRights[0][1]){
                checkedPosition.push([rank, file, 7, 2]);
                castlingMoves.push([rank, file, 7, 2]);
            }
        }
        if ( turn == black){
            if (!this.pieceOn(0, 5) && !this.pieceOn(0, 6) && this.pieceOn(0, 7).piece==rook && castlingRights[1][0]){
                checkedPosition.push([rank, file, 0, 6]);
                castlingMoves.push([rank, file, 0, 6]);
            }
            if (!this.pieceOn(0, 3) && !this.pieceOn(0, 2) && !this.pieceOn(0, 1) && this.pieceOn(0, 0).piece == rook && castlingRights[1][1]){
                checkedPosition.push([rank, file, 0, 2]);
                castlingMoves.push([rank, file, 0, 2]);
            }
        }
        return checkedPosition;

    },

    pawnMarchCheck : function (rank, file){
        var checkedPosition = [];
        if ( turn == white){
            if (rank > 0){
                if (!this.pieceOn(rank - 1, file)){                    
                    checkedPosition.push([rank, file, rank-1, file]);
                }
                if (file<7){
                    if (this.pieceOn(rank - 1, file+1).color == black){
                        checkedPosition.push([rank, file,rank-1, file+1]);
                    }      
                    
                }
                if (file>0){
                    
                    if (this.pieceOn(rank - 1, file-1).color == black){
                        checkedPosition.push([rank, file,rank-1, file-1]);
                    }    
                }   
            }
            
            if (rank == 6){
                if (!this.pieceOn(rank -2, file)){
                    
                    
                    checkedPosition.push([rank, file,rank-2, file]);
                    
                }
            }
        }
        else{
                if (rank < 7){
                if (!this.pieceOn(rank + 1, file)){
                    
                   
                        checkedPosition.push([rank, file,rank+1, file]);
                    
                }
                
                if (file < 7){
                    
                    if (this.pieceOn(rank + 1, file+1).color == white){
                        checkedPosition.push([rank, file,rank+1, file+1]);
                    }    
                }
                if (file > 0){
                    if (this.pieceOn(rank + 1, file-1).color == white){
                        checkedPosition.push([rank, file,rank+1, file-1]);
                    }
                }            
            }
            if (rank == 1){
                if (!this.pieceOn(rank +2, file)){
                    
                    
                    checkedPosition.push([rank, file,rank+2, file]);
                }
            }
        }

        return checkedPosition;
    },

    enpassantMoveCheck : function (rank, file){
        var checkedPosition = [];
        if ( turn == white){
            if (rank == 3){
                if (file<8){
                    if (!this.pieceOn(rank -1, file+1) && this.pieceOn(rank, file+1).piece == pawn && this.pieceOn(rank, file+1).color == black){
                        checkedPosition.push([rank, file, rank-1, file+1]);
                        enpassantMoves.push([rank, file, rank-1, file+1]);
                        
                    }
                }
                if (file>=0){
                    if (!this.pieceOn(rank-1, file-1) && this.pieceOn(rank, file-1).piece == pawn && this.pieceOn(rank, file-1).color == black){
                        checkedPosition.push([rank, file, rank-1, file-1]);
                        enpassantMoves.push([rank, file, rank-1, file-1]);
                        
                    }
                }
            }
            

        }
        else{
            
            if (rank == 4){
                if (!this.pieceOn(rank+1, file+1) && this.pieceOn(rank, file+1).piece == pawn && this.pieceOn(rank, file+1).color == white){
                    checkedPosition.push([rank, file, rank+1, file+1]);
                    enpassantMoves.push([rank, file, rank+1, file+1])
                }
                if (!this.pieceOn(rank+1, file-1) && this.pieceOn(rank, file-1).piece == pawn && this.pieceOn(rank, file-1).color == white){
                    checkedPosition.push([rank, file, rank+1, file-1]);
                    enpassantMoves.push([rank, file, rank+1, file-1])
                }
            }
        
        
        }  
        return checkedPosition;
    },
    GeneratePsuedolegalMoves: function(rank, file, asPiece = 0){
        
        var piece = asPiece != 0 ? asPiece : this.pieceOn(rank, file).piece;
        var moves = [];
        switch(piece){
        case pawn:
            moves = moves.concat(this.pawnMarchCheck(rank, file));
            moves = moves.concat(this.enpassantMoveCheck(rank, file));
            break;
        case knight:
            moves = moves.concat(this.knightJumpCheck(rank, file));
            break;

        case king:
            moves = moves.concat(this.kingWalkCheck(rank, file));
            if(asPiece == 0){
                if (!this.inCheck()){
                    moves = moves.concat(this.castlingCheck(rank, file));
                }
            }
            
            break;
        case queen:
            moves = moves.concat(this.lateralMovementCheck(rank, file));
            moves = moves.concat(this.diagonalMovementCheck(rank, file));
            break;
        case bishop:
            moves = moves.concat(this.diagonalMovementCheck(rank, file));
            break;
        case rook:
            moves = moves.concat(this.lateralMovementCheck(rank, file));
            break;
        
        }
        return moves;
    },
    getMoves: function(rank, file){
        var saveBoard = deepCopy(this.board);


        var pseudolegalMoves = this.GeneratePsuedolegalMoves(rank, file);
        
        if (pseudolegalMoves.length < 1){
            return;
        }
        
        var goodMoves = [];
        
        pseudolegalMoves.forEach(move => {
            this.moveTo(move);
            
            if(!this.inCheck()){
                goodMoves.push(move);
            }
            this.board = deepCopy(saveBoard);
        }, this)

        return goodMoves;
        
    },
    inCheck: function(){
        
        var kingSquare = indexOf2dArray(this.board, king|turn);
        
        var opponentResponse = [];
        var isChecked = false;
        for (let p = 1; p <= 6; p++){
            var opponentResponses = this.GeneratePsuedolegalMoves(kingSquare[0], kingSquare[1], p);
            
            if (opponentResponses.length < 1){
                continue;
            }
            
            opponentResponses.forEach(response => {
                
                var opponentPiece = this.pieceOn(response[2], response[3]).piece;
                
                if (opponentPiece == p){
                    isChecked = true;
                }
            }, this)
        }
        
        return isChecked;
            
        
    }
}

function renderDots(squares){
    
    squares.forEach(square => {
      
        var board = document.getElementById("chessboard"),
            tr = board.getElementsByTagName('tr')[square[2]],
            td = tr.getElementsByTagName('td')[square[3]],
            dot = td.getElementsByClassName('dot')[0];
        
        dot.style.visibility = 'visible';
        
        return;
    })
    
    
}
function hideDots(){
    var dots = document.querySelectorAll(".dot");
    dots.forEach(dot=>dot.style.visibility="hidden");
}

var clickedPosition = [];
var clickedPiece;
var legalMoves = [];

var paused = false;

function onReady(){
    var board = document.getElementById("chessboard");
    

    board.addEventListener('click', event => {
        if(paused){
            return;
        }
       
        var clickedSquare;
        var newClickedPosition = [];
        var newClickedPiece;
      
        if (event.target.classList.contains('dark') | event.target.classList.contains('light')){
            clickedSquare = event.target;     
        }
        else if (event.target.classList.contains('piece') | event.target.classList.contains('dot')){
            clickedSquare = event.target.parentElement;
            newClickedPiece  = clickedSquare.getElementsByClassName('piece')[0];
        }  
        else{
            return;
        }
        
        
        newClickedPosition = [clickedSquare.parentElement.rowIndex, clickedSquare.cellIndex];
        
        if (clickedPosition.length > 0){
            
            if (arrayContains(legalMoves, clickedPosition.concat(newClickedPosition))){
                
                if (Chess.pieceOn(clickedPosition[0], clickedPosition[1]).piece == king){
                    castlingRights[turn == white ? 0 : 1] = [false, false];
                }
                if (Chess.pieceOn(clickedPosition[0], clickedPosition[1]).piece == rook){
                    castlingRights[turn == white ? 0 : 1][clickedPosition[1] == 7 ? 0 : 1] = false;
                }
            
                Chess.moveTo([clickedPosition[0], clickedPosition[1], newClickedPosition[0], newClickedPosition[1]]);
                Chess.specialMovesCheck(clickedPosition.concat(newClickedPosition));
                if (Chess.board[0].includes(pawn|white)){
                    document.getElementById("whitePromotion").style.visibility = "visible"
                    paused = true;
                }
                if (Chess.board[7].includes(pawn|black)){
                    document.getElementById("blackPromotion").style.visibility = "visible"
                    paused = true;
                }


                clickedPiece = null;
                clickedPosition = [];
                hideDots();
                Chess.render();


                

                turn = turn == white ? black : white;
                


                return;
            }
            else{
                clickedPiece = null;
                clickedPosition = [];
                hideDots();
                
                return;
            }
        }
        else if(newClickedPosition){
            
            if ((Chess.pieceOn(newClickedPosition[0], newClickedPosition[1]).color) != turn){
                
                clickedPiece = null;
                clickedPosition = [];
                hideDots();
                return;
            }
            legalMoves = Chess.getMoves(newClickedPosition[0], newClickedPosition[1]);
            if (legalMoves.length < 1){
                clickedPiece = null;
                clickedPosition = [];
                hideDots();
                
                return;
            }
            clickedPosition = newClickedPosition;
            clickedPiece = newClickedPiece;
            
            renderDots(legalMoves);
            return;
        }
        
    })  

    var whitePromotion = document.getElementById("whitePromotion");
    whitePromotion.addEventListener('click', event => {
        if (!paused){
            return;
        }

        var pawnPosition = Chess.board[0].indexOf(pawn|white);

        if (event.target.classList.contains("queenPromotion")){
            Chess.board[0][pawnPosition] = queen|white;
        }
        else if (event.target.classList.contains("bishopPromotion")){
            Chess.board[0][pawnPosition] = bishop|white;
        }
        else if (event.target.classList.contains("knightPromotion")){
            Chess.board[0][pawnPosition] = knight|white;
        }
        else if (event.target.classList.contains("rookPromotion")){
            Chess.board[0][pawnPosition] = rook|white;
        }
        else{
            return;
        }

        paused = false;
        whitePromotion.style.visibility = "hidden"
        Chess.render();
    })
    var blackPromotion = document.getElementById("blackPromotion");
    blackPromotion.addEventListener('click', event => {
        if (!paused){
            return;
        }

        var pawnPosition = Chess.board[7].indexOf(pawn|black);

        if (event.target.classList.contains("queenPromotion")){
            Chess.board[7][pawnPosition] = queen|black;
        }
        else if (event.target.classList.contains("bishopPromotion")){
            Chess.board[7][pawnPosition] = bishop|black;
        }
        else if (event.target.classList.contains("knightPromotion")){
            Chess.board[7][pawnPosition] = knight|black;
        }
        else if (event.target.classList.contains("rookPromotion")){
            Chess.board[7][pawnPosition] = rook|black;
        }
        else{
            return;
        }
        blackPromotion.style.visibility = "hidden"
        paused = false;
        Chess.render();
    })
}





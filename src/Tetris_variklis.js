/*--------------------------------------------------*/
/*____________________KINTAMIEJI____________________*/
	var g_initialized = false;				//holds information whether game is initialized
	var g_canRunGame  = true;
	var g_gameBoard   = [];					//holds symbols in it which represents different blocks
	
	var g_columns     = 10,					
		g_rows 		  = 22;					
	var g_squareSize  = 30;
	var g_sideBarWidth= 200,
		g_brdWidth    = g_sideBarWidth + g_columns*g_squareSize + 3*g_squareSize,
		g_brdHeight	  = (g_rows-2)*g_squareSize + 2*g_squareSize;
		
	var g_currentTime = 0,					//iterator
		g_timeLimit   = 20;					//controls speed of the figure movement down
		
	var g_canChangeDirections = false; 	 	//variable, needed to move shapes sideways
	
	var g_needToGenerate = true;			//holds information whether game needs to generate next shape
	var g_usedShape;						
	var g_nextShape;
	
	var g_nextRoCo = [];
	var g_nextColor = [];
	
	var g_canPushDown = true;
/*____________________KINTAMIEJI____________________*/
/*--------------------------------------------------*/
//
//
//
//
//
/*--------------------------------------------------*/
/*______________________KLASES______________________*/

function shape(p_coords, p_color, p_index, p_rotationCoords){
//properties	
	//
	this._beginCoords = [];
	this._begRotCoords = [];
	this._color;	  
	this._index;	  
	this._coords;
	this._rotationCoords;
//methods
	//function is called once to set up coords, rotCoords and color
	this.initShape = function(){
		copyArray(p_coords,this._beginCoords, 8); 
		copyArray(p_rotationCoords, this._begRotCoords, 8);
		this._color = p_color;		  
		this._index = p_index;		  
		this._coords = p_coords;
		this._rotationCoords = p_rotationCoords;
	}
	//resets shape back to start position
	this.resetPos = function(){
		//copyArray copies array elements from one to other
		copyArray(this._beginCoords, this._coords, 8); 
		copyArray(this._begRotCoords, this._rotationCoords, 8);
		g_needToGenerate = true;
	}
	//function for a user to save up some space - draws shape and proccesses movement
	this.proccessShape = function(){
		//DRAW SHAPE
		this.draw();
		//CONTROL THE SHAPE
		//move shape to the right
		if(keyCode == RIGHT_ARROW && g_canChangeDirections){
			this.moveRight();
			g_canChangeDirections = false;
		}
		//move shape to the left
		else if(keyCode == LEFT_ARROW && g_canChangeDirections){
			this.moveLeft();
			g_canChangeDirections = false;
		}
		//rotate shape
		else if(keyCode == UP_ARROW && g_canChangeDirections){
			this.rotate();
			g_canChangeDirections = false;
		} 
		//push shape down
		else if(keyIsDown(DOWN_ARROW)){
			if(g_canPushDown){
				this.pushDown();
			}
		}
	}
	//draws shape using function drawSquare and passing array of _coords
	this.draw = function(){
		for(i=0;i<8;i+=2){
			drawSquare(this._coords[i], 
					   this._coords[i+1], 
					   this._color);
		}
	}
	//sets value of g_gameBoard[] elements that are stored in _coords position, to _index
	this.placeDown= function(){
		for(x=0;x<8;x+=2){
			g_gameBoard[this._coords[x]][this._coords[x+1]] = p_index;
		}
		//block the ability to move shape down
		g_canPushDown = false;
	}
	//pushes shape down by one block, if it colides with other figures or ground, it calls placeDownwn(); and resetPos();
	this.pushDown = function(){
		var canPushDown = true;
		//check if shape doesnt collide with other blocks or ground
		for(i=0;i<8;i+=2){
			if(g_gameBoard[this._coords[i]][this._coords[i+1]+1] != '0'  ||  this._coords[i+1] == 21){
				canPushDown=false;
			}
		}
		if(canPushDown){
			for(i=0;i<8;i+=2){
				this._coords[i+1]++;
			}
		} else {
			this.placeDown();
			this.resetPos();
		}
	}
	//lets player control the shape by moving it right
	this.moveRight = function(){//need to edit this functions so that shape colides with already placed squares
		var canMoveRight=true;
		for(j=0;j<8;j+=2){
			if(this._coords[j]===(g_columns-1) || g_gameBoard[this._coords[j]+1][this._coords[j+1]] != '0' ){
				canMoveRight=false;
			}
		}
		if(canMoveRight){
			for(i=0;i<8;i+=2){
				this._coords[i]++;
			}
		}
		
	}
	//lets player control the shape by moving it left
	this.moveLeft = function(){	//doesnt move when it hits other placed figures
		var canMoveLeft=true;
		for(j=0;j<8;j+=2){
			if(this._coords[j]==0 || g_gameBoard[this._coords[j]-1][this._coords[j+1]] != '0' ){
				canMoveLeft=false;
			}
		}
		if(canMoveLeft){
			for(i=0;i<8;i+=2){
				this._coords[i]--;
			}
		}
	}
	//rotates shape
	this.rotate = function(){
		var canRun = true;
		var prevCoords = [];
		var cancelRot = [];
		copyArray(this._rotationCoords, prevCoords, 8);
		copyArray(this._coords, cancelRot, 8);
		var additional;
		//swap rotation coords x with y
		for(i=0;i<8;i+=2){
			additional 					= -this._rotationCoords[i];
			this._rotationCoords[i] 	= this._rotationCoords[i+1];
			this._rotationCoords[i+1]	= additional;
		}
		//perform rotation
		for(i=0;i<8;i+=2){
			if((this._rotationCoords[i]>0 && prevCoords[i]>0) || (this._rotationCoords[i]<0 && prevCoords[i]<0)){ 
				this._coords[i]+=this._rotationCoords[i]-prevCoords[i];
			} else if(this._rotationCoords[i] == 0 || prevCoords[i] == 0){
				this._coords[i]+=this._rotationCoords[i]-prevCoords[i];
			} 
			else {
				additional = this._rotationCoords[i]-prevCoords[i];
				if(additional>0){
					additional--;
				} else if(additional<0){
					additional++;
				} 
				this._coords[i]+=additional;
			}
			
			if((this._rotationCoords[i+1]>0 && prevCoords[i+1]>0) || (this._rotationCoords[i+1]<0 && prevCoords[i+1]<0)){
				this._coords[i+1]-=this._rotationCoords[i+1]-prevCoords[i+1];
			} else if (this._rotationCoords[i+1] == 0 || prevCoords[i+1] == 0) {
				this._coords[i+1]-=this._rotationCoords[i+1]-prevCoords[i+1];
			} else {
				additional = this._rotationCoords[i+1]-prevCoords[i+1];
				if(additional>0){
					additional--;
				} else if(additional<0){
					additional++;
				} 
				this._coords[i+1]-=additional;
			}
		}
		//check if shape doesnt overlap the boarders
		for(i=0;i<8;i+=2){
			//checking if shape doesnt overlap left side
			if(this._coords[i]<0){
				additional=this._coords[i];
				for(j=0;j<8;j+=2){
					this._coords[j]-=additional;
				}
			//checking if shape doesnt overlap right side
			} else if(this._coords[i]>9){
				additional=this._coords[i]-9;
				for(j=0;j<8;j+=2){
					this._coords[j]-=additional;
				}
 			} else if(this._coords[i+1]>21) {
			//checking if shape doesnt overlap the bottom
				additional=this._coords[i+1]-21;
				for(j=0;j<8;j+=2){
					this._coords[j+1]-=additional;
				}
			}
		}
		//check if rotated shape doesnt overlap with other shapes
		//if it does - rotation is canceled
		for(i=0;i<8 && canRun;i+=2){
			if(g_gameBoard[this._coords[i]][this._coords[i+1]] != '0'){
				copyArray(cancelRot, this._coords, 8);
				canRun=false;
			}
		}
	}	
	//returns rotation coords to a global array g_nextRoCo
	this.getRotCoords = function(){
		copyArray(this._begRotCoords, g_nextRoCo, 8); 
	}
	//returns color of a shape to a global array g_nextColor
	this.getColor = function(){
		copyArray(this._color, g_nextColor, 8);
	}
}

/*______________________KLASES______________________*/
/*--------------------------------------------------*/
//
//
//
//
//
/*--------------------------------------------------*/
/*_____________________OBJEKTAI_____________________*/

/* 	T SHPAE */	var g_T_shape = new shape([4,1, 5,1, 6,1, 5,2], [0,128,0]	, '7', [-1,0, 0,0, 1,0, 0,-1]	);	//green	
/*	P SHAPE	*/	var g_P_shape = new shape([4,1, 5,1, 6,1, 6,2], [0,191,255]	, '6', [-2,1, -1,1, 1,1, 1,-1]	);	//deepSkyBlue
/* 	L SHAPE	*/	var g_L_shape = new shape([4,1, 5,1, 6,1, 4,2], [0,0,139]	, '5', [-1,1, 1,1, 2,1, -1,-1]	);	//darkBlue
/* 	O SHAPE	*/ 	var g_O_shape = new shape([4,1, 5,1, 4,2, 5,2], [148,0,211]	, '4', [-1,1, 1,1, -1,-1, 1,-1]	);	//darkViolet
/* 	I SHAPE */	var g_I_shape = new shape([3,1, 4,1, 5,1, 6,1], [220,20,60]	, '3', [-2,1, -1,1, 1,1, 2,1]	);	//crimsonRed 
/*	S SHAPE */	var g_S_shape = new shape([5,1, 6,1, 5,2, 4,2], [255,140,0]	, '2', [-1,1, 1,1, -1,-1, -2,-1]); 	//darkOrange
/*  Z SHAPE */	var g_Z_shape = new shape([4,1, 5,1, 5,2, 6,2], [204,204,0]	, '1', [-1,1, 1,1, 1,-1, 2,-1]	); 	//darkYellow

/*_____________________OBJEKTAI_____________________*/
/*--------------------------------------------------*/
//
//
//
//
//
/*--------------------------------------------------*/
/*____________________FUNKCIJOS_____________________*/

//function where the game initializes and runs afterwards
function playTetris(){
	if(g_initialized){
		runGame();
	} else {
		initTetris();
	}
}

//main fuction, where game is proccessed
function runGame(){
	
	if(g_canRunGame){
		//draws background + grid
		drawBackground();
		//draws already placed blocks
		drawGameBoard();
		
		//generate shape if it is not generated at the moment
		if(g_needToGenerate){
			g_usedShape = g_nextShape;
			g_nextShape = generateShape();
			g_needToGenerate = false;
		}
		
		//draws next figure in the top right corner
		drawNextShape();
		
		//procces generated shape behaviour at the current frame
		if(g_usedShape <= 1/7){
			//draws the shape and controls behaviour
			g_Z_shape.proccessShape();
			//if counter reaches the limit, shape drops down, timer resets
			if(g_currentTime==g_timeLimit){
				g_currentTime=0;
				g_Z_shape.pushDown();
			}
		} else if(g_usedShape <= 2/7){
			//every other statement is exactly the same
			g_S_shape.proccessShape();
			if(g_currentTime==g_timeLimit){
				g_currentTime=0;
				g_S_shape.pushDown();
			}
		} else if(g_usedShape <= 3/7){
			g_I_shape.proccessShape();
			if(g_currentTime==g_timeLimit){
				g_currentTime=0;
				g_I_shape.pushDown();
			}
		} else if(g_usedShape <= 4/7){
			g_O_shape.proccessShape();
			if(g_currentTime==g_timeLimit){
				g_currentTime=0;
				g_O_shape.pushDown();
			}
		} else if(g_usedShape <= 5/7){
			g_L_shape.proccessShape();
			if(g_currentTime==g_timeLimit){
				g_currentTime=0;
				g_L_shape.pushDown();
			}
		} else if(g_usedShape <= 6/7){
			g_P_shape.proccessShape();
			if(g_currentTime==g_timeLimit){
				g_currentTime=0;
				g_P_shape.pushDown();
			}
		} else if(g_usedShape <= 1){
			g_T_shape.proccessShape();
			if(g_currentTime==g_timeLimit){
				g_currentTime=0;
				g_T_shape.pushDown();
			}
		}
		
		//checks g_gameBoard if any lines are filled
		checkIfFilled();
		checkIfNotLost();
		 
		g_currentTime++;
	}
}

//if main loop runs for the first time, variables are beeing initialized
function initTetris(){
	createCanvas(g_brdWidth,g_brdHeight);
//init g_gameBoard
	for(x = 0; x < g_columns; x++){
		g_gameBoard[x] = [];    
		for(y = 0; y < g_rows; y++){ 
			g_gameBoard[x][y] = '0';  	
		}
    }    
//init shapes
	g_T_shape.initShape();
	g_P_shape.initShape();
	g_L_shape.initShape();
	g_O_shape.initShape();
	g_I_shape.initShape();
	g_Z_shape.initShape();
	g_S_shape.initShape();
//generate first and next shapes
	g_usedShape=generateShape();
	g_nextShape=generateShape();
//initialization completed
	g_initialized = true;
}

//draws background boarders and playboard grid
function drawBackground(){
//drawing boarders
	fill(color(0,0,255));
	rect(0,0,g_brdWidth,g_brdHeight);
	
	fill(color(0,0,0));
	rect(g_squareSize,g_squareSize,
		 g_brdWidth-2*g_squareSize, g_brdHeight-2*g_squareSize);
	
	fill(color(0,0,225));
	rect(g_squareSize,g_squareSize,
		 g_brdWidth-2*g_squareSize-g_sideBarWidth, g_brdHeight-2*g_squareSize);
	
	fill(color(0,0,0));
	rect(g_squareSize,g_squareSize,
		 g_columns*g_squareSize, (g_rows-2)*g_squareSize);
	
	fill(color(0,0,255));
	rect((g_columns+2)*g_squareSize,
		 g_sideBarWidth+g_squareSize,
		 g_sideBarWidth, g_squareSize);
		 
//drawing playBoard grid
	noFill();
	stroke(0,0,100);
	for(i=0;i<g_columns;i++){
		for(j=0;j<(g_rows-2);j++){
			rect(i*g_squareSize+g_squareSize,
				 j*g_squareSize+g_squareSize,
				 g_squareSize,g_squareSize);
		}
	}
}

//draws already placed blocks
function drawGameBoard(){
	var continueDrawing = true;
	for(i=21; i>0 && continueDrawing; i--){
		continueDrawing = false;
		for(j=0;j<10;j++){
			if(g_gameBoard[j][i] != '0'){
				continueDrawing = true;
			}
			switch(g_gameBoard[j][i]){
				case '1':	//darkYellow		rgb(204,204,0)
					drawSquare(j,i,[204,204,0]);
					break;
				case '2':	//darkOrange		rgb(255,140,0)
					drawSquare(j,i,[255,140,0]);
					break;
				case '3':	//crimsonRed 		rgb(220,20,60)
					drawSquare(j,i,[220,20,60]);
					break;
				case '4':	//darkViolet		rgb(148,0,211)
					drawSquare(j,i,[148,0,211]);
					break;
				case '5':	//darkBlue			rgb(0,0,139)
					drawSquare(j,i,[0,0,139]);
					break;
				case '6':	//deepSkyBlue		rgb(0,191,255)
					drawSquare(j,i,[0,191,255]);
					break;
				case '7':	//green				rgb(0,128,0)	
					drawSquare(j,i,[0,128,0]);
					break;
				case '0':	//do not draw
					break;
			}
		}
	}
}

//generates random shape to proccess
function generateShape(){
	//sets global variable to false, meaning that the program doesnt need to generate shape anymore
	g_needToGenerate=false;
	return Math.random();
}

//draws next shape
function drawNextShape(){
	var centerX = 460, centerY = 130;
	
	if(g_nextShape <= 1/7){
		g_Z_shape.getRotCoords();
		g_Z_shape.getColor();
	}else if(g_nextShape <= 2/7){
		g_S_shape.getRotCoords();
		g_S_shape.getColor();
	}else if(g_nextShape <= 3/7){
		g_I_shape.getRotCoords();
		g_I_shape.getColor();
	}else if(g_nextShape <= 4/7){
		g_O_shape.getRotCoords();
		g_O_shape.getColor();
	}else if(g_nextShape <= 5/7){
		g_L_shape.getRotCoords();
		g_L_shape.getColor();
	}else if(g_nextShape <= 6/7){
		g_P_shape.getRotCoords();
		g_P_shape.getColor();
	}else if(g_nextShape <= 7/7){
		g_T_shape.getRotCoords();
		g_T_shape.getColor();
	}
	
	//check if next shape will be 'T'
	//if it is, we need to change only Center pos
	if(g_nextRoCo[0]==0 || g_nextRoCo[1]==0){
		centerX-=g_squareSize/2;
		centerY-=g_squareSize/2;
	//if it doesnt, we have to modify rot coords, so that we can apply them later to a drawNextSquare() function
	} else {
		for(i=0;i<8;i+=2){
			if(g_nextRoCo[i+1]<0){
				g_nextRoCo[i+1]++;
			}
			if(g_nextRoCo[i]>0){
				g_nextRoCo[i]--;
			}
		}
	}
	
	//draws next shape
	for(i=0;i<8;i+=2){
		drawNextSquare(centerX + g_squareSize*g_nextRoCo[i],
					   centerY - g_squareSize*g_nextRoCo[i+1],
					   g_nextColor);
	}
	
	
}

	//draws square for the next figure x(0-width), y(0-height) color(rgb)
	function drawNextSquare(p_x,p_y,p_rgb){
		stroke(0,0,0);
		fill(color(p_rgb[0],p_rgb[1],p_rgb[2]));
		rect(p_x,
			 p_y,
			 g_squareSize,g_squareSize);
		
		fill(color(p_rgb[0]+120,p_rgb[1]+120,p_rgb[2]+120));
		rect(p_x +4,
			 p_y +4,
			 g_squareSize-8,g_squareSize-8);
	}

//draws square at x(0-9),y(0-19) position in [r,g,b] color
function drawSquare(p_x,p_y,p_rgb){
	if(p_y>=2){
		p_y-=2;
		stroke(0,0,0);
		fill(color(p_rgb[0],p_rgb[1],p_rgb[2]));
		rect(g_squareSize+p_x*g_squareSize,
			 g_squareSize+p_y*g_squareSize,
			 g_squareSize,g_squareSize);
		
		fill(color(p_rgb[0]+120,p_rgb[1]+120,p_rgb[2]+120));
		rect(g_squareSize+p_x*g_squareSize +4,
			 g_squareSize+p_y*g_squareSize +4,
			 g_squareSize-8,g_squareSize-8);
	}
}

//clears line if it is filled with blocks
function checkIfFilled(){
	var canContinueCheck = true;
	var	needToClearLines;
	var clearLines = [], howMuch=0;
	var lastFilledRow;
	
	//find out how many lines are filled
	for(i=21; i>0 && canContinueCheck; i--){
		needToClearLines = true;
		canContinueCheck = false;
		for(j=0;j<10;j++){
			if(g_gameBoard[j][i] == '0'){
				needToClearLines = false;
			} else if(g_gameBoard[j][i] != '0') {
				canContinueCheck = true;
				lastFilledRow=i;
			} 
		}
		if(needToClearLines){
			clearLines[howMuch]=i;
			howMuch++;
		}		
	}
	
	//clear the lines
	if(howMuch!=0){
		for(i=0;i<howMuch;i++){
			//fill the line with zeroes
			for(j=0;j<10;j++){
				g_gameBoard[j][clearLines[i]]='0';
			}
			//push down every element in clearLines array
			for(j=i+1;j<howMuch;j++){
				clearLines[j]++;
			}
			//push down whole g_gameBoard blocks
			for(y=clearLines[i];y>=lastFilledRow;y--){
				for(x=0;x<10;x++){
					g_gameBoard[x][y]=g_gameBoard[x][y-1];
				}
			}
		}
	}
	
	
}

//stops the game if g_gameBoard is filled to the top
function checkIfNotLost(){
	if(g_gameBoard[4][2] != '0' || g_gameBoard[5][2] != '0'){
		g_canRunGame = false; 
		fill(color(40,40,40,200));
		rect(0, 0, g_brdWidth, g_brdHeight);
		textSize(100);
		fill(200,0,0);
		text("Game Over!", 25, 300);
	}
}

//p5.js function
//sets g_canChangeDirections value to true
function keyPressed(){
	g_canChangeDirections=true;
}

//p5.js built-in function
//sets g_canPushDown to true when key is released
function keyReleased(){
	g_canPushDown = true;
}

//COPIES an array's elements to a different array
function copyArray(p_from, p_to, p_elements){
	var cop;
	for(i=0;i<p_elements;i++){
		cop=p_from[i];
		p_to[i]=cop;
	}
}

/*____________________FUNKCIJOS_____________________*/
/*--------------------------------------------------*/
//
//
//
//
//
/*--------------------------------------------------*/
/*_______________TESTAVIMO FUNKCIJOS________________*/

//draws elements of multidimensional array g_gameBoard
function t_drawGameBoard(){
	stroke(255);
	textSize(15);
	for(i=0;i<g_columns;i++){
		for(j=0;j<g_rows;j++){
			text(g_gameBoard[i][j],i*15, j*15 +15);
		}
	}
}

//draws all different square colors of the game
function t_drawSquares(){
	drawSquare(0,0,[204,204,0]);		//darkYellow		rgb(204,204,0) 		g_gameBoard color index - 1		square
	drawSquare(1,0,[255,140,0]);		//darkOrange		rgb(255,140,0) 		g_gameBoard color index - 2		plank
	drawSquare(2,0,[220,20,60]);		//crimsonRed 		rgb(220,20,60)		g_gameBoard color index - 3
	drawSquare(3,0,[148,0,211]);		//darkViolet		rgb(148,0,211)		g_gameBoard color index - 4
	drawSquare(4,0,[0,0,205]);			//darkBlue			rgb(0,0,139)		g_gameBoard color index - 5
	drawSquare(5,0,[0,191,255]);		//deepSkyBlue		rgb(0,191,255)		g_gameBoard color index - 6
	drawSquare(6,0,[0,128,0]);			//green				rgb(0,128,0)		g_gameBoard color index - 7
	
}

/*_______________TESTAVIMO FUNKCIJOS________________*/
/*--------------------------------------------------*/


var cellular1D = function cellular1D(){
    
    //Canvas
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight - 80;
    canvas.addEventListener("mousedown", flipSquareAndRecalculate);
    canvas.addEventListener("mouseup", restart);
    var animationRequest;

    //Squares
    var squaresPerRow = 60;
    var squareSide = canvas.width/squaresPerRow;
    var rows = Math.floor(canvas.height/squareSide);
    var xCoords = [];
    for(var i = 0; i < squaresPerRow; i++)
        { xCoords.push(i*squareSide); }
    //Fill/state colors
    var colorSwatch = ['black', 'white'];
    context.strokeStyle = 'green';

    //Cellular Automata Ruleset for Pattern Generation
    //Ruleset - each neighborhood permutation maps to one of 8 possible values 
    //named after joining all values in ruleset array and converting from binary
    // [7: 128, 6: 64, 5: 32, 4: 16, 3: 8, 2: 4, 1: 2, 0: 1]                 
    var ruleset;
    var ruleUI;
    inputToBinaryArray();
    //Update ruleset for user input if mouse is released
    document.getElementById('rulePicker').addEventListener('mouseup', inputToBinaryArray);
    //Convert base 10 input into a length 8 array of 1s, 0s to use as a ruleset
    function inputToBinaryArray(){
        ruleUI = document.getElementById('rulePicker').value;
        document.getElementById('ruleNumber').innerHTML = ruleUI;
        ruleset = [];
        for(var exp = 7; exp >= 0; exp--){
          if(ruleUI >= 2**exp){ 
              ruleset.push(1);
              ruleUI -= 2**exp;
          }else if(ruleUI < 2**exp){ 
              ruleset.push(0);
          }
        }       
    }

    //create a random 2-state array of objects representing the
    //row of squares initial condition & x-translation
    function initializeRow(){
        var initialRow = [];
        for(var i = 0; i < squaresPerRow; i++){
           var state = Math.round(Math.random());
           initialRow.push(state);
        }
        return initialRow;
    }

    //Figure out what the next row should look like based the one before it.
    function iterateRow(rowArray){
        var nextRow = [];
        nextRow.push(0);
        for(var i = 1; i < (squaresPerRow - 1); i++){
            var neighborhood = '' + rowArray[i - 1] + rowArray[i] + rowArray[i + 1];
            var rulesetIndex = parseInt(neighborhood, 2);
            nextRow.push(ruleset[rulesetIndex]);
        }
        //edge of row - may be updated to use different conditions
        nextRow.push(0);
        return nextRow;
    }

    //draw each square in row
    function drawRow(rowArray, rowIteration){
        for(var i = 0; i < squaresPerRow; i++){
            var x = xCoords[i];
            var y = rowIteration*squareSide;       
            //draw square
            context.fillStyle = colorSwatch[rowArray[i]];
            context.fillRect(x,y,squareSide, squareSide);
            context.strokeRect(x,y,squareSide, squareSide);
        }
    }

    //Switch the state of a clicked cell and update all following rows based on new condition.
    function flipSquareAndRecalculate(event){
        //Pause the animation when the mouse is down
        //was thinking this might make it move better -- don't see any difference
        window.cancelAnimationFrame(animationRequest);
        //get grid index from click location
        var x = event.pageX - canvas.offsetLeft - 0.5*squareSide;
        var y = event.pageY - canvas.offsetTop - 0.5*squareSide;
        var col = Math.round(x/squareSide); 
        var row = Math.round(y/squareSide); 
        //flip state at click location and redraw following squares
        grid[row][col] = grid[row][col] === 0 ? 1 : 0;
        
        grid.splice(row+1);

        for(var i = row; i < rows; i++){
            var inputRow = grid[i];
            var nextRow = iterateRow(inputRow);
            grid.push(nextRow);
        }
    }

    //Called on mouseup for canvas
    function restart(){
        animate_ca();
    }
    //Initialize grid to be drawn
    var grid = [];

    var inputRow = initializeRow();
    grid.push(inputRow);

    //draw first frame
    for(var i = 1; i < rows; i++){ 
        var nextRow = iterateRow(inputRow);
        grid.push(nextRow);
        var inputRow = nextRow; 
    }

    for(var i = 0; i < rows; i++){
        drawRow(grid[i], i);
    }

    var later = Date.now();
    var now;
    var elapsed;
    animate_ca();

    function animate_ca(){
        //update grid values
        now = Date.now();
        elapsed = now - later;
        
        animationRequest = window.requestAnimationFrame(animate_ca);

        if(elapsed > 150){
            
            var nextRow = iterateRow(grid[grid.length-1]); //wouldn't work with grid[rows] -- length of grid is going funny?
            grid.push(nextRow);
            grid.shift();

            //clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            //draw updated cell iterations
            for(var i = 0; i < grid.length; i++){
                drawRow(grid[i], i);
            }
            later = Date.now();
        }
    }
};

cellular1D();





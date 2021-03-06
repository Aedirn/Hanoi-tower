var gBrd = new Array();
var gOrig = new Array();
var gTops = new Array();
var gMag = new Array();

var gMagEnds = new Array("pb.gif", "bp.gif");

var gNumPoles;
var gGame, gWin;
var gImages = new Array("post.gif", "base.gif", "cap.gif",
	"1bp.gif", "2bp.gif", "3bp.gif", "4bp.gif", "5bp.gif", "6bp.gif", "7bp.gif", "8bp.gif", "9bp.gif", "10bp.gif",
	"1pb.gif", "2pb.gif", "3pb.gif", "4pb.gif", "5pb.gif", "6pb.gif", "7pb.gif", "8pb.gif", "9pb.gif", "10pb.gif"
);
var POST = 0,
	ORIG = 0,
	MIX = 1,
	RESET = 2,
	PLACING = 3,
	CAP = 2;
var gMoves = new Array();
var gSelected, gMaxDisks, gToPlace, gSolving, gDelay;



function preLoadImages() {
	tmp = new Array();

	for (var i = 0; i < preLoadImages.arguments.length; i++) {
		tmp[i] = new Image();
		tmp[i].src = preLoadImages.arguments[i];
	}
	return tmp;

}
var boo = preLoadImages(gImages);

function Move(from, to) {
	this.from = from;
	this.to = to;
}


function lift(c) {
	var num = gBrd[c][gTops[c]];
	var fromsrc = '' + num + gMagEnds[gMag[num]];

	gBrd[c][0] = gBrd[c][gTops[c]];

	document.getElementById("cellr-1c" + c).style.backgroundImage = "url(" + fromsrc + ")";
	document.getElementById("cellr-1c" + c).innerHTML = gMaxDisks - num + 1;
	document.getElementById("cellr" + gTops[c] + 'c' + c).style.backgroundImage = "url(" + gImages[POST] + ")";
	document.getElementById("cellr" + gTops[c] + 'c' + c).innerHTML = "&nbsp;";

	gBrd[c][gTops[c]] = 0;
	gTops[c]++;
	return;
}


function place(c) {
	var num, fromsrc;

	gBrd[c][--gTops[c]] = gBrd[gSelected][0];
	gBrd[gSelected][0] = 0;

	num = gBrd[c][gTops[c]];
	if (c != gSelected) gMag[num] = (gMag[num] + 1) % 2;
	fromsrc = '' + num + gMagEnds[gMag[num]];


	document.getElementById("cellr-1c" + gSelected).style.backgroundImage = "url(empty.gif)";
	document.getElementById("cellr-1c" + gSelected).innerHTML = "&nbsp;";
	document.getElementById("cellr" + gTops[c] + 'c' + c).style.backgroundImage = "url(" + fromsrc + ")";
	document.getElementById("cellr" + gTops[c] + 'c' + c).innerHTML = gMaxDisks - num + 1;

	return;
}


function handleClick(c) {
	document.getElementById("message").focus();
	if (gSolving)
		return;
	if (gGame == PLACING) {
		setOne(c);
		return;
	}
	clickAt(c, false);
	return;
}

function setOne(c) {
	gBrd[c][--gTops[c]] = gToPlace--;
	document.images[gTops[c] * gNumPoles + c].src = gImages[gBrd[c][gTops[c]]];
	if (!gToPlace) {
		finishSet();
		gGame = MIX;
	}
	return;
}


function clickAt(c, undoing) {
	var num;
	var old;
	if (gSelected < 0) {
		if (gTops[c] == gMaxDisks + 1)
			return;
		gSelected = c;
		lift(c);
		if (!gSolving)
			document.getElementById("message").innerHTML = "To Where?"
		return false;
	} else {
		if (gBrd[c][gTops[c]] < gBrd[gSelected][0] || ((gTops[c] <= gMaxDisks) && c != gSelected && gMag[gBrd[c][gTops[c]]] == gMag[gBrd[gSelected][0]])) {
			alert("Can't move there!!");
			return false;
		}
		num = gMaxDisks - gBrd[gSelected][0] + 1;
		place(c);
		if (c != gSelected)
			if (!undoing) {
				old = document.getElementById("moves" + num).innerHTML;
				if (old == '&nbsp;') old = 0;
				document.getElementById("moves" + num).innerHTML = (1 * old) + 1;

				old = document.getElementById("movesTot").innerHTML;
				if (old == '&nbsp;') old = 0;
				document.getElementById("movesTot").innerHTML = (1 * old) + 1;

				gMoves[gMoves.length] = new Move(gSelected, c);
			} else {
				old = document.getElementById("moves" + num).innerHTML;
				if (old == '&nbsp;') old = 0;
				document.getElementById("moves" + num).innerHTML = (old > 1) ? (1 * old) - 1 : '&nbsp;';
				old = document.getElementById("movesTot").innerHTML;
				document.getElementById("movesTot").innerHTML = (old > 1) ? ((1 * old) - 1) : '&nbsp;';

				gMoves.length--;
			}

		gSelected = -1;
		if (((c != 0) || (gGame == MIX)) && (gTops[c] == gWin)) {
			if (!gSolving)
				setTimeout('alert("Yeah!!!");', 300);
			clearTimeout(timeOutID);
			document.hanoiForm.solvbutt.value = "Computer Solve";
			gSolving = false;

			return false;
		}
		if (!gSolving)
			document.getElementById("message").innerHTML = "From Where?"
		return false;
	}
}

function unDo() {
	if (gSelected != -1) {
		clickAt(gSelected, false);
		return;
	}
	if (gMoves.length == 0) {
		alert("Nothing left to undo!!");
		return;
	}

	clickAt(gMoves[gMoves.length - 1].to, true);
	clickAt(gMoves[gMoves.length - 1].from, true);

}


function solve(numDisks, from, aux, to) {
	// move n-1 out of the way
	// move bottom most to target post
	/// move n-1 to target post
	if (numDisks == 0)
		return;
	solve(numDisks - 1, from, to, aux);
	gMoves[gMoves.length] = new Move(from, to);
	solve(numDisks - 1, aux, from, to);

}

var timeOutID;

function playSolution(num) {

	clickAt(gMoves[num].from);
	clickAt(gMoves[num].to);
	num++;

	if (gSolving)
		timeOutID = setTimeout("playSolution(" + num + ")", 500 * gDelay);
	return;
}


function solveMixed() {
	var from, to, num, m1, m2, oneTo, lastTo;
	var moves = new Array();

	// where is disk one?
	for (var i = 0; i < 3; i++) {
		if (gBrd[i][gTops[i]] == 1)
			from = i;
	}

	m1 = (from + 1) % 3;
	m2 = (from + 2) % 3;

	if (gTops[from] == gWin) {
		solve(gMaxDisks, from, m1, m2);
		return;
	}
	if ((gTops[m2] - 2 == gWin) || (gTops[m1] - 2 == gWin)) {
		from = (gTops[m2] - 2 == gWin) ? m2 : m1;
		to = (gTops[m2] - 2 == gWin) ? m1 : m2;
	} else
		to = m1;

	if ((gBrd[m1][gTops[m1]] % 2) // avoid odd on odd
		||
		(((gBrd[from][gTops[from] + 1] % 2) == 0) // or next move even on even
			&&
			((gBrd[m2][gTops[m2]] < 100) &&
				((gBrd[m2][gTops[m2]] % 2) == 0))) ||
		((gTops[from] == (gMaxDisks - 1)) // or wasteful next move cause would
			&&
			(gTops[m2] == gMaxDisks + 1))) { // shift not really move it

		to = m2;
	}


	for (var i = 0; i < 3; i++)
		if ((i != from) && (gTops[i] - 1 == gWin))
			to = i;

	oneTo = to;
	lastTo = to;

	while (gTops[lastTo] != gWin) {

		moves[moves.length] = new Move(from, to);
		gBrd[to][--gTops[to]] = gBrd[from][gTops[from]++];
		// find next smallest
		lastTo = to;
		m1 = (to + 1) % 3;
		m2 = (to + 2) % 3;
		if ((gBrd[m1][gTops[m1]]) && (gBrd[m1][gTops[m1]] < gBrd[m2][gTops[m2]])) {
			from = m1;
			to = m2;
		} else {
			from = m2;
			to = m1;
		}


		if (gBrd[from][gTops[from]] == 1) {
			m1 = (from + 1) % 3;
			m2 = (from + 2) % 3;
			to = m1;

			if ((gBrd[m1][gTops[m1]] % 2) // avoid odd on odd
				||
				(((gBrd[from][gTops[from] + 1] % 2) == 0) // or next move even on even
					&&
					((gBrd[m2][gTops[m2]] < 100) &&
						((gBrd[m2][gTops[m2]] % 2) == 0))) ||
				((gTops[from] == (gMaxDisks - 1)) // or wasteful next move cause would
					&&
					(gTops[m2] == gMaxDisks + 1))) { // shift not really move it
				to = m2;
			}
			for (var i = 0; i < 3; i++)
				if ((i != from) && (gTops[i] - 1 == gWin))
					to = i;
		}
	}
	setGame(RESET);
	for (var i = 0; i < moves.length; i++)
		gMoves[i] = new Move(moves[i].from, moves[i].to);

}

function doSolve() {
	if (gSolving) {
		clearTimeout(timeOutID);
		gSolving = false;
		document.hanoiForm.solvbutt.value = "Computer Solve"
		return;
	}
	gSolving = true;
	setGame(RESET);
	document.getElementById("message").innerHTML = "solving.....";
	document.hanoiForm.solvbutt.value = "Stop Solving"
	if (gGame == MIX)
		solveMixed();
	else
		solve(gMaxDisks, 0, 1, 2);
	playSolution(0);

}




function displayBoard() {
	var num;
	for (var r = 0; r < gMaxDisks + 1; r++) {
		for (var c = 0; c < gNumPoles; c++) {
			num = gBrd[c][r];
			if (num != POST) {
				document.getElementById('cellr' + r + 'c' + c).style.backgroundImage = "url(" + num + gMagEnds[gMag[num]] + ")";
				document.getElementById('cellr' + r + 'c' + c).innerHTML = gMaxDisks - num + 1;
			} else {
				document.getElementById('cellr' + r + 'c' + c).style.backgroundImage = (r != 0) ? "url(post.gif)" : "url(cap.gif)";
			}

		}
	}
}

function clearBoard() {

	for (var i = 0; i < gMaxDisks + 1; i++)
		for (var j = 0; j < gNumPoles; j++)
			gBrd[j][i] = 0;
	for (j = 0; j < gNumPoles; j++) {
		gBrd[j][gMaxDisks + 1] = 100;
		gTops[j] = gMaxDisks + 1;
	}

	document.hanoiForm.solvbutt.value = "Computer Solve"

}


function placeEm() {

	clearBoard();
	displayBoard();
	gGame = PLACING;
	gToPlace = gMaxDisks;
	document.getElementById("message").innerHTML = "Click to place!!"


}

function finishSet() {
	var i, j;

	for (j = 0; j < gNumPoles; j++) {
		gTops[j] = 0;
		for (i = 0; i < gMaxDisks + 1; i++) {
			if (!gBrd[j][i])
				gTops[j]++;
		}
	}

	gWin = 1;

	displayBoard();
	gMoves.length = 0;
	for (i = 0; i < 9; i++) {
		for (j = 0; j < gNumPoles; j++)
			gOrig[j][i] = gBrd[j][i];
	}
	document.getElementById("message").innerHTML = "From Where?"
	gSelected = -1;

}



function setGame(type) {
	var i, j, tmp;

	buildBoard();
	if (type == RESET) {
		for (var i = 0; i < gMaxDisks + 1; i++) {
			for (var j = 0; j < gNumPoles; j++)
				gBrd[j][i] = gOrig[j][i];
		}
		for (i = 1; i <= gMaxDisks; i++) {
			gMag[i] = 0;
		}
	} else {
		for (i = 0; i < gNumPoles; i++) {
			gBrd[i] = new Array();
			gOrig[i] = new Array();
		}
	}
	if (type == ORIG) {
		clearBoard();
		for (i = 1; i <= gMaxDisks; i++) {
			gBrd[0][i] = i;
			gMag[i] = 0;
		}
		gGame = 0;
	}
	if (type == MIX) {
		clearBoard();
		for (i = gMaxDisks; i > 0; i--) {
			tmp = Math.floor(Math.random() * gNumPoles);
			gBrd[tmp][--gTops[tmp]] = i;
		}
		gGame = MIX;
	}

	finishSet();

}

function buildBoard() {
	var toSay, r, c;
	toSay = '<table  border="0" cellspacing="0" cellpadding="0">';
	toSay += '<caption><div id="message" style="border:0px;"></div></caption>';
	for (r = -1; r < (gMaxDisks + 1); r++) {
		toSay += '<tr>';
		for (c = 0; c < gNumPoles; c++) {
			if (r > -1)
				toSay += '<td class="celltd"  id="cellr' + r + 'c' + c + '" onclick = "javascript:this.blur();handleClick(' + c + ');">&nbsp;</td>';
			else
				toSay += '<td class="celltd"  id="cellr' + r + 'c' + c + '" onclick = "javascript:this.blur();handleClick(' + c + ');">&nbsp;</td>';
		}
		toSay += '</tr>';
	}
	toSay += '<tr>';
	for (c = 0; c < gNumPoles; c++) {
		toSay += '<td onclick = "javascript:this.blur();handleClick(' + c + ');"><img src="base.gif"></td>';
	}
	toSay += '</tr>';
	toSay += '</table>';

	document.getElementById("brdDiv").innerHTML = toSay;

	toSay = '<table  border=1 cellspacing=0 cellpadding=0>';
	toSay += '<tr><th>Disk Number</th>';
	for (r = 1; r < (gMaxDisks + 1); r++) {
		toSay += '<th>&nbsp;&nbsp;&nbsp;' + r + '&nbsp;&nbsp;&nbsp;</th>';
	}
	toSay += '<th style="background-color:skyblue;">&nbsp;Sum&nbsp;</th>';
	toSay += '</tr><tr><th>&nbsp;Number of Moves&nbsp;</th>';
	for (r = 1; r < (gMaxDisks + 1); r++) {
		toSay += '<td class="moves" id="moves' + r + '">&nbsp;</td>';
	}
	toSay += '<td class="movesTot" id="movesTot">&nbsp;</td>';

	toSay += '</tr></table>';

	document.getElementById("numMovesDiv").innerHTML = toSay;

}


function newGame() {
	gMaxDisks = 1 * document.hanoiForm.maxDisks.options[document.hanoiForm.maxDisks.selectedIndex].value;
	//	gNumPoles = 1 * document.hanoiForm.numpoles.options[document.hanoiForm.numpoles.selectedIndex].value ;
	gNumPoles = 3;
	//	gDelay = document.hanoiForm.delay.options[document.hanoiForm.delay.selectedIndex].value ;

	//	document.getElementById("solveDiv").style.display = (gNumPoles == 4) ? 'none' : 'block';

	setGame(ORIG);
}


function showHideInstrDiv() {
	var div = document.getElementById("puzzleInstrDiv");
	var vis = div.style.display != 'none';

	div.style.display = (vis) ? 'none' : 'block';
	document.getElementById("showHideButt").value = (vis) ? "Show Instructions" : "Hide Instructions";
	document.getElementById("showHideButt").blur();

}

// -->

/** HTMLCEPTION EDITOR
* This is a text editor.
* It allows one to write html on a website.
* 'nuff said.
*/

var visual_dy = -600.0;

var line = [""];
var line_number = 0;
var column_number = 0;
var keyboard_pressed = {};
var keyboard_releaseTimer = {};

var key_shift_conversion = {};
var key_escape_conversion = {};
var key_conversion = {};

var specialkey_code = [];

var autoIndent = true;
var tabDepth = []; // For auto indentation
tabDepth[0] = 0;

var useTextures = true;

function initialize() {
	console.log("STARTED EDITOR");
	initKeyboard();

	requestAnimationFrame(loop);
}

function initKeyboard() {
	// WHY DID I MANUALLY TYPE THESE IN
	specialkey_code["backspace"] = 8;
	specialkey_code["alt"] = 18;
	specialkey_code["control"] = 17;
	specialkey_code["shift"] = 16;
	//specialkey_code["tab"] = 9;
	specialkey_code["enter"] = 13;
	specialkey_code["left"] = 39;
	specialkey_code["right"] = 37;
	specialkey_code["up"] = 38;
	specialkey_code["down"] = 40;
	
	// non-alphabetical keycode conversions
	key_conversion[186] = ";";
	key_conversion[188] = ",";
	key_conversion[190] = ".";
	key_conversion[191] = "/";
	key_conversion[222] = "'";
	key_conversion[219] = "[";
	key_conversion[220] = "\\";// Escaped
	key_conversion[221] = "]";
	key_conversion[189] = "-";
	key_conversion[187] = "=";
	key_conversion[9] = "	";// Tab
	key_conversion[192] = "`";
	
	
	// key shift convversions:
	key_shift_conversion["1"] = "!";
	key_shift_conversion["2"] = "@";
	key_shift_conversion["3"] = "#";
	key_shift_conversion["4"] = "$";
	key_shift_conversion["5"] = "%";
	key_shift_conversion["6"] = "^";
	key_shift_conversion["7"] = "&";
	key_shift_conversion["8"] = "*";
	key_shift_conversion["9"] = "(";
	key_shift_conversion["0"] = ")";
	key_shift_conversion["-"] = "_";
	key_shift_conversion["="] = "+";
	key_shift_conversion["/"] = "?";
	key_shift_conversion[";"] = ":";
	key_shift_conversion["'"] = '"';
	key_shift_conversion[","] = "<";
	key_shift_conversion["."] = ">";
	key_shift_conversion["`"] = "~";
	key_shift_conversion["\\"] = "|";
	// HTML Escape Character Conversion
	key_escape_conversion[" "] = "&nbsp;";
	key_escape_conversion["<"] = "&lt;";
	key_escape_conversion[">"] = "&gt;";
	key_escape_conversion['"'] = "&quot;"
	key_escape_conversion["&"] = "&amp;";
	key_escape_conversion["	"] = "&nbsp;&nbsp;&nbsp;&nbsp;";
	//key_escape_conversion["<"] = "&#32;";
	var reader = new FileReader();
	var text;
	reader.onload = function(e) {
		var text = reader.result;
		//console.log(text);
	}
	reader.readAsText(new File([""],"template.html"), "UTF-8");

	//console.log(reader.text);


	addEventListener('keydown',
		function(e) {
			e.preventDefault();
			keyboard_pressed[e.keyCode] = true;
		}
	, false);

    addEventListener('keyup', 
		function(e) {
			e.preventDefault();
			keyboard_pressed[e.keyCode] = false;
		}
	, false);
}

/*
function handleKeyboardTimer() {
	for(var index in keyboard_releaseTimer) {
		keyboard_releaseTimer[index] --;
		if (keyboard_releaseTimer[index] < 0) {
			keyboard_releaseTimer[index] = 0;
		}
	}
}
*/

function loop() {
	//handleKeyboardTimer();
	addKey();
	updateEditorText();
	updateHTMLText();
	cap_column_and_line();
	for(var index in keyboard_pressed) {
		if (!contains([specialkey_code["shift"]], index)) {
			keyboard_pressed[index] = false;
		}
	}
	setGlobalsFromDocument();
	animation();
	requestAnimationFrame(loop);
}

function setGlobalsFromDocument() {
	autoIndent = document.getElementById("checkbox_autoIndent").checked;
	useTextures = document.getElementById("checkbox_textures").checked;
}

function animation() {
	if (document.getElementById('checkbox_animations').checked) {
		// IF ANIMATIONS ARE CHECKED
		document.getElementById('div_main').setAttribute('style', "position: relative; top: " + (visual_dy) + "px;");
		visual_dy *= 0.94;
	} else {
		// ELSE SET TO STATIC
		visual_dy = 1;
		document.getElementById('div_main').setAttribute('style', "position: relative; top: " + (visual_dy) + "px;");
	}
}

///// TEXT NAVIGATION HANDLING /////

function new_line() {
	console.log("NEWLINE");
	line_number++;// = line.length - 1;

	for(var i = line.length; i > line_number ; i--) {
		line[i] = line[i - 1];
	}

	
	line[line_number] = line[line_number - 1].slice(column_number + 1);
	line[line_number - 1] = line[line_number - 1].slice(0, column_number + 1);
	
	if (autoIndent) {
		tabDepth[line_number] = tabDepth[line_number - 1];
		for(var i = 0; i < tabDepth[line_number]; i++) {
			line[line_number] += key_conversion[9];// TAB
		}
	
	// You could remove this one...
	column_number = startTabWidth() - 1;//line[line_number].length - 1;
	}
}

function startTabWidth() {
	return tabDepth[line_number] * key_conversion[9].length;
}

function cap_column_and_line() {
	// Cap off line number
	if (line_number < 0) {
		line_number = 0;
	} else if (line_number >= line.length) {
		line_number = line.length - 1;
		column_number = line[line_number].length - 1;
	}
	// Cap off column number
	//console.log(line_number);
	if (column_number >= line[line_number].length) {
		if (line_number < line.length - 1) {
			column_number = -1;
			line_number ++;
		} else {
			column_number = line[line_number].length - 1;
		}
	} else if (column_number < -1) {
		if (line_number > 0) {
			line_number--;
			column_number = line[line_number].length - 1;
		} else {
			column_number = -1;
		}

	}
}

function move_column(increment) {
	column_number += increment;
	cap_column_and_line();
}

function move_line(increment) {
	line_number += increment;
	cap_column_and_line();
}

///// TEXT EDITING HANDLING /////
function addKey() {
	for(var key in keyboard_pressed) {
		if (keyboard_pressed[key]) {
			if (!contains(specialkey_code,key)) {
				var tempChar = formatCharacter(keyCodeToChar(key));

				/// AutoIndent Checking
				if (autoIndent) {
					if (line[line_number].length == startTabWidth()) {
						if (tempChar == key_conversion[9]) {
							tabDepth[line_number] ++;
						}
					}
				}
				column_number+= tempChar.length;
				line[line_number] = 
					line[line_number].slice(0, column_number) + 
					tempChar +
					line[line_number].slice(column_number);
				//console.log(line[line_number]);
			} else {
				// FUNCTION KEYS
				if (key == specialkey_code["backspace"]) {
					backspace();
				} else if (key == specialkey_code["left"]) {
					move_column(1);
				} else if (key == specialkey_code["right"]) {
					move_column(-1);
				} else if (key == specialkey_code["up"]) {
					move_line(-1);
				} else if (key == specialkey_code["down"]) {
					move_line(1);
				} else if (key == specialkey_code["enter"]) {
					new_line();
				} 
			}
		}
	}
}

function backspace() {
	// Tab Control
	if (autoIndent) {
		if ((column_number != -1) && (column_number == startTabWidth())) {
			tabDepth[line_number] --;
		}
	}

	if (column_number != -1) {//(line[line_number].length != 0) {
		line[line_number] = (line[line_number].slice(0,column_number))
			.concat(line[line_number].slice(column_number + 1));
		column_number--;
	} else {
		if (line_number >= 1) {// Must have at least 1 line
			column_number = line[line_number - 1].length - 1;
			line[line_number - 1] += line[line_number];
			line.splice(line_number, 1);
			line_number --;
			//column_number = line[line_number].length - 1;// Sets to end of line
		}
	}
}

function addText(string) {
	lines = string.split("\n");
	currentLineStart = line[line_number].slice(0, column_number + 1);
	currentLineEnd = line[line_number].slice(column_number + 1, line[line_number].length);
	line[line_number] = currentLineStart + lines[0];

	// Shifts stuff over	
	for(var i = line.length - 1; i > line_number; i--) {
		line[i + lines.length] = line[i];
	}

		for(var i = 1; i < lines.length; i++) {
			line[i + line_number] = lines[i];
		}
	//line[lines.length + line_number - 2] += currentLineEnd;

	line_number += lines.length;
}

function addButton() {
	addText("<button> This is a button! </button>");
}

function addHtmlExample() {
	text = "<h1> This is bad! </h1> \n    But at least <b>it works!</b> \n    <center>\n        This <br>\n        Is Centered\n    </center>";
	addText(text);
}

///// RENDERING HANDLING /////
function formatText() {
	var lineCopy = line.slice();
	// Highlighted Type thing
	var label_highlight_start = '<span style="background-color: #FFFF00">'
	var label_highlight_end = '</span>'

	var output = "";
	for(var i = 0; i < lineCopy.length; i++) {
		lineCopy[i] += " ";
		for(var j = 0; j < lineCopy[i].length; j++) {
			var character = lineCopy[i].charAt(j);	
			if (line_number == i) {
				if (column_number + 1 == j) {
					output += label_highlight_start;
				}
			}
			if (containsArray(Object.keys(key_escape_conversion), character)) {
				output += key_escape_conversion[character];
			} else {
				output += character;
			}
			if (line_number == i) {
				if (column_number + 1 == j) {
					output += label_highlight_end;
				}
			}
		}
/*		if (i == line_number) {
			//console.log(i);
			var temp_line = formatLineForEscapeCharacters(line[i]);
			output = output + temp_line.slice(0, column_number + 1) + "|" + temp_line.slice(column_number + 1);
			/*output = output 
			+ line[i].slice(0, column_number) 
			+ label_highlight_start 
			+ line[i].charAt(column_number) 
			+ label_highlight_end
			+ line[i].slice(column_number + 1);
			*/
		/*} else {
			output = output + line[i];
		}*/
		output = output + " <br> "
	}
	return output;
}

function formatCharacter(character) {
	character = character.toLowerCase();
	// Special keys
	for(var key in keyboard_pressed) {
		if (keyboard_pressed[key]) {
			// Shift conversion
			if (key == specialkey_code["shift"]) {
				//console.log("SHIFTYYYY");
				if (containsArray(Object.keys(key_shift_conversion), character)) {
					character = key_shift_conversion[character];
				} else {
					character = character.toUpperCase();
				}
			}
		}
	}
	
	
	return character;
}

function formatLineForEscapeCharacters(input) {
	var output_line = input.slice();
	for(var i = 0; i < output_line.length; i++) {
		var character = output_line.charAt(i);
		if (containsArray(Object.keys(key_escape_conversion), character)) {
			character = key_escape_conversion[character];
			output_line.replace
		}
	}
	return output_line;
}

function updateEditorText() {
	 document.getElementById("textdisplay").innerHTML = formatText();
}

function formatTextForHTML() {
	var output = "";
	for(var i = 0; i < line.length; i++) {
		output += line[i];
	}
	return output;
}

function updateHTMLText() {
	document.getElementById("htmldisplay").innerHTML = formatTextForHTML();
}

/// FILE LOADING FUNCTIOSN ///
function readTextFile(directory) {
	var f = new File([""], directory);
	
	var r = new FileReader();
	r.onload = function(e) { 
		var contents = e.target.result;
		alert( "Got the file.\n" 
			+"name: " + f.name + "\n"
			+"type: " + f.type + "\n"
			+"size: " + f.size + " bytes\n"
			+ "starts with: " + contents.substr(1, contents.indexOf("n"))
		);
		return contents;
	}
	return r.readAsText(f);
}


function keyCodeToChar(code) {
	if (containsArray(Object.keys(key_conversion), code)) {
		return key_conversion[code];
	} else {
		return String.fromCharCode(code);
	}
}

/// TEXT FILE WRITING ///
var textFile = null,
  makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
};


/// MISCELANEOUS MATH STUFF ///
function contains(array, value) {
	for(var key in array) {
		if (array[key] == value) {
			return true;
		}
	}
	return false;
}

function containsArray(array, value) {
	for(var i = 0; i < array.length; i++) {
		if (array[i] == value) {
			return true;
		}
	}
	return false;
}

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}
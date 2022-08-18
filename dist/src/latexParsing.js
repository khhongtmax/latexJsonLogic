"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenVar = exports.ParsingPlus = void 0;
const ParsingPlus = (input) => {
    let plusTree = null;
    let plusTerm = new Array(); //'+' 기준으로 분리된 식
    var isTimes = false;
    let opList = new Array(); //'+' 갯수 대로 저장
    var bracket = new Array(); // 괄호 판단용 스택
    var start = 0; // 식 분리용 구분자
    for (var i = 0; i < input.length; i++) {
        //////////// 괄호 바깥 '+' 기준 식 분리 //////////////////
        if (input[i] === "(" || input[i] === "{") {
            //////////// 괄호 판단 //////////////////
            bracket.push(input[i]);
        }
        if (input[i] === ")") {
            bracket.pop();
        }
        if (input[i] === "}") {
            bracket.pop();
        }
        ////////////////////////////////
        if (input[i] === "+" && bracket.length === 0) {
            opList.push(input[i]);
            plusTerm.push(input.slice(start, i));
            start = i + 1;
        }
        else if (input[i] === "-" && bracket.length === 0) {
            if (i > 6) {
                if (input.slice(i - 6, i) === "\\times") {
                    isTimes = true;
                }
            }
            if (!isTimes) {
                opList.push(input[i]);
                plusTerm.push(input.slice(start, i));
                start = i;
            }
            isTimes = false;
        }
    }
    if (opList.length === 0) {
        //////////// '+' 로 분리 불가 식 처리 //////////////////
        return { "+": [ParsingTimes(input)] };
    }
    else {
        //////////// '+' 식 tree 구성 //////////////////
        plusTerm.push(input.slice(start));
        var plusTermList = new Array();
        for (var i = 0; i < plusTerm.length; i++) {
            if (plusTerm[i] !== "") {
                plusTermList.push(ParsingTimes(plusTerm[i]));
            }
        }
        return { "+": plusTermList };
    }
};
exports.ParsingPlus = ParsingPlus;
const ParsingTimes = (input) => {
    let timesTree = null;
    let timesTerm = new Array(); //'\times,괄호,변수' 기준으로 분리된 식
    let opList = new Array(); //'*' 갯수 대로 저장
    var bracket = new Array(); // 괄호 판단용 스택
    var start = 0; // 식 분리용 구분자
    for (var i = 0; i < input.length - 1; i++) {
        //////////// 괄호 바깥 '+' 기준 식 분리 //////////////////
        if (input[i] === "(" || input[i] === "{") {
            //////////// 괄호 판단 //////////////////
            bracket.push(input[i]);
        }
        if (input[i] === ")") {
            bracket.pop();
        }
        if (input[i] === "}") {
            bracket.pop();
        }
        ////////////////////////////////
        if (bracket.length === 0) {
            ///////////////// 괄호 바깥 //////////////////////
            if (input[i] === "\\") {
                ///////////////// \\ 구분자 만났을 때 //////////////////////
                if (input.slice(i, i + 6) === "\\times") {
                    ///////////////// 곱하기 기호 기준 분리 //////////////////////
                    opList.push("*");
                    timesTerm.push(input.slice(start, i));
                    start = i + 6;
                    i = i + 6;
                }
                else if (input.slice(i, i + 5) === "\\frac" ||
                    input.slice(i, i + 5) === "\\sqrt") {
                    ///////////////// 분수,근호 기준 분리 //////////////////////
                    opList.push("*");
                    timesTerm.push(input.slice(start, i));
                    var startbracket = i + 5;
                    let fracBracket = new Array();
                    var numBracket = 0;
                    fracBracket.push(input[startbracket]);
                    for (var j = i + 6; j < input.length; j++) {
                        if (input[j] === "}" || input[j] === "]") {
                            fracBracket.pop();
                        }
                        if (input[j] === "{" || input[j] === "[") {
                            fracBracket.push(input[j]);
                        }
                        if (fracBracket.length === 0) {
                            numBracket++;
                        }
                        if (numBracket === 2) {
                            break;
                        }
                    }
                    start = i;
                    i = j - 1;
                }
                else if (input.slice(i, i + 4) === "\\div") {
                    ///////////////// 나누기 기준 분리 //////////////////////
                    opList.push("*");
                    var expStart = i - 1;
                    var expEnd = i + 4;
                    var frontBracket = new Array();
                    var backBracket = new Array();
                    if (input[i - 1] === "}" || input[i - 1] === ")") {
                        frontBracket.push(input[i - 1]);
                        for (var j = i - 2; j > start; j--) {
                            if (input[j] === "{" || input[j] === "(") {
                                frontBracket.pop();
                            }
                            if (input[j] === "}" || input[j] === ")") {
                                frontBracket.push(input[j]);
                            }
                            if (frontBracket.length === 0) {
                                break;
                            }
                        }
                        expStart = j;
                    }
                    else if (input[i - 1].match(/[0-9]/)) {
                        var j = i - 2;
                        while (input[j].match(/[0-9]/)) {
                            if (j === 0) {
                                break;
                            }
                            j--;
                        }
                        expStart = j;
                    }
                    if (input[i + 4] === "{") {
                        backBracket.push("{");
                        for (var j = expEnd + 1; j < input.length - i; j++) {
                            if (input[j] === "}" || input[j] === "]") {
                                backBracket.pop();
                            }
                            if (input[j] === "{" || input[j] === "[") {
                                backBracket.push(input[j]);
                            }
                            if (backBracket.length === 0) {
                                break;
                            }
                        }
                        expEnd = j;
                    }
                    timesTerm.push(input.slice(start, expStart));
                    start = expStart;
                    i = expEnd;
                }
                else if (input.slice(i, i + 4) === "\\dot") {
                    ///////////////// 순환 소수 기준 분리 //////////////////////
                    opList.push("*");
                    var dotStart = i - 1;
                    var dotEnd = i + 4;
                    var frontBracket = new Array();
                    var backBracket = new Array();
                    if (input[i - 2].match(/[0-9]/)) {
                        var j = i - 2;
                        while (input[j].match(/[0-9]/) || input[j].match(/\./)) {
                            if (j === 0) {
                                break;
                            }
                            j--;
                        }
                        dotStart = j;
                    }
                    if (input[i + 4].match(/[0-9]/)) {
                        var k = i + 4;
                        while (!input[k].match(/[a-zA-Z]/) || input[k] !== "(" || input[k] !== "{") {
                            if (k === input.length - 1) {
                                break;
                            }
                            if (input[k] === "\\") {
                                if (input[k + 1] !== "d" && input[k + 2] !== "o") {
                                    break;
                                }
                            }
                            k++;
                        }
                        dotEnd = k;
                    }
                    timesTerm.push(input.slice(start, dotStart));
                    start = dotStart;
                    i = dotEnd - 1;
                }
            }
            else if (input[i] === "^") {
                ///////////////// 제곱 기준 분리 //////////////////////
                opList.push("*");
                var expStart = i - 1;
                var expEnd = i + 1;
                var frontBracket = new Array();
                var backBracket = new Array();
                if (input[i - 1] === "}" || input[i - 1] === ")") {
                    frontBracket.push(input[i - 1]);
                    for (var j = i - 2; j > start; j--) {
                        if (input[j] === "{" || input[j] === "(") {
                            frontBracket.pop();
                        }
                        if (input[j] === "}" || input[j] === ")") {
                            frontBracket.push(input[j]);
                        }
                        if (frontBracket.length === 0) {
                            break;
                        }
                    }
                    expStart = j;
                }
                else if (input[i - 1].match(/[0-9]/)) {
                    var j = i - 2;
                    while (input[j].match(/[0-9]/)) {
                        if (j === 0) {
                            break;
                        }
                        j--;
                    }
                    expStart = j;
                }
                if (input[i + 1] === "{") {
                    backBracket.push("{");
                    for (var j = expEnd + 1; j < input.length - i; j++) {
                        if (input[j] === "}" || input[j] === "]") {
                            backBracket.pop();
                        }
                        if (input[j] === "{" || input[j] === "[") {
                            backBracket.push(input[j]);
                        }
                        if (backBracket.length === 0) {
                            break;
                        }
                    }
                    expEnd = j;
                }
                timesTerm.push(input.slice(start, expStart));
                start = expStart;
                i = expEnd;
            }
            else if (input[i] === ")" || input[i] === "}") {
                ///////////////// 괄호-괄호/괄호-문자 분리 //////////////////////
                if (i < input.length - 1) {
                    if (input[i + 1] === "(" || input[i + 1] === "{") {
                        opList.push("*");
                        timesTerm.push(input.slice(start, i + 1));
                        start = i + 1;
                    }
                    else if (input[i + 1].match(/[a-z]/)) {
                        opList.push("*");
                        timesTerm.push(input.slice(start, i + 1));
                        start = i + 1;
                    }
                }
            }
            else if (input[i].match(/[a-z]/)) {
                ///////////////// 문자-괄호 분리 //////////////////////
                var backBracket = new Array();
                var nomalEnd = i + 1;
                var nomalStart = i + 1;
                if (input[i + 1] === "(" || input[i + 1] === "{") {
                    opList.push("*");
                    backBracket.push("{");
                    for (var j = nomalEnd + 1; j < input.length - i; j++) {
                        if (input[j] === "}" || input[j] === ")") {
                            backBracket.pop();
                        }
                        if (input[j] === "{" || input[j] === "(") {
                            backBracket.push(input[j]);
                        }
                        if (backBracket.length === 0) {
                            break;
                        }
                        nomalEnd = j;
                    }
                    timesTerm.push(input.slice(start, nomalStart));
                    start = nomalStart;
                    i = nomalEnd;
                }
                if (input[i + 1].match(/[a-z]/)) {
                    ///////////////// 문자 - 문자 분리 //////////////////////
                    opList.push("*");
                    timesTerm.push(input.slice(start, i + 1));
                    start = i + 1;
                }
            }
            else if (input[i].match(/[0-9]/)) {
                ///////////////// 숫자-문자/숫자-괄호 분리 //////////////////////
                var backBracket = new Array();
                var nomalEnd = i + 1;
                var nomalStart = i + 1;
                if (input[i + 1] === "(" || input[i + 1] === "{") {
                    opList.push("*");
                    backBracket.push("{");
                    for (var j = nomalEnd + 1; j < input.length - i; j++) {
                        if (input[j] === "}" || input[j] === ")") {
                            backBracket.pop();
                        }
                        if (input[j] === "{" || input[j] === "(") {
                            backBracket.push(input[j]);
                        }
                        if (backBracket.length === 0) {
                            break;
                        }
                        nomalEnd = j;
                    }
                    timesTerm.push(input.slice(start, nomalStart));
                    start = nomalStart;
                    i = nomalEnd;
                }
                else if (input[i + 1].match(/[a-z]/)) {
                    opList.push("*");
                    timesTerm.push(input.slice(start, i + 1));
                    start = i + 1;
                }
            }
            else if (input[i] === "-") {
                if (input[i + 1] === "(" || input[i + 1] === "{" || input[i + 1].match(/[a-z]/)) {
                    opList.push("*");
                    timesTerm.push(input.slice(start, i + 1));
                    start = i + 1;
                }
            }
        }
    }
    if (opList.length === 0) {
        //////////// '*' 로 분리 불가 식 처리 //////////////////
        timesTerm.push(input);
        var timesTermList = new Array();
        for (var i = 0; i < timesTerm.length; i++) {
            if (timesTerm[i] !== "") {
                if (timesTerm[i].slice(0, 5) === "\\frac") {
                    GenFrac(timesTerm[i]);
                }
                else if (timesTerm[i].slice(0, 5) === "\\sqrt") {
                    timesTermList.push(GenSqrt(timesTerm[i]));
                }
                else if (DeterminBracket(timesTerm[i], "^") === true) {
                    timesTermList.push(GenPow(timesTerm[i]));
                }
                else if (DeterminBracket(timesTerm[i], "\\div") === true) {
                    timesTermList.push(GenDiv(timesTerm[i]));
                }
                else if (timesTerm[i].length > 1 &&
                    (timesTerm[i][0] === "(" || timesTerm[i][0] === "{")) {
                    timesTerm[i] = timesTerm[i].slice(1, -1);
                    timesTermList.push((0, exports.ParsingPlus)(timesTerm[i]));
                }
                else {
                    timesTermList.push((0, exports.GenVar)(timesTerm[i]));
                }
            }
        }
        return { "*": [timesTermList[0]] };
    }
    else {
        //////////// '*' 식 tree 구성 //////////////////
        timesTerm.push(input.slice(start));
        var timesTermList = new Array();
        for (var i = 0; i < timesTerm.length; i++) {
            if (timesTerm[i] !== "") {
                if (timesTerm[i].slice(0, 5) === "\\frac") {
                    timesTermList.push(GenFrac(timesTerm[i]));
                }
                else if (timesTerm[i].slice(0, 5) === "\\sqrt") {
                    timesTermList.push(GenSqrt(timesTerm[i]));
                }
                else if (DeterminBracket(timesTerm[i], "^") === true) {
                    timesTermList.push(GenPow(timesTerm[i]));
                }
                else if (DeterminBracket(timesTerm[i], "\\div") === true) {
                    timesTermList.push(GenDiv(timesTerm[i]));
                }
                else if (timesTerm[i].length > 1 &&
                    timesTerm[i].length > 1 &&
                    (timesTerm[i][0] === "(" || timesTerm[i][0] === "{")) {
                    timesTerm[i] = timesTerm[i].slice(1, -1);
                    timesTermList.push((0, exports.ParsingPlus)(timesTerm[i]));
                }
                else {
                    timesTermList.push((0, exports.GenVar)(timesTerm[i]));
                }
            }
        }
        return { "*": timesTermList };
    }
};
const DeterminBracket = (termInput, splitChar) => {
    var bracket = new Array();
    var splitCharPos = 0;
    if (termInput[0] === "{" || termInput[0] === "(") {
        bracket.push(termInput[0]);
        for (var i = 1; i < termInput.length; i++) {
            if (termInput[i] === "{" || termInput[i] === "(") {
                bracket.push(termInput[i]);
            }
            else if (termInput[i] === "}" || termInput[i] === ")") {
                bracket.pop();
            }
            if (bracket.length === 0) {
                splitCharPos = i + 1;
                break;
            }
        }
        if (termInput.slice(splitCharPos, splitCharPos + splitChar.length) ===
            splitChar) {
            return true;
        }
    }
    else if (termInput[0].match(/[a-z]/)) {
        if (termInput.slice(splitCharPos + 1, splitCharPos + 1 + splitChar.length) ===
            splitChar) {
            return true;
        }
    }
    else {
        if (termInput.slice(termInput.indexOf(splitChar), termInput.indexOf(splitChar) + splitChar.length) === splitChar) {
            return true;
        }
    }
};
const GenVar = (varInput) => {
    if (varInput === "-") {
        return { const: [-1, "int"] };
    }
    else if (varInput.match(/[0-9]/)) {
        if (varInput.match(/\./)) {
            var decimal = varInput.split(".");
            if (decimal[1].includes("\\dot")) {
                var splitDecial = decimal[1].split("\\dot");
                var repeatDecm;
                if (splitDecial.length > 2) {
                    repeatDecm = splitDecial[1] + splitDecial[2];
                }
                else {
                    repeatDecm = splitDecial[1];
                }
                return { const: [[decimal[0], splitDecial[0], repeatDecm], "decm"] };
            }
            else {
                return { const: [[decimal[0], decimal[1], "None"], "decm"] };
            }
        }
        else {
            return { const: [parseInt(varInput), "int"] };
        }
    }
    else {
        return { var: varInput };
    }
};
exports.GenVar = GenVar;
const GenFrac = (fracInput) => {
    fracInput = fracInput.slice(5);
    var fracBracket = new Array();
    var fracStart = 0;
    var fracTerm = new Array();
    var fracTree = new Array();
    fracBracket.push(fracInput[0]);
    for (var i = 1; i < fracInput.length; i++) {
        if (fracInput[i] === "}") {
            fracBracket.pop();
        }
        else if (fracInput[i] === "{") {
            fracBracket.push("{");
        }
        if (fracBracket.length === 0) {
            fracTerm.push(fracInput.slice(fracStart + 1, i));
            fracStart = i + 1;
        }
    }
    for (var i = 0; i < fracTerm.length; i++) {
        fracTree.push((0, exports.ParsingPlus)(fracTerm[i]));
    }
    return { "/": fracTree };
};
const GenSqrt = (sqrtInput) => {
    sqrtInput = sqrtInput.slice(5);
    var sqrtBracket = new Array();
    var sqrtStart = 0;
    var sqrtTerm = new Array();
    var sqrtTree = new Array();
    var sqrtExp;
    sqrtBracket.push(sqrtInput[0]);
    for (var i = 1; i < sqrtInput.length; i++) {
        if (sqrtInput[i] === "}" || sqrtInput[i] === "]") {
            sqrtBracket.pop();
        }
        else if (sqrtInput[i] === "{" || sqrtInput[i] === "[") {
            sqrtBracket.push(sqrtInput[i]);
        }
        if (sqrtBracket.length === 0) {
            sqrtTerm.push(sqrtInput.slice(sqrtStart + 1, i));
            sqrtStart = i + 1;
        }
    }
    for (var i = sqrtTerm.length - 1; i >= 0; i--) {
        sqrtExp = (0, exports.ParsingPlus)(sqrtTerm[i]);
        if (sqrtExp["+"][0]["*"][0] === undefined) {
            sqrtExp["+"][0]["*"][0] = { const: [1, "int"] };
        }
        sqrtTree.push(sqrtExp);
    }
    return { root: sqrtTree };
};
const GenPow = (powInput) => {
    var firstSplitPow = powInput.split("^");
    var exp = firstSplitPow.slice(-1).toString();
    var base = powInput.slice(0, powInput.lastIndexOf(exp) - 1).toString();
    var splitPow = [base, exp];
    var powTerm = new Array();
    var powTree = new Array();
    for (var i = 0; i < splitPow.length; i++) {
        if (splitPow[i][0].match(/[0-9]/)) {
            powTerm.push(splitPow[i]);
        }
        else if (splitPow[i][0].match(/[a-z]/)) {
            powTerm.push(splitPow[i]);
        }
        else {
            var powBracket = new Array();
            var powStart = 0;
            powBracket.push(splitPow[i][0]);
            for (var j = 1; j < splitPow[i].length; j++) {
                if (splitPow[i][j] === "}" || splitPow[i][j] === ")") {
                    powBracket.pop();
                }
                else if (splitPow[i][j] === "{" || splitPow[i][j] === "(") {
                    powBracket.push(splitPow[i][j]);
                }
                if (powBracket.length === 0) {
                    powTerm.push(splitPow[i].slice(powStart + 1, j));
                    powStart = j + 1;
                }
            }
        }
    }
    for (var i = 0; i < powTerm.length; i++) {
        powTree.push((0, exports.ParsingPlus)(powTerm[i]));
    }
    return { pow: powTree };
};
const GenDiv = (divInput) => {
    var firstSplitDiv = divInput.split("\\div");
    var numerater = firstSplitDiv.slice(-1).toString();
    var denominator = divInput.slice(0, divInput.lastIndexOf(numerater) - 4).toString();
    var splitDiv = [denominator, numerater];
    var divTerm = new Array();
    var divTree = new Array();
    for (var i = 0; i < splitDiv.length; i++) {
        if (splitDiv[i][0].match(/[0-9]/)) {
            divTerm.push(splitDiv[i]);
        }
        else if (splitDiv[i][0].match(/[a-z]/)) {
            divTerm.push(splitDiv[i]);
        }
        else {
            var divBracket = new Array();
            var divStart = 0;
            divBracket.push(splitDiv[i][0]);
            for (var j = 1; j < splitDiv[i].length; j++) {
                if (splitDiv[i][j] === "}" || splitDiv[i][j] === ")") {
                    divBracket.pop();
                }
                else if (splitDiv[i][j] === "{" || splitDiv[i][j] === "(") {
                    divBracket.push(splitDiv[i][j]);
                }
                if (divBracket.length === 0) {
                    divTerm.push(splitDiv[i].slice(divStart + 1, j));
                    divStart = j + 1;
                }
            }
        }
    }
    for (var i = 0; i < divTerm.length; i++) {
        divTree.push((0, exports.ParsingPlus)(divTerm[i]));
    }
    return { "/": divTree };
};

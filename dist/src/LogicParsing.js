"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicParsing = void 0;
const LogicParsing = (logic) => {
    var latexResult;
    var jsonLogic = JSON.parse(logic);
    var type = Object.getOwnPropertyNames(jsonLogic);
    if (type[0] === "=") {
        var expressions = jsonLogic[type[0]];
        var equalExp = new Array();
        for (var i = 0; i < expressions.length; i++) {
            equalExp.push(CreateExpression(expressions[i]));
        }
        latexResult = equalExp.join("=");
    }
    else if (type[0] === ">" ||
        type[0] === "<" ||
        type[0] === ">=" ||
        type[0] === "<=") {
        var expressions = jsonLogic[type[0]];
        var inequalExp = new Array();
        for (var i = 0; i < expressions.length; i++) {
            inequalExp.push(CreateExpression(expressions[i]));
        }
        if (type[0] === ">=") {
            type[0] = "\\ge ";
        }
        else if (type[0] === "<=") {
            type[0] = "\\le ";
        }
        latexResult = inequalExp.join(type[0]);
    }
    else if (type[0] === "comp") {
        var mark = jsonLogic[type[0]][0];
        var expressions = jsonLogic[type[0]][1];
        var inequalExp = new Array();
        for (var i = 0; i < expressions.length; i++) {
            inequalExp.push(CreateExpression(expressions[i]));
        }
        for (var i = 0; i < mark.length; i++) {
            if (mark[i] === ">=") {
                mark[i] = "\\ge ";
            }
            else if (mark[i] === "<=") {
                mark[i] = "\\le ";
            }
        }
        latexResult =
            inequalExp[0] + mark[0] + inequalExp[1] + mark[1] + inequalExp[2];
    }
    else if (type[0] === "point") {
        var expressions = jsonLogic[type[0]];
        var pointExp = new Array();
        for (var i = 0; i < expressions.length; i++) {
            if (Object.getOwnPropertyNames(expressions[i])[0] === "const") {
                pointExp.push(CreateConst(expressions[i]));
            }
        }
        latexResult = "(" + pointExp.join(",") + ")";
    }
    else {
        latexResult = CreateExpression(jsonLogic);
    }
    return "$" + latexResult + "$";
};
exports.LogicParsing = LogicParsing;
const CreateExpression = (expLogic) => {
    var key = "+";
    var plusExpArray = new Array();
    for (var i = 0; i < expLogic[key].length; i++) {
        plusExpArray.push(CreateTerm(expLogic[key][i]));
    }
    var plusExp = plusExpArray.join("+");
    plusExp = plusExp.replace("+-", "-");
    return plusExp;
};
const CreateTerm = (termLogic) => {
    var key = "*";
    var varExp = "";
    for (var i = 0; i < termLogic[key].length; i++) {
        var termKey = Object.getOwnPropertyNames(termLogic[key][i]);
        var term = termLogic[key][i];
        if (termKey[0] === "var") {
            varExp += CreateVar(term);
        }
        else if (termKey[0] === "const") {
            varExp += CreateConst(term);
        }
        else if (termKey[0] === "/") {
            varExp += CreateFrac(term);
        }
        else if (termKey[0] === "+") {
            varExp += "(" + CreateExpression(term) + ")";
        }
        else if (termKey[0] === "root") {
            varExp += CreateSqrt(term);
        }
        else if (termKey[0] === "pow") {
            varExp += CreatePow(term);
        }
    }
    return varExp;
};
const CreateFrac = (fracLogic) => {
    var key = "/";
    var plusExp = new Array();
    for (var i = 0; i < fracLogic[key].length; i++) {
        plusExp.push(CreateExpression(fracLogic[key][i]));
    }
    return `\\frac{${plusExp[0]}}{${plusExp[1]}}`;
};
const CreateSqrt = (sqrtLogic) => {
    var key = "root";
    var plusExp = new Array();
    for (var i = 0; i < sqrtLogic[key].length; i++) {
        plusExp.push(CreateExpression(sqrtLogic[key][i]));
    }
    if (plusExp[1] === "1") {
        return `\\sqrt[]{${plusExp[0]}}`;
    }
    else {
        return `\\sqrt[${plusExp[1]}]{${plusExp[0]}}`;
    }
};
const CreatePow = (powLogic) => {
    var key = "pow";
    var plusExp = new Array();
    for (var i = 0; i < powLogic[key].length; i++) {
        plusExp.push(CreateExpression(powLogic[key][i]));
    }
    return `{${plusExp[0]}}^{${plusExp[1]}}`;
};
const CreateVar = (varLogic) => {
    var key = "var";
    var varString = varLogic[key];
    return varString;
};
const CreateConst = (constLogic) => {
    var key = "const";
    var constString = null;
    if (constLogic[key][1] === "int") {
        if (constLogic[key][0] === -1) {
            constString = "-";
        }
        else {
            constString = constLogic[key][0];
        }
    }
    else if (constLogic[key][1] === "decm") {
        if (constLogic[key][0][2] === "None") {
            constString = constLogic[key][0][0];
            constString += ".";
            constString += constLogic[key][0][1];
        }
    }
    return constString;
};

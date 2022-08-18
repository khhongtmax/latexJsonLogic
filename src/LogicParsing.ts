export const LogicParsing = (logic: string) => {
  var latexResult;

  if(typeof(logic) !== "string"){
    logic = JSON.stringify(logic);
  }
  var jsonLogic = JSON.parse(logic);

  var type = Object.getOwnPropertyNames(jsonLogic);

  if(type[0] === ":"){
    var expressions = jsonLogic[type[0]];
    latexResult = CreateProportion(expressions[0]);
  }
  else if (type[0] === "system") {
    var expressions = jsonLogic[type[0]];
    var systemExp = new Array();
    for (var i = 0; i < expressions.length; i++) {
      systemExp.push(LogicParsing(expressions[i]).slice(1,-1));
    }
    latexResult = "\\begin{cases}"+systemExp.join("\\\\") + "\\end{cases}";
  }
  else if (type[0] === "=") {
    var expressions = jsonLogic[type[0]];
    var equalExp = new Array();
    for (var i = 0; i < expressions.length; i++) {
      equalExp.push(CreateExpression(expressions[i]));
    }
    latexResult = equalExp.join("=");
  } else if (
    type[0] === ">" ||
    type[0] === "<" ||
    type[0] === ">=" ||
    type[0] === "<="
  ) {
    var expressions = jsonLogic[type[0]];
    var inequalExp = new Array();
    for (var i = 0; i < expressions.length; i++) {
      inequalExp.push(CreateExpression(expressions[i]));
    }
    if (type[0] === ">=") {
      type[0] = "\\ge ";
    } else if (type[0] === "<=") {
      type[0] = "\\le ";
    }
    latexResult = inequalExp.join(type[0]);
  } else if (type[0] === "comp") {
    var mark = jsonLogic[type[0]][0];
    var expressions = jsonLogic[type[0]][1];
    var inequalExp = new Array();
    for (var i = 0; i < expressions.length; i++) {
      inequalExp.push(CreateExpression(expressions[i]));
    }
    for (var i = 0; i < mark.length; i++) {
      if (mark[i] === ">=") {
        mark[i] = "\\ge ";
      } else if (mark[i] === "<=") {
        mark[i] = "\\le ";
      }
    }
    latexResult =
      inequalExp[0] + mark[0] + inequalExp[1] + mark[1] + inequalExp[2];
  } else if (type[0] === "point") {
    var expressions = jsonLogic[type[0]];
    var pointExp = new Array();
    for (var i = 0; i < expressions.length; i++) {
      if (Object.getOwnPropertyNames(expressions[i])[0] === "const") {
        pointExp.push(CreateConst(expressions[i]));
      }
    }
    latexResult = "(" + pointExp.join(",") + ")";
  }
  else{
    latexResult = CreateExpression(jsonLogic)
  }

  return "$" + latexResult + "$";
};

const CreateProportion = (expLogic: any) => {
  var expressions = expLogic["="];

  var leftExp = expressions[0]
  var rightExp = expressions[1]

  var leftExp1 = leftExp["+"][0]["*"][0]["/"][0]
  var leftExp2 = leftExp["+"][0]["*"][0]["/"][1]
  var rightExp1 = rightExp["+"][0]["*"][0]["/"][0]
  var rightExp2 = rightExp["+"][0]["*"][0]["/"][1]
  
  var proportionResult = CreateExpression(leftExp1) + ":"+CreateExpression(leftExp2) + "="+CreateExpression(rightExp1) + ":"+CreateExpression(rightExp2)

  return proportionResult
}

const CreateExpression = (expLogic: any) => {
  var key = "+";
  var plusExpArray = new Array();
  for (var i = 0; i < expLogic[key].length; i++) {  
    plusExpArray.push(CreateTerm(expLogic[key][i]));
  }

  var plusExp = plusExpArray.join("+");

  plusExp = plusExp.replace("-1(", "-(");
  var findReplaceChar = plusExp.match(/(-1[a-zA-Z])/)
  if(findReplaceChar != null){
    var replaceChar = findReplaceChar[0].split("-1")
    plusExp = plusExp.replace(/-1[a-zA-Z]*$/, "-"+replaceChar[1]);
  }
  plusExp = plusExp.replace("+-", "-");

  return plusExp;
};

const CreateTerm = (termLogic: any) => {
  var key = "*";
  var varExp = "";
  var isNumSeq = false;
  for (var i = 0; i < termLogic[key].length; i++) {
    var termKey = Object.getOwnPropertyNames(termLogic[key][i]);
    var term = termLogic[key][i];
    if (termKey[0] === "var") {
      varExp += CreateVar(term);
      isNumSeq = false;
    } else if (termKey[0] === "const") {
      if(isNumSeq === true){
        varExp += '\\times'+CreateConst(term);
      }else{
        varExp += CreateConst(term);
      }
      isNumSeq = true;
    } else if (termKey[0] === "/") {
      varExp += CreateFrac(term);
      isNumSeq = false;
    } else if (termKey[0] === "+") {
      /*if(CreateExpression(term).match(/^[0-9]*$/)){
        varExp += "\\times" + CreateExpression(term);
      }
      else{
        varExp += "(" + CreateExpression(term) + ")";
      }*/
      varExp += "(" + CreateExpression(term) + ")";
      isNumSeq = false;
    } else if (termKey[0] === "root") {
      varExp += CreateSqrt(term);
      isNumSeq = false;
    } else if (termKey[0] === "pow") {
      varExp += CreatePow(term);
      isNumSeq = false;
    }
  }

  return varExp;
};

const CreateFrac = (fracLogic: any) => {
  var key = "/";
  var plusExp = new Array();
  for (var i = 0; i < fracLogic[key].length; i++) {
    plusExp.push(CreateExpression(fracLogic[key][i]));
  }

  return `\\frac{${plusExp[0]}}{${plusExp[1]}}`;
};

const CreateSqrt = (sqrtLogic: any) => {
  var key = "root";
  var plusExp = new Array();
  for (var i = 0; i < sqrtLogic[key].length; i++) {
    plusExp.push(CreateExpression(sqrtLogic[key][i]));
  }
 
  if(plusExp[1] === "1"){
    return `\\sqrt[]{${plusExp[0]}}`;
  }
  else{
    return `\\sqrt[${plusExp[1]}]{${plusExp[0]}}`;
  }
  
};

const CreatePow = (powLogic: any) => {
  var key = "pow";
  var plusExp = new Array();
  for (var i = 0; i < powLogic[key].length; i++) {
    plusExp.push(CreateExpression(powLogic[key][i]));
  }

  return `{${plusExp[0]}}^{${plusExp[1]}}`;
};

const CreateVar = (varLogic: any) => {
  var key = "var";
  var varString = varLogic[key];

  return varString;
};

const CreateConst = (constLogic: any) => {
  var key = "const";
  var constString = null;
  if (constLogic[key][1] === "int") {
    constString = constLogic[key][0];
  }
  else if(constLogic[key][1] === "decm"){

      if(constLogic[key][0][2] === "None" ||constLogic[key][0][2] === null ){
        constString = constLogic[key][0][0];
        constString += "."
        constString += constLogic[key][0][1];
      }
      else if(constLogic[key][0][1] === "None" ||constLogic[key][0][1] === null ){
        constString = constLogic[key][0][0];
        constString += "."
        constString += "\\dot"
        constString += constLogic[key][0][2];
      }
      else{
          constString = constLogic[key][0][0];
          constString += "."
          constString += constLogic[key][0][1];
          constString += "\\dot"
          for(var i = 0; i < constLogic[key][0][2].length ; i++){
            constString += constLogic[key][0][2][i];
          }
          constString += "\\dot"
          constString += constLogic[key][0][2][constLogic[key][0][2].length-1];       
      }
  }

  return constString;
};


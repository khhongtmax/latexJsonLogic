import { ParsingPlus, GenVar } from "./latexParsing";

/////////////// 등식,부등식,좌표 타입 판단 ///////////////////
export const DetermineType = (input: string) => {
  var type = "";
  input = input.replace(/ /g, "");
  let splitLatex = input.slice(1, -1);
  var jsonLogicResult;
  var regularExpression =
    /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^\$\\]*(?:\\.[^\$\\]*)*\$/g; // latex 문법으로 표기 되었는지
  var blockRegularExpression = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]/g;

  if(splitLatex.includes(":")){
    type = "proportion"; // 비례식
    jsonLogicResult = DivideProportion(splitLatex);
  }
  else if(splitLatex.includes("\\begin{cases}")){
    type = "systemEquation"; // 연립방정식
    jsonLogicResult = DivideSystemEquation(splitLatex);
  }
  else if (
    splitLatex.includes("<") ||
    splitLatex.includes(">") ||
    splitLatex.includes("le") ||
    splitLatex.includes("ge")
  ) {
    type = "inequality"; //부등식 < or > or <= or >=
    jsonLogicResult = DivideInequality(splitLatex);
  }
  else if (splitLatex.includes("=")) {
    type = "equation"; // 등식
    jsonLogicResult = DivideEquation(splitLatex);
  } else if (splitLatex.includes(",")) {
    type = "coordinate"; //좌표
    jsonLogicResult = DivideCoordinate(splitLatex);
  } else {
    type = "latex 타입 판단 실패";
    const nomalLogic = ParsingPlus(splitLatex);
    jsonLogicResult = nomalLogic;
  }
  return JSON.stringify(jsonLogicResult);
};

/////////////// 연립 방정식 분리 ///////////////////
const DivideProportion = (proportion: string) => {

  let equations = proportion.split("=");

  
  var proportion1 = equations[0].split(":");
  var proportion2 = equations[1].split(":");  

  const proportionLogic = {
    ":": [{"=":[{"+":[{"*":[{"/":[ParsingPlus(proportion1[0]),ParsingPlus(proportion1[1])]}]}]},{"+":[{"*":[{"/":[ParsingPlus(proportion2[0]),ParsingPlus(proportion2[1])]}]}]}]}],
  };
  return proportionLogic;
};

/////////////// 연립 방정식 분리 ///////////////////
const DivideSystemEquation = (systemEquation: string) => {

  let equations = systemEquation.split("\\begin{cases}");
  equations = equations[1].split("\\end{cases}");
  equations = equations[0].split("\\\\");

  var equation1 = equations[0];
  var equation2 = equations[1];
  

  const systemEqualLogic = {
    "system": [DeterminExpression(equation1), DeterminExpression(equation2)],
  };
  return systemEqualLogic;
};
/////////////// 연립 방정식 내부 식 파싱 ///////////////////
const DeterminExpression = (expression:string) => {
  var logicResult;
  if (expression.includes("=")) {
    logicResult = DivideEquation(expression);
  } else if (
    expression.includes("<") ||
    expression.includes(">") ||
    expression.includes("le") ||
    expression.includes("ge")
  ) {
    logicResult = DivideInequality(expression);
  }

  return logicResult;
}

/////////////// 등식 양변 분리 ///////////////////
const DivideEquation = (equation: string) => {

  const leftExpression = equation.slice(0, equation.indexOf("="));
  const rightExpression = equation.slice(equation.indexOf("=") + 1);

  const equalLogic = {
    "=": [ParsingPlus(leftExpression), ParsingPlus(rightExpression)],
  };
  return equalLogic;
};

/////////////// 부등식 양변 분리 ///////////////////
const DivideInequality = (inequality: string) => {
  let mark = new Array<string>();
  ///////////// 부등식 기호 parsing ///////////////
  for (let i = 0; i < inequality.length; i++) {
    if (inequality[i] === "<" || inequality[i] === ">") {
      if(inequality[i + 1] === "="){
        mark.push(inequality[i]+"=");
      }
      else{
        mark.push(inequality[i]);
      }

    }
    if (inequality[i] === "\\") {
      if (inequality[i + 1] === "l") {
        mark.push("\\le");
      }

      if (inequality[i + 1] == "g") {
        mark.push("\\ge");
      }
    }
  }   
  ///////////// 부등식 식 parsing ///////////////
  if (mark.length > 1) {
    //////////////// 복합 부등식 //////////////////////////
    const leftExpression = inequality.slice(0, inequality.indexOf(mark[0]));
    const middleExpression = inequality.slice(
      inequality.indexOf(mark[0])+mark[0].length,
      inequality.lastIndexOf(mark[1])
    );
    const rightExpression = inequality.slice(
      inequality.lastIndexOf(mark[1]) + mark[1].length
    );

    for (let i = 0; i < mark.length; i++) {
      if (mark[i] === "\\le") {
        mark[i] = "<=";
      } else if (mark[i] === "\\ge") {
        mark[i] = "=>";
      }
    }

    const complexInequalLogic = {
      comp: [
        mark,
        [
          ParsingPlus(leftExpression),
          ParsingPlus(middleExpression),
          ParsingPlus(rightExpression),
        ],
      ],
    };
    return complexInequalLogic;
  } else {
    //////////////// 부등식 //////////////////////////
    const leftExpression = inequality.split(mark[0])[0];
    const rightExpression = inequality.split(mark[0])[1];
    for (let i = 0; i < mark.length; i++) {
      if (mark[i] === "\\le") {
        mark[i] = "<=";
      } else if (mark[i] === "\\ge") {
        mark[i] = ">=";
      }
    }
    const inequalLogic = {
      [mark[0]]: [ParsingPlus(leftExpression), ParsingPlus(rightExpression)],
    };

    return inequalLogic;
  }
};
///////////////// 좌표 /////////////////////////////////
const DivideCoordinate = (coordinate: string) => {
  var stripBracket = coordinate.slice(1, -1);
  var coordinateExp = stripBracket.split(",");
  var expTree = new Array();

  for (var i = 0; i < coordinateExp.length; i++) {
    expTree.push(GenVar(coordinateExp[i]));
  }

  const coordinateLogic = {
    point: expTree,
  };
  return coordinateLogic;
};

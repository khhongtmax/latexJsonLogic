import {divExp} from "./RegExpType";

/////////////////////////// key = '+' 인 tree 생성 함수 ///////////////////////////
export const ParsingPlus = (input: string):any => {
  let plusTree = null;
  let plusTerm = new Array(); //'+' 기준으로 분리된 식 저장
  var isTimes:boolean = false;
  let opList = new Array(); //'+' 갯수 대로 저장
  let pmList = new Array(); //'+-' 갯수 대로 저장 -> 제대로 작동 하지 않음
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
    ////////////////////////////////////////

   //bracket.length === 0 -> 괄호 바깥의 식일 경우
    if(input.slice(i,i+3) === "\\pm" && bracket.length === 0){ 
      pmList.push("\\pm");
      plusTerm.push(input.slice(start, i));
      start = i + 3;
    }
    else if (input[i] === "+" && bracket.length === 0) {
      opList.push(input[i]);
      plusTerm.push(input.slice(start, i));
      start = i + 1;
    }else if (input[i] === "-" && bracket.length === 0) {
      if(i > 6){
        if(input.slice(i-6,i) === "\\times"){
          isTimes = true;
        }
      }
      if(!isTimes){
        opList.push(input[i]);
        plusTerm.push(input.slice(start, i));
        start = i;
      }

      
      isTimes = false;
    }
  }

  if (opList.length === 0 && pmList.length === 0) {
    //////////// '+' 로 분리 불가 식 처리 //////////////////
    return { "+": [ParsingTimes(input)] };
  }
  else if(pmList.length !== 0){
    //////////// '+-' 식 tree 구성 -> 작동 하지 않음 //////////////////
    plusTerm.push(input.slice(start));
    var plusTermList = new Array();
    for (var i = 0; i < plusTerm.length; i++) {
      if (plusTerm[i] !== "") {
        plusTermList.push(ParsingTimes(plusTerm[i]));
      }
    }
    return { "+-": plusTermList };
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

/////////////////////////// key = '*' 인 tree 생성 함수 ///////////////////////////
const ParsingTimes = (input: string) => {
  let timesTerm = new Array(); //'\times,괄호,변수' 기준으로 분리된 식 저장

  let opList = new Array(); //'*' 갯수 대로 저장
  var bracket = new Array(); // 괄호 판단용 스택

  var start = 0; // 식 분리용 포인터
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
    /////////////////////////////////////////
    if (bracket.length === 0) {
      ///////////////// 괄호 바깥 이라면 아래 식 실행 //////////////////////

      if (input[i] === "\\") {
        ///////////////// \\ 구분자 만났을 때 //////////////////////
        if (input.slice(i, i + 6) === "\\times") {
          ///////////////// 곱하기 기호 기준 분리 //////////////////////
          opList.push("*");
          timesTerm.push(input.slice(start, i));
          start = i + 6;
          i = i + 5;
        } else if (
          input.slice(i, i + 5) === "\\frac" ||
          input.slice(i, i + 5) === "\\sqrt"
        ) {
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
        } else if (input.slice(i, i + 4) === "\\div") {
          ///////////////// 나누기 기준 분리 //////////////////////
          opList.push("*");
          var expStart = i - 1;
          var expEnd = i + 3;
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
          } else if (input[i - 1].match(/[0-9]/)) {
            var j = i - 1;
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
            while (input[j].match(/[0-9]/)||input[j].match(/\./)) {
              if (j === 0) {
                break;
              }
              j--;
            }
            dotStart = j;
          }
          else if(input[i - 2].match(/[a-zA-Z]/)) {
            var j = i - 2; //임시 $a.\dot{b}\dot{c}$ 때문
            while (input[j].match(/[a-zA-Z]/)||input[j].match(/\./)) {
              if (j === 0) {
                break;
              }
              j--;
            }
            dotStart = j;
          }
          if(i+7<input.length){
            if (input[i + 7].match(/[0-9]/)||input[i + 7].match(/[a-zA-Z]/)) {
              var k = i + 7;
              while (k < input.length) {
                if(input[k] === "\\"){
                  if(input[k+1] === "d"&&input[k+2] === "o"){
                    k= k+6;
                    break;
                  }
                }
                k++;
              }
              dotEnd = k;
            }
            else if(input[i + 7] === "\\" && input[i + 8] === "d"){
              dotEnd = i+13;
            }
          }
          else{
            dotEnd = i+6
          }
          timesTerm.push(input.slice(start, dotStart));
          start = dotStart;
          i = dotEnd-1;
        }
        /*else if (input.slice(i, i + 6) === "\\cdots") {
          ///////////////// 순환 소수 기준 분리 //////////////////////
          opList.push("*");
          var dotStart = i - 1;
          var dotEnd = i + 4;
          var frontBracket = new Array();
          var backBracket = new Array();
          if (input[i - 2].match(/[0-9]/)) {
            var j = i - 2;
            while (input[j].match(/[0-9]/)||input[j].match(/\./)) {
              if (j === 0) {
                break;
              }
              j--;
            }
            dotStart = j;
          }
          else if(input[i - 2].match(/[a-zA-Z]/)) {
            var j = i - 2; //임시 $a.\dot{b}\dot{c}$ 때문
            while (input[j].match(/[a-zA-Z]/)||input[j].match(/\./)) {
              if (j === 0) {
                break;
              }
              j--;
            }
            dotStart = j;
          }
          dotEnd = i+5;

          timesTerm.push(input.slice(start, dotStart));
          start = dotStart;
          i = dotEnd-1;
        }*/
        else if(input.slice(i, i + 3) === "\\pi"){
          ///////////////// 파이 기준 분리 //////////////////////
          opList.push("*");
          var piStart = i;
          var piEnd = i + 3;
          timesTerm.push(input.slice(start, piStart));
          start = piStart;
          timesTerm.push(input.slice(piStart, piEnd));
          start = piEnd;
          i = piEnd-1;
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
        } else if (input[i - 1].match(/[0-9]/)) {
          var j = i - 1;
          while (input[j].match(/[0-9]/)) {
            if (j === 0) {
              break;
            }
            j--;
          }
          if(j === 0){
            expStart = j;
          }else{
            expStart = j+1;
          }

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
      } else if (input[i] === ")" || input[i] === "}") {
        ///////////////// 괄호-괄호/괄호-문자 분리 //////////////////////
        if (i < input.length - 1) {
          if (input[i + 1] === "(" || input[i + 1] === "{") {
            opList.push("*");

            timesTerm.push(input.slice(start, i + 1));
            start = i + 1;
          } else if (input[i + 1].match(/[a-zA-Z]/)) {
            opList.push("*");
            timesTerm.push(input.slice(start, i + 1));
            start = i + 1;
          }
        }
      } else if (input[i].match(/[a-zA-Z]/)) {
        
        var backBracket = new Array();
        var nomalEnd = i + 1;
        var nomalStart = i + 1;
        if(input.slice(i, i + 4) === "f(x)"){///////////////// f(x) 분리 //////////////////////
          opList.push("*");
          timesTerm.push(input.slice(start, i + 4));
          start = i + 4;
          i = i+3;
        }
        else if (input[i + 1] === "(" || input[i + 1] === "{") {///////////////// 문자-괄호 분리 //////////////////////
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
        else if (input[i + 1].match(/[a-zA-Z]/)) {
          ///////////////// 문자 - 문자 분리 //////////////////////
          if(i !== 0){
            if(input[i - 1].match(/\./)){
            var k = i + 1;
            while (k < input.length) {
              if(input[k] === "\\"){
                /*if(input[k+1] === "c"){
                  k = k+6;
                  break;
                }*/
                if(input[k+1] === "d"){
                  k = k+13;
                }
                  break;
              }
              k++;
            }
            var chardotEnd = k;
            opList.push("*");
            timesTerm.push(input.slice(start, chardotEnd));
            start = chardotEnd+1;
            i = chardotEnd-1
          }
          else{
            opList.push("*");
            timesTerm.push(input.slice(start, i + 1));
            start = i + 1; 
          }
        }
        else{
          opList.push("*");
          timesTerm.push(input.slice(start, i + 1));
          start = i + 1; 
        } 

        }
        else if(input[i + 1] === "'"){
          ///////////////// 문자 - 문자' 분리 //////////////////////
          opList.push("*");
          timesTerm.push(input.slice(start, i + 2));
          start = i + 2;
        }
      } else if (input[i].match(/[0-9]/)) {
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
        } else if (input[i + 1].match(/[a-zA-Z]/)) {
          opList.push("*");
          timesTerm.push(input.slice(start, i + 1));
          start = i + 1;
        }
      }
      else if (input[i] === "-") {
        ///////////////// -(, -{, -a 등의 -1 이 곱해진 항 분리 //////////////////////
        if(input[i+1] === "(" || input[i+1] === "{" ||input[i+1].match(/[a-zA-Z]/)){
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
      /////////////// 기호 별 tree 생성을 위한 구분 ////////////////
      if (timesTerm[i] !== "") {
        if (timesTerm[i].slice(0, 5) === "\\frac") {
          GenFrac(timesTerm[i]);
        } else if (timesTerm[i].slice(0, 5) === "\\sqrt") {
          timesTermList.push(GenSqrt(timesTerm[i]));
        } else if (DeterminBracket(timesTerm[i], "^") === true) {
          timesTermList.push(GenPow(timesTerm[i]));
        } else if (DeterminBracket(timesTerm[i], "\\div") === true) {
          timesTermList.push(GenDiv(timesTerm[i]));
        } else if (
          timesTerm[i].length > 1 &&
          (timesTerm[i][0] === "(" || timesTerm[i][0] === "{")
        ) {
          timesTerm[i] = timesTerm[i].slice(1, -1);
          timesTermList.push(ParsingPlus(timesTerm[i]));
        } else {
          timesTermList.push(GenVar(timesTerm[i]));
        }
      }
    }
    return { "*": [timesTermList[0]] };
  } else {
    //////////// '*' 식 tree 구성 //////////////////
    timesTerm.push(input.slice(start));
    var timesTermList = new Array();
    for (var i = 0; i < timesTerm.length; i++) {
      /////////////// 기호 별 tree 생성을 위한 구분 ////////////////
      if (timesTerm[i] !== "") {
        if (timesTerm[i].slice(0, 5) === "\\frac") {
          timesTermList.push(GenFrac(timesTerm[i]));
        } else if (timesTerm[i].slice(0, 5) === "\\sqrt") {
          timesTermList.push(GenSqrt(timesTerm[i]));
        } else if (DeterminBracket(timesTerm[i], "^") === true) {
          timesTermList.push(GenPow(timesTerm[i]));
        } else if (DeterminBracket(timesTerm[i], "\\div") === true) {
          timesTermList.push(GenDiv(timesTerm[i]));
        } else if (
          timesTerm[i].length > 1 &&
          timesTerm[i].length > 1 &&
          (timesTerm[i][0] === "(" || timesTerm[i][0] === "{")
        ) {
          timesTerm[i] = timesTerm[i].slice(1, -1);
          timesTermList.push(ParsingPlus(timesTerm[i]));
        } else {
          timesTermList.push(GenVar(timesTerm[i]));
        }
      }
    }

    return { "*": timesTermList };
  }
};
//////////// termInput(식)이 splitChar(기호)로 이루어진 식이 맞는지 판별 //////////////////
//////////// 현재 termInput(식)이 ^로 이루어진 식인지 \\div로 이루어진 식인지 판별하는데 쓰임 //////////////////
const DeterminBracket = (termInput: string, splitChar: string) => {
  var bracket = new Array();
  var splitCharPos = 0;
  if (termInput[0] === "{" || termInput[0] === "(") {
    bracket.push(termInput[0]);
    for (var i = 1; i < termInput.length; i++) {
      if (termInput[i] === "{" || termInput[i] === "(") {
        bracket.push(termInput[i]);
      } else if (termInput[i] === "}" || termInput[i] === ")") {
        bracket.pop();
      }
      if (bracket.length === 0) {
        splitCharPos = i + 1;
        break;
      }
    }
    if (
      termInput.slice(splitCharPos, splitCharPos + splitChar.length) ===
      splitChar
    ) {
      return true;
    }
  } else if (termInput[0].match(/[a-zA-Z]/)) {
    if (
      termInput.slice(splitCharPos + 1, splitCharPos + 1 + splitChar.length) ===
      splitChar
    ) {
      return true;
    }
  } else {
    if (
      termInput.slice(
        termInput.indexOf(splitChar),
        termInput.indexOf(splitChar) + splitChar.length
      ) === splitChar
    ) {
      return true;
    }
  }
};
/////////////////////////// key = 'const' or key = 'decm' or key = 'var' 인 tree 생성 함수 ///////////////////////////
export const GenVar = (varInput: string) => {
  if (varInput === "-") {
  ////////////////// - 기호 ///////////////////////
    return { const: [-1, "int"] };
  } else if (varInput.match(/[0-9]/)) {
    ////////////////// 숫자 ///////////////////////
    if (varInput.match(/\./)) {
      ////////////////// 소수 ///////////////////////
      var decimal = varInput.split(".");
      if(decimal[1].includes("\\dot")){
        var splitDecial = decimal[1].split("\\dot")
        var repeatDecm
        if(splitDecial.length > 2){
          var spliDecialVar1 = null
          var splitDecialVar2 =  null
          if(splitDecial[1].match(/\}[0-9]/)){
            spliDecialVar1 = splitDecial[1].split("}")[0].slice(1)
            splitDecialVar2 = splitDecial[1].split("}")[1]
          }
          else{
            spliDecialVar1 = splitDecial[1].slice(1,-1)
          }
          var spliDecialVar3 = splitDecial[2].slice(1,-1)
          repeatDecm = spliDecialVar1+splitDecialVar2+spliDecialVar3
          if(splitDecial[0] === ""){
            splitDecial[0] = "None"
          }
          return { const: [[decimal[0], splitDecial[0], repeatDecm], "decm"] }; //순환 소수
        }
        else{
          var splitDecialInt = splitDecial[1].slice(1,-1)
          repeatDecm = splitDecialInt
          return { const: [[decimal[0],"None", repeatDecm], "decm"] }; //소수 부분 없음
        }
        
        
      }else{
        return { const: [[decimal[0], decimal[1], "None"], "decm"] }; //순환 소수 아님
      }
    } else {
      ////////////////// 정수 ///////////////////////
      return { const: [parseInt(varInput), "int"] };
    }
  } 
  else if(varInput === "\\pi"){
    ////////////////// 파이 ///////////////////////
    return {const:["pi", "special"]};
  }
  else {
    ////////////////// 문자 ///////////////////////
    ////////////////// TAS 요쳥에 따라 소수도 key = 'decm' 으로 변환 되도록 ///////////////////////
    if (varInput.match(/\./)) {
      var charDecimal = varInput.split(".");
      if(charDecimal[1].includes("\\dot")){
        var splitCharDecial = charDecimal[1].split("\\dot");
        var repeatCharDecm
        if(splitCharDecial.length > 2){
          var splitCharDecialVar1
          var splitCharDecialVar2 = ""
          if(splitCharDecial[1].match(/\}[a-zA-Z]/)){
            splitCharDecialVar1 = splitCharDecial[1].split("}")[0].slice(1)
            splitCharDecialVar2 = splitCharDecial[1].split("}")[1]
          }
          else{
            splitCharDecialVar1 = splitCharDecial[1].slice(1,-1)
          }
          var splitCharDecialVar3 = splitCharDecial[2].slice(1,-1)
          repeatCharDecm = splitCharDecialVar1+splitCharDecialVar2+splitCharDecialVar3
        }
        else{
          var splitCharDecialVar = splitCharDecial[1].slice(1,-1)
          repeatCharDecm = splitCharDecialVar
          return { decm: [charDecimal[0], "None", repeatCharDecm]}; //소수 부분 없음
        }
        if(splitCharDecial[0] === ""){
          splitCharDecial[0] = "None"
        }
        return { decm: [charDecimal[0], splitCharDecial[0], repeatCharDecm]}; //순환 소수
      }
      else{
        return { decm: [charDecimal[0], charDecimal[1], "None"]}; //순환 소수 아님
      } 
    }
    else{
      return { var: varInput }; // 문자
    }


  }
};
/////////////////////////// key = '/' 인 tree 생성 함수 ///////////////////////////
const GenFrac = (fracInput: string) => {
  fracInput = fracInput.slice(5);
  var fracBracket = new Array();
  var fracStart = 0;
  var fracTerm = new Array();
  var fracTree = new Array();
  fracBracket.push(fracInput[0]);

  for (var i = 1; i < fracInput.length; i++) {
    if (fracInput[i] === "}") {
      fracBracket.pop();
    } else if (fracInput[i] === "{") {
      fracBracket.push("{");
    }
    if (fracBracket.length === 0) {
      fracTerm.push(fracInput.slice(fracStart + 1, i));
      fracStart = i + 1;
    }
  }

  for (var i = 0; i < fracTerm.length; i++) {
    fracTree.push(ParsingPlus(fracTerm[i]));
  }

  return { "/": fracTree };
};
/////////////////////////// key = 'root' 인 tree 생성 함수 ///////////////////////////
const GenSqrt = (sqrtInput: string) => {
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
    } else if (sqrtInput[i] === "{" || sqrtInput[i] === "[") {
      sqrtBracket.push(sqrtInput[i]);
    }
    if (sqrtBracket.length === 0) {
      sqrtTerm.push(sqrtInput.slice(sqrtStart + 1, i));
      sqrtStart = i + 1;
    }
  }

  if(sqrtTerm.length === 1){
    sqrtExp = ParsingPlus(sqrtTerm[0]);
    sqrtTree.push(sqrtExp);
    sqrtExp = ParsingPlus('');
    var type = Object.getOwnPropertyNames(sqrtExp);
    sqrtExp[type[0]][0]["*"][0] = { const: [2, "int"] };
    sqrtTree.push(sqrtExp);
  }else{
    for (var i = sqrtTerm.length - 1; i >= 0; i--) {
      sqrtExp = ParsingPlus(sqrtTerm[i]);
      var type = Object.getOwnPropertyNames(sqrtExp);
      if (sqrtExp[type[0]][0]["*"][0] === undefined) {
        sqrtExp[type[0]][0]["*"][0] = { const: [2, "int"] };
      }
      sqrtTree.push(sqrtExp);
    }
  }


  return { root: sqrtTree };
};
/////////////////////////// key = 'pow' 인 tree 생성 함수 ///////////////////////////
const GenPow = (powInput: string) => {
  var firstSplitPow = powInput.split("^");
  
  var exp = firstSplitPow.slice(-1).toString();
  var base = powInput.slice(0,powInput.lastIndexOf(exp)-1).toString();

  var splitPow = [base,exp]

  var powTerm = new Array();
  var powTree = new Array();

  for (var i = 0; i < splitPow.length; i++) {
    if (splitPow[i][0].match(/[0-9]/)) {
      powTerm.push(splitPow[i]);
    } else if (splitPow[i][0].match(/[a-zA-Z]/)) {
      powTerm.push(splitPow[i]);
    } else {
      var powBracket = new Array();
      var powStart = 0;
      powBracket.push(splitPow[i][0]);
      
      for (var j = 1; j < splitPow[i].length; j++) {
        
        if (splitPow[i][j] === "}" || splitPow[i][j] === ")") {
          powBracket.pop();
        } else if (splitPow[i][j] === "{" || splitPow[i][j] === "(") {
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
    powTree.push(ParsingPlus(powTerm[i]));
  }

  return { pow: powTree };
};
/////////////////////////// key = '/' 인 tree 생성 함수 (단, input이 \\div 포함 식임) ///////////////////////////
const GenDiv = (divInput: string) => {
  var firstSplitDiv = divInput.split("\\div");
  
  var numerater = firstSplitDiv.slice(-1).toString();
  var denominator = divInput.slice(0,divInput.lastIndexOf(numerater)-4).toString();

  var splitDiv = [denominator,numerater]

  var divTerm = new Array();
  var divTree = new Array();

  for (var i = 0; i < splitDiv.length; i++) {
    if (splitDiv[i][0].match(/[0-9]/)) {
      divTerm.push(splitDiv[i]);
    } else if (splitDiv[i][0].match(/[a-zA-Z]/)) {
      divTerm.push(splitDiv[i]);
    } else {
      var divBracket = new Array();
      var divStart = 0;
      divBracket.push(splitDiv[i][0]);

      for (var j = 1; j < splitDiv[i].length; j++) {
        if (splitDiv[i][j] === "}" || splitDiv[i][j] === ")") {
          divBracket.pop();
        } else if (splitDiv[i][j] === "{" || splitDiv[i][j] === "(") {
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
    divTree.push(ParsingPlus(divTerm[i]));
  }

  return { "/": divTree };
};

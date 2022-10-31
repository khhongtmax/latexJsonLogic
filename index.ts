import * as pluralize from 'pluralize'
import {DetermineType} from './src/DetermineType'
import {LogicParsing} from './src/LogicParsing'

/**
* @Method: Returns the plural form of any noun.
* @Param: {string}
* @Return: {string}
*/
export function getPlural(str: any): string {
  return pluralize.plural(str)
}

export function LatexToJsonLogic(str: any) {
  return DetermineType(str)
}

export function JsonLogicToLatex(str: any) {
  return LogicParsing(str)
}

console.log(LatexToJsonLogic("$a\\sqrt{b^mc^n}$"))
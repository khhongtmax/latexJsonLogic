# latexJsonLogic

## 1. 변환 가능 latex 표현

기호|변환 가능 latex 표현| 주의 사항
--|--|--|
제곱근|\sqrt{} or \sqrt[]{}| **{} 표기 필수**
부등호|>,<,\ge,\le|
제곱|{밑}^{지수}
분수|\frac{분자}{분모}
순환소수| a.\dot{b}c\dot{d}|**\cdots 불가**
좌표|(a,b)
곱하기|\times
연립 방정식|\begin{cases}식\\식\end{cases}|**식 3개 이상 가능**
비례식|a:b = c:d
파이|\pi
변수|a ~ z,A ~ Z,a'~ z',f(x)

## 2. NPM 패키지 업데이트

+ NPM 계정 필요
  + npm 계정에 로그인이 되어 있지 않다면 npm 로그인 후 진행
    ``` console
    foo@bar:~$ npm login // npm 로그인 명령어
    npm notice Log in on https://registry.npmjs.org/
    Username :
    Password :
    Email : 
    // npm 계정 정보 (이름,패스워드,이메일) 입력
    
    foo@bar:~$ npm whoami // 로그인이 되어 있는지 확인 명령어
    ```
+ NPM 패키지 배포
    ``` console
    foo@bar:~$ npm build // npm 패키지 빌드
    foo@bar:~$ npm version patch // npm 패키지 버전 업 /Git 작업 디렉토리는 깨끗한 상태여야 함
    foo@bar:~$ npm publish // npm 패키지 배포
    ```
    

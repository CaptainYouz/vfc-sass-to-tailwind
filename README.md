# VFC Sass To Tailwind
This is a small app to transform automatically a vue file component from BM that uses `$style.A_STYLE` to Tailwind.
It is based on Tailwind DS configuration.
## Notes
The code is a quick and dirty one, and there are some bugs
## Bugs
- It does not handle css declaration such as `border: 1px solid red`. Since it's based on tailwind config, it only detects non grouped declaration.
- It is based on the DS Tailwind configuration, so every 'non-related' css will be considered as JIT. For example `padding-left: 34px` will become `padding-left-[34px]`
- It does not handle VFC that uses variables. If you want to generate it, you'll have to comment the lines that uses variables, sorry :trollface:
## How to use ?
```
npm i
npm run build
node dist/ YOUR_FILE_PATH_1 YOUR_FILE_PATH_2 YOUR_FILE_PATH_N
```
## Available option
### Write in file
By adding the `write-in-file` flag, the result will be inserted on top of your file
```
node dist/ --write-in-file YOUR_FILE_PATH
```
### With JIT
By adding the `withJIT` flag, style that can't be handle will be added to the result.

Example: `padding: 1.2rem 0` will become `padding-[1.2rem 0]`.

Add this flag if you want to have all the css in the result

```node dist/ --withJIT YOUR_FILE_PATH```

## Example

Here is the example of a result with a component (for security reason, i've truncate the path)

```
node dist --write-in-file --withJIT YOUR_PATH/Header.vue
Gonna transform: YOUR_PATH/Header.vue
header - $style.header: relative background-color-[#F9F9F9] height-[10rem] color-[#333333]

div - $style.headerTop: flex items-center justify-between height-[6rem]

actionbase - $style.headerTopLeft: flex h-full items-center padding-left-[1.3rem] padding-right-[1.3rem] color-[inherit] no-underline

backmarketlogo - $style.logo: width-[4.4rem] height-[3.4rem]

span - $style.merchantName: font-size-[1.7rem] font-bold ml-6 capitalize

div - $style.headerTopRight: flex h-full items-center

ul - $style.flags: flex items-center m-0

li - $style.flagList,{[$style.active]:currentLocale===locale},: height-[1.8rem] mr-4 cursor-pointer opacity-[0.25]

div - $style.userSection: flex relative items-center justify-center border-radius-[50%] height-[4rem] width-[4rem] margin-[0 0.8rem]

button - $style.buttonUserProfile: font-size-[inherit] font-family-[inherit] flex outline-[none] cursor-pointer

profileicon - $style.profileIcon: width-[2.5rem] height-[2.5rem] fill-[#838383]

ul - $style.userMenu: absolute top-[5.2rem] right-0 width-[15rem] border-radius-[2%] background-color-[#FFF] block z-index-[3] text-left font-size-[1.4rem] m-0 padding-[1rem 1.5rem] box-shadow-[0.4rem 0.4rem 0 rgba(131, 131, 131, 0.15)]

actionbase - $style.userMenuLink: block color-[inherit] no-underline padding-[0.2rem 0]

actionbase - $style.userMenuLink: block color-[inherit] no-underline padding-[0.2rem 0]

actionbase - $style.userMenuLink: block color-[inherit] no-underline padding-[0.2rem 0]

div - $style.headerBottom: flex justify-between items-center

nav - $style.navigation,{[$style.fullWidthNav]:!hasSwitch}: relative height-[4rem] width-[calc(100% - 20rem)] overflow-hidden

ul - $style.navigationList: flex overflow-x-scroll p-0 m-0

actionbase - $style.navigationLink: relative block line-height-[4rem] font-size-[1.3rem] padding-[0 3.1rem] uppercase color-[inherit]


transform done!
```

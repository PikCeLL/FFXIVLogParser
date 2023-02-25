# FFXIVLogParser
Make plots of FFXIV raid prog

![Result of running the Python version of this project on my TEA prog](/Examples/TEA_prog.png "TEA Prog")

## Requirements:
- Just a browser I think ?

## Usage:
Select your log files and then press the process button. Nothing much will happen because the JS version is a WiP.

## Dafuk iz dis
I rewrote a simplified (and hopefully somewhat expendable) parsing based on the description of what a log contained I found [here](https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md).
Then using ~~my immense JavaScript knowledge~~ Google I plotted the pull data in a way that reflects fight progression nicely.

This tool used to be written in Python, but it made it not very usable for the average raider. So I rewrote it in JavaScript in the hope of making it availbable online.

I am now aware that FFLogs has a similar feature, but I don't hink it existed back when I started. I also thing the readability is very poor, and you have to upload your logs under a static's name to have access to it.

## Known issues
As of now, the JS rewrite doesn't really do much beside outputing the list of pulls in the console. It also often has memory issues when parsing multiple files at once. 

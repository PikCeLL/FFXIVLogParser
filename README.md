# FFXIVLogParser
Make plots of FFXIV raid prog

![Result of running the Python version of this project on my TEA prog](/Examples/TEA_prog.png "TEA Prog")

## Requirements:
- Just a browser I think ?

## Usage:
Select your log files and then press the process button. This can take a while depending on your machine (everything runs locally), but you will end up with a graph similar to what you can see above.

## Dafuk iz dis
I rewrote a simplified (and hopefully somewhat expendable) parsing based on the description of what a log contained I found [here](https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md).
Then using ~~my immense JavaScript knowledge~~ Google I plotted the pull data in a way that reflects fight progression nicely.

This tool used to be written in Python, but it made it not very usable for the average raider. So I rewrote it in JavaScript to make it availbable globally (even if some languages are not supported, yet).

I am now aware that FFLogs has a similar feature, but I don't think it existed back when I started. I also think the readability is very poor, and you have to upload your logs under a static's name to have access to it.

## Known issues
* Some of the triggers for TOP's phases are a bit wonky, but aside from being a few seconds off they should work properly.
* TOP is missing some Japanese translation for phase triggers.
* Language other than English, French, Japanese, Korean and Chinese are not supported for phases. The graph should still appear in all phase 1.
* Must read uncompressed .log files, which can add up to some serious disk space.

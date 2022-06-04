# FFXIVLogParser
Make plots of FFXIV raid prog

![Result of running this project on my TEA prog](/Examples/TEA_prog.png "TEA Prog")

## Requirements:
- Python 3 (maybe less? idk am not a python boi)
- [sortedcontainers](https://grantjenks.com/docs/sortedcontainers/) (might be able to do without but me lazy)
- [matplotlib](https://matplotlib.org/) because graph yeah
- Maybe other stuff I already had installed and didn't make my life a pain as I tried to access it there

## Usage:
Get the requirements right, edit [this file](graph.py) with the folder where your logs are[^1] and which fight you want to graph[^2]. Then run that same file. After some hardcore parsing (can be _long_ if the folder is big) the graph should show up.

## Dafuk iz dis
I rewrote a simplified (and hopefully somewhat expendable) parsing based on the description of what a log contained I found [here](https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md).
Then using ~~my immense Python knowledge~~ Google I plotted the pull data in a way that reflects fight progression nicely.

I'm aware that the code is probably not very idiomatic or clever, but it works for my use. One obvious improvement I think about is making it so one can use the tool without having to edit a file, with command line arguments to chose which fight to plot.

[^1]: just edit the `logFolder` variable

[^2]: If you fight is in the preset variables, you can use those in the `create_graph()` call at the bottom, else you will need to fill en Encounter objet from scratch.

import re
import datetime
import os
from sortedcontainers import SortedDict
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import imageio

#logFolder = "D:\\PikCeLL\\Documents\\TEST"
logFolder = "D:\\PikCeLL\\Documents\\Logs_FF"

# TEA
#fightID = "80037586"
#phaseColors = ['b','r','y','g']
#phases = [2.20,5.5,11.6,18.83]
#phaseNames = ["LL", "BJCC", "Alex Prime", "Perfect"]

# UCoB
fightID = "80037569"
phaseColors = ['b','r','y','g']
phases = [2.3,5,5,5]
phaseNames = ["Twintania", "Nael", "Bahamut", "Golden"]

wipeRegExp = re.compile(r"33\|([0-9]*)-([0-9]*)-([0-9]*)T([0-9]*):([0-9]*):([0-9]*).*\|"+fightID+"\|40000005.*")
clearRegExp = re.compile(r"33\|([0-9]*)-([0-9]*)-([0-9]*)T([0-9]*):([0-9]*):([0-9]*).*\|"+fightID+"\|40000003.*")
startRegExp = re.compile(r"00\|([0-9]*)-([0-9]*)-([0-9]*)T([0-9]*):([0-9]*):([0-9]*).*\|0039\|\|Engage!\|.*")

minFrameDuration = 0.02
rampUpTime = 5
rampDownTime = 2
gifTime = 15

def parseLog(logFile, dict):
	with open(logFile, 'r', encoding="utf8") as logSource:
		startTime = datetime.datetime(9999,12,31)
		endTime = datetime.datetime(1,1,1)
		clear = False
		for i, line in enumerate(logSource):
			startMatch = startRegExp.match(line)
			if startMatch:
				startTime = datetime.datetime(int(startMatch.group(1)),int(startMatch.group(2)),int(startMatch.group(3)),int(startMatch.group(4)),int(startMatch.group(5)),int(startMatch.group(6)))
			else:
				wipeMatch = wipeRegExp.match(line)
				if wipeMatch:
					endTime = datetime.datetime(int(wipeMatch.group(1)),int(wipeMatch.group(2)),int(wipeMatch.group(3)),int(wipeMatch.group(4)),int(wipeMatch.group(5)),int(wipeMatch.group(6)))
					clear = False
				else:
					clearMatch = clearRegExp.match(line)
					if clearMatch:
						endTime = datetime.datetime(int(clearMatch.group(1)),int(clearMatch.group(2)),int(clearMatch.group(3)),int(clearMatch.group(4)),int(clearMatch.group(5)),int(clearMatch.group(6)))
						clear = True
			if endTime > startTime:
				duration = (endTime-startTime).total_seconds()/60
				dict[startTime] = (duration,clear)
				startTime = datetime.datetime(9999,12,31)
				endTime = datetime.datetime(1,1,1)

def parseFolder():
	dict = SortedDict()
	i = 1
	totalFiles = len(os.listdir(logFolder))
	for filename in os.listdir(logFolder):
		print(f"File {i} of {totalFiles}")
		i += 1
		parseLog(logFolder+"\\"+filename,dict)
	plt.xlabel("Pull #")
	plt.ylabel("Duration (min)")
	plt.figure(figsize=(16,9))
	adjustedPhases = [0] + phases
	for iPhase in range(len(phases)):
		plt.axhspan(adjustedPhases[iPhase], adjustedPhases[iPhase+1], facecolor=phaseColors[iPhase], alpha=0.1)
	filenames = []
	t = datetime.timedelta()
	wipecount = []
	wipecount = [0 for i in range(5)]
	
	
	rampUpIdx = len(dict)
	rampDownIdx = 0
	frameDuration = gifTime/len(dict)
	frameStep = 1
	if frameDuration < minFrameDuration:
		frameDuration = minFrameDuration
		rampUpIdx = rampUpTime/frameDuration
		rampDownIdx = rampDownTime/frameDuration
		frameStep = (len(dict) - rampUpIdx - rampDownIdx) / ((gifTime - rampUpTime - rampDownTime) / frameDuration)
	print(f"up {rampUpIdx}\ndown {rampDownIdx}\nstep {frameStep}")
	
	for j in range(len(dict)):
		# Dots
		if dict.peekitem(j)[1][1]:
			plt.plot(j, dict.peekitem(j)[1][0], color='yellow', marker='*', markeredgecolor='gray', markersize=10)
		else:
			plt.plot(j, dict.peekitem(j)[1][0], color='blue', marker='o', markersize=5)
		t += datetime.timedelta(seconds=int(dict.peekitem(j)[1][0]*60))
		plt.title(f"UCoB prog : {j+1} pulls ({t} combat time)")
		
		# Legend
		patches = []
		counted = False
		for iPatch in range(len(phases)):
			if (not counted and dict.peekitem(j)[1][0] < phases[iPatch]):
				counted = True
				wipecount[iPatch] += 1
			patches += [mpatches.Patch(color=phaseColors[iPatch], label=(phaseNames[iPatch]) + f": {wipecount[iPatch]}")]
		plt.legend(handles=patches, loc="upper left")
		
		# create file name and append it to a list
		if j < rampUpIdx or j > (len(dict) - rampDownIdx) or (j - rampUpIdx)%int(frameStep) == 0:
			filename = f'{j}.png'
			filenames.append(filename)
			# save frame
			plt.savefig(filename)
		
	# build gif
	with imageio.get_writer('mygif.gif', format='GIF-PIL', mode='I', loop = 1, duration=frameDuration, subrectangles=True) as writer:
		for filename in filenames:
			image = imageio.imread(filename)
			writer.append_data(image)
	for filename in set(filenames):
		os.remove(filename)
	plt.show()

parseFolder()
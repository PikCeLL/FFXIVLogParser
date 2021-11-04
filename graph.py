from folderParser import parseFolder, Encounter
import matplotlib.pyplot as plt
from datetime import timedelta

#logFolder = "D:\\PikCeLL\\Documents\\TEST"
logFolder = "D:\\PikCeLL\\Documents\\Logs_FF"

TEA = Encounter('80037586', 'TEA', ["Living Liquid", "Cruise Chaser", "Alexander Prime", "Perfect Alexander"])
UCoB = Encounter('80037569', 'UCoB', ["Twintania", "Nael Deus Darnus", "Bahamut Prime", "Twintania", "Bahamut Prime"])

phaseColors = ['g','r','b','y','lime','lime']
		
def createGraph(folder, encounter):
	plt.xlabel("Pull #")
	plt.ylabel("Duration (min)")
	plt.figure(figsize=(16,9))
	
	pullSet = parseFolder(folder, encounter)
	
	t = timedelta()
	
	for i in range(len(pullSet)):
		plt.plot(i, (pullSet[i].end - pullSet[i].start).total_seconds()/60, color=phaseColors[pullSet[i].phase], marker='o', markersize=5)
		t += timedelta(seconds=(pullSet[i].end - pullSet[i].start).total_seconds())
		plt.title(f"{encounter.humanReadableName} prog : {i+1} pulls ({t} combat time)")
	plt.show()
	
createGraph(logFolder, UCoB)
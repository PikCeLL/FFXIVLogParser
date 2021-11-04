from NetworkLineEvent import NetworkLineEvent, EventType, InstanceEventType
from sortedcontainers import SortedSet
from datetime import datetime
import os

class Pull:
	"""Summary of a pull."""
	
	start = datetime(9999,12,31)
	end = datetime(1,1,1)
	isClear = False
	phase = 0
	
	def __lt__(self, other):
		return self.start < other.start
		
	def __eq__(self, other):
		return self.start == other.start
		
	def __repr__(self):
		return 	"Pull ranging from %s\nto %s\n" \
				"is a clear : %s\n" \
				"ended in phase %s\n" % (self.start, self.end, self.isClear, self.phase)

	def __hash__(self):
		return hash(self.start)

class Encounter:
	"""Properties of an encounter."""
	
	id = '00000000'
	humanReadableName = 'boss'
	targetSplit = []
	
	def __init__(self, id, name, targetSplit = []):
		self.id = id
		self.humanReadableName = name
		self.targetSplit = targetSplit

def parseFile(file, encounter):
	with open(file, 'r', encoding="utf8") as logSource:
		pullSet = SortedSet()
		currentPull = Pull()
		isPullAboutToStart = False
		for i, line in enumerate(logSource):
			readLine = NetworkLineEvent(line, readsAbility = True, readsInstance = True)
			#Debug
			#if readLine.type != EventType.UNREAD:
			#	print(readLine)
			if readLine.type == EventType.INSTANCE:
				if (readLine.instanceType == InstanceEventType.RESET or readLine.instanceType == InstanceEventType.INIT) and readLine.name == encounter.id:
					#Debug
					#print("***Ready to start***")
					isPullAboutToStart = True
				elif readLine.instanceType == InstanceEventType.WIPE and readLine.name == encounter.id:
					#Debug
					#print("***Wiped***")
					currentPull.end = readLine.timestamp
					if currentPull.start < currentPull.end:
						pullSet.add(currentPull)
					currentPull = Pull()
				elif readLine.instanceType == InstanceEventType.CLEAR and readLine.name == encounter.id:
					#Debug
					#print("***Cleared***")
					currentPull.end = readLine.timestamp
					currentPull.isClear = True
					if currentPull.start < currentPull.end:
						pullSet.add(currentPull)
					currentPull = Pull()
			elif readLine.type == EventType.ABILITY:
				if isPullAboutToStart and readLine.target == encounter.targetSplit[0]:
					#Debug
					#print("***Started***")
					currentPull.start = readLine.timestamp
					isPullAboutToStart = False
				if currentPull.phase+1 < len(encounter.targetSplit) and readLine.target == encounter.targetSplit[currentPull.phase+1]:
					#Debug
					#print("***Phased***")
					currentPull.phase = currentPull.phase+1
		return pullSet

def parseFolder(folder, encounter):
	pullSet = SortedSet()
	i = 1
	totalFiles = len(os.listdir(folder))
	for filename in os.listdir(folder):
		print(f"Parsing file {i} of {totalFiles}")
		i += 1
		pullSet = pullSet.union(parseFile(folder+"\\"+filename,encounter))
	return pullSet
	
print(parseFolder("D:\\PikCeLL\\Documents\\Logs_FF",Encounter('80037569', 'UCoB', ["Twintania", "Nael Deus Darnus", "Bahamut Prime"])))
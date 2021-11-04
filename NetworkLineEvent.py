from enum import Enum, auto
import re
from datetime import datetime

# Resource : https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md

startCastRegEx = re.compile(r"^(?P<type>(?:20))\|(?P<timestamp>(?:[^|]*))\|(?P<sourceId>(?:[^|]*))\|(?P<source>(?:[^|]*))\|(?P<id>(?:[^|]*))\|(?P<ability>(?:[^|]*))\|(?P<targetId>(?:[^|]*))\|(?P<target>(?:[^|]*))\|(?P<castTime>(?:[^|]*))\|(?P<x>(?:[^|]*))\|(?P<y>(?:[^|]*))\|(?P<z>(?:[^|]*))\|(?P<heading>(?:[^|]*))\|")
abilityRegEx = re.compile(r"^(?P<type>(?:2[12]))\|(?P<timestamp>(?:[^|]*))\|(?P<sourceId>(?:[^|]*))\|(?P<source>(?:[^|]*))\|(?P<id>(?:[^|]*))\|(?P<ability>(?:[^|]*))\|(?P<targetId>(?:[^|]*))\|(?P<target>(?:[^|]*))\|(?P<flags>(?:[^|]*))\|(?P<damage>(?:[^|]*))\|(?:[^|]*\|){14}(?P<targetCurrentHp>(?:[^|]*))\|(?P<targetMaxHp>(?:[^|]*))\|(?P<targetCurrentMp>(?:[^|]*))\|(?P<targetMaxMp>(?:[^|]*))\|(?:[^|]*\|){2}(?P<targetX>(?:[^|]*))\|(?P<targetY>(?:[^|]*))\|(?P<targetZ>(?:[^|]*))\|(?P<targetHeading>(?:[^|]*))\|(?P<currentHp>(?:[^|]*))\|(?P<maxHp>(?:[^|]*))\|(?P<currentMp>(?:[^|]*))\|(?P<maxMp>(?:[^|]*))\|(?:[^|]*\|){2}(?P<x>(?:[^|]*))\|(?P<y>(?:[^|]*))\|(?P<z>(?:[^|]*))\|(?P<heading>(?:[^|]*))\|")
deathRegEx = re.compile(r"^(?P<type>(?:25))\|(?P<timestamp>(?:[^|]*))\|(?P<targetId>(?:[^|]*))\|(?P<target>(?:[^|]*))\|(?P<sourceId>(?:[^|]*))\|(?P<source>(?:[^|]*))\|")
effectGainedRegEx = re.compile(r"^(?P<type>(?:26))\|(?P<timestamp>(?:[^|]*))\|(?P<effectId>(?:[^|]*))\|(?P<effect>(?:[^|]*))\|(?P<duration>(?:[^|]*))\|(?P<sourceId>(?:[^|]*))\|(?P<source>(?:[^|]*))\|(?P<targetId>(?:[^|]*))\|(?P<target>(?:[^|]*))\|(?P<count>(?:[^|]*))\|(?P<targetHp>(?:[^|]*))\|(?P<hp>(?:[^|]*))\|")
effectLostRegEx = re.compile(r"^(?P<type>(?:30))\|(?P<timestamp>(?:[^|]*))\|(?P<effectId>(?:[^|]*))\|(?P<effect>(?:[^|]*))\|(?:[^|]*\|)(?P<sourceId>(?:[^|]*))\|(?P<source>(?:[^|]*))\|(?P<targetId>(?:[^|]*))\|(?P<target>(?:[^|]*))\|(?P<count>(?:[^|]*))\|")
instanceRegEx = re.compile(r"^(?P<type>(?:33))\|(?P<timestamp>(?:[^|]*))\|(?P<instance>(?:[^|]*))\|(?P<command>(?:[^|]*))\|(?P<data0>(?:[^|]*))\|(?P<data1>(?:[^|]*))\|(?P<data2>(?:[^|]*))\|(?P<data3>(?:[^|]*))\|")

def convertString2Date(string):
	return datetime.strptime(string[:-7], '%Y-%m-%dT%H:%M:%S.%f')

class EventType(Enum):
	START_CASTING = auto()
	ABILITY = auto()
	DEATH = auto()
	EFFECT_GAINED = auto()
	EFFECT_LOST = auto()
	INSTANCE = auto()
	UNREAD = auto()

class InstanceEventType(Enum):
	INIT = '40000001'
	WIPE = '40000005'
	CLEAR = '40000003'
	RESET = '40000010'
	IRRELEVENT = auto()
	

class NetworkLineEvent:
	"""Describes what happened on a line"""

	type = EventType.UNREAD
	timestamp = datetime(9999,12,31)
	source = ""
	target = ""
	name = ""
	instanceType = InstanceEventType.IRRELEVENT
	
	def __init__(self, line, readsStartCast = False, readsAbility = False, readsDeath = False, readsEffectGained = False, readsEffectLost = False, readsInstance = False):
		isRead = False
		if readsStartCast and not isRead:
			matches= startCastRegEx.match(line)
			if matches:
				self.type = EventType.START_CASTING
				self.timestamp = convertString2Date(matches.group('timestamp'))
				self.source = matches.group('source')
				self.target = matches.group('target')
				self.name = matches.group('ability')
				isRead = True
		if readsAbility and not isRead:
			matches= abilityRegEx.match(line)
			if matches:
				self.type = EventType.ABILITY
				self.timestamp = convertString2Date(matches.group('timestamp'))
				self.source = matches.group('source')
				self.target = matches.group('target')
				self.name = matches.group('ability')
				isRead = True
		if readsDeath and not isRead:
			matches= deathRegEx.match(line)
			if matches:
				self.type = EventType.DEATH
				self.timestamp = convertString2Date(matches.group('timestamp'))
				self.source = matches.group('source')
				self.target = matches.group('target')
				isRead = True
		if readsEffectGained and not isRead:
			matches= effectGainedRegEx.match(line)
			if matches:
				self.type = EventType.EFFECT_GAINED
				self.timestamp = convertString2Date(matches.group('timestamp'))
				self.source = matches.group('source')
				self.target = matches.group('target')
				self.name = matches.group('effect')
				isRead = True
		if readsEffectLost and not isRead:
			matches= effectLostRegEx.match(line)
			if matches:
				self.type = EventType.EFFECT_GAINED
				self.timestamp = convertString2Date(matches.group('timestamp'))
				self.source = matches.group('source')
				self.target = matches.group('target')
				self.name = matches.group('effect')
				isRead = True
		if readsInstance and not isRead:
			matches= instanceRegEx.match(line)
			if matches:
				command = matches.group('command')
				if command in [e.value for e in InstanceEventType]:
					self.type = EventType.INSTANCE
					self.timestamp = convertString2Date(matches.group('timestamp'))
					self.name = matches.group('instance')
					self.instanceType = InstanceEventType(command)
				else:
					self.type = EventType.UNREAD
					self.instanceType = InstanceEventType.IRRELEVENT
				isRead = True

	def __repr__(self):
		return 	"============== LINE CONTENT ==============\n" \
				"type = %s \n" \
				"timestamp = %s \n" \
				"source = %s \n" \
				"target = %s \n" \
				"name = %s \n" \
				"instanceType = %s" % (self.type.name, self.timestamp, self.source, self.target, self.name, self.instanceType.name)

	def __lt__(self, other):
		return self.timestamp < other.timestamp
		
	def __eq__(self, other):
		return self.timestamp == other.timestamp


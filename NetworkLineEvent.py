from enum import Enum, auto
import re
from datetime import datetime

# Resource : https://github.com/quisquous/cactbot/blob/main/docs/LogGuide.md

startCastRegEx = re.compile(r"^(?P<type>20)\|(?P<timestamp>[^|]*)\|(?P<sourceId>[^|]*)\|(?P<source>[^|]*)\|(?P<id>[^|]*)\|(?P<ability>[^|]*)\|(?P<targetId>[^|]*)\|(?P<target>[^|]*)\|(?P<castTime>[^|]*)\|(?P<x>[^|]*)\|(?P<y>[^|]*)\|(?P<z>[^|]*)\|(?P<heading>[^|]*)\|")
abilityRegEx = re.compile(r"^(?P<type>2[12])\|(?P<timestamp>[^|]*)\|(?P<sourceId>[^|]*)\|(?P<source>[^|]*)\|(?P<id>[^|]*)\|(?P<ability>[^|]*)\|(?P<targetId>[^|]*)\|(?P<target>[^|]*)\|(?P<flags>[^|]*)\|(?P<damage>[^|]*)\|(?:[^|]*\|){14}(?P<targetCurrentHp>[^|]*)\|(?P<targetMaxHp>[^|]*)\|(?P<targetCurrentMp>[^|]*)\|(?P<targetMaxMp>[^|]*)\|(?:[^|]*\|){2}(?P<targetX>[^|]*)\|(?P<targetY>[^|]*)\|(?P<targetZ>[^|]*)\|(?P<targetHeading>[^|]*)\|(?P<currentHp>[^|]*)\|(?P<maxHp>[^|]*)\|(?P<currentMp>[^|]*)\|(?P<maxMp>[^|]*)\|(?:[^|]*\|){2}(?P<x>[^|]*)\|(?P<y>[^|]*)\|(?P<z>[^|]*)\|(?P<heading>[^|]*)\|")
deathRegEx = re.compile(r"^(?P<type>25)\|(?P<timestamp>[^|]*)\|(?P<targetId>[^|]*)\|(?P<target>[^|]*)\|(?P<sourceId>[^|]*)\|(?P<source>[^|]*)\|")
effectGainedRegEx = re.compile(r"^(?P<type>26)\|(?P<timestamp>[^|]*)\|(?P<effectId>[^|]*)\|(?P<effect>[^|]*)\|(?P<duration>[^|]*)\|(?P<sourceId>[^|]*)\|(?P<source>[^|]*)\|(?P<targetId>[^|]*)\|(?P<target>[^|]*)\|(?P<count>[^|]*)\|(?P<targetHp>[^|]*)\|(?P<hp>[^|]*)\|")
effectLostRegEx = re.compile(r"^(?P<type>30)\|(?P<timestamp>[^|]*)\|(?P<effectId>[^|]*)\|(?P<effect>[^|]*)\|[^|]*\|(?P<sourceId>[^|]*)\|(?P<source>[^|]*)\|(?P<targetId>[^|]*)\|(?P<target>[^|]*)\|(?P<count>[^|]*)\|")
instanceRegEx = re.compile(r"^(?P<type>33)\|(?P<timestamp>[^|]*)\|(?P<instance>[^|]*)\|(?P<command>[^|]*)\|(?P<data0>[^|]*)\|(?P<data1>[^|]*)\|(?P<data2>[^|]*)\|(?P<data3>[^|]*)\|")


def convert_string_2_date(string):
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
    TIME_OUT = '80000003'
    IRRELEVANT = auto()


class NetworkLineEvent:
    """Describes what happened on a line"""

    type = EventType.UNREAD
    timestamp = datetime(9999, 12, 31)
    source = ""
    target = ""
    name = ""
    instanceType = InstanceEventType.IRRELEVANT

    def __init__(self, line, reads_start_cast=False, reads_ability=False, reads_death=False, reads_effect_gained=False,
                 reads_effect_lost=False, reads_instance=False):
        is_read = False
        if reads_start_cast and not is_read:
            matches = startCastRegEx.match(line)
            if matches:
                self.type = EventType.START_CASTING
                self.timestamp = convert_string_2_date(matches.group('timestamp'))
                self.source = matches.group('source')
                self.target = matches.group('target')
                self.name = matches.group('ability')
                is_read = True
        if reads_ability and not is_read:
            matches = abilityRegEx.match(line)
            if matches:
                self.type = EventType.ABILITY
                self.timestamp = convert_string_2_date(matches.group('timestamp'))
                self.source = matches.group('source')
                self.target = matches.group('target')
                self.name = matches.group('ability')
                is_read = True
        if reads_death and not is_read:
            matches = deathRegEx.match(line)
            if matches:
                self.type = EventType.DEATH
                self.timestamp = convert_string_2_date(matches.group('timestamp'))
                self.source = matches.group('source')
                self.target = matches.group('target')
                is_read = True
        if reads_effect_gained and not is_read:
            matches = effectGainedRegEx.match(line)
            if matches:
                self.type = EventType.EFFECT_GAINED
                self.timestamp = convert_string_2_date(matches.group('timestamp'))
                self.source = matches.group('source')
                self.target = matches.group('target')
                self.name = matches.group('effect')
                is_read = True
        if reads_effect_lost and not is_read:
            matches = effectLostRegEx.match(line)
            if matches:
                self.type = EventType.EFFECT_GAINED
                self.timestamp = convert_string_2_date(matches.group('timestamp'))
                self.source = matches.group('source')
                self.target = matches.group('target')
                self.name = matches.group('effect')
                is_read = True
        if reads_instance and not is_read:
            matches = instanceRegEx.match(line)
            if matches:
                command = matches.group('command')
                if command in [e.value for e in InstanceEventType]:
                    self.type = EventType.INSTANCE
                    self.timestamp = convert_string_2_date(matches.group('timestamp'))
                    self.name = matches.group('instance')
                    self.instanceType = InstanceEventType(command)
                else:
                    self.type = EventType.UNREAD
                    self.instanceType = InstanceEventType.IRRELEVANT

    def __repr__(self):
        return "============== LINE CONTENT ==============\n" \
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

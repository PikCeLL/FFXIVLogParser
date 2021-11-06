from NetworkLineEvent import NetworkLineEvent, EventType, InstanceEventType
from sortedcontainers import SortedSet
from datetime import datetime
import os


class Pull:
    """Summary of a pull."""

    start = datetime(9999, 12, 31)
    end = datetime(1, 1, 1)
    isClear = False
    phase = 0

    def __lt__(self, other):
        return self.start < other.start

    def __eq__(self, other):
        return self.start == other.start

    def __repr__(self):
        return "Pull ranging from %s\nto %s\n" \
               "is a clear : %s\n" \
               "ended in phase %s\n" % (self.start, self.end, self.isClear, self.phase)

    def __hash__(self):
        return hash(self.start)


class Encounter:
    """Properties of an encounter."""

    id = '00000000'
    humanReadableName = 'boss'
    targetSplit = []

    def __init__(self, id, name, target_split=[]):
        self.id = id
        self.humanReadableName = name
        self.targetSplit = target_split


def parse_file(file, encounter):
    with open(file, 'r', encoding="utf8") as logSource:
        pull_set = SortedSet()
        current_pull = Pull()
        is_pull_about_to_start = False
        for i, line in enumerate(logSource):
            read_line = NetworkLineEvent(line, reads_ability=True, reads_instance=True)
            if read_line.type == EventType.INSTANCE:
                if (read_line.instanceType == InstanceEventType.RESET or read_line.instanceType == InstanceEventType.INIT) and read_line.name == encounter.id:
                    is_pull_about_to_start = True
                elif (read_line.instanceType == InstanceEventType.WIPE or read_line.instanceType == InstanceEventType.TIME_OUT) and read_line.name == encounter.id:
                    current_pull.end = read_line.timestamp
                    if current_pull.start < current_pull.end:
                        pull_set.add(current_pull)
                    current_pull = Pull()
                elif read_line.instanceType == InstanceEventType.CLEAR and read_line.name == encounter.id:
                    current_pull.end = read_line.timestamp
                    current_pull.isClear = True
                    if current_pull.start < current_pull.end:
                        pull_set.add(current_pull)
                    current_pull = Pull()
            elif read_line.type == EventType.ABILITY:
                if is_pull_about_to_start and read_line.target == encounter.targetSplit[0]:
                    current_pull.start = read_line.timestamp
                    is_pull_about_to_start = False
                if current_pull.phase + 1 < len(encounter.targetSplit) and (read_line.target == encounter.targetSplit[current_pull.phase + 1] and read_line.source != read_line.target):
                    current_pull.phase = current_pull.phase + 1
        return pull_set


def parse_folder(folder, encounter):
    pull_set = SortedSet()
    i = 1
    total_files = len(os.listdir(folder))
    for filename in os.listdir(folder):
        print(f"Parsing file {i} of {total_files}")
        i += 1
        pull_set = pull_set.union(parse_file(folder + "\\" + filename, encounter))
    return pull_set


def main():
    print(parse_file("D:\\PikCeLL\\Documents\\Logs_FF\\Network_22106_20211105.log", Encounter('80037569', 'UCoB', ["Twintania", "Nael Deus Darnus", "Bahamut Prime", "Twintania", "Bahamut Prime"])))


if __name__ == "__main__":
    main()

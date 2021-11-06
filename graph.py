from folderParser import parse_folder, Encounter
import matplotlib.pyplot as plt
from datetime import timedelta

# logFolder = "D:\\PikCeLL\\Documents\\TEST"
logFolder = "D:\\PikCeLL\\Documents\\Logs_FF"

TEA = Encounter('80037586', 'TEA', ["Living Liquid", "Cruise Chaser", "Alexander Prime", "Perfect Alexander"])
UCoB = Encounter('80037569', 'UCoB', ["Twintania", "Nael Deus Darnus", "Bahamut Prime", "Twintania", "Bahamut Prime"])

phaseColors = ['g', 'r', 'b', 'chocolate', 'y']


def create_graph(folder, encounter):
    plt.xlabel("Pull #")
    plt.ylabel("Duration (min)")
    plt.figure(figsize=(16, 9))

    pull_set = parse_folder(folder, encounter)

    t = timedelta()

    for i in range(len(pull_set)):
        plt.plot(i, (pull_set[i].end - pull_set[i].start).total_seconds() / 60, color=phaseColors[pull_set[i].phase],
                 marker='o', markersize=5)
        t += timedelta(seconds=(pull_set[i].end - pull_set[i].start).total_seconds())
        plt.title(f"{encounter.humanReadableName} prog : {i + 1} pulls ({t} combat time)")
    plt.show()


create_graph(logFolder, UCoB)

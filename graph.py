from folderParser import parse_folder, Encounter
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from datetime import timedelta

# ====Logs Folder====
# logFolder = "D:\\PikCeLL\\Documents\\TEST"
logFolder = "D:\\PikCeLL\\Documents\\Logs_FF_old"

# ====ULTIMATES====
TEA = Encounter('80037586', 'TEA', ["Living Liquid", "Cruise Chaser", "Alexander Prime", "Perfect Alexander"], ["LL", "BJCC", "Prime", "Perfect"])
UCoB = Encounter('80037569', 'UCoB', ["Twintania", "Nael deus Darnus", "Bahamut Prime", "Twintania", "Bahamut Prime"], ["Twin", "Nael", "Trios", "Adds", "Golden"])
UwU = Encounter('80037573', 'UwU', ["Garuda", "Ifrit", "Titan", "The Ultima Weapon"], ["Garuda", "Ifrit", "Titan", "Ultima"] )
DSR = Encounter('8003759A', 'DSR', ["King Thordan", "Nidhogg", "Right Eye", "Ser Charibert", "King Thordan", "Hraesvelgr", "Dragon-king Thordan"], ["King Thordan", "Nidhogg", "Eyes", "Rewind!", "King Thordan II", "Dragons", "The Dragon King"])

# ====SAVAGES====
# Empty for now, not as relevant

# ====Phase colors====
phaseColors = ['b', 'r', 'g', 'y', 'gold', 'm', 'black']


def create_graph(folder, encounter):
    plt.figure(figsize=(16, 9))

    pull_set = parse_folder(folder, encounter)

    t = timedelta()

    wipe_count = [0 for i in range(len(encounter.phaseLabels))]
    patches = []

    for i in range(len(pull_set)):
        if pull_set[i].isClear:
            plt.plot(i, (pull_set[i].end - pull_set[i].start).total_seconds() / 60,
                     color='gold',
                     marker='*', markersize=15)
        else:
            wipe_count[pull_set[i].phase] += 1
            plt.plot(i, (pull_set[i].end - pull_set[i].start).total_seconds() / 60,
                     color=phaseColors[pull_set[i].phase],
                     marker='o', markersize=5, label="test")
        t += timedelta(seconds=(pull_set[i].end - pull_set[i].start).total_seconds())
        plt.title(f"{encounter.humanReadableName} prog : {i + 1} pulls ({t} combat time)")

    for iPatch in range(len(wipe_count)):
        patches += [mpatches.Patch(color=phaseColors[iPatch], label=(encounter.phaseLabels[iPatch]) + f": {wipe_count[iPatch]}")]

    plt.legend(handles=patches, loc="upper left")
    plt.xlabel("Pull #")
    plt.ylabel("Duration (min)")
    plt.show()


# Actual call
create_graph(logFolder, TEA)

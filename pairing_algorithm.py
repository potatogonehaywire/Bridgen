#pairing old people with young people

import pandas as pd
import os

def sort(file):
    data = pd.read_csv(file)

    data = data.drop(columns="Timestamp", axis=1)

    data.columns = ["Name", "Email", "Bio", "Group", "Age", "Yteach", "Ylearn", "Ytutor", "Ysubject", "Eteach", "Elearn", "Etutor", "Esubject"]

    data["Yteach"] = data["Yteach"].str.split(";")
    data["Ylearn"] = data["Ylearn"].str.split(";")
    data["Ysubject"] = data["Ysubject"].str.split(";")
    data["Eteach"] = data["Eteach"].str.split(";")
    data["Elearn"] = data["Elearn"].str.split(";")
    data["Esubject"] = data["Esubject"].str.split(";")

    youth = data[(data["Age"] == "Youth")]
    elderly = data[(data["Age"] == "Elderly")]
    y_group = youth[(data["Group"] == "Yes")]
    e_group = elderly[(data["Group"] == "Yes")]

    return youth, elderly, y_group, e_group


def similarities (person, teacher, is_youth, tutor):
    points = 0

    if is_youth:
        for t_hobby in person.Yteach:
            if t_hobby in teacher.Elearn:
                points += 1
        
        for l_hobby in person.Ylearn:
            if l_hobby in teacher.Eteach:
                points += 1

        if tutor:
            if isinstance(teacher.Esubject, list):
                for subject in person.Ysubject:
                    if subject in teacher.Esubject:
                        points += 1

        return points    
    else:
        interests = ()
        for t_hobby in person.Eteach:
            if t_hobby in teacher.Ylearn:
                points += 1
                interests = (*interests, t_hobby)

        for l_hobby in person.Elearn:
            if l_hobby in teacher.Yteach:
                points += 1
                interests = (*interests, l_hobby)

        if tutor:
            if isinstance(teacher.Ysubject, list):
                for subject in person.Esubject:
                    if subject in teacher.Ysubject:
                        points += 1
                        interests = (*interests, subject)

        return points, interests


def score(age1, age2):

    all_scored = {}
    all_match_interests = {}

    for person in age1.itertuples():

        teachers_scored = {}
        
        matching_interests = {}

        for teacher in age2.itertuples():
            if person.Age == "Youth":
                if person.Ytutor == "Yes":
                    teachers_scored[teacher.Name] = similarities(person, teacher, True, True)
                else:
                    teachers_scored[teacher.Name] = similarities(person, teacher, True, False)
            else:
                if person.Etutor == "Yes":
                    teachers_scored[teacher.Name], matching_interests[teacher.Name] = similarities(person, teacher, False, True)
                else:
                    teachers_scored[teacher.Name], matching_interests[teacher.Name] = similarities(person, teacher, True, False)
        
        all_scored[person.Name] = teachers_scored


        all_match_interests[person.Name] = matching_interests

    all_ranked = rank(all_scored)

    return all_ranked, all_match_interests


def rank(age):
    for person in age.keys():
        person_pref = []
        person_sorted = dict(sorted(age[person].items(), key = lambda x:x[1], reverse = True))
        for teacher in person_sorted.keys():
            person_pref.append(teacher)
        age[person] = person_pref
    return age


def pairing(all_youth, all_elderly):
    youth_free = list(all_youth.keys())
    elderly_free = list(all_elderly.keys())
    pairs = {}


    while len(youth_free) > 0 and len(elderly_free) > 0:

        youth = youth_free.pop(0)

        for elder in all_youth[youth]:
            if elder in elderly_free:
                pairs[youth] = elder
                elderly_free.remove(elder)
                break
            else:
                current_match = list(pairs.keys())[list(pairs.values()).index(elder)]
                if all_elderly[elder].index(youth) < all_elderly[elder].index(current_match):
                    pairs[youth] = elder
                    pairs[current_match] = ""
                    youth_free.append(current_match)
                    break
    
    return pairs


def groups(y_group, e_group, paired, e_interest_match):
    e_group.rename(columns = {"Name":"e_Name", "Email":"e_Email", "Bio":"e_Bio", "Group":"e_Group", "Age":"e_Age"}, inplace=True)
    
    e_group = e_group.drop(["Yteach", "Ylearn", "Ytutor", "Ysubject"], axis=1)
    y_group = y_group.drop(["Eteach", "Elearn", "Etutor", "Esubject"], axis=1)

    e_group.set_index("e_Name", inplace=True)

    y_group["Elder"] = ""

    y_group.set_index("Name", inplace=True, drop=False)

    for young_person, elder_person in paired.items():
        y_group.at[young_person, "Elder"] = elder_person
    
    y_group.set_index("Elder", inplace=True)

    groups = pd.concat([y_group, e_group], axis=1).reindex(y_group.index)

    groups["MatchingInterests"] = ""

    for young, old in paired.items():
        for interest in e_interest_match[old][young]:
            groups.loc[old, "MatchingInterests"] += interest + ","
    
    groups.rename(columns = {"Name":"y_Name"}, inplace=True)
    groups.set_index("y_Name", drop=False, inplace=True)

    return groups


def group_similarities(pair, other):
    points = 0

    pair_interests = pair.MatchingInterests.split(",")
    other_interests = other.MatchingInterests.split(",")

    for interest in pair_interests:
        if interest in other_interests:
            points += 1
    
    return points


def group_score(group):
    all_scored = {}

    for pair in group.itertuples():
        pair_scored = {}

        c_group = group[(group["y_Name"] != pair.y_Name)]

        for other in c_group.itertuples():
            pair_scored[other.Index] = group_similarities(pair, other)

        all_scored[pair.Index] = pair_scored

    all_ranked = rank(all_scored)

    return all_ranked


def group_pairing(groups):
    """uses a variant of the gale-shapley algorithm to match the best possible pairs"""
    #initialize everyone as free
    unpaired = list(groups.keys())
    #initialize proposals dictionary with people as keys and an empty list as value
    proposals = {person: [] for person in groups.keys()}
    #initialize matches dictionary to store pairs
    matches = {}

    #while unpaired isn't empty
    while unpaired:
        #pop one person as proposer
        proposer = unpaired.pop(0)
        proposer_pref = groups[proposer]

        #for each person in proposer's friends
        for preferred in proposer_pref:
            #if preferred has not already been proposed to by proposer
            if preferred not in proposals[proposer]:
                #record that preferred as been proposed to
                proposals[proposer].append(preferred)

                #skip to next preferred person if proposer is not in preferred's list
                if proposer not in groups[preferred]:

                    continue

                #if preferred has not been matched, match proposer with preferred and stop looking for next preferred person
                elif preferred not in matches:
                    #remove preferred from unpaired so they don't look for someone to pair with
                    unpaired.remove(preferred)
                    matches[preferred] = proposer
                    matches[proposer] = preferred
                    break

                else:
                    #find person preferred is matched with
                    current_match = matches[preferred]
                    # if current match is worse than proposer
                    if groups[preferred].index(proposer) < groups[preferred].index(current_match):

                        #add preferred and proposer as a pair
                        matches[preferred] = proposer
                        matches[proposer] = preferred
                        #kick person preferred was matched with out of matched
                        if current_match in matches.keys():
                            del matches[current_match]
                        #add formerly matched person to unpaired
                        unpaired.append(current_match)
                        break
    #remove duplicates by ordering the keys and values where key is less than value, so any duplicates are easily detected and removed
    final_matches = {key:val for key, val in matches.items() if key < val}
    return final_matches


def main(filename):
    group_pairs = []

    youth, elderly, y_group, e_group = sort(filename)

    youth_ranked, y_interest_match = score(youth, elderly)
    elderly_ranked, e_interest_match = score(elderly, youth)

    paired = pairing(youth_ranked, elderly_ranked)

    print(paired)

    group = groups(y_group, e_group, paired, e_interest_match)

    group_ranked = group_score(group)

    pair_group = group_pairing(group_ranked)

    for key, val in pair_group.items():
        one_group = (key, paired[key], val, paired[val])
        group_pairs.append(one_group)
    
    print(group_pairs)


main("bridges.csv")
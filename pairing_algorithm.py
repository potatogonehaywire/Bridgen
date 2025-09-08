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
    interests = []

    if is_youth:
        for t_hobby in person.Yteach:
            if t_hobby in teacher.Elearn:
                points += 1
                interests.append(t_hobby)
        
        for l_hobby in person.Ylearn:
            if l_hobby in teacher.Eteach:
                points += 1
                interests.append(l_hobby)

        if tutor:
            if isinstance(teacher.Esubject, list):
                for subject in person.Ysubject:
                    if subject in teacher.Esubject:
                        points += 1
                        interests.append(subject)
        return points
    
    else:
        for t_hobby in person.Eteach:
            if t_hobby in teacher.Ylearn:
                points += 1
                interests.append(t_hobby)

        for l_hobby in person.Elearn:
            if l_hobby in teacher.Yteach:
                points += 1
                interests.append(l_hobby)

        if tutor:
            if isinstance(teacher.Ysubject, list):
                for subject in person.Esubject:
                    if subject in teacher.Ysubject:
                        points += 1
                        interests.append(subject)
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
                    teachers_scored[teacher.Name], matching_interests[teacher.Name] = similarities(person, teacher, True, True)
                else:
                    teachers_scored[teacher.Name], matching_interests[teacher.Name] = similarities(person, teacher, True, False)
            else:
                if person.Etutor == "Yes":
                    teachers_scored[teacher.Name], matching_interests[teacher.Name] = similarities(person, teacher, False, True)
                else:
                    teachers_scored[teacher.Name], matching_interests[teacher.Name] = similarities(person, teacher, True, False)
        
        all_scored[person.Name] = teachers_scored
        all_match_interests[person.Name] = matching_interests
        print(all_match_interests)
    return all_scored

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


def groups(y_group, e_group, paired):
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

    # for elder in paired.vals():
    #     #if an interest matches, add interest to MatchingInterests
    #     for skill in groups.loc[elder, "El"]:
    #         if skill in data_paired.loc[person,"FInterests"]:
    #             data_paired.loc[person, "MatchingInterests"] += interest
    #             data_paired.loc[person, "MatchingInterests"] += ", "
        
    #     #if both language sections are lists
    #     if isinstance(data_paired.loc[person, "Language"], list) and \
    #         isinstance(data_paired.loc[person, "FLanguage"], list): 

    #         #if a language matches, add language to MatchingLanguage  
    #         for language in data_paired.loc[person, "Language"]:
    #             if language in data_paired.loc[person,"FLanguage"]:
    #                 data_paired.loc[person, "MatchingLanguage"] += language
    #                 data_paired.loc[person, "MatchingLanguage"] += ", "

    groups.to_excel("groups.xlsx")



def main(filename):

    youth, elderly, y_group, e_group = sort(filename)

    youth_scored = score(youth, elderly)
    elderly_scored = score(elderly, youth)

    youth_ranked = rank(youth_scored)
    elderly_ranked = rank(elderly_scored)

    paired = pairing(youth_ranked, elderly_ranked)

    groups(y_group, e_group, paired)

main("bridges.csv")



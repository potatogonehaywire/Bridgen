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

    return youth, elderly


def similarities (person, teacher, is_youth, tutor):
    points = 0

    if is_youth:
        for t_hobby in person.Yteach:
            if t_hobby in teacher.Elearn:
                points += 1
        if tutor:
            if isinstance(teacher.Esubject, list):
                for subject in person.Ysubject:
                    if subject in teacher.Esubject:
                        points += 1
        return points
    
    else:
        for t_hobby in person.Eteach:
            if t_hobby in teacher.Ylearn:
                points += 1
        if tutor:
            if isinstance(teacher.Ysubject, list):
                for subject in person.Esubject:
                    if subject in teacher.Ysubject:
                        points += 1
        return points


def score(age1, age2):

    all_scored = {}

    for person in age1.itertuples():

        teachers_scored = {}

        for teacher in age2.itertuples():
            if person.Age == "Youth":
                if person.Ytutor == "Yes":
                    teachers_scored[teacher.Name] = similarities(person, teacher, True, True)
                else:
                    teachers_scored[teacher.Name] = similarities(person, teacher, True, False)
            else:
                if person.Etutor == "Yes":
                    teachers_scored[teacher.Name] = similarities(person, teacher, False, True)
                else:
                    teachers_scored[teacher.Name] = similarities(person, teacher, True, False)
        
        all_scored[person.Name] = teachers_scored
    
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


    while len(youth_free) > 0:
        youth = youth_free.pop(0)

        for elder in all_youth[youth]:
            if elder in elderly_free:
                pairs[youth] = elder
                elderly_free.remove(elder)
                break
            else:
                for current_match, val in pairs.items():
                    if val == elder:
                        if all_elderly[elder].index(youth) < all_elderly[elder].index(current_match):
                            pairs[youth] = elder
                            del pairs[current_match]
                            youth_free.append(current_match)
                            break
                        break
    
    return pairs
                        

            


        

def main(filename):

    youth, elderly = sort(filename)

    youth_scored = score(youth, elderly)
    elderly_scored = score(elderly, youth)

    youth_ranked = rank(youth_scored)
    elderly_ranked = rank(elderly_scored)

    paired = pairing(youth_ranked, elderly_ranked)

    print(paired)



main("bridges.csv")



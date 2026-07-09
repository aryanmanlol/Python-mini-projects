name = input("Enter Your Name: ")
print("Welcome", name, "to this adventure")

answer = input("You are on a dirtt road, it has come to an end you can go left or right.Which way would you go?").lower()

if answer == "left":
    answer = input("You come to a river , you can walk around it or swim across").lower()

    if answer == "swim":
        print("You swam across and were eaten by alligator.")
    elif answer == "walk":
        print("You walked for many miles, ran ot of water and you lost the game")
    else:
        print("Enter a valid option")



elif answer == "right":
    answer = input(
        "You come to a bridge, it looks wobbly. Do you want to cross it or head back? "
    ).lower()

    if answer == "back":
        print("You go back and lose.")

    elif answer == "walk":
        answer = input(
            "You cross the bridge and meet a stranger. Do you talk to them? (yes/no) "
        ).lower()

        if answer == "yes":
            print("You talk to the stranger and they give you gold. You WIN!")

        elif answer == "no":
            print("You ignore the stranger and they are offended. You lose.")

        else:
            print("Enter a valid option.")

    else:
        print("Enter a valid option.")
        


        

       
else:
    print("ENTER A VALID OPTION!")


print("Thank you for trying ", name)
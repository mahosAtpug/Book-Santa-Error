import React from "react";
import RecieverDetailsScreen from "../screens/recieverDetailsScreens"
import {createStackNavigator} from "react-navigation-stack"
import BookDonateScreen from "../screens/bookDonateScreen"

export const AppStackNavigator = createStackNavigator({
    BookDonateList:{
        screen:BookDonateScreen,
        navigationOptions:{
            headerShown:false
        }
    },

    RecieverDetails:{
        screen:RecieverDetailsScreen,
        navigationOptions:{
            headerShown:false
        }
    }
},

{
 initialRouteName:"BookDonateList"

}

)
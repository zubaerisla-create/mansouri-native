import { MyCustomTabBar } from "@/src/components/Tabbar/Tabbar";
import { Tabs } from "expo-router";
import React, { Component } from "react";

export default class _layout extends Component {
  render() {
    return (
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <MyCustomTabBar {...props} />}
      >
        <Tabs.Screen
          name="home"
          options={{ headerShown: false }}
        ></Tabs.Screen>
        <Tabs.Screen name="Orders" options={{ title: "Orders" }}></Tabs.Screen>
        <Tabs.Screen
          name="Favorite"
          options={{ title: "Favorites" }}
        ></Tabs.Screen>
        <Tabs.Screen name="More" options={{ title: "More" }}></Tabs.Screen>
      </Tabs>
    );
  }
}

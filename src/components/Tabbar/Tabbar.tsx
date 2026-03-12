import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable, Text } from '@react-navigation/elements';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MyCustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const insets = useSafeAreaInsets();

  // Define icons for each tab
  const icons: Record<string, (props: any) => JSX.Element> = {
    home: (props) => <Feather name="home" size={24} {...props} />,
    order: (props) => <Feather name="shopping-cart" size={24} {...props} />,
    favourite: (props) => <Feather name="heart" size={24} {...props} />,
    more: (props) => <Feather name="menu" size={24} {...props} />,
  };

  // Define the exact order of tabs we want: Home → Order → Favourite → More
  const tabOrder = ['home', 'order', 'favourite', 'more'];

  // Filter and sort routes based on our defined order
  const orderedRoutes = state.routes.sort((a, b) => {
    const aIndex = tabOrder.indexOf(a.name.toLowerCase());
    const bIndex = tabOrder.indexOf(b.name.toLowerCase());
    return aIndex - bIndex;
  });

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: insets.bottom || 10 },
      ]}
    >
      {orderedRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconColor = isFocused ? '#FF5101' : colors.text + '80';
        const labelColor = isFocused ? '#FF5101' : colors.text;

        // route.name কে lowercase করে icon খুঁজবো
        const routeNameLower = route.name.toLowerCase();

        // Icon খোঁজার আগে কিছু common variations check করা
        let iconToRender = icons[routeNameLower];
        
        // যদি সরাসরি না মেলে, তাহলে alternative variations check করা
        if (!iconToRender) {
          if (routeNameLower.includes('favor') || routeNameLower.includes('favour')) {
            iconToRender = icons.favourite;
          } else if (routeNameLower.includes('order')) {
            iconToRender = icons.order;
          }
        }

        // Render label content
        const renderLabelContent = () => {
          if (typeof label === 'string') {
            return <Text style={[styles.label, { color: labelColor }]}>{label}</Text>;
          } else if (typeof label === 'function') {
            return label({
              focused: isFocused,
              color: labelColor,
              position: 'below-icon',
              children: route.name,
            });
          }
          return null;
        };

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            {iconToRender?.({ color: iconColor }) || (
              // Fallback — যদি icon না পায় তাহলে এটা দেখাবে
              <Feather name="circle" size={24} color={iconColor} />
            )}
            {renderLabelContent()}
          </PlatformPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee5e5',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    cursor: 'pointer',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});
import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';

interface AppTextProps extends TextProps {
  bold?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({ style, bold, ...props }) => {
  const { currentFont, currentFontBold } = useTranslation();

  const fontFamily = bold ? currentFontBold : currentFont;

  return (
    <RNText
      {...props}
      style={[
        style,
        fontFamily ? { fontFamily } : undefined,
      ]}
    />
  );
};

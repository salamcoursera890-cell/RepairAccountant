import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW, ThemeColors } from '../constants';

export interface AppTheme {
  colors: ThemeColors;
  spacing: typeof SPACING;
  borderRadius: typeof BORDER_RADIUS;
  fontSize: typeof FONT_SIZE;
  shadow: typeof SHADOW;
  isDark: boolean;
}

export const lightTheme: AppTheme = {
  colors: COLORS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  fontSize: FONT_SIZE,
  shadow: SHADOW,
  isDark: false,
};

export const darkTheme: AppTheme = {
  colors: DARK_COLORS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  fontSize: FONT_SIZE,
  shadow: SHADOW,
  isDark: true,
};

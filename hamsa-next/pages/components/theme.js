import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#726E97',
      light: '#806EA1',
      lighter: '#8E7EAB',
      dark: '#665487',
      darker: '#5B4B78'
    },
    secondary: {
      main: '#009FB7',
    },
    error: {
      main: "#A5243D"  // Vivid Burgundy
    },
    background: {
      default: "#FDFFFC", // Baby Powder
    },
  },
});

export default theme;
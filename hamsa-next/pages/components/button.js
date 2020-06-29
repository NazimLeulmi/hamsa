import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
  btn: {
    width: '90%',
    height: 56,
    marginTop: 10,
    background: [theme.palette.primary.lighter],
    color: [theme.palette.background.default],
    fontSize: 18
  },
}));

export default ({ children, variant }) => {
  const classes = useStyles();
  return <Button children={children} variant={variant} className={classes.btn} />
}



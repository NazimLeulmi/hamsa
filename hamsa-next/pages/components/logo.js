import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  img: {
    width: 128,
    height: 128,
    background: [theme.palette.primary.lighter],
    borderRadius: '50%',
    margin: 15
  },
}));

export default () => {
  const classes = useStyles();
  return <img src="/whisper.png" alt="LOGO" className={classes.img} />
}


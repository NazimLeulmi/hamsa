import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles(theme => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100vh',
    paddingTop: 15
  }
}));

export default ({ children }) => {
  const classes = useStyles();
  return (
    <form className={classes.form} noValidate autoComplete="off">
      {children}
    </form>
  )
}





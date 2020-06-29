import { makeStyles } from '@material-ui/core/styles';
import { Snackbar, Typography } from '@material-ui/core';


const useStyles = makeStyles(theme => ({

}));

export default ({ open, isError, text }) => {
  const classes = useStyles();
  return (
    <Snackbar open={open} autoHideDuration={4500}>
      <Typography variant="button" component="p" color="primary">{text}</Typography>
    </Snackbar>
  )
}


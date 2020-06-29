import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  input: {
    width: '90%',
    height: 56,
    marginTop: 10
  },
}));

export default ({ type, name, label, placeholder, value, onChange }) => {
  const classes = useStyles();
  return (
    <TextField
      variant='filled' className={classes.input}
      type={type} name={name} label={label}
      placeholder={placeholder} value={value} onChange={onChange}
    />)
}

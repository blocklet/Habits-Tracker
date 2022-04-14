import React, { useEffect } from 'react';
import joinUrl from 'url-join';
// eslint-disable-next-line import/no-duplicates
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import { Grid } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import SessionManager from '@arcblock/did-connect/lib/SessionManager';
import DidConnect from '@arcblock/did-connect/lib/Connect';
import axios from 'axios';
import api from '../libs/api';
import { useSessionContext } from '../contexts/session';

const drawerWidth = 240;

// eslint-disable-next-line no-shadow
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  title2: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  desc: {
    display: 'flex',
    alignItems: 'center',
  },
  atv: {
    marginTop: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '100px',
  },
  right: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
  name: {
    marginLeft: '20px',
    display: 'flex',
  },
  rightPrice: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

// const Auth = require('@blocklet/sdk/service/auth');
// const client = new Auth();

export default function PermanentDrawerLeft() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({});
  const [dataList, setList] = React.useState([]);
  const [tab, setTab] = React.useState(0);
  const { session } = useSessionContext();
  const onLogout = () => window.location.reload();
  const [openConnect, setOpenConnect] = React.useState(false);
  const [price, setPrice] = React.useState(0);
  const [payType, setPayType] = React.useState(0); // 0 是新增 1 是报名
  const [currentItem, setCurrentItem] = React.useState({});

  const reloadData = async () => {
    const apiPath = tab === 0 ? '/api/lists?page=1&pageSize=20' : '/api/myLists?page=1&pageSize=20';
    const { data } = await api.get(apiPath);
    const { docs } = data;
    const totalPrice = 222;
    const { user } = session;
    const list = docs.map((e) => {
      // 判断是否已报名
      const isParticipant = e.participant.findIndex((i) => i.did === user.did) > -1;
      const hasRecord = isParticipant
        ? e.participant
            .find((i) => i.did === user.did)
            // eslint-disable-next-line eqeqeq
            .records.find((i) => new Date(i).toDateString() == new Date().toDateString())
        : false;
      return {
        ...e,
        isParticipant,
        hasRecord,
        did: user.did,
        totalPrice,
      };
    });
    setList(list);
    return docs;
  };

  const onTabClick = (index) => {
    setTab(index);
  };

  useEffect(() => {
    reloadData();
  }, [tab]);

  const add = () => {
    setOpen(true);
  };
  const save = () => {
    setPrice(form.price);
    setPayType(0);
    setOpenConnect(true);
  };

  // 交过钱可以保存
  const confirmSave = () => {
    form.avatar = session.user.avatar;
    api
      .post(joinUrl('/api/save'), form)
      .then(() => {
        setOpen(false);
        reloadData();
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e);
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onApply = (e) => {
    setPrice(e.unitPrice);
    setPayType(1);
    setCurrentItem(e);
    setOpenConnect(true);
  };

  const onApplyConfirm = () => {
    api
      .post(joinUrl('/api/apply'), { id: currentItem._id })
      .then(() => {
        alert('success');
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e);
      });
  };

  const onAddRecord = (id) => {
    api
      .post(joinUrl('/api/addRecord'), { id })
      .then(() => {
        alert('success');
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e);
      });
  };

  const handleCloseSend = () => {
    setOpenConnect(false);
  };

  const handlePaySuccess = () => {
    setOpenConnect(false);
    if (payType === 0) {
      confirmSave();
    } else {
      onApplyConfirm();
    }
  };

  const renderButton = (i) => {
    if (tab === 0) {
      return (
        <>
          {' '}
          {i.isParticipant ? (
            <div> 已报名 </div>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onApply(i);
              }}>
              报名{' '}
            </Button>
          )}{' '}
        </>
      );
    }

    return (
      <>
        {' '}
        {i.hasRecord ? (
          <div> 今日已打卡 </div>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              onAddRecord(i._id);
            }}>
            打卡{' '}
          </Button>
        )}{' '}
      </>
    );
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">新增</DialogTitle>
        <DialogContent>
          <TextField
            onChange={(e) => {
              setForm({
                ...form,
                title: e.target.value,
              });
            }}
            autoFocus
            margin="dense"
            id="title"
            label="标题"
            type="text"
            fullWidth
          />
          <TextField
            onChange={(e) => {
              setForm({
                ...form,
                price: e.target.value,
              });
            }}
            autoFocus
            margin="dense"
            id="price"
            label="金额"
            type="number"
            fullWidth
          />
          <TextField
            id="startTime"
            label="开始时间"
            type="date"
            defaultValue={new Date()}
            onChange={(e) => {
              setForm({
                ...form,
                startTime: e.target.value,
              });
            }}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            id="endTime"
            label="结束时间"
            type="date"
            defaultValue={new Date()}
            fullWidth
            onChange={(e) => {
              setForm({
                ...form,
                endTime: e.target.value,
              });
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            取消
          </Button>
          <Button onClick={save} color="primary">
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar>
          <Button variant="contained" color="primary" onClick={() => add()}>
            新增
          </Button>
          <Typography variant="h6" noWrap className={classes.title}>
            Activitys
          </Typography>
          <SessionManager session={session} onLogout={onLogout} />
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left">
        <div className={classes.toolbar} />
        <Divider />
        <List>
          {['Home', 'Mine'].map((text, index) => (
            <ListItem
              button
              key={text}
              onClick={() => onTabClick(index)}
              style={{ background: tab === index ? '#ddd' : '#fff' }}>
              <ListItemIcon> </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Grid container spacing={3}>
          {dataList.map((i) => (
            <Grid item xs={6}>
              <Paper className={classes.paper}>
                <div className={classes.title2}>
                  {i.title}
                  <div className={classes.price}>{i.unitPrice}</div>
                </div>
                <div className={classes.desc}>
                  <img className={classes.atv} alt="no avatar" src={i.author.avatar} />
                  <div className={classes.right}>
                    <div className={classes.name}>{i.author.name}</div>
                    <div className={classes.name}>
                      {i.author.did} <span />
                    </div>
                  </div>
                  {renderButton(i)}
                </div>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <DidConnect
          popup
          open={openConnect}
          action="payToApply"
          extraParams={{ amount: price }}
          checkFn={axios.get}
          onClose={() => handleCloseSend()}
          onSuccess={() => handlePaySuccess()}
          messages={{
            title: 'login',
            scan: 'Scan QR code with DID Wallet',
            confirm: 'Confirm Send Prize',
            success: 'You have successfully send prize!',
          }}
          cancelWhenScanned={() => {}}
        />
      </main>
    </div>
  );
}

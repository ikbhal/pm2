const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const { exec } = require('child_process');
const PORT = 3021;

const app = express();

app.set('view engine', 'ejs'); // Set the view engine to EJS

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'muhammed',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

// Set up a basic route
app.get('/', (req, res) => {
  res.render('index', { message: req.flash('message'), output: req.flash('output') });
});

// Route to handle PM2 commands
app.post('/pm2-command', (req, res) => {
  const preselect = req.body.preselect;
  const additionalCommand = req.body.additionalCommand;
  const appName = req.body.appName;
  const scriptPath = req.body.scriptPath;

  // Construct the PM2 command
  let pm2Command = '';

  switch (preselect) {
    case 'list':
      pm2Command = 'pm2 list';
      break;
    case 'start':
        if (scriptPath) {
          pm2Command = `pm2 start ${scriptPath} --name=${appName} ${additionalCommand}`;
        } else {
          pm2Command = `pm2 start ${appName} ${additionalCommand}`;
        }
        break;
    case 'logs':
      pm2Command = `pm2 logs ${appName}`;
      break;
    case 'stop':
      pm2Command = `pm2 stop ${appName}`;
      break;
    default:
      // Handle custom PM2 commands here
      break;
  }

  // Execute the PM2 command with sudo
  exec(`sudo ${pm2Command}`, (error, stdout, stderr) => {
    if (error) {
      req.flash('message', 'Error: ' + error.message);
    } else {
      req.flash('message', 'Command executed successfully.');
      req.flash('output', stdout);
    }
    res.redirect('/');
  });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

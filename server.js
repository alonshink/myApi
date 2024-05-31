const express = require('express');
const app = express();
//to make cursor visible without 'Not allowed to load local resource'
app.use(express.static('public'));

const port = 7000
app.set('view-engine','ejs')

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

const db = require('./models');
const { user } = require('./models');

db.sequelize.sync().then((data)=> {
  app.listen(port, () => console.log(`listening at  http://localhost:${port}`));
})   


// routes

// Define route for the login page
app.get('/', (req, res) => {
  res.render('login2.ejs');
});

// Define route for the quiz page
app.get('/quizz', (req, res, ) => {
  const username = req.query.username;
  // Render the quiz page with the user's name
  res.render('quizz.ejs', {username: username});
});

// Handle form submission
app.post('/login2', (req, res) => {
  const newUser = req.body;
  const {username} = newUser;
   user.findOne({where: {username}}).then((result)=>{
    if (!result){
      user.create(newUser).catch(err =>  (err) ? console.log(err) : '' );
   };
  })
  // Redirect to the quiz page
  res.redirect(`/quizz?username=${encodeURIComponent(username)}`);
});
//delete all users
app.post('/allusers/delete', (req, res) => {
  console.log('Deleting all users');
  user.destroy({ where: {} })
    .then(numDeleted => {
      console.log(`Deleted ${numDeleted} users`);
      res.redirect('/quizz_results');
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
});





//delete user name
app.post('/delete/username', (req, res) => {
  const { username } = req.body;

  user.findOne({ where: { username } })
    .then((result) => {
      if (!result) {
        console.log(`User with username ${username} not found.`);
        return res.status(404).send(`User with username ${username} not found.`);
      } else {
        return user.destroy({ where: { username } });
      }
    })
    .then((numDeleted) => {
      if (numDeleted === 0) {
        console.log(`User with username ${username} not found.`);
        return res.status(404).send(`User with username ${username} not found.`);
      } else {
        console.log(`Deleted user with username ${username}`);
        return res.redirect('/quizz_results');
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    });
});


//update username
app.post('/update/username', (req, res) => {
  const { username, newUsername } = req.body;
  user.findOne({ where: { username } })
    .then((foundUser) => {
      if (!foundUser) {
        console.log(`User with username ${username} not found.`);
        return res.status(404).send(`User with username ${username} not found.`);
      } else {
        // Update the username
        foundUser.username = newUsername || foundUser.username;

        // Save the updated user to the database
        return foundUser.save();
      }
    })
    .then((updatedUser) => {
      console.log(`Updated user with username ${username}`);
      return res.redirect('/quizz_results');
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    });
});


//update grade
app.post('/update/grade', (req, res) => {
  const { username, newGrade } = req.body;
  user.findOne({ where: { username } })
    .then((foundUser) => {
      if (!foundUser) {
        console.log(`User with username ${username} not found.`);
        return res.status(404).send(`User with username ${username} not found.`);
      } else {
        // Update the grade
        foundUser.grade = newGrade || foundUser.grade;

        // Save the updated user to the database
        return foundUser.save();
      }
    })
    .then((updatedUser) => {
      console.log(`Updated grade for user with username ${username}`);
      return res.redirect('/quizz_results');
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    });
});


//create new user
app.post('/createnewUser/create',(req,res)=>{
  res.redirect('/')
})

// handle quizz finish
app.post('/quizz_results', (req, res) => {
  const {username, grade} = req.body
  try {
    user.findOne({where: {username}}).then((user)=>{
      if (user){
        user.grade = parseInt(grade);
        user.save().then(()=>{
          res.redirect('/quizz_results')
        })
      }
    })
   
  } catch(error) {
    console.log(error)
  }

})

app.get('/quizz_results', (req, res) => {
  user.findAll().then(
    users => res.render('quizz_results.ejs',{users})
  )
});
import bcrypt from 'bcrypt';

const password = 'admin123';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
  } else {
    console.log('Password:', password);
    console.log('Hash:', hash);
  }
});
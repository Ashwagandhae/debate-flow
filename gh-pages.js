var ghpages = require('gh-pages');

ghpages.publish(
  'public', // path to public directory
  {
    branch: 'gh-pages',
    repo: 'https://github.com/Ashwagandhae/debate-flow.git', // Update to point to your repository
    user: {
      name: 'Ashwagandhae', // update to use your name
      email: 'julianlianbauer@gmail.com', // Update to use your email
    },
    dotfiles: true,
  },
  () => {
    console.log('Deploy Complete!');
  }
);

// https://github.com/firebase/functions-samples/issues/170#issuecomment-323375462

const cols = ['posts', 'categories', 'likes', 'users', 'following'];

const FUNC = process.env.FUNCTION_NAME;
cols.forEach(col => {
    if (!FUNC || FUNC === col) {
        exports[col] = require('./' + col);
    }
});

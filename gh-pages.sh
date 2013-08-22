TMP=/tmp/gh-pages
CURR_BRANCH=$(git branch | grep "*" | cut -c3-)
rm -rf "${TMP}"
mkdir "${TMP}"
cp -r docs/* "${TMP}"
git checkout gh-pages
rm -rf *
cp -r "${TMP}" .
git commit -a -m "gh-pages: Duplicate master docs tree"
git checkout gh-pages
git checkout "${CURR_BRANCH}"

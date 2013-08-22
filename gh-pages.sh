#!/bin/sh
#===================================================================
# File       : gh-pages.sh
# Description: Copy Git docs/ tree from master project to gh-pages
# Author     : Karl Bishop <kfbishop@us.ibm.com>
#===================================================================
# 130822:KB: Initial version
#===================================================================

PROG=$(basename $0)
TMP=/tmp/gh-pages
CURR_BRANCH=$(git branch | grep "*" | cut -c3-)

echo "====================================================="
echo "$PROG: Starting: $(date)"
echo "====================================================="
echo "Current branch : ${CURR_BRANCH}" 
echo "====================================================="

echo ">>> Stashing off any current dirty changes in this branch"
git stash

echo "-----------------------------------------------------"
echo ">>> Cleaning tmp dir: ${TMP}"
rm -rf "${TMP}"
mkdir "${TMP}"

echo ">>> Saving off current 'docs' tree to tmp"
cp -r docs/* "${TMP}"


echo "-----------------------------------------------------"
echo ">>> Checking out 'gh-pages' branch"
git checkout gh-pages

echo ">>> Clearing out existing files"
rm -rf *

echo ">>> Copying in docs tree"
cp -r "${TMP}" .

echo "-----------------------------------------------------"
echo ">>> Committing changes to gh-pages branch"
git commit -a -m "gh-pages: Duplicate master docs tree"

echo "-----------------------------------------------------"
echo ">>> Checking out original branch: ${CURR_BRANCH}"
git checkout "${CURR_BRANCH}"

echo "-----------------------------------------------------"
echo ">>> Restoring any dirty stash entries"
git apply -R

echo "====================================================="
echo "Finished"
echo "====================================================="

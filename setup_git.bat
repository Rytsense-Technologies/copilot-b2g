@echo off
git init
git remote add origin "https://github.com/Rytsense-Technologies/copilot-b2g.git"
git remote -v
git checkout -b srivishwa_dev
git add .
git commit -m "Initial commit"
git push -u origin srivishwa_dev

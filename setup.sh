#!/usr/bin/env bash

curl -sSL http://getineo.cohesivestack.com | bash -s install
source ~/.bashrc

ineo create -p 7400 -v 3.1.1 storyboard-test

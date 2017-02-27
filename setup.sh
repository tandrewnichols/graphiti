#!/usr/bin/env bash

curl -sSL http://getineo.cohesivestack.com | bash -s install
export PATH=$HOME/.ineo/bin:$PATH

ineo create -p 7400 -v 3.1.1 storyboard-test

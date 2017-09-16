#!/usr/bin/env bash

curl -sSL https://raw.githubusercontent.com/tandrewnichols/ineo/master/ineo | bash -s install
# export PATH=$HOME/.ineo/bin:$PATH
ineo create -p 7400 -v 3.1.1 graphiti-test

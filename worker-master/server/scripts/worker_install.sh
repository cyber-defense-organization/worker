#!/bin/bash
PWD=$(pwd)
for i in {1..10}
do
   git clone --single-branch --branch develop https://github.com/cyber-defense-organization/worker worker$i
   cd worker$i/worker-master/server/ && npm install
   cd PWD
done
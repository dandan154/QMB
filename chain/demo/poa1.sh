#!/bin/bash

mkdir ./datadir/keystore -p          #Create keystore
cp ../accs/* ./datadir/keystore -rf   #Add accounts to keystore

geth --datadir="./datadir" init demo.json
geth --datadir="./datadir" --unlock="0x61a1d66da840f1982dff9aba9407a0b708a9d6fe" --networkid=8888 --password=./pass.txt --port 30307 --bootnodes="enode://8e19b25b51af63774d4bf8d5bee6b80614c81e9514a3aef97bf7236c76ea599ce8a365536520f3f87b7f08be3ab9df86367697e5141f70a1d8417052ea3b7e43@[::]:30306" --rpc --rpccorsdomain="*" --rpcport 7000 --rpcaddr="127.0.0.1" --rpcapi="db,eth,net,web3,personal" --mine --verbosity=4

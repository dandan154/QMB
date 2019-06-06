#!/bin/bash

mkdir ./datadir/keystore -p          #Create keystore
cp ../accs/* ./datadir/keystore -rf   #Add accounts to keystore

geth --datadir="./datadir" init demo.json
geth --datadir="./datadir" --unlock="0xcbf1f5b532ece0724c8dcbddcfffe7f5afb41ccd" --networkid=8888 --password=./pass.txt --port 30308 --bootnodes="enode://8e19b25b51af63774d4bf8d5bee6b80614c81e9514a3aef97bf7236c76ea599ce8a365536520f3f87b7f08be3ab9df86367697e5141f70a1d8417052ea3b7e43@134.36.36.254:30306" --rpc --rpccorsdomain="*" --rpcport 7001 --rpcaddr="127.0.0.1" --rpcapi="db,eth,net,web3,personal" --mine --verbosity=4

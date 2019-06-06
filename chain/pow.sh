#!/bin/bash
#NOTE: Ensure that no other geth implementers (such as mist or eth wallet are using the default geth port)

mkdir ./qmbDataDir/keystore -p          #Create keystore
cp ./accs/* ./qmbDataDir/keystore -rf   #Add accounts to keystore

gnome-terminal --tab --command="bash -c 'geth --datadir="./qmbDataDir" init ./genesis.json; geth --datadir="./qmbDataDir" --networkid=9999 --rpc --rpccorsdomain="*" --rpcapi="db,eth,net,web3,personal"; $SHELL'"
sleep 5s
geth attach ./qmbDataDir/geth.ipc #Open Javascript API

rm ./poaDataDir -rf
